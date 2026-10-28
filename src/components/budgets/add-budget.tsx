import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useCategories, useBudget } from "@/src/db";
import { Budget, Insertable, RecordType } from "@/src/interfaces/schema";
import { centsToInput, parseMoneyToCents } from "@/src/utils";
import useToast from "@/src/hooks/useToast";
import useRecordsStore from "@/src/stores/RecordsStore";
import useCategoriesStore from "@/src/stores/CategoriesStore";
import useColorStore from "@/src/stores/ColorsStore";
import ModalContainer from "../ui/modal-container";
import InputLabel from "../ui/InputLabel";
import PressableSwitch from "../ui/pressable-switch";
import BaseSelect from "../ui/base-select";
import useBudgetStore from "@/src/stores/BudgetStore";
import useAndroidToast from "@/src/hooks/useAndroidToast";
import { useLanguage } from "@/src/lang/LanguageContext";
import { useDataStore } from "@/src/stores";

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

const AddItem = ({ item, children, openUpdate, open }: AddItemProps) => {
  const { group } = useRecordsStore();
  const { t } = useLanguage();
  const [type, setType] = useState<RecordType | undefined>();
  const [category, setCategory] = useState<{ id?: number; category_name: string }>();
  const [value, setValue] = useState<string>("");
  const [group_id, setGroupId] = useState<number>(group?.id || 0);
  const categoriesDB = useCategories();
  const { colors } = useColorStore();
  const { ToastContainer } = useToast();
  const { categories, setCategories } = useCategoriesStore();
  const { RecordTypes } = useDataStore();
  const budget = useBudget();
  const { setBudgets, setResumes } = useBudgetStore();
  const toast = useAndroidToast();

  const budgetTypes = RecordTypes.filter((recordType) =>
    ['+', '-', '='].includes(recordType.effect ?? '')
  );

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
    setValue(centsToInput(item.amount));
    setGroupId(item.group_id ?? group?.id ?? 0);
    setCategory(categories?.find((cat) => cat.id == item.category_id));
    setType(RecordTypes.find((recordType) => recordType.id === item.record_type_id));
  }, [item, categories, RecordTypes]);

  const onTypeChange = () => {
    if (budgetTypes.length === 0) return;
    const currentIndex = budgetTypes.findIndex((recordType) => recordType.id === type?.id);
    setType(budgetTypes[(currentIndex + 1) % budgetTypes.length]);
  };

  const onSave = async () => {
    if (!group) return;

    if (value === "" || !category?.id || !type?.id) {
      toast.emptyMessage();
      return;
    }

    const newItem: Insertable<Budget> = {
      group_id,
      record_type_id: type.id,
      amount: parseMoneyToCents(value),
      category_id: category.id,
    };

    try {
      if (item?.id) {
        await budget.updateBudget(item.id, newItem);
        toast.editedMessage();
      } else {
        await budget.addBudget(newItem);
        toast.addedMessage();
        setValue("");
      }
      setBudgets((await budget.fetchBudget(group_id)) ?? []);
      setResumes(await budget.getAllResume(group_id));
    } catch (e) {
      toast.errorMessage();
    }
  };

  const onChangeCategory = (index: number) => {
    if (!categories) return;
    setCategory(categories[index]);
  };

  const typeColor = () => {
    if (type?.record_color) return type.record_color;
    if (type?.effect === '+') return colors?.IncomeColor;
    if (type?.effect === '-') return colors?.ExpenseColor;
    return colors?.TransferColor;
  };

  return (
    <>
      <ModalContainer
        buttonOpen={children}
        closeOnAccept={true}
        type="complete"
        onAccept={onSave}
        title={item ? t('item.edit') : t('item.add')}
        open={open ?? openUpdate}
      >
        <ScrollView>
          <View style={localStyles.colContainer}>
            <View style={localStyles.inputContainer}>
              <PressableSwitch
                onClick={onTypeChange}
                text={t(`item.${effectToTranslation(type?.effect)}`)}
                label={t('item.type') + '*'}
                textColor={typeColor() || "#000"}
              />
            </View>

            <View style={localStyles.inputContainer}>
              <BaseSelect
                label={t('item.category')}
                selected={category?.category_name}
                onChange={onChangeCategory}
                options={categories?.map((cat) => cat.category_name)}
                title={t('item.selectCategory') + '*'}
              />
            </View>

            <View style={localStyles.inputContainer}>
              <InputLabel
                value={value}
                onChangeText={setValue}
                placeholder={t('item.value') + '*'}
                keyboardType="numeric"
              />
            </View>
          </View>
        </ScrollView>
        <ToastContainer />
      </ModalContainer>
    </>
  );
};

const localStyles = StyleSheet.create({
  colContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "center",
    paddingVertical: 20,
    gap: 20,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
});

export default AddItem;
