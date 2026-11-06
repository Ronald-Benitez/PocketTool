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
