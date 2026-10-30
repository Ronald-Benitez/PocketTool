import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useDataStore } from '@/src/stores';
import { useConfigs } from '@/src/hooks/useConfigs';
import { useBudgetTemplatesRepository } from '@/src/db';
import type { BudgetTemplateItemView } from '@/src/domain/budgets/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { TextField } from '@/src/ui/forms/TextField';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { Modal } from '@/src/ui/overlays/Modal';
import { useToast } from '@/src/ui/feedback/ToastProvider';

type BudgetTemplateItemFormProps = {
  visible: boolean;
  templateId: number;
  item?: BudgetTemplateItemView | null;
  onClose: () => void;
  onSaved: () => void;
};

export const BudgetTemplateItemForm = ({
  visible,
  templateId,
  item,
  onClose,
  onSaved,
}: BudgetTemplateItemFormProps) => {
  const { t } = useLanguage();
  const repository = useBudgetTemplatesRepository();
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

  useEffect(() => {
    if (!visible) return;
    setError(null);
    setScope(item?.scope ?? 'category');
    setCategoryId(item?.categoryId ?? null);
    setTypeId(item?.recordTypeId ?? null);
    setFixedId(item?.fixedId ?? null);
    setAmountCents(item?.amountCents ?? 0);
    setPriority(item?.priority ?? 2);
    setNotes(item?.notes ?? '');
  }, [visible, item]);

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
    fixed.id === undefined ? [] : [{ label: `${fixed.fixed_name} · ${fixed.fixed_day}`, value: fixed.id }]
  );
  const priorityOptions = [
    { label: t('budget.lines.high'), value: 1 },
    { label: t('budget.lines.medium'), value: 2 },
    { label: t('budget.lines.low'), value: 3 },
  ];

  const save = async () => {
    if (!categoryId || !typeId || amountCents <= 0 || (scope === 'fixed' && !fixedId)) {
      setError(t('budget.toast.empty'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await repository.saveItem({
        id: item?.id,
        budget_template_id: templateId,
        amount: amountCents,
        record_type_id: typeId,
        category_id: categoryId,
        fixed_id: scope === 'fixed' ? fixedId : null,
        scope,
        priority,
        notes: notes.trim() || null,
      });
      showToast({ message: t('budget.toast.templateSaved'), type: 'success' });
      onSaved();
      onClose();
    } catch {
      setError(t('budget.toast.error'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!item) return;
    setSaving(true);
    try {
      await repository.deleteItem(item.id);
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
        title={item ? t('budget.templates.editItem') : t('budget.templates.addItem')}
        closeLabel={t('budget.actions.cancel')}
        scrollable
        footer={
          <View style={styles.footer}>
            {item ? (
              <Button
                label={t('budget.templates.deleteItem')}
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
            label={t('budget.templates.scope')}
            value={scope}
            options={[
              { label: t('budget.lines.categoryScope'), value: 'category' },
              { label: t('budget.lines.fixedScope'), value: 'fixed' },
            ]}
            onChange={(value) => setScope(value)}
          />
          {scope === 'fixed' ? (
            <SelectField
              label={t('budget.templates.fixed')}
              value={fixedId}
              options={fixedOptions}
              onChange={(value) => {
                setFixedId(value);
                const fixed = (Fixeds ?? []).find((entry) => entry.id === value);
                if (fixed) {
                  setCategoryId(fixed.category_id ?? null);
                  setTypeId(fixed.record_type_id ?? null);
                  if (!item) setAmountCents(fixed.fixed_amount);
                }
              }}
              searchable
              searchPlaceholder={t('budget.templates.fixed')}
            />
          ) : null}
          <SelectField
            label={t('budget.templates.type')}
            required
            value={typeId}
            options={typeOptions}
            onChange={(value) => setTypeId(value)}
          />
          <SelectField
            label={t('budget.templates.category')}
            required
            value={categoryId}
            options={categoryOptions}
            onChange={(value) => setCategoryId(value)}
            searchable
            searchPlaceholder={t('budget.templates.category')}
          />
          <MoneyField
            label={t('budget.templates.amount')}
            required
            value={amountCents}
            onChangeCents={setAmountCents}
          />
          <SelectField
            label={t('budget.templates.priority')}
            value={priority}
            options={priorityOptions}
            onChange={(value) => setPriority(value)}
          />
          <TextField
            label={t('budget.templates.notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
          {error ? <InlineMessage variant='error' message={error} /> : null}
        </View>
      </Modal>
      <ConfirmDialog
        visible={confirmDelete}
        title={t('budget.templates.deleteItem')}
        message={t('budget.confirm.deleteTemplate')}
        confirmLabel={t('budget.templates.deleteItem')}
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
