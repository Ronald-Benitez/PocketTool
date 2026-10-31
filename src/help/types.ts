import type { ComponentProps } from 'react';
import type { MaterialIcons } from '@expo/vector-icons';

import type { TranslationKey } from '@/src/lang/messages';

export type HelpCategory = 'start' | 'records' | 'planning' | 'money' | 'tools';

export type HelpTopicId =
  | 'gettingStarted'
  | 'groups'
  | 'records'
  | 'fixeds'
  | 'summaries'
  | 'budgets'
  | 'budgetTemplates'
  | 'vehicle'
  | 'vehicleFuel'
  | 'vehicleMaintenance'
  | 'vehicleReminders'
  | 'credits'
  | 'savings'
  | 'filters'
  | 'theme';

export type HelpTopicSection = {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
};

export type HelpTopicSteps = {
  titleKey: TranslationKey;
  stepKeys: TranslationKey[];
};

export type HelpTopic = {
  id: HelpTopicId;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  category: HelpCategory;
  titleKey: TranslationKey;
  summaryKey: TranslationKey;
  sections: {
    what: HelpTopicSection;
    how: HelpTopicSection;
    steps: HelpTopicSteps;
    example: HelpTopicSection;
    tips: HelpTopicSection;
    warning: HelpTopicSection;
  };
  related: HelpTopicId[];
};
