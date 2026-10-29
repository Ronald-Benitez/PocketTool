import { StyleSheet, Pressable, View } from "react-native";
import { ReactNode } from "react";

import { useTheme } from "@/src/ui/theme/ThemeProvider";
import ShakeAnimation from "./animations/shake-animation";

interface props {
    children: ReactNode,
    onClick?: (() => unknown) | (() => void),
    isButton?: boolean,
    shake?: boolean
}

const IconButton = ({ children, onClick, isButton = true, shake = false }: props) => {
    const { colors } = useTheme()
    const buttonStyle = {
        backgroundColor: colors.surface,
        shadowColor: colors.shadow,
    }

    return (
        <ShakeAnimation shake={false}>
            {isButton ? (
                <Pressable onPress={onClick} style={[localStyles.button, buttonStyle]}>
                    {children}
                </Pressable>
            ) : (
                <View style={[localStyles.button, buttonStyle]}>
                    {children}
                </View>
            )}
        </ShakeAnimation>
    )
}

const localStyles = StyleSheet.create({
    button: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
})

export default IconButton
