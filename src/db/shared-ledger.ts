import { ORM } from '@/src/orm';
import {
  computeParticipantShares,
  splitSharedAmount,
  type ShareMode,
} from '@/src/domain/shared/split';
import type {
  Insertable,
  SharedExpenseParticipant,
  SharedPaymentAllocation,
} from '@/src/interfaces/schema';
import {
  sharedAllocationInputSchema,
  sharedParticipantInputSchema,
} from '@/src/validation/entities';

import type { TransactionDatabase } from './transaction';

export type SharedOwnerType = 'fixed' | 'financing' | 'saving' | 'record';
export type AllocationOwnerType = 'fixed' | 'financing';

export type ParticipantShareDraft = {
  personId: number;
  sharePercent: number;
  shareMode?: ShareMode;
  shareAmountCents?: number | null;
  notes?: string | null;
};

type ParticipantShare = Pick<
  SharedExpenseParticipant,
  'person_id' | 'share_percent'
>;

type AllocationParticipant = Pick<
  SharedExpenseParticipant,
  'person_id' | 'share_percent' | 'share_mode' | 'share_amount_cents'
>;

const participantsOrm = (txn: TransactionDatabase) =>
  new ORM(txn, 'SharedExpenseParticipants');

const allocationsOrm = (txn: TransactionDatabase) =>
  new ORM(txn, 'SharedPaymentAllocations');

const deleteAllocations = async (
  txn: TransactionDatabase,
  where: (orm: ReturnType<typeof allocationsOrm>) => Promise<SharedPaymentAllocation[]>
) => {
  const orm = allocationsOrm(txn);
  const rows = await where(orm);
  for (const row of rows) {
    if (row.id !== undefined) await orm.delete(row.id);
  }
};

export const clearRecordAllocations = async (
  txn: TransactionDatabase,
  recordId: number,
  ownerType?: AllocationOwnerType
) => {
  await deleteAllocations(txn, async (orm) => {
    const rows = (await orm.where('record_id', recordId).getAll()) as SharedPaymentAllocation[];
    return ownerType
      ? rows.filter((row) => row.owner_type === ownerType)
      : rows;
  });
};

export const clearFinancingAllocations = async (
  txn: TransactionDatabase,
  financingId: number
) => {
  await deleteAllocations(txn, async (orm) => {
    const rows = (await orm
      .where('owner_type', 'financing')
      .where('owner_id', financingId)
      .getAll()) as SharedPaymentAllocation[];
    return rows;
  });
};

export const clearFinancingPaymentAllocations = async (
  txn: TransactionDatabase,
  financingPaymentId: number
) => {
  await deleteAllocations(txn, async (orm) => {
    const rows = (await orm
      .where('financing_payment_id', financingPaymentId)
      .getAll()) as SharedPaymentAllocation[];
    return rows;
  });
};

const validateParticipants = (participants: ParticipantShareDraft[]) => {
  const unique = new Set(participants.map((participant) => participant.personId));
  if (unique.size !== participants.length) {
    throw new Error('SHARED_PERSON_DUPLICATED');
  }
  const totalPercent = participants
    .filter((participant) => participant.shareMode !== 'amount')
    .reduce((sum, participant) => sum + participant.sharePercent, 0);
  if (totalPercent > 100.0001) throw new Error('SHARED_PERCENT_INVALID');
  if (
    participants.some(
      (participant) =>
        participant.shareMode === 'amount' &&
        (participant.shareAmountCents ?? 0) <= 0
    )
  ) {
    throw new Error('SHARED_AMOUNT_INVALID');
  }
};

/**
 * Replace the participants of any shared owner (`fixed`, `financing`,
 * `saving` or `record`). Runs inside an existing transaction so aggregates can
 * save the owner and its participants atomically.
 */
