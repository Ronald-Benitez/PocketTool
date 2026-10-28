import { View, Text, Pressable, TextStyle, StyleProp, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'

import { useLanguage } from '@/src/lang/LanguageContext'
import type { BudgetItemView } from '@/src/interfaces/schema'
import { formatMoney, formatMoneyWithSymbol } from '@/src/utils'
import styles from '@/src/styles/styles'
import SwipeItem from '../ui/swipe-item'
import useDate from '@/src/hooks/useDate'
import { useRecords } from '@/src/db'
import { ScrollView } from 'react-native-gesture-handler'
import useToast from '@/src/hooks/useToast'
import AddItem from './add-budget'
import useRecordsStore from '@/src/stores/RecordsStore';
import useColorStore from '@/src/stores/ColorsStore'
import BorderLeftBottomBlock from '../ui/BorderLeftButtonBlock'
import { useBudget } from '@/src/db'
import useBudgetStore from '@/src/stores/BudgetStore'
import FinanceSimpleBlock from '../ui/FinanceSimpleBlock'
import FinanceSmallBlock from '../ui/FinanceSmallBlock'
import BalanceBlock from '../ui/BalanceBlock'


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

    const color = (type: "income" | "expense" | "transfer"): StyleProp<TextStyle> => {
        const c: StyleProp<TextStyle> = {
        }
        if (type === "expense") {
            c.borderColor = colors?.ExpenseColor
        } else if (type === "income") {
            c.borderColor = colors?.IncomeColor
        } else {
            c.borderColor = colors?.TransferColor
        }
        return c
    }

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
                        <BalanceBlock
                            bottom={true}
                            text={t("budget.budget")}
                            value={formatMoney(Math.abs(resumes?.balance || 0))}
                            color={resumes ? (resumes?.balance < 0 ? colors?.ExpenseColor : colors?.GoalColor) : ""}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <BalanceBlock
                            bottom={true}
                            text={t("budget.current")}
                            value={formatMoney(Math.abs(currentBalance))}
                            color={currentBalance < 0 ? colors?.ExpenseColor : colors?.IncomeColor}
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
                <FinanceSmallBlock
                    text={t("resume.incomes")}
                    value={formatMoney(Math.abs(resumes?.incomesTotal || 0))}
                    color={colors?.IncomeColor}
                />
                <FinanceSmallBlock
                    text={t("resume.expenses")}
                    value={formatMoney(Math.abs(resumes?.expensesTotal || 0))}
                    color={colors?.ExpenseColor}
                />
                <FinanceSmallBlock
                    text={t("resume.transfers")}
                    value={formatMoney(Math.abs(resumes?.transferTotal || 0))}
                    color={colors?.TransferColor}
                />
            </View>
            <ScrollView style={{ flex: 1 }}>
                <View style={{ gap: 5, paddingHorizontal: 30, }}>
                    {budgets?.map((item, index) => {
                        return (
                            <SwipeItem
                                handleDelete={() => handleDelete(index)}
                                handleUpdate={() => handleUpdate(index)}
                                key={index}
                            >
                                <BorderLeftBottomBlock
                                    letfColor={colors ? typeColor(effectToType(item.effect ?? item.RecordTypes?.effect)) : ""}
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
                                </BorderLeftBottomBlock>
                            </SwipeItem>
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