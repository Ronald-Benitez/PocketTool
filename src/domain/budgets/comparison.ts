import type {
  BudgetComparisonInput,
  BudgetFixedCommitment,
  BudgetInsight,
  BudgetLineComparison,
  BudgetLineStatus,
  BudgetPlanView,
  BudgetUnplannedBucket,
} from './types';

const effectOf = (
  typeId: number | null,
  types: Map<number, string>
): '+' | '-' | '=' | null => {
  if (typeId === null) return null;
  const effect = types.get(typeId);
  return effect === '+' || effect === '-' || effect === '=' ? effect : null;
};

const monthInfo = (year: number, month: number, now: Date) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year === currentYear && month === currentMonth) {
    return {
      daysInMonth,
      daysElapsed: Math.min(Math.max(now.getDate(), 0), daysInMonth),
      relation: 'current' as const,
    };
  }

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { daysInMonth, daysElapsed: daysInMonth, relation: 'past' as const };
  }

  return { daysInMonth, daysElapsed: 0, relation: 'future' as const };
};

const statusFor = (
  scope: BudgetLineComparison['scope'],
  actual: number,
  planned: number,
  pending: number,
  threshold: number
): BudgetLineStatus => {
  if (scope === 'fixed' && pending > 0 && actual === 0) return 'fixed_pending';
  if (actual > planned) return 'over';
  const usage = planned > 0 ? (actual / planned) * 100 : actual > 0 ? 100 : 0;
  if (usage >= threshold) return 'warning';
  return 'on_track';
};

const projectedFor = (
  scope: BudgetLineComparison['scope'],
  actual: number,
  planned: number,
  pending: number,
  info: ReturnType<typeof monthInfo>
) => {
  if (scope === 'fixed') return actual + pending;
  if (info.relation === 'past') return actual;
  if (info.relation === 'future') return planned;
  if (info.daysElapsed <= 0) return planned;
  if (info.daysElapsed >= info.daysInMonth) return actual;
  return Math.round((actual / info.daysElapsed) * info.daysInMonth);
};

