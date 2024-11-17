import { View, Text, Modal, TouchableOpacity, Pressable, TextInput, StyleSheet } from 'react-native'
import React, { SetStateAction, useEffect, useState } from 'react'

import styles from '@/src/styles/styles'
import { useLanguage } from '@/src/lang/LanguageContext'
import useDate from '@/src/hooks/useDate'
import useToast from '@/src/hooks/useToast'
import { Group, CreateGroupRequest } from '@/src/interfaces'
import { useGroups } from '@/src/db'
import MonthSelector from '../ui/month-selector'
import { ScrollView } from 'react-native-gesture-handler'
import ModalContainer from '../ui/modal-container'
import InputLabel from '../ui/InputLabel'
import LabelBlock from '../ui/LabelBlock'
import useRecordsStore from '@/src/stores/RecordsStore'

interface AddGroupProps {
    children?: React.ReactNode
    openUpdate?: boolean
    isEditing?: boolean
}


const AddGroup = ({ children, openUpdate, isEditing = false }: AddGroupProps) => {
    const { t } = useLanguage()
    const date = useDate()
    const { ToastContainer, showToast } = useToast()
    const [modalVisible, setModalVisible] = useState(false)
    const [name, setName] = useState<string>('')
    const [goal, setGoal] = useState<number>(0)
    const today = date.create()
    const [month, setMonth] = useState<string>(String(new Date().getMonth()))
    const [year, setYear] = useState<string>(String(new Date().getFullYear()))
    const { addGroup, editGroup, fetchGroupsByYear } = useGroups()
    const { group, setGroup, setGroups, groups } = useRecordsStore()

    useEffect(() => {
        if (!group) return
        cleanData()
        if (isEditing) {
            setName(group.group_name)
            setGoal(group.goal)
            setMonth(String(group.month))
            setYear(String(group.year))
        }
    }, [openUpdate])

    const getGroups = async () => {
        const groups = await fetchGroupsByYear(year)
        setGroups(groups)
    }

    const cleanData = () => {
        setName('')
        setGoal(0)
        setMonth(String(new Date().getMonth()))
        setYear(String(new Date().getFullYear()))
    }

    const onSave = async () => {
        if (!name || !month || !year) {
            return showToast({ message: t('group.error'), type: 'ERROR' })
        }

        if (String(year).length !== 4) {
            return showToast({ message: t('year-error'), type: 'ERROR' })
        }

        const newGroup: CreateGroupRequest = {
            group_name: name,
            goal,
            month,
            year
        }
        if (group && isEditing) {
            const updateGroup = { ...group, ...newGroup }
            await editGroup(group.id, updateGroup)
            setGroup && setGroup(updateGroup)
            showToast({ message: t("group.edited"), type: "SUCCESS" })
        } else {
            await addGroup(newGroup)
            showToast({ message: t("group.added"), type: "SUCCESS" })
        }
        getGroups()
        cleanData()
        setModalVisible(false)
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
                                placeholder={t('group.name')}
                            />
                        </View>
                        <View style={localStyles.inputContainer}>
                            <InputLabel
                                value={String(goal)}
                                onChangeText={(e) => setGoal(Number(e))}
                                keyboardType="numeric"
                                placeholder={t('group.goal')}
                            />
                        </View>
                        <View style={localStyles.inputContainer}>
                            <MonthSelector month={month} setMonth={setMonth} />
                        </View>
                        <View style={localStyles.inputContainer}>
                            <InputLabel
                                value={year}
                                onChangeText={setYear}
                                keyboardType="numeric"
                                placeholder={t('group.year')}
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