import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { HelpTopicView } from '@/src/components/help/HelpTopicView';
import { HELP_CATEGORIES, HELP_TOPICS } from '@/src/help/registry';
import type { HelpTopic } from '@/src/help/types';
import { helpCategoryKey } from '@/src/lang/keys';
import { useLanguage } from '@/src/lang/LanguageContext';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { TextField } from '@/src/ui/forms/TextField';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const Index = () => {
  const { t, language } = useLanguage();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);

  const filteredTopics = useMemo(() => {
    const term = normalize(search);
    return HELP_TOPICS.filter((topic) => {
      const text = [
        t(topic.titleKey),
        t(topic.summaryKey),
        t(topic.sections.what.titleKey),
        t(topic.sections.what.bodyKey),
        t(topic.sections.how.titleKey),
        t(topic.sections.how.bodyKey),
        ...topic.sections.steps.stepKeys.map((key) => t(key)),
        t(topic.sections.example.bodyKey),
        t(topic.sections.tips.bodyKey),
        t(topic.sections.warning.bodyKey),
      ].join(' ');
      return normalize(text).includes(term);
    });
  }, [search, language, t]);

  if (selectedTopic) {
    return (
      <Screen scroll edges={['left', 'right']}>
        <HelpTopicView
          topic={selectedTopic}
          onBack={() => setSelectedTopic(null)}
          onSelectTopic={setSelectedTopic}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['left', 'right']}>
      <Stack gap='lg'>
        <Stack gap='xs'>
          <AppText variant='title'>{t('help.hub.title')}</AppText>
          <AppText color='muted'>{t('help.hub.subtitle')}</AppText>
        </Stack>

        <TextField
          value={search}
          onChangeText={setSearch}
          placeholder={t('help.hub.searchPlaceholder')}
          leftIcon={<MaterialIcons name='search' size={18} color={colors.textMuted} />}
          autoCapitalize='none'
          autoCorrect={false}
        />

        {filteredTopics.length === 0 ? (
          <EmptyState
            title={t('help.hub.noResults')}
            icon={<MaterialIcons name='search-off' size={28} color={colors.textMuted} />}
          />
        ) : (
          HELP_CATEGORIES.map((category) => {
            const topics = filteredTopics.filter((topic) => topic.category === category);
            if (topics.length === 0) return null;

            return (
              <Stack key={category} gap='sm'>
                <AppText variant='subtitle'>{t(helpCategoryKey(category))}</AppText>
                <Surface variant='outlined' padding='none'>
                  {topics.map((topic, index) => (
                    <ListItem
                      key={topic.id}
                      title={t(topic.titleKey)}
                      subtitle={t(topic.summaryKey)}
                      leading={
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: colors.surfaceMuted,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <MaterialIcons
                            name={topic.icon}
                            size={18}
                            color={colors.primary}
                          />
                        </View>
                      }
                      trailing={
                        <MaterialIcons
                          name='chevron-right'
                          size={20}
                          color={colors.textMuted}
                        />
                      }
                      onPress={() => setSelectedTopic(topic)}
                      showDivider={index < topics.length - 1}
                    />
                  ))}
                </Surface>
              </Stack>
            );
          })
        )}
      </Stack>
    </Screen>
  );
};

export default Index;
