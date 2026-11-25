import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useBudgetProjection } from '@/src/hooks/useBudgetProjection';
import { useSummaryMode } from '@/src/hooks/useSummaryMode';
import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
import { formatMoneyWithSymbol } from '@/src/utils';
import { LinkButton } from '@/src/ui/actions/LinkButton';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { SectionCard } from '@/src/ui/data-display/SectionCard';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
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
  const expenseLines = (
    plan?.lines.filter((line) => line.effect === '-') ?? []
  ).slice(0, 5);

  return (
    <SectionCard
      title={t('budget.planTitle')}
      action={
        <LinkButton
          label={plan ? t('budget.editPlan') : t('budget.createPlan')}
          onPress={() => router.push('/(budget)')}
        />
      }
    >
      {!plan ? (
        <AppText variant='body' color='muted'>
          {t('budget.noPlanBody')}
        </AppText>
      ) : (
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
            cents={(consumptionBalance ?? plan.balance).expectedEndBalanceCents}
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
          {expenseLines.map((line, index) => (
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
                showDivider={index < expenseLines.length - 1}
              />
            ))}
          {plan.lines.length === 0 ? (
            <AppText color='muted'>{t('budget.emptyPlanBody')}</AppText>
          ) : null}
        </Stack>
      )}
    </SectionCard>
  );
};
