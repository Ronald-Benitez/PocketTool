import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import styles from '@/src/styles/styles';
import TapBlock from './tap-block';
import useToast from '../../hooks/useToast';
import { ScrollView, TextInput } from 'react-native-gesture-handler';

const DefaultColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff8000',
];

export interface ColorPickerProps {
    color: string;
    onColorChange: (color: string) => void;
    baseWidth: number;
    isVisible: boolean;
    onClose: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onColorChange, baseWidth, isVisible, onClose }) => {
    const colorValue = useSharedValue(color);
    const [colorText, setColorText] = useState(color);
    const [rgba, setRgba] = useState<string[]>(color.replace('#', '').match(/.{1,2}/g) || []);
    const { showToast, ToastContainer } = useToast();
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(200); // Mueve la modal fuera de la pantalla inicialmente

    useEffect(() => {
        // Sincroniza el valor inicial
        colorValue.value = color;
        setColorText(color);
        calculateRGBA(color);

        if (isVisible) {
            opacity.value = withTiming(1, { duration: 300 });
            translateY.value = withSpring(0); // Animar hacia arriba para mostrar la modal
        } else {
            opacity.value = withTiming(0, { duration: 300 });
            translateY.value = withTiming(200); // Animar hacia abajo para ocultarla
        }
    }, [color, isVisible]); // Añadido color y isVisible como dependencias

    const verifyValidHex = (value: string) => /^#[A-Fa-f0-9]{6}$/.test(value);

    const handleCopy = async () => {
        await Clipboard.setStringAsync(colorText); // Copia el color mostrado en el input
        showToast({ message: 'Color copied to clipboard', type: 'SUCCESS' });
    };

    const handlePaste = async () => {
        const value = await Clipboard.getStringAsync();
        if (verifyValidHex(value)) {
            handleColorChange(value);
        } else {
            showToast({ message: 'Invalid color', type: 'ERROR' });
        }
    };

    const handleColorChange = (value: string) => {
        // Actualiza colorValue y colorText en el mismo ciclo
        setColorText(value); // Actualiza el texto de color
        onColorChange(value); // Llama a la función para actualizar el color en el padre
        calculateRGBA(value); // Calcula RGBA
        colorValue.value = withSpring(value);
    };

    const calculateRGBA = (value: string) => {
        setRgba(value.replace('#', '').match(/.{1,2}/g) || []);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: colorValue.value,
    }));

    const modalAnimatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <>
            {/* Fondo semi-transparente cuando la modal esté visible */}
            {isVisible && (
                <Pressable style={[styles.modalBackdrops]} onPress={onClose}>
                    <View />
                </Pressable>
            )}

            {/* Contenedor de la modal */}
            <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
                <View style={styles.row}>
                    <View style={[styles.col, { flex: 1 }]}>
                        <Pressable onPress={handleCopy} style={[styles.button, { width: 48 }]}>
                            <MaterialIcons name="content-copy" size={24} color="black" />
                        </Pressable>
                        <Pressable onPress={handlePaste} style={[styles.button, { width: 48 }]}>
                            <MaterialIcons name="content-paste" size={24} color="black" />
                        </Pressable>
                    </View>
                    <View style={[styles.col, { flex: 1 }]}>
                        <Animated.View style={[styles.colorBlock, animatedStyle]} />
                    </View>
                    <View style={[styles.col, { flex: 1, alignItems: "flex-end" }]}>
                        <Pressable onPress={onClose} style={[styles.button, { width: 48 }]}>
                            <MaterialIcons name="close" size={24} color="black" />
                        </Pressable>
                        <TextInput
                            style={styles.textColor}
                            value={colorText}
                            onChangeText={(text) => {
                                setColorText(text);
                                // Manejar el cambio de texto
                                if (verifyValidHex(text)) {
                                    handleColorChange(text); // Cambia el color solo si el texto es un color hexadecimal válido
                                }
                            }}
                        />
                    </View>
                </View>
                <ScrollView style={[{ flex: 0, marginTop: 10 }]} horizontal>
                    {DefaultColors.map((defaultColor, index) => (
                        <Pressable
                            key={index}
                            onPress={() => handleColorChange(defaultColor)}
                            style={[{ backgroundColor: defaultColor }, styles.colorView]}
                        />
                    ))}
                </ScrollView>

                <View style={[{ gap: 10, marginTop: 10 }]}>
                    {['R', 'G', 'B', 'A'].map((label, index) => (
                        <TapBlock
                            key={label}
                            baseColor={`#${['ff0000', '00ff00', '0000ff', '000000'][index]}`}
                            baseHeight={48}
                            baseWidth={baseWidth - 50}
                            disposition="horizontal"
                            onChange={(value) => {
                                const updatedRgba = [...rgba];
                                updatedRgba[index] = value;
                                handleColorChange(`#${updatedRgba.join('')}`);
                            }}
                            baseHex={rgba[index] || '00'}
                            icon={<Text style={{ color: ['red', 'green', 'blue', 'black'][index] }}>{label}</Text>}
                        />
                    ))}
                </View>
            </Animated.View>

            <ToastContainer />
        </>
    );
};

export default ColorPicker;
