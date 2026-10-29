import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useLanguage } from "@/src/lang/LanguageContext";
import { useSavings, useSavingsHistory } from "@/src/db";
import useRecordsStore from '@/src/stores/RecordsStore';
import useSavingsStore from "@/src/stores/SavingsStore";
import { Saving, SavingsHistoryEntry } from "@/src/interfaces/schema";
import { Button } from "@/src/ui/actions/Button";
import { MoneyField } from "@/src/ui/forms/MoneyField";
import { TextField } from "@/src/ui/forms/TextField";
import { Modal } from "@/src/ui/overlays/Modal";
import { useToast } from "@/src/ui/feedback/ToastProvider";

interface AddItemProps {
    isEditing?: boolean
    children?: React.ReactNode
    openUpdate?: boolean
    open?: boolean
}

const AddSaving = ({ isEditing = false, children, open }: AddItemProps) => {
    const { group } = useRecordsStore()
    const { t } = useLanguage()
    const [visible, setVisible] = useState(false)
    const [name, setName] = useState<string>("")
    const [amountCents, setAmountCents] = useState<number>(0)
    const { addSavings, fetchSavings, updateSavings } = useSavings()
    const { addHistory, fetchBySavingId } = useSavingsHistory()
    const { showToast } = useToast()
    const { saving, setSaving, setSavingsHistory, setSavings } = useSavingsStore()
    const firstOpenEffect = useRef(true)

    useEffect(() => {
        if (firstOpenEffect.current) {
            firstOpenEffect.current = false
            return
        }
        setVisible(true)
    }, [open])

    useEffect(() => {
        if (saving && isEditing) {
            setAmountCents(saving.amount)
            setName(saving.saving_name)
        } else {
            setAmountCents(0)
            setName("")
        }
    }, [saving, open])

    const closeModal = () => setVisible(false)

    const onSave = async () => {
        if (!group) return

        if (amountCents <= 0 || name.trim() === "") {
            showToast({ message: t("item.error"), type: "error" })
            return
        }

        if (isEditing && saving?.id) {
            await updateSavings(saving.id, name.trim(), amountCents)
            showToast({ message: t("item.edited"), type: "success" })
            const newHistory: SavingsHistoryEntry = {
                savings_id: saving.id,
                new_amount: amountCents,
                change_date: new Date().getTime(),
                previous_amount: saving.amount,
            }
            await addHistory(newHistory)
            const history = await fetchBySavingId(saving.id)
            setSaving({
                ...saving,
                amount: amountCents,
                saving_name: name.trim()
            })
            setSavingsHistory(history.reverse())
        } else {
            await addSavings(name.trim(), amountCents)
            showToast({ message: t("item.added"), type: "success" })
            setName("")
            setAmountCents(0)
        }
        const savings = await fetchSavings() as Saving[]
        setSavings(savings)
        closeModal()
    }

    return (
        <>
            {children ? (
                <Pressable onPress={() => setVisible(true)}>{children}</Pressable>
            ) : null}
            <Modal
                visible={visible}
                onClose={closeModal}
                title={isEditing ? t('savings.edit') : t('savings.add')}
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
                    <MoneyField
                        label={t('item.value')}
                        required
                        value={amountCents}
                        onChangeCents={setAmountCents}
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

export default AddSaving
