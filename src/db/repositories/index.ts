import { useORM } from '@/src/orm';
import type { TableName } from '@/src/db/schema';
import type {
  Budget,
  BudgetItemView,
  BudgetTemplateItem,
  BudgetWithRelations,
  Category,
  Cents,
  FixedRecordWithRelations,
  FixedView,
  Group,
  Insertable,
  PaidCredit,
  PaymentMethod,
  PaymentMethodView,
  RecordView,
  RecordWithRelations,
  Saving,
  SavingsHistoryEntry,
  SavingsHistoryWithRelations,
} from '@/src/interfaces/schema';

const RECORD_JOINS = [
  'Groups',
  'Categories',
  'PaymentMethods',
  'PaymentMethods.PaymentTypes',
  'RecordTypes',
  'PaidCredits',
  'PaidCredits.PaymentMethods',
  'PaidCredits.PaymentMethods.PaymentTypes',
] as const;

const FIXED_JOINS = [
  'Categories',
  'PaymentMethods',
  'PaymentMethods.PaymentTypes',
  'RecordTypes',
] as const;

const BUDGET_JOINS = ['Categories', 'RecordTypes', 'Groups'] as const;

const flattenRecord = (record: RecordWithRelations): RecordView => ({
  ...record,
  record_id: record.id,
  group_name: record.Groups?.group_name,
  category_name: record.Categories?.category_name,
  method_name: record.PaymentMethods?.method_name,
  payment_type_id:
    record.PaymentMethods?.payment_type_id ?? record.PaymentMethods?.PaymentTypes?.id,
  payment_type_name: record.PaymentMethods?.PaymentTypes?.payment_type_name,
  payment_color: record.PaymentMethods?.PaymentTypes?.payment_color,
  type_name: record.RecordTypes?.type_name,
  effect: record.RecordTypes?.effect,
  record_color: record.RecordTypes?.record_color,
  paid_method_id: record.PaidCredits?.payment_method_id,
  paid_method_amount: record.PaidCredits?.amount,
});

const flattenFixed = (fixed: FixedRecordWithRelations): FixedView => ({
  ...fixed,
  fixed_id: fixed.id,
  category_name: fixed.Categories?.category_name,
  method_name: fixed.PaymentMethods?.method_name,
  payment_type_id:
    fixed.PaymentMethods?.payment_type_id ?? fixed.PaymentMethods?.PaymentTypes?.id,
  payment_type_name: fixed.PaymentMethods?.PaymentTypes?.payment_type_name,
  payment_color: fixed.PaymentMethods?.PaymentTypes?.payment_color,
  type_name: fixed.RecordTypes?.type_name,
  effect: fixed.RecordTypes?.effect,
  record_color: fixed.RecordTypes?.record_color,
});

const flattenPaymentMethod = (method: PaymentMethod & {
  PaymentTypes?: { payment_type_name?: string | null; payment_color?: string | null } | null;
}): PaymentMethodView => ({
  ...method,
  payment_type_name: method.PaymentTypes?.payment_type_name,
  payment_color: method.PaymentTypes?.payment_color,
});

const flattenBudget = (budget: BudgetWithRelations): BudgetItemView => ({
  ...budget,
  category_name: budget.Categories?.category_name,
  type_name: budget.RecordTypes?.type_name,
  effect: budget.RecordTypes?.effect,
  record_color: budget.RecordTypes?.record_color,
});

