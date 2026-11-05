import { useSQLiteContext } from 'expo-sqlite';

import { ORM, useORM } from '@/src/orm';
import { mapDatabaseError } from '@/src/db/errors';
import { withExclusiveTransaction } from '@/src/db/transaction';
import type {
  Insertable,
  Person,
  SharedExpenseParticipant,
  SharedPaymentAllocation,
  UpdateEntity,
} from '@/src/interfaces/schema';
import {
  personInputSchema,
  personUpdateSchema,
  sharedParticipantInputSchema,
} from '@/src/validation/entities';

export type SharedOwnerType = 'fixed' | 'financing' | 'saving';

export type ParticipantDraft = {
  personId: number;
  sharePercent: number;
  notes?: string | null;
};

export const usePeopleRepository = () => {
  const db = useSQLiteContext();
  const peopleOrm = useORM('People');

  const fetchPeople = async (): Promise<Person[]> => {
    try {
      return await peopleOrm.order('name', 'ASC').getAll();
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load people');
    }
  };

  const addPerson = async (input: { name: string; notes?: string | null }) => {
    try {
      const payload = personInputSchema.parse(input);
      return await peopleOrm.insert(payload as Insertable<Person>);
    } catch (error) {
      throw mapDatabaseError(error, 'Could not add person');
    }
  };

  const updatePerson = async (
    id: number,
    input: UpdateEntity<Person>
  ): Promise<void> => {
    try {
      await peopleOrm.update(id, personUpdateSchema.parse(input));
    } catch (error) {
      throw mapDatabaseError(error, 'Could not update person');
    }
  };

  const deletePerson = async (id: number): Promise<void> => {
    try {
      await withExclusiveTransaction(db, async (txn) => {
        const people = new ORM(txn, 'People');
        const participants = new ORM(txn, 'SharedExpenseParticipants');
        const allocations = new ORM(txn, 'SharedPaymentAllocations');
        await participants.deleteWhere('person_id', id);
        await allocations.deleteWhere('person_id', id);
        await people.delete(id);
      });
    } catch (error) {
      throw mapDatabaseError(error, 'Could not delete person');
    }
  };

  return { fetchPeople, addPerson, updatePerson, deletePerson };
};

export const useSharedParticipantsRepository = () => {
  const db = useSQLiteContext();
  const participantsOrm = useORM('SharedExpenseParticipants');

  const fetchFor = async (
    ownerType: SharedOwnerType,
    ownerId: number
  ): Promise<SharedExpenseParticipant[]> => {
    try {
      return await participantsOrm
        .where('owner_type', ownerType)
        .where('owner_id', ownerId)
        .getAll();
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load shared participants');
    }
  };

  const fetchAll = async (
    ownerType?: SharedOwnerType
  ): Promise<SharedExpenseParticipant[]> => {
    try {
      return ownerType
        ? await participantsOrm.where('owner_type', ownerType).getAll()
        : await participantsOrm.getAll();
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load shared participants');
    }
  };

  const replaceFor = async (
    ownerType: SharedOwnerType,
    ownerId: number,
    participants: ParticipantDraft[]
  ): Promise<void> => {
    const unique = new Set(participants.map((participant) => participant.personId));
    if (unique.size !== participants.length) {
      throw new Error('SHARED_PERSON_DUPLICATED');
    }
    const total = participants.reduce(
      (sum, participant) => sum + participant.sharePercent,
      0
    );
    if (total > 100.0001) throw new Error('SHARED_PERCENT_INVALID');

    try {
      await withExclusiveTransaction(db, async (txn) => {
        const orm = new ORM(txn, 'SharedExpenseParticipants');
        const existing = (await orm
          .where('owner_type', ownerType)
          .where('owner_id', ownerId)
          .getAll()) as SharedExpenseParticipant[];
        for (const participant of existing) {
          if (participant.id !== undefined) await orm.delete(participant.id);
        }
        for (const participant of participants) {
          if (participant.sharePercent <= 0) continue;
          await orm.insert(
            sharedParticipantInputSchema.parse({
              owner_type: ownerType,
              owner_id: ownerId,
              person_id: participant.personId,
              share_percent: participant.sharePercent,
              notes: participant.notes ?? null,
            }) as Insertable<SharedExpenseParticipant>
          );
        }
      });
    } catch (error) {
      throw mapDatabaseError(error, 'Could not save shared participants');
    }
  };

  return { fetchFor, fetchAll, replaceFor };
};

export const useSharedLedgerRepository = () => {
  const allocationsOrm = useORM('SharedPaymentAllocations');
  const recordsOrm = useORM('Records');

  const fetchAllocations = async (
    personId?: number
  ): Promise<SharedPaymentAllocation[]> => {
    try {
      const [allocations, records] = await Promise.all([
        personId != null
          ? allocationsOrm.where('person_id', personId).getAll()
          : allocationsOrm.getAll(),
        recordsOrm.getAll(),
      ]);
      const activeRecordIds = new Set(
        records.flatMap((record) => (record.id == null ? [] : [record.id]))
      );
      return (allocations as SharedPaymentAllocation[])
        .filter((allocation) => activeRecordIds.has(allocation.record_id))
        .sort((left, right) => right.date - left.date);
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load shared ledger');
    }
  };

  return { fetchAllocations };
};
