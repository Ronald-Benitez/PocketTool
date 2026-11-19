import {
  mergeClosingSuggestions,
  suggestClosingLines,
} from '../suggestions';
import type { ClosingLineDraft } from '../types';

const labels = { cash: 'Mes', receivable: 'Por cobrar' };

describe('suggestClosingLines', () => {
  it('suggests available, reserves and obligations', () => {
    const { lines, warnings } = suggestClosingLines({
      cashBalanceCents: 3500,
      receivableCents: 1000,
      includeReceivables: true,
      labels,
      savings: [{ id: 1, name: 'Emergencias', ownCents: 2000 }],
      cards: [{ id: 2, name: 'Visa', expectedCents: 4000 }],
      fixeds: [{ id: 3, name: 'Renta', amountCents: 1000, date: 1 }],
      financings: [{ id: 4, name: 'Auto', amountCents: 800, date: 2 }],
    });

    expect(warnings).toEqual([]);
    expect(lines.map((line) => [line.section, line.kind])).toEqual([
      ['available', 'cash'],
      ['available', 'receivable'],
      ['reserve', 'saving'],
      ['obligation', 'card'],
      ['obligation', 'fixed'],
      ['obligation', 'financing'],
    ]);
    expect(lines[3]).toMatchObject({
      amountCents: 4000,
      referenceCents: 4000,
      paymentMethodId: 2,
    });
  });

  it('uses subtract for a negative cash balance', () => {
    const { lines } = suggestClosingLines({
      cashBalanceCents: -500,
      receivableCents: 0,
      includeReceivables: false,
      labels,
      savings: [],
      cards: [],
      fixeds: [],
      financings: [],
    });

    expect(lines[0]).toMatchObject({
      kind: 'cash',
      operation: 'subtract',
      amountCents: 500,
    });
  });

  it('excludes receivables when the option is off', () => {
    const { lines } = suggestClosingLines({
      cashBalanceCents: 100,
      receivableCents: 1000,
      includeReceivables: false,
      labels,
      savings: [],
      cards: [],
      fixeds: [],
      financings: [],
    });

    expect(lines.some((line) => line.kind === 'receivable')).toBe(false);
  });

  it('warns about historical card + saving conflicts', () => {
    const { warnings } = suggestClosingLines({
      cashBalanceCents: 0,
      receivableCents: 0,
      includeReceivables: false,
      labels,
      savings: [],
      cards: [],
      fixeds: [],
      financings: [],
      conflictRecordIds: [7, 8, 8],
    });

    expect(warnings).toEqual([
      { code: 'credit_card_saving_conflict', recordIds: [7, 8] },
    ]);
  });
});

describe('mergeClosingSuggestions', () => {
  const manual: ClosingLineDraft = {
    section: 'available',
    kind: 'manual',
    label: 'Extra',
    operation: 'add',
    amountCents: 100,
    sortOrder: 0,
  };
  const card: ClosingLineDraft = {
    section: 'obligation',
    kind: 'card',
    label: 'Visa',
    operation: 'add',
    amountCents: 4000,
    referenceCents: 4000,
    paymentMethodId: 2,
    sortOrder: 1,
  };

  it('does not duplicate automatic lines and keeps manual lines', () => {
    const merged = mergeClosingSuggestions(
      [manual, card],
      [
        card,
        {
          ...card,
          amountCents: 5000,
          referenceCents: 5000,
        },
      ]
    );

    expect(merged).toHaveLength(2);
    expect(merged[1].amountCents).toBe(4000);
  });

  it('adds new automatic lines', () => {
    const merged = mergeClosingSuggestions(
      [manual],
      [card]
    );
    expect(merged).toHaveLength(2);
  });
});
