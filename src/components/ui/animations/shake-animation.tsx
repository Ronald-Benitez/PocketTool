import { Animated } from "react-native";
import { ReactNode, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ShakeProps {
    children: ReactNode;
    shake?: boolean;
}

const ShakeAnimation = ({ children, shake = false }: ShakeProps) => {
    const shakeAnimationX = useRef(new Animated.Value(0)).current;
    const shakeAnimationY = useRef(new Animated.Value(0)).current;

    const aidedMode = async () => {
        const mode = await AsyncStorage.getItem("aidedMode")
        return mode === "true"
    }

    useEffect(() => {
        if (shake) {
            Animated.loop(
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(shakeAnimationX, {
                            toValue: 1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(shakeAnimationX, {
                            toValue: -1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(shakeAnimationX, {
                            toValue: 1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(shakeAnimationX, {
                            toValue: 0,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.timing(shakeAnimationY, {
                            toValue: 1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(shakeAnimationY, {
                            toValue: -1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(shakeAnimationY, {
                            toValue: 1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(shakeAnimationY, {
                            toValue: 0,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                    ])
                ])
            ).start();
        }
    }, [shake]);

    return (
        <Animated.View style={{ transform: [{ translateX: shakeAnimationX }, { translateY: shakeAnimationY }] }}>
            {children}
        </Animated.View>
    );
};

export default ShakeAnimation;
export {
    ShakeAnimation
};