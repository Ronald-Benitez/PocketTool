import { StyleSheet, Pressable, Text, ViewStyle, View } from "react-native";

import { useTheme } from "@/src/ui/theme/ThemeProvider";

interface props {
    text: string,
    onClick?: () => void | undefined,
    type: "base" | "bg",
    isButton?: boolean
}

const ModalButton = ({ text, onClick, type, isButton = true }: props) => {
    const { colors } = useTheme()

    const backgroundColor = type === "base" ? colors.surface : colors.primary
    const textColor = type === "base" ? colors.primary : colors.onPrimary

    const buttonStyle = {
        backgroundColor,
        borderWidth: 1,
        borderColor: colors.primary,
    } as ViewStyle

    return (
        <>
            {isButton ? (
                <Pressable onPress={onClick} style={[localStyles.button, buttonStyle]}>
                    <Text style={[localStyles.text, { color: textColor }]}>{text}</Text>
                </Pressable>
            ) : (
                <View style={[localStyles.button, buttonStyle]}>
                    <Text style={[localStyles.text, { color: textColor }]}>{text}</Text>
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
