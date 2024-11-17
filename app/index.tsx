import { View, Text, ScrollView, TextStyle, StyleSheet, Pressable } from 'react-native';
import React, { useEffect } from 'react';
import { AntDesign } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import styles from '@/src/styles/styles';
import useColorStore from '@/src/stores/ColorsStore';
import GroupSelector from '@/src/components/groups/group-selector';
import IndexBlock from '@/src/components/ui/IndexBlock';
import FinanceSimpleBlock from '@/src/components/ui/FinanceSimpleBlock';
import useRecordsStore from '@/src/stores/RecordsStore';
import AddItem from '@/src/components/records/add-record';

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
                            value={Math.abs(resumes?.balance || 0).toFixed(2)}
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
                            value={String((resumes?.expenseCredit || 0) + (resumes?.transferCredit || 0))}
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
                            <View style={[{ position: "absolute", right: -10, top: -40 }]}>
                                {
                                    group && (
                                        <AddItem>
                                            <View style={[localStyles.button]}>
                                                <AntDesign size={20} name='plus' color={"#000"} />
                                            </View>
                                        </AddItem >
                                    )
                                }
                            </View>
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
    },
    button: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center"
    }
})
export default Index;
