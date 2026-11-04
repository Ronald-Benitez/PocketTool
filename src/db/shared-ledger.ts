import { ORM } from '@/src/orm';
import { splitSharedAmount } from '@/src/domain/shared/split';
import type {
  Insertable,
  SharedExpenseParticipant,
  SharedPaymentAllocation,
} from '@/src/interfaces/schema';
import { sharedAllocationInputSchema } from '@/src/validation/entities';

import type { TransactionDatabase } from './transaction';

export type SharedOwnerType = 'fixed' | 'financing';

type ParticipantShare = Pick<
  SharedExpenseParticipant,
  'person_id' | 'share_percent'
>;

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
  ownerType?: SharedOwnerType
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
  ownerType: SharedOwnerType;
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
