export type SharedParticipantShare = {
  personId: number;
  sharePercent: number;
};

export type SharedSplit = SharedParticipantShare & {
  amountCents: number;
};

export type RecordShareSplit = {
  ownCents: number;
  sharedCents: number;
};

/**
 * Split a total purchase into the user's own share and the shared share using
 * the participants' percentages. The shared share is rounded once and the own
 * share is the remainder, so `ownCents + sharedCents` always equals the total.
 */
export const computeRecordShares = (
  totalCents: number,
  participants: SharedParticipantShare[]
): RecordShareSplit => {
  const totalPercent = Math.min(
    100,
    participants.reduce(
      (total, participant) =>
        Number.isFinite(participant.sharePercent) && participant.sharePercent > 0
          ? total + participant.sharePercent
          : total,
      0
    )
  );
  const safeTotal = Math.max(0, Math.round(totalCents));
  const sharedCents = Math.round((safeTotal * totalPercent) / 100);
  return {
    ownCents: safeTotal - sharedCents,
    sharedCents,
  };
};

/**
 * Split a shared amount (in cents) across participants proportionally to their
 * percentages. The returned amounts always add up to `amountCents`.
 */
export const splitSharedAmount = (
  amountCents: number,
  participants: SharedParticipantShare[]
): SharedSplit[] => {
  const valid = participants.filter(
    (participant) =>
      Number.isFinite(participant.sharePercent) && participant.sharePercent > 0
  );
  const totalPercent = valid.reduce(
    (total, participant) => total + participant.sharePercent,
    0
  );

  if (amountCents <= 0 || totalPercent <= 0 || valid.length === 0) return [];

  const exact = valid.map(
    (participant) =>
      (amountCents * participant.sharePercent) / totalPercent
  );
  const amounts = exact.map((value) => Math.floor(value));
  let remainder = amountCents - amounts.reduce((total, value) => total + value, 0);

  const order = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((left, right) => right.fraction - left.fraction);

  for (let cursor = 0; remainder > 0; cursor += 1) {
    const target = order[cursor % order.length];
    amounts[target.index] += 1;
    remainder -= 1;
  }

  return valid.map((participant, index) => ({
    ...participant,
    amountCents: amounts[index],
  }));
};
