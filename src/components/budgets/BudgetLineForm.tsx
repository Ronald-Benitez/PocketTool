import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  RecordsModal,
  type RecordsModalRef,
} from '@/src/components/records/RecordsModal';
import { useDataStore } from '@/src/stores';
import { useConfigs } from '@/src/hooks/useConfigs';
import { useBudgetPlansRepository } from '@/src/db';
import type { BudgetLineComparison } from '@/src/domain/budgets/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { SelectField } from '@/src/ui/forms/SelectField';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { TextField } from '@/src/ui/forms/TextField';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { Modal } from '@/src/ui/overlays/Modal';
import { useToast } from '@/src/ui/feedback/ToastProvider';

type BudgetLineFormProps = {
  visible: boolean;
  planId: number;
  groupId: number;
  line?: BudgetLineComparison | null;
  onClose: () => void;
  onSaved: () => void;
};

export const BudgetLineForm = ({
  visible,
  planId,
  groupId,
  line,
  onClose,
  onSaved,
}: BudgetLineFormProps) => {
  const { t } = useLanguage();
  const repository = useBudgetPlansRepository();
  const { showToast } = useToast();
  const { Categories, RecordTypes, Fixeds } = useDataStore();
  const { configs } = useConfigs();
  const [scope, setScope] = useState<'category' | 'fixed'>('category');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [typeId, setTypeId] = useState<number | null>(null);
  const [fixedId, setFixedId] = useState<number | null>(null);
  const [amountCents, setAmountCents] = useState(0);
  const [priority, setPriority] = useState(2);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const recordsModalRef = useRef<RecordsModalRef | null>(null);

  useEffect(() => {
    if (!visible) return;
    setError(null);
    setScope(line?.scope ?? 'category');
    setCategoryId(line?.categoryId ?? null);
    setTypeId(line?.recordTypeId ?? null);
    setFixedId(line?.fixedId ?? null);
    setAmountCents(line?.plannedCents ?? 0);
    setPriority(line?.priority ?? 2);
    setNotes(line?.notes ?? '');
  }, [visible, line]);

  const budgetTypes = useMemo(
    () =>
      (RecordTypes ?? []).filter(
        (type) =>
          type.id !== undefined &&
          type.id !== configs.paymentCreditType &&
          (type.type_name ?? '').toLowerCase() !== 'payments' &&
          (type.effect === '+' || type.effect === '-')
      ),
    [RecordTypes, configs.paymentCreditType]
  );

  const typeOptions = budgetTypes.map((type) => ({
    label: type.type_name,
    value: type.id as number,
  }));
  const categoryOptions = (Categories ?? []).flatMap((category) =>
    category.id === undefined
      ? []
      : [{ label: category.category_name, value: category.id }]
  );
  const fixedOptions = (Fixeds ?? []).flatMap((fixed) =>
    fixed.id === undefined ||
    fixed.record_type_id === null ||
    fixed.record_type_id === undefined ||
    !budgetTypes.some((type) => type.id === fixed.record_type_id)
      ? []
      : [{ label: `${fixed.fixed_name} · ${fixed.fixed_day}`, value: fixed.id }]
  );
  const priorityOptions = [
    { label: t('budget.lines.high'), value: 1 },
    { label: t('budget.lines.medium'), value: 2 },
    { label: t('budget.lines.low'), value: 3 },
  ];

  const selectedFixed = (Fixeds ?? []).find((fixed) => fixed.id === fixedId);

  useEffect(() => {
    if (scope !== 'fixed' || !selectedFixed) return;
    setCategoryId(selectedFixed.category_id ?? null);
    setTypeId(selectedFixed.record_type_id ?? null);
    if (!line && amountCents === 0) {
      setAmountCents(selectedFixed.fixed_amount);
    }
  }, [scope, selectedFixed, line, amountCents]);

  const save = async () => {
    if (amountCents <= 0) {
      setError(t('budget.toast.empty'));
      return;
    }
    if (scope === 'category' && (!categoryId || !typeId)) {
      setError(t('budget.toast.empty'));
      return;
    }
    if (scope === 'fixed' && !fixedId) {
      setError(t('budget.toast.empty'));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await repository.saveLine({
        id: line?.lineId,
        budget_plan_id: planId,
        category_id: scope === 'category' ? categoryId : undefined,
        record_type_id: scope === 'category' ? typeId : undefined,
        fixed_id: scope === 'fixed' ? fixedId : null,
        scope,
        source: line ? undefined : 'manual',
        planned_amount: amountCents,
        priority,
        notes: notes.trim() || null,
      });
      showToast({ message: t('budget.toast.lineSaved'), type: 'success' });
      onSaved();
      onClose();
    } catch {
      setError(t('budget.toast.error'));
    } finally {
      setSaving(false);
    }
  };

  const openRecords = async () => {
    if (!line) return;
    setLoadingRecords(true);
    try {
      const records = await repository.fetchLineRecords(groupId, line.lineId);
      recordsModalRef.current?.open(records);
    } catch {
      setError(t('budget.toast.error'));
    } finally {
      setLoadingRecords(false);
    }
  };

  const remove = async () => {
    if (!line) return;
    setSaving(true);
    try {
      await repository.deleteLine(line.lineId);
      showToast({ message: t('budget.toast.lineDeleted'), type: 'success' });
      setConfirmDelete(false);
      onSaved();
      onClose();
    } catch {
      setError(t('budget.toast.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        onClose={onClose}
        title={line ? t('budget.lines.edit') : t('budget.lines.add')}
        closeLabel={t('budget.actions.cancel')}
        scrollable
        footer={
          <View style={styles.footer}>
            {line ? (
              <Button
                label={t('budget.lines.delete')}
                variant='danger'
                onPress={() => setConfirmDelete(true)}
                style={styles.footerButton}
              />
            ) : null}
            <Button
              label={t('budget.actions.cancel')}
              variant='outline'
              onPress={onClose}
              style={styles.footerButton}
            />
            <Button
              label={t('budget.actions.save')}
              onPress={save}
              loading={saving}
              style={styles.footerButton}
            />
          </View>
        }
      >
        <View style={styles.form}>
          <SelectField
            label={t('budget.lines.scope')}
            value={scope}
            options={[
              { label: t('budget.lines.categoryScope'), value: 'category' },
              { label: t('budget.lines.fixedScope'), value: 'fixed' },
            ]}
            onChange={(value) => {
              setScope(value);
              setCategoryId(null);
              setTypeId(null);
              setFixedId(null);
            }}
          />
          {scope === 'fixed' ? (
            <SelectField
              label={t('budget.lines.fixed')}
              required
              value={fixedId}
              options={fixedOptions}
              onChange={(value) => {
                setFixedId(value);
                const fixed = (Fixeds ?? []).find((item) => item.id === value);
                if (fixed) {
                  setCategoryId(fixed.category_id ?? null);
                  setTypeId(fixed.record_type_id ?? null);
                  if (!line) setAmountCents(fixed.fixed_amount);
                }
              }}
              searchable
              searchPlaceholder={t('budget.lines.fixed')}
            />
          ) : (
            <>
              <SelectField
                label={t('budget.lines.type')}
                required
                value={typeId}
                options={typeOptions}
                onChange={(value) => setTypeId(value)}
              />
              <SelectField
                label={t('budget.lines.category')}
                required
                value={categoryId}
                options={categoryOptions}
                onChange={(value) => setCategoryId(value)}
                searchable
                searchPlaceholder={t('budget.lines.category')}
              />
            </>
          )}
          <MoneyField
            label={t('budget.lines.amount')}
            required
            value={amountCents}
            onChangeCents={setAmountCents}
          />
          <SelectField
            label={t('budget.lines.priority')}
            value={priority}
            options={priorityOptions}
            onChange={(value) => setPriority(value)}
          />
          <TextField
            label={t('budget.lines.notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
          {line ? (
            <Button
              label={t('budget.actions.viewRecords')}
              variant='outline'
              onPress={openRecords}
              loading={loadingRecords}
            />
          ) : null}
          {error ? <InlineMessage variant='error' message={error} /> : null}
        </View>
      </Modal>
      <RecordsModal ref={recordsModalRef} />
      <ConfirmDialog
        visible={confirmDelete}
        title={t('budget.lines.delete')}
        message={t('budget.confirm.deleteLine')}
        confirmLabel={t('budget.lines.delete')}
        cancelLabel={t('budget.actions.cancel')}
        tone='danger'
        loading={saving}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  footerButton: {
    flex: 1,
  },
});
