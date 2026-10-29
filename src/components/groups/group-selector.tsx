import { View, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'

import { useLanguage } from '@/src/lang/LanguageContext'
import useRecordsStore from '@/src/stores/RecordsStore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BaseSelect from '../ui/base-select'
import SwipeItem from '../ui/swipe-item'
import AddGroup from './add-group'
import Input from '../ui/Input'
import { useDataStore } from '@/src/stores'
import { Group } from '@/src/interfaces/schema'
import {
    useCategories,
    useFixeds,
    useGroups,
    usePaidCredits,
    usePaymentMethods,
    useRecords,
    useTableRepository,
} from '@/src/db'
import { useConfigs } from '@/src/hooks/useConfigs'

const GroupSelector = () => {
    const { t } = useLanguage()
    const [year, setYear] = useState<string>(new Date().getFullYear().toString())
    const [modalVisible, setModalVisible] = useState(false)
    const { group, setGroup, setRecords, groups, setGroups, setPaidCredits } = useRecordsStore()
    const [openUpdate, setOpenUpdate] = useState(false)
    const { setCategories, setPaymentMethods, setRecordTypes, setPaymentTypes, setFixeds } = useDataStore()
    
    const groupsOrm = useGroups()
    const { fetchCategories } = useCategories()
    const recordTypesRepository = useTableRepository('RecordTypes')
    const paymentTypesRepository = useTableRepository('PaymentTypes')
    const { fetchByGroup: fetchPaidCreditsByGroup } = usePaidCredits()
    const { fetchFixeds } = useFixeds()
    const { fetchPaymentMethods } = usePaymentMethods()
    const { fetchRecords } = useRecords()
    const { loadConfigs } = useConfigs()

    useEffect(() => {
        getPinned()
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const categories = await fetchCategories()
            const payments = await fetchPaymentMethods()
            const recordTypes = await recordTypesRepository.fetchAll()
            const paymentTypes = await paymentTypesRepository.fetchAll()
            const fixeds = await fetchFixeds()
            setCategories(categories)
            setPaymentMethods(payments)
            setRecordTypes(recordTypes)
            setPaymentTypes(paymentTypes)
            setFixeds(fixeds ?? [])
            await loadConfigs(recordTypes)
        } catch (error) {
            console.error("Error loading data for group selector:", error)
        }
    }

    const getGroups = async () => {
        const groups = await groupsOrm.fetchGroupsByYear(year)
        setGroups(groups)
    }

    useEffect(() => {
        if (year.length !== 4) return
        getGroups()
    }, [year])

    const onSelect = async (group: Group) => {
        if (!group?.id) return
        setGroup(group)
        await fetchRecords(group.id).then((res) => {
            setRecords(res ?? [])
        })
        await fetchPaidCreditsByGroup(group.id).then((res) => {
            setPaidCredits(res)
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
            groupsOrm.fetchGroupsById(p).then((g) => {
                if (g) onSelect(g)
            })
        } else {
            groupsOrm.fetchLastGroup().then((g) => {
                if (g) onSelect(g)
            })
        }
    }

    const setOptions = (gs: Group[]) => {
        return gs?.map(val => getPlaceHolder(val))
    }

    const handleDelete = async () => {
        if (!group?.id) return
        await groupsOrm.deleteGroup(group.id)
        const pinned = await AsyncStorage.getItem('group');
        if (pinned == String(group.id)) {
            await AsyncStorage.removeItem('group')
        }
        groupsOrm.fetchLastGroup().then((g) => {
            if (g) onSelect(g)
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
                            extra={
                                <View style={localStyles.yearContainer}>
                                    <Input
                                        placeholder={t("year")}
                                        value={year}
                                        onChangeText={setYear}
                                        maxLength={4}
                                        keyboardType='numeric'
                                    />
                                </View>
                            }
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
    },
    yearContainer: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 10
    }
})

export default GroupSelector