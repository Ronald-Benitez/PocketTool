import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  useCategories,
  useFinancingsRepository,
  usePaymentMethods,
} from '@/src/db';
import type {
  FinancingLinkMode,
  FinancingRecordOption,
} from '@/src/db/repositories/financings';
import type {
  FinancingPayment,
  FinancingWithRelations,
} from '@/src/interfaces/schema';
import type { FinancingSummary } from '@/src/domain/credits/summary';
import {
  buildPaymentBreakdown,
  type ExtraChargeType,
} from '@/src/domain/credits/payments';
import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
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
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { FinancingRecordPicker } from './FinancingRecordPicker';

type FinancingPaymentFormProps = {
  visible: boolean;
  financing: FinancingWithRelations | null;
  summary: FinancingSummary | null;
  payment?: FinancingPayment | null;
  onClose: () => void;
  onSaved: () => void;
};

const isSameDay = (left: number, right: number) => {
  const a = new Date(left);
  const b = new Date(right);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const FinancingPaymentForm = ({
  visible,
  financing,
  summary,
  payment,
  onClose,
  onSaved,
}: FinancingPaymentFormProps) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { group } = useRecordsStore();
  const repository = useFinancingsRepository();
  const categoriesRepository = useCategories();
  const paymentMethodsRepository = usePaymentMethods();
  const [date, setDate] = useState(() => Date.now());
  const [amount, setAmount] = useState(0);
  const [extraPrincipal, setExtraPrincipal] = useState(0);
  const [extraReducePayment, setExtraReducePayment] = useState(0);
  const [extraChargeType, setExtraChargeType] =
    useState<ExtraChargeType>('insurance');
  const [linkMode, setLinkMode] = useState<FinancingLinkMode>('none');
  const [linkedRecord, setLinkedRecord] =
    useState<FinancingRecordOption | null>(null);
  const [recordPickerVisible, setRecordPickerVisible] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [categories, setCategories] = useState<
    { id?: number; category_name: string }[]
  >([]);
  const [paymentMethods, setPaymentMethods] = useState<
    { id?: number; method_name: string }[]
  >([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setDate(payment?.date ?? Date.now());
    setAmount(payment?.amount_cents ?? summary?.monthlyPaymentCents ?? 0);
    setExtraPrincipal(payment?.extra_principal_cents ?? 0);
    setExtraReducePayment(payment?.extra_reduce_payment_cents ?? 0);
    setExtraChargeType(
      payment?.fees_cents != null && payment.fees_cents > 0
        ? 'fees'
        : 'insurance'
    );
    setLinkMode(payment?.record_id ? 'link' : 'none');
    setLinkedRecord(null);
    setCategoryId(financing?.category_id ?? null);
    setPaymentMethodId(financing?.payment_method_id ?? null);
    setNotes(payment?.notes ?? '');
    setError(null);
  }, [visible, summary, financing, payment]);

  useEffect(() => {
    if (!visible || !payment?.record_id) return;
    let active = true;
    repository.fetchRecordOption(payment.record_id).then((option) => {
      if (active && option) setLinkedRecord(option);
    });
    return () => {
      active = false;
    };
  }, [visible, payment?.id, payment?.record_id]);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    Promise.all([
      categoriesRepository.fetchCategories(),
      paymentMethodsRepository.fetchPaymentMethods(),
    ]).then(([nextCategories, nextPayments]) => {
      if (!active) return;
      setCategories(nextCategories ?? []);
      setPaymentMethods(nextPayments ?? []);
      setCategoryId(
        (current) =>
          current ?? financing?.category_id ?? nextCategories?.[0]?.id ?? null
      );
      setPaymentMethodId(
        (current) =>
          current ??
          financing?.payment_method_id ??
          nextPayments?.[0]?.id ??
          null
      );
    });
    return () => {
      active = false;
    };
  }, [visible, financing?.category_id, financing?.payment_method_id]);

  const expected = summary?.monthlyPaymentCents ?? 0;
  const scheduled = summary?.schedule.paymentCents ?? expected;
  const breakdown = useMemo(
    () =>
      buildPaymentBreakdown({
        amountCents: amount,
        expectedCents: scheduled,
        scheduledRow: summary?.schedule.rows[0] ?? null,
        extraPrincipalCents: extraPrincipal,
        extraReducePaymentCents: extraReducePayment,
        extraChargeType,
      }),
    [
      amount,
      scheduled,
      summary,
      extraPrincipal,
      extraReducePayment,
      extraChargeType,
    ]
  );

  const selectLinkedRecord = (option: FinancingRecordOption) => {
    setLinkedRecord(option);
    setDate(option.date);
    setAmount(option.amount);
    setCategoryId(option.categoryId);
    setPaymentMethodId(option.paymentMethodId);
  };

  const save = async () => {
    if (!financing?.id || amount <= 0) {
      setError(t('financings.invalidFields'));
      return;
    }
    if (linkMode === 'create') {
      if (!group) {
        setError(t('financings.records.groupRequired'));
        return;
      }
      if (!categoryId) {
        setError(t('financings.records.categoryRequired'));
        return;
      }
      if (!paymentMethodId) {
        setError(t('financings.records.paymentRequired'));
        return;
      }
    }
    if (linkMode === 'link') {
      if (!linkedRecord) {
        setError(t('financings.records.recordRequired'));
        return;
      }
      if (breakdown.amountCents !== linkedRecord.amount) {
        setError(t('financings.records.amountMismatch'));
        return;
      }
      if (!isSameDay(date, linkedRecord.date)) {
        setError(t('financings.records.dateMismatch'));
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      await repository.savePayment({
        id: payment?.id,
        financing_id: financing.id,
        date,
        amount_cents: breakdown.amountCents,
        principal_cents: breakdown.principalCents,
        interest_cents: breakdown.interestCents,
        insurance_cents: breakdown.insuranceCents,
        fees_cents: breakdown.feesCents,
        extra_principal_cents: breakdown.extraPrincipalCents,
        extra_reduce_payment_cents: breakdown.extraReducePaymentCents,
        is_shared: financing.is_shared ? 1 : 0,
        shared_amount_cents: financing.is_shared
          ? summary?.sharedPaymentCents ?? null
          : null,
        group_id: group?.id ?? null,
        payment_method_id: paymentMethodId,
        notes: notes.trim() || null,
        record: {
          linkMode,
          recordId: linkedRecord?.id ?? null,
          groupId: group?.id ?? null,
          categoryId,
          paymentMethodId,
        },
      });
      showToast({ message: t('financings.paymentSaved'), type: 'success' });
      onSaved();
      onClose();
    } catch (cause) {
      if (__DEV__) console.warn('[financings] payment save failed', cause);
      const message = cause instanceof Error ? cause.message : '';
      setError(
        message === 'GROUP_REQUIRED'
          ? t('financings.records.groupRequired')
          : message === 'CATEGORY_REQUIRED'
            ? t('financings.records.categoryRequired')
            : message === 'PAYMENT_METHOD_REQUIRED'
              ? t('financings.records.paymentRequired')
              : message === 'RECORD_REQUIRED'
                ? t('financings.records.recordRequired')
                : message === 'RECORD_ALREADY_LINKED'
                  ? t('financings.records.alreadyLinked')
                  : message === 'RECORD_AMOUNT_MISMATCH'
                    ? t('financings.records.amountMismatch')
                    : message === 'RECORD_DATE_MISMATCH'
                      ? t('financings.records.dateMismatch')
                      : message === 'RECORD_TYPE_REQUIRED'
                        ? t('financings.records.typeRequired')
                        : t('financings.invalidFields')
      );
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = categories.flatMap((category) =>
    category.id === undefined
      ? []
      : [{ label: category.category_name, value: category.id }]
  );
  const paymentOptions = paymentMethods.flatMap((method) =>
    method.id === undefined
      ? []
      : [{ label: method.method_name, value: method.id }]
  );

  return (
    <>
      <Modal
        visible={visible}
        onClose={onClose}
        title={
          payment ? t('financings.editPayment') : t('financings.addPayment')
        }
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
            {t('financings.agreedPayment')}: {formatMoneyWithSymbol(expected)}
          </AppText>
          {scheduled !== expected ? (
            <AppText variant='caption' color='muted'>
              {t('financings.expectedPayment')}:{' '}
              {formatMoneyWithSymbol(scheduled)}
            </AppText>
          ) : null}
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
          {breakdown.extraChargeCents > 0 ? (
            <>
              <InlineMessage
                variant='warning'
                message={t('financings.paymentExtraWarning', {
                  amount: formatMoneyWithSymbol(breakdown.extraChargeCents),
                })}
              />
              <SelectField
                label={t('financings.extraChargeType')}
                value={extraChargeType}
                options={[
                  {
                    label: t('financings.extraChargeKinds.insurance'),
                    value: 'insurance',
                  },
                  {
                    label: t('financings.extraChargeKinds.fees'),
                    value: 'fees',
                  },
                ]}
                onChange={setExtraChargeType}
              />
            </>
          ) : null}
          <Surface variant='muted' padding='md'>
            <Stack gap='xs'>
              <AppText weight='600'>
                {t('financings.paymentBreakdown')}
              </AppText>
              <Row justify='space-between'>
                <AppText color='muted'>{t('financings.interest')}</AppText>
                <AppText>
                  {formatMoneyWithSymbol(breakdown.interestCents)}
                </AppText>
              </Row>
              <Row justify='space-between'>
                <AppText color='muted'>{t('financings.principalLabel')}</AppText>
                <AppText>
                  {formatMoneyWithSymbol(breakdown.principalCents)}
                </AppText>
              </Row>
              {breakdown.extraPrincipalCents > 0 ? (
                <Row justify='space-between'>
                  <AppText color='muted'>
                    {t('financings.extraPrincipal')}
                  </AppText>
                  <AppText>
                    {formatMoneyWithSymbol(breakdown.extraPrincipalCents)}
                  </AppText>
                </Row>
              ) : null}
              {breakdown.extraReducePaymentCents > 0 ? (
                <Row justify='space-between'>
                  <AppText color='muted'>
                    {t('financings.extraReducePayment')}
                  </AppText>
                  <AppText>
                    {formatMoneyWithSymbol(breakdown.extraReducePaymentCents)}
                  </AppText>
                </Row>
              ) : null}
              {breakdown.insuranceCents > 0 ? (
                <Row justify='space-between'>
                  <AppText color='muted'>{t('financings.insurance')}</AppText>
                  <AppText>
                    {formatMoneyWithSymbol(breakdown.insuranceCents)}
                  </AppText>
                </Row>
              ) : null}
              {breakdown.feesCents > 0 ? (
                <Row justify='space-between'>
                  <AppText color='muted'>{t('financings.fees')}</AppText>
                  <AppText>
                    {formatMoneyWithSymbol(breakdown.feesCents)}
                  </AppText>
                </Row>
              ) : null}
            </Stack>
          </Surface>

          <SelectField
            label={t('financings.records.mode')}
            value={linkMode}
            options={[
              {
                label: t('financings.records.create'),
                value: 'create',
              },
              {
                label: t('financings.records.link'),
                value: 'link',
              },
              {
                label: t('financings.records.none'),
                value: 'none',
              },
            ]}
            onChange={(value) => {
              setLinkMode(value);
              if (value === 'link') setRecordPickerVisible(true);
              if (value !== 'link') setLinkedRecord(null);
            }}
          />
          {linkMode === 'link' ? (
            <Button
              label={
                linkedRecord
                  ? t('financings.records.linkedTo', {
                      name: linkedRecord.name,
                    })
                  : t('financings.records.choose')
              }
              variant='outline'
              onPress={() => setRecordPickerVisible(true)}
            />
          ) : null}
          {linkMode === 'create' ? (
            <>
              <SelectField
                label={t('financings.records.category')}
                value={categoryId}
                options={categoryOptions}
                onChange={setCategoryId}
                searchable
              />
              <SelectField
                label={t('financings.records.paymentMethod')}
                value={paymentMethodId}
                options={paymentOptions}
                onChange={setPaymentMethodId}
              />
              {group ? (
                <AppText variant='caption' color='muted'>
                  {t('financings.records.group')}: {group.group_name}
                </AppText>
              ) : (
                <InlineMessage
                  variant='warning'
                  message={t('financings.records.groupRequired')}
                />
              )}
            </>
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
      <FinancingRecordPicker
        visible={recordPickerVisible}
        date={date}
        amount={amount}
        onClose={() => setRecordPickerVisible(false)}
        onSelect={selectLinkedRecord}
      />
    </>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});
