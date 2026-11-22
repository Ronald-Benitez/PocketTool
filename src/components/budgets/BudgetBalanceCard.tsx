import React from 'react';

import type { BudgetBalanceView } from '@/src/domain/budgets/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { SectionCard } from '@/src/ui/data-display/SectionCard';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { AppText } from '@/src/ui/primitives/AppText';
import { Divider } from '@/src/ui/primitives/Divider';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type BudgetBalanceCardProps = {
  balance: BudgetBalanceView;
  /** Current actual balance, to compare it with the expected end balance. */
  currentBalanceCents?: number;
};

export const BudgetBalanceCard = ({
  balance,
  currentBalanceCents,
}: BudgetBalanceCardProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const positive = balance.expectedEndBalanceCents >= 0;
  const overcommitted =
    balance.hasIncomeLines &&
    balance.expectedExpenseCents > balance.expectedIncomeCents;

  return (
    <SectionCard
      title={t('budget.expectedBalance')}
      tooltip={{
        title: t('budget.expectedBalance'),
        body: t('budget.expectedBalanceHint'),
      }}
    >
      <Stack gap='md'>
        <FinanceValue
          cents={balance.expectedEndBalanceCents}
          size='xl'
          color={positive ? colors.success : colors.expense}
        />

        <Stack gap='xs'>
          {typeof currentBalanceCents === 'number' ? (
            <>
              <Row justify='space-between' align='center'>
                <AppText color='muted'>{t('budget.currentBalance')}</AppText>
                <FinanceValue cents={currentBalanceCents} size='sm' />
              </Row>
              <Row justify='space-between' align='center'>
                <AppText color='muted'>{t('budget.balanceGap')}</AppText>
                <FinanceValue
                  cents={balance.expectedEndBalanceCents - currentBalanceCents}
                  size='sm'
                />
              </Row>
              <Divider />
            </>
          ) : null}
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
    </SectionCard>
  );
};
