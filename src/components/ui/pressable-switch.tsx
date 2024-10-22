import { Pressable, StyleSheet, TextInput, TextInputProps, Text, View } from "react-native";

import useColorStore from '@/src/stores/ColorsStore';

interface Props {
    label?: string
    textColor?: string
    onClick: () => void,
    text: string
}

const PressableSwitch = ({ textColor = "#000", onClick, label, text }: Props) => {
    const { colors } = useColorStore()
    return (
        <>
            <View style={localStyles.colContainer}>
                <Text style={localStyles.label}>{label}</Text>
                <Pressable style={[localStyles.block, { borderColor: colors?.InputStroke }]} onPress={onClick}>
                    <Text style={[localStyles.text, { color: textColor }]}>
                        {text}
                    </Text>
                </Pressable >
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
        fontSize: 12
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
})

export default PressableSwitch
