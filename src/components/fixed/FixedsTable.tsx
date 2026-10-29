import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'

import { useLanguage } from '@/src/lang/LanguageContext'
import { SwipeAction } from '@/src/ui/actions/SwipeAction'
import { ScrollView } from 'react-native-gesture-handler'
import { useToast } from '@/src/ui/feedback/ToastProvider'
import AddItem from './AddFixed'
import { AccentRow } from '@/src/ui/data-display/AccentRow'
import IconButton from '../ui/icon-button'
import type { FixedRecord, FixedView } from '@/src/interfaces/schema'
import { formatMoneyWithSymbol } from '@/src/utils'
import { useDataStore } from '@/src/stores'
import { useFixeds } from '@/src/db'

const FixedsTable = () => {
    const [selected, setSelected] = useState<FixedView | FixedRecord | undefined>()
    const [openUpdate, setOpenUpdate] = useState<boolean>(false)
    const { showToast } = useToast()
    const { t } = useLanguage()
    const { Fixeds, setFixeds } = useDataStore()
    const { fetchFixeds, handler: fixedsHandler } = useFixeds()


    const handleDelete = async (index: number) => {
        const toDelete = Fixeds[index]
        if (!toDelete.id) return
        await fixedsHandler.deleteById(toDelete.id)
        const data = await fetchFixeds()
        setFixeds(data)
        showToast({ message: t("item.deleted"), type: "success" })
    }

    const handleUpdate = (index: number) => {
        const select = Fixeds[index]
        setSelected(select)
        setOpenUpdate(!openUpdate)
    }

    return (
        <>
            <View
                style={[localStyles.rowContainer, { justifyContent: "center" }]}
            >
                <AddItem>
                    <IconButton isButton={false}>
                        <AntDesign size={20} name='plus' color={"#000"} />
                    </IconButton>
                </AddItem >
            </View>

            <ScrollView style={{ flex: 1 }}>
                <View style={{ gap: 5, paddingHorizontal: 30, }}>
                    {Fixeds?.map((item, index) => {
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
                                        <Text style={[localStyles.dayText, item.fixed_day > 9 ? {
                                            padding: 8,
                                            paddingHorizontal: 9
                                        } : {
                                            padding: 8,
                                            paddingHorizontal: 13
                                        }]}>
                                            {String(item.fixed_day)}
                                        </Text>
                                        <Text style={localStyles.nameText}>{item.fixed_name}</Text>
                                        <Text style={localStyles.valueText}>{formatMoneyWithSymbol(item.fixed_amount)}</Text>
                                    </View>
                                </AccentRow>
                            </SwipeAction>
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
        alignItems: "center",
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
    },
    dayText: {
        borderColor: "#acacac",
        borderWidth: 1,
        borderRadius: 100,
    }
})

export default FixedsTable