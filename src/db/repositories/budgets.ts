import { useSQLiteContext } from 'expo-sqlite';
import { z } from 'zod';

import { ORM, useORM } from '@/src/orm';
import { withExclusiveTransaction } from '@/src/db/transaction';
import { useConfigs } from '@/src/hooks/useConfigs';
import type {
  BudgetLine,
  BudgetLineView,
  BudgetPlan,
  BudgetTemplate,
  BudgetTemplateItem,
  BudgetTemplateItemWithRelations,
  Category,
  FixedRecord,
  Insertable,
  RecordType,
  RecordView,
} from '@/src/interfaces/schema';
import {
  budgetLineInputSchema,
  budgetLineUpdateSchema,
  budgetPlanInputSchema,
  budgetPlanUpdateSchema,
  budgetTemplateInputSchema,
  budgetTemplateItemInputSchema,
  budgetTemplateItemUpdateSchema,
  budgetTemplateUpdateSchema,
} from '@/src/validation/entities';
import { averageBudgetTotals } from '@/src/domain/budgets/average';
import { calculateBudgetPlanView } from '@/src/domain/budgets/comparison';
import type {
  BudgetApplyMode,
  BudgetLineScope,
  BudgetPlanView,
  BudgetTemplateItemView,
  BudgetTemplateView,
} from '@/src/domain/budgets/types';

export type BudgetLineInput = z.infer<typeof budgetLineInputSchema>;
export type BudgetPlanInput = z.infer<typeof budgetPlanInputSchema>;
export type BudgetTemplateInput = z.infer<typeof budgetTemplateInputSchema>;
export type BudgetTemplateItemInput = z.infer<typeof budgetTemplateItemInputSchema>;

const effectOf = (
  type?: Pick<RecordType, 'effect'> | null
): '+' | '-' | '=' | null =>
  type?.effect === '+' || type?.effect === '-' || type?.effect === '='
    ? type.effect
    : null;

const saleOf = (value: string | null | undefined): BudgetLineScope =>
  value === 'fixed' ? 'fixed' : 'category';

const budgetableTypeIds = (
  recordTypes: RecordType[],
  excludedRecordTypeIds: number[]
) => {
  const excluded = new Set(excludedRecordTypeIds);
  return new Set(
    recordTypes.flatMap((type) =>
      type.id !== undefined &&
      !excluded.has(type.id) &&
      (type.effect === '+' || type.effect === '-')
        ? [type.id]
        : []
    )
  );
};

const flattenLineView = (
  line: BudgetLineView,
  categoryName?: string | null,
  typeName?: string | null,
  fixedName?: string | null
): BudgetLineView => ({
  ...line,
  category_name: categoryName ?? line.Categories?.category_name ?? null,
  type_name: typeName ?? line.RecordTypes?.type_name ?? null,
  effect: effectOf(line.RecordTypes),
  record_color: line.RecordTypes?.record_color ?? null,
  fixed_name: fixedName ?? line.Fixed?.fixed_name ?? null,
  fixed_day: line.Fixed?.fixed_day ?? null,
});

