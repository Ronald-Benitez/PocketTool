import { useSQLiteContext } from 'expo-sqlite';
import { z } from 'zod';

import { ORM, useORM } from '@/src/orm';
import { withExclusiveTransaction } from '@/src/db/transaction';
import { mapDatabaseError } from '@/src/db/errors';
import {
  groupClosingInputSchema,
  groupClosingLineInputSchema,
} from '@/src/validation/entities';
import {
  calculateClosingTotals,
  validateClosing,
} from '@/src/domain/closing/calculator';
import {
  endOfLocalDay,
  isClosingEditable,
  startOfLocalDay,
} from '@/src/domain/closing/period';
import type {
  ClosingLine,
  ClosingStatus,
  ClosingValidationCode,
} from '@/src/domain/closing/types';
import type {
  GroupClosing,
  GroupClosingLine,
  GroupClosingView,
  Insertable,
} from '@/src/interfaces/schema';

export type ClosingLineInput = z.infer<typeof groupClosingLineInputSchema>;

export type ClosingInput = {
  group_id: number;
  close_name: string;
  close_date: number;
  period_start: number;
  period_end: number;
  editable_until: number;
  status?: ClosingStatus;
  notes?: string | null;
  lines: ClosingLineInput[];
};

export type ClosingSummary = GroupClosing & {
  group_name?: string | null;
};

export type DuplicateClosingOverrides = {
  close_name?: string;
  close_date?: number;
  period_start?: number;
  period_end?: number;
  editable_until?: number;
};

const lineToDomain = (line: GroupClosingLine): ClosingLine => ({
  id: line.id,
  section: line.section as ClosingLine['section'],
  kind: line.kind as ClosingLine['kind'],
  label: line.label,
  operation: line.operation as ClosingLine['operation'],
  direction: line.direction as ClosingLine['direction'],
  amountCents: line.amount_cents,
  referenceCents: line.reference_cents ?? null,
  reason: line.reason ?? null,
  paymentMethodId: line.payment_method_id ?? null,
  savingId: line.saving_id ?? null,
  fixedId: line.fixed_id ?? null,
  financingId: line.financing_id ?? null,
  relatedGroupId: line.related_group_id ?? null,
  notes: line.notes ?? null,
  sortOrder: line.sort_order,
});

const lineToPayload = (
  closingId: number,
  line: ClosingLineInput,
  index: number
): Insertable<GroupClosingLine> => {
  const parsed = groupClosingLineInputSchema.parse({
    section: line.section,
    kind: line.kind,
    label: line.label.trim(),
    operation: line.operation ?? 'add',
    direction: line.direction ?? null,
    amount_cents: line.amount_cents,
    reference_cents: line.reference_cents ?? null,
    reason: line.reason ?? null,
    payment_method_id: line.payment_method_id ?? null,
    saving_id: line.saving_id ?? null,
    fixed_id: line.fixed_id ?? null,
    financing_id: line.financing_id ?? null,
    related_group_id: line.related_group_id ?? null,
    notes: line.notes ?? null,
    sort_order: line.sort_order ?? index,
  });
  return {
    closing_id: closingId,
    ...parsed,
    operation: parsed.operation ?? 'add',
    sort_order: parsed.sort_order ?? index,
  };
};

const normalizeClosingInput = (input: ClosingInput): ClosingInput => ({
  ...input,
  period_start: startOfLocalDay(input.period_start),
  period_end: endOfLocalDay(input.period_end),
  editable_until: endOfLocalDay(input.editable_until),
});

const closingTotalsPayload = (lines: ClosingLineInput[]) => {
  const domainLines = lines.map((line, index) => ({
    ...line,
    operation: line.operation ?? 'add',
    sortOrder: line.sort_order ?? index,
    amountCents: line.amount_cents,
    referenceCents: line.reference_cents ?? null,
  })) as ClosingLine[];
  return calculateClosingTotals(domainLines);
};

const finalBlockingCodes = new Set<ClosingValidationCode>([
  'CLOSING_PERIOD_EXPIRED',
  'CLOSING_INVALID_AMOUNT',
  'CLOSING_RESOLUTION_DIRECTION_REQUIRED',
  'CLOSING_RESOLUTION_LIMIT_EXCEEDED',
]);

