import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";

import { useLanguage } from "@/src/lang/LanguageContext";
import useDate from "@/src/hooks/useDate";
import useToast from "@/src/hooks/useToast";
import useRecordsStore from '@/src/stores/RecordsStore';
import ModalContainer from "../ui/modal-container";
import InputLabel from "../ui/InputLabel";
import BaseSelect from "../ui/base-select";
import LabelBlock from "../ui/LabelBlock";
import useAndroidToast from "@/src/hooks/useAndroidToast";
import DatePicker from "../ui/date-picker";
import { usePaidCredits, usePaymentMethods, useRecords, useTableRepository } from "@/src/db";
import type {
    Category,
    Insertable,
    PaidCredit,
    PaymentMethodWithRelations,
    RecordEntry,
    RecordFormEntry,
    RecordType
} from "@/src/interfaces/schema";
import styles from '@/src/styles/styles';
import BorderLeftBlock from '@/src/components/ui/BorderLeftBlock';
import useConfigs from "@/src/hooks/useConfigs";
import { centsToInput, parseMoneyToCents } from "@/src/utils";

interface AddItemProps {
    item?: RecordFormEntry
    children?: React.ReactNode
    openUpdate?: boolean
    open?: boolean
}

const AddItem = ({ item, children, open }: AddItemProps) => {
    const { setRecords, group, setPaidCredits } = useRecordsStore()
    const dateH = useDate()
    const { t } = useLanguage()
    const [name, setName] = useState<string>("")
    const [date, setDate] = useState(new Date().getTime())
    const [type, setType] = useState<RecordType>()
    const [payment_method, setPaymentMethod] = useState<PaymentMethodWithRelations>()
    const [to_pay_method, setToPayMethod] = useState<PaymentMethodWithRelations>()
    const [category, setCategory] = useState<Category>()
    const [fixed_id, setFixedId] = useState<number | undefined>(undefined)
    const [value, setValue] = useState<string>("")
    const [group_id, setGroupId] = useState<number>(group?.id || 0)
    const { ToastContainer } = useToast()
    const toast = useAndroidToast()
    const [recordTypes, setRecordTypes] = useState<RecordType[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodWithRelations[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const { fetchRecords, saveRecord, fetchPaidCreditsByGroup } = useRecords()
    const { fetchById: fetchPaidCreditById } = usePaidCredits()
    const { fetchPaymentMethods } = usePaymentMethods()
    const recordTypesRepository = useTableRepository("RecordTypes")
    const categoriesRepository = useTableRepository("Categories")
    const { configs: { paymentCreditType } } = useConfigs()

    useEffect(() => {
        const loadOptions = async () => {
            const [loadedRecordTypes, loadedPaymentMethods, loadedCategories] = await Promise.all([
                recordTypesRepository.fetchAll(),
                fetchPaymentMethods(),
                categoriesRepository.fetchAll()
            ])
            setRecordTypes(loadedRecordTypes)
            setPaymentMethods(loadedPaymentMethods)
            setCategories(loadedCategories)
        }

        loadOptions().catch((error) => {
            console.error("Error al cargar opciones de registros:", error)
            toast.errorMessage()
        })
    }, [])

    useEffect(() => {
        if (!group?.id) return
        setGroupId(group.id)
    }, [group])

    useEffect(() => {
        if (!item) return
        setName(item.record_name ?? "")
        setValue(item.amount === undefined ? "" : centsToInput(item.amount))
        if (item.date !== undefined) setDate(dateH.verify(item.date).getTime())
        setType(recordTypes.find(val => val.id === item.record_type_id))
        if (item.group_id !== undefined && item.group_id !== null) setGroupId(item.group_id)
        setCategory(categories.find(cat => cat.id === item.category_id))
        setPaymentMethod(paymentMethods.find(pay => pay.id === item.payment_method_id))
        setFixedId(item.fixed_id ?? undefined)
        const loadPaidMethod = async () => {
            const paidCredit = item.paid_credit_id
                ? await fetchPaidCreditById(item.paid_credit_id)
                : null
            const paymentMethodId = item.paid_method_id ?? paidCredit?.payment_method_id
            setToPayMethod(paymentMethods.find(pay => pay.id === paymentMethodId))
        }

        loadPaidMethod().catch((error) => {
            console.error("Error al cargar el método de pago del crédito:", error)
            toast.errorMessage()
        })
    }, [item, recordTypes, paymentMethods, categories])

    const onSave = async () => {
        if (!group) return

        if (value === "" || !payment_method?.id || !category?.id || !type?.id || (type.id == paymentCreditType && !to_pay_method?.id)) {
            toast.emptyMessage()
            return
        }

        try {
            const paidCredit: Insertable<PaidCredit> | null =
                type.id === paymentCreditType && to_pay_method?.id
                    ? {
                        group_id,
                        amount: parseMoneyToCents(value),
                        date,
                        payment_method_id: to_pay_method.id,
                    }
                    : null

            const newItem: Insertable<RecordEntry> = {
                date,
                group_id,
                record_name: name.length < 1 ? category.category_name : name,
                record_type_id: type.id,
                amount: parseMoneyToCents(value),
                category_id: category.id,
                payment_method_id: payment_method.id,
                fixed_id,
            }

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
                setValue("")
            }

            const records = await fetchRecords(group_id)
            const credits = await fetchPaidCreditsByGroup(group_id)
            setRecords(records ?? [])
            setPaidCredits(credits)
        } catch (e) {
            console.error("Error al guardar el registro:", e)
            toast.errorMessage()
        }
    }

    const onChangeCategory = (index: number) => {
        setCategory(categories[index])
    }

    const onPaymentChange = (index: number) => {
        setPaymentMethod(paymentMethods[index])
    }

    const onToPayChange = (index: number) => {
        setToPayMethod(paymentMethods[index])
    }

    const onTypeChange = (index: number) => {
        setType(recordTypes[index])
    }

    const SelectTypeBlockRender = (index: number) => {
        return (
            <BorderLeftBlock color={recordTypes[index].record_color || "#000"}>
                <Text style={[styles.text]}>{recordTypes[index].type_name}</Text>
            </BorderLeftBlock>
        )
    }

    const SelectedTypeBlockRender = () => {
        return (
            <BorderLeftBlock color={type?.record_color || "#000"}>
                <Text style={[styles.text]}>{type?.type_name || t('item.type')}</Text>
            </BorderLeftBlock>
        )
    }

    const SelectPaymentBlockRender = (index: number) => {
        return (
            <BorderLeftBlock color={paymentMethods[index].PaymentTypes?.payment_color || "#000"}>
                <Text style={[styles.text]}>{paymentMethods[index].method_name}</Text>
            </BorderLeftBlock>
        )
    }

    const SelectedPaymentBlockRender = ({ payment }: { payment: PaymentMethodWithRelations | undefined }) => {
        return (
            <BorderLeftBlock color={payment?.PaymentTypes?.payment_color || "#000"}>
                <Text style={[styles.text]}>{payment?.method_name || t('item.selectPayment')}</Text>
            </BorderLeftBlock>
        )
    }

    return (
        <>
            <ModalContainer
                buttonOpen={children}
                closeOnAccept={true}
                type="complete"
                onAccept={onSave}
                title={item ? t('item.edit') : t('item.add')}
                open={open}
            >
                <ScrollView style={{ flex: 1 }}>
                    <View style={[localStyles.colContainer, { width: "100%"}]}>
                        <View style={localStyles.inputContainer}>
                            <InputLabel
                                value={name}
                                onChangeText={setName}
                                placeholder={t('item.name')}
                            />
                        </View>
                        <View style={localStyles.inputContainer}>
                            <BaseSelect
                                label={t('item.type') + '*'}
                                selected={type?.type_name}
                                onChange={onTypeChange}
                                options={recordTypes.map(val => val.type_name)}
                                title={t('item.type')}
                                render={SelectTypeBlockRender}

                            >
                                <SelectedTypeBlockRender />
                            </BaseSelect>
                        </View>

                        <View style={localStyles.inputContainer}>
                            <BaseSelect
                                label={t('item.category') + '*'}
                                selected={category?.category_name}
                                onChange={onChangeCategory}
                                options={categories.map(cat => cat.category_name)}
                                title={t('item.selectCategory')}
                            />
                        </View>

                        <View style={localStyles.inputContainer}>
                            <BaseSelect
                                label={t('item.payment') + '*'}
                                selected={payment_method?.method_name}
                                onChange={onPaymentChange}
                                options={paymentMethods.map(pay => pay.method_name)}
                                title={t('item.selectPayment')}
                                render={SelectPaymentBlockRender}
                            >
                                <SelectedPaymentBlockRender payment={payment_method} />
                            </BaseSelect>
                        </View>
                        {
                            paymentCreditType == type?.id ? (
                                <View style={localStyles.inputContainer}>
                                    <BaseSelect
                                        label={t('item.toPay') + '*'}
                                        selected={to_pay_method?.method_name}
                                        onChange={onToPayChange}
                                        options={paymentMethods.map(pay => pay.method_name)}
                                        title={t('item.selectToPay')}
                                        render={SelectPaymentBlockRender}
                                    >
                                        <SelectedPaymentBlockRender payment={to_pay_method} />
                                    </BaseSelect>
                                </View>
                            ) : null
                        }
                        <View style={localStyles.inputContainer}>
                            <InputLabel
                                value={value}
                                onChangeText={setValue}
                                placeholder={t('item.value') + '*'}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={localStyles.inputContainer}>
                            <LabelBlock label={t('item.date')}>
                                <DatePicker buttonText={dateH.getStringDate(date)} value={date} onChange={setDate} />
                            </LabelBlock>
                        </View>
                    </View>
                </ScrollView>
                <ToastContainer />
            </ModalContainer>
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

export default AddItem