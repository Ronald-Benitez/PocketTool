import { View, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'

import { useLanguage } from '@/src/lang/LanguageContext'
import useDate from '@/src/hooks/useDate'
import useToast from '@/src/hooks/useToast'
import { Group, CreateGroupRequest } from '@/src/interfaces'
import { useGroups } from '@/src/db'
import MonthSelector from '../ui/month-selector'
import { ScrollView } from 'react-native-gesture-handler'
import ModalContainer from '../ui/modal-container'
import InputLabel from '../ui/InputLabel'
import useRecordsStore from '@/src/stores/RecordsStore'
import useAndroidToast from '@/src/hooks/useAndroidToast'
import { useHandler } from '@/src/db/handlers/handler';
import { Groups } from '@/src/db/types/tables';
import { useDataStore } from '@/src/stores'

interface AddTemplateProps {
    children?: React.ReactNode
    openUpdate?: boolean
    isEditing?: boolean
}


const AddTemplate = ({ children, openUpdate, isEditing = false }: AddTemplateProps) => {
    const { t } = useLanguage()
    const date = useDate()
    const { ToastContainer, showToast } = useToast()
    const [modalVisible, setModalVisible] = useState(false)
    const [name, setName] = useState<string>('')
    const [goal, setGoal] = useState<number>(0)
    const today = date.create()
    const [month, setMonth] = useState<number>(new Date().getMonth())
    const [year, setYear] = useState<number>(new Date().getFullYear())
    const { addGroup, editGroup, fetchGroupsByYear } = useGroups()
    const { group, setGroup, groups, setGroups } = useRecordsStore()
    const toast = useAndroidToast()
    const handler = useHandler("Groups")
    


    useEffect(() => {
        if (!group) return
        cleanData()
        if (isEditing) {
            setName(group.group_name)
            setGoal(group.goal)
            setMonth(group.month)
            setYear(group.year)
        }
    }, [openUpdate])

    const getGroups = async () => {
        const groups = await handler.fetchWithWhere("year", String(year)) as Groups[]
        setGroups(groups)
    }

    const cleanData = () => {
        setName('')
        setGoal(0)
        setMonth(new Date().getMonth())
        setYear(new Date().getFullYear())
    }

    const onSave = async () => {
        if (!name || !month || !year || !goal) {
            toast.emptyMessage()
            return
        }

        if (String(year).length !== 4) {
            toast.withMessage(t('year-error'))
            return
        }

        const newGroup: Groups = {
            group_name: name,
            goal,
            month,
            year
        }
        if (group?.id && isEditing) {
            const updateGroup = { ...group, ...newGroup }
            await handler.edit(updateGroup)
            setGroup && setGroup(updateGroup)
            toast.editedMessage()
        } else {
            await handler.add(newGroup)
            toast.addedMessage()
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
                                placeholder={t('group.name') + '*'}
                            />
                        </View>
                        <View style={localStyles.inputContainer}>
                            <InputLabel
                                value={String(goal)}
                                onChangeText={(e) => setGoal(Number(e))}
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

export default AddTemplate