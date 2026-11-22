import { useSQLiteContext } from 'expo-sqlite';
import { z } from 'zod';

import { ORM, useORM } from '@/src/orm';
import { isMonthlyCashRecord } from '@/src/domain/summaries/monthly';
import { hasCreditCardSavingConflict } from '@/src/domain/credits/cards';
import { computeParticipantShares } from '@/src/domain/shared/split';
import {
  anchorMonthForGroupPeriod,
  groupPeriodFromRow,
} from '@/src/domain/groups/period';
import { planCurrentGroup } from '@/src/domain/groups/auto';
import type { GroupPeriodMode } from '@/src/domain/groups/types';
import { mapDatabaseError } from '@/src/db/errors';
import { withExclusiveTransaction } from '@/src/db/transaction';
import {
  clearOwnerParticipants,
  clearRecordAllocations,
  replaceOwnerParticipants,
  syncRecordAllocationsFromShares,
  type ParticipantShareDraft,
} from '@/src/db/shared-ledger';
import {
  insertSavingMovement,
  syncSavingTotals,
} from '@/src/db/repositories/savings';
import {
  groupInputSchema,
  groupUpdateSchema,
  paidCreditInputSchema,
  paidCreditUpdateSchema,
  paymentMethodInputSchema,
  paymentMethodUpdateSchema,
  recordInputSchema,
} from '@/src/validation/entities';
import type { TableName } from '@/src/db/schema';
import type {
  Category,
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
  useChartPreferencesRepository,
} from './chartPreferences';
export type {
  ChartPreferencePatch,
  ChartPreferenceSave,
  ChartPreferenceView,
} from './chartPreferences';
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
  'Savings',
  'People',
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
  saving_name: record.Savings?.saving_name,
  paid_by_name: record.People?.name,
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
  const savingsHistoryOrm = useORM('SavingsHistory');
  const financingPaymentsOrm = useORM('FinancingPayments');
  const handler = useTableRepository('Records');

  type SaveRecordInput = {
    record: Insertable<RecordEntry>;
    recordId?: number;
    paidCredit?: Insertable<PaidCredit> | null;
    paidCreditId?: number | null;
    savingId?: number | null;
    participants?: ParticipantShareDraft[];
  };

  const saveRecord = async ({
    record,
    recordId,
    paidCredit,
    paidCreditId,
    savingId,
    participants,
  }: SaveRecordInput): Promise<number> => {
    const creditRecord = recordInputSchema.parse({
      ...record,
      paid_scope: record.paid_scope ?? 'full',
    });
    const creditPayment = paidCredit ? paidCreditInputSchema.parse(paidCredit) : null;

    return withExclusiveTransaction(db, async (txn) => {
      const records = new ORM<'Records'>(txn, 'Records');
      const credits = new ORM<'PaidCredits'>(txn, 'PaidCredits');
      const people = new ORM(txn, 'People');
      let currentPaidCreditId = paidCreditId ?? null;

      if (creditRecord.paid_by_person_id != null) {
        const payer = (await people.getById(
          creditRecord.paid_by_person_id
        )) as { id?: number } | null;
        if (!payer) throw new Error('SHARED_PERSON_NOT_FOUND');
      }

      const effectiveSavingId = savingId ?? creditRecord.saving_id ?? null;
      if (effectiveSavingId != null && creditRecord.payment_method_id != null) {
        const method = await new ORM(txn, 'PaymentMethods').getById(
          creditRecord.payment_method_id
        );
        if (
          hasCreditCardSavingConflict({
            savingId: effectiveSavingId,
            paymentMethod: method,
          })
        ) {
          throw new Error('CREDIT_CARD_SAVING_CONFLICT');
        }
      }

      if (participants !== undefined && !creditRecord.fixed_id) {
        const own = creditRecord.own_amount_cents ?? creditRecord.amount;
        const shared = creditRecord.shared_amount_cents ?? 0;
        const expected = computeParticipantShares(own + shared, participants);
        if (
          expected.exceedsTotal ||
          expected.ownCents !== own ||
          expected.sharedCents !== shared
        ) {
          throw new Error('RECORD_SHARES_MISMATCH');
        }
        if (
          creditRecord.paid_by_person_id != null &&
          !participants.some(
            (participant) =>
              participant.personId === creditRecord.paid_by_person_id
          )
        ) {
          throw new Error('SHARED_PAYER_NOT_PARTICIPANT');
        }
      }

      if (creditPayment && currentPaidCreditId !== null) {
        await credits.update(currentPaidCreditId, creditPayment);
      } else if (creditPayment) {
        currentPaidCreditId = await credits.insert(creditPayment);
      } else if (currentPaidCreditId !== null) {
        await credits.delete(currentPaidCreditId);
        currentPaidCreditId = null;
      }

      const payload = {
        ...creditRecord,
        paid_scope: creditRecord.paid_scope ?? 'full',
        paid_credit_id: currentPaidCreditId,
        saving_id: savingId ?? creditRecord.saving_id ?? null,
      };
      let savedId: number;

      if (recordId !== undefined) {
        await records.update(recordId, payload);
        savedId = recordId;
      } else {
        savedId = await records.insert(payload);
      }

      if (payload.fixed_id) {
        await clearOwnerParticipants(txn, 'record', savedId);
        if (payload.paid_by_person_id != null || payload.paid_scope === 'own') {
          await clearRecordAllocations(txn, savedId, 'fixed');
        } else {
          const fixedParticipants = (await new ORM(txn, 'SharedExpenseParticipants')
            .where('owner_type', 'fixed')
            .where('owner_id', payload.fixed_id)
            .getAll()) as {
              person_id: number;
              share_percent: number;
              share_mode: string;
              share_amount_cents: number | null;
            }[];
          const fixedSplit = computeParticipantShares(
            (payload.own_amount_cents ?? payload.amount) +
              (payload.shared_amount_cents ?? 0),
            fixedParticipants.map((participant) => ({
              personId: participant.person_id,
              shareMode: participant.share_mode as 'percent' | 'amount',
              sharePercent: participant.share_percent,
              shareAmountCents: participant.share_amount_cents,
            }))
          );
          if (
            fixedSplit.exceedsTotal ||
            fixedSplit.ownCents !==
              (payload.own_amount_cents ?? payload.amount) ||
            fixedSplit.sharedCents !== (payload.shared_amount_cents ?? 0)
          ) {
            throw new Error('RECORD_SHARES_MISMATCH');
          }
          await syncRecordAllocationsFromShares({
            txn,
            recordId: savedId,
            ownerType: 'fixed',
            ownerId: payload.fixed_id,
            label: payload.record_name,
            date: payload.date,
            totalCents:
              (payload.own_amount_cents ?? payload.amount) +
              (payload.shared_amount_cents ?? 0),
            participants: fixedParticipants,
          });
        }
      } else {
        await clearRecordAllocations(txn, savedId, 'fixed');
        if (participants !== undefined && !payload.saving_id) {
          await replaceOwnerParticipants(
            txn,
            'record',
            savedId,
            participants
          );
        } else if (payload.saving_id) {
          await clearOwnerParticipants(txn, 'record', savedId);
        }
      }

      if (savingId) {
        const saving = (await new ORM(txn, 'Savings').getById(
          savingId
        )) as Saving | null;
        if (!saving) throw new Error('SAVING_NOT_FOUND');
        await insertSavingMovement(
          txn,
          {
            savings_id: savingId,
            kind: 'withdrawal',
            amount_cents: payload.amount,
            change_date: payload.date,
            group_id: payload.group_id,
            record_type_id: payload.record_type_id,
          },
          saving,
          savedId
        );
        await syncSavingTotals(txn, savingId);
      }

      return savedId;
    });
  };

  const deleteRecordWithCredit = async (
    recordId: number,
    paidCreditId?: number | null
  ): Promise<void> => {
    await withExclusiveTransaction(db, async (txn) => {
      const records = new ORM<'Records'>(txn, 'Records');
      const credits = new ORM<'PaidCredits'>(txn, 'PaidCredits');
      const savingsHistory = new ORM<'SavingsHistory'>(txn, 'SavingsHistory');
      const movements = (await savingsHistory
        .where('record_id', recordId)
        .getAll()) as { id?: number; savings_id?: number | null }[];
      for (const movement of movements) {
        if (movement.id !== undefined) {
          await savingsHistory.delete(movement.id);
        }
        if (movement.savings_id != null) {
          await syncSavingTotals(txn, movement.savings_id);
        }
      }
      await clearOwnerParticipants(txn, 'record', recordId);
      await clearRecordAllocations(txn, recordId);
      await records.delete(recordId);
      if (paidCreditId) {
        await credits.delete(paidCreditId);
      }
    });
  };

  /**
   * Tells whether a record is shared from another aggregate. Such records must
   * not be edited as manual shared purchases from Records.
  */
  const getSharingSource = async (
    recordId: number
  ): Promise<'fixed' | 'financing' | 'saving' | null> => {
    const record = await recordsOrm.getById(recordId);
    if (!record) return null;
    if (record.fixed_id != null) return 'fixed';
    if (record.saving_id != null) return 'saving';
    const savingMovement = await savingsHistoryOrm
      .where('record_id', recordId)
      .first();
    if (savingMovement) return 'saving';
    const financingPayment = await financingPaymentsOrm
      .where('record_id', recordId)
      .first();
    if (financingPayment) return 'financing';
    return null;
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

  /**
   * Returns the minimal data needed to detect whether a fixed transaction was
   * already recorded in another group. Used by pending fixed deduplication.
   */
  const fetchFixedRecords = async (
    fixedIds: number[]
  ): Promise<Pick<RecordEntry, 'id' | 'fixed_id' | 'date' | 'group_id'>[]> => {
    if (fixedIds.length === 0) return [];
    const rows = await recordsOrm
      .where('fixed_id', fixedIds, 'IN')
      .getAll();
    return rows as Pick<RecordEntry, 'id' | 'fixed_id' | 'date' | 'group_id'>[];
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

    const cashRecords = records
      .filter(isMonthlyCashRecord)
      .filter((record) => record.paid_by_person_id == null);
    const recordsOwnTotal = cashRecords.reduce(
      (total, record) => total + (record.own_amount_cents ?? record.amount ?? 0),
      0
    );
    const recordsSharedTotal = cashRecords.reduce(
      (total, record) =>
        total +
        (record.paid_scope === 'own' ? 0 : (record.shared_amount_cents ?? 0)),
      0
    );

    return {
      recordsTotal: recordsOwnTotal + recordsSharedTotal,
      recordsOwnTotal,
      recordsSharedTotal,
      recordsCombinedTotal: recordsOwnTotal + recordsSharedTotal,
      paymentsTotal: payments.reduce((total, payment) => total + (payment.amount || 0), 0),
    };
  };

  const sumByEffect = async (group_id: number, effect: string): Promise<number> => {
    const rows = await recordsOrm
      .join('RecordTypes')
      .where('group_id', group_id)
      .where('RecordTypes.effect', effect)
      .getAll();
    return rows.reduce(
      (total, record) =>
        isMonthlyCashRecord(record) ? total + (record.amount || 0) : total,
      0
    );
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
    await withExclusiveTransaction(db, async (txn) => {
      const records = new ORM(txn, 'Records');
      const rows = await records.where('group_id', group_id).getAll();
      for (const row of rows) {
        if (row.id === undefined) continue;
        await clearOwnerParticipants(txn, 'record', row.id);
        await clearRecordAllocations(txn, row.id);
        await records.delete(row.id);
      }
      await new ORM(txn, 'PaidCredits').deleteWhere('group_id', group_id);
      await new ORM(txn, 'PersonSettlements').deleteWhere('group_id', group_id);
    });
  };

  return {
    fetchRecords,
    fetchRecordsPage,
    countRecords,
    fetchRecordsWithMultipleWhere,
    fetchFixedRecords,
    fetchCredits,
    fetchPaidCredits,
    fetchPaidCreditsByGroup,
    fetchCreditPeriodTotals,
    fetchTotalIncomes,
    fetchTotalExpenses,
    saveRecord,
    getSharingSource,
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

export type EnsureCurrentGroupInput = {
  mode: GroupPeriodMode;
  startDay?: number | null;
  cutoffDay?: number | null;
  name: string;
  goal: number;
  now?: number;
};

export const useGroupsRepository = () => {
  const db = useSQLiteContext();
  const groupsOrm = useORM('Groups');

  const fetchGroups = async (): Promise<Group[]> => groupsOrm.getAll();

  const fetchGroupsIncludingDeleted = async (): Promise<Group[]> =>
    groupsOrm.getAll({ includeDeleted: true });

  const fetchGroupsByYear = async (year: string | number): Promise<Group[]> => {
    const numericYear = Number(year);
    const yearStart = new Date(numericYear, 0, 1).getTime();
    const yearEnd = new Date(
      numericYear,
      11,
      31,
      23,
      59,
      59,
      999
    ).getTime();
    const groups = await groupsOrm.getAll();
    return groups.filter((group) => {
      const period = groupPeriodFromRow(group);
      return period.start <= yearEnd && period.end >= yearStart;
    });
  };

  const fetchGroupsById = async (id: number): Promise<Group | null> =>
    groupsOrm.where('id', id).first();

  const fetchLastGroup = async (): Promise<Group | null> =>
    groupsOrm.order('id', 'DESC').first();

  /**
   * Creates the recurring group for the period that contains `now`, but only
   * when no group (active or soft-deleted) already covers that date. This makes
   * the automation idempotent and respects a group the user deleted on purpose.
   */
  const ensureCurrentGroup = async (
    input: EnsureCurrentGroupInput
  ): Promise<Group | null> => {
    const now = input.now ?? Date.now();

    try {
      return await withExclusiveTransaction(db, async (txn) => {
        const groups = new ORM(txn, 'Groups');
        const all = (await groups.getAll({
          includeDeleted: true,
        })) as Group[];
        const target = planCurrentGroup({
          mode: input.mode,
          startDay: input.startDay,
          cutoffDay: input.cutoffDay,
          now,
          groups: all,
        });
        if (!target) return null;

        const anchor = anchorMonthForGroupPeriod(target, input.mode);
        const id = await groups.insert(
          groupInputSchema.parse({
            group_name: input.name,
            goal: input.goal,
            year: anchor.year,
            month: anchor.month,
            period_start: target.start,
            period_end: target.end,
            period_mode: input.mode,
          })
        );
        return (await groups.getById(id)) as Group | null;
      });
    } catch (error) {
      throw mapDatabaseError(error, 'Could not ensure current group');
    }
  };

  const addGroup = async (newGroup: Insertable<Group>) => {
    return groupsOrm.insert(groupInputSchema.parse(newGroup));
  };

  const deleteGroup = async (id: number) => {
    await withExclusiveTransaction(db, async (txn) => {
      const records = new ORM(txn, 'Records');
      const rows = await records.where('group_id', id).getAll();
      for (const row of rows) {
        if (row.id === undefined) continue;
        await clearOwnerParticipants(txn, 'record', row.id);
        await clearRecordAllocations(txn, row.id);
        await records.delete(row.id);
      }
      await new ORM(txn, 'PaidCredits').deleteWhere('group_id', id);
      await new ORM(txn, 'PersonSettlements').deleteWhere('group_id', id);
      const closings = (await new ORM(txn, 'GroupClosings')
        .where('group_id', id)
        .getAll()) as { id?: number }[];
      for (const closing of closings) {
        if (closing.id !== undefined) {
          await new ORM(txn, 'GroupClosingLines').deleteWhere(
            'closing_id',
            closing.id
          );
        }
      }
      await new ORM(txn, 'GroupClosings').deleteWhere('group_id', id);
      await new ORM(txn, 'Groups').delete(id);
    });
  };

  const editGroup = async (id: number, updatedGroup: Partial<Group>) => {
    await groupsOrm.update(id, groupUpdateSchema.parse(updatedGroup));
  };

  return {
    addGroup,
    deleteGroup,
    editGroup,
    ensureCurrentGroup,
    fetchGroups,
    fetchGroupsIncludingDeleted,
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

  const addPaymentMethod = async (
    method: z.infer<typeof paymentMethodInputSchema>
  ) => {
    const parsed = paymentMethodInputSchema.parse(method);
    return methodsOrm.insert({
      is_credit_card: 0,
      visual_kind: 'other',
      ...parsed,
    } as Insertable<PaymentMethod>);
  };

  const updatePaymentMethod = async (
    id: number,
    method: z.infer<typeof paymentMethodUpdateSchema>
  ) => {
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

export { useFinancingsRepository } from './financings';
export { useGroupClosingsRepository } from './closings';
export type {
  ClosingInput,
  ClosingLineInput,
  ClosingSummary,
  DuplicateClosingOverrides,
} from './closings';
export { useSavingsRepository } from './savings';
export type {
  SavingInput,
  SavingMovementInput,
  SavingParticipantDraft,
  SavingParticipantTotal,
  SavingRecordInput,
  SavingRecordMode,
  SavingView,
} from './savings';

export type { SavingsHistoryEntry };

export {
  usePeopleRepository,
  usePersonSettlementsRepository,
  useSharedLedgerRepository,
  useSharedParticipantsRepository,
} from './people';
export type {
  ParticipantDraft,
  PersonStatement,
  PersonStatementsResult,
  SharedOwnerType,
} from './people';

export { useShoppingListsRepository } from './shoppingLists';
export type {
  ShoppingListFilter,
  ShoppingListItemView,
  ShoppingListView,
  ShoppingPurchaseInput,
  ShoppingPurchaseMode,
  ShoppingRecordOption,
  ShoppingListsRepository,
} from './shoppingLists';

export {
  useRecordSourcesRepository,
  resolveRecordSources,
  recordSourceRoute,
} from './recordSources';
export type {
  RecordSource,
  RecordSourcesRepository,
} from './recordSources';

