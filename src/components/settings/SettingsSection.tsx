import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type SettingsSectionProps = {
  title: string;
  description?: string;
  keywords?: string[];
  search?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export const SettingsSection = ({
  title,
  description,
  keywords = [],
  search = '',
  defaultOpen = false,
  children,
}: SettingsSectionProps) => {
  const { colors } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const normalizedSearch = search.trim().toLowerCase();
  const matches =
    !normalizedSearch ||
    [title, description ?? '', ...keywords].some((value) =>
      value.toLowerCase().includes(normalizedSearch)
    );

  useEffect(() => {
    if (normalizedSearch) setOpen(true);
  }, [normalizedSearch]);

  if (!matches) return null;

  return (
    <Surface variant='outlined' padding='none'>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        accessibilityRole='button'
        accessibilityState={{ expanded: open }}
      >
        <Row justify='space-between' align='center' gap='sm' style={styles.header}>
          <Stack gap='xxs' style={{ flex: 1 }}>
            <AppText weight='600'>{title}</AppText>
            {description ? (
              <AppText variant='caption' color='muted'>
                {description}
              </AppText>
            ) : null}
          </Stack>
          <MaterialIcons
            name={open ? 'expand-less' : 'expand-more'}
            size={24}
            color={colors.textMuted}
          />
        </Row>
      </Pressable>
      {open ? <View style={styles.content}>{children}</View> : null}
    </Surface>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
});
