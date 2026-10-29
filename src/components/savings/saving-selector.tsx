import React, { useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useLanguage } from '@/src/lang/LanguageContext';
import { useSavings, useSavingsHistory } from '@/src/db';
import useSavingsStore from '@/src/stores/SavingsStore';
import { Saving } from '@/src/interfaces/schema';
import { SelectField } from '@/src/ui/forms/SelectField';

interface Props {
    children: ReactNode
}

const SavingsSelector = ({ children }: Props) => {
    const { t } = useLanguage()
    const { saving, setSaving, setSavingsHistory, savings, setSavings } = useSavingsStore()
    const { fetchSavings, fetchSavingsById } = useSavings()
    const { fetchBySavingId } = useSavingsHistory()

    useEffect(() => {
        void getPinned()
        void getSavings()
    }, [])

    const getSavings = async () => {
        const items = await fetchSavings()
        setSavings(items)
    }

    const onSelect = async (nextSaving: Saving) => {
        setSaving(nextSaving)
        await fetchBySavingId(nextSaving.id ?? 0).then((res) => {
            setSavingsHistory(res.reverse())
        })
    }

    const getPinned = async () => {
        const pinned = await AsyncStorage.getItem('savings');
        if (pinned) {
            const p = Number(pinned)
            fetchSavingsById(p).then(s => {
                if (s) void onSelect(s)
            })
        }
    }

    const savingOptions = (savings ?? []).flatMap(item =>
        typeof item.id === 'number'
            ? [{ label: item.saving_name, value: item.id }]
            : []
    )

    return (
        <SelectField<number>
            value={saving?.id}
            options={savingOptions}
            onChange={(id) => {
                const nextSaving = savings?.find(item => item.id === id)
                if (nextSaving) void onSelect(nextSaving)
            }}
            title={t("savings.select")}
            closeLabel={t('cancel')}
            renderTrigger={() => children}
        />
    )
}

export default SavingsSelector
