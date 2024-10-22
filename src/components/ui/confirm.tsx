import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

import { useLanguage } from '@/src/lang/LanguageContext'
import BaseModal from './base-modal'
import styles from '@/src/styles/styles'

export interface ComfirmProps {
    children: React.ReactNode;
    title: string;
    message: string;
    onConfirm: () => void;
}

const Confirm = ({ children, title, message, onConfirm }: ComfirmProps) => {
    const { CustomModal, hideModal } = BaseModal(true)
    const { t } = useLanguage()

    const handleConfirm = () => {
        onConfirm()
        hideModal()
    }

    return (
        <CustomModal title={title} button={children}>
            <View style={styles.col}>
                <Text style={styles.text}>{message}</Text>
                <View style={[styles.row, { justifyContent: "space-around" }]}>
                    <TouchableOpacity style={styles.button} onPress={hideModal}>
                        <Text style={styles.text}>{t("cancel")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.enfasizedButton} onPress={handleConfirm}>
                        <Text style={styles.text}>{t("confirm")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </CustomModal>
    )
}

export default Confirm