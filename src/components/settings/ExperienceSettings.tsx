import React, { useState } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import {
  EXPERIENCE_PRESET_IDS,
  FEATURE_DEFINITIONS,
  FEATURE_DEFINITION_LIST,
  FEATURE_GROUP_ORDER,
  PRESET_KEYS,
  useFeatures,
} from '@/src/features';
import type {
  ExperiencePresetId,
  FeatureGroup,
  FeatureId,
} from '@/src/features';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { Badge } from '@/src/ui/data-display/Badge';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { SwitchField } from '@/src/ui/forms/SwitchField';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const groupKey = (group: FeatureGroup) =>
  `features.modules.groups.${group}` as const;

export const ExperienceSettings = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const presetId = useFeatures((state) => state.presetId);
  const enabled = useFeatures((state) => state.enabled);
  const applyPreset = useFeatures((state) => state.applyPreset);
  const setFeature = useFeatures((state) => state.setFeature);
  const reset = useFeatures((state) => state.reset);
  const [busy, setBusy] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);

  const handlePreset = async (id: ExperiencePresetId) => {
    setBusy(true);
    try {
      await applyPreset(id);
    } finally {
      setBusy(false);
    }
  };

  const handleFeature = async (id: FeatureId, value: boolean) => {
    setBusy(true);
    try {
      const adjustments = await setFeature(id, value);
      const adjustment = adjustments[0];
      if (!adjustment) return;

      const feature = FEATURE_DEFINITIONS[adjustment.feature];
      const dependency = FEATURE_DEFINITIONS[adjustment.reason];
      showToast({
        message: t(
          adjustment.action === 'enabled'
            ? 'features.dependencies.enabled'
            : 'features.dependencies.disabled',
          {
            feature: t(feature.labelKey),
            dependency: t(dependency.labelKey),
          }
        ),
        type: 'info',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setResetVisible(false);
    setBusy(true);
    try {
      await reset();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack gap='lg'>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <AppText variant='label'>{t('features.presets.title')}</AppText>
        {presetId === 'custom' ? (
          <Badge label={t('features.presets.custom.label')} tone='info' />
        ) : null}
      </View>

      <Surface variant='outlined' padding='none'>
        {EXPERIENCE_PRESET_IDS.map((id, index) => {
          const selected = presetId === id;
          return (
            <ListItem
              key={id}
              title={t(PRESET_KEYS[id].labelKey)}
              subtitle={t(PRESET_KEYS[id].descriptionKey)}
              selected={selected}
              disabled={busy}
              onPress={() => void handlePreset(id)}
              accessibilityRole='radio'
              accessibilityState={{ checked: selected, disabled: busy }}
              trailing={
                selected ? (
                  <MaterialIcons
                    name='check-circle'
                    size={22}
                    color={colors.primary}
                  />
                ) : undefined
              }
              showDivider={index < EXPERIENCE_PRESET_IDS.length - 1}
            />
          );
        })}
      </Surface>

      <InlineMessage variant='info' message={t('features.dataSafe')} />

      <AppText variant='label'>{t('features.modules.title')}</AppText>

      {FEATURE_GROUP_ORDER.map((group) => (
        <Stack key={group} gap='sm'>
          <AppText variant='caption' color='muted'>
            {t(groupKey(group))}
          </AppText>
          {FEATURE_DEFINITION_LIST.filter(
            (definition) => definition.group === group
          ).map((definition) => (
            <SwitchField
              key={definition.id}
              label={t(definition.labelKey)}
              description={t(definition.descriptionKey)}
              value={enabled[definition.id]}
              disabled={busy}
              onChange={(value) => void handleFeature(definition.id, value)}
            />
          ))}
        </Stack>
      ))}

      <Button
        label={t('features.reset')}
        variant='outline'
        onPress={() => setResetVisible(true)}
        disabled={busy}
      />

      <ConfirmDialog
        visible={resetVisible}
        title={t('features.resetConfirmTitle')}
        message={t('features.resetConfirmMessage')}
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        onConfirm={() => void handleReset()}
        onCancel={() => setResetVisible(false)}
      />
    </Stack>
  );
};
