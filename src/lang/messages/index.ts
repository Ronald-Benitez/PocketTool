import { budgetEn, budgetEs } from './budget';
import { catalogsEn, catalogsEs } from './catalogs';
import { commonEn, commonEs } from './common';
import { datesEn, datesEs } from './dates';
import { groupsEn, groupsEs } from './groups';
import { headersEn, headersEs } from './headers';
import { helpEn, helpEs } from './help';
import { homeEn, homeEs } from './home';
import { recordsEn, recordsEs } from './records';
import { settingsEn, settingsEs } from './settings';
import { summariesEn, summariesEs } from './summaries';
import { filtersEn, filtersEs } from './filters';
import type { Language, Leaves, MessageShape } from './types';

export const en = {
  ...commonEn,
  ...datesEn,
  ...headersEn,
  ...homeEn,
  ...groupsEn,
  ...catalogsEn,
  ...recordsEn,
  ...filtersEn,
  ...settingsEn,
  ...summariesEn,
  budget: budgetEn,
  help: helpEn,
} as const;

export const es: MessageShape<typeof en> = {
  ...commonEs,
  ...datesEs,
  ...headersEs,
  ...homeEs,
  ...groupsEs,
  ...catalogsEs,
  ...recordsEs,
  ...filtersEs,
  ...settingsEs,
  ...summariesEs,
  budget: budgetEs,
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
  | Leaves<typeof datesEn>
  | Leaves<typeof headersEn>
  | Leaves<typeof homeEn>
  | Leaves<typeof groupsEn>
  | Leaves<typeof catalogsEn>
  | Leaves<typeof recordsEn>
  | Leaves<typeof filtersEn>
  | Leaves<typeof settingsEn>
  | Leaves<typeof summariesEn>
  | Leaves<typeof budgetEn, 'budget.'>
  | HelpTranslationKey;
