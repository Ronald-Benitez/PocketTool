import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useFinancingsRepository } from '@/src/db';
import type { FinancingWithRelations } from '@/src/interfaces/schema';
import type { FinancingSummary } from '@/src/domain/credits/summary';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { DateField } from '@/src/ui/forms/DateField';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { TextField } from '@/src/ui/forms/TextField';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';

type AdjustmentKind =
  | 'refinance'
  | 'rate_change'
  | 'term_change'
  | 'payment_change';

const KINDS: AdjustmentKind[] = [
  'refinance',
  'rate_change',
  'term_change',
  'payment_change',
];

type FinancingAdjustmentFormProps = {
  visible: boolean;
  financing: FinancingWithRelations | null;
  summary: FinancingSummary | null;
  onClose: () => void;
  onSaved: () => void;
};

const parseNumber = (value: string) => {
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
};

export const FinancingAdjustmentForm = ({
  visible,
  financing,
  summary,
  onClose,
  onSaved,
}: FinancingAdjustmentFormProps) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const repository = useFinancingsRepository();
  const [kind, setKind] = useState<AdjustmentKind>('refinance');
  const [date, setDate] = useState(() => Date.now());
  const [annualRate, setAnnualRate] = useState('0');
  const [remainingTerm, setRemainingTerm] = useState('0');
  const [payment, setPayment] = useState(0);
  const [capitalizedInterest, setCapitalizedInterest] = useState(0);
  const [fees, setFees] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setKind('refinance');
    setDate(Date.now());
    setAnnualRate(
      ((summary?.effectiveRateBps ?? financing?.annual_rate_bps ?? 0) / 100).toString()
    );
    setRemainingTerm(
      String(
        summary?.remainingTermMonths ??
          financing?.term_months ??
          0
      )
    );
    setPayment(0);
    setCapitalizedInterest(0);
    setFees(0);
    setNotes('');
    setError(null);
  }, [visible, financing, summary]);

  const save = async () => {
    if (!financing?.id) {
      setError(t('financings.invalidFields'));
      return;
    }
    const term = Math.max(0, Math.floor(parseNumber(remainingTerm)));
    const rateBps = Math.max(0, Math.round(parseNumber(annualRate) * 100));
    const changesRate = kind === 'refinance' || kind === 'rate_change';
    const changesTerm = kind === 'refinance' || kind === 'term_change';
    const changesPayment = kind === 'refinance' || kind === 'payment_change';
    if (changesTerm && term <= 0) {
      setError(t('financings.invalidFields'));
      return;
    }
    if (changesPayment && payment <= 0) {
      setError(t('financings.invalidFields'));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await repository.saveAdjustment({
        financing_id: financing.id,
        date,
        kind,
        new_annual_rate_bps: changesRate ? rateBps : null,
        new_term_months: changesTerm ? term : null,
        new_payment_cents:
          changesPayment && payment > 0 ? payment : null,
        capitalized_interest_cents:
          capitalizedInterest > 0 ? capitalizedInterest : null,
        fees_cents: fees > 0 ? fees : null,
        notes: notes.trim() || null,
      });
      showToast({ message: t('financings.adjustmentSaved'), type: 'success' });
      onSaved();
      onClose();
    } catch (cause) {
      if (__DEV__) console.warn('[financings] adjustment save failed', cause);
      setError(t('financings.invalidFields'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('financings.refinanceTitle')}
      closeLabel={t('cancel')}
      scrollable
      footer={
        <View style={styles.footer}>
          <Button
            label={t('cancel')}
            variant='outline'
            onPress={onClose}
            style={styles.footerButton}
          />
          <Button
            label={t('confirm')}
            onPress={save}
            loading={saving}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <Stack gap='md'>
        <SelectField
          label={t('financings.adjustmentKind')}
          value={kind}
          options={KINDS.map((value) => ({
            label: t(`financings.adjustmentKinds.${value}` as never),
            value,
          }))}
          onChange={setKind}
        />
        <DateField
          label={t('financings.adjustmentDate')}
          value={date}
          onChange={setDate}
        />
        {kind === 'refinance' || kind === 'rate_change' ? (
          <TextField
            label={t('financings.newAnnualRate')}
            value={annualRate}
            onChangeText={setAnnualRate}
            keyboardType='decimal-pad'
          />
        ) : null}
        {kind === 'refinance' || kind === 'term_change' ? (
          <TextField
            label={t('financings.remainingTerm')}
            value={remainingTerm}
            onChangeText={setRemainingTerm}
            keyboardType='number-pad'
          />
        ) : null}
        {kind === 'refinance' || kind === 'payment_change' ? (
          <>
            <MoneyField
              label={t('financings.newPayment')}
              value={payment}
              onChangeCents={setPayment}
            />
            {summary && payment > summary.scheduledPaymentCents ? (
              <InlineMessage
                variant='info'
                message={t('financings.paymentAboveCalculated', {
                  amount: formatMoneyWithSymbol(
                    payment - summary.scheduledPaymentCents
                  ),
                })}
              />
            ) : null}
            {summary && payment > 0 && payment < summary.scheduledPaymentCents ? (
              <InlineMessage
                variant='info'
                message={t('financings.paymentBelowCalculated')}
              />
            ) : null}
          </>
        ) : null}
        <MoneyField
          label={t('financings.capitalizedInterest')}
          value={capitalizedInterest}
          onChangeCents={setCapitalizedInterest}
        />
        <MoneyField
          label={t('financings.fees')}
          value={fees}
          onChangeCents={setFees}
        />
        <TextField
          label={t('financings.notes')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
        <InlineMessage variant='info' message={t('financings.adjustmentHint')} />
        {error ? <InlineMessage variant='error' message={error} /> : null}
        {summary ? (
          <AppText variant='caption' color='muted'>
            {t('financings.balance')}: {formatMoneyWithSymbol(summary.balanceCents)} ·{' '}
            {t('financings.monthlyPayment')}:{' '}
            {formatMoneyWithSymbol(summary.monthlyPaymentCents)}
          </AppText>
        ) : null}
      </Stack>
    </Modal>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});