export const useTableRepository = <T extends TableName>(table: T) => {
  const orm = useORM(table);

  const fetchAll = async () => orm.getAll();

  const fetchAllWithJoin = async (joinTable: TableName, _joinColumn: string) => {
    const rows = await orm.join(joinTable as never).getAll();
    if (table === 'PaymentMethods') {
      return rows.map((row) => flattenPaymentMethod(row as unknown as PaymentMethod));
    }
    return rows;
  };

  const fetchWithWhere = async (column: string, value: string | number) =>
    orm.where(column as never, value).getAll();

  const fetchWithMultipleWhere = async (conditions: Record<string, string | number | null>) => {
    let query = orm;
    for (const [column, value] of Object.entries(conditions)) {
      query = query.where(column as never, value);
    }
    return query.getAll();
  };

  const fetchGroupsByYear = async (year: string | number) =>
    orm.where('year' as never, Number(year)).getAll();

  const fetchById = async (id: number) => orm.where('id' as never, id).first();

  const fetchLast = async () => orm.order('id' as never, 'DESC').first();

  const add = async (values: object) => orm.insert(values as never);

  const edit = async (values: object & { id?: number }) => {
    const { id, ...rest } = values as Record<string, unknown> & { id?: number };
    if (!id) throw new Error(`Cannot update ${table} without an id`);
    await orm.update(id, rest as never);
  };

  const deleteById = async (id: number) => orm.delete(id);

  const deleteWithWhere = async (column: string, value: string | number) =>
    orm.deleteWhere(column, value);

  return {
    fetchAll,
    fetchAllWithJoin,
    fetchWithWhere,
    fetchWithMultipleWhere,
    fetchGroupsByYear,
    fetchById,
    fetchLast,
    add,
    edit,
    deleteById,
    deleteWithWhere,
  };
};

export const useRecordsRepository = () => {
  const recordsOrm = useORM('Records');
  const paidCreditsOrm = useORM('PaidCredits');
  const handler = useTableRepository('Records');

  const fetchRecords = async (group_id: number | undefined): Promise<RecordView[] | undefined> => {
    if (!group_id) return;
    const rows = await recordsOrm
      .joinMany([...RECORD_JOINS])
      .where('group_id', group_id)
      .order('date', 'ASC')
      .getAll();
    return rows.map(flattenRecord);
  };

  const fetchRecordsWithMultipleWhere = async (
    wheres: Array<{ column: string; value: string | number | null }>
  ): Promise<RecordView[] | undefined> => {
    if (wheres.length === 0) return;
    let query = recordsOrm.joinMany([...RECORD_JOINS]);
    for (const where of wheres) {
      query = query.where(where.column as never, where.value);
    }
    const rows = await query.order('date', 'ASC').getAll();
    return rows.map(flattenRecord);
  };

  const fetchCredits = async (
    payment_method_id: number,
    startLimit: number,
    endLimit: number
  ): Promise<RecordView[] | undefined> => {
    if (!payment_method_id) return;
    const rows = await recordsOrm
      .joinMany([...RECORD_JOINS])
      .where('payment_method_id', payment_method_id)
      .where('date', [startLimit, endLimit], 'BETWEEN')
      .order('date', 'ASC')
      .getAll();
    return rows.map(flattenRecord);
  };

  const fetchPaidCredits = async (
    payment_method_id: number,
    startLimit: number,
    endLimit: number
  ): Promise<PaidCredit[] | undefined> => {
    if (!payment_method_id) return;
    return paidCreditsOrm
      .where('payment_method_id', payment_method_id)
      .where('date', [startLimit, endLimit], 'BETWEEN')
      .order('date', 'ASC')
      .getAll();
  };

  const sumByEffect = async (group_id: number, effect: string): Promise<number> => {
    const rows = await recordsOrm
      .join('RecordTypes')
      .where('group_id', group_id)
      .where('RecordTypes.effect', effect)
      .getAll();
    return rows.reduce((total, record) => total + (record.amount || 0), 0);
  };

  const fetchTotalIncomes = async (group_id: number | undefined): Promise<number | null> => {
    if (!group_id) return null;
    return sumByEffect(group_id, '+');
  };

  const fetchTotalExpenses = async (group_id: number | undefined): Promise<number | null> => {
    if (!group_id) return null;
    return sumByEffect(group_id, '-');
  };

  const deleteRecordByGroup = async (group_id: number) =>
    recordsOrm.deleteWhere('group_id', group_id);

  return {
    fetchRecords,
    fetchRecordsWithMultipleWhere,
    fetchCredits,
    fetchPaidCredits,
    fetchTotalIncomes,
    fetchTotalExpenses,
    deleteRecordByGroup,
    handler,
  };
};

