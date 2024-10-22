import { View, Text, Modal, TouchableOpacity, Pressable, TextInput } from 'react-native'
import React, { SetStateAction, useEffect, useState } from 'react'

import styles from '@/src/styles/styles'
import { useLanguage } from '@/src/lang/LanguageContext'
import useDate from '@/src/hooks/useDate'
import useToast from '@/src/hooks/useToast'
import { Group, CreateGroupRequest } from '@/src/interfaces'
import { useGroups } from '@/src/db'
import MonthSelector from '../ui/month-selector'
import { ScrollView } from 'react-native-gesture-handler'

interface AddGroupProps {
    group?: Group | null
    children?: React.ReactNode
    openUpdate?: boolean
    setOpenUpdate?: React.Dispatch<React.SetStateAction<boolean>>
    setGroup?: React.Dispatch<SetStateAction<Group | null>>
}


const AddGroup = ({ children, group, openUpdate, setOpenUpdate, setGroup }: AddGroupProps) => {
    const { t } = useLanguage()
    const date = useDate()
    const { ToastContainer, showToast } = useToast()
    const [modalVisible, setModalVisible] = useState(false)
    const [name, setName] = useState<string>('')
    const [goal, setGoal] = useState<number>(0)
    const today = date.create()
    const [month, setMonth] = useState<string>(date.getMonthComplete(today) as string)
    const [year, setYear] = useState<string>(String(date.getYear(today)))
    const { addGroup, editGroup } = useGroups()

    useEffect(() => {
        if (!group) return
        setName(group.group_name)
        setGoal(group.goal)
        setMonth(String(group.month))
        setYear(String(group.year))
    }, [group])

    useEffect(() => {
        if (!openUpdate || !setOpenUpdate) return
        setModalVisible(true)
        setOpenUpdate(false)
    }, [openUpdate])

    const cleanData = () => {
        setName('')
        setGoal(0)
        setMonth(date.getMonthComplete(today) as string)
        setYear(String(date.getYear(today)))
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
        if (group) {
            const updateGroup = { ...group, ...newGroup }
            await editGroup(group.id, updateGroup)
            setGroup && setGroup(updateGroup)
            showToast({ message: t("group.edited"), type: "SUCCESS" })
        } else {
            await addGroup(newGroup)
            showToast({ message: t("group.added"), type: "SUCCESS" })
        }
        cleanData()
        setModalVisible(false)
    }

    return (
        <>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                {children}
            </TouchableOpacity>
            <Modal
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
                transparent={true}
                animationType="slide"
            >
                <Pressable onPress={() => setModalVisible(false)} style={styles?.modalBackdrop}>
                    <ScrollView style={{ maxHeight: 600 }}>
                        <Pressable onPress={() => { }} style={[styles?.modalContent]}>
                            <View style={styles.modalContent}>
                                <Text style={styles.title}>
                                    {group ? t('group.edit') : t('group.add')}
                                </Text>
                                <Text style={styles.middleText}>{t('group.name')}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                />
                                <Text style={styles.middleText}>{t('group.goal')}</Text>
                                <TextInput
                                    style={[styles.input, { borderColor: "blue", color: "blue" }]}
                                    value={String(goal)}
                                    onChangeText={(e) => setGoal(Number(e))}
                                    keyboardType="numeric"
                                />
                                <Text style={styles.middleText}>{t('group.month')}</Text>
                                <MonthSelector month={month} setMonth={setMonth} />
                                <Text style={styles.middleText}>{t('group.year')}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={year}
                                    onChangeText={setYear}
                                    keyboardType="numeric"
                                />
                                <View style={styles.row}>
                                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.button}>
                                        <Text style={styles.text}>{t('group.cancel')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={onSave} style={styles.enfasizedButton}>
                                        <Text style={styles.enfasizedText}>{t('group.save')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Pressable>
                    </ScrollView>
                </Pressable>
                <ToastContainer />
            </Modal>
        </>
    )
}

export default AddGroup