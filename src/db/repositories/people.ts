import { useSQLiteContext } from 'expo-sqlite';

import { ORM, useORM } from '@/src/orm';
import { withExclusiveTransaction } from '@/src/db/transaction';
import type {
  Insertable,
  Person,
  SharedExpenseParticipant,
  UpdateEntity,
} from '@/src/interfaces/schema';
import {
  personInputSchema,
  personUpdateSchema,
  sharedParticipantInputSchema,
} from '@/src/validation/entities';

export type SharedOwnerType = 'fixed' | 'financing';

export type ParticipantDraft = {
  personId: number;
  sharePercent: number;
  notes?: string | null;
};

export const usePeopleRepository = () => {
  const db = useSQLiteContext();
  const peopleOrm = useORM('People');
  const participantsOrm = useORM('SharedExpenseParticipants');

  const fetchPeople = async (): Promise<Person[]> =>
    peopleOrm.order('name', 'ASC').getAll();

  const addPerson = async (input: { name: string; notes?: string | null }) => {
    const payload = personInputSchema.parse(input);
    return peopleOrm.insert(payload as Insertable<Person>);
  };

  const updatePerson = async (
    id: number,
    input: UpdateEntity<Person>
  ): Promise<void> => {
    await peopleOrm.update(id, personUpdateSchema.parse(input));
  };

  const deletePerson = async (id: number): Promise<void> => {
    await withExclusiveTransaction(db, async (txn) => {
      const people = new ORM(txn, 'People');
      const participants = new ORM(txn, 'SharedExpenseParticipants');
      await participants.deleteWhere('person_id', id);
      await people.delete(id);
    });
  };

  return { fetchPeople, addPerson, updatePerson, deletePerson };
};

export const useSharedParticipantsRepository = () => {
  const db = useSQLiteContext();
  const participantsOrm = useORM('SharedExpenseParticipants');

  const fetchFor = async (
    ownerType: SharedOwnerType,
    ownerId: number
  ): Promise<SharedExpenseParticipant[]> =>
    participantsOrm
      .where('owner_type', ownerType)
      .where('owner_id', ownerId)
      .getAll();

  const fetchAll = async (
    ownerType?: SharedOwnerType
  ): Promise<SharedExpenseParticipant[]> =>
    ownerType
      ? participantsOrm.where('owner_type', ownerType).getAll()
      : participantsOrm.getAll();

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
  };

  return { fetchFor, fetchAll, replaceFor };
};
