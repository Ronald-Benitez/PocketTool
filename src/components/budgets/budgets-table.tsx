import { View, Text, Pressable, TextStyle, StyleProp, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'

import { useLanguage } from '@/src/lang/LanguageContext'
import type { BudgetItemView } from '@/src/interfaces/schema'
import { formatMoneyWithSymbol } from '@/src/utils'
import styles from '@/src/styles/styles'
import { SwipeAction } from '@/src/ui/actions/SwipeAction'
import useDate from '@/src/hooks/useDate'
import { useRecords, useBudget } from '@/src/db'
import { ScrollView } from 'react-native-gesture-handler'
import useToast from '@/src/hooks/useToast'
import AddItem from './add-budget'
import useRecordsStore from '@/src/stores/RecordsStore';
import useColorStore from '@/src/stores/ColorsStore'
import { AccentRow } from '@/src/ui/data-display/AccentRow'

import useBudgetStore from '@/src/stores/BudgetStore'
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock'


const ItemsTable = () => {
    const [selected, setSelected] = React.useState<BudgetItemView | undefined>()
    const [openUpdate, setOpenUpdate] = React.useState<boolean>(false)
    const { ToastContainer, showToast } = useToast()
    const { t } = useLanguage()
    const { group, records } = useRecordsStore()
    const { colors } = useColorStore()
    const { budgets, resumes, setBudgets, setResumes } = useBudgetStore()
    const budget = useBudget()

    const handleDelete = async (index: number) => {
        if (!group?.id) return
        const toDelete = budgets[index]
        if (!toDelete?.id) return
        await budget.deleteBudget(toDelete.id)
        const i = (await budget.fetchBudget(group.id)) ?? []
        const resume = await budget.getAllResume(group.id)
        setBudgets(i)
        setResumes(resume)
        showToast({ message: t("item.deleted"), type: "SUCCESS" })
    }

    const handleUpdate = (index: number) => {
        const select = budgets[index]
        setSelected(select)
        setOpenUpdate(!openUpdate)
    }

    const color = (type: "income" | "expense" | "transfer"): TextStyle => ({
        borderColor:
            type === "expense"
                ? colors?.ExpenseColor
                : type === "income"
                    ? colors?.IncomeColor
                    : colors?.TransferColor
    })

    const effectToType = (effect: string | null | undefined): "income" | "expense" | "transfer" => {
        if (effect === "+") return "income"
        if (effect === "-") return "expense"
        return "transfer"
    }

    const typeColor = (color: "income" | "expense" | "transfer") => {
        switch (color) {
            case "income":
                return colors?.IncomeColor
            case "expense":
                return colors?.ExpenseColor
            case "transfer":
                return colors?.TransferColor
        }
    }

    const findInResume = (item: BudgetItemView) => {
        return records
            .filter(record =>
                record.category_id === item.category_id &&
                record.record_type_id === item.record_type_id
            )
            .reduce((total, record) => total + record.amount, 0)
    }

    const getPercentage = (item: BudgetItemView) => {
        if (!item.amount) return "0.00"
        return ((findInResume(item) / item.amount) * 100).toFixed(2)
    }

    const currentBalance = records.reduce((total, record) => {
        const effect = record.RecordTypes?.effect
        if (effect === "+") return total + record.amount
        if (effect === "-") return total - record.amount
        return total
    }, 0)

    const getName = (val: string) => {
        if (val.length > 20) {
            return val.substring(0, 17) + "..."
        } else {
            return val
        }
    }

    return (
        <>
            <View style={localStyles.rowContainer}>
                <View style={[localStyles.rowContainer, { gap: 20 }]}>
                    <View style={{ flex: 1 }}>
                        <SummaryBlock
                            label={t("budget.budget")}
                            cents={Math.abs(resumes?.balance || 0)}
                            valueColorOverride={colors?.text}
                            accentColor={resumes ? (resumes?.balance < 0 ? colors?.ExpenseColor : colors?.GoalColor) : colors?.primary}
                            size='lg'
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <SummaryBlock
                            label={t("budget.current")}
                            cents={Math.abs(currentBalance)}
                            valueColorOverride={colors?.text}
                            accentColor={currentBalance < 0 ? colors?.ExpenseColor : colors?.IncomeColor}
                            size='lg'
                        />
                    </View>
                </View>
                <View style={[{ position: "absolute", right: 0, top: -61 }]}>
                    {
                        group && (
                            <AddItem>
                                <View style={[styles.button]}>
                                    <AntDesign size={20} name='plus' color={"#000"} />
                                </View>
                            </AddItem >
                        )
                    }
                </View>
            </View>
            <View style={localStyles.rowContainer}>
                <SummaryBlock
                    style={{ flex: 1 }}
                    label={t("resume.incomes")}
                    cents={Math.abs(resumes?.incomesTotal || 0)}
                    valueColorOverride={colors?.text}
                    accentColor={colors?.IncomeColor}
                    size='sm'
                />
                <SummaryBlock
                    style={{ flex: 1 }}
                    label={t("resume.expenses")}
                    cents={Math.abs(resumes?.expensesTotal || 0)}
                    valueColorOverride={colors?.text}
                    accentColor={colors?.ExpenseColor}
                    size='sm'
                />
                <SummaryBlock
                    style={{ flex: 1 }}
                    label={t("resume.transfers")}
                    cents={Math.abs(resumes?.transferTotal || 0)}
                    valueColorOverride={colors?.text}
                    accentColor={colors?.TransferColor}
                    size='sm'
                />
            </View>
            <ScrollView style={{ flex: 1 }}>
                <View style={{ gap: 5, paddingHorizontal: 30, }}>
                    {budgets?.map((item, index) => {
                        return (
                            <SwipeAction
                                handleDelete={() => handleDelete(index)}
                                handleUpdate={() => handleUpdate(index)}
                                key={index}
                            >
                                <AccentRow
                                    accentColor={colors ? typeColor(effectToType(item.effect ?? item.RecordTypes?.effect)) : ""}
                                    bottomColor={colors ? (Number(getPercentage(item)) > 100 ? colors.ExpenseColor : colors.GoalColor) : ""}
                                >
                                    <View style={localStyles.rowContainer}>
                                        <Text style={localStyles.nameText}>{getName(item.category_name ?? "")}</Text>
                                        <View style={localStyles.colContainer}>
                                            <Text style={localStyles.typeText}>{t("budget.budget")}</Text>
                                            <Text style={localStyles.valueText}>{formatMoneyWithSymbol(item.amount)}</Text>
                                        </View>
                                        <View style={localStyles.colContainer}>
                                            <Text style={localStyles.typeText}>{t("budget.current")}</Text>
                                            <Text style={localStyles.valueText}>{formatMoneyWithSymbol(findInResume(item))}</Text>
                                        </View>
                                        <Text style={localStyles.percentageText}>{getPercentage(item)}%</Text>
                                    </View>
                                </AccentRow>
                            </SwipeAction>
                        )
                    })}
                </View>
                <ToastContainer />
                <AddItem
                    openUpdate={openUpdate}
                    open={openUpdate}
                    item={selected}
                />
            </ScrollView>
        </>
    )
}

const localStyles = StyleSheet.create({
    rowContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    dateContainer: {
        width: 40
    },
    dateText: {
        fontWeight: "100",
        fontSize: 8,
        textAlign: "center"
    },
    nameText: {
        fontSize: 12,
        textAlign: "left"
    },
    valueText: {
        fontSize: 12,
        textAlign: "center",
        fontWeight: "300",
    },
    balanceText: {
        width: "80%",
        borderTopWidth: 4,
        height: 60,
        paddingTop: 10,
        textAlign: "center",
        marginLeft: 5,
        fontWeight: "300",
        fontSize: 18
    },
    percentageText: {
        fontSize: 12,
        fontWeight: "200"
    },
    typeText: {
        fontSize: 8,
        fontWeight: "200"
    },
    colContainer: {
        flexDirection: "column"
    }
})

export default ItemsTable