import { View, Text, Modal, Pressable, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { Octicons } from '@expo/vector-icons'


const ToastType = {
    SUCCESS: <Octicons name="check-circle" size={24} color="green" />,
    ERROR: <Octicons name="x-circle" size={24} color="red" />,
    WARNING: <Octicons name="alert" size={24} color="orange" />,
    INFO: <Octicons name="info" size={24} color="blue" />,
}


export interface ToastProps {
    message: string,
    type: keyof typeof ToastType,
}

const useToast = () => {
    const [show, setShow] = useState(false)
    const [message, setMessage] = useState('')
    const [type, setType] = useState<ToastProps["type"]>("SUCCESS")

    const showToast = ({ message, type }: ToastProps) => {
        setMessage(message)
        setType(type)
        setShow(true)
        setTimeout(() => {
            setShow(false)
        }, 3000)
    }

    const ToastContainer = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={show}
                onRequestClose={() => setShow(false)}
            >
                <Pressable style={styles.toastContainer} onPress={() => setShow(false)}>
                    <View style={styles.toastContent}>
                        {ToastType[type]}
                        <Text style={styles.text}>{message}</Text>
                    </View>
                </Pressable>
            </Modal>
        )
    }

    return {
        showToast,
        ToastContainer,
    }
}

const styles = StyleSheet.create({
    toastContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        alignItems: "center",
        padding: 10,
      },
      toastContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        backgroundColor: "white",
        borderRadius: 5,
        gap: 10,
        minHeight: 50,
      },
      text: {
        fontSize: 16,
        fontWeight: "400",
        color: "black",
        marginHorizontal: 10,
      },
});

export default useToast
