import React, { useState, useEffect } from "react";
import { View, Modal, ScrollView, Pressable, Text, TextInput, TouchableOpacity, StyleProp, TextStyle, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

import { useLanguage } from "@/src/lang/LanguageContext";
import styles from "@/src/styles/styles";
import { usePaymentMethods, useRecords, useCategories } from "@/src/db";
import { RecordI, Group, CreateRecordRequest, Category, PaymentMethod } from "@/src/interfaces";
import useDate from "@/src/hooks/useDate";
import useToast from "@/src/hooks/useToast";
import DatePicker from "../ui/date-picker";
import useRecordsStore from '@/src/stores/RecordsStore';
import usePaymentsStore from "@/src/stores/PaymentMethodsStore";
import useCategoriesStore from "@/src/stores/CategoriesStore";
import useColorStore from "@/src/stores/ColorsStore";
import ModalContainer from "../ui/modal-container";
import InputLabel from "../ui/InputLabel";
import PressableSwitch from "../ui/pressable-switch";
import BaseSelect from "../ui/base-select";
import LabelBlock from "../ui/LabelBlock";

interface AddItemProps {
    item?: RecordI
    children?: React.ReactNode
    openUpdate?: boolean
    open?: boolean
}

const AddItem = ({ item, children, openUpdate, open }: AddItemProps) => {
    const { setRecords, group, setResumes } = useRecordsStore()
    const dateH = useDate()
    const { t } = useLanguage()
    const [name, setName] = useState<string>("")
    const [date, setDate] = useState<string>(dateH.create())
    const [type, setType] = useState<"income" | "expense">("expense")
    const [payment_method, setPaymentMethod] = useState<PaymentMethod>()
    const [category, setCategory] = useState<Category>()
    const [value, setValue] = useState<string>("0")
    const [group_id, setGroupId] = useState<number>(group?.id || 0)
    const records = useRecords()
    const paymentMethods = usePaymentMethods()
    const categoriesDB = useCategories()
    const { colors } = useColorStore()
    const { ToastContainer, showToast } = useToast()
    const { payments, setPayments } = usePaymentsStore()
    const { categories, setCategories } = useCategoriesStore()

    useEffect(() => {
        if (!group) return
        setGroupId(group.id)
        const loadData = async () => {
            const pm = await paymentMethods.fetchPaymentMethods()
            const ct = await categoriesDB.fetchCategories()
            setPayments(pm)
            setCategories(ct)
        }
        loadData()
    }, [group])

    useEffect(() => {
        if (!item) return
        setName(item.record_name)
        setValue(String(item.amount))
        setDate(item.date)
        if (item.record_type != type) {
            onTypeChange()
        }
        setGroupId(item.group_id)
        setCategory(categories?.find(cat => cat.id == item.category_id))
        setPaymentMethod(payments?.find(pay => pay.id == item.payment_method_id))
    }, [item])



    const onTypeChange = () => {
        if (type === "expense") {
            setType("income")
        } else {
            setType("expense")
        }
    }

    const onSave = async () => {
        if (!group) return

        if (value === "" || name === "" || !payment_method?.id || !category?.id) {
            showToast({ message: t("item.error"), type: "ERROR" })
            return
        }

        const newItem: CreateRecordRequest = {
            date,
            group_id,
            record_name: name,
            record_type: type,
            amount: Number(value),
            category_id: category?.id as number,
            payment_method_id: payment_method?.id as number
        }

        if (item) {
            await records.updateRecord(item.record_id, {
                ...newItem,
            })
            showToast({ message: t("item.edited"), type: "SUCCESS" })
        } else {
            await records.addRecord(newItem)
            showToast({ message: t("item.added"), type: "SUCCESS" })
            setName("")
            setValue("0")
        }
        try {
            setRecords(await records.fetchRecords(group_id) as RecordI[])
            setResumes(await records.getAllResume(group_id))
        } catch (e) {
            console.log(e)
        }
    }

    const onChangeCategory = (index: number) => {
        if (!categories) return
        setCategory(categories[index])
    }

    const onPaymentChange = (index: number) => {
        if (!payments) return
        setPaymentMethod(payments[index])
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
                <ScrollView>
                    <View style={localStyles.colContainer}>
                        <View style={localStyles.inputContainer}>
                            <InputLabel
                                value={name}
                                onChangeText={setName}
                                placeholder={t('item.name')}
                            />
                        </View>
                        <View style={localStyles.inputContainer}>
                            <PressableSwitch
                                onClick={onTypeChange}
                                text={t(`item.${type}`)}
                                label={t('item.type')}
                                textColor={colors ? (type == "expense" ? colors["ExpenseColor"] : colors["IncomeColor"]) : "#000"}
                            />
                        </View>

                        <View style={localStyles.inputContainer}>
                            <BaseSelect
                                label={t('item.category')}
                                selected={category?.category_name}
                                onChange={onChangeCategory}
                                options={categories?.map(cat => cat.category_name)}
                                title={t('item.selectCategory')}
                            />
                        </View>

                        <View style={localStyles.inputContainer}>
                            <BaseSelect
                                label={t('item.payment')}
                                selected={payment_method?.method_name}
                                onChange={onPaymentChange}
                                options={payments?.map(pay => pay.method_name)}
                                title={t('item.selectPayment')}
                            />
                        </View>

                        <View style={localStyles.inputContainer}>
                            <InputLabel
                                value={value}
                                onChangeText={setValue}
                                placeholder={t('item.value')}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={localStyles.inputContainer}>
                            <LabelBlock label={t('item.date')}>
                                <DatePicker buttonText={dateH.getStringDate(date)} onChange={setDate} value={date} />
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