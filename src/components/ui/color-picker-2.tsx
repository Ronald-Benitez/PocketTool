import { Text, StyleSheet, View, Pressable, TextInput } from "react-native";
import * as Clipboard from 'expo-clipboard';
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

import useToast from '../../hooks/useToast';
import ModalContainer from "./modal-container";
import { useLanguage } from "@/src/lang/LanguageContext";
import IconButton from "./icon-button";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { convertToRGBA } from "react-native-reanimated";
import ModalButton from "./modal-button";

interface props {
    color: string,
    onChange: (color: string) => void
}

const ColorPicker2 = ({ color, onChange }: props) => {
    const { t } = useLanguage()
    const { showToast, ToastContainer } = useToast();
    const [inputColor, setInputColor] = useState(color)
    const [r, setR] = useState(0)
    const [g, setG] = useState(0)
    const [b, setB] = useState(0)
    const [a, setA] = useState(0)

    const handleCopy = async () => {
        await Clipboard.setStringAsync(color); // Copia el color mostrado en el input
        showToast({ message: t("colors.copied"), type: 'SUCCESS' });
    };

    const verifyValidHex = (value: string) => /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(value);

    const hexToRGBA = (hex: string): { r: number, g: number, b: number, a: number } | null => {
        let hexValue = hex.replace('#', '');

        if (hexValue.length === 3) {
            hexValue = hexValue.split('').map(char => char + char).join('');
        }

        let r: number, g: number, b: number, a: number = 255;

        if (hexValue.length === 6) {
            r = parseInt(hexValue.substring(0, 2), 16);
            g = parseInt(hexValue.substring(2, 4), 16);
            b = parseInt(hexValue.substring(4, 6), 16);
        }
        else if (hexValue.length === 8) {
            r = parseInt(hexValue.substring(0, 2), 16);
            g = parseInt(hexValue.substring(2, 4), 16);
            b = parseInt(hexValue.substring(4, 6), 16);
            a = parseInt(hexValue.substring(6, 8), 16);
        } else {
            return null;
        }

        return { r, g, b, a };
    };

    const rgbaToHex = () => {

        const toHex = (val: number) => val.toString(16).padStart(2, '0');

        const hexR = toHex(r);
        const hexG = toHex(g);
        const hexB = toHex(b);
        const hexA = toHex(a);

        const newHex = `#${hexR}${hexG}${hexB}${a < 255 ? hexA : ''}`.toUpperCase();
        onChange(newHex)
    };

    const handlePaste = async () => {
        const value = await Clipboard.getStringAsync();
        if (verifyValidHex(value)) {
            onChange(value);
        } else {
            showToast({ message: t("colors.invalid"), type: 'ERROR' });
        }
    };

    useEffect(() => {
        if (verifyValidHex(inputColor)) {
            onChange(inputColor);
        }
    }, [inputColor])

    useEffect(() => {
        const converted = hexToRGBA(color)
        if (converted) {
            setR(converted.r)
            setG(converted.g)
            setB(converted.b)
            setA(converted.a)
        }
    }, [color])


    const onRGBChange = (type: "r" | "g" | "b" | "a", val: number) => {
        const newVal = Math.floor(val)
        switch (type) {
            case "r":
                setR(newVal)
                break;
            case "g":
                setG(newVal)
                break;
            case "b":
                setB(newVal)
                break;
            case "a":
                setA(newVal)
                break;
        }
        rgbaToHex()
    }

    const verifyNumber = (val: string) => {
        const number = Number(val)
        return isNaN(number) ? 0 : number > 255 ? 255 : number
    }

    const pickButton = () => (
        <>
            <View style={[localStyles.colorBlock, { backgroundColor: color, borderWidth: 1, borderColor: "#fff" }]}>
            </View>
        </>
    )
    return (
        <>
            <ModalContainer buttonOpen={pickButton()} title={t("colors.set")}>
                <>
                    <View style={localStyles.headBlock}>
                        <IconButton onClick={handleCopy}>
                            <MaterialIcons name="content-copy" size={24} color="black" />
                        </IconButton>
                        <View style={[localStyles.colorViewer, { backgroundColor: color }]}>
                        </View>
                        <IconButton onClick={handlePaste}>
                            <MaterialIcons name="content-paste" size={24} color="black" />
                        </IconButton>
                    </View>
                    <View style={localStyles.rowCentered}>
                        <TextInput onChangeText={setInputColor} value={inputColor} style={localStyles.colorInput}></TextInput>
                    </View>
                    <ScrollView >
                        <View style={localStyles.slidersContainer}>
                            <Text style={localStyles.rgbText}>R</Text>
                            <Slider
                                style={{ width: 220 }}
                                minimumValue={0}
                                maximumValue={255}
                                minimumTrackTintColor="#ff0000"
                                maximumTrackTintColor="#fff"
                                value={r}
                                onValueChange={e => onRGBChange("r", e)}
                            />
                            <TextInput style={localStyles.rgbInput} value={String(r)} keyboardType="number-pad" onChangeText={e => setR(verifyNumber(e))}></TextInput>
                        </View>
                        <View style={localStyles.slidersContainer}>
                            <Text style={localStyles.rgbText}>G</Text>
                            <Slider
                                style={{ width: 220 }}
                                minimumValue={0}
                                maximumValue={255}
                                minimumTrackTintColor="#00ff00"
                                maximumTrackTintColor="#fff"
                                value={g}
                                onValueChange={e => onRGBChange("g", e)}
                            />
                            <TextInput style={localStyles.rgbInput} value={String(g)} keyboardType="number-pad" onChangeText={e => setG(verifyNumber(e))}></TextInput>
                        </View>
                        <View style={localStyles.slidersContainer}>
                            <Text style={localStyles.rgbText}>B</Text>
                            <Slider
                                style={{ width: 220 }}
                                minimumValue={0}
                                maximumValue={255}
                                minimumTrackTintColor="#0000ff"
                                maximumTrackTintColor="#fff"
                                value={b}
                                onValueChange={e => onRGBChange("b", e)}
                            />
                            <TextInput style={localStyles.rgbInput} value={String(b)} keyboardType="number-pad" onChangeText={e => setB(verifyNumber(e))}></TextInput>
                        </View>
                        <View style={localStyles.slidersContainer}>
                            <Text style={localStyles.rgbText}>A</Text>
                            <Slider
                                style={{ width: 220 }}
                                minimumValue={0}
                                maximumValue={255}
                                minimumTrackTintColor="#000"
                                maximumTrackTintColor="#fff"
                                value={a}
                                onValueChange={e => onRGBChange("a", e)}
                            />
                            <TextInput style={localStyles.rgbInput} value={String(a)} keyboardType="number-pad" onChangeText={e => setA(verifyNumber(e))}></TextInput>
                        </View>
                    </ScrollView>
                    <ToastContainer />
                </>
            </ModalContainer>
        </>
    )
}

const localStyles = StyleSheet.create({
    colorBlock: {
        width: 50,
        height: 50,
        borderRadius: 10
    },
    headBlock: {
        justifyContent: "space-around",
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
        padding: 10,
        marginTop: 10
    },
    colorViewer: {
        width: 100,
        height: 100,
        borderRadius: 5
    },
    rowCentered: {
        flexDirection: "row",
        justifyContent: "center"
    },
    colorInput: {
        height: 50,
        width: 224,
        borderWidth: 1,
        borderColor: "#B6B6B6",
        textAlign: "center"
    },
    slidersContainer: {
        justifyContent: "space-around",
        alignItems: "center",
        flexDirection: "row",
        padding: 10
    },
    rgbInput: {
        width: 50,
        height: 30,
        borderWidth: 1,
        borderColor: "#B6B6B6",
        textAlign: "center"
    },
    rgbText: {
        fontSize: 14,
        fontWeight: "300",
        textAlign: "center",
    }
})

export default ColorPicker2