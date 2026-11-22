/* eslint-disable @typescript-eslint/no-require-imports */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createDefaultDashboardLayout } from '../layout';
import { DASHBOARD_STORAGE_KEY, useDashboardLayout } from '../store';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const resetStore = () => {
  useDashboardLayout.setState({
    ...createDefaultDashboardLayout(),
    loaded: false,
  });
};

const readStored = async () => {
  const raw = await AsyncStorage.getItem(DASHBOARD_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
};

describe('dashboard layout store', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    resetStore();
  });

  it('loads defaults when there is no stored layout', async () => {
    await useDashboardLayout.getState().load(true);
    const state = useDashboardLayout.getState();

    expect(state.loaded).toBe(true);
    expect(state.quickActions).toEqual(['record']);
    expect(state.blocks.find((block) => block.id === 'budget')?.visible).toBe(
      true
    );
  });

  it('normalizes a stored layout', async () => {
    await AsyncStorage.setItem(
      DASHBOARD_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        blocks: [
          { id: 'savings', visible: false },
          { id: 'nope', visible: true },
        ],
        quickActions: ['fixed', 'fixed'],
      })
    );

    await useDashboardLayout.getState().load(true);
    const state = useDashboardLayout.getState();

    expect(state.blocks[0]).toEqual({ id: 'savings', visible: false });
    expect(state.blocks).toHaveLength(9);
    expect(state.quickActions).toEqual(['record', 'fixed']);
  });

  it('persists a reorder', async () => {
    await useDashboardLayout.getState().load(true);
    await useDashboardLayout.getState().moveBlock(0, 2);

    const stored = await readStored();
    expect(stored.blocks[0].id).toBe('obligations');
    expect(stored.blocks[2].id).toBe('summary');
  });

  it('persists visibility and quick actions', async () => {
    await useDashboardLayout.getState().load(true);
    await useDashboardLayout.getState().setVisibility('budget', false);
    await useDashboardLayout.getState().setQuickActions(['saving']);

    const stored = await readStored();
    expect(
      stored.blocks.find((block: { id: string }) => block.id === 'budget')
        ?.visible
    ).toBe(false);
    expect(stored.quickActions).toEqual(['record', 'saving']);
  });

  it('resets to the default layout', async () => {
    await useDashboardLayout.getState().load(true);
    await useDashboardLayout.getState().setVisibility('summary', false);
    await useDashboardLayout.getState().reset();

    const state = useDashboardLayout.getState();
    expect(state.blocks).toEqual(createDefaultDashboardLayout().blocks);
    expect(await readStored()).toEqual(createDefaultDashboardLayout());
  });

  it('falls back to defaults for corrupted storage', async () => {
    await AsyncStorage.setItem(DASHBOARD_STORAGE_KEY, '{invalid');
    await useDashboardLayout.getState().load(true);

    expect(useDashboardLayout.getState().blocks).toEqual(
      createDefaultDashboardLayout().blocks
    );
  });

  it('reverts the optimistic change when persistence fails', async () => {
    await useDashboardLayout.getState().load(true);
    const setItem = jest
      .spyOn(AsyncStorage, 'setItem')
      .mockRejectedValueOnce(new Error('write failed'));

    await expect(
      useDashboardLayout.getState().setVisibility('summary', false)
    ).rejects.toThrow('write failed');

    expect(
      useDashboardLayout
        .getState()
        .blocks.find((block) => block.id === 'summary')?.visible
    ).toBe(true);
    setItem.mockRestore();
  });
});
