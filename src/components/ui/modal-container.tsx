import { View, Text, Modal, TouchableOpacity, Pressable, TextInput, StyleSheet } from 'react-native'
import { ReactNode, useEffect, useState } from 'react'

import styles from '@/src/styles/styles'
import useToast from '@/src/hooks/useToast'
import { useLanguage } from '@/src/lang/LanguageContext'
import ModalButton from './modal-button'

interface AddGroupProps {
    children?: React.ReactNode,
    buttonOpen: React.JSX.Element | ReactNode,
    title?: String,
    type?: "select" | "complete"
    onAccept?: () => void,
    closeOnAccept?: boolean,
    open?: boolean,
    close?: boolean
}


const ModalContainer = ({ children, buttonOpen, title, type, onAccept, closeOnAccept, open, close }: AddGroupProps) => {
    const { ToastContainer, showToast } = useToast()
    const [modalVisible, setModalVisible] = useState(false)
    const [isFirstRender, setIsFirstRender] = useState(true);
    const { t } = useLanguage()

    const handleAccept = () => {
        onAccept && onAccept()
        if (closeOnAccept) {
            setModalVisible(false)
        }
    }

    useEffect(() => {
        if (isFirstRender) {
            setIsFirstRender(false);
        } else {
            setModalVisible(true);
        }
    }, [open])

    useEffect(() => {
        setModalVisible(false);
    }, [close])

    return (
        <>
            <Pressable onPress={() => setModalVisible(true)}>
                {buttonOpen}
            </Pressable>
            <Modal
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
                transparent={true}
                animationType="fade"
            >
                <Pressable onPress={() => setModalVisible(false)} style={localStyles.modalBackdrop}>
                    <Pressable onPress={() => { }} >
                        <View style={[localStyles.modalContainer]}>
                            <View style={localStyles.modalHeader}>
                                <Text style={localStyles.modalHeaderText}>{title}</Text>
                            </View>
                            <View style={localStyles.modalContent}>
                                {children}
                            </View>
                            <View style={localStyles.modalFooter}>
                                <ModalButton onClick={() => setModalVisible(false)} text={t("cancel")} type='base' />
                                {
                                    type == "complete" && onAccept && (
                                        <ModalButton onClick={handleAccept} text={t("confirm")} type='bg' />
                                    )
                                }
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
                <ToastContainer />
            </Modal>
        </>
    )
}

const localStyles = StyleSheet.create({
    buttonOpen: {
        justifyContent: "center"
    },
    modalHeader: {
        backgroundColor: "#497679",
        justifyContent: "center",
        height: 65
    },
    modalHeaderText: {
        fontSize: 20,
        fontWeight: '600',
        color: "#fff",
        textAlign: "center"
    },
    modalContainer: {
        backgroundColor: "#fff",
        width: 380,
        height: 600,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        height: 460,
    },
    modalFooter: {
        height: 65,
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
    }
})

export default ModalContainer