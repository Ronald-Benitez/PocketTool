import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useBudgetProjection } from '@/src/hooks/useBudgetProjection';
import { useSummaryMode } from '@/src/hooks/useSummaryMode';
import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

export const BudgetSummaryBlock = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const router = useRouter();
  const { group } = useRecordsStore();
  const { mode } = useSummaryMode();
  const { plan, consumptionBalance, cashBalance } = useBudgetProjection(
    group?.id,
    mode
  );

  return (
    <Stack gap='sm'>
      <Row justify='space-between' align='center'>
        <AppText variant='subtitle'>{t('budget.planTitle')}</AppText>
        <Button
          label={plan ? t('budget.editPlan') : t('budget.createPlan')}
          size='sm'
          variant='ghost'
          onPress={() => router.push('/(budget)')}
        />
      </Row>

      {!plan ? (
        <InlineMessage variant='info' message={t('budget.noPlanBody')} />
      ) : (
        <Surface variant='outlined' padding='lg'>
          <Stack gap='md'>
            <Row gap='md' justify='space-between'>
              <SummaryBlock
                label={t('budget.totals.plannedExpense')}
                cents={plan.totals.plannedExpenseCents}
                size='md'
                accentColor={colors.primary}
                style={{ flex: 1 }}
              />
              <SummaryBlock
                label={t('budget.totals.actualExpense')}
                cents={plan.totals.actualExpenseCents}
                size='md'
                accentColor={colors.expense}
                style={{ flex: 1 }}
              />
            </Row>
            <SummaryBlock
              label={t('budget.expectedBalance')}
              cents={
                (consumptionBalance ?? plan.balance).expectedEndBalanceCents
              }
              size='md'
              valueColorOverride={
                (consumptionBalance ?? plan.balance).expectedEndBalanceCents >= 0
                  ? colors.success
                  : colors.expense
              }
              accentColor={
                (consumptionBalance ?? plan.balance).expectedEndBalanceCents >= 0
                  ? colors.success
                  : colors.expense
              }
            />
            {cashBalance ? (
              <SummaryBlock
                label={t('budget.cashExpected')}
                cents={cashBalance.expectedEndCashCents}
                size='md'
                valueColorOverride={
                  cashBalance.expectedEndCashCents >= 0
                    ? colors.success
                    : colors.expense
                }
                accentColor={
                  cashBalance.expectedEndCashCents >= 0
                    ? colors.success
                    : colors.expense
                }
              />
            ) : null}
            {plan.lines
              .filter((line) => line.effect === '-')
              .slice(0, 5)
              .map((line, index) => (
                <ListItem
                  key={line.lineId}
                  title={line.categoryName || t('budget.lines.noCategory')}
                  subtitle={`${t('budget.totals.planned')}: ${formatMoneyWithSymbol(
                    line.plannedCents
                  )}`}
                  leading={
                    <MaterialIcons
                      name='pie-chart-outline'
                      size={18}
                      color={colors.primary}
                    />
                  }
                  trailing={<FinanceValue cents={line.actualCents} size='sm' />}
                  showDivider={index < Math.min(plan.lines.length, 5) - 1}
                />
              ))}
            {plan.lines.length === 0 ? (
              <AppText color='muted'>{t('budget.emptyPlanBody')}</AppText>
            ) : null}
          </Stack>
        </Surface>
      )}
    </Stack>
  );
};
