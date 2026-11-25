import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useFeature } from "@/src/features";
import { useLanguage } from "@/src/lang/LanguageContext";
import { useToast } from "@/src/ui/feedback/ToastProvider";
import useRecordsStore from '@/src/stores/RecordsStore';
import { useFixeds, usePeopleRepository, useSharedParticipantsRepository } from "@/src/db";
import { useDataStore } from "@/src/stores";
import type {
    Category,
    FixedRecord,
    FixedView,
    Insertable,
    PaymentMethodWithRelations,
    Person,
    RecordType,
} from "@/src/interfaces/schema";
import type { ParticipantDraft } from "@/src/db/repositories/people";
import { computeParticipantShares } from "@/src/domain/shared/split";
import { SharedParticipantsField } from "@/src/components/shared/SharedParticipantsField";
import { Button } from "@/src/ui/actions/Button";
import { ColoredSelectOption } from "@/src/ui/forms/ColoredSelectOption";
import { MoneyField } from "@/src/ui/forms/MoneyField";
import { SelectField } from "@/src/ui/forms/SelectField";
import { TextField } from "@/src/ui/forms/TextField";
import { FormErrorSummary } from "@/src/ui/forms/FormErrorSummary";
import { Modal } from "@/src/ui/overlays/Modal";

interface AddItemProps {
    item?: FixedView | FixedRecord
    children?: React.ReactNode
    openUpdate?: boolean
    open?: boolean
    onClose?: () => void
    onSaved?: () => void
}