export const calculateBudgetPlanView = ({
  plan,
  planName,
  month,
  year,
  templateName,
  lines,
  records,
  fixeds,
  categories,
  recordTypes,
  excludedRecordTypeIds = [],
  now = new Date(),
}: BudgetComparisonInput): BudgetPlanView => {
  const info = monthInfo(year, month, now);
  const threshold = plan.alert_threshold_percent || 80;
  const categoryNames = new Map(
    categories.flatMap((category) =>
      category.id === undefined ? [] : [[category.id, category.category_name] as const]
    )
  );
  const typeMap = new Map(
    recordTypes.flatMap((type) => (type.id === undefined ? [] : [[type.id, type] as const]))
  );
  const effectMap = new Map(
    recordTypes.flatMap((type) =>
      type.id === undefined ? [] : [[type.id, type.effect ?? ''] as const]
    )
  );
  const excluded = new Set(excludedRecordTypeIds);

  const budgetableTypes = recordTypes.filter(
    (type) =>
      type.id !== undefined &&
      !excluded.has(type.id) &&
      (type.effect === '+' || type.effect === '-')
  );
  const budgetableIds = new Set(
    budgetableTypes.flatMap((type) => (type.id === undefined ? [] : [type.id]))
  );

  const budgetableRecords = records.filter(
    (record) =>
      record.record_type_id !== null &&
      budgetableIds.has(record.record_type_id) &&
      record.amount > 0
  );

  const fixedLineIds = new Set(
    lines
      .filter((line) => line.scope === 'fixed' && line.fixed_id !== null)
      .map((line) => line.fixed_id as number)
  );
  const fixedById = new Map(
    fixeds.flatMap((fixed) => (fixed.id === undefined ? [] : [[fixed.id, fixed] as const]))
  );

  const comparedLines: BudgetLineComparison[] = lines
    .map((line) => {
      const scope: BudgetLineComparison['scope'] =
        line.scope === 'fixed' ? 'fixed' : 'category';
      const typeId = line.record_type_id ?? null;
      const type = typeId !== null ? typeMap.get(typeId) : undefined;
      const effect = effectOf(typeId, effectMap);
      const fixed = line.fixed_id != null ? fixedById.get(line.fixed_id) : undefined;

      const actualCents = budgetableRecords
        .filter((record) => {
          if (scope === 'fixed') {
            return line.fixed_id !== null && record.fixed_id === line.fixed_id;
          }
          if (record.category_id !== line.category_id) return false;
          if (record.record_type_id !== line.record_type_id) return false;
          if (record.fixed_id !== null && fixedLineIds.has(record.fixed_id)) return false;
          return true;
        })
        .reduce((total, record) => total + record.amount, 0);

      const confirmed = budgetableRecords.some(
        (record) => line.fixed_id !== null && record.fixed_id === line.fixed_id
      );
      const pendingFixedCents =
        scope === 'fixed' && fixed && !confirmed ? fixed.fixed_amount : 0;
      const plannedCents = line.planned_amount;
      const usagePercent =
        plannedCents > 0
          ? (actualCents / plannedCents) * 100
          : actualCents > 0
            ? 100
            : 0;

      return {
        lineId: line.id as number,
        scope,
        categoryId: line.category_id ?? null,
        categoryName:
          line.category_id != null ? categoryNames.get(line.category_id) ?? '' : '',
        recordTypeId: typeId,
        typeName: type?.type_name ?? '',
        effect,
        plannedCents,
        actualCents,
        pendingFixedCents,
        varianceCents: plannedCents - actualCents,
        usagePercent,
        projectedCents: projectedFor(
          scope,
          actualCents,
          plannedCents,
          pendingFixedCents,
          info
        ),
        status: statusFor(scope, actualCents, plannedCents, pendingFixedCents, threshold),
        priority: line.priority ?? 2,
        notes: line.notes ?? null,
        fixedId: line.fixed_id ?? null,
        fixedName: fixed?.fixed_name ?? null,
        fixedDay: fixed?.fixed_day ?? null,
        fixedConfirmed: confirmed,
        sortOrder: line.sort_order ?? 0,
      };
    })
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.categoryName.localeCompare(b.categoryName);
    });

  const plannedForEffect = (effect: '+' | '-') =>
    comparedLines
      .filter((line) => line.effect === effect)
      .reduce((total, line) => total + line.plannedCents, 0);

  const actualForEffect = (effect: '+' | '-') =>
    budgetableRecords
      .filter((record) => effectOf(record.record_type_id, effectMap) === effect)
      .reduce((total, record) => total + record.amount, 0);

  const fixedCommitments: BudgetFixedCommitment[] = fixeds
    .filter((fixed) => {
      if (fixed.id === undefined) return false;
      if (fixed.record_type_id === null || fixed.record_type_id === undefined) return false;
      return budgetableIds.has(fixed.record_type_id);
    })
    .map((fixed) => {
      const fixedId = fixed.id as number;
      const record = budgetableRecords.find((item) => item.fixed_id === fixedId);
      const line = comparedLines.find(
        (item) => item.scope === 'fixed' && item.fixedId === fixedId
      );
      return {
        fixedId,
        name: fixed.fixed_name,
        day: fixed.fixed_day,
        amountCents: fixed.fixed_amount,
        categoryId: fixed.category_id ?? null,
        categoryName:
          fixed.category_id != null ? categoryNames.get(fixed.category_id) ?? '' : '',
        recordTypeId: fixed.record_type_id ?? null,
        typeName: fixed.record_type_id != null
          ? typeMap.get(fixed.record_type_id)?.type_name ?? ''
          : '',
        confirmed: Boolean(record),
        recordId: record?.id ?? null,
        lineId: line?.lineId ?? null,
        active: true,
      };
    })
    .sort((a, b) => a.day - b.day);

  const consumed = new Set<number>();
  for (const record of budgetableRecords) {
    if (record.fixed_id !== null && fixedLineIds.has(record.fixed_id)) {
      consumed.add(record.id);
      continue;
    }
    const hasLine = lines.some(
      (line) =>
        line.scope !== 'fixed' &&
        line.category_id === record.category_id &&
        line.record_type_id === record.record_type_id
    );
    if (hasLine) consumed.add(record.id);
  }

  const unplannedMap = new Map<string, BudgetUnplannedBucket>();
  for (const record of budgetableRecords) {
    if (consumed.has(record.id)) continue;
    const categoryId = record.category_id;
    const typeId = record.record_type_id;
    const key = `${categoryId ?? 'null'}:${typeId ?? 'null'}`;
    const bucket = unplannedMap.get(key) ?? {
      categoryId,
      categoryName:
        categoryId !== null ? categoryNames.get(categoryId) ?? '' : '',
      recordTypeId: typeId,
      typeName: typeId !== null ? typeMap.get(typeId)?.type_name ?? '' : '',
      effect: effectOf(typeId, effectMap),
      actualCents: 0,
      recordCount: 0,
    };
    bucket.actualCents += record.amount;
    bucket.recordCount += 1;
    unplannedMap.set(key, bucket);
  }
  const unplanned = [...unplannedMap.values()].sort(
    (a, b) => b.actualCents - a.actualCents
  );

  const pendingFixedCents = fixedCommitments
    .filter((fixed) => !fixed.confirmed)
    .reduce((total, fixed) => total + fixed.amountCents, 0);

  const insights: BudgetInsight[] = [];
  for (const line of comparedLines) {
    if (line.status === 'over') {
      insights.push({
        kind: 'over_budget',
        lineId: line.lineId,
        amountCents: line.actualCents - line.plannedCents,
      });
    } else if (line.status === 'warning') {
      insights.push({
        kind: 'near_limit',
        lineId: line.lineId,
        usagePercent: Math.round(line.usagePercent),
      });
    }
  }
  for (const bucket of unplanned) {
    insights.push({
      kind: 'unplanned_spending',
      categoryId: bucket.categoryId,
      amountCents: bucket.actualCents,
    });
  }
  for (const fixed of fixedCommitments) {
    if (fixed.lineId === null) {
      insights.push({
        kind: 'fixed_uncovered',
        fixedId: fixed.fixedId,
        amountCents: fixed.amountCents,
      });
    }
    if (!fixed.confirmed) {
      insights.push({
        kind: 'fixed_pending',
        fixedId: fixed.fixedId,
        day: fixed.day,
        amountCents: fixed.amountCents,
      });
    }
  }
  if (comparedLines.length === 0) {
    insights.push({ kind: 'empty_plan', planId: plan.id as number });
  }

  const plannedIncomeCents = plannedForEffect('+');
  const plannedExpenseCents = plannedForEffect('-');
  const actualIncomeCents = actualForEffect('+');
  const actualExpenseCents = actualForEffect('-');

  return {
    planId: plan.id as number,
    groupId: plan.group_id,
    planName,
    month,
    year,
    templateId: plan.template_id ?? null,
    templateName,
    alertThresholdPercent: threshold,
    notes: plan.notes ?? null,
    daysInMonth: info.daysInMonth,
    daysElapsed: info.daysElapsed,
    totals: {
      plannedIncomeCents,
      plannedExpenseCents,
      actualIncomeCents,
      actualExpenseCents,
      plannedNetCents: plannedIncomeCents - plannedExpenseCents,
      actualNetCents: actualIncomeCents - actualExpenseCents,
      pendingFixedCents,
    },
    lines: comparedLines,
    unplanned,
    fixedCommitments,
    insights,
  };
};

export const filterBudgetInsights = (
  insights: BudgetInsight[],
  kinds: BudgetInsight['kind'][]
) => insights.filter((insight) => kinds.includes(insight.kind));
