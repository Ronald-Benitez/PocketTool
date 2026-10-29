import { View, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage';

import AddGroup from '@/src/components/groups/add-group'
import Table from '@/src/components/records/records-table'
import GroupSelector from '@/src/components/groups/group-selector'

import { useThemedStyles } from '@/src/styles/useThemedStyles'
import { useTheme } from '@/src/ui/theme/ThemeProvider'
import useRecordsStore from '@/src/stores/RecordsStore';

const Index = () => {
    const styles = useThemedStyles()
    const { colors } = useTheme()
    const [pinned, setPinned] = useState<number>(0)
    const setRecordsState = useRecordsStore((state) => state.setRecords)
    const { group, setRecords } = useRecordsStore()

    useEffect(() => {
        getPinned()
    }, [])

    const pinUp = async () => {
        if (!group?.id) return
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
                <Ionicons name={isPinned ? "pin" : "pin-outline"} size={24} color={colors.text} />
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <View style={[styles.row, { justifyContent: "space-around", alignItems: "flex-end" }]}>
                <View style={{ paddingBottom: 5 }}>
                    <GroupSelector />
                </View>
                <AddGroup>
                    <View style={styles.button}>
                        <AntDesign name="folder-add" size={20} color={colors.text} />
                    </View>
                </AddGroup>
                <Pin />
            </View>
            <Table />

        </View >
    )
}

export default Index