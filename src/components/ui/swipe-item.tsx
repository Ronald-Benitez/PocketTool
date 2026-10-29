import { View, ViewStyle, StyleProp } from 'react-native'
import React, { useState } from 'react'
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import styles from '@/src/styles/styles'
import useAndroidToast from '@/src/hooks/useAndroidToast';
import { Dialog } from '@/src/ui/overlays/Dialog';

export interface SwipeItemProps {
    children: React.ReactNode;
    handleDelete: () => void;
    handleUpdate?: () => void;
    deleteContent?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    top?: number;
}

const SwipeItem = ({ children, handleDelete, handleUpdate, deleteContent, style, top }: SwipeItemProps) => {
    const translationX = useSharedValue(0)
    const deleteColor = 'red'
    const editColor = '#edaf02'
    const [confirmVisible, setConfirmVisible] = useState(false)
    const { t } = useLanguage()
    const toast = useAndroidToast()

    const showDeleteDialog = () => setConfirmVisible(true)

    const pan = Gesture.Pan().onUpdate(e => {
        const val = e.translationX
        if (val > -150 && val < 150) {
            translationX.value = val
        }
    }).onEnd(e => {
        if (e.translationX < -90) {
            runOnJS(showDeleteDialog)()
        }
        if (e.translationX > 90 && handleUpdate) {
            runOnJS(handleUpdate)()
        }
        translationX.value = withSpring(0)
    })

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translationX.value }]
    }))

    const animatedOpacity = useAnimatedStyle(() => ({
        opacity: translationX.value < -60 ? 1 : 0 || translationX.value > 60 ? 1 : 0
    }))

    const onConfirmDelete = () => {
        handleDelete()
        setConfirmVisible(false)
        toast.deletedMessage()
    }

    return (
        <View style={style}>
            <GestureDetector gesture={pan}>
                <Animated.View style={[animatedStyle]}>
                    {children}
                </Animated.View>
            </GestureDetector>
            <Animated.View style={[styles.backgroundButton, styles.fixedBackground, animatedOpacity, { right: 0, top: 8 }]}>
                <Feather name="trash" size={24} color={deleteColor} />
            </Animated.View>
            {
                handleUpdate && (
                    <Animated.View style={[styles.backgroundButton, styles.fixedBackground, animatedOpacity, { left: 0, top: 8 }]}>
                        <Feather name="edit-2" size={24} color={editColor} />
                    </Animated.View>
                )
            }

            <Dialog
                visible={confirmVisible}
                title={t("delete")}
                message={deleteContent ? undefined : t("confirmDelete")}
                confirmLabel={t("confirm")}
                cancelLabel={t("cancel")}
                closeLabel={t("cancel")}
                tone='danger'
                onConfirm={onConfirmDelete}
                onCancel={() => setConfirmVisible(false)}
            >
                {deleteContent}
            </Dialog>
        </View>
    )
}

export default SwipeItem
