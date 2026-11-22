import { budgetEn, budgetEs } from './budget';
import { catalogsEn, catalogsEs } from './catalogs';
import { chartsEn, chartsEs } from './charts';
import { closingEn, closingEs } from './closings';
import { commonEn, commonEs } from './common';
import { datesEn, datesEs } from './dates';
import { groupsEn, groupsEs } from './groups';
import { headersEn, headersEs } from './headers';
import { helpEn, helpEs } from './help';
import { shoppingEn, shoppingEs } from './shopping';
import { homeEn, homeEs } from './home';
import { recordsEn, recordsEs } from './records';
import { settingsEn, settingsEs } from './settings';
import { sharedEn, sharedEs } from './shared';
import { summariesEn, summariesEs } from './summaries';
import { featuresEn, featuresEs } from './features';
import { filtersEn, filtersEs } from './filters';
import { financingsEn, financingsEs } from './financings';
import { vehicleEn, vehicleEs } from './vehicle';
import { whatsNewEn, whatsNewEs } from './whatsNew';
import type { Language, Leaves, MessageShape } from './types';

export const en = {
  ...commonEn,
  ...chartsEn,
  ...closingEn,
  ...datesEn,
  ...headersEn,
  ...homeEn,
  ...groupsEn,
  ...catalogsEn,
  ...recordsEn,
  ...filtersEn,
  ...featuresEn,
  ...settingsEn,
  ...sharedEn,
  ...summariesEn,
  budget: budgetEn,
  ...financingsEn,
  vehicle: vehicleEn,
  shopping: shoppingEn,
  whatsNew: whatsNewEn,
  help: helpEn,
} as const;

export const es: MessageShape<typeof en> = {
  ...commonEs,
  ...chartsEs,
  ...closingEs,
  ...datesEs,
  ...headersEs,
  ...homeEs,
  ...groupsEs,
  ...catalogsEs,
  ...recordsEs,
  ...filtersEs,
  ...featuresEs,
  ...settingsEs,
  ...sharedEs,
  ...summariesEs,
  budget: budgetEs,
  ...financingsEs,
  vehicle: vehicleEs,
  shopping: shoppingEs,
  whatsNew: whatsNewEs,
  help: helpEs,
};

export const messages: Record<Language, MessageShape<typeof en>> = {
  en,
  es,
};

export type HelpTopicKeys = {
  [K in keyof typeof helpEn.topics]: Leaves<
    (typeof helpEn.topics)[K],
    `help.topics.${K & string}.`
  >;
}[keyof typeof helpEn.topics];

export type HelpTranslationKey =
  | Leaves<typeof helpEn.hub, 'help.hub.'>
  | Leaves<typeof helpEn.categories, 'help.categories.'>
  | HelpTopicKeys;

export type TranslationKey =
  | Leaves<typeof commonEn>
  | Leaves<typeof chartsEn>
  | Leaves<typeof closingEn>
  | Leaves<typeof datesEn>
  | Leaves<typeof headersEn>
  | Leaves<typeof homeEn>
  | Leaves<typeof groupsEn>
  | Leaves<typeof catalogsEn>
  | Leaves<typeof recordsEn>
  | Leaves<typeof filtersEn>
  | Leaves<typeof featuresEn>
  | Leaves<typeof settingsEn>
  | Leaves<typeof sharedEn>
  | Leaves<typeof summariesEn>
  | Leaves<typeof budgetEn, 'budget.'>
  | Leaves<typeof financingsEn>
  | Leaves<typeof vehicleEn, 'vehicle.'>
  | Leaves<typeof shoppingEn, 'shopping.'>
  | Leaves<typeof whatsNewEn, 'whatsNew.'>
  | HelpTranslationKey;
