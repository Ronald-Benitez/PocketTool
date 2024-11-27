import { View, Text, Pressable, TextStyle, StyleProp, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { AntDesign } from '@expo/vector-icons'

import { useLanguage } from '@/src/lang/LanguageContext'
import { RecordI } from '@/src/interfaces'
import styles from '@/src/styles/styles'
import SwipeItem from '../ui/swipe-item'
import useDate from '@/src/hooks/useDate'
import { useRecords } from '@/src/db'
import { ScrollView } from 'react-native-gesture-handler'
import useToast from '@/src/hooks/useToast'
import AddItem from './add-record'
import useRecordsStore from '@/src/stores/RecordsStore';
import useColorStore from '@/src/stores/ColorsStore'
import BorderLeftBottomBlock from '../ui/BorderLeftButtonBlock'

const ItemsTable = () => {
    const [selected, setSelected] = React.useState<RecordI | undefined>()
    const [openUpdate, setOpenUpdate] = React.useState<boolean>(false)
    const idb = useRecords()
    const dateh = useDate()
    const { ToastContainer, showToast } = useToast()
    const { t } = useLanguage()
    const { balance, records, group, setRecords } = useRecordsStore()
    const { colors } = useColorStore()

    const handleDelete = async (index: number) => {
        if (!group) return
        const toDelete = records[index]
        await idb.deleteRecord(toDelete.record_id)
        const i = await idb.fetchRecords(group.id) as RecordI[]
        setRecords(i as RecordI[])
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
        } else {
            c.borderColor = colors?.TransferColor
        }
        return c
    }

    const typeColor = (color: string) => {
        switch (color) {
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
            <View
                style={localStyles.rowContainer}
            >
                <Text style={[localStyles.balanceText, color(balance < 0 ? "expense" : "income")]}>
                    $ {Math.abs(balance).toFixed(2)}
                </Text>
                <View style={[{ position: "absolute", right: 0, top: 0 }]}>
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

            <ScrollView style={{ flex: 1 }}>
                <View style={{ gap: 5, paddingHorizontal: 30, }}>
                    {records?.map((item, index) => {
                        return (
                            <SwipeItem
                                handleDelete={() => handleDelete(index)}
                                handleUpdate={() => handleUpdate(index)}
                                key={index}
                            >
                                <BorderLeftBottomBlock
                                    bottomColor={colors ? typeColor(item.record_type) : ""}
                                    letfColor={colors ? colors[item.payment_type == "credit" ? "Credit" : "Debit"] : ""}
                                >
                                    <View style={localStyles.rowContainer}>
                                        <View style={localStyles.dateContainer}>
                                            <Text style={localStyles.dateText}>
                                                {dateh.getStringDay(item.date)}
                                            </Text>
                                            <Text style={localStyles.dateText}>
                                                {dateh.getDay(item.date)}
                                            </Text>
                                            <Text style={localStyles.dateText}>
                                                {dateh.getStringMonth(item.date)}
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
    }
})

export default ItemsTable