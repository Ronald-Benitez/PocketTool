import React from 'react';

import type { BudgetBalanceView } from '@/src/domain/budgets/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type BudgetBalanceCardProps = {
  balance: BudgetBalanceView;
};

export const BudgetBalanceCard = ({ balance }: BudgetBalanceCardProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const positive = balance.expectedEndBalanceCents >= 0;
  const overcommitted =
    balance.hasIncomeLines &&
    balance.expectedExpenseCents > balance.expectedIncomeCents;

  return (
    <Surface variant='raised' padding='lg'>
      <Stack gap='md'>
        <Stack gap='xxs'>
          <SummaryBlock
            label={t('budget.expectedBalance')}
            cents={balance.expectedEndBalanceCents}
            size='xl'
            labelVariant='subtitle'
            valueColorOverride={positive ? colors.success : colors.expense}
            accentColor={positive ? colors.success : colors.expense}
          />
          <AppText variant='caption' color='muted'>
            {t('budget.expectedBalanceHint')}
          </AppText>
        </Stack>

        <Stack gap='xs'>
          <Row justify='space-between' align='center'>
            <AppText color='muted'>{t('budget.currentNet')}</AppText>
            <FinanceValue cents={balance.actualNetCents} size='sm' />
          </Row>
          <Row justify='space-between' align='center'>
            <AppText color='muted'>{t('budget.remainingIncome')}</AppText>
            <FinanceValue cents={balance.remainingIncomeCents} size='sm' />
          </Row>
          <Row justify='space-between' align='center'>
            <AppText color='muted'>{t('budget.remainingExpense')}</AppText>
            <FinanceValue cents={balance.remainingExpenseCents} size='sm' />
          </Row>
          <Row justify='space-between' align='center'>
            <AppText color='muted'>
              {t('budget.daysRemaining', { count: balance.daysRemaining })}
            </AppText>
          </Row>
          <Row justify='space-between' align='center'>
            <AppText color='muted'>{t('budget.dailyAvailable')}</AppText>
            <FinanceValue cents={balance.dailyAvailableCents} size='sm' />
          </Row>
        </Stack>

        {!balance.hasIncomeLines ? (
          <InlineMessage
            variant='info'
            message={t('budget.noIncomeWarning')}
          />
        ) : null}
        {balance.expectedEndBalanceCents < 0 ? (
          <InlineMessage
            variant='warning'
            message={t('budget.negativeBalanceWarning')}
          />
        ) : null}
        {overcommitted ? (
          <InlineMessage
            variant='warning'
            message={t('budget.overcommittedWarning')}
          />
        ) : null}
      </Stack>
    </Surface>
  );
};
