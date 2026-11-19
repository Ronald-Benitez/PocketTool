import {
  calculateClosingTotals,
  cardDifferenceCents,
  isClosingBalanced,
  validateClosing,
} from '../calculator';
import type { ClosingLine } from '../types';

const line = (
  overrides: Partial<ClosingLine> & Pick<ClosingLine, 'section' | 'amountCents'>
): ClosingLine => ({
  kind: 'manual',
  label: 'Line',
  operation: 'add',
  sortOrder: 0,
  ...overrides,
});

describe('calculateClosingTotals', () => {
  it('sums available and obligations with add/subtract', () => {
    const lines = [
      line({ section: 'available', amountCents: 5000 }),
      line({ section: 'available', amountCents: 500, operation: 'subtract' }),
      line({ section: 'reserve', amountCents: 2000 }),
      line({ section: 'obligation', amountCents: 3000 }),
      line({ section: 'obligation', amountCents: 200, operation: 'subtract' }),
    ];

    const totals = calculateClosingTotals(lines);

    expect(totals.availableCents).toBe(4500);
    expect(totals.reserveCents).toBe(2000);
    expect(totals.obligationsCents).toBe(2800);
    expect(totals.resultCents).toBe(1700);
    expect(totals.remainingCents).toBe(1700);
  });

  it('computes a shortfall and resolution', () => {
    const lines = [
      line({ section: 'available', amountCents: 3000 }),
      line({ section: 'obligation', amountCents: 5000 }),
      line({ section: 'resolution', amountCents: 1500, direction: 'from' }),
      line({ section: 'resolution', amountCents: 500, direction: 'from' }),
    ];

    const totals = calculateClosingTotals(lines);

    expect(totals.resultCents).toBe(-2000);
    expect(totals.totalResolutionCents).toBe(2000);
    expect(totals.remainingCents).toBe(0);
    expect(isClosingBalanced(totals)).toBe(true);
  });

  it('computes a surplus with destinations', () => {
    const lines = [
      line({ section: 'available', amountCents: 5000 }),
      line({ section: 'obligation', amountCents: 3000 }),
      line({ section: 'resolution', amountCents: 2000, direction: 'to' }),
    ];

    const totals = calculateClosingTotals(lines);

    expect(totals.resultCents).toBe(2000);
    expect(totals.remainingCents).toBe(0);
  });

  it('reports a remaining amount when resolution is incomplete', () => {
    const totals = calculateClosingTotals([
      line({ section: 'available', amountCents: 3000 }),
      line({ section: 'obligation', amountCents: 5000 }),
      line({ section: 'resolution', amountCents: 1000, direction: 'from' }),
    ]);

    expect(totals.remainingCents).toBe(1000);
  });
});

describe('calculateClosingTotals edge cases', () => {
  it('handles an empty closing', () => {
    expect(calculateClosingTotals([])).toEqual({
      availableCents: 0,
      reserveCents: 0,
      obligationsCents: 0,
      resultCents: 0,
      totalResolutionCents: 0,
      remainingCents: 0,
    });
  });

  it('computes the card difference', () => {
    expect(
      cardDifferenceCents(
        line({
          section: 'obligation',
          amountCents: 3800,
          referenceCents: 4000,
        })
      )
    ).toBe(-200);
  });
});

describe('validateClosing', () => {
  const future = new Date(2030, 0, 1).getTime();

  it('allows an incomplete draft', () => {
    const codes = validateClosing({
      lines: [line({ section: 'available', amountCents: 3000 })],
      status: 'draft',
      editableUntil: future,
      now: new Date(2026, 10, 1).getTime(),
    });
    expect(codes).toEqual([]);
  });

  it('rejects an unbalanced final closing', () => {
    const codes = validateClosing({
      lines: [
        line({ section: 'available', amountCents: 3000 }),
        line({ section: 'obligation', amountCents: 5000 }),
      ],
      status: 'final',
      editableUntil: future,
      now: new Date(2026, 10, 1).getTime(),
    });
    expect(codes).toContain('CLOSING_RESOLUTION_MISMATCH');
  });

  it('accepts a balanced final closing', () => {
    const codes = validateClosing({
      lines: [
        line({ section: 'available', amountCents: 3000 }),
        line({ section: 'obligation', amountCents: 5000 }),
        line({ section: 'resolution', amountCents: 2000, direction: 'from' }),
      ],
      status: 'final',
      editableUntil: future,
      now: new Date(2026, 10, 1).getTime(),
    });
    expect(codes).toEqual([]);
  });

  it('rejects resolution lines without a result', () => {
    const codes = validateClosing({
      lines: [
        line({ section: 'available', amountCents: 3000 }),
        line({ section: 'obligation', amountCents: 3000 }),
        line({ section: 'resolution', amountCents: 100, direction: 'from' }),
      ],
      status: 'draft',
      editableUntil: future,
      now: new Date(2026, 10, 1).getTime(),
    });
    expect(codes).toContain('CLOSING_RESOLUTION_WITHOUT_RESULT');
  });

  it('requires a resolution direction', () => {
    const codes = validateClosing({
      lines: [
        line({ section: 'available', amountCents: 3000 }),
        line({ section: 'obligation', amountCents: 5000 }),
        line({ section: 'resolution', amountCents: 2000 }),
      ],
      status: 'draft',
      editableUntil: future,
      now: new Date(2026, 10, 1).getTime(),
    });
    expect(codes).toContain('CLOSING_RESOLUTION_DIRECTION_REQUIRED');
  });

  it('rejects a resolution above its source limit', () => {
    const codes = validateClosing({
      lines: [
        line({ section: 'available', amountCents: 3000 }),
        line({ section: 'obligation', amountCents: 5000 }),
        line({
          section: 'resolution',
          amountCents: 2500,
          referenceCents: 2000,
          direction: 'from',
        }),
      ],
      status: 'draft',
      editableUntil: future,
      now: new Date(2026, 10, 1).getTime(),
    });
    expect(codes).toContain('CLOSING_RESOLUTION_LIMIT_EXCEEDED');
  });

  it('rejects expired closings and empty finals', () => {
    const editableUntil = new Date(2026, 10, 1).getTime();
    const codes = validateClosing({
      lines: [],
      status: 'final',
      editableUntil,
      now: editableUntil + 1,
    });
    expect(codes).toContain('CLOSING_PERIOD_EXPIRED');
    expect(codes).toContain('CLOSING_EMPTY_FINAL');
  });

  it('rejects an expired draft', () => {
    const editableUntil = new Date(2026, 10, 1).getTime();
    const codes = validateClosing({
      lines: [line({ section: 'available', amountCents: 100 })],
      status: 'draft',
      editableUntil,
      now: editableUntil + 1,
    });
    expect(codes).toContain('CLOSING_PERIOD_EXPIRED');
  });

  it('rejects negative amounts', () => {
    const codes = validateClosing({
      lines: [line({ section: 'available', amountCents: -1 })],
      status: 'draft',
      editableUntil: future,
      now: new Date(2026, 10, 1).getTime(),
    });
    expect(codes).toContain('CLOSING_INVALID_AMOUNT');
  });
});
