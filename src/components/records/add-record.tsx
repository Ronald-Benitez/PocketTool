import React, { useState, useEffect } from "react";
import { View, ScrollView, Pressable, Text, StyleSheet } from "react-native";

import { useLanguage } from "@/src/lang/LanguageContext";
import { useRecords } from "@/src/db/handlers/RecordsHandler";
import useDate from "@/src/hooks/useDate";
import useToast from "@/src/hooks/useToast";
import useRecordsStore from '@/src/stores/RecordsStore';
import ModalContainer from "../ui/modal-container";
import InputLabel from "../ui/InputLabel";
import BaseSelect from "../ui/base-select";
import LabelBlock from "../ui/LabelBlock";
import useAndroidToast from "@/src/hooks/useAndroidToast";
import DatePicker from "../ui/date-picker";
import { useHandler } from "@/src/db/handlers/handler";
import { PaymentMethodsJoined, useDataStore } from "@/src/stores";
import { Records, Categories, PaymentMethods, PaymentTypes, RecordTypes, RecordJoined, PaidCredits } from "@/src/db/types/tables";
import styles from '@/src/styles/styles';
import BorderLeftBlock from '@/src/components/ui/BorderLeftBlock';
import useConfigs from "@/src/hooks/useConfigs";

interface AddItemProps {
    item?: RecordJoined | Records
    children?: React.ReactNode
    openUpdate?: boolean
    open?: boolean
}

const AddItem = ({ item, children, openUpdate, open }: AddItemProps) => {
    const { setRecords, group, setPaidCredits } = useRecordsStore()
    const dateH = useDate()
    const { t } = useLanguage()
    const [name, setName] = useState<string>("")
    const [date, setDate] = useState(new Date().getTime())
    const [type, setType] = useState<RecordTypes>()
    const [payment_method, setPaymentMethod] = useState<PaymentMethodsJoined>()
    const [to_pay_method, setToPayMethod] = useState<PaymentMethodsJoined>()
    const [category, setCategory] = useState<Categories>()
    const [value, setValue] = useState<string>("")
    const [group_id, setGroupId] = useState<number>(group?.id || 0)
    const { fetchRecords, handler: recordsHandler } = useRecords()
    const { ToastContainer, showToast } = useToast()
    const toast = useAndroidToast()
    const { RecordTypes, PaymentMethods, Categories } = useDataStore()
    const handler = useHandler('PaidCredits')
    const { configs: { paymentCreditType } } = useConfigs()

    useEffect(() => {
        if (!group?.id) return
        setGroupId(group.id)
    }, [group])

    useEffect(() => {
        if (!item) return
        setName(item.record_name)
        setValue(String(item.amount))
        setDate(dateH.verify(item.date).getTime())
        setType(RecordTypes?.find(val => val.id == item.record_type_id))
        setGroupId(item.group_id)
        setCategory(Categories?.find(cat => cat.id == item.category_id))
        setPaymentMethod(PaymentMethods?.find(pay => pay.id == item.payment_method_id))
        if (item?.paid_method_id) {
            setToPayMethod(PaymentMethods?.find(pay => pay.id == item.paid_method_id))
        }
    }, [item])

    const paidCreditTransactions = () => {

    }

    const onSave = async () => {
        if (!group) return

        if (value === "" || !payment_method?.id || !category?.id || !type?.id || (type.id == paymentCreditType && !to_pay_method?.id)) {
            toast.emptyMessage()
            return
        }

        const newItem: Records = {
            date,
            group_id,
            record_name: name.length < 1 ? category?.category_name : name,
            record_type_id: type.id,
            amount: Number(value),
            category_id: category?.id as number,
            payment_method_id: payment_method?.id as number,
        }

        const payment: PaidCredits = {
            group_id,
            amount: Number(value),
            date,
            payment_method_id: to_pay_method?.id || 0,
        }

        try {
            if (item?.id) {
                newItem.id = item.id
                let paid_credit_id = undefined
                if (type.id == paymentCreditType && to_pay_method?.id && !item.paid_credit_id) {
                    const res = await handler.add(payment)
                    paid_credit_id = res?.lastInsertRowId
                } else if (type.id == paymentCreditType && to_pay_method?.id && item.paid_credit_id) {
                    payment.id = item.paid_credit_id
                    paid_credit_id = item.paid_credit_id
                    await handler.edit(payment)
                } else if (type.id != paymentCreditType && item.paid_credit_id) {
                    payment.id = item.paid_credit_id
                    await handler.deleteById(item.paid_credit_id)
                }
                newItem.paid_credit_id = paid_credit_id
                await recordsHandler.edit(newItem)
                toast.editedMessage()
            } else {
                let paid_credit_id = undefined
                if (type.id == paymentCreditType && to_pay_method?.id) {
                    const res = await handler.add(payment)
                    paid_credit_id = res?.lastInsertRowId
                }
                newItem.paid_credit_id = paid_credit_id
                const res = await recordsHandler.add(newItem)
                toast.addedMessage()
                setName("")
                setValue("")
            }
            const records = await fetchRecords(group_id)
            const credits = await handler.fetchWithWhere("group_id", String(group_id)) as PaidCredits[]
            setRecords(records)
            setPaidCredits(credits)

            // setResumes(await records.getAllResume(group_id))
        } catch (e) {
            toast.errorMessage()
            console.log(e)
        }
    }

    const onChangeCategory = (index: number) => {
        if (!Categories) return
        setCategory(Categories[index])
    }

    const onPaymentChange = (index: number) => {
        if (!PaymentMethods) return
        setPaymentMethod(PaymentMethods[index])
    }

    const onToPayChange = (index: number) => {
        if (!PaymentMethods) return
        setToPayMethod(PaymentMethods[index])
    }

    const onTypeChange = (index: number) => {
        if (!RecordTypes) return
        setType(RecordTypes[index])
    }

    const SelectTypeBlockRender = (index: number) => {
        return (
            <BorderLeftBlock color={RecordTypes[index].record_color}>
                <Text style={[styles.text]}>{RecordTypes[index].type_name}</Text>
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
            <BorderLeftBlock color={PaymentMethods[index].payment_color}>
                <Text style={[styles.text]}>{PaymentMethods[index].method_name}</Text>
            </BorderLeftBlock>
        )
    }

    const SelectedPaymentBlockRender = ({ payment }: { payment: PaymentMethodsJoined | undefined }) => {
        return (
            <BorderLeftBlock color={payment?.payment_color || "#000"}>
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
                    <View style={[localStyles.colContainer, { width: "100%", height: "100%" }]}>
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
                                options={RecordTypes?.map(val => val.type_name)}
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
                                options={Categories?.map(cat => cat.category_name)}
                                title={t('item.selectCategory')}
                            />
                        </View>

                        <View style={localStyles.inputContainer}>
                            <BaseSelect
                                label={t('item.payment') + '*'}
                                selected={payment_method?.method_name}
                                onChange={onPaymentChange}
                                options={PaymentMethods?.map(pay => pay.method_name)}
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
                                        options={PaymentMethods?.map(pay => pay.method_name)}
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