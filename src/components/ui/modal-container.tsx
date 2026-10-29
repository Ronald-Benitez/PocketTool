import { View, Text, Modal, KeyboardAvoidingView, Platform, Pressable, TextInput, StyleSheet } from 'react-native'
import React, { ReactNode, useEffect, useState, useImperativeHandle } from 'react'

import { useLanguage } from '@/src/lang/LanguageContext'
import ModalButton from './modal-button'
import useColorStore from '@/src/stores/ColorsStore'
import ColorText from './color-text'

export interface ModalContainerRef {
    openModal: () => void;
    closeModal: () => void;
}

interface AddGroupProps {
    children?: React.ReactNode,
    buttonOpen: React.JSX.Element | ReactNode,
    title?: string,
    type?: "select" | "complete"
    onAccept?: () => void,
    closeOnAccept?: boolean,
    open?: boolean,
    close?: boolean,
    onClose?: () => void,
}

const ModalContainer = React.forwardRef<ModalContainerRef, AddGroupProps>(
    ({ children, buttonOpen, title, type, onAccept, closeOnAccept, open, close, onClose }, ref) => {
        const [modalVisible, setModalVisible] = useState(false)
        const [isFirstRender, setIsFirstRender] = useState(true);
        const { t } = useLanguage()
        const { colors } = useColorStore()

        useImperativeHandle(ref, () => ({
            openModal: () => setModalVisible(true),
            closeModal: handleClose,
        }));

        const handleClose = () => {
            setModalVisible(false);
            onClose && onClose();
        }

        const handleAccept = () => {
            onAccept && onAccept()
            if (closeOnAccept) {
                handleClose()
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
            if (close) {
                setModalVisible(false);
            }
        }, [close])


        return (
            <>
                <Pressable onPress={() => setModalVisible(true)}>
                    {buttonOpen}
                </Pressable>
                <View style={[{ position: "absolute", right: 0, top: 0 }]}>
                    <Modal
                        visible={modalVisible}
                        onRequestClose={handleClose}
                        transparent={true}
                        animationType="fade"
                    >
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={localStyles.keyboard}
                        >
                            <Pressable onPress={handleClose} style={[localStyles.modalBackdrop, { backgroundColor: colors?.overlay }]}>
                                <View style={localStyles.modalInner} pointerEvents="box-none">
                                    <Pressable onPress={() => { }} style={[localStyles.modalContainer, { backgroundColor: colors?.surface }]}>
                                        <View style={[localStyles.modalHeader, { backgroundColor: colors?.ModalHeaderColor }]}>
                                            <ColorText backgroundColor={colors?.ModalHeaderColor || "#fff"} textAlign="center">
                                                {title}
                                            </ColorText>
                                        </View>
                                        <View style={localStyles.modalContent}>
                                            {children}
                                        </View>
                                        <View style={localStyles.modalFooter}>
                                            <ModalButton onClick={handleClose} text={t("close")} type='base' />
                                            {
                                                type == "complete" && onAccept && (
                                                    <ModalButton onClick={handleAccept} text={t("confirm")} type='bg' />
                                                )
                                            }
                                        </View>
                                    </Pressable>
                                </View>
                            </Pressable>
                        </KeyboardAvoidingView>
                    </Modal>
                </View>
            </>
        )
    }
)

const localStyles = StyleSheet.create({
    keyboard: {
        flex: 1,
    },
    buttonOpen: {
        justifyContent: "center"
    },
    modalHeader: {
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
        width: "90%",
        maxWidth: 420,
        height: "85%",
        maxHeight: 650,
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalInner: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        flex: 1
    },
    modalFooter: {
        height: 65,
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
    }
})

ModalContainer.displayName = 'ModalContainer';

export default ModalContainer