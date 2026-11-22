import React from 'react';

import { useBudgetProjection } from '@/src/hooks/useBudgetProjection';
import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { StatTile } from '@/src/ui/data-display/StatTile';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

export const DashboardBudgetBlock = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { group } = useRecordsStore();
  const { plan, consumptionBalance, loading } = useBudgetProjection(group?.id);

  if (loading && !plan) return <LoadingState />;

  if (!plan) {
    return (
      <AppText variant='caption' color='muted'>
        {t('dashboard.noPlan')}
      </AppText>
    );
  }

  const expected =
    (consumptionBalance ?? plan.balance).expectedEndBalanceCents;

  return (
    <Stack gap='md'>
      <Row gap='md'>
        <StatTile
          label={t('budget.totals.plannedExpense')}
          cents={plan.totals.plannedExpenseCents}
          size='sm'
          style={{ flex: 1 }}
        />
        <StatTile
          label={t('budget.totals.actualExpense')}
          cents={plan.totals.actualExpenseCents}
          size='sm'
          style={{ flex: 1 }}
        />
      </Row>
      <SummaryBlock
        label={t('budget.expectedBalance')}
        cents={expected}
        size='md'
        valueColorOverride={expected >= 0 ? colors.success : colors.expense}
        accentColor={expected >= 0 ? colors.success : colors.expense}
      />
    </Stack>
  );
};
