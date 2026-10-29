import { View, Text, Pressable, TextStyle, StyleProp, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'

import { useLanguage } from '@/src/lang/LanguageContext'
import { SwipeAction } from '@/src/ui/actions/SwipeAction'
import useDate from '@/src/hooks/useDate'
import { ScrollView } from 'react-native-gesture-handler'
import { useToast } from '@/src/ui/feedback/ToastProvider'
import AddItem from './AddTemplateItem'
import useRecordsStore from '@/src/stores/RecordsStore';
import useColorStore from '@/src/stores/ColorsStore'
import { AccentRow } from '@/src/ui/data-display/AccentRow'
import IconButton from '../ui/icon-button'
import type { RecordFormEntry, RecordView } from '@/src/interfaces/schema'
import { formatMoney, formatMoneyWithSymbol } from '@/src/utils'
import { useRecords } from "@/src/db";import useResumesStore from '@/src/stores/ResumesStore'
import { useCreditStore } from '@/src/stores/CreditsStore'
import { useConfigs } from '@/src/hooks/useConfigs'
import { useDataStore } from '@/src/stores'
import styles from '@/src/styles/styles'

const TemplateTable = () => {
    const [selected, setSelected] = React.useState<RecordFormEntry | undefined>()
    const [openUpdate, setOpenUpdate] = React.useState<boolean>(false)
    const { fetchRecords, deleteRecordWithCredit } = useRecords()
    const dateh = useDate()
    const { showToast } = useToast()
    const { t } = useLanguage()
    const { records, group, setRecords } = useRecordsStore()
    const { colors } = useColorStore()
    const { balance } = useResumesStore()
    const { credits } = useCreditStore()
    const { RecordTypes, Fixeds } = useDataStore()
    const [creditRecords, setCreditRecords] = useState<RecordFormEntry[]>()
    const { configs: { paymentCreditType } } = useConfigs()
    const [fixedsToShow, setFixedsToShow] = useState<RecordFormEntry[]>([])

    const selectePaymentCreditType = RecordTypes.find(e => e.id == paymentCreditType)

    const handleDelete = async (index: number) => {
        if (!group?.id) return
        const toDelete = records[index]
        if (!toDelete?.id) return
        await deleteRecordWithCredit(toDelete.id, toDelete.paid_credit_id)
        const data = await fetchRecords(group.id)
        setRecords(data)
        showToast({ message: t("item.deleted"), type: "success" })
    }

    const handleUpdate = (index: number) => {
        const select = records[index]
        setSelected(select)
        setOpenUpdate(!openUpdate)
    }

    const color = (type: "income" | "expense" | "transfer"): TextStyle => ({
        borderColor:
            type === "expense"
                ? colors?.ExpenseColor
                : type === "income"
                    ? colors?.IncomeColor
                    : undefined
    })

    const generateCreditRecords = () => {
        const list: RecordFormEntry[] = []
        const today = new Date()
        credits?.map((credit) => {
            if (!credit.totalPrevious) return
            if ((credit?.totalCurrentPayments || 0) >= (credit?.totalPrevious || 0)) return

            const newJoined: RecordFormEntry = {
                record_type_id: paymentCreditType,
                amount: credit?.totalPrevious - (credit?.totalCurrentPayments || 0),
                category_id: 0,
                date: today.getTime(),
                group_id: group?.id || 0,
                record_name: credit.method_name,
                payment_method_id: 0,
                paid_method_id: credit.id
            }
            list.push(newJoined)
        })
        setCreditRecords(list)

    }

    useEffect(generateCreditRecords, [credits])

    const generateFixedsToShow = () => {
        const list: RecordFormEntry[] = []
        Fixeds.map((fixed) => {
            const alreadyAdded = records.find(records => records.fixed_id == fixed.id)
            if (!alreadyAdded) {
                const date = new Date()
                date.setDate(fixed.fixed_day)
                list.push({
                    fixed_id: fixed.id,
                    amount: fixed.fixed_amount,
                    date: date.getTime(),
                    group_id: group?.id ?? null,
                    record_name: fixed.fixed_name,
                    record_type_id: fixed.record_type_id,
                    category_id: fixed.category_id,
                    payment_method_id: fixed.payment_method_id,
                })
            }
        })
        setFixedsToShow(list)
    }

    useEffect(generateFixedsToShow, [records, Fixeds])

    const onCreditPayment = (item: RecordFormEntry) => {
        setSelected(item)
        setOpenUpdate(!openUpdate)
    }

    return (
        <>
            <View
                style={localStyles.rowContainer}
            >
                <Text style={[localStyles.balanceText, color(balance < 0 ? "expense" : "income")]}>
                    $ {formatMoney(balance)}
                </Text>
                <View style={[{ position: "absolute", right: 0, top: 0 }]}>
                    {
                        group && (
                            <AddItem>
                                <IconButton isButton={false}>
                                    <AntDesign size={20} name='plus' color={"#000"} />
                                </IconButton>
                            </AddItem >
                        )
                    }
                </View>
            </View>

            <ScrollView style={{ flex: 1 }}>
                <View style={{ gap: 5, paddingHorizontal: 30, }}>
                    {records?.map((item, index) => {
                        return (
                            <SwipeAction
                                handleDelete={() => handleDelete(index)}
                                handleUpdate={() => handleUpdate(index)}
                                key={item.id}
                            >
                                <AccentRow
                                    bottomColor={item.RecordTypes?.record_color ?? undefined}
                                    accentColor={item.PaymentMethods?.PaymentTypes?.payment_color ?? undefined}
                                >
                                    <View style={localStyles.rowContainer}>
                                        <View style={localStyles.dateContainer}>
                                            <Text style={localStyles.dateText}>
                                                {dateh.getStringDay(String(item.date))}
                                            </Text>
                                            <Text style={localStyles.dateText}>
                                                {dateh.getDay(String(item.date))}
                                            </Text>
                                            <Text style={localStyles.dateText}>
                                                {dateh.getStringMonth(String(item.date))}
                                            </Text>
                                        </View>
                                        <Text style={localStyles.nameText}>{item.record_name}</Text>
                                        <Text style={localStyles.valueText}>{formatMoneyWithSymbol(item.amount)}</Text>
                                    </View>
                                </AccentRow>
                            </SwipeAction>
                        )
                    })}
                </View>
                {
                    creditRecords?.length && creditRecords?.length > 0 ? (
                        <Text style={[styles.smallText, { textAlign: "center", marginTop: 10 }]}>{t("records.creditPayments")}</Text>
                    ) : null
                }
                <View style={{ gap: 5, paddingHorizontal: 30, }}>
                    {creditRecords?.map((item, index) => {
                        return (
                            <Pressable key={index} onPress={() => onCreditPayment(item)}>
                                <AccentRow
                                    bottomColor={selectePaymentCreditType?.record_color || "#000"}
                                    accentColor={selectePaymentCreditType?.record_color || "#000"}
                                >
                                    <View style={localStyles.rowContainer}>
                                        <View style={localStyles.dateContainer}>
                                            <Text style={localStyles.dateText}>
                                                {dateh.getStringDay(String(item.date))}
                                            </Text>
                                            <Text style={localStyles.dateText}>
                                                {dateh.getDay(String(item.date))}
                                            </Text>
                                            <Text style={localStyles.dateText}>
                                                {dateh.getStringMonth(String(item.date))}
                                            </Text>
                                        </View>
                                        <Text style={localStyles.nameText}>{item.record_name}</Text>
                                        <Text style={localStyles.valueText}>{formatMoneyWithSymbol(item.amount)}</Text>
                                    </View>
                                </AccentRow>
                            </Pressable>
                        )
                    })}
                </View>
                {
                    fixedsToShow?.length && fixedsToShow?.length > 0 ? (
                        <Text style={[styles.smallText, { textAlign: "center", marginTop: 10 }]}>{t("records.fixeds")}</Text>
                    ) : null
                }
                <View style={{ gap: 5, paddingHorizontal: 30, }}>
                    {fixedsToShow?.map((item, index) => {
                        return (
                            <Pressable key={index} onPress={() => onCreditPayment(item)}>
                                <AccentRow
                                    bottomColor={selectePaymentCreditType?.record_color ?? "#000"}
                                    accentColor={selectePaymentCreditType?.record_color ?? "#000"}
                                >
                                    <View style={localStyles.rowContainer}>
                                        <View style={localStyles.dateContainer}>
                                            <Text style={localStyles.dateText}>
                                                {dateh.getStringDay(String(item.date))}
                                            </Text>
                                            <Text style={localStyles.dateText}>
                                                {dateh.getDay(String(item.date))}
                                            </Text>
                                            <Text style={localStyles.dateText}>
                                                {dateh.getStringMonth(String(item.date))}
                                            </Text>
                                        </View>
                                        <Text style={localStyles.nameText}>{item.record_name}</Text>
                                        <Text style={localStyles.valueText}>{formatMoneyWithSymbol(item.amount)}</Text>
                                    </View>
                                </AccentRow>
                            </Pressable>
                        )
                    })}
                </View>
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
        width: 50
    },
    dateText: {
        fontWeight: "100",
        fontSize: 8,
        textAlign: "center"
    },
    nameText: {
        fontSize: 12,
        textAlign: "left",
        maxWidth: 200
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
    }
})

export default TemplateTable