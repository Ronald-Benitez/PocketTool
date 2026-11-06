import { COLOR_GROUPS, THEME_COLOR_KEYS, brightBase, darkBase } from '../colors';
import { contrastRatio, getContrastWarnings } from '../contrast';
import {
  DEFAULT_SETTINGS,
  migrateLegacyColors,
  normalizeSettings,
  resolveMode,
  resolvePalette,
} from '../settings';

describe('theme settings', () => {
  it('falls back to defaults for invalid input', () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings('nope')).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings({}).mode).toBe('system');
  });

  it('keeps valid mode and per-palette overrides', () => {
    const settings = normalizeSettings({
      mode: 'dark',
      useBase: { bright: false, dark: true },
      bright: { primary: '#123456' },
      dark: { surface: '#101010' },
    });

    expect(settings.mode).toBe('dark');
    expect(settings.useBase).toEqual({ bright: false, dark: true });
    expect(settings.bright.primary).toBe('#123456');
    expect(settings.dark.surface).toBe('#101010');
  });

  it('ignores unknown tokens and non-string values', () => {
    const settings = normalizeSettings({
      bright: { primary: '#123456', unknownToken: '#ffffff', text: 42 },
    });

    expect(settings.bright).toEqual({ primary: '#123456' });
  });

  it('falls back to system for unknown modes', () => {
    expect(normalizeSettings({ mode: 'sepia' }).mode).toBe('system');
  });

  it('migrates legacy aliases into semantic tokens', () => {
    const migrated = migrateLegacyColors({
      InputStroke: '#111111',
      IncomeColor: '#222222',
      ExpenseColor: '#333333',
      GoalColor: '#444444',
      BGSimple: '#555555',
      BGColor: '#666666',
      Credit: '#777777',
      Debit: '#888888',
    });

    expect(migrated).toMatchObject({
      borderStrong: '#111111',
      income: '#222222',
      expense: '#333333',
      goal: '#444444',
      surfaceMuted: '#555555',
      background: '#666666',
      credit: '#777777',
      debit: '#888888',
    });
  });

  it('prefers explicit tokens over legacy aliases', () => {
    const migrated = migrateLegacyColors({
      IncomeColor: '#222222',
      income: '#abcdef',
    });

    expect(migrated.income).toBe('#abcdef');
  });

  it('resolves system mode from the device scheme', () => {
    expect(resolveMode('system', 'dark')).toBe('dark');
    expect(resolveMode('system', 'light')).toBe('light');
    expect(resolveMode('system', null)).toBe('light');
    expect(resolveMode('light', 'dark')).toBe('light');
    expect(resolveMode('dark', 'light')).toBe('dark');
  });

  it('uses base palettes unless the palette is customized', () => {
    const base = resolvePalette(DEFAULT_SETTINGS, 'bright');
    expect(base).toEqual(brightBase);

    const custom = resolvePalette(
      { ...DEFAULT_SETTINGS, useBase: { bright: false, dark: true } },
      'bright'
    );
    expect(custom).toEqual(brightBase);

    const customConnection = resolvePalette(
      {
        ...DEFAULT_SETTINGS,
        useBase: { bright: false, dark: true },
        bright: { primary: '#123456' },
      },
      'bright'
    );
    expect(customConnection.primary).toBe('#123456');
    expect(customConnection.text).toBe(brightBase.text);
  });
});

describe('palette coverage and contrast', () => {
  it('covers every token exactly once across groups', () => {
    const grouped = COLOR_GROUPS.flatMap((group) => group.tokens);
    expect(new Set(grouped).size).toBe(THEME_COLOR_KEYS.length);
    expect(grouped.length).toBe(THEME_COLOR_KEYS.length);
    for (const key of THEME_COLOR_KEYS) {
      expect(grouped).toContain(key);
    }
  });

  it('computes known contrast ratios', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('not-a-color', '#FFFFFF')).toBeNull();
  });

  it('keeps base palettes within WCAG AA for checked pairs', () => {
    expect(getContrastWarnings(brightBase)).toEqual([]);
    expect(getContrastWarnings(darkBase)).toEqual([]);
  });

  it('reports low-contrast combinations', () => {
    const warnings = getContrastWarnings({
      ...brightBase,
      onPrimary: '#FFFFFF',
      primary: '#FFFFFF',
    });

    expect(warnings.some((warning) => warning.key === 'onPrimary')).toBe(true);
  });
});
