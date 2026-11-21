/* eslint-disable @typescript-eslint/no-require-imports */
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  RECORD_DEFAULTS_KEY,
  useRecordDefaults,
} from '../useRecordDefaults';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const resetStore = () => {
  useRecordDefaults.setState({
    loaded: false,
    lastTypeId: null,
    lastCategoryId: null,
    lastPaymentMethodId: null,
    lastToPayMethodId: null,
  });
};

describe('record defaults', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    resetStore();
  });

  it('starts empty', async () => {
    await useRecordDefaults.getState().load();
    expect(useRecordDefaults.getState().lastTypeId).toBeNull();
    expect(useRecordDefaults.getState().lastCategoryId).toBeNull();
  });

  it('remembers the last valid values', async () => {
    await useRecordDefaults.getState().remember({
      lastTypeId: 2,
      lastCategoryId: 5,
      lastPaymentMethodId: 3,
      lastToPayMethodId: 4,
    });

    const stored = JSON.parse(
      (await AsyncStorage.getItem(RECORD_DEFAULTS_KEY)) ?? '{}'
    );
    expect(stored.lastTypeId).toBe(2);
    expect(stored.lastCategoryId).toBe(5);
    expect(stored.lastPaymentMethodId).toBe(3);
    expect(stored.lastToPayMethodId).toBe(4);
  });

  it('ignores invalid ids when loading', async () => {
    await AsyncStorage.setItem(
      RECORD_DEFAULTS_KEY,
      JSON.stringify({
        lastTypeId: -1,
        lastCategoryId: '5',
        lastPaymentMethodId: 0,
        lastToPayMethodId: null,
      })
    );
    await useRecordDefaults.getState().load();
    expect(useRecordDefaults.getState().lastTypeId).toBeNull();
    expect(useRecordDefaults.getState().lastCategoryId).toBeNull();
    expect(useRecordDefaults.getState().lastPaymentMethodId).toBeNull();
  });

  it('resets the stored values', async () => {
    await useRecordDefaults.getState().remember({ lastTypeId: 2 });
    await useRecordDefaults.getState().reset();
    expect(useRecordDefaults.getState().lastTypeId).toBeNull();
    expect(await AsyncStorage.getItem(RECORD_DEFAULTS_KEY)).toBeNull();
  });
});
