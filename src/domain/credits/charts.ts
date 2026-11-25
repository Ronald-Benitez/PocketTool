import type { ChartSeries, ChartSpec } from '@/src/domain/charts/types';
import type {
  FinancingPaymentInput,
  FinancingSummary,
} from './summary';

const buildLineChart = ({
  title,
  points,
  values,
  seriesLabels,
  tones,
}: {
  title: string;
  points: { date: number }[];
  values: number[][];
  seriesLabels: string[];
  tones: ChartSeries['tone'][];
}): ChartSpec | null => {
  if (points.length < 2 || values.some((row) => row.length !== points.length)) {
    return null;
  }

  return {
    kind: 'line',
    title,
    xAxis: { type: 'time', format: 'date' },
    yAxis: { format: 'money' },
    series: values.map((row, index) => ({
      key: `series-${index}`,
      label: seriesLabels[index] ?? title,
      tone: tones[index] ?? 'primary',
      points: row.map((value, pointIndex) => ({
        x: points[pointIndex].date,
        y: Math.round(value),
      })),
    })),
  };
};

export const buildBalanceChart = (
  summary: FinancingSummary,
  title: string
): ChartSpec | null => {
  const rows = summary.schedule.rows;
  return buildLineChart({
    title,
    points: rows.map((row) => ({ date: row.date })),
    values: [rows.map((row) => row.balanceCents)],
    seriesLabels: [title],
    tones: ['distance'],
  });
};

export const buildPaymentCompositionChart = (
  payments: FinancingPaymentInput[],
  summary: FinancingSummary,
  title: string,
  labels: {
    principal: string;
    interest: string;
    insurance: string;
  } = {
    principal: 'principal',
    interest: 'interest',
    insurance: 'insurance',
  }
): ChartSpec | null => {
  const actual = payments
    .filter((payment) => payment.date != null)
    .sort((a, b) => (a.date ?? 0) - (b.date ?? 0));
  const seriesLabels = [labels.principal, labels.interest, labels.insurance];

  if (actual.length >= 2) {
    return buildLineChart({
      title,
      points: actual.map((payment) => ({ date: payment.date ?? 0 })),
      values: [
        actual.map((payment) => payment.principal_cents ?? 0),
        actual.map((payment) => payment.interest_cents ?? 0),
        actual.map(
          (payment) =>
            (payment.insurance_cents ?? 0) + (payment.fees_cents ?? 0)
        ),
      ],
      seriesLabels,
      tones: ['planned', 'actual', 'projected'],
    });
  }

  const rows = summary.schedule.rows;
  return buildLineChart({
    title,
    points: rows.map((row) => ({ date: row.date })),
    values: [
      rows.map((row) => row.principalCents),
      rows.map((row) => row.interestCents),
      rows.map(() => 0),
    ],
    seriesLabels,
    tones: ['planned', 'actual', 'projected'],
  });
};
