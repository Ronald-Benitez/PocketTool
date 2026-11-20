import React, { useState, useEffect, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useLanguage } from "@/src/lang/LanguageContext";
import useDate from "@/src/hooks/useDate";
import useRecordsStore from '@/src/stores/RecordsStore';
import { useToast } from "@/src/ui/feedback/ToastProvider";
import {
    usePaidCredits,
    usePaymentMethods,
    usePeopleRepository,
    useRecords,
    useGroups,
    useSavings,
    useSharedParticipantsRepository,
    useTableRepository,
} from "@/src/db";
import type {
    Category,
    Group,
    Insertable,
    PaidCredit,
    PaymentMethodWithRelations,
    Person,
    RecordEntry,
    RecordFormEntry,
    RecordType,
    Saving
} from "@/src/interfaces/schema";
import type { ParticipantDraft } from "@/src/db";
import { computeRecordShares } from "@/src/domain/shared/split";
import { hasCreditCardSavingConflict } from "@/src/domain/credits/cards";
import { groupPeriodFromRow } from "@/src/domain/groups/period";
import { periodContains } from "@/src/domain/periods/period";
import type { Period } from "@/src/domain/periods/types";
import { useConfigs } from "@/src/hooks/useConfigs";
import { formatMoneyWithSymbol, formatPeriodRange } from "@/src/utils";
import { SharedParticipantsField } from "@/src/components/shared/SharedParticipantsField";
import { Button } from "@/src/ui/actions/Button";
import { ColoredSelectOption } from "@/src/ui/forms/ColoredSelectOption";
import { DateField } from "@/src/ui/forms/DateField";
import { MoneyField } from "@/src/ui/forms/MoneyField";
import { SelectField } from "@/src/ui/forms/SelectField";
import { TextField } from "@/src/ui/forms/TextField";
import { InlineMessage } from "@/src/ui/feedback/InlineMessage";
import { Modal } from "@/src/ui/overlays/Modal";
import { AppText } from "@/src/ui/primitives/AppText";
import { Surface } from "@/src/ui/primitives/Surface";

interface AddItemProps {
    item?: RecordFormEntry
    children?: React.ReactNode
    openUpdate?: boolean
    open?: boolean
}

type SharingSource = 'fixed' | 'financing' | 'saving' | null;
type FixedPaidMode = 'me_full' | 'me_own' | 'person_full';

