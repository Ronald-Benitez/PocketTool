import type { TranslationKey } from '@/src/lang/messages';
import type {
  HelpCategory,
  HelpTopic,
  HelpTopicId,
} from './types';

type HelpTopicSeed = Omit<
  HelpTopic,
  'titleKey' | 'summaryKey' | 'sections'
>;

const topicKeys = (id: HelpTopicId) => ({
  titleKey: `help.topics.${id}.title` as TranslationKey,
  summaryKey: `help.topics.${id}.summary` as TranslationKey,
  sections: {
    what: {
      titleKey: `help.topics.${id}.what.title` as TranslationKey,
      bodyKey: `help.topics.${id}.what.body` as TranslationKey,
    },
    how: {
      titleKey: `help.topics.${id}.how.title` as TranslationKey,
      bodyKey: `help.topics.${id}.how.body` as TranslationKey,
    },
    steps: {
      titleKey: `help.topics.${id}.steps.title` as TranslationKey,
      stepKeys: [
        `help.topics.${id}.steps.step1`,
        `help.topics.${id}.steps.step2`,
        `help.topics.${id}.steps.step3`,
      ] as TranslationKey[],
    },
    example: {
      titleKey: `help.topics.${id}.example.title` as TranslationKey,
      bodyKey: `help.topics.${id}.example.body` as TranslationKey,
    },
    tips: {
      titleKey: `help.topics.${id}.tips.title` as TranslationKey,
      bodyKey: `help.topics.${id}.tips.body` as TranslationKey,
    },
    warning: {
      titleKey: `help.topics.${id}.warning.title` as TranslationKey,
      bodyKey: `help.topics.${id}.warning.body` as TranslationKey,
    },
  },
});

const seeds: HelpTopicSeed[] = [
  {
    id: 'gettingStarted',
    icon: 'rocket-launch',
    category: 'start',
    related: ['groups', 'records'],
  },
  {
    id: 'groups',
    icon: 'folder',
    category: 'start',
    related: ['gettingStarted', 'records'],
  },
  {
    id: 'records',
    icon: 'receipt-long',
    category: 'records',
    related: ['groups', 'fixeds', 'filters'],
  },
  {
    id: 'fixeds',
    icon: 'event-repeat',
    category: 'records',
    related: ['records', 'summaries'],
  },
  {
    id: 'summaries',
    icon: 'insights',
    category: 'records',
    related: ['records', 'budgets'],
  },
  {
    id: 'budgets',
    icon: 'pie-chart',
    category: 'planning',
    related: ['summaries', 'records'],
  },
  {
    id: 'credits',
    icon: 'credit-card',
    category: 'money',
    related: ['records', 'summaries'],
  },
  {
    id: 'savings',
    icon: 'savings',
    category: 'money',
    related: ['summaries'],
  },
  {
    id: 'filters',
    icon: 'filter-alt',
    category: 'tools',
    related: ['records', 'summaries'],
  },
  {
    id: 'theme',
    icon: 'palette',
    category: 'tools',
    related: ['gettingStarted'],
  },
];

export const HELP_TOPICS: HelpTopic[] = seeds.map((seed) => ({
  ...seed,
  ...topicKeys(seed.id),
}));

export const HELP_CATEGORIES: HelpCategory[] = [
  'start',
  'records',
  'planning',
  'money',
  'tools',
];

export const getHelpTopic = (id: string | undefined): HelpTopic | undefined =>
  HELP_TOPICS.find((topic) => topic.id === id);

export const getTopicsByCategory = (category: HelpCategory): HelpTopic[] =>
  HELP_TOPICS.filter((topic) => topic.category === category);
