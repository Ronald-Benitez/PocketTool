import { FEATURE_IDS } from '@/src/features/definitions';
import { homeEn, homeEs } from '@/src/lang/messages/home';

import {
  DASHBOARD_ACTIONS,
  DASHBOARD_ACTION_LIST,
  DASHBOARD_BLOCK_LIST,
  DASHBOARD_BLOCK_IDS,
} from '../registry';

const readKey = (source: unknown, key: string) =>
  key.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[part];
  }, source);

describe('dashboard registry', () => {
  it('keeps unique and complete block definitions', () => {
    expect(new Set(DASHBOARD_BLOCK_IDS).size).toBe(DASHBOARD_BLOCK_IDS.length);
    expect(DASHBOARD_BLOCK_LIST).toHaveLength(DASHBOARD_BLOCK_IDS.length);
    expect(DASHBOARD_BLOCK_LIST.map((block) => block.id)).toEqual(
      DASHBOARD_BLOCK_IDS
    );
  });

  it('has bilingual labels and descriptions for every block', () => {
    for (const block of DASHBOARD_BLOCK_LIST) {
      expect(typeof readKey(homeEn, block.labelKey)).toBe('string');
      expect(typeof readKey(homeEs, block.labelKey)).toBe('string');
      expect(typeof readKey(homeEn, block.descriptionKey)).toBe('string');
      expect(typeof readKey(homeEs, block.descriptionKey)).toBe('string');
      expect(block.icon).toBeTruthy();
    }
  });

  it('uses valid feature ids or null', () => {
    for (const block of DASHBOARD_BLOCK_LIST) {
      if (block.feature) expect(FEATURE_IDS).toContain(block.feature);
      for (const feature of block.relatedFeatures ?? []) {
        expect(FEATURE_IDS).toContain(feature);
      }
    }
    for (const action of DASHBOARD_ACTION_LIST) {
      if (action.feature) expect(FEATURE_IDS).toContain(action.feature);
    }
  });

  it('keeps record as an always-available quick action', () => {
    expect(DASHBOARD_ACTIONS.record.feature).toBeNull();
    expect(
      DASHBOARD_ACTION_LIST.filter((action) => action.feature === null).map(
        (action) => action.id
      )
    ).toEqual(['record', 'group']);
  });

  it('only exposes the agreed default visible blocks', () => {
    expect(
      DASHBOARD_BLOCK_LIST.filter((block) => block.defaultVisible).map(
        (block) => block.id
      )
    ).toEqual([
      'summary',
      'obligations',
      'budget',
      'savings',
      'recentRecords',
    ]);
  });
});
