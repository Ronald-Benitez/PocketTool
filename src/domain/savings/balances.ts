import type {
  SavingMovementLike,
  SavingParticipantBalance,
  SavingParticipantLike,
  SavingSnapshot,
} from './types';

const emptySnapshot = (): SavingSnapshot => ({
  totalCents: 0,
  ownCents: 0,
  sharedCents: 0,
  contributedCents: 0,
  withdrawnCents: 0,
  interestCents: 0,
  participants: [],
});

export const computeSavingSnapshot = (
  movements: SavingMovementLike[],
  participants: SavingParticipantLike[] = []
): SavingSnapshot => {
  const snapshot = emptySnapshot();
  const byPerson = new Map<number, SavingParticipantBalance>();

  participants.forEach((participant) => {
    byPerson.set(participant.person_id, {
      personId: participant.person_id,
      sharePercent: participant.share_percent,
      contributedCents: 0,
      withdrawnCents: 0,
      interestCents: 0,
      balanceCents: 0,
    });
  });

  const person = (personId: number) => {
    const existing = byPerson.get(personId);
    if (existing) return existing;
    const created: SavingParticipantBalance = {
      personId,
      sharePercent: 0,
      contributedCents: 0,
      withdrawnCents: 0,
      interestCents: 0,
      balanceCents: 0,
    };
    byPerson.set(personId, created);
    return created;
  };

  for (const movement of movements) {
    const amount = Math.max(0, movement.amount_cents ?? 0);
    if (amount === 0) continue;

    switch (movement.kind) {
      case 'initial':
      case 'deposit': {
        snapshot.contributedCents += amount;
        if (movement.person_id != null) {
          const balance = person(movement.person_id);
          balance.contributedCents += amount;
          balance.balanceCents += amount;
          snapshot.sharedCents += amount;
        } else {
          snapshot.ownCents += amount;
        }
        break;
      }
      case 'withdrawal': {
        snapshot.withdrawnCents += amount;
        if (movement.person_id != null) {
          const balance = person(movement.person_id);
          balance.withdrawnCents += amount;
          balance.balanceCents -= amount;
          snapshot.sharedCents -= amount;
        } else {
          snapshot.ownCents -= amount;
        }
        break;
      }
      case 'interest': {
        snapshot.interestCents += amount;
        const totalPercent = participants.reduce(
          (total, participant) => total + Math.max(0, participant.share_percent),
          0
        );
        if (totalPercent <= 0) {
          snapshot.ownCents += amount;
          break;
        }
        let distributed = 0;
        participants.forEach((participant) => {
          const percent = Math.min(100, Math.max(0, participant.share_percent));
          if (percent <= 0) return;
          const share = Math.floor((amount * percent) / 100);
          distributed += share;
          const balance = person(participant.person_id);
          balance.interestCents += share;
          balance.balanceCents += share;
        });
        snapshot.ownCents += amount - distributed;
        snapshot.sharedCents += distributed;
        break;
      }
      case 'adjustment':
      default: {
        if (movement.person_id != null) {
          const balance = person(movement.person_id);
          balance.balanceCents += amount;
          snapshot.sharedCents += amount;
        } else {
          snapshot.ownCents += amount;
        }
        break;
      }
    }
  }

  snapshot.totalCents = snapshot.ownCents + snapshot.sharedCents;
  snapshot.participants = [...byPerson.values()].sort((left, right) =>
    left.personId - right.personId
  );
  return snapshot;
};

export const contributionActualCents = (
  movements: SavingMovementLike[],
  periodYear: number,
  periodMonth: number,
  scope: 'own' | 'global'
) =>
  movements.reduce((total, movement) => {
    if (
      movement.kind !== 'initial' &&
      movement.kind !== 'deposit'
    ) {
      return total;
    }
    if (
      movement.period_year !== periodYear ||
      movement.period_month !== periodMonth
    ) {
      return total;
    }
    if (scope === 'own' && movement.person_id != null) return total;
    return total + Math.max(0, movement.amount_cents ?? 0);
  }, 0);
