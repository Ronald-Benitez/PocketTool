import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

import { useLanguage } from '@/src/lang/LanguageContext'
import { useTheme } from '@/src/ui/theme/ThemeProvider'

import { useThemedStyles } from '@/src/styles/useThemedStyles'

const Index = () => {
    const { t } = useLanguage()
    const { colors } = useTheme()
    const styles = useThemedStyles()

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={[localStyles.helpContainer, styles.surface]}>
                    <View style={localStyles.titleContainer}>
                        <Text style={[localStyles.helpTitle, styles.textPrimary]}>{t('help.title.financials')}</Text>
                        <Ionicons name="wallet-outline" size={24} color={colors.text} />
                    </View>
                    <Text style={[localStyles.helpDescription, styles.textMuted]}>{t('help.description.financials')}</Text>
                </View>
                <View style={[localStyles.helpContainer, styles.surface]}>
                    <View style={localStyles.titleContainer}>
                        <Text style={[localStyles.helpTitle, styles.textPrimary]}>{t('help.title.summary')}</Text>
                        <Ionicons name="stats-chart-outline" size={24} color={colors.text} />
                    </View>
                    <Text style={[localStyles.helpDescription, styles.textMuted]}>{t('help.description.summary')}</Text>
                </View>
                <View style={[localStyles.helpContainer, styles.surface]}>
                    <View style={localStyles.titleContainer}>
                        <Text style={[localStyles.helpTitle, styles.textPrimary]}>{t('help.title.budgets')}</Text>

                        <Ionicons name="wallet-outline" size={24} color={colors.text} />
                    </View>
                    <Text style={[localStyles.helpDescription, styles.textMuted]}>{t('help.description.budgets')}</Text>
                </View>
                <View style={[localStyles.helpContainer, styles.surface]}>
                    <View style={localStyles.titleContainer}>
                        <Text style={[localStyles.helpTitle, styles.textPrimary]}>{t('help.title.credits')}</Text>
                        <MaterialCommunityIcons name="bank-off-outline" size={24} color={colors.text} />
                    </View>
                    <Text style={[localStyles.helpDescription, styles.textMuted]}>{t('help.description.credits')}</Text>
                </View>
                <View style={[localStyles.helpContainer, styles.surface]}>
                    <View style={localStyles.titleContainer}>
                        <Text style={[localStyles.helpTitle, styles.textPrimary]}>{t('help.title.savings')}</Text>
                        <MaterialCommunityIcons name="piggy-bank-outline" size={24} color={colors.text} />
                    </View>
                    <Text style={[localStyles.helpDescription, styles.textMuted]}>{t('help.description.savings')}</Text>
                </View>

            </View >
        </ScrollView>
    )
}

const localStyles = StyleSheet.create({
    helpContainer: {
        padding: 10,
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