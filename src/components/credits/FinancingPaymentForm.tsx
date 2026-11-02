import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useFinancingsRepository } from '@/src/db';
import type { FinancingWithRelations } from '@/src/interfaces/schema';
import type { FinancingSummary } from '@/src/domain/credits/summary';
import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { DateField } from '@/src/ui/forms/DateField';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { TextField } from '@/src/ui/forms/TextField';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';

type FinancingPaymentFormProps = {
  visible: boolean;
  financing: FinancingWithRelations | null;
  summary: FinancingSummary | null;
  onClose: () => void;
  onSaved: () => void;
};

export const FinancingPaymentForm = ({
  visible,
  financing,
  summary,
  onClose,
  onSaved,
}: FinancingPaymentFormProps) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { group } = useRecordsStore();
  const repository = useFinancingsRepository();
  const [date, setDate] = useState(() => Date.now());
  const [amount, setAmount] = useState(0);
  const [extraPrincipal, setExtraPrincipal] = useState(0);
  const [extraReducePayment, setExtraReducePayment] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setDate(Date.now());
    setAmount(summary?.monthlyPaymentCents ?? 0);
    setExtraPrincipal(0);
    setExtraReducePayment(0);
    setNotes('');
    setError(null);
  }, [visible, summary]);

  const expected = summary?.monthlyPaymentCents ?? 0;
  const differenceToFees = Math.max(
    0,
    amount - expected - extraPrincipal - extraReducePayment
  );

  const save = async () => {
    if (!financing?.id || amount <= 0) {
      setError(t('financings.invalidFields'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const interest = Math.max(
        0,
        Math.round(
          summary?.balanceCents
            ? (summary.balanceCents * financing.annual_rate_bps) / 10000 / 12
            : 0
        )
      );
      const principal = Math.max(0, expected - interest);
      await repository.savePayment({
        financing_id: financing.id,
        date,
        amount_cents: amount,
        principal_cents: principal,
        interest_cents: interest,
        insurance_cents: differenceToFees,
        fees_cents: 0,
        extra_principal_cents: extraPrincipal,
        extra_reduce_payment_cents: extraReducePayment,
        is_shared: financing.is_shared ? 1 : 0,
        shared_amount_cents: financing.is_shared
          ? summary?.sharedPaymentCents ?? null
          : null,
        group_id: group?.id ?? null,
        payment_method_id: financing.payment_method_id ?? null,
        record_id: null,
        notes: notes.trim() || null,
      });
      showToast({ message: t('financings.paymentSaved'), type: 'success' });
      onSaved();
      onClose();
    } catch (cause) {
      if (__DEV__) console.warn('[financings] payment save failed', cause);
      setError(t('financings.invalidFields'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('financings.addPayment')}
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
        <AppText variant='caption' color='muted'>
          {t('financings.expectedPayment')}: {formatMoneyWithSymbol(expected)}
        </AppText>
        <DateField
          label={t('financings.paymentDate')}
          value={date}
          onChange={setDate}
        />
        <MoneyField
          label={t('financings.paymentAmount')}
          value={amount}
          onChangeCents={setAmount}
        />
        <MoneyField
          label={t('financings.extraPrincipal')}
          value={extraPrincipal}
          onChangeCents={setExtraPrincipal}
        />
        <MoneyField
          label={t('financings.extraReducePayment')}
          value={extraReducePayment}
          onChangeCents={setExtraReducePayment}
        />
        {differenceToFees > 0 ? (
          <AppText variant='caption' color='muted'>
            {t('financings.insurance')}:{' '}
            {formatMoneyWithSymbol(differenceToFees)}
          </AppText>
        ) : null}
        <TextField
          label={t('financings.notes')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
        />
        {error ? <InlineMessage variant='error' message={error} /> : null}
      </Stack>
    </Modal>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});
