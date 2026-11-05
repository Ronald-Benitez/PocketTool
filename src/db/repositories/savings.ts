import { useSQLiteContext } from 'expo-sqlite';
import { z } from 'zod';

import { ORM, useORM } from '@/src/orm';
import { withExclusiveTransaction } from '@/src/db/transaction';
import { mapDatabaseError } from '@/src/db/errors';
import {
  computeSavingSnapshot,
  contributionActualCents,
} from '@/src/domain/savings/balances';
import { buildSavingChart } from '@/src/domain/savings/charts';
import {
  computeContributionSummary,
  suggestedContributionCents,
} from '@/src/domain/savings/contributions';
import {
  averageMonthlyContributions,
  computeGoalProgress,
} from '@/src/domain/savings/goals';
import { validateSavingRecordMatch } from '@/src/domain/savings/movements';
import type {
  SavingChartPoint,
  SavingContributionSummary,
  SavingGoalProgress,
  SavingMovementLike,
  SavingParticipantLike,
  SavingSnapshot,
} from '@/src/domain/savings/types';
import type {
  FinancingPayment,
  Insertable,
  RecordEntry,
  RecordType,
  Saving,
  SavingsHistoryEntry,
  SavingsSetting,
  SharedExpenseParticipant,
  VehicleExpenseLink,
} from '@/src/interfaces/schema';
import {
  recordInputSchema,
  savingInputSchema,
  savingMovementInputSchema,
  savingUpdateSchema,
  savingsSettingsInputSchema,
  sharedParticipantInputSchema,
} from '@/src/validation/entities';

export type SavingRecordMode = 'create' | 'link' | 'none';

export type SavingRecordInput = {
  linkMode: SavingRecordMode;
  recordId?: number | null;
  groupId?: number | null;
  categoryId?: number | null;
  paymentMethodId?: number | null;
  recordTypeId?: number | null;
};

export type SavingParticipantDraft = {
  personId: number;
  sharePercent: number;
  notes?: string | null;
};

export type SavingInput = z.infer<typeof savingInputSchema> & {
  id?: number;
  participants?: SavingParticipantDraft[];
};

export type SavingMovementInput = z.infer<typeof savingMovementInputSchema> & {
  id?: number;
  record?: SavingRecordInput;
};

export type SavingParticipantTotal = {
  personId: number;
  contributedCents: number;
  withdrawnCents: number;
  balanceCents: number;
};

export type SavingRecordOption = {
  id: number;
  name: string;
  date: number;
  amount: number;
  categoryId: number | null;
  categoryName: string;
  paymentMethodId: number | null;
  paymentMethodName: string;
  recordTypeId: number | null;
  recordTypeName: string;
};

export type SavingView = Saving & {
  participants: SharedExpenseParticipant[];
  movements: SavingsHistoryEntry[];
  snapshot: SavingSnapshot;
  goal: SavingGoalProgress;
  contribution: SavingContributionSummary;
  chart: SavingChartPoint[];
  baseSuggestedCents: number;
  ownSharePercent: number;
  periodYear: number;
  periodMonth: number;
};

const periodOf = (date: number) => {
  const value = new Date(date);
  return { year: value.getFullYear(), month: value.getMonth() + 1 };
};

const requireRecordFields = async (
  txn: Parameters<typeof withExclusiveTransaction>[0],
  record: SavingRecordInput,
  settings: SavingsSetting | null
) => {
  const groupId = record.groupId;
  const categoryId = record.categoryId ?? settings?.category_id ?? null;
  const paymentMethodId =
    record.paymentMethodId ?? settings?.payment_method_id ?? null;
  const recordTypeId = record.recordTypeId ?? settings?.record_type_id ?? null;
  if (!groupId) throw new Error('GROUP_REQUIRED');
  if (!categoryId) throw new Error('CATEGORY_REQUIRED');
  if (!paymentMethodId) throw new Error('PAYMENT_METHOD_REQUIRED');
  if (!recordTypeId) throw new Error('RECORD_TYPE_REQUIRED');
  return { groupId, categoryId, paymentMethodId, recordTypeId };
};

export const assertRecordAvailable = async (
  txn: Parameters<typeof withExclusiveTransaction>[0],
  recordId: number
) => {
  const savingsMovements = (await new ORM(txn, 'SavingsHistory')
    .where('record_id', recordId)
    .getAll()) as SavingsHistoryEntry[];
  if (savingsMovements.length > 0) throw new Error('RECORD_ALREADY_LINKED');

  const vehicleLinks = (await new ORM(txn, 'VehicleExpenseLinks')
    .where('record_id', recordId)
    .getAll()) as VehicleExpenseLink[];
  if (vehicleLinks.length > 0) throw new Error('RECORD_ALREADY_LINKED');

  const financingPayments = (await new ORM(txn, 'FinancingPayments')
    .where('record_id', recordId)
    .getAll()) as FinancingPayment[];
  if (financingPayments.length > 0) throw new Error('RECORD_ALREADY_LINKED');
};

