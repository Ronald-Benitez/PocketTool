import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type { DashboardBlockDefinition } from '@/src/dashboard/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { LinkButton } from '@/src/ui/actions/LinkButton';
import { SectionCard } from '@/src/ui/data-display/SectionCard';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

export type DashboardBlockProps = {
  definition: DashboardBlockDefinition;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const DashboardBlock = ({
  definition,
  children,
  actionLabel,
  onAction,
  padded = true,
  style,
}: DashboardBlockProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const title = t(definition.labelKey);

  return (
    <SectionCard
      title={title}
      icon={
        <MaterialIcons name={definition.icon} size={22} color={colors.primary} />
      }
      tooltip={{ title, body: t(definition.descriptionKey) }}
      action={
        onAction ? (
          <LinkButton
            label={actionLabel ?? t('dashboard.seeAll')}
            onPress={onAction}
          />
        ) : undefined
      }
      padded={padded}
      style={style}
    >
      {children}
    </SectionCard>
  );
};
