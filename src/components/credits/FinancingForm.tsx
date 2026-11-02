import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  useCategories,
  useFinancingsRepository,
  usePaymentMethods,
} from '@/src/db';
import { calculatePaymentCents } from '@/src/domain/credits/amortization';
import type { FinancingWithRelations } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { DateField } from '@/src/ui/forms/DateField';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { SwitchField } from '@/src/ui/forms/SwitchField';
import { TextField } from '@/src/ui/forms/TextField';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';


type FinancingFormProps = {
  visible: boolean;
  financing?: FinancingWithRelations | null;
  onClose: () => void;
  onSaved: () => void;
};

const KINDS = [
  'installment_purchase',
  'bank_loan',
  'mortgage',
  'auto_loan',
  'personal_loan',
  'shared_loan',
  'other',
] as const;

const parseNumber = (value: string) => {
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
};

export const FinancingForm = ({
  visible,
  financing,
  onClose,
  onSaved,
}: FinancingFormProps) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const repository = useFinancingsRepository();
  const paymentsRepository = usePaymentMethods();
  const categoriesRepository = useCategories();
  const [kind, setKind] = useState<(typeof KINDS)[number]>(
    'installment_purchase'
  );
  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [principal, setPrincipal] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [annualRate, setAnnualRate] = useState('0');
  const [termMonths, setTermMonths] = useState('12');
  const [useCalculatedPayment, setUseCalculatedPayment] = useState(true);
  const [payment, setPayment] = useState(0);
  const [startDate, setStartDate] = useState(() => Date.now());
  const [firstPaymentDate, setFirstPaymentDate] = useState(() => Date.now());
  const [paidInstallments, setPaidInstallments] = useState('0');
  const [capitalPaid, setCapitalPaid] = useState(0);
  const [isShared, setIsShared] = useState(false);
  const [sharedPercent, setSharedPercent] = useState('50');
  const [sharedCounterparty, setSharedCounterparty] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<
    { id?: number; method_name: string; is_credit_card?: boolean | number | null }[]
  >([]);
  const [categories, setCategories] = useState<
    { id?: number; category_name: string }[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setKind(
      (financing?.kind as (typeof KINDS)[number]) ?? 'installment_purchase'
    );
    setName(financing?.name ?? '');
    setLender(financing?.lender ?? '');
    setPrincipal(financing?.principal_cents ?? 0);
    setDownPayment(financing?.down_payment_cents ?? 0);
    setAnnualRate(((financing?.annual_rate_bps ?? 0) / 100).toString());
    setTermMonths(String(financing?.term_months ?? 12));
    setUseCalculatedPayment(
      financing?.payment_cents == null || financing.payment_cents <= 0
    );
    setPayment(financing?.payment_cents ?? 0);
    setStartDate(financing?.start_date ?? Date.now());
    setFirstPaymentDate(
      financing?.first_payment_date ?? financing?.start_date ?? Date.now()
    );
    setPaidInstallments(String(financing?.paid_installments_before_app ?? 0));
    setCapitalPaid(financing?.capital_paid_before_app_cents ?? 0);
    setIsShared(Boolean(financing?.is_shared));
    setSharedPercent(String(financing?.shared_percent ?? 50));
    setSharedCounterparty(financing?.shared_counterparty ?? '');
    setPaymentMethodId(financing?.payment_method_id ?? null);
    setCategoryId(financing?.category_id ?? null);
    setNotes(financing?.notes ?? '');
    setError(null);
  }, [visible, financing]);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    Promise.all([
      paymentsRepository.fetchPaymentMethods(),
      categoriesRepository.fetchCategories(),
    ]).then(([methods, nextCategories]) => {
      if (!active) return;
      setPaymentMethods(methods ?? []);
      setCategories(nextCategories ?? []);
      setPaymentMethodId((current) => current ?? methods?.[0]?.id ?? null);
      setCategoryId((current) => current ?? nextCategories?.[0]?.id ?? null);
    });
    return () => {
      active = false;
    };
  }, [visible]);

  const financed = Math.max(0, principal - downPayment);
  const rateBps = Math.round(parseNumber(annualRate) * 100);
  const term = Math.max(0, Math.floor(parseNumber(termMonths)));
  const estimatedPayment = useMemo(
    () =>
      calculatePaymentCents({
        principalCents: financed,
        annualRateBps: rateBps,
        termMonths: term,
      }),
    [financed, rateBps, term]
  );
  const selectedPaymentMethod = paymentMethods.find(
    (method) => method.id === paymentMethodId
  );
  const affectsCard =
    kind === 'installment_purchase' &&
    rateBps === 0 &&
    Boolean(selectedPaymentMethod?.is_credit_card);
  const paymentDifference = payment - estimatedPayment;

  const save = async () => {
    if (
      !name.trim() ||
      principal <= 0 ||
      financed <= 0 ||
      term <= 0 ||
      rateBps < 0 ||
      (!useCalculatedPayment && payment <= 0)
    ) {
      setError(t('financings.invalidFields'));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await repository.saveFinancing({
        id: financing?.id,
        name: name.trim(),
        kind,
        lender: lender.trim() || null,
        principal_cents: principal,
        down_payment_cents: downPayment,
        financed_cents: financed,
        payment_cents: useCalculatedPayment ? null : payment,
        annual_rate_bps: rateBps,
        rate_type: 'fixed',
        term_months: term,
        start_date: startDate,
        first_payment_date: firstPaymentDate,
        payment_day: new Date(firstPaymentDate).getDate(),
        payment_method_id: paymentMethodId,
        category_id: categoryId,
        record_type_id: null,
        paid_installments_before_app: Math.max(
          0,
          Math.floor(parseNumber(paidInstallments))
        ),
        capital_paid_before_app_cents: capitalPaid,
        is_shared: isShared ? 1 : 0,
        shared_percent: isShared ? parseNumber(sharedPercent) : null,
        shared_counterparty: isShared
          ? sharedCounterparty.trim() || null
          : null,
        status:
          (financing?.status as
            | 'active'
            | 'paid'
            | 'refinanced'
            | 'cancelled'
            | undefined) ?? 'active',
        notes: notes.trim() || null,
      });
      showToast({ message: t('financings.financingSaved'), type: 'success' });
      onSaved();
      onClose();
    } catch (cause) {
      if (__DEV__) console.warn('[financings] save failed', cause);
      setError(t('financings.invalidFields'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={financing ? t('financings.edit') : t('financings.add')}
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
      <View style={styles.form}>
        <SelectField
          label={t('financings.kind')}
          value={kind}
          options={KINDS.map((value) => ({
            label: t(`financings.kinds.${value}` as never),
            value,
          }))}
          onChange={setKind}
        />
        <TextField
          label={t('financings.name')}
          required
          value={name}
          onChangeText={setName}
        />
        <TextField
          label={t('financings.lender')}
          value={lender}
          onChangeText={setLender}
        />
        <MoneyField
          label={t('financings.principal')}
          value={principal}
          onChangeCents={setPrincipal}
        />
        <MoneyField
          label={t('financings.downPayment')}
          value={downPayment}
          onChangeCents={setDownPayment}
        />
        <AppText variant='caption' color='muted'>
          {t('financings.financed')}: {formatMoneyWithSymbol(financed)}
        </AppText>
        <TextField
          label={t('financings.annualRate')}
          value={annualRate}
          onChangeText={setAnnualRate}
          keyboardType='decimal-pad'
        />
        <TextField
          label={t('financings.termMonths')}
          value={termMonths}
          onChangeText={setTermMonths}
          keyboardType='number-pad'
        />
        {estimatedPayment > 0 ? (
          <AppText variant='caption' color='muted'>
            {t('financings.expectedPayment')}:{' '}
            {formatMoneyWithSymbol(estimatedPayment)}
          </AppText>
        ) : null}
        <SwitchField
          label={t('financings.useCalculatedPayment')}
          value={useCalculatedPayment}
          onChange={setUseCalculatedPayment}
        />
        {!useCalculatedPayment ? (
          <>
            <MoneyField
              label={t('financings.agreedPayment')}
              value={payment}
              onChangeCents={setPayment}
              hint={t('financings.agreedPaymentHint')}
            />
            {payment > 0 && paymentDifference > 0 ? (
              <InlineMessage
                variant='info'
                message={t('financings.paymentAboveCalculated', {
                  amount: formatMoneyWithSymbol(paymentDifference),
                })}
              />
            ) : null}
            {payment > 0 && paymentDifference < 0 ? (
              <InlineMessage
                variant='info'
                message={t('financings.paymentBelowCalculated')}
              />
            ) : null}
          </>
        ) : null}
        <DateField
          label={t('financings.startDate')}
          value={startDate}
          onChange={setStartDate}
        />
        <DateField
          label={t('financings.firstPaymentDate')}
          value={firstPaymentDate}
          onChange={setFirstPaymentDate}
        />
        <TextField
          label={t('financings.paidInstallments')}
          value={paidInstallments}
          onChangeText={setPaidInstallments}
          keyboardType='number-pad'
        />
        <MoneyField
          label={t('financings.capitalPaid')}
          value={capitalPaid}
          onChangeCents={setCapitalPaid}
        />
        <SwitchField
          label={t('financings.shared')}
          value={isShared}
          onChange={setIsShared}
        />
        {isShared ? (
          <>
            <TextField
              label={t('financings.sharedPercent')}
              value={sharedPercent}
              onChangeText={setSharedPercent}
              keyboardType='decimal-pad'
            />
            <TextField
              label={t('financings.sharedCounterparty')}
              value={sharedCounterparty}
              onChangeText={setSharedCounterparty}
            />
          </>
        ) : null}
        <SelectField
          label={t('financings.paymentMethod')}
          value={paymentMethodId}
          options={paymentMethods.flatMap((method) =>
            method.id === undefined
              ? []
              : [{ label: method.method_name, value: method.id }]
          )}
          onChange={setPaymentMethodId}
        />
        {affectsCard ? (
          <InlineMessage variant='info' message={t('financings.cardImpactHint')} />
        ) : null}
        <SelectField
          label={t('financings.category')}
          value={categoryId}
          options={categories.flatMap((category) =>
            category.id === undefined
              ? []
              : [{ label: category.category_name, value: category.id }]
          )}
          onChange={setCategoryId}
          searchable
        />
        <TextField
          label={t('financings.notes')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
        {error ? <InlineMessage variant='error' message={error} /> : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  form: { gap: 16 },
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});
