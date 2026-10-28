import { View, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'

import { useLanguage } from '@/src/lang/LanguageContext'
import useToast from '@/src/hooks/useToast'
import MonthSelector from '../ui/month-selector'
import { ScrollView } from 'react-native-gesture-handler'
import ModalContainer from '../ui/modal-container'
import InputLabel from '../ui/InputLabel'
import useRecordsStore from '@/src/stores/RecordsStore'
import useAndroidToast from '@/src/hooks/useAndroidToast'
import { Groups } from '@/src/db/types/tables';
import { useORM } from '@/src/orm'
import { Insertable } from '@/src/interfaces/schema'
import { centsToInput, parseMoneyToCents } from '@/src/utils'

interface AddGroupProps {
    children?: React.ReactNode
    openUpdate?: boolean
    isEditing?: boolean
}

const AddGroup = ({ children, openUpdate, isEditing = false }: AddGroupProps) => {
    const { t } = useLanguage()
    const { ToastContainer, showToast } = useToast()
    const [name, setName] = useState<string>('')
    const [goal, setGoal] = useState<string>('')
    const [month, setMonth] = useState<number>(new Date().getMonth())
    const [year, setYear] = useState<number>(new Date().getFullYear())
    const { group, setGroup, setGroups } = useRecordsStore()
    const toast = useAndroidToast()
    const orm = useORM("Groups")

    useEffect(() => {
        if (!group) return
        cleanData()
        if (isEditing) {
            setName(group.group_name)
            setGoal(centsToInput(group.goal))
            setMonth(group.month)
            setYear(group.year)
        }
    }, [openUpdate])

    const getGroups = async () => {
        const groups = await orm.where("year", year, "=").getAll()
        setGroups(groups)
    }

    const cleanData = () => {
        setName('')
        setGoal('')
        setMonth(new Date().getMonth())
        setYear(new Date().getFullYear())
    }

    const onSave = async () => {
        if (!name || month == null || month == undefined  || !year || !goal) {
            toast.emptyMessage()
            return
        }

        if (String(year).length !== 4) {
            toast.withMessage(t('year-error'))
            return
        }

        const newGroup: Insertable<Groups> = {
            group_name: name,
            goal: parseMoneyToCents(goal),
            month,
            year
        }
        if (group?.id && isEditing) {
            const updateGroup = { ...group, ...newGroup }
            await orm.update(group.id, updateGroup)
            setGroup && setGroup(updateGroup)
            toast.editedMessage()
        } else {
            await orm.insert(newGroup)
            toast.addedMessage()
        }
        getGroups()
        cleanData()
    }

    return (
        <>
            <ModalContainer
                buttonOpen={children}
                closeOnAccept={true}
                type="complete"
                onAccept={onSave}
                title={group ? t('group.edit') : t('group.add')}
                open={openUpdate}
            >
                <ScrollView >
                    <View style={localStyles.colContainer}>
                        <View style={localStyles.inputContainer}>
                            <InputLabel
                                value={name}
                                onChangeText={setName}
                                placeholder={t('group.name') + '*'}
                            />
                        </View>
                        <View style={localStyles.inputContainer}>
                            <InputLabel
                                value={goal}
                                onChangeText={setGoal}
                                keyboardType="numeric"
                                placeholder={t('group.goal') + '*'}
                            />
                        </View>
                        <View style={localStyles.inputContainer}>
                            <MonthSelector month={String(month)} setMonth={(e) => setMonth(Number(e))} />
                        </View>
                        <View style={localStyles.inputContainer}>
                            <InputLabel
                                value={String(year)}
                                onChangeText={(e) => setYear(Number(e))}
                                keyboardType="numeric"
                                placeholder={t('group.year') + '*'}
                            />
                        </View>
                    </View>
                </ScrollView>
            </ModalContainer>
            <ToastContainer />
        </>
    )
}

const localStyles = StyleSheet.create({
    colContainer: {
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        paddingVertical: 20,
        gap: 20
    },

    inputContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center"
    }
})

export default AddGroup