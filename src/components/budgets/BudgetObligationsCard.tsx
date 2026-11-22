import React from 'react';

import type { BudgetObligationsView } from '@/src/domain/budgets/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { SectionCard } from '@/src/ui/data-display/SectionCard';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { Stack } from '@/src/ui/primitives/Stack';

type BudgetObligationsCardProps = {
  obligations: BudgetObligationsView;
};

export const BudgetObligationsCard = ({
  obligations,
}: BudgetObligationsCardProps) => {
  const { t } = useLanguage();

  return (
    <SectionCard title={t('budget.obligationsTitle')} padded={false}>
      {obligations.items.length === 0 ? (
        <InlineMessage variant='info' message={t('budget.obligationsEmpty')} />
      ) : (
        <Stack>
          {obligations.items.map((item, index) => (
            <ListItem
              key={item.key}
              title={item.label}
              subtitle={[
                t(`budget.obligationKinds.${item.kind}`),
                item.date
                  ? t('budget.obligationDue', {
                      date: new Date(item.date).toLocaleDateString(),
                    })
                  : null,
                item.note,
              ]
                .filter(Boolean)
                .join(' · ')}
              trailing={<FinanceValue cents={item.amountCents} size='sm' />}
              showDivider={index < obligations.items.length - 1}
            />
          ))}
        </Stack>
      )}
    </SectionCard>
  );
};
