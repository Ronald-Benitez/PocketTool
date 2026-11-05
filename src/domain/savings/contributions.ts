import type { SavingContributionSummary } from './types';

export const suggestedContributionCents = ({
  rule,
  percentBps,
  fixedCents,
  incomeCents,
}: {
  rule?: string | null;
  percentBps?: number | null;
  fixedCents?: number | null;
  incomeCents: number;
}) => {
  if (rule === 'percent') {
    if (incomeCents <= 0) return { suggestedCents: 0, hasBase: false };
    const bps = Math.max(0, Math.min(10000, percentBps ?? 0));
    return {
      suggestedCents: Math.round((incomeCents * bps) / 10000),
      hasBase: true,
    };
  }
  if (rule === 'fixed') {
    return {
      suggestedCents: Math.max(0, fixedCents ?? 0),
      hasBase: true,
    };
  }
  return { suggestedCents: 0, hasBase: false };
};

export const computeContributionSummary = ({
  rule,
  percentBps,
  fixedCents,
  incomeCents,
  actualCents,
  scope,
}: {
  rule?: string | null;
  percentBps?: number | null;
  fixedCents?: number | null;
  incomeCents: number;
  actualCents: number;
  scope: 'own' | 'global';
}): SavingContributionSummary => {
  const { suggestedCents, hasBase } = suggestedContributionCents({
    rule,
    percentBps,
    fixedCents,
    incomeCents,
  });

  if (rule !== 'percent' && rule !== 'fixed') {
    return {
      hasRule: false,
      suggestedCents: 0,
      actualCents,
      status: 'no_rule',
      scope,
    };
  }

  if (!hasBase || suggestedCents <= 0) {
    return {
      hasRule: true,
      suggestedCents,
      actualCents,
      status: 'no_base',
      scope,
    };
  }

  const status =
    actualCents > suggestedCents
      ? 'exceeded'
      : actualCents === suggestedCents
        ? 'met'
        : 'not_met';

  return {
    hasRule: true,
    suggestedCents,
    actualCents,
    status,
    scope,
  };
};
