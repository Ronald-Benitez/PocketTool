import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useCategories, useBudget } from "@/src/db";
import type { Budget, Insertable, RecordType } from "@/src/interfaces/schema";
import useRecordsStore from "@/src/stores/RecordsStore";
import useCategoriesStore from "@/src/stores/CategoriesStore";
import useBudgetStore from "@/src/stores/BudgetStore";
import useAndroidToast from "@/src/hooks/useAndroidToast";
import { useLanguage } from "@/src/lang/LanguageContext";
import { useDataStore } from "@/src/stores";
import { Button } from "@/src/ui/actions/Button";
import { ColoredSelectOption } from "@/src/ui/forms/ColoredSelectOption";
import { MoneyField } from "@/src/ui/forms/MoneyField";
import { SelectField } from "@/src/ui/forms/SelectField";
import { Modal } from "@/src/ui/overlays/Modal";
import { useTheme } from "@/src/ui/theme/ThemeProvider";

interface AddItemProps {
  item?: Budget;
  children?: React.ReactNode;
  openUpdate?: boolean;
  open?: boolean;
}

const effectToTranslation = (effect: string | null | undefined) => {
  if (effect === '+') return 'income';
  if (effect === '-') return 'expense';
  return 'transfer';
};

const AddBudget = ({ item, children, openUpdate, open }: AddItemProps) => {
  const { group } = useRecordsStore();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<RecordType | undefined>();
  const [category, setCategory] = useState<{ id?: number; category_name: string }>();
  const [amountCents, setAmountCents] = useState<number>(0);
  const [group_id, setGroupId] = useState<number>(group?.id || 0);
  const categoriesDB = useCategories();
  const { categories, setCategories } = useCategoriesStore();
  const { RecordTypes } = useDataStore();
  const budget = useBudget();
  const { setBudgets, setResumes } = useBudgetStore();
  const toast = useAndroidToast();
  const firstOpenEffect = useRef(true);

  const budgetTypes = (RecordTypes ?? []).filter((recordType) =>
    ['+', '-', '='].includes(recordType.effect ?? '')
  );

  useEffect(() => {
    if (firstOpenEffect.current) {
      firstOpenEffect.current = false;
      return;
    }
    setVisible(true);
  }, [open, openUpdate]);

  useEffect(() => {
    if (!group?.id) return;
    setGroupId(group.id);
    const loadData = async () => {
      const ct = await categoriesDB.fetchCategories();
      setCategories(ct);
    };
    loadData();
  }, [group]);

  useEffect(() => {
    if (!item) return;
    setAmountCents(item.amount);
    setGroupId(item.group_id ?? group?.id ?? 0);
    setCategory(categories?.find((cat) => cat.id === item.category_id));
    setType(RecordTypes?.find((recordType) => recordType.id === item.record_type_id));
  }, [item, categories, RecordTypes]);

  const closeModal = () => setVisible(false);

  const onSave = async () => {
    if (!group) return;

    if (amountCents <= 0 || !category?.id || !type?.id) {
      toast.emptyMessage();
      return;
    }

    const newItem: Insertable<Budget> = {
      group_id,
      record_type_id: type.id,
      amount: amountCents,
      category_id: category.id,
    };

    try {
      if (item?.id) {
        await budget.updateBudget(item.id, newItem);
        toast.editedMessage();
      } else {
        await budget.addBudget(newItem);
        toast.addedMessage();
        setAmountCents(0);
      }
      setBudgets((await budget.fetchBudget(group_id)) ?? []);
      setResumes(await budget.getAllResume(group_id));
      closeModal();
    } catch {
      toast.errorMessage();
    }
  };

  const colorForType = (recordType?: RecordType) => {
    if (recordType?.record_color) return recordType.record_color;
    if (recordType?.effect === '+') return colors.income;
    if (recordType?.effect === '-') return colors.expense;
    return colors.transfer;
  };

  const typeColor = () => colorForType(type);

  const typeOptions = budgetTypes.flatMap((recordType) =>
    typeof recordType.id === 'number'
      ? [{
        label: recordType.type_name || t(`item.${effectToTranslation(recordType.effect)}`),
        value: recordType.id,
      }]
      : []
  );
  const categoryOptions = (categories ?? []).flatMap((cat) =>
    typeof cat.id === 'number' ? [{ label: cat.category_name, value: cat.id }] : []
  );

  return (
    <>
      {children ? (
        <Pressable onPress={() => setVisible(true)}>{children}</Pressable>
      ) : null}
      <Modal
        visible={visible}
        onClose={closeModal}
        title={item ? t('item.edit') : t('item.add')}
        closeLabel={t('cancel')}
        scrollable
        footer={
          <View style={styles.footer}>
            <Button
              label={t('cancel')}
              variant='outline'
              onPress={closeModal}
              style={styles.footerButton}
            />
            <Button
              label={t('confirm')}
              onPress={onSave}
              style={styles.footerButton}
            />
          </View>
        }
      >
        <View style={styles.form}>
          <SelectField<number>
            label={t('item.type')}
            required
            value={type?.id}
            title={t('item.type')}
            options={typeOptions}
            onChange={(id) => setType(budgetTypes.find((recordType) => recordType.id === id))}
            renderValue={(option) => (
              <ColoredSelectOption
                color={typeColor()}
                label={option?.label ?? t('item.type')}
              />
            )}
            renderOption={(option) => (
              <ColoredSelectOption
                color={colorForType(budgetTypes.find((recordType) => recordType.id === option.value))}
                label={option.label}
              />
            )}
          />
          <SelectField<number>
            label={t('item.category')}
            required
            value={category?.id}
            title={t('item.selectCategory')}
            options={categoryOptions}
            onChange={(id) => setCategory(categories?.find((cat) => cat.id === id))}
          />
          <MoneyField
            label={t('item.value')}
            required
            value={amountCents}
            onChangeCents={setAmountCents}
          />
        </View>
      </Modal>
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

export default AddBudget;
