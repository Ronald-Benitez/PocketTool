import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSQLiteContext } from 'expo-sqlite';

import { useLanguage } from '@/src/lang/LanguageContext';
import styles from '@/src/styles/styles';
import ColorSettings from "@/src/components/settings/colors-settings"
import IconButton from '@/src/components/ui/icon-button';
import { exportDatabaseToSQLFile, importDatabaseFromSQLFile } from '@/src/db/utils';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SettingsScreen = () => {
    const { language, changeLanguage, t } = useLanguage();
    const db = useSQLiteContext()

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
            <View style={localStyles.languageContainer}>
                <Pressable style={localStyles.languageBlock} onPress={onPressLanguage}>
                    <Text style={localStyles.languageText}>
                        {language == "en" ? t('settings.languages.english') : t('settings.languages.spanish')}
                    </Text>
                </Pressable>
            </View>
            <View style={localStyles.dbContainer}>
                <IconButton onClick={() => exportDatabaseToSQLFile(db, t)}>
                    <MaterialCommunityIcons name="cloud-upload-outline" size={24} color="black" />

                </IconButton>
                <IconButton onClick={() => importDatabaseFromSQLFile(db, t)}>
                    <MaterialCommunityIcons name="cloud-download-outline" size={24} color="black" />
                </IconButton>
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
    languageContainer: {
        flexDirection: "row",
        justifyContent: "center"
    },
    dbContainer: {
        flexDirection: "row",
        justifyContent: "space-around"
    }
});
