import {
  buildBalanceChart,
  buildPaymentCompositionChart,
} from '../charts';
import { summarizeFinancing } from '../summary';

const financing = {
  financed_cents: 120000,
  annual_rate_bps: 0,
  term_months: 12,
  first_payment_date: new Date(2026, 0, 1).getTime(),
};

describe('credit charts', () => {
  it('builds a projected balance decrease chart', () => {
    const summary = summarizeFinancing(financing, []);
    const chart = buildBalanceChart(summary, 'Balance');
    expect(chart?.kind).toBe('line');
    expect(chart?.series).toHaveLength(1);
    expect(chart?.yAxis?.format).toBe('money');
  });

  it('uses scheduled rows when there are no actual payments', () => {
    const summary = summarizeFinancing(financing, []);
    const chart = buildPaymentCompositionChart([], summary, 'Composition');
    expect(chart?.series).toHaveLength(3);
  });

  it('uses actual payments when there are at least two', () => {
    const summary = summarizeFinancing(financing, [
      {
        date: 1,
        principal_cents: 9000,
        interest_cents: 1000,
        insurance_cents: 500,
        fees_cents: 0,
      },
      {
        date: 2,
        principal_cents: 9500,
        interest_cents: 500,
        insurance_cents: 0,
        fees_cents: 200,
      },
    ]);
    const chart = buildPaymentCompositionChart(
      [
        {
          date: 1,
          principal_cents: 9000,
          interest_cents: 1000,
          insurance_cents: 500,
          fees_cents: 0,
        },
        {
          date: 2,
          principal_cents: 9500,
          interest_cents: 500,
          insurance_cents: 0,
          fees_cents: 200,
        },
      ],
      summary,
      'Composition'
    );
    expect(chart?.series[0].points.map((point) => point.y)).toEqual([
      9000, 9500,
    ]);
    expect(chart?.series[1].points.map((point) => point.y)).toEqual([
      1000, 500,
    ]);
    expect(chart?.series[2].points.map((point) => point.y)).toEqual([500, 200]);
  });

  it('returns null when there are not enough points', () => {
    const summary = summarizeFinancing(financing, []);
    expect(
      buildPaymentCompositionChart(
        [{ date: 1, principal_cents: 1000 }],
        summary,
        'Composition'
      )
    ).not.toBeNull();
    expect(
      buildBalanceChart(
        {
          ...summary,
          schedule: { ...summary.schedule, rows: [] },
        },
        'Balance'
      )
    ).toBeNull();
  });
});
