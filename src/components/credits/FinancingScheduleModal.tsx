import React, { useMemo } from 'react';

import type { FinancingWithRelations } from '@/src/interfaces/schema';
import type { FinancingSummary } from '@/src/domain/credits/summary';
import {
  buildBalanceChart,
  buildPaymentCompositionChart,
} from '@/src/domain/credits/charts';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { MermaidChart } from '@/src/ui/charts/MermaidChart';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { Modal } from '@/src/ui/overlays/Modal';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

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
  const { colors } = useTheme();
  const rows = summary?.schedule.rows ?? [];
  const balanceChart = useMemo(
    () => (summary ? buildBalanceChart(summary, t('financings.balanceChart')) : null),
    [summary, t]
  );
  const compositionChart = useMemo(
    () =>
      summary
        ? buildPaymentCompositionChart(
            financing?.FinancingPayments ?? [],
            summary,
            t('financings.paymentCompositionChart')
          )
        : null,
    [financing, summary, t]
  );

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
                {t('financings.agreedPayment')}:{' '}
                {formatMoneyWithSymbol(summary.monthlyPaymentCents)}
              </AppText>
              {summary.scheduledPaymentCents !==
              summary.monthlyPaymentCents ? (
                <AppText>
                  {t('financings.expectedPayment')}:{' '}
                  {formatMoneyWithSymbol(summary.scheduledPaymentCents)}
                </AppText>
              ) : null}
              <AppText>
                {t('financings.balance')}:{' '}
                {formatMoneyWithSymbol(summary.balanceCents)}
              </AppText>
              <AppText>
                {t('financings.interest')}:{' '}
                {formatMoneyWithSymbol(summary.totalInterestCents)}
              </AppText>
              <AppText>
                {t('financings.paidPrincipal')}:{' '}
                {formatMoneyWithSymbol(summary.paidPrincipalCents)}
              </AppText>
              <AppText>
                {t('financings.paidInterest')}:{' '}
                {formatMoneyWithSymbol(summary.paidInterestCents)}
              </AppText>
              <AppText>
                {t('financings.paidCharges')}:{' '}
                {formatMoneyWithSymbol(
                  summary.paidInsuranceCents + summary.paidFeesCents
                )}
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
        {balanceChart ? (
          <MermaidChart
            definition={balanceChart}
            height={220}
            accessibilityLabel={t('financings.balanceChart')}
            palette={[colors.chartDistance]}
            legend={[
              {
                label: t('financings.balanceChart'),
                color: colors.chartDistance,
              },
            ]}
            fallback={
              <AppText color='muted'>{t('financings.chartNoData')}</AppText>
            }
          />
        ) : null}
        {compositionChart ? (
          <MermaidChart
            definition={compositionChart}
            height={240}
            accessibilityLabel={t('financings.paymentCompositionChart')}
            palette={[
              colors.chartPlanned,
              colors.chartActual,
              colors.chartProjected,
            ]}
            legend={[
              {
                label: t('financings.principalLabel'),
                color: colors.chartPlanned,
              },
              {
                label: t('financings.interest'),
                color: colors.chartActual,
              },
              {
                label: t('financings.insurance'),
                color: colors.chartProjected,
              },
            ]}
            fallback={
              <AppText color='muted'>{t('financings.chartNoData')}</AppText>
            }
          />
        ) : null}
      </Stack>
    </Modal>
  );
};