const replaceParticipants = async (
  txn: Parameters<typeof withExclusiveTransaction>[0],
  savingId: number,
  participants: SavingParticipantDraft[]
) => {
  const orm = new ORM(txn, 'SharedExpenseParticipants');
  const existing = (await orm
    .where('owner_type', 'saving')
    .where('owner_id', savingId)
    .getAll()) as SharedExpenseParticipant[];
  for (const participant of existing) {
    if (participant.id !== undefined) await orm.delete(participant.id);
  }
  for (const participant of participants) {
    if (participant.sharePercent <= 0) continue;
    await orm.insert(
      sharedParticipantInputSchema.parse({
        owner_type: 'saving',
        owner_id: savingId,
        person_id: participant.personId,
        share_percent: participant.sharePercent,
        notes: participant.notes ?? null,
      }) as Insertable<SharedExpenseParticipant>
    );
  }
};

export const insertSavingMovement = async (
  txn: Parameters<typeof withExclusiveTransaction>[0],
  input: SavingMovementInput,
  saving: Saving,
  recordId: number | null
) => {
  const history = new ORM(txn, 'SavingsHistory');
  const amount = Math.max(0, input.amount_cents);
  const previous = saving.amount;
  const next =
    input.kind === 'withdrawal' ? previous - amount : previous + amount;
  if (next < 0) throw new Error('SAVING_INSUFFICIENT_FUNDS');
  const period = periodOf(input.change_date);
  const payload = savingMovementInputSchema.parse({
    ...input,
    amount_cents: amount,
    previous_amount: previous,
    new_amount: next,
    period_year: input.period_year ?? period.year,
    period_month: input.period_month ?? period.month,
    record_id: recordId,
  });
  return history.insert(payload as Insertable<SavingsHistoryEntry>);
};

export const syncSavingTotals = async (
  txn: Parameters<typeof withExclusiveTransaction>[0],
  savingId: number
) => {
  const savings = new ORM(txn, 'Savings');
  const history = new ORM(txn, 'SavingsHistory');
  const participantsOrm = new ORM(txn, 'SharedExpenseParticipants');
  const saving = (await savings.getById(savingId)) as Saving | null;
  if (!saving) throw new Error('SAVING_NOT_FOUND');
  const movements = (await history
    .where('savings_id', savingId)
    .order('change_date', 'ASC')
    .getAll()) as SavingsHistoryEntry[];
  const participants = (await participantsOrm
    .where('owner_type', 'saving')
    .where('owner_id', savingId)
    .getAll()) as SharedExpenseParticipant[];
  const snapshot = computeSavingSnapshot(
    movements,
    participants.map((participant) => ({
      person_id: participant.person_id,
      share_percent: participant.share_percent,
    }))
  );
  const now = Date.now();
  const goalReached =
    saving.target_amount_cents != null &&
    saving.target_amount_cents > 0 &&
    snapshot.totalCents >= saving.target_amount_cents;
  await savings.update(savingId, {
    amount: snapshot.totalCents,
    own_amount_cents: snapshot.ownCents,
    shared_amount_cents: snapshot.sharedCents,
    goal_reached_at:
      goalReached && saving.goal_reached_at == null
        ? now
        : saving.goal_reached_at ?? null,
    goal_alerted_at:
      goalReached && saving.goal_reached_at == null
        ? null
        : saving.goal_alerted_at ?? null,
  });
  return snapshot;
};

