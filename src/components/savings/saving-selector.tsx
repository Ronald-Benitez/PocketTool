import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Pressable, StyleSheet } from 'react-native'
import React, { useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { useLanguage } from '@/src/lang/LanguageContext'
import { useSavings, useSavingsHistory } from '@/src/db'
import useSavingsStore from '@/src/stores/SavingsStore'
import { SavingsHistory, Savings } from '@/src/db/types/tables';
import BaseSelect from '../ui/base-select'
import { useHandler } from '@/src/db/handlers/handler'

interface Props {
    children: ReactNode
}

const SavingsSelector = ({ children }: Props) => {
    const { t } = useLanguage()
    const [year, setYear] = useState<string>(new Date().getFullYear().toString())
    const [modalVisible, setModalVisible] = useState(false)
    const { saving, savingsHistory, setSaving, setSavingsHistory, savings, setSavings } = useSavingsStore()
    const { fetchSavings, fetchSavingsById } = useSavings()
    const { fetchSavingsHistoryBySavingId } = useSavingsHistory()
    const [openUpdate, setOpenUpdate] = useState(false)
    const savingsHandler = useHandler("Savings")
    const historyHandler = useHandler("SavingsHistory")

    useEffect(() => {
        getPinned()
    }, [])

    const getSavings = async () => {
        const savings = await fetchSavings()
        setSavings(savings)
    }

    useEffect(() => {
        getSavings()
    }, [year])

    const onSelect = async (saving: Savings) => {
        setSaving(saving)
        await historyHandler.fetchWithWhere("savings_id", String(saving.id)).then((res) => {
            setSavingsHistory(res.reverse() as SavingsHistory[])
        })
        setModalVisible(false)
    }

    const handleSelect = (index: number) => {
        if (!savings) return
        const s = savings[index]
        if (!s) return
        onSelect(s)
    }

    const getPinned = async () => {
        const pinned = await AsyncStorage.getItem('savings');
        if (pinned) {
            const p = Number(pinned)
            fetchSavingsById(p).then(g => {
                onSelect(g as Savings)
            })
        }
    }

    const handleUpdate = () => {
        setOpenUpdate(!openUpdate)
    }


    return (
        <>
            <View style={localStyles.block}>
                <View style={localStyles.bg}>
                    <BaseSelect
                        onChange={handleSelect}
                        options={savings?.map(e => e.saving_name)}
                        selected={saving?.saving_name}
                        title={t("savings.select")}
                        blockWith={50}
                    >
                        {children}
                    </BaseSelect>
                </View>
            </View>
        </>
    )
}

const localStyles = StyleSheet.create({
    bg: {
    },
    block: {
        height: 50,
        justifyContent: "center",
        alignItems: "center"
    }
})

export default SavingsSelector