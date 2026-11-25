import type {
  ClosingLineDraft,
  ClosingSuggestionInput,
  ClosingSuggestionResult,
  ClosingWarning,
} from './types';

const sourceKey = (line: ClosingLineDraft) => {
  if (line.kind === 'saving' && line.savingId != null) {
    return `saving:${line.savingId}`;
  }
  if (line.kind === 'card' && line.paymentMethodId != null) {
    return `card:${line.paymentMethodId}`;
  }
  if (line.kind === 'fixed' && line.fixedId != null) {
    return `fixed:${line.fixedId}`;
  }
  if (line.kind === 'financing' && line.financingId != null) {
    return `financing:${line.financingId}`;
  }
  if (line.kind === 'cash' || line.kind === 'receivable') {
    return line.kind;
  }
  return `${line.section}:${line.kind}:${line.label}`;
};

export const mergeClosingSuggestions = (
  existing: readonly ClosingLineDraft[],
  suggested: readonly ClosingLineDraft[]
): ClosingLineDraft[] => {
  const keys = new Set(existing.map(sourceKey));
  const next = [...existing];
  for (const line of suggested) {
    const key = sourceKey(line);
    if (keys.has(key)) continue;
    keys.add(key);
    next.push(line);
  }
  return next;
};

/**
 * Builds the automatic lines proposed for a closing. The UI supplies the
 * localized labels for the generic cash and receivable lines.
 */
export const suggestClosingLines = ({
  cashBalanceCents,
  receivableCents,
  includeReceivables,
  labels,
  savings,
  cards,
  fixeds,
  financings,
  conflictRecordIds = [],
}: ClosingSuggestionInput): ClosingSuggestionResult => {
  const lines: ClosingLineDraft[] = [];
  const warnings: ClosingWarning[] = [];
  let order = 0;

  if (cashBalanceCents !== 0) {
    lines.push({
      section: 'available',
      kind: 'cash',
      label: labels.cash,
      operation: cashBalanceCents < 0 ? 'subtract' : 'add',
      amountCents: Math.abs(cashBalanceCents),
      sortOrder: order++,
    });
  }

  if (includeReceivables && receivableCents > 0) {
    lines.push({
      section: 'available',
      kind: 'receivable',
      label: labels.receivable,
      operation: 'add',
      amountCents: receivableCents,
      sortOrder: order++,
    });
  }

  for (const saving of savings) {
    if (saving.ownCents <= 0) continue;
    lines.push({
      section: 'reserve',
      kind: 'saving',
      label: saving.name,
      operation: 'add',
      amountCents: saving.ownCents,
      referenceCents: saving.ownCents,
      savingId: saving.id ?? null,
      sortOrder: order++,
    });
  }

  for (const card of cards) {
    if (card.expectedCents <= 0) continue;
    lines.push({
      section: 'obligation',
      kind: 'card',
      label: card.name,
      operation: 'add',
      amountCents: card.expectedCents,
      referenceCents: card.expectedCents,
      paymentMethodId: card.id ?? null,
      sortOrder: order++,
    });
  }

  for (const fixed of fixeds) {
    if (fixed.amountCents <= 0) continue;
    lines.push({
      section: 'obligation',
      kind: 'fixed',
      label: fixed.name,
      operation: 'add',
      amountCents: fixed.amountCents,
      fixedId: fixed.id ?? null,
      notes: null,
      sortOrder: order++,
    });
  }

  for (const financing of financings) {
    if (financing.amountCents <= 0) continue;
    lines.push({
      section: 'obligation',
      kind: 'financing',
      label: financing.name,
      operation: 'add',
      amountCents: financing.amountCents,
      financingId: financing.id ?? null,
      sortOrder: order++,
    });
  }

  if (conflictRecordIds.length > 0) {
    warnings.push({
      code: 'credit_card_saving_conflict',
      recordIds: [...new Set(conflictRecordIds)],
    });
  }

  return { lines, warnings };
};
