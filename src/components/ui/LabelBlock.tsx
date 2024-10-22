import { StyleSheet, TextInput, TextInputProps, View, Text } from "react-native";

import useColorStore from '@/src/stores/ColorsStore';
import { ReactNode } from "react";

interface Props {
    children: ReactNode
    label: string
}

const LabelBlock = ({ children, label }: Props) => {
    const { colors } = useColorStore()

    return (
        <>
            <View style={localStyles.colContainer}>
                <Text style={localStyles.label}>{label}</Text>
                <View style={[localStyles.childrenBlock, { borderColor: colors?.InputStroke }]}>
                    {children}
                </View>
            </View>
        </>
    )
}

const localStyles = StyleSheet.create({
    block: {
        height: 50,
        borderWidth: 1,
    },
    label: {
        fontSize: 12,
        fontWeight: "200",
        textAlign: "left",
        paddingLeft: 5
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 10
    },
    colContainer: {
        width: "80%",
        flexDirection: "column"
    },
    childrenBlock: {
        height: 50,
        borderWidth: 1,
        paddingHorizontal: 5,
        alignItems: "center",
        justifyContent: "center"
    },
})

export default LabelBlock
