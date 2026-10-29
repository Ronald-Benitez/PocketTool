import { Text, StyleSheet, View, TextInput } from "react-native";
import * as Clipboard from 'expo-clipboard';
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";

import useToast from '../../hooks/useToast';
import ModalContainer from "./modal-container";
import { useLanguage } from "@/src/lang/LanguageContext";
import IconButton from "./icon-button";
import { useTheme } from "@/src/ui/theme/ThemeProvider";

interface props {
    color: string,
    onChange: (color: string) => void
}

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

const toHex = (r: number, g: number, b: number, a: number) => {
    const toHexPart = (val: number) => Math.round(val).toString(16).padStart(2, '0');
    const alpha = a < 255 ? toHexPart(a) : '';
    return `#${toHexPart(r)}${toHexPart(g)}${toHexPart(b)}${alpha}`.toUpperCase();
};

const verifyNumber = (val: string) => {
    const number = Number(val)
    return isNaN(number) ? 0 : number > 255 ? 255 : number
}

const ColorPicker2 = ({ color, onChange }: props) => {
    const { t } = useLanguage()
    const { showToast, ToastContainer } = useToast();
    const { colors } = useTheme()
    const [inputColor, setInputColor] = useState(color)
    const [r, setR] = useState(0)
    const [g, setG] = useState(0)
    const [b, setB] = useState(0)
    const [a, setA] = useState(255)

    const handleCopy = async () => {
        await Clipboard.setStringAsync(color);
        showToast({ message: t("colors.copied"), type: 'SUCCESS' });
    };

    const handlePaste = async () => {
        const value = await Clipboard.getStringAsync();
        if (verifyValidHex(value)) {
            setInputColor(value);
            onChange(value);
        } else {
            showToast({ message: t("colors.invalid"), type: 'ERROR' });
        }
    };

    const handleHexChange = (value: string) => {
        setInputColor(value);
        if (verifyValidHex(value)) {
            onChange(value);
        }
    };

    useEffect(() => {
        setInputColor(color)
        const converted = hexToRGBA(color)
        if (converted) {
            setR(converted.r)
            setG(converted.g)
            setB(converted.b)
            setA(converted.a)
        }
    }, [color])

    const updateChannel = (type: "r" | "g" | "b" | "a", value: number) => {
        const next = {
            r: type === "r" ? value : r,
            g: type === "g" ? value : g,
            b: type === "b" ? value : b,
            a: type === "a" ? value : a,
        }
        setR(next.r)
        setG(next.g)
        setB(next.b)
        setA(next.a)
        onChange(toHex(next.r, next.g, next.b, next.a))
    }

    const pickButton = () => (
        <View style={[localStyles.colorBlock, { backgroundColor: color, borderColor: colors.border }]}>
        </View>
    )

    const channelRow = (
        label: string,
        value: number,
        tint: string,
        channel: "r" | "g" | "b" | "a"
    ) => (
        <View style={localStyles.slidersContainer}>
            <Text style={[localStyles.rgbText, { color: colors.text }]}>{label}</Text>
            <Slider
                style={{ width: 220 }}
                minimumValue={0}
                maximumValue={255}
                minimumTrackTintColor={tint}
                maximumTrackTintColor={colors.border}
                value={value}
                onValueChange={e => updateChannel(channel, Math.floor(e))}
            />
            <TextInput
                style={[
                    localStyles.rgbInput,
                    { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text },
                ]}
                value={String(value)}
                keyboardType="number-pad"
                onChangeText={e => updateChannel(channel, verifyNumber(e))}
            />
        </View>
    )

    return (
        <>
            <ModalContainer buttonOpen={pickButton()} title={t("colors.set")} >
                <>
                    <View style={localStyles.headBlock}>
                        <IconButton onClick={handleCopy}>
                            <MaterialIcons name="content-copy" size={24} color={colors.text} />
                        </IconButton>
                        <View style={[localStyles.colorViewer, { backgroundColor: color, borderColor: colors.border }]}>
                        </View>
                        <IconButton onClick={handlePaste}>
                            <MaterialIcons name="content-paste" size={24} color={colors.text} />
                        </IconButton>
                    </View>
                    <View style={localStyles.rowCentered}>
                        <TextInput
                            onChangeText={handleHexChange}
                            value={inputColor}
                            autoCapitalize="characters"
                            style={[
                                localStyles.colorInput,
                                { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text },
                            ]}
                        />
                    </View>
                    <ScrollView >
                        {channelRow("R", r, "#ff0000", "r")}
                        {channelRow("G", g, "#00ff00", "g")}
                        {channelRow("B", b, "#0000ff", "b")}
                        {channelRow("A", a, colors.text, "a")}
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
        borderRadius: 10,
        borderWidth: 1,
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
        borderRadius: 5,
        borderWidth: 1,
    },
    rowCentered: {
        flexDirection: "row",
        justifyContent: "center"
    },
    colorInput: {
        height: 50,
        width: 224,
        borderWidth: 1,
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
        height: 40,
        borderWidth: 1,
        textAlign: "center"
    },
    rgbText: {
        fontSize: 14,
        fontWeight: "300",
        textAlign: "center",
    }
})

export default ColorPicker2
