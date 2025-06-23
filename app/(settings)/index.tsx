import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { useLanguage } from '@/src/lang/LanguageContext';
import styles from '@/src/styles/styles';
import ColorSettings from "@/src/components/settings/colors-settings"
import IconButton from '@/src/components/ui/icon-button';
import { exportDatabaseToSQLFile, importDatabaseFromSQLFile } from '@/src/db/utils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useConfigs from '@/src/hooks/useConfigs';
import { useDataStore } from '@/src/stores';
import BaseSelect from '@/src/components/ui/base-select';
import BorderLeftBlock from '@/src/components/ui/BorderLeftBlock';

const SettingsScreen = () => {
    const { language, changeLanguage, t } = useLanguage();
    const { configs, saveConfigs } = useConfigs();
    const db = useSQLiteContext()
    const { RecordTypes } = useDataStore()

    const onPressLanguage = () => {
        if (language == "en") {
            changeLanguage("es")
        } else {
            changeLanguage("en")
        }
    }

    useEffect(() => {
        if (configs?.recordTypes?.length <= 0) {
            saveConfigs({
                recordTypes: [1, 2] // 1: income, 2: expense
            })
        }
    }, [])

    const onTypesChange = (value: number) => {
        const type = RecordTypes[value];
        const set = new Set(configs?.recordTypes || []);
        console.log("Selected Type: ", type, value, configs?.recordTypes);
        if (!type?.id) return;
        if (configs?.recordTypes?.includes(type.id)) {
            saveConfigs({
                recordTypes: configs.recordTypes.filter(rt => rt !== type.id)
            });
        }
        else {
            saveConfigs({
                recordTypes: [...(configs?.recordTypes || []), type.id]
            });
        }
    }

    const SelectTypeBlockRender = (index: number) => {

        const transformStyle = {
            transform: Array.isArray(configs?.recordTypes) && configs.recordTypes.includes(RecordTypes[index]?.id || 0) ? [{ scale: 0.95 }] : [{ scale: 1 }]
        };
        return (
            <BorderLeftBlock color={RecordTypes[index].record_color} style={transformStyle}>
                <Text style={[styles.text]}>{RecordTypes[index].type_name}</Text>
            </BorderLeftBlock>
        )
    }

    const SelectedTypeBlockRender = () => {
        const selected = RecordTypes.filter(rt => configs?.recordTypes?.includes(rt?.id || 0));
        
        if (selected.length <= 0) {
            return (
                <View style={[styles.borderedContainer, { borderColor: "#B6B6B6" }]}>
                    <Text style={[styles.text]}>{t('settings.selectRecordType')}</Text>
                </View>
            )
        }

        return (
            <View style={[localStyles.block, { borderColor: selected[0].record_color }]}>
                <Text style={[styles.text]}>{selected.map(rt => rt.type_name).join(", ")}</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* <Text style={localStyles.languageText}>{t('settings.selectLanguage')}</Text> */}
            <View style={localStyles.container}>
                <Pressable style={localStyles.block} onPress={onPressLanguage}>
                    <Text style={localStyles.languageText}>
                        {language == "en" ? t('settings.languages.english') : t('settings.languages.spanish')}
                    </Text>
                </Pressable>
            </View>
            <View style={localStyles.container}>
                <BaseSelect
                    options={RecordTypes.map(rt => rt.type_name)}
                    selected={configs?.recordTypes || []}
                    onChange={onTypesChange}
                    title={t('settings.selectRecordType')}
                    label={t('settings.selectRecordType')}
                    render={SelectTypeBlockRender}
                >
                    <SelectedTypeBlockRender />
                </BaseSelect>
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
    block: {
        width: 300,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#B6B6B6"
    },
    container: {
        flexDirection: "row",
        justifyContent: "center"
    },
    dbContainer: {
        flexDirection: "row",
        justifyContent: "space-around"
    }
});
