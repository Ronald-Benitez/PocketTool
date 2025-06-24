import { View, Text, Pressable, TextStyle, StyleProp, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { AntDesign } from '@expo/vector-icons'

import { useLanguage } from '@/src/lang/LanguageContext'
import SwipeItem from '../ui/swipe-item'
import useDate from '@/src/hooks/useDate'
import { ScrollView } from 'react-native-gesture-handler'
import useToast from '@/src/hooks/useToast'
import AddItem from './add-record'
import useRecordsStore from '@/src/stores/RecordsStore';
import useColorStore from '@/src/stores/ColorsStore'
import BorderLeftBottomBlock from '../ui/BorderLeftButtonBlock'
import IconButton from '../ui/icon-button'
import { RecordJoined } from '@/src/db/types/tables'
import { useRecords } from "@/src/db/handlers/RecordsHandler";
import useResumesStore from '@/src/stores/ResumesStore'


const ItemsTable = () => {
    const [selected, setSelected] = React.useState<RecordJoined | undefined>()
    const [openUpdate, setOpenUpdate] = React.useState<boolean>(false)
    const { fetchRecords, handler: recordsHandler } = useRecords()
    const dateh = useDate()
    const { ToastContainer, showToast } = useToast()
    const { t } = useLanguage()
    const { records, group, setRecords } = useRecordsStore()
    const { colors } = useColorStore()
    const { balance } = useResumesStore()

    const handleDelete = async (index: number) => {
        if (!group) return
        const toDelete = records[index]
        await recordsHandler.deleteById(toDelete.record_id)
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
        } else {
            c.borderColor = colors?.TransferColor
        }
        return c
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