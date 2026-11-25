import React from 'react';

import { useWhatsNew } from '@/src/hooks/useWhatsNew';
import type { TranslationKey } from '@/src/lang/messages';
import { useLanguage } from '@/src/lang/LanguageContext';
import {
  RELEASE_NOTES,
  type ReleaseNoteKind,
} from '@/src/release-notes/catalog';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { Button } from '@/src/ui/actions/Button';
import { Badge, type BadgeTone } from '@/src/ui/data-display/Badge';
import { Modal } from '@/src/ui/overlays/Modal';

const BADGE_TONES: Record<ReleaseNoteKind, BadgeTone> = {
  feature: 'primary',
  improvement: 'info',
  fix: 'warning',
};

const formatReleaseDate = (date: string, language: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString(
    language === 'es' ? 'es' : 'en',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

export const WhatsNewModal = () => {
  const { t, language } = useLanguage();
  const visible = useWhatsNew((state) => state.visible);
  const mode = useWhatsNew((state) => state.mode);
  const pending = useWhatsNew((state) => state.pending);
  const close = useWhatsNew((state) => state.close);

  const notes = mode === 'manual' ? RELEASE_NOTES : pending;
  const subtitleKey: TranslationKey =
    mode === 'manual'
      ? 'whatsNew.modal.manualSubtitle'
      : 'whatsNew.modal.subtitle';

  return (
    <Modal
      visible={visible && notes.length > 0}
      onClose={close}
      title={t('whatsNew.modal.title')}
      scrollable
      showCloseButton={false}
      dismissOnBackdrop={false}
      footer={
        <Button
          label={t('whatsNew.modal.dismiss')}
          onPress={close}
          fullWidth
          style={{ flex: 1 }}
        />
      }
    >
      <AppText color='muted'>{t(subtitleKey)}</AppText>

      {notes.length > 1 ? (
        <AppText variant='caption' color='muted'>
          {t('whatsNew.modal.range', {
            from: notes[0].version,
            to: notes[notes.length - 1].version,
          })}
        </AppText>
      ) : null}

      {notes.map((note) => (
        <Surface key={note.version} variant='outlined' padding='md'>
          <Stack gap='sm'>
            <Row align='center' justify='space-between' gap='sm'>
              <AppText variant='subtitle'>{`PocketTool ${note.version}`}</AppText>
              <AppText variant='caption' color='muted'>
                {formatReleaseDate(note.date, language)}
              </AppText>
            </Row>

            <Stack gap='md'>
              {note.items.map((item) => (
                <Stack key={item.titleKey} gap='xxs'>
                  <Row align='center' gap='xs'>
                    <Badge
                      label={t(`whatsNew.badges.${item.kind}` as TranslationKey)}
                      tone={BADGE_TONES[item.kind]}
                      size='sm'
                    />
                    <AppText variant='label' style={{ flex: 1 }}>
                      {t(item.titleKey)}
                    </AppText>
                  </Row>
                  <AppText variant='caption' color='muted'>
                    {t(item.bodyKey)}
                  </AppText>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Surface>
      ))}
    </Modal>
  );
};
