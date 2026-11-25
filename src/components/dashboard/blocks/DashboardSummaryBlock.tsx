import React from 'react';

import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
import { useResumesStore } from '@/src/stores/ResumesStore';
import { StatTile } from '@/src/ui/data-display/StatTile';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

export const DashboardSummaryBlock = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { balance, cashBalance } = useResumesStore();
  const { group } = useRecordsStore();

  return (
    <Stack gap='md'>
      <SummaryBlock
        label={t('resume.consumptionBalance')}
        cents={balance}
        size='xl'
        labelVariant='subtitle'
        valueColorOverride={colors.text}
        accentColor={colors.primary}
      />
      <Row gap='md'>
        <StatTile
          label={t('resume.cashBalance')}
          cents={cashBalance}
          size='sm'
          valueColor={colors.text}
          style={{ flex: 1 }}
        />
        <StatTile
          label={t('resume.goal')}
          cents={group?.goal}
          size='sm'
          valueColor={colors.text}
          accentColor={colors.goal}
          style={{ flex: 1 }}
        />
      </Row>
    </Stack>
  );
};