const AddFixed = ({ item, children, open, onClose, onSaved }: AddItemProps) => {
    const { group } = useRecordsStore()
    const { t } = useLanguage()
    const showShared = useFeature('shared')
    const [visible, setVisible] = useState(false)
    const [name, setName] = useState<string>("")
    const [day, setDay] = useState(1)
    const [type, setType] = useState<RecordType>()
    const [payment_method, setPaymentMethod] = useState<PaymentMethodWithRelations>()
    const [category, setCategory] = useState<Category>()
    const [amountCents, setAmountCents] = useState<number>(0)
    const [people, setPeople] = useState<Person[]>([])
    const [participants, setParticipants] = useState<ParticipantDraft[]>([])
    const [missingFields, setMissingFields] = useState<
        { field: string; label: string }[]
    >([])
    const { showToast } = useToast()
    const { RecordTypes, PaymentMethods, Categories, setFixeds } = useDataStore()
    const { fetchFixeds, handler: fixedsHandler } = useFixeds()
    const peopleRepository = usePeopleRepository()
    const participantsRepository = useSharedParticipantsRepository()

    const recordTypes = RecordTypes ?? []
    const paymentMethods = PaymentMethods ?? []
    const categories = Categories ?? []

    useEffect(() => {
        if (!visible) return
        let active = true
        peopleRepository.fetchPeople().then((rows) => {
            if (active) setPeople(rows)
        })
        return () => { active = false }
    }, [visible])

    useEffect(() => {
        if (open) setVisible(true)
    }, [open])

    useEffect(() => {
        if (!item) {
            setParticipants([])
            return
        }
        setName(item.fixed_name)
        setAmountCents(item.fixed_amount)
        setDay(item.fixed_day)
        setType(recordTypes.find(val => val.id === item.record_type_id))
        setCategory(categories.find(cat => cat.id === item.category_id))
        setPaymentMethod(paymentMethods.find(pay => pay.id === item.payment_method_id))
        if (!item.id) {
            setParticipants([])
            return
        }
        let active = true
        participantsRepository.fetchFor('fixed', item.id).then((rows) => {
            if (!active) return
            setParticipants(
                rows.map((row) => ({
                    personId: row.person_id,
                    sharePercent: row.share_percent,
                    shareMode: row.share_mode as 'percent' | 'amount',
                    shareAmountCents: row.share_amount_cents ?? null,
                    notes: row.notes,
                }))
            )
        })
        return () => { active = false }
    }, [item])

    const closeModal = () => {
        setVisible(false)
        setMissingFields([])
        onClose?.()
    }

    const clearMissing = (field: string) => {
        setMissingFields((current) =>
            current.filter((item) => item.field !== field)
        )
    }

    const errorFor = (field: string) =>
        missingFields.some((item) => item.field === field)
            ? t('required')
            : undefined

    const onSave = async () => {
        if (!group) return

        const nextMissing: { field: string; label: string }[] = []
        if (!type?.id) nextMissing.push({ field: 'type', label: t('item.type') })
        if (!category?.id) {
            nextMissing.push({ field: 'category', label: t('item.category') })
        }
        if (!payment_method?.id) {
            nextMissing.push({ field: 'payment', label: t('item.payment') })
        }
        if (amountCents <= 0) {
            nextMissing.push({ field: 'amount', label: t('item.value') })
        }
        if (nextMissing.length > 0) {
            setMissingFields(nextMissing)
            return
        }
        setMissingFields([])

        if (!type || !category || !payment_method) return

        const split = computeParticipantShares(amountCents, participants)
        if (
            participants.some(
                (participant) =>
                    participant.shareMode === 'amount' &&
                    (participant.shareAmountCents ?? 0) <= 0
            )
        ) {
            setMissingFields([
                { field: 'participants', label: t('shared.amountRequired') },
            ])
            return
        }
        if (split.exceedsTotal) {
            setMissingFields([
                { field: 'participants', label: t('shared.invalidTotal') },
            ])
            return
        }
        if (new Set(participants.map((participant) => participant.personId)).size !== participants.length) {
            setMissingFields([
                { field: 'participants', label: t('shared.duplicate') },
            ])
            return
        }

        const newItem: Insertable<FixedRecord> = {
            fixed_day: day,
            fixed_name: name.trim().length < 1 ? category.category_name : name.trim(),
            record_type_id: type.id,
            fixed_amount: amountCents,
            category_id: category.id,
            payment_method_id: payment_method.id,
        }

        try {
            let fixedId = item?.id
            if (item?.id) {
                await fixedsHandler.edit({ ...newItem, id: item.id })
                showToast({ message: t('toast.edited'), type: 'success' })
            } else {
                fixedId = await fixedsHandler.add(newItem)
                showToast({ message: t('toast.added'), type: 'success' })
                setName("")
                setAmountCents(0)
            }
            if (fixedId) {
                await participantsRepository.replaceFor('fixed', fixedId, participants)
            }
            const fixeds = await fetchFixeds()
            setFixeds(fixeds)
            onSaved?.()
            closeModal()
        } catch {
            showToast({ message: t('toast.error'), type: 'error' })
        }
    }

    const onDayChange = (val: string) => {
        const dayVal = Number(val.replace(/[^0-9]/g, ''))
        if (Number.isNaN(dayVal)) return
        if (dayVal < 1) {
            setDay(1)
            return
        }
        if (dayVal > 31) {
            setDay(31)
            return
        }
        setDay(dayVal)
    }

    const typeOptions = recordTypes.flatMap(val =>
        typeof val.id === 'number' ? [{ label: val.type_name, value: val.id }] : []
    )
    const categoryOptions = categories.flatMap(cat =>
        typeof cat.id === 'number' ? [{ label: cat.category_name, value: cat.id }] : []
    )
    const paymentOptions = paymentMethods.flatMap(pay =>
        typeof pay.id === 'number' ? [{ label: pay.method_name, value: pay.id }] : []
    )

    return (
        <>
            {children ? (
                <Pressable onPress={() => setVisible(true)}>{children}</Pressable>
            ) : null}
            <Modal
                visible={visible}
                onClose={closeModal}
                title={item ? t('item.edit') : t('item.add')}
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
                    <FormErrorSummary
                        errors={missingFields.map((item) => item.label)}
                    />
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
                        error={errorFor('type')}
                        onChange={(id) => {
                            setType(recordTypes.find(val => val.id === id))
                            clearMissing('type')
                        }}
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
                        error={errorFor('category')}
                        onChange={(id) => {
                            setCategory(categories.find(cat => cat.id === id))
                            clearMissing('category')
                        }}
                    />
                    <SelectField<number>
                        label={t('item.payment')}
                        required
                        value={payment_method?.id}
                        title={t('item.selectPayment')}
                        options={paymentOptions}
                        error={errorFor('payment')}
                        onChange={(id) => {
                            setPaymentMethod(paymentMethods.find(pay => pay.id === id))
                            clearMissing('payment')
                        }}
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
                    <MoneyField
                        label={t('item.value')}
                        required
                        value={amountCents}
                        error={errorFor('amount')}
                        onChangeCents={(value) => {
                            setAmountCents(value)
                            clearMissing('amount')
                        }}
                    />
                    {showShared || item ? (
                        <SharedParticipantsField
                            people={people}
                            value={participants}
                            onChange={setParticipants}
                            totalCents={amountCents}
                        />
                    ) : null}
                    <TextField
                        label={t('item.date')}
                        value={String(day)}
                        onChangeText={onDayChange}
                        keyboardType='number-pad'
                        maxLength={2}
                        placeholder={t('item.date')}
                        tooltip={{
                            title: t('item.date'),
                            body: t('item.dayHint'),
                        }}
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

export default AddFixed
