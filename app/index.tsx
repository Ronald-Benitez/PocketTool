import { View, Text, ScrollView, TextStyle, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';

import { useLanguage } from '@/src/lang/LanguageContext';
import styles from '@/src/styles/styles';
import useColorStore from '@/src/stores/ColorsStore';
import GroupSelector from '@/src/components/groups/group-selector';
import IndexBlock from '@/src/components/ui/IndexBlock';
import FinanceSimpleBlock from '@/src/components/ui/FinanceSimpleBlock';
import useRecordsStore from '@/src/stores/RecordsStore';

const Index = () => {
    const { t } = useLanguage();
    const { initializeColors, colors } = useColorStore()
    const { resumes, group } = useRecordsStore()

    useEffect(() => {
        initializeColors()
    }, [])


    return (
        <View style={styles.container}>
            <View style={[{ justifyContent: "flex-start", alignItems: "center", height: "100%", gap: 20 }]}>
                <GroupSelector />
                <View style={localStyles.blocksContainer}>
                    <IndexBlock>
                        <FinanceSimpleBlock
                            text={t("resume.balance")}
                            value={String(Math.abs(resumes?.balance || 0))}
                            color={resumes ? (resumes?.balance < 0 ? colors?.ExpenseColor : colors?.IncomeColor) : colors?.GoalColor}
                        />
                    </IndexBlock>
                    <IndexBlock>
                        <FinanceSimpleBlock
                            text={t("resume.goal")}
                            value={String(group?.goal)}
                            color={colors?.GoalColor}
                        />
                    </IndexBlock>
                    <IndexBlock>
                        <FinanceSimpleBlock
                            text={t("resume.credit")}
                            value={String(resumes?.expenseCredit)}
                            color={colors?.Credit}
                        />
                    </IndexBlock>
                    <IndexBlock>
                        <Text style={localStyles.blockText}>{t("resume.today")}</Text>
                        <View style={localStyles.rowContainer}>
                            <FinanceSimpleBlock
                                text={t("resume.incomes")}
                                value={String(resumes?.todayTotal?.totalIncomeToday || 0)}
                                color={colors?.IncomeColor}
                                blockwidth={150}
                            />
                            <FinanceSimpleBlock
                                text={t("resume.expenses")}
                                value={String(resumes?.todayTotal?.totalExpenseToday || 0)}
                                color={colors?.ExpenseColor}
                                blockwidth={150}
                            />
                        </View>
                    </IndexBlock>
                </View>
            </View>
        </View>
    );
};

const localStyles = StyleSheet.create({
    blocksContainer: {
        flexDirection: "column",
        gap: 10
    },
    rowContainer: {
        flexDirection: "row"
    },
    blockText: {
        fontWeight: "200",
        fontSize: 12,
        marginBottom: 10
    }
})
export default Index;
