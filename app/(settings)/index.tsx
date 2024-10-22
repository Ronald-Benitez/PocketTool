import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { useLanguage } from '@/src/lang/LanguageContext';
import styles from '@/src/styles/styles';
import ColorSettings from "@/src/components/settings/colors-settings"

const SettingsScreen = () => {
    const { language, changeLanguage, t } = useLanguage();

    const onPressLanguage = () => {
        if (language == "en") {
            changeLanguage("es")
        } else {
            changeLanguage("en")
        }
    }

    return (
        <View style={styles.container}>
            <Text style={localStyles.languageText}>{t('settings.selectLanguage')}</Text>
            <View style={localStyles.lanaguageContainer}>
                <Pressable style={localStyles.languageBlock} onPress={onPressLanguage}>
                    <Text style={localStyles.languageText}>
                        {language == "en" ? t('settings.languages.english') : t('settings.languages.spanish')}
                    </Text>
                </Pressable>
            </View>

            {/* Renderiza todos los colores */}
            <ColorSettings />

        </View>
    );
};

export default SettingsScreen;

const localStyles = StyleSheet.create({
    languageText: {
        fontSize: 12,
        fontWeight: '200',
        textAlign: "center"
    },
    languageBlock: {
        width: 300,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#B6B6B6"
    },
    lanaguageContainer: {
        flexDirection: "row",
        justifyContent: "center"
    }
});