export const useSavingsRepository = () => {
  const db = useSQLiteContext();
  const savingsOrm = useORM('Savings');
  const historyOrm = useORM('SavingsHistory');
  const participantsOrm = useORM('SharedExpenseParticipants');
  const settingsOrm = useORM('SavingsSettings');
  const recordsOrm = useORM('Records');

  const fetchSavings = async (options?: {
    status?: 'active' | 'archived' | 'all';
  }): Promise<Saving[]> => {
    try {
      const rows = (await savingsOrm.order('saving_name', 'ASC').getAll()) as Saving[];
      const status = options?.status ?? 'active';
      if (status === 'all') return rows;
      return rows.filter((row) => (row.status ?? 'active') === status);
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load savings');
    }
  };

  const fetchSettings = async (): Promise<SavingsSetting | null> => {
    try {
      return (await settingsOrm
        .where('setting_key', 'savings')
        .first()) as SavingsSetting | null;
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load savings settings');
    }
  };

  const saveSettings = async (
    input: z.infer<typeof savingsSettingsInputSchema>
  ): Promise<void> => {
    try {
      const payload = savingsSettingsInputSchema.parse(input);
      const existing = (await settingsOrm
        .where('setting_key', payload.setting_key)
        .first()) as SavingsSetting | null;
      if (existing?.id) {
        await settingsOrm.update(existing.id, payload);
      } else {
        await settingsOrm.insert(payload as Insertable<SavingsSetting>);
      }
    } catch (error) {
      throw mapDatabaseError(error, 'Could not save savings settings');
    }
  };

  const incomeForGroup = async (groupId?: number | null) => {
    if (!groupId) return 0;
    const rows = (await recordsOrm
      .join('RecordTypes')
      .where('group_id', groupId)
      .getAll()) as (RecordEntry & { RecordTypes?: RecordType | null })[];
    return rows.reduce(
      (total, record) =>
        record.RecordTypes?.effect === '+'
          ? total + (record.own_amount_cents ?? record.amount ?? 0)
          : total,
      0
    );
  };

  const fetchSavingView = async (
    id: number,
    options?: {
      groupId?: number | null;
      periodYear?: number;
      periodMonth?: number;
      scope?: 'own' | 'global';
    }
  ): Promise<SavingView | null> => {
    try {
      const saving = (await savingsOrm.getById(id)) as Saving | null;
      if (!saving) return null;
      const [participants, movements] = await Promise.all([
        participantsOrm
          .where('owner_type', 'saving')
          .where('owner_id', id)
          .getAll() as Promise<SharedExpenseParticipant[]>,
        historyOrm
          .where('savings_id', id)
          .order('change_date', 'ASC')
          .getAll() as Promise<SavingsHistoryEntry[]>,
      ]);
      const participantLikes: SavingParticipantLike[] = participants.map(
        (participant) => ({
          person_id: participant.person_id,
          share_percent: participant.share_percent,
        })
      );
      const snapshot = computeSavingSnapshot(
        movements as SavingMovementLike[],
        participantLikes
      );
      const now = new Date();
      const periodYear = options?.periodYear ?? now.getFullYear();
      const periodMonth = options?.periodMonth ?? now.getMonth() + 1;
      const scope = options?.scope ?? 'own';
      const incomeCents = await incomeForGroup(options?.groupId);
      const expected = suggestedContributionCents({
        rule: saving.contribution_rule,
        percentBps: saving.contribution_percent_bps,
        fixedCents: saving.contribution_amount_cents,
        incomeCents,
      });
      const ownSharePercent = Math.max(
        0,
        Math.min(
          100,
          100 -
            participants.reduce(
              (total, participant) => total + Math.max(0, participant.share_percent),
              0
            )
        )
      );
      const actualCents = contributionActualCents(
        movements as SavingMovementLike[],
        periodYear,
        periodMonth,
        scope
      );
      const contribution = computeContributionSummary({
        rule: saving.contribution_rule,
        percentBps: saving.contribution_percent_bps,
        fixedCents: saving.contribution_amount_cents,
        incomeCents,
        actualCents,
        scope,
        sharePercent: scope === 'own' ? ownSharePercent : 100,
      });
      const actualMonthly = averageMonthlyContributions(
        movements as SavingMovementLike[],
        scope
      );
      const goal = computeGoalProgress({
        saving,
        currentCents: snapshot.totalCents,
        expectedMonthlyCents: expected.suggestedCents,
        actualMonthlyCents: actualMonthly,
      });
      return {
        ...saving,
        participants,
        movements,
        snapshot,
        goal,
        contribution,
        chart: buildSavingChart(
          movements as SavingMovementLike[],
          participantLikes
        ),
        baseSuggestedCents: expected.suggestedCents,
        ownSharePercent,
        periodYear,
        periodMonth,
      };
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load saving');
    }
  };

  const createSaving = async (input: SavingInput): Promise<number> => {
    try {
      const { participants = [], id: _id, ...values } = input;
      const payload = savingInputSchema.parse({
        ...values,
        status: values.status ?? 'active',
        records_mode: values.records_mode ?? 'separate',
        contribution_rule: values.contribution_rule ?? 'none',
        own_amount_cents: values.amount,
        shared_amount_cents: 0,
      });
      return await withExclusiveTransaction(db, async (txn) => {
        const savings = new ORM(txn, 'Savings');
        const savingId = await savings.insert(payload as Insertable<Saving>);
        await replaceParticipants(txn, savingId, participants);
        if (payload.amount > 0) {
          const now = Date.now();
          const period = periodOf(now);
          await new ORM(txn, 'SavingsHistory').insert(
            savingMovementInputSchema.parse({
              savings_id: savingId,
              kind: 'initial',
              amount_cents: payload.amount,
              previous_amount: 0,
              new_amount: payload.amount,
              change_date: now,
              period_year: period.year,
              period_month: period.month,
            }) as Insertable<SavingsHistoryEntry>
          );
        }
        return savingId;
      });
    } catch (error) {
      throw mapDatabaseError(error, 'Could not create saving');
    }
  };

  const updateSaving = async (
    id: number,
    input: Omit<SavingInput, 'id'>
  ): Promise<void> => {
    try {
      const { participants, ...values } = input;
      const parsed = savingUpdateSchema.parse(values);
      await withExclusiveTransaction(db, async (txn) => {
        const savings = new ORM(txn, 'Savings');
        const current = (await savings.getById(id)) as Saving | null;
        if (!current) throw new Error('SAVING_NOT_FOUND');
        await savings.update(id, parsed);
        if (participants) {
          await replaceParticipants(txn, id, participants);
        }
        if (parsed.amount != null && parsed.amount !== current.amount) {
          const amount = Math.abs(parsed.amount - current.amount);
          const kind = parsed.amount > current.amount ? 'deposit' : 'withdrawal';
          await insertSavingMovement(
            txn,
            {
              savings_id: id,
              kind,
              amount_cents: amount,
              change_date: Date.now(),
            },
            current,
            null
          );
        }
        await syncSavingTotals(txn, id);
      });
    } catch (error) {
      throw mapDatabaseError(error, 'Could not update saving');
    }
  };

  const archiveSaving = async (id: number, archived = true) => {
    try {
      await savingsOrm.update(id, {
        status: archived ? 'archived' : 'active',
        archived_at: archived ? Date.now() : null,
      });
    } catch (error) {
      throw mapDatabaseError(error, 'Could not archive saving');
    }
  };

  const deleteSaving = async (id: number) => {
    try {
      await withExclusiveTransaction(db, async (txn) => {
        await new ORM(txn, 'SavingsHistory').deleteWhere('savings_id', id);
        const participants = new ORM(txn, 'SharedExpenseParticipants');
        const existing = (await participants
          .where('owner_type', 'saving')
          .where('owner_id', id)
          .getAll()) as SharedExpenseParticipant[];
        for (const participant of existing) {
          if (participant.id !== undefined) await participants.delete(participant.id);
        }
        await new ORM(txn, 'Savings').delete(id);
      });
    } catch (error) {
      throw mapDatabaseError(error, 'Could not delete saving');
    }
  };

  const addMovement = async (input: SavingMovementInput): Promise<number> => {
    try {
      const { id: _id, record, ...values } = input;
      const savingsId = values.savings_id;
      if (!savingsId) throw new Error('SAVING_NOT_FOUND');
      return await withExclusiveTransaction(db, async (txn) => {
        const savings = new ORM(txn, 'Savings');
        const saving = (await savings.getById(savingsId)) as Saving | null;
        if (!saving) throw new Error('SAVING_NOT_FOUND');
        const settings = (await new ORM(txn, 'SavingsSettings')
          .where('setting_key', 'savings')
          .first()) as SavingsSetting | null;
        let recordId: number | null = null;
        const amount = Math.max(0, values.amount_cents);

        if (record?.linkMode === 'create') {
          const fields = await requireRecordFields(txn, record, settings);
          const payload = recordInputSchema.parse({
            amount,
            own_amount_cents: amount,
            shared_amount_cents: 0,
            record_name: `Saving · ${saving.saving_name}`,
            date: values.change_date,
            record_type_id: fields.recordTypeId,
            group_id: fields.groupId,
            category_id: fields.categoryId,
            payment_method_id: fields.paymentMethodId,
            // A movement-created record is a regular record: it is linked to
            // the movement, not paid with the saving.
            saving_id: null,
          });
          recordId = await new ORM(txn, 'Records').insert(
            payload as Insertable<RecordEntry>
          );
        } else if (record?.linkMode === 'link') {
          if (!record.recordId) throw new Error('RECORD_REQUIRED');
          const linked = (await new ORM(txn, 'Records').getById(
            record.recordId
          )) as RecordEntry | null;
          if (!linked) throw new Error('RECORD_NOT_FOUND');
          await assertRecordAvailable(txn, record.recordId);
          const mismatch = validateSavingRecordMatch({
            recordAmount: linked.amount,
            recordDate: linked.date,
            amount,
            date: values.change_date,
          });
          if (mismatch) throw new Error(mismatch);
          recordId = record.recordId;
        }

        const movementId = await insertSavingMovement(
          txn,
          { ...values, savings_id: savingsId, record_id: recordId },
          saving,
          recordId
        );
        await syncSavingTotals(txn, savingsId);
        return movementId;
      });
    } catch (error) {
      throw mapDatabaseError(error, 'Could not save saving movement');
    }
  };

  const deleteMovement = async (id: number) => {
    try {
      await withExclusiveTransaction(db, async (txn) => {
        const history = new ORM(txn, 'SavingsHistory');
        const movement = (await history.getById(id)) as SavingsHistoryEntry | null;
        if (!movement?.savings_id) return;
        await history.delete(id);
        await syncSavingTotals(txn, movement.savings_id);
      });
    } catch (error) {
      throw mapDatabaseError(error, 'Could not delete saving movement');
    }
  };

  const searchRecords = async ({
    from,
    to,
    search,
  }: {
    from?: number;
    to?: number;
    search?: string;
  }): Promise<SavingRecordOption[]> => {
    try {
      const [movements, vehicleLinks, financingPayments] = await Promise.all([
        historyOrm.getAll() as Promise<SavingsHistoryEntry[]>,
        new ORM(db, 'VehicleExpenseLinks').getAll() as Promise<VehicleExpenseLink[]>,
        new ORM(db, 'FinancingPayments').getAll() as Promise<FinancingPayment[]>,
      ]);
      const linked = new Set<number>();
      movements.forEach((movement) => {
        if (movement.record_id != null) linked.add(movement.record_id);
      });
      vehicleLinks.forEach((link) => {
        if (link.record_id != null) linked.add(link.record_id);
      });
      financingPayments.forEach((payment) => {
        if (payment.record_id != null) linked.add(payment.record_id);
      });

      let query = recordsOrm.joinMany([
        'Categories',
        'PaymentMethods',
        'RecordTypes',
      ]);
      if (from != null) query = query.where('date', from, '>=');
      if (to != null) query = query.where('date', to, '<=');
      if (search?.trim()) {
        query = query.where('record_name', `%${search.trim()}%`, 'LIKE');
      }
      const rows = (await query.order('date', 'DESC').getAll()) as any[];
      return rows
        .filter((row) => !linked.has(row.id))
        .map((row) => ({
          id: row.id as number,
          name: row.record_name as string,
          date: row.date as number,
          amount: row.amount as number,
          categoryId: row.category_id ?? null,
          categoryName: row.Categories?.category_name ?? '',
          paymentMethodId: row.payment_method_id ?? null,
          paymentMethodName: row.PaymentMethods?.method_name ?? '',
          recordTypeId: row.record_type_id ?? null,
          recordTypeName: row.RecordTypes?.type_name ?? '',
        }));
    } catch (error) {
      throw mapDatabaseError(error, 'Could not search records for savings');
    }
  };

  const fetchParticipantTotals = async (): Promise<SavingParticipantTotal[]> => {
    try {
      const movements = (await historyOrm.getAll()) as SavingsHistoryEntry[];
      const totals = new Map<number, SavingParticipantTotal>();
      movements.forEach((movement) => {
        if (movement.person_id == null) return;
        const current = totals.get(movement.person_id) ?? {
          personId: movement.person_id,
          contributedCents: 0,
          withdrawnCents: 0,
          balanceCents: 0,
        };
        const amount = Math.max(0, movement.amount_cents ?? 0);
        if (movement.kind === 'initial' || movement.kind === 'deposit') {
          current.contributedCents += amount;
          current.balanceCents += amount;
        } else if (movement.kind === 'withdrawal') {
          current.withdrawnCents += amount;
          current.balanceCents -= amount;
        } else if (movement.kind === 'interest') {
          current.balanceCents += amount;
        }
        totals.set(movement.person_id, current);
      });
      return [...totals.values()].sort((a, b) => b.balanceCents - a.balanceCents);
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load saving contributions');
    }
  };

  return {
    fetchSavings,
    fetchSavingView,
    createSaving,
    updateSaving,
    archiveSaving,
    deleteSaving,
    addMovement,
    deleteMovement,
    searchRecords,
    fetchParticipantTotals,
    fetchSettings,
    saveSettings,
  };
};
