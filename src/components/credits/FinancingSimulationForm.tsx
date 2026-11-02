import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { FinancingWithRelations } from '@/src/interfaces/schema';
import type { FinancingSummary } from '@/src/domain/credits/summary';
import {
  simulateFinancing,
  type FinancingSimulationScenario,
} from '@/src/domain/credits/simulations';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { TextField } from '@/src/ui/forms/TextField';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';

type FinancingSimulationFormProps = {
  visible: boolean;
  financing: FinancingWithRelations | null;
  summary: FinancingSummary | null;
  onClose: () => void;
};

type ExtraMode = NonNullable<FinancingSimulationScenario['extraOnceMode']>;

const parseNumber = (value: string) => {
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
};

const signedMoney = (cents: number) =>
  `${cents < 0 ? '-' : cents > 0 ? '+' : ''}${formatMoneyWithSymbol(
    Math.abs(cents)
  )}`;

export const FinancingSimulationForm = ({
  visible,
  financing,
  summary,
  onClose,
}: FinancingSimulationFormProps) => {
  const { t } = useLanguage();
  const [extraOnce, setExtraOnce] = useState(0);
  const [extraRecurring, setExtraRecurring] = useState(0);
  const [extraMode, setExtraMode] = useState<ExtraMode>('reduce_term');
  const [annualRate, setAnnualRate] = useState('0');
  const [remainingTerm, setRemainingTerm] = useState('0');

  useEffect(() => {
    if (!visible) return;
    setExtraOnce(0);
    setExtraRecurring(0);
    setExtraMode('reduce_term');
    setAnnualRate(
      ((summary?.effectiveRateBps ?? financing?.annual_rate_bps ?? 0) / 100).toString()
    );
    setRemainingTerm(
      String(summary?.remainingTermMonths ?? financing?.term_months ?? 0)
    );
  }, [visible, financing, summary]);

  const result = useMemo(() => {
    if (!financing) return null;
    return simulateFinancing(
      financing,
      financing.FinancingPayments ?? [],
      financing.FinancingAdjustments ?? [],
      {
        extraOnceCents: extraOnce,
        extraOnceMode: extraMode,
        extraRecurringCents: extraRecurring,
        annualRateBps: Math.max(0, Math.round(parseNumber(annualRate) * 100)),
        remainingTermMonths: Math.max(
          0,
          Math.floor(parseNumber(remainingTerm))
        ),
      }
    );
  }, [
    financing,
    extraOnce,
    extraMode,
    extraRecurring,
    annualRate,
    remainingTerm,
  ]);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('financings.simulationTitle')}
      closeLabel={t('close')}
      scrollable
      footer={
        <View style={styles.footer}>
          <Button
            label={t('close')}
            onPress={onClose}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <Stack gap='md'>
        <InlineMessage variant='info' message={t('financings.simulationHint')} />
        <MoneyField
          label={t('financings.extraOnce')}
          value={extraOnce}
          onChangeCents={setExtraOnce}
        />
        <SelectField
          label={t('financings.strategy')}
          value={extraMode}
          options={[
            {
              label: t('financings.strategies.reduce_term'),
              value: 'reduce_term',
            },
            {
              label: t('financings.strategies.reduce_payment'),
              value: 'reduce_payment',
            },
          ]}
          onChange={setExtraMode}
        />
        <MoneyField
          label={t('financings.extraRecurring')}
          value={extraRecurring}
          onChangeCents={setExtraRecurring}
        />
        <TextField
          label={t('financings.newAnnualRate')}
          value={annualRate}
          onChangeText={setAnnualRate}
          keyboardType='decimal-pad'
        />
        <TextField
          label={t('financings.remainingTerm')}
          value={remainingTerm}
          onChangeText={setRemainingTerm}
          keyboardType='number-pad'
        />

        {result ? (
          <Surface variant='muted' padding='md'>
            <Stack gap='sm'>
              <Row justify='space-between'>
                <AppText weight='600'>{t('financings.currentScenario')}</AppText>
                <AppText weight='600' color='muted'>
                  {t('financings.simulatedScenario')}
                </AppText>
              </Row>
              <Row justify='space-between'>
                <AppText>
                  {t('financings.payment')}:{' '}
                  {formatMoneyWithSymbol(result.baseline.monthlyPaymentCents)}
                </AppText>
                <AppText>
                  {formatMoneyWithSymbol(result.simulated.monthlyPaymentCents)}
                </AppText>
              </Row>
              <Row justify='space-between'>
                <AppText>
                  {t('financings.months')}: {result.baseline.monthsRemaining}
                </AppText>
                <AppText>{result.simulated.monthsRemaining}</AppText>
              </Row>
              <Row justify='space-between'>
                <AppText>
                  {t('financings.interest')}:{' '}
                  {formatMoneyWithSymbol(result.baseline.totalInterestCents)}
                </AppText>
                <AppText>
                  {formatMoneyWithSymbol(result.simulated.totalInterestCents)}
                </AppText>
              </Row>
              <Row justify='space-between'>
                <AppText color='muted'>{t('financings.paymentDelta')}</AppText>
                <AppText>{signedMoney(result.paymentDeltaCents)}</AppText>
              </Row>
              <Row justify='space-between'>
                <AppText color='muted'>{t('financings.interestSaved')}</AppText>
                <AppText>{formatMoneyWithSymbol(result.interestSavedCents)}</AppText>
              </Row>
              <Row justify='space-between'>
                <AppText color='muted'>{t('financings.monthsSaved')}</AppText>
                <AppText>{result.monthsSaved}</AppText>
              </Row>
            </Stack>
          </Surface>
        ) : null}
      </Stack>
    </Modal>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});
