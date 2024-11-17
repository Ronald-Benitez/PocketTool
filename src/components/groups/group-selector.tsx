import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Pressable, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'

import { useLanguage } from '@/src/lang/LanguageContext'
import { useGroups } from '@/src/db'
import { Group, RecordI } from '@/src/interfaces'
import styles from '@/src/styles/styles'
import useRecordsStore from '@/src/stores/RecordsStore'
import { useRecords } from '@/src/db'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BaseSelect from '../ui/base-select'
import SwipeItem from '../ui/swipe-item'
import AddGroup from './add-group'

const GroupSelector = () => {
    const { t } = useLanguage()
    const [year, setYear] = useState<string>(new Date().getFullYear().toString())
    const [modalVisible, setModalVisible] = useState(false)
    const { group, setGroup, setRecords, setResumes, groups, setGroups } = useRecordsStore()
    const { fetchGroupsByYear, fetchGroupsById, fetchLastGroup, deleteGroup } = useGroups()
    const { fetchRecords, getAllResume, deleteRecordByGroup } = useRecords()
    const [openUpdate, setOpenUpdate] = useState(false)

    useEffect(() => {
        getPinned()
    }, [])

    const getGroups = async () => {
        const groups = await fetchGroupsByYear(year)
        setGroups(groups)
    }

    useEffect(() => {
        if (year.length !== 4) return
        getGroups()
    }, [year])

    const onSelect = async (group: Group) => {
        setGroup(group)
        await fetchRecords(group.id).then((res) => {
            setRecords(res as RecordI[])
        })
        await getAllResume(group.id).then(res => {
            setResumes(res)
        })
        setModalVisible(false)
    }

    const handleSelect = (index: number) => {
        const g = groups[index]
        if (!g) return
        onSelect(g)
    }

    const getPlaceHolder = (group: Group | null) => {
        if (!group) return ""
        return group.group_name?.substring(0, 20) + (group.group_name?.length > 20 ? "..." : "") + " (" + t("months." + Number(group.month)) + " " + group.year + ")"
    }

    const getPinned = async () => {
        const pinned = await AsyncStorage.getItem('group');
        if (pinned) {
            const p = Number(pinned)
            fetchGroupsById(p).then(g => {
                onSelect(g as Group)
            })
        } else {
            fetchLastGroup().then(g => {
                onSelect(g as Group)
            })
        }
    }

    const setOptions = (gs: Group[]) => {
        return gs?.map(val => getPlaceHolder(val))
    }

    const handleDelete = async () => {
        if(!group) return
        await deleteRecordByGroup(group.id)
        await deleteGroup(group.id)
        const pinned = await AsyncStorage.getItem('group');
        if (pinned == String(group.id)) {
            await AsyncStorage.removeItem('group')
        }
        fetchLastGroup().then(g => {
            onSelect(g as Group)
        })
        getGroups()
    }

    const handleUpdate = () => {
        setOpenUpdate(!openUpdate)
    }


    return (
        <>
            <SwipeItem
                handleDelete={handleDelete}
                handleUpdate={handleUpdate}
            >
                <View style={localStyles.block}>
                    <View style={localStyles.bg}>
                        <BaseSelect
                            onChange={handleSelect}
                            options={setOptions(groups)}
                            selected={getPlaceHolder(group)}
                            title={t("group.select-group")}
                            blockWith={250}
                        />
                    </View>
                </View>
            </SwipeItem>
            <AddGroup
                openUpdate={openUpdate}
                isEditing={true}
            >
            </AddGroup>
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

export default GroupSelector