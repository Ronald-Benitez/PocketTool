import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'

import { useLanguage } from '@/src/lang/LanguageContext'
import { useGroups } from '@/src/db'
import { Group, RecordI } from '@/src/interfaces'
import styles from '@/src/styles/styles'
import useRecordsStore from '@/src/stores/RecordsStore'
import { useRecords } from '@/src/db'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BaseSelect from '../ui/base-select'

const GroupSelector = () => {
    const { t } = useLanguage()
    const [groups, setGroups] = useState<Group[]>([])
    const [year, setYear] = useState<string>(new Date().getFullYear().toString())
    const [modalVisible, setModalVisible] = useState(false)
    const { group, setGroup, setRecords, setResumes } = useRecordsStore()
    const { fetchGroupsByYear, fetchGroupsById, fetchLastGroup } = useGroups()
    const { fetchRecords, getAllResume } = useRecords()

    useEffect(() => {
        getPinned()
    }, [])

    const getGroups = async () => {
        const groups = await fetchGroupsByYear(year)
        setGroups(groups)
    }

    const onBtnPress = () => {
        getGroups()
        setModalVisible(true)
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

    const getPlaceHolder = (group: Group) => {
        return group.group_name.substring(0, 20) + (group.group_name.length > 20 ? "..." : "") + " (" + t("months." + Number(group.month)) + " " + group.year + ")"
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
        return gs?.map(val => getGroupText(val))
    }

    const getGroupText = (g: Group | null) => {
        if(!g) return ""
        return `${g?.group_name} (${g?.month} ${g?.year})`
    }


    return (
        <>
            <BaseSelect
                onChange={handleSelect}
                options={setOptions(groups)}
                selected={getGroupText(group)}
                title={t("group.select-group")}
            />
        </>
    )
}

export default GroupSelector