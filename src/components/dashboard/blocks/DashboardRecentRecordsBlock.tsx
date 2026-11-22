import React from 'react';

import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
import { useDashboardNavigation } from '@/src/components/dashboard/useDashboardNavigation';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { AppText } from '@/src/ui/primitives/AppText';
import { View } from 'react-native';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

export const DashboardRecentRecordsBlock = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { records } = useRecordsStore();
  const { openBlock } = useDashboardNavigation();

  const latest = [...records]
    .sort((left, right) => right.date - left.date)
    .slice(0, 4);

  if (latest.length === 0) {
    return (
      <AppText variant='caption' color='muted' style={{ padding: 16 }}>
        {t('dashboard.noRecords')}
      </AppText>
    );
  }

  return (
    <View>
      {latest.map((record, index) => (
        <ListItem
          key={record.id ?? `${record.date}-${index}`}
          title={record.record_name}
          subtitle={`${record.RecordTypes?.type_name ?? ''} · ${new Date(
            record.date
          ).toLocaleDateString()}`}
          leading={
            <View
              style={{
                width: 4,
                height: 28,
                borderRadius: 2,
                backgroundColor:
                  record.RecordTypes?.record_color ?? colors.primary,
              }}
            />
          }
          trailing={
            <FinanceValue
              cents={record.own_amount_cents ?? record.amount}
              size='md'
              color={colors.text}
            />
          }
          onPress={() => openBlock('recentRecords')}
          showDivider={index < latest.length - 1}
        />
      ))}
    </View>
  );
};
