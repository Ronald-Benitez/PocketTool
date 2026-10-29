import React, { useState, useEffect } from 'react'

import { useLanguage } from '@/src/lang/LanguageContext'
import useRecordsStore from '@/src/stores/RecordsStore'
import { useToast } from '@/src/ui/feedback/ToastProvider'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SwipeAction } from '@/src/ui/actions/SwipeAction'
import AddGroup from './add-group'
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
import { SelectField } from '@/src/ui/forms/SelectField'
import { TextField } from '@/src/ui/forms/TextField'

const GroupSelector = () => {
    const { t } = useLanguage()
    const { showToast } = useToast()
    const [year, setYear] = useState<string>(new Date().getFullYear().toString())
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

    const groupOptions = (groups ?? []).flatMap(groupItem =>
        typeof groupItem.id === 'number'
            ? [{ label: getPlaceHolder(groupItem), value: groupItem.id }]
            : []
    )

    const handleDelete = async () => {
        if (!group?.id) return
        await groupsOrm.deleteGroup(group.id)
        const pinned = await AsyncStorage.getItem('group');
        if (pinned === String(group.id)) {
            await AsyncStorage.removeItem('group')
        }
        groupsOrm.fetchLastGroup().then((g) => {
            if (g) onSelect(g)
        })
        getGroups()
        showToast({ message: t('toast.deleted'), type: 'success' })
    }

    const handleUpdate = () => {
        setOpenUpdate(!openUpdate)
    }

    return (
        <>
            <SwipeAction
                handleDelete={handleDelete}
                handleUpdate={handleUpdate}
            >
                <SelectField<number>
                    containerStyle={{ width: 250 }}
                    value={group?.id}
                    options={groupOptions}
                    onChange={(id) => {
                        const nextGroup = groups?.find(groupItem => groupItem.id === id)
                        if (nextGroup) void onSelect(nextGroup)
                    }}
                    title={t("group.select-group")}
                    placeholder={t("group.select-group")}
                    closeLabel={t('cancel')}
                    extra={
                        <TextField
                            label={t("year")}
                            value={year}
                            onChangeText={setYear}
                            maxLength={4}
                            keyboardType='numeric'
                        />
                    }
                />
            </SwipeAction>
            <AddGroup
                openUpdate={openUpdate}
                isEditing={true}
            >
            </AddGroup>
        </>
    )
}

export default GroupSelector