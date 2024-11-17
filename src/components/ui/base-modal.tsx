import React, { useEffect, useState } from 'react';
import { View, Text, Modal as Base, Pressable, TouchableOpacity, StyleSheet } from 'react-native';

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
                <Pressable onPress={backdropPress} style={styles?.modalBackdrop}>
                    <Pressable onPress={() => { }} style={[styles?.modalContent, { maxHeight: maxHeight }]}>
                        <Text style={styles?.title}>{title && title}</Text>
                        {children}
                    </Pressable>
                </Pressable>
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
