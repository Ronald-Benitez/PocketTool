import type { ChartSpec } from '@/src/domain/charts/types';
import { computeSavingSnapshot } from './balances';
import type {
  SavingChartPoint,
  SavingMovementLike,
  SavingParticipantLike,
} from './types';

export const buildSavingChart = (
  movements: SavingMovementLike[],
  participants: SavingParticipantLike[] = []
): SavingChartPoint[] => {
  const sorted = [...movements].sort(
    (left, right) => left.change_date - right.change_date
  );
  const points: SavingChartPoint[] = [];
  for (let index = 0; index < sorted.length; index += 1) {
    const snapshot = computeSavingSnapshot(
      sorted.slice(0, index + 1),
      participants
    );
    points.push({
      date: sorted[index].change_date,
      totalCents: snapshot.totalCents,
      ownCents: snapshot.ownCents,
      sharedCents: snapshot.sharedCents,
    });
  }
  return points;
};

export const buildSavingChartSpec = (
  points: SavingChartPoint[],
  labels: { total: string; own: string; shared: string }
): ChartSpec | null => {
  if (points.length === 0) return null;

  return {
    kind: 'line',
    xAxis: { type: 'time', format: 'date' },
    yAxis: { format: 'money' },
    series: [
      {
        key: 'total',
        label: labels.total,
        tone: 'planned',
        points: points.map((point) => ({
          x: point.date,
          y: point.totalCents,
        })),
      },
      {
        key: 'own',
        label: labels.own,
        tone: 'primary',
        points: points.map((point) => ({
          x: point.date,
          y: point.ownCents,
        })),
      },
      {
        key: 'shared',
        label: labels.shared,
        tone: 'muted',
        points: points.map((point) => ({
          x: point.date,
          y: point.sharedCents,
        })),
      },
    ],
  };
};
