import { dayShortKey, monthKey, themeContrastKey } from '../keys';
import { en, es } from '../messages';
import { interpolate, resolvePath, translate } from '../translate';

const flatten = (value: unknown, prefix = ''): string[] => {
  if (!value || typeof value !== 'object') return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key)
  );
};

describe('translations', () => {
  it('keeps the same keys in English and Spanish', () => {
    expect(flatten(es).sort()).toEqual(flatten(en).sort());
  });

  it('resolves nested keys', () => {
    expect(resolvePath(en, 'records.header')).toBe('Manage Records');
    expect(translate('en', 'records.header')).toBe('Manage Records');
    expect(translate('es', 'records.header')).toBe('Gestionar Registros');
  });

  it('interpolates parameters', () => {
    expect(interpolate('Reset {palette}', { palette: 'dark' })).toBe(
      'Reset dark'
    );
    expect(
      translate('es', 'theme.confirmResetPalette', { palette: 'oscura' })
    ).toContain('oscura');
  });

  it('builds dynamic keys with helpers', () => {
    expect(monthKey(0)).toBe('months.0');
    expect(dayShortKey(0)).toBe('daysShort.0');
    expect(themeContrastKey('onPrimary')).toBe('theme.contrast.onPrimary');
  });

  it('returns localized months as an array', () => {
    expect(Object.values(en.months)).toHaveLength(12);
    expect(Object.values(es.months)).toHaveLength(12);
  });
});