const validateInput = (input: ClosingInput) => {
  const status = input.status ?? 'draft';
  if (!isClosingEditable(input.editable_until)) {
    throw new Error('CLOSING_PERIOD_EXPIRED');
  }
  if (input.period_end < input.period_start) {
    throw new Error('CLOSING_INVALID_PERIOD');
  }
  if (input.editable_until < input.period_end) {
    throw new Error('CLOSING_INVALID_PERIOD');
  }

  const domainLines = input.lines.map((line, index) =>
    lineToDomain({
      ...lineToPayload(0, line, index),
      id: 0,
    } as GroupClosingLine)
  );
  const codes = validateClosing({
    lines: domainLines,
    status,
    editableUntil: input.editable_until,
  });
  const blocking = codes.filter(
    (code) =>
      finalBlockingCodes.has(code) ||
      (status === 'final' &&
        (code === 'CLOSING_RESOLUTION_MISMATCH' ||
          code === 'CLOSING_EMPTY_FINAL' ||
          code === 'CLOSING_RESOLUTION_WITHOUT_RESULT'))
  );
  if (blocking.length > 0) {
    throw new Error(blocking[0]);
  }
};

const rethrowClosingError = (error: unknown, message: string): never => {
  if (
    error instanceof Error &&
    (error.message.startsWith('CLOSING_') ||
      error.message.startsWith('DB_'))
  ) {
    throw error;
  }
  throw mapDatabaseError(error, message);
};

