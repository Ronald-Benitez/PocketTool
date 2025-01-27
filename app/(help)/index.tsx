import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

import { useLanguage } from '@/src/lang/LanguageContext'

import styles from '@/src/styles/styles'

const Index = () => {
    const { t } = useLanguage()

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={localStyles.helpContainer}>
                    <View style={localStyles.titleContainer}>
                        <Text style={localStyles.helpTitle}>{t('help.title.financials')}</Text>
                        <Ionicons name="wallet-outline" size={24} color={"#000"} />
                    </View>
                    <Text style={localStyles.helpDescription}>{t('help.description.financials')}</Text>
                </View>
                <View style={localStyles.helpContainer}>
                    <View style={localStyles.titleContainer}>
                        <Text style={localStyles.helpTitle}>{t('help.title.summary')}</Text>
                        <Ionicons name="stats-chart-outline" size={24} color={"#000"} />
                    </View>
                    <Text style={localStyles.helpDescription}>{t('help.description.summary')}</Text>
                </View>
                <View style={localStyles.helpContainer}>
                    <View style={localStyles.titleContainer}>
                        <Text style={localStyles.helpTitle}>{t('help.title.budgets')}</Text>

                        <Ionicons name="wallet-outline" size={24} color={"#000"} />
                    </View>
                    <Text style={localStyles.helpDescription}>{t('help.description.budgets')}</Text>
                </View>
                <View style={localStyles.helpContainer}>
                    <View style={localStyles.titleContainer}>
                        <Text style={localStyles.helpTitle}>{t('help.title.credits')}</Text>
                        <MaterialCommunityIcons name="bank-off-outline" size={24} color={"#000"} />
                    </View>
                    <Text style={localStyles.helpDescription}>{t('help.description.credits')}</Text>
                </View>
                <View style={localStyles.helpContainer}>
                    <View style={localStyles.titleContainer}>
                        <Text style={localStyles.helpTitle}>{t('help.title.savings')}</Text>
                        <MaterialCommunityIcons name="piggy-bank-outline" size={24} color={"#000"} />
                    </View>
                    <Text style={localStyles.helpDescription}>{t('help.description.savings')}</Text>
                </View>

            </View >
        </ScrollView>
    )
}

const localStyles = StyleSheet.create({
    helpContainer: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 5,
        margin: 10,
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'column',

    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignContent: 'center',
        gap: 10,
        marginBottom: 10
    },
    helpTitle: {
        fontSize: 20,
        fontWeight: '400',
        textAlign: 'center',
        marginBottom: 10
    },
    helpDescription: {
        fontSize: 16,
        textAlign: 'left',
        fontWeight: "200"
    }
})

export default Index