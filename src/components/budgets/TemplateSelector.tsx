import { View, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'

import { useLanguage } from '@/src/lang/LanguageContext'
import styles from '@/src/styles/styles'
import useRecordsStore from '@/src/stores/RecordsStore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BaseSelect from '../ui/base-select'
import SwipeItem from '../ui/swipe-item'
import AddGroup from './AddTemplate'
import useBudgetStore from '@/src/stores/BudgetStore'
import { useBudget } from '@/src/db'
import Input from '../ui/Input'
import { useHandler } from '@/src/db/handlers/handler'
import { Groups, PaidCredits, PaymentTypes, RecordJoined } from '@/src/db/types/tables'
import { useRecords } from '@/src/db/handlers/RecordsHandler'
import { useFixeds } from '@/src/db/handlers/FixedsHandler'
import { useDataStore } from '@/src/stores'
import { Categories, RecordTypes } from '@/src/db/types/tables'
import { PaymentMethodsJoined } from '@/src/stores'

const GroupSelector = () => {
    const { t } = useLanguage()
    const [year, setYear] = useState<string>(new Date().getFullYear().toString())
    const [modalVisible, setModalVisible] = useState(false)
    const { group, setGroup, setRecords, groups, setGroups, setPaidCredits } = useRecordsStore()
    const [openUpdate, setOpenUpdate] = useState(false)
    const { budgets, resumes, setBudgets, setResumes: setBudgetResume } = useBudgetStore()
    const { fetchRecords, handler: recordsHandler } = useRecords()
    const { fetchFixeds } = useFixeds()
    const groupsHandler = useHandler("Groups")
    const paymentsHandler = useHandler("PaymentMethods")
    const creditsHandler = useHandler('PaidCredits')
    const budgetsHanlder = useHandler("Budgets")
    const { setCategories, setPaymentMethods, setRecordTypes, setPaymentTypes, setFixeds } = useDataStore()

    useEffect(() => {
        getPinned()
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const categories = await groupsHandler.fetchAll('Categories') as Categories[]
            const payments = await paymentsHandler.fetchAllWithJoin('PaymentTypes', "payment_type_id") as PaymentMethodsJoined[];
            const recordTypes = await groupsHandler.fetchAll('RecordTypes') as RecordTypes[]
            const paymentTypes = await groupsHandler.fetchAll('PaymentTypes') as PaymentTypes[]
            const fixeds = await fetchFixeds()
            setCategories(categories)
            setPaymentMethods(payments)
            setRecordTypes(recordTypes)
            setPaymentTypes(paymentTypes)
            setFixeds(fixeds)
        } catch (error) {
            console.error("Error loading data for group selector:", error)
        }
    }

    const getGroups = async () => {
        const groups = await recordsHandler.fetchGroupsByYear(year) as Groups[]
        setGroups(groups)
    }

    useEffect(() => {
        if (year.length !== 4) return
        getGroups()
    }, [year])

    const onSelect = async (group: Groups) => {
        if (!group?.id) return
        setGroup(group)
        await fetchRecords(group.id).then((res) => {
            setRecords(res)
        })
        await creditsHandler.fetchWithWhere('group_id', String(group.id)).then((res) => {
            setPaidCredits(res as PaidCredits[])
        })
        // await getAllResume(group.id).then(res => {
        //     setResumes(res)
        // })

        // await budget.fetchBudget(group.id).then(res => {
        //     setBudgets(res || [])
        // })

        // await budget.getAllResume(group.id).then(res => {
        //     setBudgetResume(res)
        // })

        setModalVisible(false)
    }

    const handleSelect = (index: number) => {
        const g = groups[index]
        if (!g) return
        onSelect(g)
    }

    const getPlaceHolder = (group: Groups | null) => {
        if (!group) return ""
        return group.group_name?.substring(0, 20) + (group.group_name?.length > 20 ? "..." : "") + " (" + t("months." + Number(group.month)) + " " + group.year + ")"
    }

    const getPinned = async () => {
        const pinned = await AsyncStorage.getItem('group');
        if (pinned) {
            const p = Number(pinned)
            groupsHandler.fetchById(p).then(g => {
                onSelect(g as Groups)
            })
        } else {
            groupsHandler.fetchLast().then(g => {
                onSelect(g as Groups)
            })
        }
    }

    const setOptions = (gs: Groups[]) => {
        return gs?.map(val => getPlaceHolder(val))
    }

    const handleDelete = async () => {
        if (!group?.id) return
        await recordsHandler.deleteWithWhere("group_id", String(group.id))
        await groupsHandler.deleteById(group.id)
        const pinned = await AsyncStorage.getItem('group');
        if (pinned == String(group.id)) {
            await AsyncStorage.removeItem('group')
        }
        groupsHandler.fetchLast().then(g => {
            onSelect(g as Groups)
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