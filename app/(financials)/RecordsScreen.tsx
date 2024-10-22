import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage';

import AddGroup from '@/src/components/groups/add-group'
import Table from '@/src/components/records/records-table'
import { useLanguage } from '@/src/lang/LanguageContext'
import { useGroups, useRecords } from '@/src/db'
import { Group, RecordI } from '@/src/interfaces'
import GroupSelector from '@/src/components/groups/group-selector'
import AddItem from '@/src/components/records/add-record'
import GroupViewer from '@/src/components/groups/group-viewer';
import styles from '@/src/styles/styles'
import useRecordsStore from '@/src/stores/RecordsStore';

const Index = () => {
    const [pinned, setPinned] = useState<number>(0)
    const { fetchRecords } = useRecords()
    const setRecordsState = useRecordsStore((state) => state.setRecords)
    const { group } = useRecordsStore()

    useEffect(() => {
        getPinned()
    }, [])

    useEffect(() => {
        if (!group) return
        fetchRecords(group.id).then(e => {
            setRecordsState(e as RecordI[])
        })
    }, [group?.id])

    const pinUp = async () => {
        if (!group) return
        if (pinned != 0 && pinned === group?.id) {
            await AsyncStorage.removeItem("group")
            setPinned(0)
        } else {
            await AsyncStorage.setItem("group", String(group.id))
            setPinned(group.id)
        }
    }

    const getPinned = async () => {
        const pinned = await AsyncStorage.getItem('group');
        const p = Number(pinned)
        setPinned(p)
    }

    const Pin = () => {
        let isPinned = false

        if (pinned != 0 && pinned === group?.id) {
            isPinned = true
        }

        return (
            <TouchableOpacity style={styles.button} onPress={pinUp}>
                <Ionicons name={isPinned ? "pin" : "pin-outline"} size={24} color="#000" />
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <View style={[styles.row, { justifyContent: "space-around", alignItems: "flex-end" }]}>
                <View style={{ width: "70%" }}>
                    <GroupSelector />
                </View>
                <AddGroup>
                    <View style={styles.button}>
                        <AntDesign name="addfolder" size={20} color={"black"} />
                    </View>
                </AddGroup>
                <Pin />
            </View>
            <Table />

        </View >
    )
}

export default Index