import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

import BaseModal from '@/src/components/ui/base-modal'
import styles from '@/src/styles/styles'

interface PickerProps {
    title: string
    value: string
    options: string[]
    onChange: (value: string, index: number) => void
}

const Picker: React.FC<PickerProps> = ({ onChange, options, title, value }) => {
    const { CustomModal, showModal, hideModal } = BaseModal(true)

    const PickerButton = (
        <Pressable onPress={showModal} >
            <Ionicons name="caret-down" size={24} color="black" />
            <Text>{value || title}</Text>
        </Pressable>
    )

    const handlePress = (option: string, index: number) => {
        onChange(option, index)
        hideModal()
    }

    return (
        <>
            <CustomModal button={PickerButton} title={title} maxHeight={500}>
                <ScrollView >
                    <View style={[styles.col, { gap: 4, minWidth: "80%", minHeight: "100%" }]}>
                        {
                            options.map((option, index) => (
                                <TouchableOpacity key={index} style={styles.button} onPress={() => handlePress(option, index)}>
                                    <Text style={styles.middleText}>{option}</Text>
                                    {
                                        option === value && <Ionicons name="checkmark" size={24} color="black" />
                                    }
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                </ScrollView>
            </CustomModal>
        </>
    )
}


export default Picker