export const useFixedsRepository = () => {
  const fixedsOrm = useORM('Fixed');
  const handler = useTableRepository('Fixed');

  const fetchFixeds = async (): Promise<FixedView[] | undefined> => {
    const rows = await fixedsOrm
      .joinMany([...FIXED_JOINS])
      .order('fixed_day', 'ASC')
      .getAll();
    return rows.map((row) => flattenFixed(row as never));
  };

  return {
    fetchFixeds,
    handler,
  };
};

export const useGroupsRepository = () => {
  const groupsOrm = useORM('Groups');
  const recordsOrm = useORM('Records');
  const budgetsOrm = useORM('Budgets');

  const fetchGroups = async (): Promise<Group[]> => groupsOrm.getAll();

  const fetchGroupsByYear = async (year: string | number): Promise<Group[]> =>
    groupsOrm.where('year', Number(year)).getAll();

  const fetchGroupsById = async (id: number): Promise<Group | null> =>
    groupsOrm.where('id', id).first();

  const fetchLastGroup = async (): Promise<Group | null> =>
    groupsOrm.order('id', 'DESC').first();

  const addGroup = async (newGroup: Insertable<Group>) => {
    return groupsOrm.insert(newGroup);
  };

  const deleteGroup = async (id: number) => {
    await recordsOrm.deleteWhere('group_id', id);
    await budgetsOrm.deleteWhere('group_id', id);
    await groupsOrm.delete(id);
  };

  const editGroup = async (id: number, updatedGroup: Partial<Group>) => {
    await groupsOrm.update(id, updatedGroup);
  };

  return {
    addGroup,
    deleteGroup,
    editGroup,
    fetchGroups,
    fetchGroupsByYear,
    fetchGroupsById,
    fetchLastGroup,
  };
};

export const useCategoriesRepository = () => {
  const categoriesOrm = useORM('Categories');

  const fetchCategories = async (): Promise<Category[]> => categoriesOrm.getAll();

  const fetchCategoriesByID = async (_id: number): Promise<Category[]> => categoriesOrm.getAll();

  const addCategory = async (category: Insertable<Category>) => {
    return categoriesOrm.insert(category);
  };

  const deleteCategory = async (id: number) => categoriesOrm.delete(id);

  const updateCategory = async (id: number, category: Partial<Category>) => {
    await categoriesOrm.update(id, category);
  };

  return {
    addCategory,
    deleteCategory,
    fetchCategories,
    fetchCategoriesByID,
    updateCategory,
  };
};

export const useSavingsRepository = () => {
  const savingsOrm = useORM('Savings');
  const historyOrm = useORM('SavingsHistory');

  const fetchSavings = async (): Promise<Saving[]> => savingsOrm.getAll();

  const addSavings = async (savingName: string, amount: Cents) => {
    return savingsOrm.insert({ saving_name: savingName, amount });
  };

  const updateSavings = async (id: number, savingName: string, amount: Cents) => {
    await savingsOrm.update(id, { saving_name: savingName, amount });
  };

  const deleteSavings = async (id: number) => {
    await historyOrm.deleteWhere('savings_id', id);
    await savingsOrm.delete(id);
  };

  const fetchSavingsById = async (id: number): Promise<Saving | null> =>
    savingsOrm.where('id', id).first();

  return {
    fetchSavings,
    addSavings,
    updateSavings,
    deleteSavings,
    fetchSavingsById,
  };
};

export const useSavingsHistoryRepository = () => {
  const historyOrm = useORM('SavingsHistory');
  const handler = useTableRepository('SavingsHistory');

  const fetchSavingsHistoryBySavingId = async (
    savingId: number
  ): Promise<SavingsHistoryWithRelations[]> => {
    return historyOrm
      .where('savings_id', savingId)
      .order('change_date', 'DESC')
      .limit(5)
      .getAll();
  };

  const deleteSavingsHistory = async (savingId: number) =>
    historyOrm.deleteWhere('savings_id', savingId);

  return {
    fetchSavingsHistoryBySavingId,
    deleteSavingsHistory,
    handler,
  };
};

