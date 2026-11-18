import type { TranslationKey } from '@/src/lang/messages';
import type { WhatsNewItemId } from '@/src/lang/messages/whatsNew';

export type ReleaseNoteKind = 'feature' | 'improvement' | 'fix';

export type ReleaseNoteItem = {
  kind: ReleaseNoteKind;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
};

export type ReleaseNote = {
  version: string;
  /** ISO date (YYYY-MM-DD) used only for display. */
  date: string;
  items: ReleaseNoteItem[];
};

/**
 * First release that includes the release notes screen. When no stored version
 * exists, this release is shown once to users updating from an older build.
 */
export const RELEASE_NOTES_LAUNCH_EXCEPTION_VERSION = '4.0.5';

const whatsNewItem = (
  id: WhatsNewItemId,
  kind: ReleaseNoteKind
): ReleaseNoteItem => ({
  kind,
  titleKey: `whatsNew.items.${id}.title` as TranslationKey,
  bodyKey: `whatsNew.items.${id}.body` as TranslationKey,
});

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '4.0.5',
    date: '2026-11-17',
    items: [
      whatsNewItem('sharedPurchases', 'feature'),
      whatsNewItem('personStatement', 'feature'),
      whatsNewItem('balanceModes', 'improvement'),
      whatsNewItem('amountSharing', 'feature'),
      whatsNewItem('autoRefresh', 'improvement'),
      whatsNewItem('centeredPickers', 'improvement'),
      whatsNewItem('cardPaymentDate', 'feature'),
      whatsNewItem('fuelSegments', 'improvement'),
      whatsNewItem('whatsNewRelease', 'feature'),
    ],
  },
];
