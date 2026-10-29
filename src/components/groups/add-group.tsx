import { Pressable, StyleSheet, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'

import { useLanguage } from '@/src/lang/LanguageContext'
import useAndroidToast from '@/src/hooks/useAndroidToast'
import useRecordsStore from '@/src/stores/RecordsStore'
import { useGroups } from '@/src/db'
import type { Group, Insertable } from '@/src/interfaces/schema'
import { Button } from '@/src/ui/actions/Button'
import { MoneyField } from '@/src/ui/forms/MoneyField'
import { MonthField } from '@/src/ui/forms/MonthField'
import { TextField } from '@/src/ui/forms/TextField'
import { Modal } from '@/src/ui/overlays/Modal'

interface AddGroupProps {
    children?: React.ReactNode
    openUpdate?: boolean
    isEditing?: boolean
}

const AddGroup = ({ children, openUpdate, isEditing = false }: AddGroupProps) => {
    const { t } = useLanguage()
    const [visible, setVisible] = useState(false)
    const [name, setName] = useState<string>('')
    const [goalCents, setGoalCents] = useState<number>(0)
    const [month, setMonth] = useState<number>(new Date().getMonth())
    const [year, setYear] = useState<number>(new Date().getFullYear())
    const { group, setGroup, setGroups } = useRecordsStore()
    const toast = useAndroidToast()
    const { addGroup, editGroup, fetchGroupsByYear } = useGroups()
    const firstOpenEffect = useRef(true)

    useEffect(() => {
        if (firstOpenEffect.current) {
            firstOpenEffect.current = false
            return
        }
        setVisible(true)
    }, [openUpdate])

    useEffect(() => {
        if (!group) return
        cleanData()
        if (isEditing) {
            setName(group.group_name)
            setGoalCents(group.goal)
            setMonth(group.month)
            setYear(group.year)
        }
    }, [openUpdate])

    const getGroups = async () => {
        const groups = await fetchGroupsByYear(year)
        setGroups(groups)
    }

    const cleanData = () => {
        setName('')
        setGoalCents(0)
        setMonth(new Date().getMonth())
        setYear(new Date().getFullYear())
    }

    const closeModal = () => setVisible(false)

    const onSave = async () => {
        if (!name.trim() || goalCents <= 0 || !year) {
            toast.emptyMessage()
            return
        }

        if (String(year).length !== 4) {
            toast.withMessage(t('year-error'))
            return
        }

        const newGroup: Insertable<Group> = {
            group_name: name.trim(),
            goal: goalCents,
            month,
            year
        }
        if (group?.id && isEditing) {
            const updateGroup = { ...group, ...newGroup }
            await editGroup(group.id, updateGroup)
            setGroup && setGroup(updateGroup)
            toast.editedMessage()
        } else {
            await addGroup(newGroup)
            toast.addedMessage()
        }
        await getGroups()
        cleanData()
        closeModal()
    }

    return (
        <>
            {children ? (
                <Pressable onPress={() => setVisible(true)}>{children}</Pressable>
            ) : null}
            <Modal
                visible={visible}
                onClose={closeModal}
                title={group ? t('group.edit') : t('group.add')}
                closeLabel={t('cancel')}
                scrollable
                footer={
                    <View style={styles.footer}>
                        <Button
                            label={t('cancel')}
                            variant='outline'
                            onPress={closeModal}
                            style={styles.footerButton}
                        />
                        <Button
                            label={t('confirm')}
                            onPress={onSave}
                            style={styles.footerButton}
                        />
                    </View>
                }
            >
                <View style={styles.form}>
                    <TextField
                        label={t('group.name')}
                        required
                        value={name}
                        onChangeText={setName}
                        placeholder={t('group.name')}
                    />
                    <MoneyField
                        label={t('group.goal')}
                        required
                        value={goalCents}
                        onChangeCents={setGoalCents}
                    />
                    <MonthField
                        label={t('group.month')}
                        required
                        value={month}
                        onChange={setMonth}
                    />
                    <TextField
                        label={t('group.year')}
                        required
                        value={String(year)}
                        onChangeText={(value) => setYear(Number(value.replace(/[^0-9]/g, '')))}
                        keyboardType='number-pad'
                        maxLength={4}
                        placeholder={t('group.year')}
                    />
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    form: {
        gap: 16
    },
    footer: {
        flex: 1,
        flexDirection: 'row',
        gap: 8
    },
    footerButton: {
        flex: 1
    }
})

export default AddGroup
