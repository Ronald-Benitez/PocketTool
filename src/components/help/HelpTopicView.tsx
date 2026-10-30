import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import { getHelpTopic } from '@/src/help/registry';
import type { HelpTopic } from '@/src/help/types';
import { Button } from '@/src/ui/actions/Button';
import { IconButton } from '@/src/ui/actions/IconButton';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import { radii, spacing } from '@/src/ui/theme/tokens';

type HelpTopicViewProps = {
  topic: HelpTopic;
  onBack: () => void;
  onSelectTopic: (topic: HelpTopic) => void;
};

export const HelpTopicView = ({
  topic,
  onBack,
  onSelectTopic,
}: HelpTopicViewProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();

  const bodyText = [
    t(topic.sections.what.bodyKey),
    t(topic.sections.how.bodyKey),
    ...topic.sections.steps.stepKeys.map((key) => t(key)),
    t(topic.sections.example.bodyKey),
    t(topic.sections.tips.bodyKey),
    t(topic.sections.warning.bodyKey),
  ].join(' ');
  const minutes = Math.max(1, Math.ceil(bodyText.split(/\s+/).length / 180));
  const relatedTopics = topic.related
    .map((id) => getHelpTopic(id))
    .filter((item): item is HelpTopic => Boolean(item));

  return (
    <Stack gap='lg'>
      <Button
        label={t('help.hub.back')}
        variant='ghost'
        size='sm'
        onPress={onBack}
        leftIcon={<MaterialIcons name='arrow-back' size={18} color={colors.primary} />}
        style={{ alignSelf: 'flex-start' }}
      />

      <Stack gap='xs'>
        <AppText variant='title'>{t(topic.titleKey)}</AppText>
        <AppText color='muted'>{t(topic.summaryKey)}</AppText>
        <AppText variant='caption' color='muted'>
          {t('help.hub.readTime', { minutes })}
        </AppText>
      </Stack>

      <Stack gap='md'>
        <AppText variant='subtitle'>{t(topic.sections.what.titleKey)}</AppText>
        <AppText>{t(topic.sections.what.bodyKey)}</AppText>

        <AppText variant='subtitle'>{t(topic.sections.how.titleKey)}</AppText>
        <AppText>{t(topic.sections.how.bodyKey)}</AppText>

        <AppText variant='subtitle'>{t(topic.sections.steps.titleKey)}</AppText>
        <Stack gap='sm'>
          {topic.sections.steps.stepKeys.map((stepKey, index) => (
            <View
              key={stepKey}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: spacing.sm,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: radii.pill,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppText
                  variant='caption'
                  style={{ color: colors.onPrimary, fontWeight: '700' }}
                >
                  {index + 1}
                </AppText>
              </View>
              <AppText style={{ flex: 1 }}>{t(stepKey)}</AppText>
            </View>
          ))}
        </Stack>

        <Surface variant='muted' padding='md'>
          <Stack gap='xs'>
            <AppText variant='label'>{t(topic.sections.example.titleKey)}</AppText>
            <AppText>{t(topic.sections.example.bodyKey)}</AppText>
          </Stack>
        </Surface>

        <Surface variant='outlined' padding='md'>
          <Stack gap='xs'>
            <AppText variant='label'>{t(topic.sections.tips.titleKey)}</AppText>
            <AppText color='muted'>{t(topic.sections.tips.bodyKey)}</AppText>
          </Stack>
        </Surface>

        <InlineMessage
          variant='warning'
          title={t(topic.sections.warning.titleKey)}
          message={t(topic.sections.warning.bodyKey)}
        />
      </Stack>

      {relatedTopics.length > 0 ? (
        <Stack gap='sm'>
          <AppText variant='subtitle'>{t('help.hub.related')}</AppText>
          <Surface variant='outlined' padding='none'>
            {relatedTopics.map((related, index) => (
              <ListItem
                key={related.id}
                title={t(related.titleKey)}
                subtitle={t(related.summaryKey)}
                leading={
                  <MaterialIcons
                    name={related.icon}
                    size={22}
                    color={colors.primary}
                  />
                }
                trailing={
                  <IconButton
                    label={t('help.hub.open')}
                    size='sm'
                    variant='ghost'
                    icon={<MaterialIcons name='chevron-right' size={20} color={colors.textMuted} />}
                    onPress={() => onSelectTopic(related)}
                  />
                }
                onPress={() => onSelectTopic(related)}
                showDivider={index < relatedTopics.length - 1}
              />
            ))}
          </Surface>
        </Stack>
      ) : null}
    </Stack>
  );
};
