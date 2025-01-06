import { StyleSheet, Pressable, Text, ViewStyle, View } from "react-native";

import ColorText from "./color-text";
import useColorStore from "@/src/stores/ColorsStore";

interface props {
    text: string,
    onClick?: () => void | undefined,
    type: "base" | "bg",
    isButton?: boolean
}

const ModalButton = ({ text, onClick, type, isButton = true }: props) => {
    const { colors } = useColorStore()

    const color = colors?.ConfirmColor || "#8FC0C3"
    const textBg =  type == "base" ? "#fff" : color

    const styles = type == "base" ? {
        borderWidth: 1,
        borderColor: color,
    } as ViewStyle : {
        backgroundColor: color
    } as ViewStyle

    return (
        <>
            {isButton ? (
                <Pressable onPress={onClick} style={[localStyles.button, styles]}>
                    <ColorText backgroundColor={textBg} fontSize={14} textAlign="center">{text}</ColorText>
                </Pressable>
            ) : (
                <View style={[localStyles.button, styles]}>
                    <ColorText backgroundColor={textBg} fontSize={14} textAlign="center">{text}</ColorText>
                </View>
            )}
        </>
    )
}

const localStyles = StyleSheet.create({
    button: {
        width: 150,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 14,
        textAlign: "center"
    }
})

export default ModalButton