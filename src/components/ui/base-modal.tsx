import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, View, Text, Modal as Base, Pressable, TouchableOpacity, StyleSheet } from 'react-native';

import styles from '@/src/styles/styles';

export interface BaseModalProps {
    children: React.ReactNode;
    title?: string;
    button?: React.ReactNode;
    hideOnBackdropPress?: boolean;
    maxHeight?: number;
}

const useBaseModal = (hideOnBackdropPress: BaseModalProps["hideOnBackdropPress"]) => {
    const [modalVisible, setModalVisible] = useState(false);

    const hideModal = () => setModalVisible(false);
    const showModal = () => setModalVisible(true);

    const backdropPress = () => {
        if (hideOnBackdropPress) hideModal();
    }


    const CustomModal = ({ children, title, button, maxHeight }: BaseModalProps) => (
        <>
            {
                button && (
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        {button}
                    </TouchableOpacity>
                )
            }
            <Base
                visible={modalVisible}
                onRequestClose={hideModal}
                transparent={true}
                animationType="slide"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <Pressable onPress={backdropPress} style={styles?.modalBackdrop}>
                        <Pressable onPress={() => { }} style={[styles?.modalContent, { maxHeight: maxHeight ?? '85%' }]}>
                            <Text style={styles?.title}>{title && title}</Text>
                            {children}
                        </Pressable>
                    </Pressable>
                </KeyboardAvoidingView>
            </Base>
        </>
    );

    return {
        CustomModal,
        hideModal,
        showModal,
    };
};



export default useBaseModal;
