import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  useCategories,
  usePaymentMethods,
  usePeopleRepository,
  useSavings,
  useTableRepository,
} from '@/src/db';
import type {
  SavingMovementInput,
  SavingRecordMode,
  SavingRecordOption,
  SavingView,
} from '@/src/db/repositories/savings';
import { mapDatabaseError } from '@/src/db/errors';
import type { RecordType } from '@/src/interfaces/schema';
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
import { SavingRecordPicker } from './SavingRecordPicker';

type Kind = 'deposit' | 'withdrawal' | 'interest' | 'adjustment';

type Props = {
  visible: boolean;
  saving: SavingView | null;
  onClose: () => void;
  onSaved: () => void;
};

export const SavingMovementForm = ({
  visible,
  saving,
  onClose,
  onSaved,
}: Props) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { group } = useRecordsStore();
  const repository = useSavings();
  const peopleRepository = usePeopleRepository();
  const categoriesRepository = useCategories();
  const paymentsRepository = usePaymentMethods();
  const recordTypesRepository = useTableRepository('RecordTypes');

  const [kind, setKind] = useState<Kind>('deposit');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(() => Date.now());
  const [personId, setPersonId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [linkMode, setLinkMode] = useState<SavingRecordMode>('none');
  const [linkedRecord, setLinkedRecord] = useState<SavingRecordOption | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [recordTypeId, setRecordTypeId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [savingBusy, setSavingBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [people, setPeople] = useState<{ id?: number; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id?: number; category_name: string }[]>([]);
  const [payments, setPayments] = useState<{ id?: number; method_name: string }[]>([]);
  const [recordTypes, setRecordTypes] = useState<RecordType[]>([]);

  useEffect(() => {
    if (!visible || !saving) return;
    let active = true;
    setKind('deposit');
    setAmount(0);
    setDate(Date.now());
    setPersonId(null);
    setNote('');
    setLinkMode(saving.records_mode === 'linked' ? 'create' : 'none');
    setLinkedRecord(null);
    setError(null);
    Promise.all([
      peopleRepository.fetchPeople(),
      categoriesRepository.fetchCategories(),
      paymentsRepository.fetchPaymentMethods(),
      recordTypesRepository.fetchAll(),
      repository.fetchSettings(),
    ]).then(([nextPeople, nextCategories, nextPayments, nextTypes, settings]) => {
      if (!active) return;
      setPeople(nextPeople);
      setCategories(nextCategories ?? []);
      setPayments(nextPayments ?? []);
      setRecordTypes((nextTypes ?? []) as RecordType[]);
      setCategoryId(settings?.category_id ?? nextCategories?.[0]?.id ?? null);
      setPaymentMethodId(
        settings?.payment_method_id ?? nextPayments?.[0]?.id ?? null
      );
      const expenseType =
        (nextTypes ?? []).find((type) => type.effect === '-') ?? nextTypes?.[0];
      setRecordTypeId(settings?.record_type_id ?? expenseType?.id ?? null);
    });
    return () => {
      active = false;
    };
  }, [visible, saving?.id]);

  const participantPeople = useMemo(() => {
    if (!saving) return [];
    const ids = new Set(saving.participants.map((participant) => participant.person_id));
    return people.filter((person) => person.id != null && ids.has(person.id));
  }, [people, saving]);

  const personOptions = participantPeople.flatMap((person) =>
    person.id === undefined ? [] : [{ label: person.name, value: person.id }]
  );
  const categoryOptions = categories.flatMap((category) =>
    category.id === undefined
      ? []
      : [{ label: category.category_name, value: category.id }]
  );
  const paymentOptions = payments.flatMap((payment) =>
    payment.id === undefined
      ? []
      : [{ label: payment.method_name, value: payment.id }]
  );
  const recordTypeOptions = recordTypes.flatMap((type) =>
    type.id === undefined ? [] : [{ label: type.type_name, value: type.id }]
  );

  const selectLinkedRecord = (option: SavingRecordOption) => {
    setLinkedRecord(option);
    setAmount(option.amount);
    setDate(option.date);
    setCategoryId(option.categoryId);
    setPaymentMethodId(option.paymentMethodId);
    setRecordTypeId(option.recordTypeId);
  };

  const save = async () => {
    if (!saving?.id || amount <= 0) {
      setError(t('savings.movement.invalid'));
      return;
    }
    if (kind === 'withdrawal' && amount > saving.snapshot.totalCents) {
      setError(t('savings.movement.insufficient'));
      return;
    }
    if (linkMode === 'link' && !linkedRecord) {
      setError(t('savings.records.required'));
      return;
    }
    setSavingBusy(true);
    setError(null);
    try {
      const payload: SavingMovementInput = {
        savings_id: saving.id,
        kind,
        amount_cents: amount,
        change_date: date,
        person_id: personId,
        note: note.trim() || null,
        group_id: group?.id ?? null,
        record_type_id: recordTypeId,
        record: {
          linkMode,
          recordId: linkedRecord?.id ?? null,
          groupId: group?.id ?? null,
          categoryId,
          paymentMethodId,
          recordTypeId,
        },
      };
      await repository.addMovement(payload);
      showToast({ message: t('savings.movement.saved'), type: 'success' });
      onSaved();
      onClose();
    } catch (cause) {
      if (__DEV__) console.warn('[savings] movement save failed', cause);
      const message = cause instanceof Error ? cause.message : '';
      setError(
        message === 'SAVING_INSUFFICIENT_FUNDS'
          ? t('savings.movement.insufficient')
          : message === 'RECORD_AMOUNT_MISMATCH'
            ? t('savings.records.amountMismatch')
            : message === 'RECORD_DATE_MISMATCH'
              ? t('savings.records.dateMismatch')
              : message === 'RECORD_ALREADY_LINKED'
                ? t('savings.records.alreadyLinked')
                : message === 'GROUP_REQUIRED'
                  ? t('savings.records.groupRequired')
                  : message === 'CATEGORY_REQUIRED'
                    ? t('savings.records.categoryRequired')
                    : message === 'PAYMENT_METHOD_REQUIRED'
                      ? t('savings.records.paymentRequired')
                      : t(`dbErrors.${mapDatabaseError(cause, '').code}` as never)
      );
    } finally {
      setSavingBusy(false);
    }
  };

  const suggested = saving?.contribution.suggestedCents ?? 0;

  return (
    <>
      <Modal
        visible={visible}
        onClose={onClose}
        title={t('savings.movement.title')}
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
              loading={savingBusy}
              style={styles.footerButton}
            />
          </View>
        }
      >
        <Stack gap='md'>
          <SelectField<Kind>
            label={t('savings.movement.kind')}
            value={kind}
            options={[
              { label: t('savings.movement.deposit'), value: 'deposit' },
              { label: t('savings.movement.withdrawal'), value: 'withdrawal' },
              { label: t('savings.movement.interest'), value: 'interest' },
              { label: t('savings.movement.adjustment'), value: 'adjustment' },
            ]}
            onChange={setKind}
          />
          {suggested > 0 && (kind === 'deposit' || kind === 'interest') ? (
            <Surface variant='muted' padding='md'>
              <Row justify='space-between' align='center' gap='sm'>
                <AppText variant='caption' color='muted'>
                  {t('savings.movement.suggested')}:{' '}
                  {formatMoneyWithSymbol(suggested)}
                </AppText>
                <Button
                  label={t('savings.movement.useSuggested')}
                  size='sm'
                  variant='ghost'
                  onPress={() => setAmount(suggested)}
                />
              </Row>
            </Surface>
          ) : null}
          <MoneyField
            label={t('savings.movement.amount')}
            required
            value={amount}
            onChangeCents={setAmount}
          />
          <DateField label={t('savings.movement.date')} value={date} onChange={setDate} />
          {personOptions.length > 0 ? (
            <SelectField<number>
              label={t('savings.movement.person')}
              value={personId}
              options={[{ label: t('savings.movement.own'), value: 0 }, ...personOptions]}
              onChange={(value) => setPersonId(value === 0 ? null : value)}
            />
          ) : null}
          <TextField
            label={t('savings.movement.note')}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={2}
          />

          {saving?.records_mode === 'linked' ? (
            <>
              <SelectField<SavingRecordMode>
                label={t('savings.records.mode')}
                value={linkMode}
                options={[
                  { label: t('savings.records.create'), value: 'create' },
                  { label: t('savings.records.link'), value: 'link' },
                  { label: t('savings.records.none'), value: 'none' },
                ]}
                onChange={(value) => {
                  setLinkMode(value);
                  if (value === 'link') setPickerVisible(true);
                  if (value !== 'link') setLinkedRecord(null);
                }}
              />
              {linkMode === 'link' ? (
                <Button
                  label={
                    linkedRecord
                      ? t('savings.records.linkedTo', { name: linkedRecord.name })
                      : t('savings.records.choose')
                  }
                  variant='outline'
                  onPress={() => setPickerVisible(true)}
                />
              ) : null}
              {linkMode === 'create' ? (
                <>
                  <SelectField<number>
                    label={t('savings.records.recordType')}
                    value={recordTypeId}
                    options={recordTypeOptions}
                    onChange={setRecordTypeId}
                  />
                  <SelectField<number>
                    label={t('savings.records.category')}
                    value={categoryId}
                    options={categoryOptions}
                    onChange={setCategoryId}
                    searchable
                  />
                  <SelectField<number>
                    label={t('savings.records.paymentMethod')}
                    value={paymentMethodId}
                    options={paymentOptions}
                    onChange={setPaymentMethodId}
                  />
                  {group ? (
                    <AppText variant='caption' color='muted'>
                      {t('savings.records.group')}: {group.group_name}
                    </AppText>
                  ) : (
                    <InlineMessage
                      variant='warning'
                      message={t('savings.records.groupRequired')}
                    />
                  )}
                </>
              ) : null}
            </>
          ) : null}
          {error ? <InlineMessage variant='error' message={error} /> : null}
        </Stack>
      </Modal>
      <SavingRecordPicker
        visible={pickerVisible}
        date={date}
        amount={amount}
        onClose={() => setPickerVisible(false)}
        onSelect={selectLinkedRecord}
      />
    </>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});
