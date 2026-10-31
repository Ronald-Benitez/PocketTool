import { useSQLiteContext } from 'expo-sqlite';

import { ORM, useORM } from '@/src/orm';
import { withExclusiveTransaction } from '@/src/db/transaction';
import {
  groupInputSchema,
  groupUpdateSchema,
  paidCreditInputSchema,
  paidCreditUpdateSchema,
  paymentMethodInputSchema,
  paymentMethodUpdateSchema,
  recordInputSchema,
  savingInputSchema,
  savingUpdateSchema,
} from '@/src/validation/entities';
import type { TableName } from '@/src/db/schema';
import type {
  Category,
  Cents,
  FixedRecordWithRelations,
  FixedView,
  Group,
  Insertable,
  PaidCredit,
  PaymentMethod,
  PaymentMethodView,
  RecordEntry,
  RecordView,
  RecordWithRelations,
  Saving,
  SavingsHistoryEntry,
  SavingsHistoryWithRelations,
  UpdateEntity,
} from '@/src/interfaces/schema';

export {
  useBudgetPlansRepository,
  useBudgetTemplatesRepository,
} from './budgets';
export {
  useVehiclesRepository,
  useVehicleFuelRepository,
  useVehicleMaintenanceRepository,
  useVehicleRemindersRepository,
  useVehicleSettingsRepository,
  useVehicleExpenseLinksRepository,
} from './vehicle';
export type {
  VehicleEntryFinanceInput,
  VehicleExpenseOption,
  VehicleFuelEntryView,
  VehicleLinkMode,
  VehicleMaintenanceItemView,
  VehicleMaintenanceView,
} from './vehicle';
export type {
  BudgetLineInput,
  BudgetPlanInput,
  BudgetTemplateInput,
  BudgetTemplateItemInput,
} from './budgets';
export type { BudgetApplyMode } from '@/src/domain/budgets/types';

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

  const fetchWithWhere = async (column: string, value: string | number | boolean | null) =>
    orm.where(column as never, value).getAll();

  const fetchWithMultipleWhere = async (
    conditions: Record<string, string | number | boolean | null>
  ) => {
    let query = orm;
    for (const [column, value] of Object.entries(conditions)) {
      query = query.where(column as never, value);
    }
    return query.getAll();
  };

  const fetchGroupsByYear = async (year: string | number) =>
    orm.where('year' as never, Number(year)).getAll();

  const fetchById = async (id: number) => orm.getById(id);

  const fetchLast = async () => orm.order('id' as never, 'DESC').first();

  const count = async () => orm.count();

  const existsById = async (id: number) => (await orm.getById(id)) !== null;

  const add = async (values: object) => orm.insert(values as never);

  const edit = async (values: object & { id?: number }) => {
    const { id, ...rest } = values as Record<string, unknown> & { id?: number };
    if (!id) throw new Error(`Cannot update ${table} without an id`);
    await orm.update(id, rest as never);
  };

  const deleteById = async (id: number) => orm.delete(id);

  const deleteWithWhere = async (column: string, value: string | number | boolean | null) =>
    orm.deleteWhere(column, value);

  return {
    fetchAll,
    fetchAllWithJoin,
    fetchWithWhere,
    fetchWithMultipleWhere,
    fetchGroupsByYear,
    fetchById,
    fetchLast,
    count,
    existsById,
    add,
    edit,
    deleteById,
    deleteWithWhere,
    availableColumns: orm.availableColumns,
    availableJoins: orm.availableJoins,
  };
};