export const useBudgetsRepository = (table: 'BudgetTemplateItems' | 'Budgets' = 'Budgets') => {
  const budgetsOrm = useORM('Budgets');
  const templateItemsOrm = useORM('BudgetTemplateItems');
  const handler = useTableRepository(table);

  const fetchBudget = async (group_id: number | undefined): Promise<BudgetItemView[] | undefined> => {
    if (!group_id) return;
    const rows = await budgetsOrm
      .joinMany([...BUDGET_JOINS])
      .where('group_id', group_id)
      .getAll();
    return rows.map(flattenBudget);
  };

  const fetchBudgetItems = async (
    group_id: number | undefined
  ): Promise<BudgetItemView[] | undefined> => {
    if (!group_id) return;
    const rows = await budgetsOrm
      .joinMany([...BUDGET_JOINS])
      .where('group_id', group_id)
      .getAll();
    return rows.map(flattenBudget);
  };

  const fetchBudgetTemplateItems = async (
    template_id: number | undefined
  ): Promise<BudgetItemView[] | undefined> => {
    if (!template_id) return;
    const rows = await templateItemsOrm
      .joinMany(['Categories', 'RecordTypes'])
      .where('budget_template_id', template_id)
      .getAll();
    return rows.map((row) => ({
      ...flattenBudget(row as never),
      budget_template_item_id: row.id,
    }));
  };

  const sumByEffect = async (group_id: number, effect: string): Promise<number> => {
    const rows = await budgetsOrm
      .join('RecordTypes')
      .where('group_id', group_id)
      .where('RecordTypes.effect', effect)
      .getAll();
    return rows.reduce((total, row) => total + (row.amount || 0), 0);
  };

  const fetchTotalExpenses = async (group_id: number | undefined): Promise<number | null> => {
    if (!group_id) return null;
    return sumByEffect(group_id, '-');
  };

  const fetchTotalIncomes = async (group_id: number | null): Promise<number | null> => {
    if (!group_id) return null;
    return sumByEffect(group_id, '+');
  };

  const fetchTotalTransfers = async (group_id: number | null): Promise<number | null> => {
    if (!group_id) return null;
    return sumByEffect(group_id, '=');
  };

  const addBudget = async (record: Insertable<Budget>) => budgetsOrm.insert(record);

  const updateBudget = async (id: number, record: Partial<Budget>) => {
    await budgetsOrm.update(id, record);
  };

  const deleteBudget = async (id: number) => budgetsOrm.delete(id);

  const deleteBudgetByGroup = async (group_id: number) => budgetsOrm.deleteWhere('group_id', group_id);

  const getAllResume = async (group_id: number) => {
    const [expensesTotal, incomesTotal, transferTotal] = await Promise.all([
      fetchTotalExpenses(group_id),
      fetchTotalIncomes(group_id),
      fetchTotalTransfers(group_id),
    ]);

    return {
      expensesTotal,
      incomesTotal,
      transferTotal,
      balance: (incomesTotal || 0) - (expensesTotal || 0),
    };
  };

  return {
    fetchBudget,
    fetchBudgetItems,
    fetchBudgetTemplateItems,
    fetchTotalExpenses,
    fetchTotalIncomes,
    fetchTotalTransfers,
    addBudget,
    updateBudget,
    deleteBudget,
    deleteBudgetByGroup,
    getAllResume,
    handler,
  };
};

export const usePaymentMethodsRepository = () => {
  const methodsOrm = useORM('PaymentMethods');
  const handler = useTableRepository('PaymentMethods');

  const fetchPaymentMethods = async (): Promise<PaymentMethodView[]> => {
    const rows = await methodsOrm.join('PaymentTypes').getAll();
    return rows.map((row) => flattenPaymentMethod(row as never));
  };

  const addPaymentMethod = async (method: Insertable<PaymentMethod>) =>
    methodsOrm.insert(method);

  const updatePaymentMethod = async (id: number, method: Partial<PaymentMethod>) => {
    await methodsOrm.update(id, method);
  };

  const deletePaymentMethod = async (id: number) => methodsOrm.delete(id);

  return {
    fetchPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    handler,
  };
};

export type { BudgetTemplateItem, SavingsHistoryEntry };
