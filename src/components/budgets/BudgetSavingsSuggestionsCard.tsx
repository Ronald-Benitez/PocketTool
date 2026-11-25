import React from 'react';

import type { BudgetSavingsSuggestion } from '@/src/domain/budgets/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';

type BudgetSavingsSuggestionsCardProps = {
  suggestions: BudgetSavingsSuggestion[];
  busy?: boolean;
  onInclude: (suggestion: BudgetSavingsSuggestion) => void;
};

export const BudgetSavingsSuggestionsCard = ({
  suggestions,
  busy = false,
  onInclude,
}: BudgetSavingsSuggestionsCardProps) => {
  const { t } = useLanguage();
  if (suggestions.length === 0) return null;

  return (
    <Stack gap='sm'>
      <AppText variant='subtitle'>{t('budget.savingsSuggestionsTitle')}</AppText>
      <AppText color='muted'>{t('budget.savingsSuggestionsHint')}</AppText>
      <Surface variant='outlined' padding='none'>
        {suggestions.map((suggestion, index) => {
          const included =
            suggestion.includedLineId != null &&
            suggestion.includedAmountCents === suggestion.amountCents;
          return (
            <ListItem
              key={suggestion.key}
              title={suggestion.label}
              subtitle={t('budget.obligationKinds.savings')}
              trailing={
                <Stack gap='xs' align='flex-end'>
                  <FinanceValue cents={suggestion.amountCents} size='sm' />
                  <Button
                    label={
                      included
                        ? t('budget.savingsIncluded')
                        : suggestion.includedLineId != null
                          ? t('budget.savingsUpdate')
                          : t('budget.savingsInclude')
                    }
                    size='sm'
                    variant='ghost'
                    disabled={busy || included}
                    onPress={() => onInclude(suggestion)}
                  />
                </Stack>
              }
              showDivider={index < suggestions.length - 1}
            />
          );
        })}
      </Surface>
    </Stack>
  );
};
