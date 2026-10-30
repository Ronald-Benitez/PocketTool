import { HELP_CATEGORIES, HELP_TOPICS, getHelpTopic, getTopicsByCategory } from '../registry';
import { helpCategoryKey } from '@/src/lang/keys';
import { translate } from '@/src/lang/translate';

describe('help registry', () => {
  it('has unique topic ids', () => {
    const ids = HELP_TOPICS.map((topic) => topic.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every topic has required content in both languages', () => {
    for (const topic of HELP_TOPICS) {
      const keys = [
        topic.titleKey,
        topic.summaryKey,
        topic.sections.what.titleKey,
        topic.sections.what.bodyKey,
        topic.sections.how.titleKey,
        topic.sections.how.bodyKey,
        topic.sections.steps.titleKey,
        ...topic.sections.steps.stepKeys,
        topic.sections.example.titleKey,
        topic.sections.example.bodyKey,
        topic.sections.tips.titleKey,
        topic.sections.tips.bodyKey,
        topic.sections.warning.titleKey,
        topic.sections.warning.bodyKey,
      ];

      for (const key of keys) {
        expect(translate('en', key)).not.toBe(key);
        expect(translate('es', key)).not.toBe(key);
      }
    }
  });

  it('has valid categories and related topics', () => {
    for (const topic of HELP_TOPICS) {
      expect(HELP_CATEGORIES).toContain(topic.category);

      for (const relatedId of topic.related) {
        expect(getHelpTopic(relatedId)).toBeDefined();
      }
    }

    for (const category of HELP_CATEGORIES) {
      expect(translate('en', helpCategoryKey(category))).not.toBe(
        helpCategoryKey(category)
      );
      expect(getTopicsByCategory(category).length).toBeGreaterThan(0);
    }
  });

  it('each topic has three steps', () => {
    for (const topic of HELP_TOPICS) {
      expect(topic.sections.steps.stepKeys).toHaveLength(3);
    }
  });
});
