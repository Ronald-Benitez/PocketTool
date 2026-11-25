import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';

import {
  EXPERIENCE_ONBOARDED_KEY,
  EXPERIENCE_ONBOARDED_VERSION,
  EXPERIENCE_PRESET_IDS,
  EXPERIENCE_STORAGE_KEY,
  PRESET_KEYS,
  useFeatures,
} from '@/src/features';
import type { ExperiencePresetId } from '@/src/features';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useWhatsNew } from '@/src/hooks/useWhatsNew';
import { Button } from '@/src/ui/actions/Button';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

export const ExperienceOnboardingGate = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const presetId = useFeatures((state) => state.presetId);
  const applyPreset = useFeatures((state) => state.applyPreset);
  const whatsNewReady = useWhatsNew((state) => state.ready);
  const whatsNewVisible = useWhatsNew((state) => state.visible);
  const whatsNewPending = useWhatsNew((state) => state.pending);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<ExperiencePresetId>('complete');
  const deferred = useRef(false);
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    if (!whatsNewReady) return;

    if (whatsNewVisible || whatsNewPending.length > 0) {
      deferred.current = true;
      checked.current = true;
      return;
    }

    if (deferred.current) return;

    const check = async () => {
      try {
        const [onboarded, settings] = await Promise.all([
          AsyncStorage.getItem(EXPERIENCE_ONBOARDED_KEY),
          AsyncStorage.getItem(EXPERIENCE_STORAGE_KEY),
        ]);
        if (onboarded || settings) {
          checked.current = true;
          return;
        }
        setSelected(presetId === 'custom' ? 'complete' : presetId);
        setVisible(true);
        checked.current = true;
      } catch {
        checked.current = true;
      }
    };

    void check();
  }, [
    presetId,
    whatsNewPending.length,
    whatsNewReady,
    whatsNewVisible,
  ]);

  const finish = async (preset?: ExperiencePresetId) => {
    try {
      if (preset) await applyPreset(preset);
      await AsyncStorage.setItem(
        EXPERIENCE_ONBOARDED_KEY,
        EXPERIENCE_ONBOARDED_VERSION
      );
    } finally {
      setVisible(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={() => void finish()}
      title={t('features.onboarding.title')}
      closeLabel={t('features.onboarding.later')}
      placement='bottom'
      dismissOnBackdrop={false}
      showCloseButton={false}
      scrollable
      footer={
        <Row gap='sm' style={{ flex: 1 }}>
          <Button
            label={t('features.onboarding.later')}
            variant='outline'
            onPress={() => void finish()}
            style={{ flex: 1 }}
          />
          <Button
            label={t('features.onboarding.start')}
            onPress={() => void finish(selected)}
            style={{ flex: 1 }}
          />
        </Row>
      }
    >
      <Stack gap='md'>
        <AppText color='muted'>{t('features.onboarding.body')}</AppText>
        <Surface variant='outlined' padding='none'>
          {EXPERIENCE_PRESET_IDS.map((id, index) => {
            const isSelected = selected === id;
            return (
              <ListItem
                key={id}
                title={t(PRESET_KEYS[id].labelKey)}
                subtitle={t(PRESET_KEYS[id].descriptionKey)}
                selected={isSelected}
                onPress={() => setSelected(id)}
                accessibilityRole='radio'
                accessibilityState={{ checked: isSelected }}
                trailing={
                  isSelected ? (
                    <AppText style={{ color: colors.primary, fontWeight: '700' }}>
                      ✓
                    </AppText>
                  ) : undefined
                }
                showDivider={index < EXPERIENCE_PRESET_IDS.length - 1}
              />
            );
          })}
        </Surface>
        <InlineMessage variant='info' message={t('features.dataSafe')} />
      </Stack>
    </Modal>
  );
};
