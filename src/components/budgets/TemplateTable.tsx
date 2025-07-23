import { View, Text, Pressable, TextStyle, StyleProp, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'

import { useLanguage } from '@/src/lang/LanguageContext'
import SwipeItem from '../ui/swipe-item'
import useDate from '@/src/hooks/useDate'
import { ScrollView } from 'react-native-gesture-handler'
import useToast from '@/src/hooks/useToast'
import AddItem from './AddTemplateItem'
import useRecordsStore from '@/src/stores/RecordsStore';
import useColorStore from '@/src/stores/ColorsStore'
import BorderLeftBottomBlock from '../ui/BorderLeftButtonBlock'
import IconButton from '../ui/icon-button'
import { FixedJoined, RecordJoined, Records } from '@/src/db/types/tables'
import { useRecords } from "@/src/db/handlers/RecordsHandler";
import useResumesStore from '@/src/stores/ResumesStore'
import { useCreditStore } from '@/src/stores/CreditsStore'
import useConfigs from '@/src/hooks/useConfigs'
import { useDataStore } from '@/src/stores'
import styles from '@/src/styles/styles'
import { useHandler } from '@/src/db/handlers/handler'

const TemplateTable = () => {
    const [selected, setSelected] = React.useState<RecordJoined | Records | undefined>()
    const [openUpdate, setOpenUpdate] = React.useState<boolean>(false)
    const { fetchRecords, handler: recordsHandler } = useRecords()
    const dateh = useDate()
    const { ToastContainer, showToast } = useToast()
    const { t } = useLanguage()
    const { records, group, setRecords } = useRecordsStore()
    const { colors } = useColorStore()
    const { balance } = useResumesStore()
    const { credits } = useCreditStore()
    const { RecordTypes, Fixeds } = useDataStore()
    const [creditRecords, setCreditRecords] = useState<Records[]>()
    const { configs: { paymentCreditType } } = useConfigs()
    const [fixedsToShow, setFixedsToShow] = useState<RecordJoined[]>([])
    const creditsHandler = useHandler('PaidCredits')

    const selectePaymentCreditType = RecordTypes.find(e => e.id == paymentCreditType)

    const handleDelete = async (index: number) => {
        if (!group) return
        const toDelete = records[index]
        await recordsHandler.deleteById(toDelete.record_id)
        if (toDelete.paid_credit_id) [
            await creditsHandler.deleteById(toDelete.paid_credit_id)
        ]
        const data = await fetchRecords(group.id)
        setRecords(data)
        showToast({ message: t("item.deleted"), type: "SUCCESS" })
    }

    const handleUpdate = (index: number) => {
        const select = records[index]
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
        }
        return c
    }

    const generateCreditRecords = () => {
        const list: Records[] = []
        const today = new Date()
        credits?.map((credit) => {
            if (!credit.totalPrevious) return
            if (credit?.totalCurrentPayments || 0 >= credit.totalPrevious) return

            const newJoined: Records = {
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
        const list: RecordJoined[] = []
        Fixeds.map((fixed) => {
            const alreadyAdded = records.find(records => records.fixed_id == fixed.id)
            if (!alreadyAdded) {
                const date = new Date()
                date.setDate(fixed.fixed_day)
                list.push({
                    ...fixed,
                    fixed_id: fixed.id,
                    amount: fixed.fixed_amount,
                    date: date.getTime(),
                    goal: 0,
                    group_id: group?.id || 0,
                    group_name: "",
                    month: date.getMonth(),
                    record_name: fixed.fixed_name,
                    year: date.getFullYear(),
                    id: undefined
                })
            }
        })
        setFixedsToShow(list)
    }

    useEffect(generateFixedsToShow, [records, Fixeds])

    const onCreditPayment = (item: Records) => {
        setSelected(item)
        setOpenUpdate(!openUpdate)
    }

    return (
        <>
            <View
                style={localStyles.rowContainer}
            >
                <Text style={[localStyles.balanceText, color(balance < 0 ? "expense" : "income")]}>
                    $ {(balance).toFixed(2)}
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
                            <SwipeItem
                                handleDelete={() => handleDelete(index)}
                                handleUpdate={() => handleUpdate(index)}
                                key={item.id}
                            >
                                <BorderLeftBottomBlock
                                    bottomColor={item.record_color}
                                    letfColor={item.payment_color}
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
                                        <Text style={localStyles.valueText}>${item.amount}</Text>
                                    </View>
                                </BorderLeftBottomBlock>
                            </SwipeItem>
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
                                <BorderLeftBottomBlock
                                    bottomColor={selectePaymentCreditType?.record_color || "#000"}
                                    letfColor={selectePaymentCreditType?.record_color || "#000"}
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
                                        <Text style={localStyles.valueText}>${item.amount}</Text>
                                    </View>
                                </BorderLeftBottomBlock>
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
                                <BorderLeftBottomBlock
                                    bottomColor={item?.record_color || "#000"}
                                    letfColor={item?.payment_color || "#000"}
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
                                        <Text style={localStyles.valueText}>${item.amount}</Text>
                                    </View>
                                </BorderLeftBottomBlock>
                            </Pressable>
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