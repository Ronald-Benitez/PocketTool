import {
  createDefaultDashboardLayout,
  getVisibleDashboardBlocks,
  isDashboardActionAvailable,
  moveDashboardBlock,
  normalizeDashboardLayout,
  normalizeDashboardQuickActions,
  resetDashboardLayout,
  setDashboardBlockVisibility,
  setDashboardQuickActions,
} from '../layout';

describe('dashboard layout defaults', () => {
  it('uses the agreed default blocks and quick actions', () => {
    const layout = createDefaultDashboardLayout();

    expect(layout.version).toBe(1);
    expect(layout.quickActions).toEqual(['record']);
    expect(getVisibleDashboardBlocks(layout).map((block) => block.id)).toEqual([
      'summary',
      'obligations',
      'budget',
      'savings',
      'recentRecords',
    ]);
  });

  it('returns a fresh default layout on reset', () => {
    const layout = resetDashboardLayout();
    expect(layout).toEqual(createDefaultDashboardLayout());
    expect(layout).not.toBe(createDefaultDashboardLayout());
  });
});

describe('normalizeDashboardLayout', () => {
  it('falls back to defaults for invalid input', () => {
    expect(normalizeDashboardLayout(null)).toEqual(
      createDefaultDashboardLayout()
    );
    expect(normalizeDashboardLayout('nope')).toEqual(
      createDefaultDashboardLayout()
    );
  });

  it('drops unknown ids, deduplicates and appends missing blocks', () => {
    const layout = normalizeDashboardLayout({
      version: 1,
      blocks: [
        { id: 'savings', visible: false },
        { id: 'unknown', visible: true },
        { id: 'summary', visible: false },
        { id: 'summary', visible: true },
      ],
      quickActions: ['saving', 'unknown', 'saving'],
    });

    expect(layout.blocks.map((block) => block.id)).toEqual([
      'savings',
      'summary',
      'obligations',
      'budget',
      'people',
      'recentRecords',
      'credits',
      'vehicle',
      'closing',
    ]);
    expect(layout.blocks[0]).toEqual({ id: 'savings', visible: false });
    expect(layout.blocks[1]).toEqual({ id: 'summary', visible: false });
    expect(layout.quickActions).toEqual(['record', 'saving']);
  });

  it('uses default visibility for missing or invalid flags', () => {
    const layout = normalizeDashboardLayout({
      blocks: [{ id: 'people' }],
    });
    expect(layout.blocks[0]).toEqual({ id: 'people', visible: false });
  });
});

describe('normalizeDashboardQuickActions', () => {
  it('always keeps record available and limits the list', () => {
    expect(normalizeDashboardQuickActions(['fixed'])).toEqual([
      'record',
      'fixed',
    ]);
    expect(
      normalizeDashboardQuickActions(['record', 'fixed', 'saving', 'group'])
    ).toEqual(['record', 'fixed', 'saving', 'group']);
    expect(normalizeDashboardQuickActions([])).toEqual(['record']);
    expect(normalizeDashboardQuickActions('nope')).toEqual(['record']);
  });
});

describe('moveDashboardBlock', () => {
  it('moves a block without mutating the original layout', () => {
    const layout = createDefaultDashboardLayout();
    const next = moveDashboardBlock(layout, 0, 2);

    expect(next.blocks.map((block) => block.id).slice(0, 3)).toEqual([
      'obligations',
      'budget',
      'summary',
    ]);
    expect(layout.blocks[0].id).toBe('summary');
  });

  it('ignores invalid indexes and no-op moves', () => {
    const layout = createDefaultDashboardLayout();
    expect(moveDashboardBlock(layout, 0, 0)).toBe(layout);
    expect(moveDashboardBlock(layout, -1, 2)).toBe(layout);
    expect(moveDashboardBlock(layout, 0, 99)).toBe(layout);
  });
});

describe('visibility and quick actions', () => {
  it('toggles visibility and returns the same layout for a no-op', () => {
    const layout = createDefaultDashboardLayout();
    const hidden = setDashboardBlockVisibility(layout, 'budget', false);

    expect(
      hidden.blocks.find((block) => block.id === 'budget')?.visible
    ).toBe(false);
    expect(setDashboardBlockVisibility(hidden, 'budget', false)).toBe(hidden);
  });

  it('normalizes quick actions and returns the same layout for a no-op', () => {
    const layout = createDefaultDashboardLayout();
    const next = setDashboardQuickActions(layout, ['saving']);

    expect(next.quickActions).toEqual(['record', 'saving']);
    expect(setDashboardQuickActions(next, ['record', 'saving'])).toBe(next);
  });

  it('checks action availability against feature flags', () => {
    expect(isDashboardActionAvailable('record', {})).toBe(true);
    expect(isDashboardActionAvailable('fixed', { fixeds: false })).toBe(false);
    expect(isDashboardActionAvailable('fixed', { fixeds: true })).toBe(true);
    expect(isDashboardActionAvailable('saving', { savings: true })).toBe(true);
  });
});
