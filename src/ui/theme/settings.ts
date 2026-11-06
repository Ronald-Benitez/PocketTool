import type { ThemeColorTokens } from '@/src/interfaces/colors';
import { THEME_COLOR_KEYS, brightBase, darkBase, mergePalette } from './colors';

export type ThemeMode = 'system' | 'light' | 'dark';
export type PaletteName = 'bright' | 'dark';
export type ResolvedMode = 'light' | 'dark';

export type ThemeSettings = {
  version: 2;
  mode: ThemeMode;
  useBase: Record<PaletteName, boolean>;
  bright: Partial<ThemeColorTokens>;
  dark: Partial<ThemeColorTokens>;
};

export const THEME_STORAGE_KEY = 'themeSettings';
export const LEGACY_THEME_STORAGE_KEY = 'colors';

export const DEFAULT_SETTINGS: ThemeSettings = {
  version: 2,
  mode: 'system',
  useBase: { bright: true, dark: true },
  bright: {},
  dark: {},
};

export const paletteBase = (palette: PaletteName): ThemeColorTokens =>
  palette === 'bright' ? brightBase : darkBase;

export const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'system' || value === 'light' || value === 'dark';

export const pickTokens = (value: Record<string, unknown>): Partial<ThemeColorTokens> => {
  const result: Partial<ThemeColorTokens> = {};
  for (const key of THEME_COLOR_KEYS) {
    const next = value[key];
    if (typeof next === 'string' && next.trim().length > 0) result[key] = next;
  }
  return result;
};

export const LEGACY_ALIAS_MAP: Record<string, keyof ThemeColorTokens> = {
  InputStroke: 'borderStrong',
  GoalColor: 'goal',
  BGPicker: 'surfaceMuted',
  ModalHeaderColor: 'modalHeaderBg',
  ConfirmColor: 'secondary',
  IncomeColor: 'income',
  ExpenseColor: 'expense',
  TransferColor: 'transfer',
  BGSimple: 'surfaceMuted',
  BGColor: 'background',
  Credit: 'credit',
  Debit: 'debit',
};

export const migrateLegacyColors = (
  value: Record<string, unknown>
): Partial<ThemeColorTokens> => {
  const mapped: Partial<ThemeColorTokens> = { ...pickTokens(value) };
  for (const [legacyKey, token] of Object.entries(LEGACY_ALIAS_MAP)) {
    const next = value[legacyKey];
    if (typeof next === 'string' && mapped[token] === undefined) {
      mapped[token] = next;
    }
  }
  return mapped;
};

export const normalizeSettings = (value: unknown): ThemeSettings => {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_SETTINGS };
  }

  const input = value as Partial<ThemeSettings>;

  return {
    version: 2,
    mode: isThemeMode(input.mode) ? input.mode : 'system',
    useBase: {
      bright: input.useBase?.bright ?? true,
      dark: input.useBase?.dark ?? true,
    },
    bright:
      input.bright && typeof input.bright === 'object'
        ? pickTokens(input.bright as Record<string, unknown>)
        : {},
    dark:
      input.dark && typeof input.dark === 'object'
        ? pickTokens(input.dark as Record<string, unknown>)
        : {},
  };
};

export const resolveMode = (
  mode: ThemeMode,
  systemScheme: string | null | undefined
): ResolvedMode => (mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode);

export const modeToPalette = (mode: ResolvedMode): PaletteName =>
  mode === 'dark' ? 'dark' : 'bright';

export const resolvePalette = (
  settings: ThemeSettings,
  palette: PaletteName
): ThemeColorTokens =>
  settings.useBase[palette]
    ? paletteBase(palette)
    : mergePalette(paletteBase(palette), settings[palette]);

export const resolvePalettes = (
  settings: ThemeSettings
): Record<PaletteName, ThemeColorTokens> => ({
  bright: resolvePalette(settings, 'bright'),
  dark: resolvePalette(settings, 'dark'),
});
