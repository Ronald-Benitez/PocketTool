import React, { useState, useEffect, useRef } from 'react'

import { useLanguage } from '@/src/lang/LanguageContext'
import { monthKey } from '@/src/lang/keys'
import { isCalendarMonthPeriod } from '@/src/domain/periods/period'
import { groupPeriodFromRow } from '@/src/domain/groups/period'
import { formatPeriodRange } from '@/src/utils'
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
    usePersonSettlementsRepository,
    useRecords,
    useTableRepository,
} from '@/src/db'
import { useConfigs } from '@/src/hooks/useConfigs'
import { SelectField } from '@/src/ui/forms/SelectField'
import { TextField } from '@/src/ui/forms/TextField'

const GroupSelector = () => {
    const { t, language } = useLanguage()
    const { showToast } = useToast()
    const [year, setYear] = useState<string>(
        (useRecordsStore.getState().group?.year ?? new Date().getFullYear()).toString()
    )
    const { group, setGroup, setRecords, groups, setGroups, setPaidCredits, setSettlements } = useRecordsStore()
    const [openUpdate, setOpenUpdate] = useState(false)
    const userSelectedRef = useRef(false)
    const selectionIdRef = useRef(0)
    const { setCategories, setPaymentMethods, setRecordTypes, setPaymentTypes, setFixeds } = useDataStore()
    
    const groupsOrm = useGroups()
    const { fetchCategories } = useCategories()
    const recordTypesRepository = useTableRepository('RecordTypes')
    const paymentTypesRepository = useTableRepository('PaymentTypes')
    const { fetchByGroup: fetchPaidCreditsByGroup } = usePaidCredits()
    const { fetchFixeds } = useFixeds()
    const { fetchPaymentMethods } = usePaymentMethods()
    const { fetchRecords } = useRecords()
    const settlementsRepository = usePersonSettlementsRepository()
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

    useEffect(() => {
        if (group?.year && String(group.year) !== year) {
            setYear(String(group.year))
        }
    }, [group?.year])

    const onSelect = async (group: Group, userInitiated = false) => {
        if (!group?.id) return
        if (userInitiated) userSelectedRef.current = true
        const selectionId = selectionIdRef.current + 1
        selectionIdRef.current = selectionId
        setGroup(group)
        const records = await fetchRecords(group.id)
        if (selectionIdRef.current !== selectionId) return
        setRecords(records ?? [])
        const paidCredits = await fetchPaidCreditsByGroup(group.id)
        if (selectionIdRef.current !== selectionId) return
        setPaidCredits(paidCredits)
        const settlements = await settlementsRepository.fetchByGroup(group.id)
        if (selectionIdRef.current !== selectionId) return
        setSettlements(settlements)
    }

    const getPlaceHolder = (group: Group | null) => {
        if (!group) return ""
        const name = group.group_name?.substring(0, 20) + (group.group_name?.length > 20 ? "..." : "")
        const period = groupPeriodFromRow(group)
        const label = isCalendarMonthPeriod(period)
            ? `${t(monthKey(Number(group.month)))} ${group.year}`
            : formatPeriodRange(period, language)
        return `${name} (${label})`
    }

    const getPinned = async () => {
        if (userSelectedRef.current) return
        // Never replace the group already selected by the user. Every screen
        // mounts its own GroupSelector; falling back to the last group here
        // would reset the selection when switching views.
        if (useRecordsStore.getState().group?.id) return
        const pinned = await AsyncStorage.getItem('group');
        if (pinned) {
            const p = Number(pinned)
            groupsOrm.fetchGroupsById(p).then((g) => {
                if (g && !userSelectedRef.current) void onSelect(g)
            })
        } else {
            groupsOrm.fetchLastGroup().then((g) => {
                if (g && !userSelectedRef.current) void onSelect(g)
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
            if (g) {
                void onSelect(g)
            } else {
                useRecordsStore.setState({
                    group: null,
                    records: [],
                    paidCredits: [],
                    settlements: [],
                })
            }
        })
        getGroups()
        showToast({ message: t('toast.deleted'), type: 'success' })
    }

    const handleUpdate = () => {
        setOpenUpdate(true)
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
                        if (nextGroup) void onSelect(nextGroup, true)
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
                mode='edit'
                onClose={() => setOpenUpdate(false)}
            >
            </AddGroup>
        </>
    )
}

export default GroupSelector