import type { Period } from '@/src/domain/periods/types';

const formatPeriodDate = (timestamp: number, language: string) =>
  new Date(timestamp).toLocaleDateString(language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/** Formats an inclusive local-day period for labels and previews. */
export const formatPeriodRange = (period: Period, language: string) =>
  `${formatPeriodDate(period.start, language)} – ${formatPeriodDate(
    period.end,
    language
  )}`;
