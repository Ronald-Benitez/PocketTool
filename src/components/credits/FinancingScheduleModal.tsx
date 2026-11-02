import React from 'react';

import type { FinancingWithRelations } from '@/src/interfaces/schema';
import type { FinancingSummary } from '@/src/domain/credits/summary';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { Modal } from '@/src/ui/overlays/Modal';

type FinancingScheduleModalProps = {
  visible: boolean;
  financing: FinancingWithRelations | null;
  summary: FinancingSummary | null;
  onClose: () => void;
};

export const FinancingScheduleModal = ({
  visible,
  financing,
  summary,
  onClose,
}: FinancingScheduleModalProps) => {
  const { t } = useLanguage();
  const rows = summary?.schedule.rows ?? [];

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('financings.schedule')}
      closeLabel={t('close')}
      scrollable
    >
      <Stack gap='sm'>
        <AppText weight='600'>{financing?.name ?? ''}</AppText>
        {rows.length === 0 ? (
          <AppText color='muted'>{t('financings.scheduleEmpty')}</AppText>
        ) : (
          rows.map((row) => (
            <ListItem
              key={row.number}
              title={`#${row.number} · ${new Date(row.date).toLocaleDateString()}`}
              subtitle={`${t('financings.interest')}: ${formatMoneyWithSymbol(
                row.interestCents
              )} · ${t('financings.principalLabel')}: ${formatMoneyWithSymbol(
                row.principalCents
              )}`}
              trailing={
                <AppText weight='600'>
                  {formatMoneyWithSymbol(row.paymentCents)}
                </AppText>
              }
            />
          ))
        )}
        {summary ? (
          <Surface variant='muted' padding='md'>
            <Stack gap='xxs'>
              <AppText>
                {t('financings.balance')}:{' '}
                {formatMoneyWithSymbol(summary.balanceCents)}
              </AppText>
              <AppText>
                {t('financings.interest')}:{' '}
                {formatMoneyWithSymbol(summary.totalInterestCents)}
              </AppText>
              {summary.payoffDate ? (
                <AppText>
                  {t('financings.payoffDate')}:{' '}
                  {new Date(summary.payoffDate).toLocaleDateString()}
                </AppText>
              ) : null}
            </Stack>
          </Surface>
        ) : null}
      </Stack>
    </Modal>
  );
};
