import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";

import { useLanguage } from "@/src/lang/LanguageContext";
import { useRecords, useCategories } from "@/src/db";
import { Category, BudgetInsert, Budget } from "@/src/interfaces";
import useToast from "@/src/hooks/useToast";
import useRecordsStore from '@/src/stores/RecordsStore';
import useCategoriesStore from "@/src/stores/CategoriesStore";
import { useBudget } from "@/src/db/budget-handler";
import useColorStore from "@/src/stores/ColorsStore";
import ModalContainer from "../ui/modal-container";
import InputLabel from "../ui/InputLabel";
import PressableSwitch from "../ui/pressable-switch";
import BaseSelect from "../ui/base-select";
import useBudgetStore from "@/src/stores/BudgetStore";
import useAndroidToast from "@/src/hooks/useAndroidToast";

interface AddItemProps {
    item?: Budget
    children?: React.ReactNode
    openUpdate?: boolean
    open?: boolean
}

const AddItem = ({ item, children, openUpdate, open }: AddItemProps) => {
    const { group } = useRecordsStore()
    const { t } = useLanguage()
    const [name, setName] = useState<string>("")
    const [type, setType] = useState<"income" | "expense" | "transfer">("expense")
    const [category, setCategory] = useState<Category>()
    const [value, setValue] = useState<string>("")
    const [group_id, setGroupId] = useState<number>(group?.id || 0)
    const records = useRecords()
    const categoriesDB = useCategories()
    const { colors } = useColorStore()
    const { ToastContainer, showToast } = useToast()
    const { categories, setCategories } = useCategoriesStore()
    const budget = useBudget()
    const { setBudgets, setResumes } = useBudgetStore()
    const toast = useAndroidToast()

    useEffect(() => {
        if (!group) return
        setGroupId(group.id)
        const loadData = async () => {
            const ct = await categoriesDB.fetchCategories()
            setCategories(ct)
        }
        loadData()
    }, [group])

    useEffect(() => {
        if (!item) return
        setValue(String(item.amount))
        if (item.budget_type != type) {
            onTypeChange()
        }
        setGroupId(item.group_id)
        setCategory(categories?.find(cat => cat.id == item.category_id))
    }, [item])

    const onTypeChange = () => {
        if (type === "income") {
            setType("expense")
        } else if (type === "expense") {
            setType("transfer")
        } else {
            setType("income")
        }
    }

    const onSave = async () => {
        if (!group) return

        if (value === "" || !category?.id) {
            toast.emptyMessage()
            return
        }

        const newItem: BudgetInsert = {
            group_id,
            budget_type: type,
            amount: Number(value),
            category_id: category?.id as number,
        }

        try {
            if (item) {
                await budget.updateBudget(item.id_budget, {
                    ...newItem,
                })
                toast.editedMessage()
            } else {
                await budget.addBudget(newItem)
                toast.addedMessage()
                setName("")
                setValue("")
            }
            setBudgets(await budget.fetchBudget(group_id) as Budget[])
            setResumes(await budget.getAllResume(group_id))
        } catch (e) {
            console.log(e)
            toast.errorMessage()
        }
    }

    const onChangeCategory = (index: number) => {
        if (!categories) return
        setCategory(categories[index])
    }


    const typeColor = () => {
        switch (type) {
            case "income":
                return colors?.IncomeColor
            case "expense":
                return colors?.ExpenseColor;
            case "transfer":
                return colors?.TransferColor
        }
    }

    return (
        <>
            <ModalContainer
                buttonOpen={children}
                closeOnAccept={true}
                type="complete"
                onAccept={onSave}
                title={item ? t('item.edit') : t('item.add')}
                open={open}
            >
                <ScrollView>
                    <View style={localStyles.colContainer}>
                        <View style={localStyles.inputContainer}>
                            <PressableSwitch
                                onClick={onTypeChange}
                                text={t(`item.${type}`)}
                                label={t('item.type') + '*'}
                                textColor={colors ? typeColor() : "#000"}
                            />
                        </View>

                        <View style={localStyles.inputContainer}>
                            <BaseSelect
                                label={t('item.category')}
                                selected={category?.category_name}
                                onChange={onChangeCategory}
                                options={categories?.map(cat => cat.category_name)}
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
    )

}

const localStyles = StyleSheet.create({
    colContainer: {
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        paddingVertical: 20,
        gap: 20
    },

    inputContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center"
    }
})

export default AddItem