const AddItem = ({ item, children, open }: AddItemProps) => {
    const { setRecords, group, setPaidCredits } = useRecordsStore()
    const dateH = useDate()
    const { t, language } = useLanguage()
    const [visible, setVisible] = useState(false)
    const [name, setName] = useState<string>("")
    const [date, setDate] = useState(new Date().getTime())
    const [type, setType] = useState<RecordType>()
    const [payment_method, setPaymentMethod] = useState<PaymentMethodWithRelations>()
    const [to_pay_method, setToPayMethod] = useState<PaymentMethodWithRelations>()
    const [category, setCategory] = useState<Category>()
    const [fixed_id, setFixedId] = useState<number | undefined>(undefined)
    const [totalCents, setTotalCents] = useState<number>(0)
    const [participants, setParticipants] = useState<ParticipantDraft[]>([])
    const [paidByPersonId, setPaidByPersonId] = useState<number | null>(null)
    const [paidScope, setPaidScope] = useState<'full' | 'own'>('full')
    const [fixedPaidMode, setFixedPaidMode] = useState<FixedPaidMode>('me_full')
    const [sharingSource, setSharingSource] = useState<SharingSource>(null)
    const [sharingLoaded, setSharingLoaded] = useState(false)
    const [people, setPeople] = useState<Person[]>([])
    const [group_id, setGroupId] = useState<number>(group?.id || 0)
    const { showToast } = useToast()
    const [recordTypes, setRecordTypes] = useState<RecordType[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodWithRelations[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [savings, setSavings] = useState<Saving[]>([])
    const [savingId, setSavingId] = useState<number | null>(null)
    const savingsRepository = useSavings()
    const groupsRepository = useGroups()
    const peopleRepository = usePeopleRepository()
    const participantsRepository = useSharedParticipantsRepository()
    const { fetchRecords, saveRecord, fetchPaidCreditsByGroup, getSharingSource } = useRecords()
    const { fetchById: fetchPaidCreditById } = usePaidCredits()
    const { fetchPaymentMethods } = usePaymentMethods()
    const recordTypesRepository = useTableRepository("RecordTypes")
    const categoriesRepository = useTableRepository("Categories")
    const { configs: { paymentCreditType } } = useConfigs()
    const firstOpenEffect = useRef(true)
    const [periodSuggestion, setPeriodSuggestion] = useState<{
        group: Group
        period: Period
    } | null>(null)
    const groupsRef = useRef(groupsRepository)
    groupsRef.current = groupsRepository

    useEffect(() => {
        let active = true

        const resolveSuggestion = async () => {
            if (!group?.id || !group_id) {
                setPeriodSuggestion(null)
                return
            }

            try {
                const groups = await groupsRef.current.fetchGroups()
                if (!active) return

                const selected = groups.find((candidate) => candidate.id === group_id) ?? group
                if (periodContains(groupPeriodFromRow(selected), date)) {
                    setPeriodSuggestion(null)
                    return
                }

                const match = groups
                    .filter((candidate) => candidate.id !== selected.id)
                    .map((candidate) => ({
                        group: candidate,
                        period: groupPeriodFromRow(candidate),
                    }))
                    .filter(({ period }) => periodContains(period, date))
                    .sort((left, right) => right.period.start - left.period.start)[0]

                setPeriodSuggestion(match ?? null)
            } catch (cause) {
                if (__DEV__) console.warn('[records] period suggestion failed', cause)
                if (active) setPeriodSuggestion(null)
            }
        }

        void resolveSuggestion()
        return () => {
            active = false
        }
    }, [date, group, group_id])

    useEffect(() => {
        if (firstOpenEffect.current) {
            firstOpenEffect.current = false
            return
        }
        setVisible(true)
    }, [open])

    useEffect(() => {
        const loadOptions = async () => {
            const [loadedRecordTypes, loadedPaymentMethods, loadedCategories, loadedSavings, loadedPeople] = await Promise.all([
                recordTypesRepository.fetchAll(),
                fetchPaymentMethods(),
                categoriesRepository.fetchAll(),
                savingsRepository.fetchSavings({ status: 'active' }),
                peopleRepository.fetchPeople()
            ])
            setRecordTypes(loadedRecordTypes)
            setPaymentMethods(loadedPaymentMethods)
            setCategories(loadedCategories)
            setSavings(loadedSavings)
            setPeople(loadedPeople)
        }

        loadOptions().catch((error) => {
            console.error("Error al cargar opciones de registros:", error)
            showToast({ message: t('toast.error'), type: 'error' })
        })
    }, [])

    useEffect(() => {
        if (!group?.id) return
        setGroupId(group.id)
    }, [group])

    useEffect(() => {
        if (!item || (item.id == null && item.fixed_id == null)) {
            setParticipants([])
            setPaidByPersonId(null)
            setPaidScope('full')
            setFixedPaidMode('me_full')
            setSharingSource(null)
            setSharingLoaded(true)
            return
        }

        let active = true
        setSharingLoaded(false)
        const loadSharing = async () => {
            let source: SharingSource = item.fixed_id ? 'fixed' : null
            if (item.id != null) {
                const resolved = await getSharingSource(item.id)
                if (resolved) source = resolved
            }
            if (!active) return
            setSharingSource(source)

            let rows: ParticipantDraft[] = []
            if (source === 'fixed' && item.fixed_id != null) {
                const fixedRows = await participantsRepository.fetchFor('fixed', item.fixed_id)
                rows = fixedRows.map((row) => ({
                    personId: row.person_id,
                    sharePercent: row.share_percent,
                    shareMode: row.share_mode as 'percent' | 'amount',
                    shareAmountCents: row.share_amount_cents ?? null,
                }))
            } else if (source === null && item.id != null) {
                const recordRows = await participantsRepository.fetchFor('record', item.id)
                rows = recordRows.map((row) => ({
                    personId: row.person_id,
                    sharePercent: row.share_percent,
                    shareMode: row.share_mode as 'percent' | 'amount',
                    shareAmountCents: row.share_amount_cents ?? null,
                }))
            }
            if (!active) return
            setParticipants(rows)
            const hasParticipants = rows.length > 0
            setPaidByPersonId(hasParticipants ? item.paid_by_person_id ?? null : null)
            setPaidScope(hasParticipants && item.paid_scope === 'own' ? 'own' : 'full')
            setFixedPaidMode(
                hasParticipants
                    ? item.paid_by_person_id != null
                        ? 'person_full'
                        : item.paid_scope === 'own'
                            ? 'me_own'
                            : 'me_full'
                    : 'me_full'
            )
            setSharingLoaded(true)
        }

        loadSharing().catch((error) => {
            console.error("Error al cargar los participantes del registro:", error)
            showToast({ message: t('toast.error'), type: 'error' })
            setSharingLoaded(true)
        })
        return () => { active = false }
    }, [item?.id, item?.fixed_id])

    useEffect(() => {
        if (!item) return
        setName(item.record_name ?? "")
        setTotalCents(
            (item.own_amount_cents ?? item.amount ?? 0) +
            (item.shared_amount_cents ?? 0)
        )
        if (item.date !== undefined) setDate(dateH.verify(item.date).getTime())
        setType(recordTypes.find(val => val.id === item.record_type_id))
        if (item.group_id !== undefined && item.group_id !== null) setGroupId(item.group_id)
        setCategory(categories.find(cat => cat.id === item.category_id))
        setPaymentMethod(paymentMethods.find(pay => pay.id === item.payment_method_id))
        setFixedId(item.fixed_id ?? undefined)
        setSavingId(null)
        const loadPaidMethod = async () => {
            const paidCredit = item.paid_credit_id
                ? await fetchPaidCreditById(item.paid_credit_id)
                : null
            const paymentMethodId = item.paid_method_id ?? paidCredit?.payment_method_id
            setToPayMethod(paymentMethods.find(pay => pay.id === paymentMethodId))
        }

        loadPaidMethod().catch((error) => {
            console.error("Error al cargar el método de pago del crédito:", error)
            showToast({ message: t('toast.error'), type: 'error' })
        })
    }, [item, recordTypes, paymentMethods, categories])

    useEffect(() => {
        if (type?.effect !== '-') setSavingId(null)
    }, [type?.effect])

    useEffect(() => {
        if (savingId == null) return
        setParticipants([])
        setPaidByPersonId(null)
        setPaidScope('full')
        setFixedPaidMode('me_full')
    }, [savingId])

    const closeModal = () => setVisible(false)

    const typeOptions = recordTypes.flatMap(val =>
        typeof val.id === 'number' ? [{ label: val.type_name, value: val.id }] : []
    )
    const categoryOptions = categories.flatMap(cat =>
        typeof cat.id === 'number' ? [{ label: cat.category_name, value: cat.id }] : []
    )
    const paymentOptions = paymentMethods.flatMap(pay =>
        typeof pay.id === 'number' ? [{ label: pay.method_name, value: pay.id }] : []
    )
    const savingOptions = savings.flatMap(saving =>
        typeof saving.id === 'number'
            ? [{ label: saving.saving_name, value: saving.id }]
            : []
    )
    const selectedSaving = savings.find((saving) => saving.id === savingId)

    const sharingLocked = sharingSource === 'financing' || sharingSource === 'saving';
    const isFixed = sharingSource === 'fixed' || fixed_id !== undefined;
    const sharingAvailable =
        !sharingLocked &&
        type?.effect === '-' &&
        type?.id !== paymentCreditType;

    const computed = computeRecordShares(totalCents, participants);
    const ownCents = sharingLocked
        ? item?.own_amount_cents ?? item?.amount ?? totalCents
        : computed.ownCents;
    const sharedCents = sharingLocked
        ? item?.shared_amount_cents ?? 0
        : computed.sharedCents;
    const paidByMeCents =
        paidByPersonId == null
            ? paidScope === 'own'
                ? ownCents
                : ownCents + sharedCents
            : 0;

    const personName = (personId: number | null) =>
        personId == null
            ? t('shared.paidByMe')
            : people.find((person) => person.id === personId)?.name ??
              t('shared.deletedPerson');

    const participantOptions = participants.flatMap((participant) =>
        (participant.shareMode === 'amount'
            ? (participant.shareAmountCents ?? 0) > 0
            : participant.sharePercent > 0) &&
        people.some((person) => person.id === participant.personId)
            ? [{
                label:
                    people.find((person) => person.id === participant.personId)?.name ??
                    t('shared.deletedPerson'),
                value: participant.personId,
            }]
            : []
    );

    const updateParticipants = (next: ParticipantDraft[]) => {
        setParticipants(next)
        if (next.some((participant) =>
            participant.shareMode === 'amount'
                ? (participant.shareAmountCents ?? 0) > 0
                : participant.sharePercent > 0
        )) {
            setSavingId(null)
        }
        if (
            paidByPersonId != null &&
            !next.some(
                (participant) =>
                    participant.personId === paidByPersonId &&
                    (participant.shareMode === 'amount'
                        ? (participant.shareAmountCents ?? 0) > 0
                        : participant.sharePercent > 0)
            )
        ) {
            setPaidByPersonId(null)
            setPaidScope('full')
            setFixedPaidMode('me_full')
        }
    }

    const onFixedPaidModeChange = (mode: FixedPaidMode) => {
        setFixedPaidMode(mode)
        if (mode === 'me_own') {
            setPaidByPersonId(null)
            setPaidScope('own')
            return
        }
        setPaidScope('full')
        if (mode === 'person_full') {
            setPaidByPersonId(participantOptions[0]?.value ?? null)
        } else {
            setPaidByPersonId(null)
        }
    }

    const onSave = async () => {
        if (!group || !sharingLoaded) return

        if (
            hasCreditCardSavingConflict({
                savingId: savingId ?? item?.saving_id ?? null,
                paymentMethod: payment_method,
            })
        ) {
            showToast({ message: t('savings.records.creditCardConflict'), type: 'warning' })
            return
        }

        const requiresPayment = paidByMeCents > 0;
        if (
            participants.some(
                (participant) =>
                    participant.shareMode === 'amount' &&
                    (participant.shareAmountCents ?? 0) <= 0
            )
        ) {
            showToast({ message: t('shared.amountRequired'), type: 'warning' })
            return
        }
        if (
            totalCents <= 0 ||
            !category?.id ||
            !type?.id ||
            (requiresPayment && !payment_method?.id) ||
            (requiresPayment && type.id === paymentCreditType && !to_pay_method?.id)
        ) {
            showToast({ message: t('toast.empty'), type: 'warning' })
            return
        }

        try {
            const paidCredit: Insertable<PaidCredit> | null =
                requiresPayment && type.id === paymentCreditType && to_pay_method?.id
                    ? {
                        group_id,
                        amount: paidByMeCents,
                        date,
                        payment_method_id: to_pay_method.id,
                    }
                    : null

            const newItem: Insertable<RecordEntry> = {
                date,
                group_id,
                record_name: name.length < 1 ? category.category_name : name,
                record_type_id: type.id,
                amount: ownCents,
                own_amount_cents: ownCents,
                shared_amount_cents: sharedCents,
                paid_by_person_id: paidByPersonId,
                paid_scope: paidScope,
                category_id: category.id,
                payment_method_id: paidByPersonId == null ? payment_method?.id ?? null : null,
                fixed_id,
                saving_id: savingId ?? item?.saving_id ?? null,
            }

            await saveRecord({
                record: newItem,
                recordId: item?.id,
                paidCredit,
                paidCreditId: item?.paid_credit_id ?? null,
                savingId: item?.id ? null : savingId,
                participants:
                    sharingLocked || isFixed
                        ? undefined
                        : participants,
            })

            if (item?.id) {
                showToast({ message: t('toast.edited'), type: 'success' })
            } else {
                showToast({ message: t('toast.added'), type: 'success' })
                setName("")
                setTotalCents(0)
                setParticipants([])
                setPaidByPersonId(null)
                setPaidScope('full')
                setFixedPaidMode('me_full')
                setSavingId(null)
            }

            const records = await fetchRecords(group_id)
            const credits = await fetchPaidCreditsByGroup(group_id)
            setRecords(records ?? [])
            setPaidCredits(credits)
            closeModal()
        } catch (e) {
            console.error("Error al guardar el registro:", e)
            const message = e instanceof Error ? e.message : ''
            showToast({
                message:
                    message === 'SAVING_INSUFFICIENT_FUNDS'
                        ? t('savings.movement.insufficient')
                        : message === 'CREDIT_CARD_SAVING_CONFLICT'
                            ? t('savings.records.creditCardConflict')
                            : message === 'RECORD_SHARES_MISMATCH' ||
                            message === 'SHARED_PAYER_NOT_PARTICIPANT'
                            ? t('shared.invalidTotal')
                            : message === 'SHARED_PERSON_NOT_FOUND'
                                ? t('shared.personRequired')
                                : t('toast.error'),
                type: 'error',
            })
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
                title={item ? t('item.edit') : t('item.add')}
                closeLabel={t('item.cancel')}
                scrollable
                footer={
                    <View style={styles.footer}>
                        <Button
                            label={t('item.cancel')}
                            variant='outline'
                            onPress={closeModal}
                            style={styles.footerButton}
                        />
                        <Button
                            label={t('item.save')}
                            onPress={onSave}
                            disabled={!sharingLoaded}
                            style={styles.footerButton}
                        />
                    </View>
                }
            >
                <View style={styles.form}>
                    <TextField
                        label={t('item.name')}
                        value={name}
                        onChangeText={setName}
                        placeholder={t('item.name')}
                    />
                    <SelectField<number>
                        label={t('item.type')}
                        required
                        value={type?.id}
                        title={t('item.type')}
                        options={typeOptions}
                        onChange={(id) => setType(recordTypes.find(val => val.id === id))}
                        renderValue={(option) => (
                            <ColoredSelectOption
                                color={type?.record_color}
                                label={option?.label ?? t('item.type')}
                            />
                        )}
                        renderOption={(option) => (
                            <ColoredSelectOption
                                color={recordTypes.find(val => val.id === option.value)?.record_color}
                                label={option.label}
                            />
                        )}
                    />
                    <SelectField<number>
                        label={t('item.category')}
                        required
                        value={category?.id}
                        title={t('item.selectCategory')}
                        options={categoryOptions}
                        onChange={(id) => setCategory(categories.find(cat => cat.id === id))}
                    />
                    {paidByPersonId == null ? (
                        <SelectField<number>
                            label={t('item.payment')}
                            required
                            value={payment_method?.id}
                            title={t('item.selectPayment')}
                            options={paymentOptions}
                            onChange={(id) => setPaymentMethod(paymentMethods.find(pay => pay.id === id))}
                            renderValue={(option) => (
                                <ColoredSelectOption
                                    color={payment_method?.PaymentTypes?.payment_color}
                                    label={option?.label ?? t('item.selectPayment')}
                                />
                            )}
                            renderOption={(option) => (
                                <ColoredSelectOption
                                    color={paymentMethods.find(pay => pay.id === option.value)?.PaymentTypes?.payment_color}
                                    label={option.label}
                                />
                            )}
                        />
                    ) : null}
                    {type?.id === paymentCreditType && paidByPersonId == null ? (
                        <SelectField<number>
                            label={t('item.toPay')}
                            required
                            value={to_pay_method?.id}
                            title={t('item.selectToPay')}
                            options={paymentOptions}
                            onChange={(id) => setToPayMethod(paymentMethods.find(pay => pay.id === id))}
                            renderValue={(option) => (
                                <ColoredSelectOption
                                    color={to_pay_method?.PaymentTypes?.payment_color}
                                    label={option?.label ?? t('item.selectToPay')}
                                />
                            )}
                            renderOption={(option) => (
                                <ColoredSelectOption
                                    color={paymentMethods.find(pay => pay.id === option.value)?.PaymentTypes?.payment_color}
                                    label={option.label}
                                />
                            )}
                        />
                    ) : null}
                    <MoneyField
                        label={participants.length > 0 ? t('shared.totalPurchase') : t('item.value')}
                        required
                        value={totalCents}
                        onChangeCents={setTotalCents}
                    />

                    {sharingLocked ? (
                        <InlineMessage variant='info' message={t('shared.managedRecordHint')} />
                    ) : sharingAvailable ? (
                        <>
                            {isFixed ? (
                                <Surface variant='muted' padding='md'>
                                    <AppText variant='caption' color='muted'>
                                        {participants.length > 0
                                            ? participants
                                                .map((participant) =>
                                                    `${personName(participant.personId)} ${
                                                        participant.shareMode === 'amount'
                                                            ? formatMoneyWithSymbol(participant.shareAmountCents ?? 0)
                                                            : `${participant.sharePercent.toFixed(0)}%`
                                                    }`
                                                )
                                                .join(' · ')
                                            : t('shared.noPeople')}
                                    </AppText>
                                </Surface>
                            ) : (
                                <SharedParticipantsField
                                    people={people}
                                    value={participants}
                                    onChange={updateParticipants}
                                    totalCents={totalCents}
                                />
                            )}

                            {participants.length > 0 ? (
                                isFixed ? (
                                    <>
                                        <SelectField<FixedPaidMode>
                                            label={t('shared.paidBy')}
                                            value={fixedPaidMode}
                                            options={[
                                                { label: t('shared.fixedPaidFull'), value: 'me_full' },
                                                { label: t('shared.fixedPaidOwnShare'), value: 'me_own' },
                                                ...(participantOptions.length > 0
                                                    ? [{
                                                        label: t('shared.fixedPaidByOther'),
                                                        value: 'person_full' as FixedPaidMode,
                                                    }]
                                                    : []),
                                            ]}
                                            onChange={onFixedPaidModeChange}
                                        />
                                        {fixedPaidMode === 'person_full' && participantOptions.length > 0 ? (
                                            <SelectField<number>
                                                label={t('shared.person')}
                                                value={paidByPersonId ?? undefined}
                                                options={participantOptions}
                                                onChange={(personId) => setPaidByPersonId(personId)}
                                            />
                                        ) : null}
                                    </>
                                ) : (
                                    <SelectField<number>
                                        label={t('shared.paidBy')}
                                        value={paidByPersonId ?? 0}
                                        options={[
                                            { label: t('shared.paidByMe'), value: 0 },
                                            ...participantOptions,
                                        ]}
                                        onChange={(personId) =>
                                            setPaidByPersonId(personId === 0 ? null : personId)
                                        }
                                    />
                                )
                            ) : null}

                            {paidByPersonId != null ? (
                                <InlineMessage variant='info' message={t('shared.payerHint')} />
                            ) : null}
                        </>
                    ) : null}

                    {participants.length > 0 ? (
                        <Surface variant='muted' padding='md'>
                            <AppText variant='caption' color='muted'>
                                {t('shared.total')}:{' '}
                                {formatMoneyWithSymbol(totalCents)}
                            </AppText>
                            <AppText variant='caption' color='muted'>
                                {t('shared.own')}:{' '}
                                {formatMoneyWithSymbol(ownCents)}
                            </AppText>
                            <AppText variant='caption' color='muted'>
                                {t('shared.totalShared')}:{' '}
                                {formatMoneyWithSymbol(sharedCents)}
                            </AppText>
                        </Surface>
                    ) : null}

                    {item?.saving_id ? (
                        <AppText variant='caption' color='muted'>
                            {t('savings.records.paidWith')}: {item.saving_name ?? ''}
                        </AppText>
                    ) : null}
                    {!item?.id &&
                    type?.effect === '-' &&
                    type.id !== paymentCreditType &&
                    participants.length === 0 &&
                    savingOptions.length > 0 ? (
                        <>
                            <SelectField<number>
                                label={t('savings.records.source')}
                                value={savingId ?? 0}
                                options={[
                                    { label: t('savings.records.sourceMonthly'), value: 0 },
                                    ...savingOptions,
                                ]}
                                onChange={(id) => setSavingId(id === 0 ? null : id)}
                            />
                            {selectedSaving ? (
                                <AppText variant='caption' color='muted'>
                                    {t('savings.records.available')}:{' '}
                                    {formatMoneyWithSymbol(selectedSaving.amount)}
                                </AppText>
                            ) : null}
                            {hasCreditCardSavingConflict({
                                savingId: savingId ?? item?.saving_id ?? null,
                                paymentMethod: payment_method,
                            }) ? (
                                <InlineMessage
                                    variant='warning'
                                    message={t('savings.records.creditCardConflict')}
                                />
                            ) : null}
                        </>
                    ) : null}
                    <DateField
                        label={t('item.date')}
                        value={date}
                        onChange={setDate}
                    />
                    {periodSuggestion ? (
                        <InlineMessage
                            variant='info'
                            message={t('records.periodSuggestion', {
                                group: periodSuggestion.group.group_name,
                                period: formatPeriodRange(
                                    periodSuggestion.period,
                                    language
                                ),
                            })}
                        />
                    ) : null}
                    {item?.fixed_id != null && item?.id == null ? (
                        <InlineMessage
                            variant='info'
                            message={t('item.fixedPendingDateHint')}
                        />
                    ) : null}
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

export default AddItem
