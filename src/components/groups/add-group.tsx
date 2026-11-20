import { Pressable, StyleSheet, View } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useLanguage } from '@/src/lang/LanguageContext'
import { useToast } from '@/src/ui/feedback/ToastProvider'
import useRecordsStore from '@/src/stores/RecordsStore'
import {
    useGroups,
    usePeopleRepository,
    usePersonSettlementsRepository,
    useSharedLedgerRepository,
} from '@/src/db'
import { useConfigs } from '@/src/hooks/useConfigs'
import type { Group, Insertable } from '@/src/interfaces/schema'
import { buildSettlementForBalance } from '@/src/domain/shared/statement'
import {
    groupPeriodFromRow,
    resolveGroupPeriod,
} from '@/src/domain/groups/period'
import type { Period } from '@/src/domain/periods/types'
import {
    PendingBalancesDialog,
    type PendingBalanceItem,
} from './PendingBalancesDialog'
import { GroupPeriodPreview } from './group-period-preview'
import { Button } from '@/src/ui/actions/Button'
import { InlineMessage } from '@/src/ui/feedback/InlineMessage'
import { MoneyField } from '@/src/ui/forms/MoneyField'
import { MonthField } from '@/src/ui/forms/MonthField'
import { TextField } from '@/src/ui/forms/TextField'
import { Modal } from '@/src/ui/overlays/Modal'

type GroupFormMode = 'create' | 'edit'

interface AddGroupProps {
    children?: React.ReactNode
    openUpdate?: boolean
    mode?: GroupFormMode
}

const groupDate = (group: Group) => groupPeriodFromRow(group).start
const groupEnd = (group: Group) => groupPeriodFromRow(group).end

const AddGroup = ({ children, openUpdate, mode = 'create' }: AddGroupProps) => {
    const { t } = useLanguage()
    const { configs } = useConfigs()
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

    const previewPeriod = useMemo<Period | null>(() => {
        const unchangedMonth =
            mode === 'edit' &&
            group != null &&
            group.month === month &&
            group.year === year;

        if (unchangedMonth && group) {
            if (group.period_start != null && group.period_end != null) {
                return { start: group.period_start, end: group.period_end }
            }
            // Legacy groups without explicit columns keep their calendar month
            // when the user only edits the name or goal.
            return resolveGroupPeriod({
                mode: 'calendar_month',
                year: group.year,
                month: group.month,
            })
        }

        return resolveGroupPeriod({
            mode: configs.groupPeriodMode,
            year,
            month,
            startDay: configs.groupStartDay,
        })
    }, [
        configs.groupPeriodMode,
        configs.groupStartDay,
        group,
        mode,
        month,
        year,
    ])

    const periodChanged =
        mode === 'edit' &&
        group?.period_start != null &&
        group.period_end != null &&
        previewPeriod != null &&
        (group.period_start !== previewPeriod.start ||
            group.period_end !== previewPeriod.end)

    useEffect(() => {
        if (openUpdate === undefined) return
        if (firstOpenEffect.current) {
            firstOpenEffect.current = false
            return
        }
        setVisible(true)
    }, [openUpdate])

    useEffect(() => {
        if (!visible) return
        cleanData()
        if (mode === 'edit' && group) {
            setName(group.group_name)
            setGoalCents(group.goal)
            setMonth(group.month)
            setYear(group.year)
        }
    }, [visible, mode, group])

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
        if (!name.trim() || goalCents <= 0 || !year || !previewPeriod) {
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
            year,
            period_start: previewPeriod.start,
            period_end: previewPeriod.end,
            period_mode:
                mode === 'edit'
                    ? group?.period_mode ?? configs.groupPeriodMode
                    : configs.groupPeriodMode,
        }
        if (group?.id && mode === 'edit') {
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
                title={mode === 'edit' ? t('group.edit') : t('group.add')}
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
                    <GroupPeriodPreview period={previewPeriod} />
                    {periodChanged ? (
                        <InlineMessage
                            variant='warning'
                            message={t('group.periodChangeWarning')}
                        />
                    ) : null}
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
