import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  useCategories,
  useFinancingsRepository,
  usePaymentMethods,
  usePeopleRepository,
  useSharedParticipantsRepository,
  useTableRepository,
} from '@/src/db';
import { calculatePaymentCents } from '@/src/domain/credits/amortization';
import type {
  FinancingWithRelations,
  Person,
  RecordType,
} from '@/src/interfaces/schema';
import type { ParticipantDraft } from '@/src/db/repositories/people';
import { SharedParticipantsField } from '@/src/components/shared/SharedParticipantsField';
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
import { TermField } from './TermField';


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
  const recordTypesRepository = useTableRepository('RecordTypes');
  const peopleRepository = usePeopleRepository();
  const participantsRepository = useSharedParticipantsRepository();
  const [kind, setKind] = useState<(typeof KINDS)[number]>(
    'installment_purchase'
  );
  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [principal, setPrincipal] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [annualRate, setAnnualRate] = useState('0');
  const [rateType, setRateType] = useState<'fixed' | 'variable'>('fixed');
  const [term, setTerm] = useState(12);
  const [useCalculatedPayment, setUseCalculatedPayment] = useState(true);
  const [payment, setPayment] = useState(0);
  const [startDate, setStartDate] = useState(() => Date.now());
  const [firstPaymentDate, setFirstPaymentDate] = useState(() => Date.now());
  const [paidInstallments, setPaidInstallments] = useState('0');
  const [capitalPaid, setCapitalPaid] = useState(0);
  const [people, setPeople] = useState<Person[]>([]);
  const [participants, setParticipants] = useState<ParticipantDraft[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [recordTypeId, setRecordTypeId] = useState<number | null>(null);
  const [recordTypes, setRecordTypes] = useState<RecordType[]>([]);
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
    setRateType(
      (financing?.rate_type as 'fixed' | 'variable') ?? 'fixed'
    );
    setTerm(financing?.term_months ?? 12);
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
    setParticipants([]);
    setPaymentMethodId(financing?.payment_method_id ?? null);
    setCategoryId(financing?.category_id ?? null);
    setRecordTypeId(financing?.record_type_id ?? null);
    setNotes(financing?.notes ?? '');
    setError(null);
  }, [visible, financing]);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    Promise.all([
      paymentsRepository.fetchPaymentMethods(),
      categoriesRepository.fetchCategories(),
      recordTypesRepository.fetchAll(),
      peopleRepository.fetchPeople(),
    ]).then(([methods, nextCategories, nextRecordTypes, nextPeople]) => {
      if (!active) return;
      setPaymentMethods(methods ?? []);
      setCategories(nextCategories ?? []);
      setRecordTypes((nextRecordTypes ?? []) as RecordType[]);
      setPeople(nextPeople ?? []);
      setPaymentMethodId((current) => current ?? methods?.[0]?.id ?? null);
      setCategoryId((current) => current ?? nextCategories?.[0]?.id ?? null);
      const expenseTypes = (nextRecordTypes ?? []).filter(
        (type) => type.effect === '-'
      );
      setRecordTypeId((current) => current ?? expenseTypes[0]?.id ?? null);
    });
    return () => {
      active = false;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !financing?.id) {
      setParticipants([]);
      return;
    }
    let active = true;
    participantsRepository.fetchFor('financing', financing.id).then((rows) => {
      if (!active) return;
      setParticipants(
        rows.map((row) => ({
          personId: row.person_id,
          sharePercent: row.share_percent,
          notes: row.notes,
        }))
      );
    });
    return () => {
      active = false;
    };
  }, [visible, financing?.id]);

  const financed = Math.max(0, principal - downPayment);
  const rateBps = Math.round(parseNumber(annualRate) * 100);
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
    const totalShared = participants.reduce(
      (total, participant) => total + participant.sharePercent,
      0
    );
    const uniquePeople = new Set(
      participants.map((participant) => participant.personId)
    );
    if (totalShared > 100.0001) {
      setError(t('shared.invalidTotal'));
      return;
    }
    if (uniquePeople.size !== participants.length) {
      setError(t('shared.duplicate'));
      return;
    }
    const sharedNames = participants
      .map((participant) => people.find((person) => person.id === participant.personId)?.name)
      .filter((value): value is string => Boolean(value))
      .join(', ');

    setSaving(true);
    setError(null);
    try {
      const savedId = await repository.saveFinancing({
        id: financing?.id,
        name: name.trim(),
        kind,
        lender: lender.trim() || null,
        principal_cents: principal,
        down_payment_cents: downPayment,
        financed_cents: financed,
        payment_cents: useCalculatedPayment ? null : payment,
        annual_rate_bps: rateBps,
        rate_type: rateType,
        term_months: term,
        start_date: startDate,
        first_payment_date: firstPaymentDate,
        payment_day: new Date(firstPaymentDate).getDate(),
        payment_method_id: paymentMethodId,
        category_id: categoryId,
        record_type_id: recordTypeId,
        paid_installments_before_app: Math.max(
          0,
          Math.floor(parseNumber(paidInstallments))
        ),
        capital_paid_before_app_cents: capitalPaid,
        is_shared: participants.length > 0 ? 1 : 0,
        shared_percent: participants.length > 0 ? totalShared : null,
        shared_counterparty: participants.length > 0 ? sharedNames || null : null,
        status:
          (financing?.status as
            | 'active'
            | 'paid'
            | 'refinanced'
            | 'cancelled'
            | undefined) ?? 'active',
        notes: notes.trim() || null,
      });
      await participantsRepository.replaceFor(
        'financing',
        savedId,
        participants
      );
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
        <SelectField
          label={t('financings.rateType')}
          value={rateType}
          options={[
            {
              label: t('financings.rateTypes.fixed'),
              value: 'fixed',
            },
            {
              label: t('financings.rateTypes.variable'),
              value: 'variable',
            },
          ]}
          onChange={setRateType}
        />
        <TermField
          label={t('financings.termMonths')}
          valueMonths={term}
          onChangeMonths={setTerm}
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
        <SharedParticipantsField
          people={people}
          value={participants}
          onChange={setParticipants}
          totalCents={financed}
        />
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
          label={t('financings.recordType')}
          value={recordTypeId}
          options={recordTypes.flatMap((type) =>
            type.id === undefined || type.effect !== '-'
              ? []
              : [{ label: type.type_name, value: type.id }]
          )}
          onChange={setRecordTypeId}
        />
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
