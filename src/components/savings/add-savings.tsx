import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";

import { useLanguage } from "@/src/lang/LanguageContext";
import { useSavings, useSavingsHistory } from "@/src/db";
import useToast from "@/src/hooks/useToast";
import useRecordsStore from '@/src/stores/RecordsStore';
import ModalContainer from "../ui/modal-container";
import InputLabel from "../ui/InputLabel";
import useSavingsStore from "@/src/stores/SavingsStore";
import { useHandler } from "@/src/db/handlers/handler";
import { Savings, SavingsHistory } from "@/src/db/types/tables";

interface AddItemProps {
    isEditing?: boolean
    children?: React.ReactNode
    openUpdate?: boolean
    open?: boolean
}

const AddSaving = ({ isEditing = false, children, open }: AddItemProps) => {
    const { group } = useRecordsStore()
    const { t } = useLanguage()
    const [name, setName] = useState<string>("")
    const [value, setValue] = useState<string>("")
    const { addSavings, fetchSavings, updateSavings, } = useSavings()
    const { fetchSavingsHistoryBySavingId } = useSavingsHistory()
    const savingsHandler = useHandler("Savings")
    const historyHandler = useHandler("SavingsHistory")

    const { ToastContainer, showToast } = useToast()
    const { saving, setSaving, setSavingsHistory, setSavings } = useSavingsStore()

    useEffect(() => {
        if (saving && isEditing) {
            setValue(String(saving.amount))
            setName(saving.saving_name)
        }else{
            setValue("")
            setName("")
        }
    }, [saving, open])


    const onSave = async () => {
        if (!group) return

        if (value === "" || name === "") {
            showToast({ message: t("item.error"), type: "ERROR" })
            return
        }
        const newData: Savings = {
            amount: Number(value),
            saving_name: name,
        }

        if (isEditing && saving?.id) {
            newData.id = saving.id
            await savingsHandler.edit(newData)
            showToast({ message: t("item.edited"), type: "SUCCESS" })
            const newHistory: SavingsHistory = {
                savings_id: saving.id,
                new_amount: Number(value),
                change_date: new Date().getTime(),
                previous_amount: saving.amount,
            }
            await historyHandler.add(newHistory)
            const history = await historyHandler.fetchWithWhere("savings_id", String(saving.id)) as SavingsHistory[]
            setSaving({
                ...saving,
                amount: Number(value),
                saving_name: name
            })
            setSavingsHistory(history.reverse())
        } else {
            await savingsHandler.add(newData)
            showToast({ message: t("item.added"), type: "SUCCESS" })
            setName("")
            setValue("")
        }
        const savings = await savingsHandler.fetchAll() as Savings[]
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