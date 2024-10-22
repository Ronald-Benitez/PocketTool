import { Pressable, StyleSheet, TextInput, TextInputProps, Text, View, ScrollView } from "react-native";

import useColorStore from '@/src/stores/ColorsStore';
import ModalContainer from "./modal-container";
import { useState } from "react";
import BGSelectBlock from "./BGSelectBlock";

interface Props {
    label?: string
    onChange: (index: number) => void,
    options: string[] | undefined
    selected: string | undefined,
    title: string
}

const BaseSelect = ({ label, onChange, options, selected, title }: Props) => {
    const { colors } = useColorStore()
    const [closeModal, setCloseModal] = useState(false)

    const buttonOpen = (
        <View style={[localStyles.block, { borderColor: colors?.InputStroke }]} >
            <Text style={[localStyles.text]}>
                {selected || label}
            </Text>
        </View>
    )

    const handlePress = (index: number) => {
        setCloseModal(!closeModal)
        onChange(index)
    }

    return (
        <>
            <View style={localStyles.colContainer}>
                <Text style={localStyles.label}>{label}</Text>
                <ModalContainer
                    buttonOpen={buttonOpen}
                    close={closeModal}
                    title={title}

                >
                    <ScrollView>
                        <View style={localStyles.optionsContainer}>
                            {
                                options?.map((val, index) => (
                                    <Pressable onPress={() => handlePress(index)} key={val + index}>
                                        <BGSelectBlock>
                                            <Text style={localStyles.text}>
                                                {val}
                                            </Text>
                                        </BGSelectBlock>
                                    </Pressable>
                                ))
                            }
                        </View>
                    </ScrollView>
                </ModalContainer>

            </View>
        </>
    )
}

const localStyles = StyleSheet.create({
    block: {
        height: 50,
        borderWidth: 1,
        paddingHorizontal: 5,
        justifyContent: "center",
        alignItems: "center"
    },
    text: {
        fontWeight: "200",
        fontSize: 14,
        textAlign: "center"
    },
    label: {
        fontSize: 12,
        fontWeight: "200",
        textAlign: "left",
        paddingLeft: 5
    },
    colContainer: {
        width: "80%",
        flexDirection: "column"
    },
    optionsContainer: {
        flexDirection: "column",
        gap: 10,
        padding: 20
    }
})

export default BaseSelect
