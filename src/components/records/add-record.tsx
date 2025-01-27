import React, { useState, useEffect } from "react";
import { View, ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { useLanguage } from "@/src/lang/LanguageContext";
import { usePaymentMethods, useRecords, useCategories } from "@/src/db";
import { RecordI, CreateRecordRequest, Category, PaymentMethod } from "@/src/interfaces";
import useDate from "@/src/hooks/useDate";
import useToast from "@/src/hooks/useToast";
import useRecordsStore from '@/src/stores/RecordsStore';
import usePaymentsStore from "@/src/stores/PaymentMethodsStore";
import useCategoriesStore from "@/src/stores/CategoriesStore";
import useColorStore from "@/src/stores/ColorsStore";
import ModalContainer from "../ui/modal-container";
import InputLabel from "../ui/InputLabel";
import PressableSwitch from "../ui/pressable-switch";
import BaseSelect from "../ui/base-select";
import LabelBlock from "../ui/LabelBlock";
import useAndroidToast from "@/src/hooks/useAndroidToast";

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
    const [date, setDate] = useState(new Date())
    const [type, setType] = useState<"income" | "expense" | "transfer">("expense")
    const [payment_method, setPaymentMethod] = useState<PaymentMethod>()
    const [category, setCategory] = useState<Category>()
    const [value, setValue] = useState<string>("")
    const [group_id, setGroupId] = useState<number>(group?.id || 0)
    const records = useRecords()
    const paymentMethods = usePaymentMethods()
    const categoriesDB = useCategories()
    const { colors } = useColorStore()
    const { ToastContainer, showToast } = useToast()
    const { payments, setPayments } = usePaymentsStore()
    const { categories, setCategories } = useCategoriesStore()
    const toast = useAndroidToast()

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
        setDate(new Date(item.date))
        if (item.record_type != type) {
            onTypeChange()
        }
        setGroupId(item.group_id)
        setCategory(categories?.find(cat => cat.id == item.category_id))
        setPaymentMethod(payments?.find(pay => pay.id == item.payment_method_id))
    }, [item])

    const onTypeChange = () => {
        if (type === "income") {
            setType("expense")
        } else if (type === "expense") {
            setType("transfer")
        } else {
            setType("income")
        }
    }

    const onSave = async () => {
        if (!group) return

        if (value === "" || !payment_method?.id || !category?.id) {
            toast.emptyMessage()
            return
        }

        const newItem: CreateRecordRequest = {
            date: date.toISOString().split("T")[0],
            group_id,
            record_name: name.length < 1 ? category?.category_name : name,
            record_type: type,
            amount: Number(value),
            category_id: category?.id as number,
            payment_method_id: payment_method?.id as number
        }

        if (item) {
            await records.updateRecord(item.record_id, {
                ...newItem,
            })
            toast.editedMessage()
        } else {
            await records.addRecord(newItem)
            toast.addedMessage()
            setName("")
            setValue("")
        }
        try {
            setRecords(await records.fetchRecords(group_id) as RecordI[])
            setResumes(await records.getAllResume(group_id))
        } catch (e) {
            toast.errorMessage()
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
    const onChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
        const currentDate = selectedDate;
        if (currentDate) {
            setDate(currentDate);
        }
    };

    const openDatePicker = () => {
        DateTimePickerAndroid.open({
            value: date,
            onChange,
            mode: "date",
            is24Hour: true,
        });
    }

    const typeColor = () => {
        switch (type) {
            case "income":
                return colors?.IncomeColor
            case "expense":
                return colors?.ExpenseColor;
            case "transfer":
                return colors?.TransferColor
        }
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
                                label={t('item.type') + '*'}
                                textColor={colors ? typeColor() : "#000"}
                            />
                        </View>

                        <View style={localStyles.inputContainer}>
                            <BaseSelect
                                label={t('item.category') + '*'}
                                selected={category?.category_name}
                                onChange={onChangeCategory}
                                options={categories?.map(cat => cat.category_name)}
                                title={t('item.selectCategory')}
                            />
                        </View>

                        <View style={localStyles.inputContainer}>
                            <BaseSelect
                                label={t('item.payment') + '*'}
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
                                placeholder={t('item.value') + '*'}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={localStyles.inputContainer}>
                            <LabelBlock label={t('item.date')}>
                                <Pressable onPress={openDatePicker} style={{ width: 300, height: 50, alignItems: "center", justifyContent: "center" }}>
                                    {/* <DatePicker buttonText={dateH.getStringDate(date)} onChange={setDate} value={date} /> */}
                                    <Text>{date.toLocaleDateString()}</Text>
                                </Pressable>
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