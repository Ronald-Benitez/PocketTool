import { View, Text, Pressable, TextStyle, StyleProp, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'

import { useLanguage } from '@/src/lang/LanguageContext'
import SwipeItem from '../ui/swipe-item'
import { ScrollView } from 'react-native-gesture-handler'
import useToast from '@/src/hooks/useToast'
import AddItem from './AddFixed'
import useColorStore from '@/src/stores/ColorsStore'
import BorderLeftBottomBlock from '../ui/BorderLeftButtonBlock'
import IconButton from '../ui/icon-button'
import { Fixed, FixedJoined, RecordJoined, Records } from '@/src/db/types/tables'
import { useDataStore } from '@/src/stores'
import { useFixeds } from '@/src/db/handlers/FixedsHandler'
import FinanceSimpleBlock from '../ui/FinanceSimpleBlock'
import { Resumes } from '@/src/stores/ResumesStore'

const FixedsTable = () => {
    const [selected, setSelected] = React.useState<FixedJoined | Fixed | undefined>()
    const [openUpdate, setOpenUpdate] = React.useState<boolean>(false)
    const { ToastContainer, showToast } = useToast()
    const { t } = useLanguage()
    const { colors } = useColorStore()
    const { RecordTypes, Fixeds, setFixeds } = useDataStore()
    const { fetchFixeds, handler: fixedsHandler } = useFixeds()
    const [resume, setResume] = useState<Resumes["balanceByPaymentType"]>()


    const handleDelete = async (index: number) => {
        const toDelete = Fixeds[index]
        await fixedsHandler.deleteById(toDelete.record_id)
        const data = await fetchFixeds()
        setFixeds(data)
        showToast({ message: t("item.deleted"), type: "SUCCESS" })
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
                                        <Text style={localStyles.valueText}>${item.fixed_amount}</Text>
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