export const useGroupClosingsRepository = () => {
  const db = useSQLiteContext();
  const closingsOrm = useORM('GroupClosings');
  const linesOrm = useORM('GroupClosingLines');
  const groupsOrm = useORM('Groups');

  const fetchClosings = async (groupId: number): Promise<ClosingSummary[]> => {
    try {
      const group = (await groupsOrm.getById(groupId)) as {
        group_name?: string | null;
      } | null;
      const rows = (await closingsOrm
        .where('group_id', groupId)
        .order('period_end', 'DESC')
        .getAll()) as GroupClosing[];
      return rows.map((row) => ({
        ...row,
        group_name: group?.group_name ?? null,
      }));
    } catch (error) {
      return rethrowClosingError(error, 'Could not load group closings');
    }
  };

  const fetchClosing = async (
    closingId: number
  ): Promise<GroupClosingView | null> => {
    try {
      const closing = (await closingsOrm.getById(closingId)) as
        | GroupClosing
        | null;
      if (!closing) return null;
      const group = (await groupsOrm.getById(closing.group_id)) as {
        group_name?: string | null;
      } | null;
      const lines = (await linesOrm
        .where('closing_id', closingId)
        .order('sort_order', 'ASC')
        .getAll()) as GroupClosingLine[];
      return {
        ...closing,
        group_name: group?.group_name ?? null,
        lines,
      };
    } catch (error) {
      return rethrowClosingError(error, 'Could not load group closing');
    }
  };

  const createClosing = async (input: ClosingInput): Promise<number> => {
    try {
      const data = normalizeClosingInput(input);
      validateInput(data);
      const status = data.status ?? 'draft';
      const totals = closingTotalsPayload(data.lines);
      const header = groupClosingInputSchema.parse({
        group_id: data.group_id,
        close_name: data.close_name.trim(),
        close_date: data.close_date,
        period_start: data.period_start,
        period_end: data.period_end,
        editable_until: data.editable_until,
        status,
        notes: data.notes ?? null,
        total_available_cents: totals.availableCents,
        total_reserve_cents: totals.reserveCents,
        total_obligations_cents: totals.obligationsCents,
        result_cents: totals.resultCents,
        total_resolution_cents: totals.totalResolutionCents,
        remaining_cents: totals.remainingCents,
      });

      return await withExclusiveTransaction(db, async (txn) => {
        if (status === 'final') {
          const finals = (await new ORM(txn, 'GroupClosings')
            .where('group_id', data.group_id)
            .where('status', 'final')
            .getAll()) as GroupClosing[];
          if (finals.length > 0) throw new Error('CLOSING_FINAL_EXISTS');
        }
        const closings = new ORM(txn, 'GroupClosings');
        const lines = new ORM(txn, 'GroupClosingLines');
        const closingId = await closings.insert(
          header as Insertable<GroupClosing>
        );
        for (const [index, line] of data.lines.entries()) {
          await lines.insert(lineToPayload(closingId, line, index));
        }
        return closingId;
      });
    } catch (error) {
      return rethrowClosingError(error, 'Could not create group closing');
    }
  };

  const updateClosing = async (
    closingId: number,
    input: ClosingInput
  ): Promise<void> => {
    try {
      const data = normalizeClosingInput(input);
      validateInput(data);
      const status = data.status ?? 'draft';
      const totals = closingTotalsPayload(data.lines);
      const header = groupClosingInputSchema.parse({
        group_id: data.group_id,
        close_name: data.close_name.trim(),
        close_date: data.close_date,
        period_start: data.period_start,
        period_end: data.period_end,
        editable_until: data.editable_until,
        status,
        notes: data.notes ?? null,
        total_available_cents: totals.availableCents,
        total_reserve_cents: totals.reserveCents,
        total_obligations_cents: totals.obligationsCents,
        result_cents: totals.resultCents,
        total_resolution_cents: totals.totalResolutionCents,
        remaining_cents: totals.remainingCents,
      });

      await withExclusiveTransaction(db, async (txn) => {
        const closings = new ORM(txn, 'GroupClosings');
        const lines = new ORM(txn, 'GroupClosingLines');
        const existing = (await closings.getById(closingId)) as
          | GroupClosing
          | null;
        if (!existing) throw new Error('CLOSING_NOT_FOUND');
        if (!isClosingEditable(existing.editable_until)) {
          throw new Error('CLOSING_PERIOD_EXPIRED');
        }
        if (status === 'final') {
          const finals = (await closings
            .where('group_id', data.group_id)
            .where('status', 'final')
            .getAll()) as GroupClosing[];
          if (finals.some((closing) => closing.id !== closingId)) {
            throw new Error('CLOSING_FINAL_EXISTS');
          }
        }
        await closings.update(closingId, header);
        await lines.deleteWhere('closing_id', closingId);
        for (const [index, line] of data.lines.entries()) {
          await lines.insert(lineToPayload(closingId, line, index));
        }
      });
    } catch (error) {
      return rethrowClosingError(error, 'Could not update group closing');
    }
  };

  const deleteClosing = async (closingId: number): Promise<void> => {
    try {
      await withExclusiveTransaction(db, async (txn) => {
        const closings = new ORM(txn, 'GroupClosings');
        const lines = new ORM(txn, 'GroupClosingLines');
        const existing = (await closings.getById(closingId)) as
          | GroupClosing
          | null;
        if (!existing) return;
        if (!isClosingEditable(existing.editable_until)) {
          throw new Error('CLOSING_PERIOD_EXPIRED');
        }
        await lines.deleteWhere('closing_id', closingId);
        await closings.delete(closingId);
      });
    } catch (error) {
      return rethrowClosingError(error, 'Could not delete group closing');
    }
  };

  const duplicateClosing = async (
    closingId: number,
    overrides: DuplicateClosingOverrides = {}
  ): Promise<number> => {
    try {
      const source = await fetchClosing(closingId);
      if (!source) throw new Error('CLOSING_NOT_FOUND');
      if (!isClosingEditable(source.editable_until)) {
        throw new Error('CLOSING_PERIOD_EXPIRED');
      }

      const periodStart = overrides.period_start ?? source.period_start;
      const periodEnd = overrides.period_end ?? source.period_end;
      const editableUntil = overrides.editable_until ?? source.editable_until;
      const input: ClosingInput = {
        group_id: source.group_id,
        close_name: overrides.close_name ?? `${source.close_name} (copy)`,
        close_date: overrides.close_date ?? Date.now(),
        period_start: periodStart,
        period_end: periodEnd,
        editable_until: editableUntil,
        status: 'draft',
        notes: source.notes ?? null,
        lines: source.lines.map((line, index) => ({
          section: line.section as ClosingLineInput['section'],
          kind: line.kind as ClosingLineInput['kind'],
          label: line.label,
          operation: line.operation as ClosingLineInput['operation'],
          direction: line.direction as ClosingLineInput['direction'],
          amount_cents: line.amount_cents,
          reference_cents: line.reference_cents ?? null,
          reason: line.reason ?? null,
          payment_method_id: line.payment_method_id ?? null,
          saving_id: line.saving_id ?? null,
          fixed_id: line.fixed_id ?? null,
          financing_id: line.financing_id ?? null,
          related_group_id: line.related_group_id ?? null,
          notes: line.notes ?? null,
          sort_order: line.sort_order ?? index,
        })),
      };
      return await createClosing(input);
    } catch (error) {
      return rethrowClosingError(error, 'Could not duplicate group closing');
    }
  };

  return {
    fetchClosings,
    fetchClosing,
    createClosing,
    updateClosing,
    deleteClosing,
    duplicateClosing,
  };
};
