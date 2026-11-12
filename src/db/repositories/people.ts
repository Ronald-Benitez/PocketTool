import { useSQLiteContext } from 'expo-sqlite';
import { z } from 'zod';

import { ORM, useORM } from '@/src/orm';
import { mapDatabaseError } from '@/src/db/errors';
import { withExclusiveTransaction } from '@/src/db/transaction';
import {
  replaceOwnerParticipants,
  type ParticipantShareDraft,
  type SharedOwnerType,
} from '@/src/db/shared-ledger';
import { splitSharedAmount } from '@/src/domain/shared/split';
import {
  buildFinancingEntry,
  buildPersonStatements,
  buildPurchaseEntries,
  buildSettlementEntry,
  pendingBalancesAsOf,
  type PendingBalance,
  type PersonStatementEntry,
  type PersonStatementSummary,
  type SettlementDirection,
} from '@/src/domain/shared/statement';
import type {
  Insertable,
  Person,
  PersonSettlement,
  SharedExpenseParticipant,
  SharedPaymentAllocation,
  UpdateEntity,
} from '@/src/interfaces/schema';
import {
  personInputSchema,
  personSettlementInputSchema,
  personUpdateSchema,
} from '@/src/validation/entities';

export type { SharedOwnerType };
export type { ParticipantShareDraft as ParticipantDraft };

type PersonSettlementInput = z.infer<typeof personSettlementInputSchema>;

export type PersonStatement = {
  summary: PersonStatementSummary;
  entries: PersonStatementEntry[];
};

export type PersonStatementsResult = {
  statements: Map<number, PersonStatement>;
  entries: PersonStatementEntry[];
};

const isSettlementDirection = (value: string): value is SettlementDirection =>
  value === 'i_paid_them' || value === 'they_paid_me';

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
        const settlements = new ORM(txn, 'PersonSettlements');
        await participants.deleteWhere('person_id', id);
        await allocations.deleteWhere('person_id', id);
        await settlements.deleteWhere('person_id', id);
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
    participants: ParticipantShareDraft[]
  ): Promise<void> => {
    try {
      await withExclusiveTransaction(db, async (txn) => {
        await replaceOwnerParticipants(txn, ownerType, ownerId, participants);
      });
    } catch (error) {
      throw mapDatabaseError(error, 'Could not save shared participants');
    }
  };

  return { fetchFor, fetchAll, replaceFor };
};

