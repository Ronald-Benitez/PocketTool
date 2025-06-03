import { View, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage';

import Table from '@/src/components/budgets/budgets-table'
import { useRecords } from '@/src/db'
import { RecordI } from '@/src/interfaces'
import GroupSelector from '@/src/components/groups/group-selector'
import styles from '@/src/styles/styles'
import useRecordsStore from '@/src/stores/RecordsStore';

const Index = () => {
    const { fetchRecords } = useRecords()
    const setRecordsState = useRecordsStore((state) => state.setRecords)
    const { group } = useRecordsStore()

    useEffect(() => {
        if (!group) return
        fetchRecords(group.id).then(e => {
            setRecordsState(e as RecordI[])
        })
    }, [group?.id])

    return (
        <View style={styles.container}>
            <View style={[styles.row, { justifyContent: "space-around", alignItems: "flex-end" }]}>
                <View style={{ paddingBottom: 5 }}>
                    <GroupSelector />
                </View>
            </View>
            <Table />

        </View >
    )
}

export default Index