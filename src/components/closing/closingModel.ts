import type { ClosingLineDraft, ClosingLine, ClosingStatus } from '@/src/domain/closing/types';
import type { ClosingLineInput } from '@/src/db';
import type { GroupClosingLine } from '@/src/interfaces/schema';

export const lineFromDb = (line: GroupClosingLine): ClosingLineDraft => ({
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

export const lineToInput = (
  line: ClosingLineDraft,
  index: number
): ClosingLineInput => ({
  section: line.section,
  kind: line.kind,
  label: line.label.trim(),
  operation: line.operation,
  direction: line.direction ?? null,
  amount_cents: line.amountCents,
  reference_cents: line.referenceCents ?? null,
  reason: line.reason ?? null,
  payment_method_id: line.paymentMethodId ?? null,
  saving_id: line.savingId ?? null,
  fixed_id: line.fixedId ?? null,
  financing_id: line.financingId ?? null,
  related_group_id: line.relatedGroupId ?? null,
  notes: line.notes ?? null,
  sort_order: line.sortOrder ?? index,
});

export const statusLabelKey = (status: ClosingStatus) =>
  status === 'final' ? 'closing.status.final' : 'closing.status.draft';

export const sourceKeyFromLine = (
  line: Pick<
    ClosingLineDraft,
    'kind' | 'paymentMethodId' | 'savingId' | 'fixedId' | 'financingId'
  >
): string | null => {
  if (line.kind === 'card' && line.paymentMethodId != null) {
    return `card:${line.paymentMethodId}`;
  }
  if (line.kind === 'account' && line.paymentMethodId != null) {
    return `account:${line.paymentMethodId}`;
  }
  if (line.kind === 'saving' && line.savingId != null) {
    return `saving:${line.savingId}`;
  }
  if (line.kind === 'fixed' && line.fixedId != null) {
    return `fixed:${line.fixedId}`;
  }
  if (line.kind === 'financing' && line.financingId != null) {
    return `financing:${line.financingId}`;
  }
  return null;
};