export const replaceOwnerParticipants = async (
  txn: TransactionDatabase,
  ownerType: SharedOwnerType,
  ownerId: number,
  participants: ParticipantShareDraft[]
) => {
  validateParticipants(participants);
  const orm = participantsOrm(txn);
  const existing = (await orm
    .where('owner_type', ownerType)
    .where('owner_id', ownerId)
    .getAll()) as SharedExpenseParticipant[];
  for (const participant of existing) {
    if (participant.id !== undefined) await orm.delete(participant.id);
  }
  for (const participant of participants) {
    if (
      participant.shareMode !== 'amount' &&
      participant.sharePercent <= 0
    ) {
      continue;
    }
    await orm.insert(
      sharedParticipantInputSchema.parse({
        owner_type: ownerType,
        owner_id: ownerId,
        person_id: participant.personId,
        share_percent: participant.sharePercent,
        share_mode: participant.shareMode ?? 'percent',
        share_amount_cents:
          participant.shareMode === 'amount'
            ? participant.shareAmountCents ?? 0
            : null,
        notes: participant.notes ?? null,
      }) as Insertable<SharedExpenseParticipant>
    );
  }
};

export const clearOwnerParticipants = async (
  txn: TransactionDatabase,
  ownerType: SharedOwnerType,
  ownerId: number
) => {
  const orm = participantsOrm(txn);
  const rows = (await orm
    .where('owner_type', ownerType)
    .where('owner_id', ownerId)
    .getAll()) as SharedExpenseParticipant[];
  for (const row of rows) {
    if (row.id !== undefined) await orm.delete(row.id);
  }
};

export const syncRecordAllocations = async ({
  txn,
  recordId,
  ownerType,
  ownerId,
  label,
  date,
  sharedCents,
  participants,
  financingPaymentId = null,
}: {
  txn: TransactionDatabase;
  recordId: number;
  ownerType: AllocationOwnerType;
  ownerId: number;
  label: string;
  date: number;
  sharedCents: number;
  participants: ParticipantShare[];
  financingPaymentId?: number | null;
}) => {
  await clearRecordAllocations(txn, recordId);

  const splits = splitSharedAmount(
    sharedCents,
    participants.map((participant) => ({
      personId: participant.person_id,
      sharePercent: participant.share_percent,
    }))
  );
  if (splits.length === 0) return;

  const orm = allocationsOrm(txn);
  for (const split of splits) {
    const payload = sharedAllocationInputSchema.parse({
      person_id: split.personId,
      owner_type: ownerType,
      owner_id: ownerId,
      record_id: recordId,
      financing_payment_id: financingPaymentId,
      label,
      date,
      amount_cents: split.amountCents,
      share_percent: split.sharePercent,
    });
    await orm.insert(payload as Insertable<SharedPaymentAllocation>);
  }
};

/**
 * Sync allocations from participants that may use percentages or fixed
 * amounts. The owner total is required because amount-based shares are fixed
 * against it.
 */
export const syncRecordAllocationsFromShares = async ({
  txn,
  recordId,
  ownerType,
  ownerId,
  label,
  date,
  totalCents,
  participants,
  financingPaymentId = null,
}: {
  txn: TransactionDatabase;
  recordId: number;
  ownerType: AllocationOwnerType;
  ownerId: number;
  label: string;
  date: number;
  totalCents: number;
  participants: AllocationParticipant[];
  financingPaymentId?: number | null;
}) => {
  await clearRecordAllocations(txn, recordId);

  const split = computeParticipantShares(
    totalCents,
    participants.map((participant) => ({
      personId: participant.person_id,
      shareMode: participant.share_mode as ShareMode,
      sharePercent: participant.share_percent,
      shareAmountCents: participant.share_amount_cents ?? null,
    }))
  );
  if (split.participants.length === 0) return;

  const orm = allocationsOrm(txn);
  for (const participant of split.participants) {
    const payload = sharedAllocationInputSchema.parse({
      person_id: participant.personId,
      owner_type: ownerType,
      owner_id: ownerId,
      record_id: recordId,
      financing_payment_id: financingPaymentId,
      label,
      date,
      amount_cents: participant.amountCents,
      share_percent: participant.sharePercent,
    });
    await orm.insert(payload as Insertable<SharedPaymentAllocation>);
  }
};