export const useRecordsRepository = () => {
  const db = useSQLiteContext();
  const recordsOrm = useORM('Records');
  const paidCreditsOrm = useORM('PaidCredits');
  const handler = useTableRepository('Records');

  type SaveRecordInput = {
    record: Insertable<RecordEntry>;
    recordId?: number;
    paidCredit?: Insertable<PaidCredit> | null;
    paidCreditId?: number | null;
  };

  const saveRecord = async ({
    record,
    recordId,
    paidCredit,
    paidCreditId,
  }: SaveRecordInput): Promise<number> => {
    const creditRecord = recordInputSchema.parse(record);
    const creditPayment = paidCredit ? paidCreditInputSchema.parse(paidCredit) : null;

    return withExclusiveTransaction(db, async (txn) => {
      const records = new ORM<'Records'>(txn, 'Records');
      const credits = new ORM<'PaidCredits'>(txn, 'PaidCredits');
      let currentPaidCreditId = paidCreditId ?? null;

      if (creditPayment && currentPaidCreditId !== null) {
        await credits.update(currentPaidCreditId, creditPayment);
      } else if (creditPayment) {
        currentPaidCreditId = await credits.insert(creditPayment);
      } else if (currentPaidCreditId !== null) {
        await credits.delete(currentPaidCreditId);
        currentPaidCreditId = null;
      }

      const payload = { ...creditRecord, paid_credit_id: currentPaidCreditId };

      if (recordId !== undefined) {
        await records.update(recordId, payload);
        return recordId;
      }

      return records.insert(payload);
    });
  };

  const deleteRecordWithCredit = async (
    recordId: number,
    paidCreditId?: number | null
  ): Promise<void> => {
    await withExclusiveTransaction(db, async (txn) => {
      const records = new ORM<'Records'>(txn, 'Records');
      const credits = new ORM<'PaidCredits'>(txn, 'PaidCredits');
      await records.delete(recordId);
      if (paidCreditId) {
        await credits.delete(paidCreditId);
      }
    });
  };

  const fetchRecords = async (group_id: number | undefined): Promise<RecordView[] | undefined> => {
    if (!group_id) return;
    const rows = await recordsOrm
      .joinMany([...RECORD_JOINS])
      .where('group_id', group_id)
      .order('date', 'ASC')
      .getAll();
    return rows.map(flattenRecord);
  };

  const fetchRecordsPage = async (
    group_id: number,
    limit: number,
    offset = 0
  ): Promise<RecordView[]> => {
    const rows = await recordsOrm
      .joinMany([...RECORD_JOINS])
      .where('group_id', group_id)
      .order('date', 'ASC')
      .limit(limit)
      .offset(offset)
      .getAll();
    return rows.map(flattenRecord);
  };

  const countRecords = async (group_id: number): Promise<number> =>
    recordsOrm.where('group_id', group_id).count();

  const fetchRecordsWithMultipleWhere = async (
    wheres: { column: string; value: string | number | null }[]
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

  const fetchPaidCreditsByGroup = async (group_id: number): Promise<PaidCredit[]> =>
    paidCreditsOrm.where('group_id', group_id).getAll();

  const fetchCreditPeriodTotals = async (
    payment_method_id: number,
    startLimit: number,
    endLimit: number
  ) => {
    const [records, payments] = await Promise.all([
      recordsOrm
        .where('payment_method_id', payment_method_id)
        .where('date', [startLimit, endLimit], 'BETWEEN')
        .getAll(),
      paidCreditsOrm
        .where('payment_method_id', payment_method_id)
        .where('date', [startLimit, endLimit], 'BETWEEN')
        .getAll(),
    ]);

    return {
      recordsTotal: records.reduce((total, record) => total + (record.amount || 0), 0),
      paymentsTotal: payments.reduce((total, payment) => total + (payment.amount || 0), 0),
    };
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

  const deleteRecordByGroup = async (group_id: number) => {
    await recordsOrm.deleteWhere('group_id', group_id);
    await paidCreditsOrm.deleteWhere('group_id', group_id);
  };

  return {
    fetchRecords,
    fetchRecordsPage,
    countRecords,
    fetchRecordsWithMultipleWhere,
    fetchCredits,
    fetchPaidCredits,
    fetchPaidCreditsByGroup,
    fetchCreditPeriodTotals,
    fetchTotalIncomes,
    fetchTotalExpenses,
    saveRecord,
    deleteRecordWithCredit,
    deleteRecordByGroup,
    handler,
  };
};

export const usePaidCreditsRepository = () => {
  const creditsOrm = useORM('PaidCredits');
  const handler = useTableRepository('PaidCredits');

  const fetchById = async (id: number): Promise<PaidCredit | null> =>
    creditsOrm.getById(id);

  const fetchByGroup = async (group_id: number): Promise<PaidCredit[]> =>
    creditsOrm.where('group_id', group_id).getAll();

  const add = async (credit: Insertable<PaidCredit>): Promise<number> =>
    creditsOrm.insert(paidCreditInputSchema.parse(credit));

  const edit = async (id: number, credit: UpdateEntity<PaidCredit>): Promise<void> => {
    await creditsOrm.update(id, paidCreditUpdateSchema.parse(credit));
  };

  const deleteById = async (id: number): Promise<void> => {
    await creditsOrm.delete(id);
  };

  const deleteByGroup = async (group_id: number): Promise<void> => {
    await creditsOrm.deleteWhere('group_id', group_id);
  };

  return {
    fetchById,
    fetchByGroup,
    add,
    edit,
    deleteById,
    deleteByGroup,
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
  const paidCreditsOrm = useORM('PaidCredits');

  const fetchGroups = async (): Promise<Group[]> => groupsOrm.getAll();

  const fetchGroupsByYear = async (year: string | number): Promise<Group[]> =>
    groupsOrm.where('year', Number(year)).getAll();

  const fetchGroupsById = async (id: number): Promise<Group | null> =>
    groupsOrm.where('id', id).first();

  const fetchLastGroup = async (): Promise<Group | null> =>
    groupsOrm.order('id', 'DESC').first();

  const addGroup = async (newGroup: Insertable<Group>) => {
    return groupsOrm.insert(groupInputSchema.parse(newGroup));
  };

  const deleteGroup = async (id: number) => {
    await recordsOrm.deleteWhere('group_id', id);
    await paidCreditsOrm.deleteWhere('group_id', id);
    await groupsOrm.delete(id);
  };

  const editGroup = async (id: number, updatedGroup: Partial<Group>) => {
    await groupsOrm.update(id, groupUpdateSchema.parse(updatedGroup));
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
    return savingsOrm.insert(savingInputSchema.parse({ saving_name: savingName, amount }));
  };

  const updateSavings = async (id: number, savingName: string, amount: Cents) => {
    await savingsOrm.update(id, savingUpdateSchema.parse({ saving_name: savingName, amount }));
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

  const fetchBySavingId = async (savingId: number): Promise<SavingsHistoryEntry[]> =>
    historyOrm
      .where('savings_id', savingId)
      .order('change_date', 'ASC')
      .getAll();

  const addHistory = async (entry: Insertable<SavingsHistoryEntry>): Promise<number> =>
    historyOrm.insert(entry);

  return {
    fetchSavingsHistoryBySavingId,
    fetchBySavingId,
    addHistory,
    deleteSavingsHistory,
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
    methodsOrm.insert(paymentMethodInputSchema.parse(method));

  const updatePaymentMethod = async (id: number, method: Partial<PaymentMethod>) => {
    await methodsOrm.update(id, paymentMethodUpdateSchema.parse(method));
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

export type { SavingsHistoryEntry };
