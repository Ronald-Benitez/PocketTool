import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import React from 'react'
import { useLanguage } from '@/src/lang/LanguageContext'
import { Ionicons } from '@expo/vector-icons'

import styles from '@/src/styles/styles'
import BaseModal from './base-modal'
import BaseSelect from './base-select'

interface MonthSelectorProps {
    month: string
    setMonth: React.Dispatch<React.SetStateAction<string>>
}

const MonthSelector = ({ month, setMonth }: MonthSelectorProps) => {
    const { t } = useLanguage()
    const { CustomModal, hideModal, showModal } = BaseModal(true)

    const months = [
        { name: t('months.0'), value: '00' },
        { name: t('months.1'), value: '01' },
        { name: t('months.2'), value: '02' },
        { name: t('months.3'), value: '03' },
        { name: t('months.4'), value: '04' },
        { name: t('months.5'), value: '05' },
        { name: t('months.6'), value: '06' },
        { name: t('months.7'), value: '07' },
        { name: t('months.8'), value: '08' },
        { name: t('months.9'), value: '09' },
        { name: t('months.10'), value: '10' },
        { name: t('months.11'), value: '11' }
    ]

    const onChange = (index: number) => {
        setMonth(months[index].value)

    }

    return (
        <>
            <BaseSelect
                onChange={onChange}
                title={t("pickers.month")}
                label={t("pickers.month") + '*'}
                options={months.map(m => m.name)}
                selected={months.find(m => m.value == month)?.name}
            />
        </>
    )
}


export default MonthSelector