/* eslint-disable @typescript-eslint/no-require-imports */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createDefaultEnabled } from '../normalize';
import {
  EXPERIENCE_STORAGE_KEY,
  useFeatures,
} from '../store';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const resetStore = () => {
  useFeatures.setState({
    ready: false,
    presetId: 'complete',
    enabled: createDefaultEnabled('complete'),
  });
};

describe('experience store', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    resetStore();
  });

  it('starts with the complete experience when there is no stored value', async () => {
    await useFeatures.getState().load(true);
    expect(useFeatures.getState().presetId).toBe('complete');
    expect(useFeatures.getState().enabled.savings).toBe(true);
    expect(useFeatures.getState().enabled.quickAdd).toBe(false);
  });

  it('loads and normalizes a stored preset', async () => {
    await AsyncStorage.setItem(
      EXPERIENCE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        presetId: 'essential',
        enabled: createDefaultEnabled('essential'),
      })
    );
    await useFeatures.getState().load(true);
    expect(useFeatures.getState().presetId).toBe('essential');
    expect(useFeatures.getState().enabled.fixeds).toBe(false);
    expect(useFeatures.getState().enabled.quickAdd).toBe(true);
  });

  it('applies a preset and persists it', async () => {
    await useFeatures.getState().applyPreset('balanced');
    expect(useFeatures.getState().presetId).toBe('balanced');
    expect(useFeatures.getState().enabled.credits).toBe(true);
    expect(useFeatures.getState().enabled.savings).toBe(false);

    const stored = JSON.parse(
      (await AsyncStorage.getItem(EXPERIENCE_STORAGE_KEY)) ?? '{}'
    );
    expect(stored.presetId).toBe('balanced');
    expect(stored.enabled.credits).toBe(true);
  });

  it('enables dependencies when a module is turned on', async () => {
    await useFeatures.getState().applyPreset('essential');
    const adjustments = await useFeatures
      .getState()
      .setFeature('financings', true);

    expect(useFeatures.getState().enabled.fixeds).toBe(true);
    expect(useFeatures.getState().enabled.financings).toBe(true);
    expect(adjustments).toContainEqual({
      feature: 'fixeds',
      action: 'enabled',
      reason: 'financings',
    });
  });

  it('disables dependents when a module is turned off', async () => {
    await useFeatures.getState().applyPreset('balanced');
    const adjustments = await useFeatures.getState().setFeature('fixeds', false);

    expect(useFeatures.getState().enabled.fixeds).toBe(false);
    expect(useFeatures.getState().enabled.financings).toBe(false);
    expect(adjustments).toContainEqual({
      feature: 'financings',
      action: 'disabled',
      reason: 'fixeds',
    });
  });

  it('keeps the preset when only a capture preference changes', async () => {
    await useFeatures.getState().applyPreset('complete');
    await useFeatures.getState().setFeature('quickAdd', true);
    expect(useFeatures.getState().presetId).toBe('complete');
    expect(useFeatures.getState().enabled.quickAdd).toBe(true);
  });

  it('falls back to complete when the stored value is invalid', async () => {
    await AsyncStorage.setItem(EXPERIENCE_STORAGE_KEY, '{invalid');
    await useFeatures.getState().load(true);
    expect(useFeatures.getState().presetId).toBe('complete');
    expect(useFeatures.getState().enabled.summaries).toBe(true);
  });
});
