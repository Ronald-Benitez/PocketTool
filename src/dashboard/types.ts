import type { ComponentProps } from 'react';
import type { MaterialIcons } from '@expo/vector-icons';

import type { FeatureId } from '@/src/features';
import type { TranslationKey } from '@/src/lang/messages';

export const DASHBOARD_LAYOUT_VERSION = 1;

export type DashboardBlockId =
  | 'summary'
  | 'obligations'
  | 'budget'
  | 'savings'
  | 'people'
  | 'recentRecords'
  | 'credits'
  | 'vehicle'
  | 'closing';

export type DashboardActionId = 'record' | 'fixed' | 'saving' | 'group';

export type DashboardBlockPlacement = 'hero' | 'full';

export type DashboardBlockDefinition = {
  id: DashboardBlockId;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  /** Single feature that gates the block; null means always available. */
  feature: FeatureId | null;
  /** Additional features that can feed an aggregated block. */
  relatedFeatures?: FeatureId[];
  defaultVisible: boolean;
  placement: DashboardBlockPlacement;
};

export type DashboardActionDefinition = {
  id: DashboardActionId;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  feature: FeatureId | null;
};

export type DashboardBlockState = {
  id: DashboardBlockId;
  visible: boolean;
};

export type DashboardLayout = {
  version: typeof DASHBOARD_LAYOUT_VERSION;
  blocks: DashboardBlockState[];
  quickActions: DashboardActionId[];
};
