import { Pressable, StyleSheet, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'

import { useLanguage } from '@/src/lang/LanguageContext'
import { useToast } from '@/src/ui/feedback/ToastProvider'
import useRecordsStore from '@/src/stores/RecordsStore'
import {
    useGroups,
    usePeopleRepository,
    usePersonSettlementsRepository,
    useSharedLedgerRepository,
} from '@/src/db'
import type { Group, Insertable } from '@/src/interfaces/schema'
import { buildSettlementForBalance } from '@/src/domain/shared/statement'
import {
    PendingBalancesDialog,
    type PendingBalanceItem,
} from './PendingBalancesDialog'
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

const groupDate = (group: Pick<Group, 'year' | 'month'>) =>
    new Date(group.year, group.month, 1).getTime()

const groupEnd = (group: Pick<Group, 'year' | 'month'>) =>
    new Date(group.year, group.month + 1, 0, 23, 59, 59, 999).getTime()

const AddGroup = ({ children, openUpdate, isEditing = false }: AddGroupProps) => {
    const { t } = useLanguage()
    const [visible, setVisible] = useState(false)
    const [name, setName] = useState<string>('')
    const [goalCents, setGoalCents] = useState<number>(0)
    const [month, setMonth] = useState<number>(new Date().getMonth())
    const [year, setYear] = useState<number>(new Date().getFullYear())
    const { group, setGroup, setGroups, setSettlements } = useRecordsStore()
    const { showToast } = useToast()
    const { addGroup, editGroup, fetchGroups, fetchGroupsByYear } = useGroups()
    const peopleRepository = usePeopleRepository()
    const ledgerRepository = useSharedLedgerRepository()
    const settlementsRepository = usePersonSettlementsRepository()
    const [pendingVisible, setPendingVisible] = useState(false)
    const [pendingItems, setPendingItems] = useState<PendingBalanceItem[]>([])
    const [pendingGroup, setPendingGroup] = useState<Group | null>(null)
    const [pendingPrevious, setPendingPrevious] = useState<Group | null>(null)
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

    const checkPendingBalances = async (created: Group) => {
        const allGroups = await fetchGroups()
        const createdTime = groupDate(created)
        const previous = allGroups
            .filter(
                (candidate) =>
                    candidate.id !== created.id && groupDate(candidate) < createdTime
            )
            .sort((left, right) => groupDate(right) - groupDate(left))[0]
        if (!previous) return

        const pending = await ledgerRepository.fetchPendingBalances(
            groupEnd(previous)
        )
        if (pending.length === 0) return

        const people = await peopleRepository.fetchPeople()
        const peopleById = new Map(
            people.flatMap((person) =>
                person.id === undefined ? [] : [[person.id, person] as const]
            )
        )
        const items: PendingBalanceItem[] = pending.flatMap((row) => {
            const person = peopleById.get(row.personId)
            return person ? [{ person, balanceCents: row.balanceCents }] : []
        })
        if (items.length === 0) return

        setPendingGroup(created)
        setPendingPrevious(previous)
        setPendingItems(items)
        setPendingVisible(true)
    }

    const settlePending = async (
        target: 'previous' | 'new',
        personIds: number[]
    ) => {
        if (!pendingGroup) return
        const targetGroup = target === 'previous' ? pendingPrevious : pendingGroup
        if (!targetGroup?.id) return
        const date =
            target === 'previous' ? groupEnd(targetGroup) : groupDate(targetGroup)
        const inputs = pendingItems.flatMap((item) => {
            if (item.person.id === undefined || !personIds.includes(item.person.id)) {
                return []
            }
            const base = buildSettlementForBalance({
                personId: item.person.id,
                balanceCents: item.balanceCents,
                groupId: targetGroup.id,
                date,
                notes: t('shared.pendingBalances'),
            })
            return [{
                person_id: base.personId,
                group_id: base.groupId,
                date: base.date,
                amount_cents: base.amountCents,
                direction: base.direction,
                notes: base.notes,
            }]
        })
        try {
            await settlementsRepository.addMany(inputs)
            showToast({ message: t('shared.settlementSaved'), type: 'success' })

            const current = useRecordsStore.getState().group
            if (current?.id) {
                const rows = await settlementsRepository.fetchByGroup(current.id)
                setSettlements(rows)
            }
        } catch (cause) {
            if (__DEV__) console.warn('[groups] pending settlement failed', cause)
            showToast({ message: t('toast.error'), type: 'error' })
        }
    }

    const onSave = async () => {
        if (!name.trim() || goalCents <= 0 || !year) {
            showToast({ message: t('toast.empty'), type: 'warning' })
            return
        }

        if (String(year).length !== 4) {
            showToast({ message: t('year-error'), type: 'info' })
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
            showToast({ message: t('toast.edited'), type: 'success' })
            await getGroups()
            cleanData()
            closeModal()
            return
        }

        const createdId = await addGroup(newGroup)
        showToast({ message: t('toast.added'), type: 'success' })
        await getGroups()
        cleanData()
        closeModal()
        try {
            await checkPendingBalances({ ...newGroup, id: createdId })
        } catch (cause) {
            if (__DEV__) console.warn('[groups] pending balances check failed', cause)
            showToast({ message: t('toast.error'), type: 'error' })
        }
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
            <PendingBalancesDialog
                visible={pendingVisible}
                items={pendingItems}
                canSettleInPrevious={pendingPrevious?.id != null}
                onClose={() => setPendingVisible(false)}
                onSettle={settlePending}
            />
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
