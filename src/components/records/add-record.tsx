import React, { useState, useEffect } from "react";
import { View, ScrollView, Pressable, Text, StyleSheet } from "react-native";

import { useLanguage } from "@/src/lang/LanguageContext";
import { useRecords } from "@/src/db/handlers/RecordsHandler";
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
import DatePicker from "../ui/date-picker";
import { useHandler } from "@/src/db/handlers/handler";
import { useDataStore } from "@/src/stores";
import { Records, Categories, PaymentMethods, PaymentTypes, RecordTypes, RecordJoined } from "@/src/db/types/tables";
import styles from '@/src/styles/styles';
import BorderLeftBlock from '@/src/components/ui/BorderLeftBlock';

interface AddItemProps {
    item?: RecordJoined
    children?: React.ReactNode
    openUpdate?: boolean
    open?: boolean
}

const AddItem = ({ item, children, openUpdate, open }: AddItemProps) => {
    const { setRecords, group, setResumes } = useRecordsStore()
    const dateH = useDate()
    const { t } = useLanguage()
    const [name, setName] = useState<string>("")
    const [date, setDate] = useState(new Date().getTime())
    const [type, setType] = useState<RecordTypes>()
    const [payment_method, setPaymentMethod] = useState<PaymentMethods>()
    const [category, setCategory] = useState<Categories>()
    const [value, setValue] = useState<string>("")
    const [group_id, setGroupId] = useState<number>(group?.id || 0)
    const { fetchRecords, handler: recordsHandler } = useRecords()
    const { colors } = useColorStore()
    const { ToastContainer, showToast } = useToast()
    const { payments, setPayments } = usePaymentsStore()
    const { categories, setCategories } = useCategoriesStore()
    const toast = useAndroidToast()
    const { RecordTypes, PaymentMethods, Categories } = useDataStore()

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
    }, [item])

    const onSave = async () => {
        if (!group) return

        if (value === "" || !payment_method?.id || !category?.id || !type?.id) {
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
            payment_method_id: payment_method?.id as number
        }

        if (item?.id) {
            newItem.id = item.id
            await recordsHandler.edit(newItem)
            toast.editedMessage()
        } else {
            await recordsHandler.add(newItem)
            toast.addedMessage()
            setName("")
            setValue("")
        }
        try {
            setRecords(await fetchRecords(group_id))
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
                            />
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