export const useSharedLedgerRepository = () => {
  const recordsOrm = useORM('Records');
  const participantsOrm = useORM('SharedExpenseParticipants');
  const allocationsOrm = useORM('SharedPaymentAllocations');
  const settlementsOrm = useORM('PersonSettlements');
  const peopleOrm = useORM('People');

  const fetchStatements = async (): Promise<PersonStatementsResult> => {
    try {
      const [records, participants, allocations, settlements, people] =
        await Promise.all([
          recordsOrm.getAll(),
          participantsOrm.getAll(),
          allocationsOrm.getAll(),
          settlementsOrm.getAll(),
          peopleOrm.getAll(),
        ]);

      const peopleById = new Map(
        (people as Person[]).flatMap((person) =>
          person.id === undefined ? [] : [[person.id, person] as const]
        )
      );
      const recordsById = new Map(
        records.flatMap((record) =>
          record.id === undefined ? [] : [[record.id, record] as const]
        )
      );

      const recordParticipants = new Map<number, SharedExpenseParticipant[]>();
      const fixedParticipants = new Map<number, SharedExpenseParticipant[]>();
      (participants as SharedExpenseParticipant[]).forEach((participant) => {
        const target =
          participant.owner_type === 'record'
            ? recordParticipants
            : participant.owner_type === 'fixed'
              ? fixedParticipants
              : null;
        if (!target) return;
        const current = target.get(participant.owner_id) ?? [];
        current.push(participant);
        target.set(participant.owner_id, current);
      });

      const entries: PersonStatementEntry[] = [];

      const addPurchaseEntries = (
        record: (typeof records)[number],
        rows: SharedExpenseParticipant[],
        source: 'record' | 'fixed',
        ownerId: number
      ) => {
        if (record.id === undefined) return;
        const own = record.own_amount_cents ?? record.amount ?? 0;
        const shared = record.shared_amount_cents ?? 0;
        if (shared <= 0 || rows.length === 0) return;
        const splits = splitSharedAmount(
          shared,
          rows.map((row) => ({
            personId: row.person_id,
            sharePercent: row.share_percent,
          }))
        );
        const payerId = record.paid_by_person_id ?? null;
        const splitRows = splits.map((split) => ({
          personId: split.personId,
          sharePercent: split.sharePercent,
          shareCents: split.amountCents,
        }));
        const builtEntries = buildPurchaseEntries(
          {
            key: `${source}-${record.id}`,
            source,
            ownerId,
            recordId: record.id as number,
            groupId: record.group_id ?? null,
            label: record.record_name,
            date: record.date,
            totalCents: own + shared,
            ownCents: own,
            sharedCents: shared,
            paidByPersonId: payerId,
            paidScope: record.paid_scope === 'own' ? 'own' : 'full',
          },
          splitRows
        );
        builtEntries.forEach((entry) => {
          if (peopleById.has(entry.personId)) entries.push(entry);
        });
      };

      (records as (typeof records)[number][]).forEach((record) => {
        if (record.id === undefined) return;
        if (record.fixed_id != null) {
          const rows = fixedParticipants.get(record.fixed_id) ?? [];
          addPurchaseEntries(record, rows, 'fixed', record.fixed_id);
          return;
        }
        if (record.saving_id != null) return;
        const rows = recordParticipants.get(record.id) ?? [];
        addPurchaseEntries(record, rows, 'record', record.id);
      });

      (allocations as SharedPaymentAllocation[]).forEach((allocation) => {
        if (allocation.owner_type !== 'financing') return;
        if (!recordsById.has(allocation.record_id)) return;
        if (!peopleById.has(allocation.person_id)) return;
        entries.push(
          buildFinancingEntry({
            key: `financing-${allocation.id ?? allocation.record_id}-${allocation.person_id}`,
            personId: allocation.person_id,
            ownerId: allocation.owner_id,
            recordId: allocation.record_id,
            label: allocation.label,
            date: allocation.date,
            amountCents: allocation.amount_cents,
            sharePercent: allocation.share_percent,
          })
        );
      });

      (settlements as PersonSettlement[]).forEach((settlement) => {
        if (settlement.id === undefined) return;
        if (!peopleById.has(settlement.person_id)) return;
        if (!isSettlementDirection(settlement.direction)) return;
        entries.push(
          buildSettlementEntry({
            key: `settlement-${settlement.id}`,
            personId: settlement.person_id,
            groupId: settlement.group_id ?? null,
            date: settlement.date,
            amountCents: settlement.amount_cents,
            direction: settlement.direction,
            notes: settlement.notes ?? null,
          })
        );
      });

      return {
        statements: buildPersonStatements(entries) as Map<number, PersonStatement>,
        entries,
      };
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load shared ledger');
    }
  };

  const fetchPendingBalances = async (
    asOfDate: number
  ): Promise<PendingBalance[]> => {
    const { entries } = await fetchStatements();
    return pendingBalancesAsOf(entries, asOfDate);
  };

  return { fetchStatements, fetchPendingBalances };
};

export const usePersonSettlementsRepository = () => {
  const db = useSQLiteContext();
  const settlementsOrm = useORM('PersonSettlements');

  const fetchAll = async (): Promise<PersonSettlement[]> => {
    try {
      return await settlementsOrm.order('date', 'DESC').getAll();
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load settlements');
    }
  };

  const fetchByPerson = async (personId: number): Promise<PersonSettlement[]> => {
    try {
      return await settlementsOrm
        .where('person_id', personId)
        .order('date', 'DESC')
        .getAll();
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load settlements');
    }
  };

  const fetchByGroup = async (groupId: number): Promise<PersonSettlement[]> => {
    try {
      return await settlementsOrm
        .where('group_id', groupId)
        .order('date', 'DESC')
        .getAll();
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load settlements');
    }
  };

  const add = async (input: PersonSettlementInput): Promise<number> => {
    try {
      const payload = personSettlementInputSchema.parse(input);
      return await settlementsOrm.insert(
        payload as Insertable<PersonSettlement>
      );
    } catch (error) {
      throw mapDatabaseError(error, 'Could not save settlement');
    }
  };

  const addMany = async (inputs: PersonSettlementInput[]): Promise<void> => {
    if (inputs.length === 0) return;
    try {
      await withExclusiveTransaction(db, async (txn) => {
        const orm = new ORM(txn, 'PersonSettlements');
        for (const input of inputs) {
          const payload = personSettlementInputSchema.parse(input);
          await orm.insert(payload as Insertable<PersonSettlement>);
        }
      });
    } catch (error) {
      throw mapDatabaseError(error, 'Could not save settlements');
    }
  };

  const deleteById = async (id: number): Promise<void> => {
    try {
      await settlementsOrm.delete(id);
    } catch (error) {
      throw mapDatabaseError(error, 'Could not delete settlement');
    }
  };

  return { fetchAll, fetchByPerson, fetchByGroup, add, addMany, deleteById };
};
