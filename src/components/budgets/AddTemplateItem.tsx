import React, { useState, useEffect, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useLanguage } from "@/src/lang/LanguageContext";
import { useRecords } from "@/src/db";
import useDate from "@/src/hooks/useDate";
import useRecordsStore from "@/src/stores/RecordsStore";
import useAndroidToast from "@/src/hooks/useAndroidToast";
import { useDataStore } from "@/src/stores";
import type {
    Category,
    Insertable,
    PaidCredit,
    PaymentMethodWithRelations,
    RecordEntry,
    RecordFormEntry,
    RecordType,
} from "@/src/interfaces/schema";
import { useConfigs } from "@/src/hooks/useConfigs";
import { Button } from "@/src/ui/actions/Button";
import { ColoredSelectOption } from "@/src/ui/forms/ColoredSelectOption";
import { DateField } from "@/src/ui/forms/DateField";
import { MoneyField } from "@/src/ui/forms/MoneyField";
import { SelectField } from "@/src/ui/forms/SelectField";
import { TextField } from "@/src/ui/forms/TextField";
import { Modal } from "@/src/ui/overlays/Modal";

interface AddItemProps {
    item?: RecordFormEntry
    children?: React.ReactNode
    openUpdate?: boolean
    open?: boolean
}

const AddTemplateItem = ({ item, children, open }: AddItemProps) => {
    const { setRecords, group, setPaidCredits } = useRecordsStore()
    const dateH = useDate()
    const { t } = useLanguage()
    const [visible, setVisible] = useState(false)
    const [name, setName] = useState<string>("")
    const [date, setDate] = useState(new Date().getTime())
    const [type, setType] = useState<RecordType>()
    const [payment_method, setPaymentMethod] = useState<PaymentMethodWithRelations>()
    const [to_pay_method, setToPayMethod] = useState<PaymentMethodWithRelations>()
    const [category, setCategory] = useState<Category>()
    const [fixed_id, setFixedId] = useState<number | undefined>(undefined)
    const [amountCents, setAmountCents] = useState<number>(0)
    const [group_id, setGroupId] = useState<number>(group?.id || 0)
    const { fetchRecords, saveRecord, fetchPaidCreditsByGroup } = useRecords()
    const toast = useAndroidToast()
    const { RecordTypes, PaymentMethods, Categories } = useDataStore()
    const { configs: { paymentCreditType } } = useConfigs()
    const firstOpenEffect = useRef(true)

    const recordTypes = RecordTypes ?? []
    const paymentMethods = PaymentMethods ?? []
    const categories = Categories ?? []

    useEffect(() => {
        if (firstOpenEffect.current) {
            firstOpenEffect.current = false
            return
        }
        setVisible(true)
    }, [open])

    useEffect(() => {
        if (!group?.id) return
        setGroupId(group.id)
    }, [group])

    useEffect(() => {
        if (!item) return
        setName(item.record_name ?? "")
        setAmountCents(item.amount ?? 0)
        if (item.date !== undefined) setDate(dateH.verify(item.date).getTime())
        setType(recordTypes.find(val => val.id === item.record_type_id))
        setGroupId(item.group_id ?? group?.id ?? 0)
        setCategory(categories.find(cat => cat.id === item.category_id))
        setPaymentMethod(paymentMethods.find(pay => pay.id === item.payment_method_id))
        setFixedId(item.fixed_id ?? undefined)
        if (item?.paid_method_id) {
            setToPayMethod(paymentMethods.find(pay => pay.id === item.paid_method_id))
        }
    }, [item, recordTypes, paymentMethods, categories])

    const closeModal = () => setVisible(false)

    const onSave = async () => {
        if (!group) return

        if (
            amountCents <= 0 ||
            !payment_method?.id ||
            !category?.id ||
            !type?.id ||
            (type.id === paymentCreditType && !to_pay_method?.id)
        ) {
            toast.emptyMessage()
            return
        }

        const newItem: Insertable<RecordEntry> = {
            date,
            group_id,
            record_name: name.trim().length < 1 ? category.category_name : name.trim(),
            record_type_id: type.id,
            amount: amountCents,
            category_id: category.id,
            payment_method_id: payment_method.id,
            fixed_id
        }

        const paidCredit: Insertable<PaidCredit> | null =
            type.id === paymentCreditType && to_pay_method?.id
                ? {
                    group_id,
                    amount: amountCents,
                    date,
                    payment_method_id: to_pay_method.id,
                }
                : null

        try {
            await saveRecord({
                record: newItem,
                recordId: item?.id,
                paidCredit,
                paidCreditId: item?.paid_credit_id ?? null,
            })

            if (item?.id) {
                toast.editedMessage()
            } else {
                toast.addedMessage()
                setName("")
                setAmountCents(0)
            }

            const records = await fetchRecords(group_id)
            const credits = await fetchPaidCreditsByGroup(group_id)
            setRecords(records ?? [])
            setPaidCredits(credits)
            closeModal()
        } catch {
            toast.errorMessage()
        }
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
                    {type?.id === paymentCreditType ? (
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
                        label={t('item.value')}
                        required
                        value={amountCents}
                        onChangeCents={setAmountCents}
                    />
                    <DateField
                        label={t('item.date')}
                        value={date}
                        onChange={setDate}
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

export default AddTemplateItem
