import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  useCategories,
  usePaymentMethods,
  useShoppingListsRepository,
  useTableRepository,
} from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import type {
  ShoppingListView,
  ShoppingPurchaseMode,
  ShoppingRecordOption,
} from '@/src/db/repositories/shoppingLists';
import type { Group, RecordType } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
import type { RecordPickerOption } from '@/src/components/records/RecordPicker';
import { RecordPicker } from '@/src/components/records/RecordPicker';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { DateField } from '@/src/ui/forms/DateField';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';

type Props = {
  visible: boolean;
  list: ShoppingListView | null;
  initialAmountCents?: number | null;
  initialDate?: number | null;
  onClose: () => void;
  onSaved: () => void;
};

const startOfDay = (date: number) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next.getTime();
};

const endOfDay = (date: number) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next.getTime();
};

const shoppingErrorKey = (message: string) => {
  if (!message.startsWith('SHOPPING_')) return null;
  const suffix = message.slice('SHOPPING_'.length).toLowerCase();
  return suffix.replace(/_([a-z])/g, (_, letter: string) =>
    letter.toUpperCase()
  );
};

export const ShoppingPurchaseForm = ({
  visible,
  list,
  initialAmountCents,
  initialDate,
  onClose,
  onSaved,
}: Props) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { group } = useRecordsStore();
  const repository = useShoppingListsRepository();
  const categoriesRepository = useCategories();
  const paymentsRepository = usePaymentMethods();
  const recordTypesRepository = useTableRepository('RecordTypes');

  const [mode, setMode] = useState<ShoppingPurchaseMode>('create');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(() => Date.now());
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [recordTypeId, setRecordTypeId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [recordTypes, setRecordTypes] = useState<RecordType[]>([]);
  const [categories, setCategories] = useState<
    { id?: number; category_name: string }[]
  >([]);
  const [payments, setPayments] = useState<
    { id?: number; method_name: string }[]
  >([]);
  const [linkedRecord, setLinkedRecord] =
    useState<ShoppingRecordOption | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !list) return;
    let active = true;
    setMode('create');
    setAmount(initialAmountCents ?? list.totalCents);
    const startDate = initialDate ?? Date.now();
    setDate(startDate);
    setLinkedRecord(null);
    setError(null);
    Promise.all([
      categoriesRepository.fetchCategories(),
      paymentsRepository.fetchPaymentMethods(),
      recordTypesRepository.fetchAll(),
      repository.listGroupsForDate(startDate),
    ]).then(([nextCategories, nextPayments, nextTypes, nextGroups]) => {
      if (!active) return;
      setCategories(nextCategories ?? []);
      setPayments(nextPayments ?? []);
      setRecordTypes((nextTypes ?? []) as RecordType[]);
      setGroups(nextGroups);
      const current = nextGroups.find((item) => item.id === group?.id);
      setGroupId(current?.id ?? nextGroups[0]?.id ?? null);
      setCategoryId(nextCategories?.[0]?.id ?? null);
      setPaymentMethodId(nextPayments?.[0]?.id ?? null);
      const expenseType =
        (nextTypes ?? []).find((type) => type.effect === '-') ?? nextTypes?.[0];
      setRecordTypeId(expenseType?.id ?? null);
    });
    return () => {
      active = false;
    };
  }, [visible, list?.id, initialAmountCents, initialDate]);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    repository.listGroupsForDate(date).then((nextGroups) => {
      if (!active) return;
      setGroups(nextGroups);
      setGroupId((current) => {
        if (current != null && nextGroups.some((item) => item.id === current)) {
          return current;
        }
        const fallback = nextGroups.find((item) => item.id === group?.id);
        return fallback?.id ?? nextGroups[0]?.id ?? null;
      });
    });
    return () => {
      active = false;
    };
  }, [visible, date]);

  const groupOptions = groups.flatMap((item) =>
    item.id == null ? [] : [{ label: item.group_name, value: item.id }]
  );
  const recordTypeOptions = recordTypes.flatMap((type) =>
    type.id == null ? [] : [{ label: type.type_name, value: type.id }]
  );
  const categoryOptions = categories.flatMap((category) =>
    category.id == null ? []
      : [{ label: category.category_name, value: category.id }]
  );
  const paymentOptions = payments.flatMap((payment) =>
    payment.id == null ? [] : [{ label: payment.method_name, value: payment.id }]
  );

  const selectedRecordLabel = useMemo(
    () =>
      linkedRecord
        ? t('shopping.record.linkedTo', { name: linkedRecord.name })
        : t('shopping.record.choose'),
    [linkedRecord, t]
  );

  const selectLinkedRecord = (option: RecordPickerOption) => {
    const next = option as ShoppingRecordOption;
    setLinkedRecord(next);
    setAmount(next.amount);
    setDate(next.date);
    setCategoryId(next.categoryId);
    setPaymentMethodId(next.paymentMethodId);
    setRecordTypeId(next.recordTypeId);
    setGroupId(next.groupId ?? groupId);
  };

  const fetchRecords = (search: string) =>
    repository.searchRecords({
      groupId,
      from: startOfDay(date),
      to: endOfDay(date),
      amount,
      search,
    });

  const save = async () => {
    if (!list?.id) return;
    if (mode === 'none') {
      onClose();
      return;
    }
    if (amount <= 0) {
      setError(t('shopping.errors.amountRequired'));
      return;
    }
    if (mode === 'create') {
      if (!groupId) {
        setError(t('shopping.errors.groupRequired'));
        return;
      }
      if (!recordTypeId) {
        setError(t('shopping.errors.recordTypeRequired'));
        return;
      }
      if (!categoryId) {
        setError(t('shopping.errors.categoryRequired'));
        return;
      }
      if (!paymentMethodId) {
        setError(t('shopping.errors.paymentRequired'));
        return;
      }
    }
    if (mode === 'link' && !linkedRecord) {
      setError(t('shopping.record.required'));
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await repository.registerPurchase(list.id, {
        mode,
        amountCents: amount,
        date,
        groupId,
        recordTypeId,
        categoryId,
        paymentMethodId,
        recordId: linkedRecord?.id ?? null,
        recordName: list.list_name,
      });
      showToast({
        message: t('shopping.toast.purchaseRegistered'),
        type: 'success',
      });
      onSaved();
      onClose();
    } catch (cause) {
      if (__DEV__) console.warn('[shopping] purchase failed', cause);
      const message = cause instanceof Error ? cause.message : '';
      const key = shoppingErrorKey(message);
      if (key) {
        setError(t(`shopping.errors.${key}` as never));
      } else {
        const mapped = mapDatabaseError(cause, t('toast.error'));
        setError(t(`dbErrors.${mapped.code}` as never));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        onClose={onClose}
        title={t('shopping.record.title')}
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
              loading={busy}
              style={styles.footerButton}
            />
          </View>
        }
      >
        <Stack gap='md'>
          {list ? (
            <Surface variant='muted' padding='md'>
              <AppText variant='body' numberOfLines={1}>
                {list.list_name}
              </AppText>
              <AppText variant='caption' color='muted'>
                {t('shopping.total.label')}:{' '}
                {formatMoneyWithSymbol(list.totalCents)}
                {list.isPartial ? ` · ${t('shopping.total.partial', {
                  count: list.items.filter(
                    (item) => item.is_checked && item.price_cents == null
                  ).length,
                })}` : ''}
              </AppText>
            </Surface>
          ) : null}

          <SelectField<ShoppingPurchaseMode>
            label={t('shopping.record.mode')}
            value={mode}
            options={[
              { label: t('shopping.record.create'), value: 'create' },
              { label: t('shopping.record.link'), value: 'link' },
              { label: t('shopping.record.none'), value: 'none' },
            ]}
            onChange={(value) => {
              setMode(value);
              setError(null);
              if (value === 'link') setPickerVisible(true);
              if (value !== 'link') setLinkedRecord(null);
            }}
          />

          {mode !== 'none' ? (
            <>
              <MoneyField
                label={t('shopping.record.amount')}
                value={amount}
                onChangeCents={(value) => {
                  setAmount(value);
                  setLinkedRecord(null);
                }}
                required
              />
              <View style={styles.inlineActions}>
                <Button
                  label={t('shopping.record.useTotal')}
                  size='sm'
                  variant='ghost'
                  onPress={() => setAmount(list?.totalCents ?? 0)}
                />
                <AppText variant='caption' color='muted'>
                  {t('shopping.record.calculated')}:{' '}
                  {formatMoneyWithSymbol(list?.totalCents ?? 0)}
                </AppText>
              </View>
              <DateField
                label={t('shopping.record.date')}
                value={date}
                onChange={(value) => {
                  setDate(value);
                  setLinkedRecord(null);
                }}
              />
              <SelectField<number>
                label={t('shopping.record.group')}
                value={groupId}
                options={groupOptions}
                onChange={setGroupId}
              />
              {groupOptions.length === 0 ? (
                <InlineMessage
                  variant='warning'
                  message={t('shopping.record.groupRequired')}
                />
              ) : null}
            </>
          ) : null}

          {mode === 'link' ? (
            <Button
              label={selectedRecordLabel}
              variant='outline'
              onPress={() => setPickerVisible(true)}
            />
          ) : null}

          {mode === 'create' ? (
            <>
              <SelectField<number>
                label={t('shopping.record.recordType')}
                value={recordTypeId}
                options={recordTypeOptions}
                onChange={setRecordTypeId}
              />
              <SelectField<number>
                label={t('shopping.record.category')}
                value={categoryId}
                options={categoryOptions}
                onChange={setCategoryId}
                searchable
              />
              <SelectField<number>
                label={t('shopping.record.paymentMethod')}
                value={paymentMethodId}
                options={paymentOptions}
                onChange={setPaymentMethodId}
              />
            </>
          ) : null}

          {error ? <InlineMessage variant='error' message={error} /> : null}
        </Stack>
      </Modal>

      <RecordPicker<ShoppingRecordOption>
        visible={pickerVisible}
        title={t('shopping.picker.title')}
        searchPlaceholder={t('shopping.picker.search')}
        emptyLabel={t('shopping.picker.empty')}
        footerLabel={formatMoneyWithSymbol(amount)}
        onClose={() => setPickerVisible(false)}
        onSelect={selectLinkedRecord}
        fetcher={fetchRecords}
      />
    </>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
  inlineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
});
