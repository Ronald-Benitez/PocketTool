import { View, TextInput, Text } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '@/src/styles/styles';

export interface TapBlockProps {
    baseColor: string;
    onChange: (value: string) => void;
    baseWidth: number;
    baseHeight: number;
    disposition: 'horizontal' | 'vertical';
    baseHex: string;
    icon: React.ReactNode;
}

const TapBlock: React.FC<TapBlockProps> = ({
    baseColor,
    disposition,
    baseWidth,
    baseHeight,
    onChange,
    baseHex,
    icon
}) => {
    const isHorizontal = disposition === 'horizontal';
    const selectValue = useSharedValue(0);
    const [colorValue, setColorValue] = useState(0); // Valor actual del color (0-255)
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Referencia para almacenar el timeout

    useEffect(() => {
        const value = (parseInt(baseHex, 16) / 255) * (isHorizontal ? baseWidth : baseHeight);
        selectValue.value = withTiming(Math.min(value, isHorizontal ? baseWidth : baseHeight));
        console.log("base", baseHex)
        setColorValue(parseInt(baseHex, 16)); // Establecer el valor inicial del color
    }, [baseHex]);

    const handlePositionUpdate = (position: number) => {
        const limit = isHorizontal ? baseWidth : baseHeight;
        const normalizedPosition = Math.max(0, Math.min(position, limit)); // Ajuste del límite

        selectValue.value = normalizedPosition;
        const normalizedValue = (normalizedPosition / limit) * 255;
        const newValue = Math.floor(normalizedValue);

        setColorValue(newValue); // Actualizar valor mostrado

        // Aplicar debounce en la función onChange
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
            onChange(newValue.toString(16).padStart(2, '0')); // Enviar el nuevo valor en hexadecimal
        }, 300); // Cambia 300ms por el tiempo que prefieras
    };

    const handlePanUpdate = (e: { x: number; y: number }) => {
        const position = isHorizontal ? e.x : e.y;
        handlePositionUpdate(position); // Mover el selector al arrastrar
    };

    const handleTapUpdate = (e: { x: number; y: number }) => {
        const position = isHorizontal ? e.x : e.y;
        handlePositionUpdate(position); // Mover el selector al tocar
    };

    const handleInputChange = (value: string) => {
        if (Number.isNaN(value)) return
        if (value == "" || !value) return
        try {
            const numValue = Math.max(0, Math.min(parseInt(value, 10), 255)); // Limitar valor entre 0 y 255
            setColorValue(numValue);
            selectValue.value = (numValue / 255) * (isHorizontal ? baseWidth : baseHeight);

            // Aplicar debounce en la función onChange
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            debounceTimeoutRef.current = setTimeout(() => {
                onChange(numValue.toString(16).padStart(2, '0')); // Enviar el nuevo valor en hexadecimal
            }, 300); // Cambia 300ms por el tiempo que prefieras
        } catch (e) {

        }
    };

    const panGesture = Gesture.Pan().onUpdate(handlePanUpdate);
    const tapGesture = Gesture.Tap().onEnd(handleTapUpdate); // Gesto de tap para actualizaciones rápidas

    const animatedStyle = useAnimatedStyle(() => ({
        [isHorizontal ? 'left' : 'top']: selectValue.value - 17.5, // Ajuste para centrar el selector
    }));

    return (
        <View style={[styles.row, { gap: 20 }]}>
            <View style={styles.iconContainer}>{icon}</View>

            <GestureDetector gesture={Gesture.Exclusive(panGesture, tapGesture)}>
                <LinearGradient
                    colors={['#ffffff', baseColor]}
                    style={[styles.gradientBlock, { width: baseWidth, height: baseHeight }]}
                    start={{ x: 0, y: 0 }}
                    end={isHorizontal ? { x: 1, y: 0 } : { x: 0, y: 1 }}
                >
                    {/* Indicador del valor */}
                    <Animated.View style={[styles.selector, animatedStyle]}>
                        <Text style={styles.indicatorText}>{colorValue}</Text>
                    </Animated.View>
                </LinearGradient>
            </GestureDetector>

            {/* Input para ingresar manualmente el valor */}
            <TextInput
                style={styles.textColor}
                value={colorValue.toString()}
                onChangeText={handleInputChange}
                keyboardType="numeric"
                maxLength={3} // Limitar a 3 caracteres
            />
        </View>
    );
};

export default TapBlock;
