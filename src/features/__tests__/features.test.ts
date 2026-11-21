import {
  applyPreset,
  createDefaultEnabled,
  disableFeature,
  matchPreset,
  normalizeFeatures,
} from '../normalize';
import type { FeatureId } from '../types';

const enabledWith = (overrides: Partial<Record<FeatureId, boolean>>) => ({
  ...createDefaultEnabled('complete'),
  ...overrides,
});

describe('feature presets', () => {
  it('builds the essential preset', () => {
    const enabled = createDefaultEnabled('essential');
    expect(enabled.summaries).toBe(true);
    expect(enabled.fixeds).toBe(false);
    expect(enabled.credits).toBe(false);
    expect(enabled.quickAdd).toBe(true);
    expect(enabled.smartDefaults).toBe(true);
  });

  it('builds the balanced preset', () => {
    const enabled = createDefaultEnabled('balanced');
    expect(enabled.fixeds).toBe(true);
    expect(enabled.financings).toBe(true);
    expect(enabled.credits).toBe(true);
    expect(enabled.budget).toBe(true);
    expect(enabled.charts).toBe(true);
    expect(enabled.filters).toBe(true);
    expect(enabled.advancedCatalogs).toBe(false);
    expect(enabled.savings).toBe(false);
  });

  it('keeps complete as the current experience', () => {
    const enabled = createDefaultEnabled('complete');
    expect(enabled.savings).toBe(true);
    expect(enabled.vehicle).toBe(true);
    expect(enabled.closing).toBe(true);
    expect(enabled.people).toBe(true);
    expect(enabled.shared).toBe(true);
    expect(enabled.advancedCatalogs).toBe(true);
    expect(enabled.quickAdd).toBe(false);
    expect(enabled.smartDefaults).toBe(false);
  });
});

describe('feature normalization', () => {
  it('enables a dependency when a feature is turned on', () => {
    const result = normalizeFeatures(
      enabledWith({ fixeds: false, financings: true })
    );
    expect(result.enabled.fixeds).toBe(true);
    expect(result.adjustments).toContainEqual({
      feature: 'fixeds',
      action: 'enabled',
      reason: 'financings',
    });
  });

  it('disables dependents when a dependency is turned off', () => {
    const result = disableFeature(
      enabledWith({ fixeds: true, financings: true }),
      'fixeds'
    );
    expect(result.enabled.fixeds).toBe(false);
    expect(result.enabled.financings).toBe(false);
    expect(result.adjustments).toContainEqual({
      feature: 'financings',
      action: 'disabled',
      reason: 'fixeds',
    });
  });

  it('normalizes shared purchases through people', () => {
    const enabled = normalizeFeatures(
      enabledWith({ people: false, shared: true })
    );
    expect(enabled.enabled.people).toBe(true);
    expect(enabled.enabled.shared).toBe(true);
  });

  it('matches presets ignoring capture preferences', () => {
    const balanced = applyPreset('balanced').enabled;
    expect(matchPreset(balanced)).toBe('balanced');
    expect(matchPreset({ ...balanced, quickAdd: false })).toBe('balanced');
    expect(matchPreset({ ...balanced, filters: false })).toBe('custom');
  });

  it('detects a custom selection', () => {
    const complete = createDefaultEnabled('complete');
    expect(matchPreset({ ...complete, savings: false, vehicle: false })).toBe(
      'custom'
    );
  });
});
