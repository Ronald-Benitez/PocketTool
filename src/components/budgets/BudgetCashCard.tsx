import React from 'react';

import type {
  BudgetCashView,
  BudgetObligationsView,
} from '@/src/domain/budgets/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type BudgetCashCardProps = {
  cash: BudgetCashView;
  obligations: BudgetObligationsView;
};

export const BudgetCashCard = ({ cash, obligations }: BudgetCashCardProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const positive = cash.expectedEndCashCents >= 0;

  return (
    <Surface variant='raised' padding='lg'>
      <Stack gap='md'>
        <Stack gap='xxs'>
          <SummaryBlock
            label={t('budget.cashExpected')}
            cents={cash.expectedEndCashCents}
            size='xl'
            labelVariant='subtitle'
            valueColorOverride={positive ? colors.success : colors.expense}
            accentColor={positive ? colors.success : colors.expense}
          />
          <AppText variant='caption' color='muted'>
            {t('budget.cashHint')}
          </AppText>
        </Stack>

        <Stack gap='xs'>
          <Row justify='space-between' align='center'>
            <AppText color='muted'>{t('budget.currentCash')}</AppText>
            <FinanceValue cents={cash.currentCashCents} size='sm' />
          </Row>
          <Row justify='space-between' align='center'>
            <AppText color='muted'>{t('budget.remainingIncome')}</AppText>
            <FinanceValue cents={cash.remainingIncomeCents} size='sm' />
          </Row>
          <Row justify='space-between' align='center'>
            <AppText color='muted'>{t('budget.remainingExpense')}</AppText>
            <FinanceValue cents={cash.remainingExpenseCents} size='sm' />
          </Row>
          <Row justify='space-between' align='center'>
            <AppText color='muted'>{t('budget.obligations')}</AppText>
            <FinanceValue cents={obligations.totalCashCents} size='sm' />
          </Row>
        </Stack>

        {cash.expectedEndCashCents < 0 ? (
          <InlineMessage
            variant='warning'
            message={t('budget.cashNegativeWarning')}
          />
        ) : null}
      </Stack>
    </Surface>
  );
};
