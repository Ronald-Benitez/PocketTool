import { StyleSheet, Pressable, View } from "react-native";
import { ReactNode } from "react";

import ShakeAnimation from "./animations/shake-animation";

interface props {
    children: ReactNode,
    onClick?: (() => unknown) | (() => void),
    isButton?: boolean,
    shake?: boolean
}

const IconButton = ({ children, onClick, isButton = true, shake = true }: props) => {
    return (
        <ShakeAnimation shake={shake}>
            {isButton ? (
                <Pressable onPress={onClick} style={[localStyles.button]}>
                    {children}
                </Pressable>
            ) : (
                <View style={[localStyles.button]}>
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
        backgroundColor: "#fff",
        shadowColor: "black",
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