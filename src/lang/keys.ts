import type { TranslationKey } from './messages';

export const monthKey = (month: number): TranslationKey =>
  `months.${month}` as TranslationKey;

export const dayShortKey = (day: number): TranslationKey =>
  `daysShort.${day}` as TranslationKey;

export const dayLongKey = (day: number): TranslationKey =>
  `daysLong.${day}` as TranslationKey;

export const themeModeKey = (mode: string): TranslationKey =>
  `theme.mode.${mode}` as TranslationKey;

export const themePaletteKey = (palette: string): TranslationKey =>
  `theme.palette.${palette}` as TranslationKey;

export const themeContrastKey = (key: string): TranslationKey =>
  `theme.contrast.${key}` as TranslationKey;

export const filterOperatorKey = (operator: string): TranslationKey =>
  `recordsFilters.operators.${operator}` as TranslationKey;

export const filterColumnKey = (column: string): TranslationKey =>
  `recordsFilters.columns.${column}` as TranslationKey;

export const helpCategoryKey = (category: string): TranslationKey =>
  `help.categories.${category}` as TranslationKey;

export const budgetLineStatusKey = (status: string): TranslationKey =>
  `budget.lineStatus.${
    status === 'on_track'
      ? 'onTrack'
      : status === 'fixed_pending'
        ? 'fixedPending'
        : status
  }` as TranslationKey;
