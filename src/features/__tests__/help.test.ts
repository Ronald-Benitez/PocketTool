import { HELP_TOPICS } from '@/src/help/registry';
import type { HelpTopicId } from '@/src/help/types';

import { HELP_TOPIC_FEATURES, isHelpTopicEnabled } from '../help';
import { createDefaultEnabled } from '../normalize';

describe('help feature map', () => {
  it('maps only existing help topics', () => {
    const ids = new Set(HELP_TOPICS.map((topic) => topic.id));
    for (const topicId of Object.keys(HELP_TOPIC_FEATURES)) {
      expect(ids.has(topicId as HelpTopicId)).toBe(true);
    }
  });

  it('keeps core topics visible', () => {
    const essential = createDefaultEnabled('essential');
    expect(isHelpTopicEnabled('gettingStarted', essential)).toBe(true);
    expect(isHelpTopicEnabled('records', essential)).toBe(true);
    expect(isHelpTopicEnabled('experience', essential)).toBe(true);
  });

  it('hides topics for disabled modules', () => {
    const essential = createDefaultEnabled('essential');
    expect(isHelpTopicEnabled('credits', essential)).toBe(false);
    expect(isHelpTopicEnabled('savings', essential)).toBe(false);
    expect(isHelpTopicEnabled('summaries', essential)).toBe(true);
  });
});
