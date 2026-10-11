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
import { useORM } from '@/src/orm'
import { Group } from '@/src/interfaces/schema'

const GroupSelector = () => {
    const { t } = useLanguage()
    const [year, setYear] = useState<string>(new Date().getFullYear().toString())
    const [modalVisible, setModalVisible] = useState(false)
    const { group, setGroup, setRecords, groups, setGroups, setPaidCredits } = useRecordsStore()
    const [openUpdate, setOpenUpdate] = useState(false)
    const { setCategories, setPaymentMethods, setRecordTypes, setPaymentTypes, setFixeds } = useDataStore()
    
    const groupsOrm = useORM("Groups")
    const categoriesOrm = useORM("Categories")
    const recordTypesOrm = useORM("RecordTypes")
    const paymentsOrm = useORM("PaymentMethods")
    const fixedsOrm = useORM("Fixed")
    const creditsOrm = useORM("PaidCredits")
    const recordsOrm = useORM("Records")

    useEffect(() => {
        getPinned()
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const categories = await categoriesOrm.getAll()
            const payments = await paymentsOrm.getAll()
            const recordTypes = await recordTypesOrm.getAll()
            const paymentTypes = await groupsOrm.getAll()
            const fixeds = await fixedsOrm.joinMany(["PaymentMethods", "Categories", "PaymentMethods.PaymentTypes","RecordTypes"]).getAll()
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
        const groups = await groupsOrm.where('year', year, '=').getAll()
        setGroups(groups)
    }

    useEffect(() => {
        if (year.length !== 4) return
        getGroups()
    }, [year])

    const onSelect = async (group: Group) => {
        if (!group?.id) return
        setGroup(group)
        await recordsOrm.where('group_id', String(group.id), "=").joinMany(["Categories", "PaymentMethods", "RecordTypes", "PaymentMethods.PaymentTypes"]).getAll().then((res) => {
            setRecords(res)
        })
        await creditsOrm.where('group_id', String(group.id), "=").getAll().then((res) => {
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
            groupsOrm.where('id', String(p), '=').getAll().then((gs) => {
                onSelect(gs[0])
            })
        } else {
            groupsOrm.order({ column: "id", direction: "DESC" }).getAll().then((gs) => {
                onSelect(gs[0])
            })
        }
    }

    const setOptions = (gs: Group[]) => {
        return gs?.map(val => getPlaceHolder(val))
    }

    const handleDelete = async () => {
        if (!group?.id) return
        await recordsOrm.delete(group.id, "group_id")
        await groupsOrm.delete(group.id)
        const pinned = await AsyncStorage.getItem('group');
        if (pinned == String(group.id)) {
            await AsyncStorage.removeItem('group')
        }
        groupsOrm.order({ column: "id", direction: "DESC" }).getAll().then((gs) => {
            onSelect(gs[0])
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