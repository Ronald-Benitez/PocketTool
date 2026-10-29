import React, { useState, useEffect, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useLanguage } from "@/src/lang/LanguageContext";
import { useToast } from "@/src/ui/feedback/ToastProvider";
import useRecordsStore from '@/src/stores/RecordsStore';
import { useFixeds } from "@/src/db";
import { useDataStore } from "@/src/stores";
import type {
    Category,
    FixedRecord,
    FixedView,
    Insertable,
    PaymentMethodWithRelations,
    RecordType,
} from "@/src/interfaces/schema";
import { Button } from "@/src/ui/actions/Button";
import { ColoredSelectOption } from "@/src/ui/forms/ColoredSelectOption";
import { MoneyField } from "@/src/ui/forms/MoneyField";
import { SelectField } from "@/src/ui/forms/SelectField";
import { TextField } from "@/src/ui/forms/TextField";
import { Modal } from "@/src/ui/overlays/Modal";

interface AddItemProps {
    item?: FixedView | FixedRecord
    children?: React.ReactNode
    openUpdate?: boolean
    open?: boolean
}

const AddFixed = ({ item, children, open }: AddItemProps) => {
    const { group } = useRecordsStore()
    const { t } = useLanguage()
    const [visible, setVisible] = useState(false)
    const [name, setName] = useState<string>("")
    const [day, setDay] = useState(1)
    const [type, setType] = useState<RecordType>()
    const [payment_method, setPaymentMethod] = useState<PaymentMethodWithRelations>()
    const [category, setCategory] = useState<Category>()
    const [amountCents, setAmountCents] = useState<number>(0)
    const { showToast } = useToast()
    const { RecordTypes, PaymentMethods, Categories, setFixeds } = useDataStore()
    const { fetchFixeds, handler: fixedsHandler } = useFixeds()
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
        if (!item) return
        setName(item.fixed_name)
        setAmountCents(item.fixed_amount)
        setDay(item.fixed_day)
        setType(recordTypes.find(val => val.id === item.record_type_id))
        setCategory(categories.find(cat => cat.id === item.category_id))
        setPaymentMethod(paymentMethods.find(pay => pay.id === item.payment_method_id))
    }, [item])

    const closeModal = () => setVisible(false)

    const onSave = async () => {
        if (!group) return

        if (amountCents <= 0 || !payment_method?.id || !category?.id || !type?.id) {
            showToast({ message: t('toast.empty'), type: 'warning' })
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
            if (item?.id) {
                await fixedsHandler.edit({ ...newItem, id: item.id })
                showToast({ message: t('toast.edited'), type: 'success' })
            } else {
                await fixedsHandler.add(newItem)
                showToast({ message: t('toast.added'), type: 'success' })
                setName("")
                setAmountCents(0)
            }
            const fixeds = await fetchFixeds()
            setFixeds(fixeds)
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
                    <MoneyField
                        label={t('item.value')}
                        required
                        value={amountCents}
                        onChangeCents={setAmountCents}
                    />
                    <TextField
                        label={t('item.date')}
                        value={String(day)}
                        onChangeText={onDayChange}
                        keyboardType='number-pad'
                        maxLength={2}
                        placeholder={t('item.date')}
                        hint={t('item.dayHint')}
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
