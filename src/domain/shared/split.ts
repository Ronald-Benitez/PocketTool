export type SharedParticipantShare = {
  personId: number;
  sharePercent: number;
};

export type SharedSplit = SharedParticipantShare & {
  amountCents: number;
};

export type ShareMode = 'percent' | 'amount';

export type ParticipantShareInput = {
  personId: number;
  shareMode?: ShareMode | null;
  sharePercent?: number | null;
  shareAmountCents?: number | null;
};

export type ParticipantShareAmount = {
  personId: number;
  shareMode: ShareMode;
  /** Effective percentage of the total, useful for snapshots and display. */
  sharePercent: number;
  amountCents: number;
};

export type ParticipantSplit = {
  ownCents: number;
  sharedCents: number;
  participants: ParticipantShareAmount[];
  exceedsTotal: boolean;
};

/**
 * Split a total between the user and participants that may use a percentage or
 * a fixed amount. Both kinds are calculated over the total. If the assigned
 * sum exceeds the total, `exceedsTotal` is true and amounts are clamped to the
 * remaining total so `ownCents + sharedCents` always reconciles.
 */
export const computeParticipantShares = (
  totalCents: number,
  participants: ParticipantShareInput[]
): ParticipantSplit => {
  const total = Math.max(0, Math.round(totalCents));
  let remaining = total;
  let exceedsTotal = false;
  const result: ParticipantShareAmount[] = [];

  participants.forEach((participant) => {
    const mode: ShareMode =
      participant.shareMode === 'amount' ? 'amount' : 'percent';

    if (mode === 'percent') {
      const percent = Number.isFinite(participant.sharePercent)
        ? Math.max(0, participant.sharePercent ?? 0)
        : 0;
      if (percent <= 0) return;
      const raw = Math.round((total * percent) / 100);
      if (raw > remaining) exceedsTotal = true;
      const amount = Math.min(remaining, Math.max(0, raw));
      if (amount <= 0) return;
      result.push({
        personId: participant.personId,
        shareMode: 'percent',
        sharePercent: percent,
        amountCents: amount,
      });
      remaining -= amount;
      return;
    }

    const raw = Math.max(0, Math.round(participant.shareAmountCents ?? 0));
    if (raw <= 0) return;
    if (raw > remaining) exceedsTotal = true;
    const amount = Math.min(remaining, raw);
    if (amount <= 0) return;
    result.push({
      personId: participant.personId,
      shareMode: 'amount',
      sharePercent: total > 0 ? (amount / total) * 100 : 0,
      amountCents: amount,
    });
    remaining -= amount;
  });

  return {
    ownCents: remaining,
    sharedCents: total - remaining,
    participants: result,
    exceedsTotal,
  };
};

export type RecordShareSplit = {
  ownCents: number;
  sharedCents: number;
};

/**
 * Split a total purchase into the user's own share and the shared share using
 * participants' percentages or fixed amounts.
 */
export const computeRecordShares = (
  totalCents: number,
  participants: ParticipantShareInput[]
): RecordShareSplit => {
  const split = computeParticipantShares(totalCents, participants);
  return {
    ownCents: split.ownCents,
    sharedCents: split.sharedCents,
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
