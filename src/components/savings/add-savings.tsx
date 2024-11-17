import React, { useState, useEffect } from "react";
import { View, Modal, ScrollView, Pressable, Text, TextInput, TouchableOpacity, StyleProp, TextStyle, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { useLanguage } from "@/src/lang/LanguageContext";
import styles from "@/src/styles/styles";
import { useSavings, useSavingsHistory } from "@/src/db";
import { RecordI, Group, CreateRecordRequest, Category, PaymentMethod, Savings, SavingsHistory } from "@/src/interfaces";
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
import useSavingsStore from "@/src/stores/SavingsStore";

interface AddItemProps {
    isEditing?: boolean
    children?: React.ReactNode
    openUpdate?: boolean
    open?: boolean
}

const AddSaving = ({ isEditing = false, children, openUpdate, open }: AddItemProps) => {
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
    const { addSavings, fetchSavings, updateSavings, } = useSavings()
    const { fetchSavingsHistoryBySavingId } = useSavingsHistory()

    const { colors } = useColorStore()
    const { ToastContainer, showToast } = useToast()
    const { saving, savingsHistory, setSaving, setSavingsHistory, setSavings } = useSavingsStore()

    useEffect(() => {
        if (saving) {
            setValue(String(saving.amount))
            setName(saving.saving_name)
        }
    }, [saving])


    const onSave = async () => {
        if (!group) return

        if (value === "" || name === "") {
            showToast({ message: t("item.error"), type: "ERROR" })
            return
        }
        console.log(isEditing, saving)
        if (isEditing && saving) {
            await updateSavings(saving?.id, name, Number(value))
            setSaving({
                ...saving,
                amount: Number(value),
                saving_name: name
            })
            showToast({ message: t("item.edited"), type: "SUCCESS" })
            const history = await fetchSavingsHistoryBySavingId(saving.id)
            setSavingsHistory(history)
        } else {
            await addSavings(name, Number(value))
            showToast({ message: t("item.added"), type: "SUCCESS" })
            setName("")
            setValue("")
        }
        const savings = await fetchSavings()
        setSavings(savings)

    }


    return (
        <>
            <ModalContainer
                buttonOpen={children}
                closeOnAccept={true}
                type="complete"
                onAccept={onSave}
                title={isEditing ? t('savings.edit') : t('savings.add')}
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
                            <InputLabel
                                value={value}
                                onChangeText={setValue}
                                placeholder={t('item.value')}
                                keyboardType="numeric"
                            />
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
        paddingVertical: 80,
        gap: 80
    },

    inputContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center"
    }
})

export default AddSaving