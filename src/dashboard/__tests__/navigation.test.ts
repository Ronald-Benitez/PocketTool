import {
  getAvailableDashboardBlocks,
  isDashboardBlockAvailable,
  isDashboardTargetEnabled,
  resolveDashboardBlockTarget,
} from '../navigation';
import { createDefaultDashboardLayout, setDashboardBlockVisibility } from '../layout';

describe('dashboard navigation', () => {
  it('maps blocks to their modules', () => {
    expect(resolveDashboardBlockTarget('summary')).toEqual({
      href: '/(summaries)',
      feature: 'summaries',
    });
    expect(resolveDashboardBlockTarget('budget')?.href).toBe('/(budget)');
    expect(resolveDashboardBlockTarget('recentRecords')?.feature).toBeNull();
    expect(resolveDashboardBlockTarget('obligations')).toEqual({
      href: '/(fixeds)',
      feature: 'fixeds',
    });
  });

  it('checks feature flags before opening a target', () => {
    expect(isDashboardTargetEnabled(null, {})).toBe(true);
    expect(
      isDashboardTargetEnabled(
        { href: '/(budget)', feature: 'budget' },
        { budget: false }
      )
    ).toBe(false);
    expect(
      isDashboardTargetEnabled(
        { href: '/(budget)', feature: 'budget' },
        { budget: true }
      )
    ).toBe(true);
  });

  it('gates blocks by their feature', () => {
    expect(isDashboardBlockAvailable('summary', { summaries: false })).toBe(
      false
    );
    expect(isDashboardBlockAvailable('summary', { summaries: true })).toBe(
      true
    );
    expect(isDashboardBlockAvailable('recentRecords', {})).toBe(true);
  });

  it('enables aggregated blocks when any related feature is active', () => {
    expect(isDashboardBlockAvailable('obligations', {})).toBe(false);
    expect(
      isDashboardBlockAvailable('obligations', { fixeds: true })
    ).toBe(true);
    expect(
      isDashboardBlockAvailable('obligations', { credits: true })
    ).toBe(true);
  });

  it('renders only visible and available blocks in their saved order', () => {
    const layout = createDefaultDashboardLayout();
    const enabled = {
      summaries: true,
      fixeds: true,
      budget: true,
      savings: false,
      credits: false,
    };

    const ids = getAvailableDashboardBlocks(layout, enabled).map(
      (block) => block.id
    );
    expect(ids).toEqual([
      'summary',
      'obligations',
      'budget',
      'recentRecords',
    ]);

    const hidden = setDashboardBlockVisibility(layout, 'summary', false);
    expect(
      getAvailableDashboardBlocks(hidden, enabled).map((block) => block.id)
    ).not.toContain('summary');
  });
});
