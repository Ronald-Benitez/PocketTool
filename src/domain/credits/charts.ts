import type {
  FinancingPaymentInput,
  FinancingSummary,
} from './summary';

const clean = (value: string, fallback: string) => {
  const normalized = value
    .replace(/["[\]{}();\r\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized ? normalized.slice(0, 24) : fallback;
};

const buildLineChart = ({
  title,
  points,
  values,
  yAxis,
  series,
}: {
  title: string;
  points: { date: number }[];
  values: number[][];
  yAxis: string;
  series: string[];
}) => {
  if (points.length < 2 || values.some((row) => row.length !== points.length)) {
    return null;
  }
  const flat = values.flat();
  const max = Math.max(...flat, 1);
  const axisMax = Math.ceil(max * 1.15);

  return [
    'xychart-beta',
    `  title "${clean(title, title)}"`,
    `  x-axis [${points
      .map((point) => `"${new Date(point.date).toLocaleDateString()}"`)
      .join(', ')}]`,
    `  y-axis "${clean(yAxis, yAxis)}" 0 --> ${axisMax}`,
    ...series.map(
      (_, index) =>
        `  line [${values[index]
          .map((value) => Number(value.toFixed(2)))
          .join(', ')}]`
    ),
  ].join('\n');
};

export const buildBalanceChart = (
  summary: FinancingSummary,
  title: string
) => {
  const rows = summary.schedule.rows;
  return buildLineChart({
    title,
    points: rows.map((row) => ({ date: row.date })),
    values: [rows.map((row) => row.balanceCents / 100)],
    yAxis: '$',
    series: [title],
  });
};

export const buildPaymentCompositionChart = (
  payments: FinancingPaymentInput[],
  summary: FinancingSummary,
  title: string
) => {
  const actual = payments
    .filter((payment) => payment.date != null)
    .sort((a, b) => (a.date ?? 0) - (b.date ?? 0));

  if (actual.length >= 2) {
    return buildLineChart({
      title,
      points: actual.map((payment) => ({ date: payment.date ?? 0 })),
      values: [
        actual.map((payment) => (payment.principal_cents ?? 0) / 100),
        actual.map((payment) => (payment.interest_cents ?? 0) / 100),
        actual.map(
          (payment) =>
            ((payment.insurance_cents ?? 0) + (payment.fees_cents ?? 0)) / 100
        ),
      ],
      yAxis: '$',
      series: ['principal', 'interest', 'insurance'],
    });
  }

  const rows = summary.schedule.rows;
  return buildLineChart({
    title,
    points: rows.map((row) => ({ date: row.date })),
    values: [
      rows.map((row) => row.principalCents / 100),
      rows.map((row) => row.interestCents / 100),
      rows.map(() => 0),
    ],
    yAxis: '$',
    series: ['principal', 'interest', 'insurance'],
  });
};