export const useBudgetPlansRepository = () => {
  const db = useSQLiteContext();
  const plansOrm = useORM('BudgetPlans');
  const linesOrm = useORM('BudgetLines');
  const templatesOrm = useORM('BudgetTemplates');
  const templateItemsOrm = useORM('BudgetTemplateItems');
  const groupsOrm = useORM('Groups');
  const recordsOrm = useORM('Records');
  const fixedsOrm = useORM('Fixed');
  const categoriesOrm = useORM('Categories');
  const recordTypesOrm = useORM('RecordTypes');

  const excludedRecordTypeIds = (recordTypes: RecordType[] = []) => {
    const paymentCreditType = useConfigs.getState().configs.paymentCreditType;
    const byName = recordTypes
      .filter(
        (type) =>
          type.id !== undefined &&
          (type.type_name ?? '').toLowerCase() === 'payments'
      )
      .map((type) => type.id as number);
    return [...new Set([paymentCreditType, ...byName].filter((id) => id > 0))];
  };

  const fetchPlan = async (groupId: number): Promise<BudgetPlan | null> =>
    (await plansOrm.where('group_id', groupId).first()) as BudgetPlan | null;

  const fetchPlanById = async (planId: number): Promise<BudgetPlan | null> =>
    (await plansOrm.getById(planId)) as BudgetPlan | null;

  const createPlan = async (
    groupId: number,
    templateId?: number | null
  ): Promise<number> => {
    const existing = await fetchPlan(groupId);
    if (existing?.id) return existing.id;

    const group = await groupsOrm.getById(groupId);
    if (!group) throw new Error(`Group ${groupId} does not exist`);

    const payload = budgetPlanInputSchema.parse({
      group_id: groupId,
      template_id: templateId ?? null,
      plan_name: group.group_name || `${group.month}/${group.year}`,
      alert_threshold_percent: 80,
    });

    return plansOrm.insert(payload as Insertable<BudgetPlan>);
  };

  const updatePlan = async (planId: number, patch: Partial<BudgetPlanInput>) => {
    const payload = budgetPlanUpdateSchema.parse(patch);
    await plansOrm.update(planId, payload);
  };

  const fetchPlanView = async (groupId: number): Promise<BudgetPlanView | null> => {
    const plan = await fetchPlan(groupId);
    if (!plan?.id) return null;

    const group = await groupsOrm.getById(groupId);
    if (!group) return null;

    const [lines, records, fixeds, categories, recordTypes, template] = await Promise.all([
      linesOrm.where('budget_plan_id', plan.id).getAll(),
      recordsOrm.where('group_id', groupId).getAll(),
      fixedsOrm.getAll({ includeDeleted: true }),
      categoriesOrm.getAll(),
      recordTypesOrm.getAll(),
      plan.template_id ? templatesOrm.getById(plan.template_id) : Promise.resolve(null),
    ]);

    return calculateBudgetPlanView({
      plan,
      planName: plan.plan_name || group.group_name || `${group.month}/${group.year}`,
      month: group.month,
      year: group.year,
      templateName: template?.template_name ?? null,
      lines: lines as BudgetLine[],
      records: records.map((record) => ({
        id: record.id as number,
        amount: record.amount,
        category_id: record.category_id ?? null,
        record_type_id: record.record_type_id ?? null,
        fixed_id: record.fixed_id ?? null,
      })),
      fixeds: fixeds as FixedRecord[],
      categories: categories as Pick<Category, 'id' | 'category_name'>[],
      recordTypes: recordTypes as Pick<
        RecordType,
        'id' | 'type_name' | 'effect' | 'record_color'
      >[],
      excludedRecordTypeIds: excludedRecordTypeIds(recordTypes as RecordType[]),
    });
  };

  const findMatchingLine = async (
    planId: number,
    input: Pick<
      BudgetLineInput,
      'scope' | 'category_id' | 'record_type_id' | 'fixed_id'
    >
  ) => {
    const scope = input.scope ?? 'category';
    const lines = (await linesOrm
      .where('budget_plan_id', planId)
      .getAll()) as BudgetLine[];
    return (
      lines.find((line) => {
        if (saleOf(line.scope) !== scope) return false;
        if (scope === 'fixed') return line.fixed_id === input.fixed_id;
        return (
          line.category_id === input.category_id &&
          line.record_type_id === input.record_type_id
        );
      }) ?? null
    );
  };

  const saveLine = async (
    input: BudgetLineInput & { id?: number }
  ): Promise<number> => {
    if (input.id) {
      const payload = budgetLineUpdateSchema.parse(input);
      await linesOrm.update(input.id, payload);
      return input.id;
    }

    const parsed = budgetLineInputSchema.parse(input);
    const scope = parsed.scope ?? 'category';
    let categoryId = parsed.category_id ?? null;
    let recordTypeId = parsed.record_type_id ?? null;

    if (scope === 'fixed' && parsed.fixed_id) {
      const fixed = await fixedsOrm.getById(parsed.fixed_id);
      if (!fixed) throw new Error(`Fixed ${parsed.fixed_id} does not exist`);
      categoryId = categoryId ?? fixed.category_id ?? null;
      recordTypeId = recordTypeId ?? fixed.record_type_id ?? null;
    }

    const existing = await findMatchingLine(parsed.budget_plan_id, {
      ...parsed,
      category_id: categoryId,
      record_type_id: recordTypeId,
      scope,
    });

    if (existing?.id) {
      await linesOrm.update(existing.id, {
        category_id: categoryId,
        record_type_id: recordTypeId,
        fixed_id: scope === 'fixed' ? parsed.fixed_id ?? null : null,
        planned_amount: parsed.planned_amount,
        priority: parsed.priority ?? existing.priority,
        notes: parsed.notes ?? existing.notes,
        sort_order: parsed.sort_order ?? existing.sort_order,
        source: parsed.source ?? existing.source,
        template_item_id: parsed.template_item_id ?? existing.template_item_id,
      });
      return existing.id;
    }

    return linesOrm.insert({
      ...parsed,
      category_id: categoryId,
      record_type_id: recordTypeId,
      fixed_id: scope === 'fixed' ? parsed.fixed_id ?? null : null,
      scope,
      source: parsed.source ?? 'manual',
      priority: parsed.priority ?? 2,
      sort_order: parsed.sort_order ?? 0,
    } as Insertable<BudgetLine>);
  };

  const deleteLine = async (lineId: number) => linesOrm.delete(lineId);

  const deletePlan = async (planId: number) => {
    await withExclusiveTransaction(db, async (txn) => {
      const lines = new ORM(txn, 'BudgetLines');
      const plans = new ORM(txn, 'BudgetPlans');
      await lines.deleteWhere('budget_plan_id', planId);
      await plans.delete(planId);
    });
  };

  const listGroups = async () => groupsOrm.getAll();

  const fetchTemplateItems = async (templateId: number) =>
    (await templateItemsOrm
      .where('budget_template_id', templateId)
      .getAll()) as BudgetTemplateItem[];

  const applyTemplate = async (
    planId: number,
    templateId: number,
    mode: BudgetApplyMode = 'merge'
  ) => {
    const items = await fetchTemplateItems(templateId);
    if (items.length === 0) return 0;

    return withExclusiveTransaction(db, async (txn) => {
      const plans = new ORM(txn, 'BudgetPlans');
      const lines = new ORM(txn, 'BudgetLines');
      const current = (await lines.where('budget_plan_id', planId).getAll()) as BudgetLine[];

      if (mode === 'replace') {
        await lines.deleteWhere('budget_plan_id', planId);
        for (const item of items) {
          await lines.insert({
            budget_plan_id: planId,
            category_id: item.category_id,
            record_type_id: item.record_type_id,
            fixed_id: item.fixed_id ?? null,
            scope: saleOf(item.scope),
            source: 'template',
            template_item_id: item.id ?? null,
            planned_amount: item.amount,
            priority: item.priority ?? 2,
            notes: item.notes ?? null,
            sort_order: item.sort_order ?? 0,
          });
        }
      } else {
        for (const item of items) {
          const scope = saleOf(item.scope);
          const match = current.find((line) => {
            if (saleOf(line.scope) !== scope) return false;
            if (scope === 'fixed') return line.fixed_id === item.fixed_id;
            return (
              line.category_id === item.category_id &&
              line.record_type_id === item.record_type_id
            );
          });

          if (match?.id && mode === 'merge') continue;
          if (match?.id) {
            await lines.update(match.id, {
              planned_amount: item.amount,
              priority: item.priority ?? match.priority,
              notes: item.notes ?? match.notes,
              sort_order: item.sort_order ?? match.sort_order,
              source: 'template',
              template_item_id: item.id ?? null,
            });
            continue;
          }

          await lines.insert({
            budget_plan_id: planId,
            category_id: item.category_id,
            record_type_id: item.record_type_id,
            fixed_id: item.fixed_id ?? null,
            scope,
            source: 'template',
            template_item_id: item.id ?? null,
            planned_amount: item.amount,
            priority: item.priority ?? 2,
            notes: item.notes ?? null,
            sort_order: item.sort_order ?? 0,
          });
        }
      }

      await plans.update(planId, {
        template_id: templateId,
        applied_template_at: Date.now(),
      });

      return mode === 'replace' ? items.length : 0;
    });
  };

  const saveAsTemplate = async (
    planId: number,
    name: string,
    description?: string | null
  ): Promise<number> => {
    const plan = await fetchPlanById(planId);
    if (!plan) throw new Error(`Plan ${planId} does not exist`);
    const lines = (await linesOrm.where('budget_plan_id', planId).getAll()) as BudgetLine[];

    return withExclusiveTransaction(db, async (txn) => {
      const templates = new ORM(txn, 'BudgetTemplates');
      const items = new ORM(txn, 'BudgetTemplateItems');
      const templateId = await templates.insert(
        budgetTemplateInputSchema.parse({
          template_name: name,
          description: description ?? null,
          is_default: 0,
        }) as Insertable<BudgetTemplate>
      );

      for (const line of lines) {
        if (line.category_id == null || line.record_type_id == null) continue;
        await items.insert({
          budget_template_id: templateId,
          category_id: line.category_id,
          record_type_id: line.record_type_id,
          fixed_id: line.fixed_id ?? null,
          scope: saleOf(line.scope),
          amount: line.planned_amount,
          priority: line.priority ?? 2,
          notes: line.notes ?? null,
          sort_order: line.sort_order ?? 0,
        });
      }

      return templateId;
    });
  };

  const createFromFixeds = async (groupId: number): Promise<number> => {
    const planId = await createPlan(groupId);
    const [fixeds, current] = await Promise.all([
      fixedsOrm.getAll() as Promise<FixedRecord[]>,
      linesOrm.where('budget_plan_id', planId).getAll() as Promise<BudgetLine[]>,
    ]);
    const existingFixedIds = new Set(
      current
        .filter((line) => saleOf(line.scope) === 'fixed' && line.fixed_id !== null)
        .map((line) => line.fixed_id as number)
    );
    const allTypes = (await recordTypesOrm.getAll()) as RecordType[];
    const typeIds = budgetableTypeIds(
      allTypes,
      excludedRecordTypeIds(allTypes)
    );

    let created = 0;
    for (const fixed of fixeds) {
      if (
        fixed.id === undefined ||
        existingFixedIds.has(fixed.id) ||
        fixed.category_id == null ||
        fixed.record_type_id == null ||
        !typeIds.has(fixed.record_type_id)
      ) {
        continue;
      }

      await linesOrm.insert({
        budget_plan_id: planId,
        category_id: fixed.category_id,
        record_type_id: fixed.record_type_id,
        fixed_id: fixed.id,
        scope: 'fixed',
        source: 'fixed',
        planned_amount: fixed.fixed_amount,
        priority: 2,
        sort_order: created,
      });
      created += 1;
    }

    return created;
  };

  const createFromActuals = async (
    groupId: number,
    sourceGroupId: number = groupId
  ): Promise<number> => {
    const planId = await createPlan(groupId);
    const [records, current] = await Promise.all([
      recordsOrm.where('group_id', sourceGroupId).getAll(),
      linesOrm.where('budget_plan_id', planId).getAll() as Promise<BudgetLine[]>,
    ]);
    const allTypes = (await recordTypesOrm.getAll()) as RecordType[];
    const typeIds = budgetableTypeIds(
      allTypes,
      excludedRecordTypeIds(allTypes)
    );
    const existing = new Set(
      current
        .filter((line) => saleOf(line.scope) === 'category')
        .map((line) => `${line.category_id}:${line.record_type_id}`)
    );
    const totals = new Map<string, { categoryId: number; typeId: number; amount: number }>();

    for (const record of records) {
      if (
        record.category_id == null ||
        record.record_type_id == null ||
        !typeIds.has(record.record_type_id) ||
        record.amount <= 0
      ) {
        continue;
      }
      const key = `${record.category_id}:${record.record_type_id}`;
      const entry = totals.get(key) ?? {
        categoryId: record.category_id,
        typeId: record.record_type_id,
        amount: 0,
      };
      entry.amount += record.amount;
      totals.set(key, entry);
    }

    let created = 0;
    for (const [key, entry] of totals) {
      if (existing.has(key)) continue;
      await linesOrm.insert({
        budget_plan_id: planId,
        category_id: entry.categoryId,
        record_type_id: entry.typeId,
        scope: 'category',
        source: 'actuals',
        planned_amount: entry.amount,
        priority: 2,
        sort_order: created,
      });
      created += 1;
    }

    return planId;
  };

  const createFromGroupsAverage = async (
    groupId: number,
    sourceGroupIds: number[]
  ): Promise<number> => {
    const planId = await createPlan(groupId);
    const selected = [...new Set(sourceGroupIds.filter((id) => id > 0))];
    if (selected.length === 0) return planId;

    const [records, current] = await Promise.all([
      recordsOrm.where('group_id', selected, 'IN').getAll(),
      linesOrm.where('budget_plan_id', planId).getAll() as Promise<BudgetLine[]>,
    ]);
    const allTypes = (await recordTypesOrm.getAll()) as RecordType[];
    const typeIds = budgetableTypeIds(
      allTypes,
      excludedRecordTypeIds(allTypes)
    );
    const existing = new Set(
      current
        .filter((line) => saleOf(line.scope) === 'category')
        .map((line) => `${line.category_id}:${line.record_type_id}`)
    );
    const averages = averageBudgetTotals(records, typeIds, selected.length);

    let created = 0;
    for (const entry of averages) {
      const key = `${entry.categoryId}:${entry.typeId}`;
      if (existing.has(key)) continue;
      await linesOrm.insert({
        budget_plan_id: planId,
        category_id: entry.categoryId,
        record_type_id: entry.typeId,
        scope: 'category',
        source: 'group_average',
        planned_amount: entry.amountCents,
        priority: 2,
        sort_order: created,
      });
      created += 1;
    }

    return planId;
  };

  const createFromPreviousMonth = async (groupId: number): Promise<number | null> => {
    const group = await groupsOrm.getById(groupId);
    if (!group) return null;

    const previous = await groupsOrm
      .raw<{ id: number }>(
        `SELECT id FROM "groups"
         WHERE deleted_at IS NULL
           AND (year < ? OR (year = ? AND month < ?))
         ORDER BY year DESC, month DESC
         LIMIT 1`,
        [group.year, group.year, group.month]
      );

    const previousGroupId = previous[0]?.id;
    if (!previousGroupId) return null;

    const previousPlan = await fetchPlan(previousGroupId);
    if (!previousPlan?.id) {
      return createFromActuals(groupId, previousGroupId);
    }

    const planId = await createPlan(groupId);
    const previousLines = (await linesOrm
      .where('budget_plan_id', previousPlan.id)
      .getAll()) as BudgetLine[];
    if (previousLines.length === 0) {
      return createFromActuals(groupId, previousGroupId);
    }
    const currentLines = (await linesOrm
      .where('budget_plan_id', planId)
      .getAll()) as BudgetLine[];

    let created = 0;
    for (const line of previousLines) {
      const scope = saleOf(line.scope);
      const duplicate = currentLines.some((current) => {
        if (saleOf(current.scope) !== scope) return false;
        if (scope === 'fixed') return current.fixed_id === line.fixed_id;
        return (
          current.category_id === line.category_id &&
          current.record_type_id === line.record_type_id
        );
      });
      if (duplicate) continue;

      await linesOrm.insert({
        budget_plan_id: planId,
        category_id: line.category_id ?? null,
        record_type_id: line.record_type_id ?? null,
        fixed_id: line.fixed_id ?? null,
        scope,
        source: 'previous_month',
        planned_amount: line.planned_amount,
        priority: line.priority ?? 2,
        notes: line.notes ?? null,
        sort_order: line.sort_order ?? created,
      });
      created += 1;
    }

    return planId;
  };

  const fetchLineRecords = async (
    groupId: number,
    lineId: number
  ): Promise<RecordView[]> => {
    const plan = await fetchPlan(groupId);
    if (!plan?.id) return [];
    const lines = (await linesOrm.where('budget_plan_id', plan.id).getAll()) as BudgetLine[];
    const line = lines.find((item) => item.id === lineId);
    if (!line) return [];

    const fixedLineIds = new Set(
      lines
        .filter((item) => saleOf(item.scope) === 'fixed' && item.fixed_id !== null)
        .map((item) => item.fixed_id as number)
    );
    const rows = (await recordsOrm
      .join('RecordTypes')
      .where('group_id', groupId)
      .order('date', 'DESC')
      .getAll()) as RecordView[];

    return rows.filter((record) => {
      if (saleOf(line.scope) === 'fixed') {
        return line.fixed_id != null && record.fixed_id === line.fixed_id;
      }
      if (
        record.category_id !== line.category_id ||
        record.record_type_id !== line.record_type_id
      ) {
        return false;
      }
      if (record.fixed_id != null && fixedLineIds.has(record.fixed_id)) {
        return false;
      }
      return true;
    });
  };

  const listLines = async (planId: number): Promise<BudgetLineView[]> => {
    const [lines, categories, recordTypes, fixeds] = await Promise.all([
      linesOrm.where('budget_plan_id', planId).getAll(),
      categoriesOrm.getAll(),
      recordTypesOrm.getAll(),
      fixedsOrm.getAll(),
    ]);
    const categoryMap = new Map(categories.map((item) => [item.id, item.category_name]));
    const typeMap = new Map(recordTypes.map((item) => [item.id, item]));
    const fixedMap = new Map(fixeds.map((item) => [item.id, item]));

    return (lines as BudgetLineView[]).map((line) =>
      flattenLineView(
        line,
        line.category_id !== null ? categoryMap.get(line.category_id) : null,
        line.record_type_id !== null ? typeMap.get(line.record_type_id)?.type_name : null,
        line.fixed_id !== null ? fixedMap.get(line.fixed_id)?.fixed_name : null
      )
    );
  };

  return {
    fetchPlan,
    fetchPlanById,
    fetchPlanView,
    createPlan,
    updatePlan,
    saveLine,
    deleteLine,
    listLines,
    fetchLineRecords,
    applyTemplate,
    saveAsTemplate,
    createFromFixeds,
    createFromActuals,
    createFromGroupsAverage,
    createFromPreviousMonth,
    deletePlan,
    listGroups,
  };
};

