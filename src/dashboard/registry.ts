import type { TranslationKey } from '@/src/lang/messages';

import type {
  DashboardActionDefinition,
  DashboardActionId,
  DashboardBlockDefinition,
  DashboardBlockId,
} from './types';

const blockKey = (id: DashboardBlockId, part: 'label' | 'description') =>
  `dashboard.blocks.${id}.${part}` as TranslationKey;

const actionKey = (id: DashboardActionId, part: 'label' | 'description') =>
  `dashboard.actions.${id}.${part}` as TranslationKey;

export const DASHBOARD_BLOCK_IDS: DashboardBlockId[] = [
  'summary',
  'obligations',
  'budget',
  'savings',
  'people',
  'recentRecords',
  'credits',
  'vehicle',
  'closing',
];

export const DASHBOARD_BLOCKS: Record<
  DashboardBlockId,
  DashboardBlockDefinition
> = {
  summary: {
    id: 'summary',
    labelKey: blockKey('summary', 'label'),
    descriptionKey: blockKey('summary', 'description'),
    icon: 'account-balance-wallet',
    feature: 'summaries',
    defaultVisible: true,
    placement: 'hero',
  },
  obligations: {
    id: 'obligations',
    labelKey: blockKey('obligations', 'label'),
    descriptionKey: blockKey('obligations', 'description'),
    icon: 'event-note',
    feature: null,
    relatedFeatures: ['fixeds', 'financings', 'credits', 'vehicle'],
    defaultVisible: true,
    placement: 'full',
  },
  budget: {
    id: 'budget',
    labelKey: blockKey('budget', 'label'),
    descriptionKey: blockKey('budget', 'description'),
    icon: 'pie-chart-outline',
    feature: 'budget',
    defaultVisible: true,
    placement: 'full',
  },
  savings: {
    id: 'savings',
    labelKey: blockKey('savings', 'label'),
    descriptionKey: blockKey('savings', 'description'),
    icon: 'savings',
    feature: 'savings',
    defaultVisible: true,
    placement: 'full',
  },
  people: {
    id: 'people',
    labelKey: blockKey('people', 'label'),
    descriptionKey: blockKey('people', 'description'),
    icon: 'people-outline',
    feature: 'people',
    defaultVisible: false,
    placement: 'full',
  },
  recentRecords: {
    id: 'recentRecords',
    labelKey: blockKey('recentRecords', 'label'),
    descriptionKey: blockKey('recentRecords', 'description'),
    icon: 'receipt-long',
    feature: null,
    defaultVisible: true,
    placement: 'full',
  },
  credits: {
    id: 'credits',
    labelKey: blockKey('credits', 'label'),
    descriptionKey: blockKey('credits', 'description'),
    icon: 'credit-card',
    feature: 'credits',
    defaultVisible: false,
    placement: 'full',
  },
  vehicle: {
    id: 'vehicle',
    labelKey: blockKey('vehicle', 'label'),
    descriptionKey: blockKey('vehicle', 'description'),
    icon: 'directions-car',
    feature: 'vehicle',
    defaultVisible: false,
    placement: 'full',
  },
  closing: {
    id: 'closing',
    labelKey: blockKey('closing', 'label'),
    descriptionKey: blockKey('closing', 'description'),
    icon: 'calculate',
    feature: 'closing',
    defaultVisible: false,
    placement: 'full',
  },
};

export const DASHBOARD_BLOCK_LIST: DashboardBlockDefinition[] =
  DASHBOARD_BLOCK_IDS.map((id) => DASHBOARD_BLOCKS[id]);

export const DASHBOARD_ACTION_IDS: DashboardActionId[] = [
  'record',
  'fixed',
  'saving',
  'group',
];

export const DASHBOARD_ACTIONS: Record<
  DashboardActionId,
  DashboardActionDefinition
> = {
  record: {
    id: 'record',
    labelKey: actionKey('record', 'label'),
    descriptionKey: actionKey('record', 'description'),
    icon: 'add',
    feature: null,
  },
  fixed: {
    id: 'fixed',
    labelKey: actionKey('fixed', 'label'),
    descriptionKey: actionKey('fixed', 'description'),
    icon: 'event-repeat',
    feature: 'fixeds',
  },
  saving: {
    id: 'saving',
    labelKey: actionKey('saving', 'label'),
    descriptionKey: actionKey('saving', 'description'),
    icon: 'savings',
    feature: 'savings',
  },
  group: {
    id: 'group',
    labelKey: actionKey('group', 'label'),
    descriptionKey: actionKey('group', 'description'),
    icon: 'create-new-folder',
    feature: null,
  },
};

export const DASHBOARD_ACTION_LIST: DashboardActionDefinition[] =
  DASHBOARD_ACTION_IDS.map((id) => DASHBOARD_ACTIONS[id]);

export const DEFAULT_DASHBOARD_QUICK_ACTIONS: DashboardActionId[] = ['record'];

export const isDashboardBlockId = (value: unknown): value is DashboardBlockId =>
  typeof value === 'string' &&
  DASHBOARD_BLOCK_IDS.includes(value as DashboardBlockId);

export const isDashboardActionId = (
  value: unknown
): value is DashboardActionId =>
  typeof value === 'string' &&
  DASHBOARD_ACTION_IDS.includes(value as DashboardActionId);