export const useBudgetTemplatesRepository = () => {
  const db = useSQLiteContext();
  const templatesOrm = useORM('BudgetTemplates');
  const itemsOrm = useORM('BudgetTemplateItems');
  const categoriesOrm = useORM('Categories');
  const recordTypesOrm = useORM('RecordTypes');
  const fixedsOrm = useORM('Fixed');

  const loadLookups = async () => {
    const [categories, recordTypes, fixeds] = await Promise.all([
      categoriesOrm.getAll(),
      recordTypesOrm.getAll(),
      fixedsOrm.getAll(),
    ]);
    return {
      categoryMap: new Map(categories.map((item) => [item.id, item.category_name])),
      typeMap: new Map(recordTypes.map((item) => [item.id, item])),
      fixedMap: new Map(fixeds.map((item) => [item.id, item])),
    };
  };

  const buildView = (
    template: BudgetTemplate,
    items: BudgetTemplateItem[],
    lookups: Awaited<ReturnType<typeof loadLookups>>
  ): BudgetTemplateView => {
    const itemViews: BudgetTemplateItemView[] = items.map((item) => {
      const type = lookups.typeMap.get(item.record_type_id);
      return {
        id: item.id as number,
        templateId: item.budget_template_id,
        categoryId: item.category_id,
        categoryName: lookups.categoryMap.get(item.category_id) ?? '',
        recordTypeId: item.record_type_id,
        typeName: type?.type_name ?? '',
        effect: effectOf(type),
        amountCents: item.amount,
        priority: item.priority ?? 2,
        notes: item.notes ?? null,
        sortOrder: item.sort_order ?? 0,
        scope: saleOf(item.scope),
        fixedId: item.fixed_id ?? null,
        fixedName:
          item.fixed_id !== null
            ? lookups.fixedMap.get(item.fixed_id)?.fixed_name ?? null
            : null,
      };
    });

    return {
      id: template.id as number,
      name: template.template_name,
      description: template.description ?? null,
      notes: template.notes ?? null,
      isDefault: Boolean(template.is_default),
      items: itemViews.sort(
        (a, b) => a.sortOrder - b.sortOrder || a.categoryName.localeCompare(b.categoryName)
      ),
      totalCents: itemViews.reduce((total, item) => total + item.amountCents, 0),
    };
  };

  const listTemplates = async (): Promise<BudgetTemplateView[]> => {
    const [templates, items, lookups] = await Promise.all([
      templatesOrm.getAll() as Promise<BudgetTemplate[]>,
      itemsOrm.getAll() as Promise<BudgetTemplateItem[]>,
      loadLookups(),
    ]);
    const itemsByTemplate = new Map<number, BudgetTemplateItem[]>();
    for (const item of items) {
      const list = itemsByTemplate.get(item.budget_template_id) ?? [];
      list.push(item);
      itemsByTemplate.set(item.budget_template_id, list);
    }

    return templates.map((template) =>
      buildView(template, itemsByTemplate.get(template.id as number) ?? [], lookups)
    );
  };

  const getTemplate = async (id: number): Promise<BudgetTemplateView | null> => {
    const [template, items, lookups] = await Promise.all([
      templatesOrm.getById(id) as Promise<BudgetTemplate | null>,
      itemsOrm.where('budget_template_id', id).getAll() as Promise<BudgetTemplateItem[]>,
      loadLookups(),
    ]);
    return template ? buildView(template, items, lookups) : null;
  };

  const saveTemplate = async (
    input: BudgetTemplateInput & { id?: number }
  ): Promise<number> => {
    if (input.id) {
      const payload = budgetTemplateUpdateSchema.parse(input);
      await templatesOrm.update(input.id, payload);
      return input.id;
    }
    return templatesOrm.insert(
      budgetTemplateInputSchema.parse(input) as Insertable<BudgetTemplate>
    );
  };

  const setDefault = async (templateId: number) => {
    const templates = (await templatesOrm.getAll()) as BudgetTemplate[];
    await withExclusiveTransaction(db, async (txn) => {
      const orm = new ORM(txn, 'BudgetTemplates');
      for (const template of templates) {
        if (template.id === undefined) continue;
        await orm.update(template.id, { is_default: template.id === templateId ? 1 : 0 });
      }
    });
  };

  const deleteTemplate = async (templateId: number) => templatesOrm.delete(templateId);

  const duplicateTemplate = async (templateId: number): Promise<number> => {
    const source = (await templatesOrm.getById(templateId)) as BudgetTemplate | null;
    if (!source) throw new Error(`Template ${templateId} does not exist`);
    const sourceItems = (await itemsOrm
      .where('budget_template_id', templateId)
      .getAll()) as BudgetTemplateItem[];
    const existingNames = new Set(
      ((await templatesOrm.getAll()) as BudgetTemplate[]).map(
        (template) => template.template_name
      )
    );
    let copyName = `${source.template_name} (copy)`;
    let copyIndex = 2;
    while (existingNames.has(copyName)) {
      copyName = `${source.template_name} (copy ${copyIndex})`;
      copyIndex += 1;
    }

    return withExclusiveTransaction(db, async (txn) => {
      const templates = new ORM(txn, 'BudgetTemplates');
      const items = new ORM(txn, 'BudgetTemplateItems');
      const newId = await templates.insert({
        template_name: copyName,
        description: source.description ?? null,
        notes: source.notes ?? null,
        is_default: 0,
      });
      for (const item of sourceItems) {
        await items.insert({
          budget_template_id: newId,
          amount: item.amount,
          record_type_id: item.record_type_id,
          category_id: item.category_id,
          fixed_id: item.fixed_id ?? null,
          scope: saleOf(item.scope),
          priority: item.priority ?? 2,
          notes: item.notes ?? null,
          sort_order: item.sort_order ?? 0,
        });
      }
      return newId;
    });
  };

  const saveItem = async (
    input: BudgetTemplateItemInput & { id?: number }
  ): Promise<number> => {
    if (input.id) {
      await itemsOrm.update(input.id, budgetTemplateItemUpdateSchema.parse(input));
      return input.id;
    }
    return itemsOrm.insert(
      budgetTemplateItemInputSchema.parse(input) as Insertable<BudgetTemplateItem>
    );
  };

  const deleteItem = async (itemId: number) => itemsOrm.delete(itemId);

  return {
    listTemplates,
    getTemplate,
    saveTemplate,
    setDefault,
    deleteTemplate,
    duplicateTemplate,
    saveItem,
    deleteItem,
  };
};

export type { BudgetTemplateItemWithRelations };
