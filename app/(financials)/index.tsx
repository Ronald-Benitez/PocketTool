import { View, Text, ScrollView, TextStyle, TurboModuleRegistry, ViewStyle, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Feather } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import { useGroups, useRecords } from '@/src/db';
import { ResumeTotals } from '@/src/db';
import { Group } from '@/src/interfaces';
import GroupSelector from '@/src/components/groups/group-selector';
import styles from '@/src/styles/styles';
import useRecordsStore from '@/src/stores/RecordsStore';
import AddGroup from '@/src/components/groups/add-group';
import useColorStore from '@/src/stores/ColorsStore';
import FinanceSimpleBlock from '@/src/components/ui/FinanceSimpleBlock';
import DetailedFinanceBlock from '@/src/components/ui/DetailedFinanceBlock';
import BalanceBlock from '@/src/components/ui/BalanceBlock';
import FinnanceTableBlock from '@/src/components/ui/FinnanceTableBlock';
import IconButton from '@/src/components/ui/icon-button';

const Index = () => {
    const { t } = useLanguage();
    const { group, setGroup, resumes, setResumes } = useRecordsStore()
    const records = useRecords();
    const { fetchGroupsById, fetchLastGroup } = useGroups();
    const [openUpdate, setOpenUpdate] = useState(false)
    const { colors } = useColorStore()


    useEffect(() => {
        getPinned();
    }, []);

    useEffect(() => {
        if (!group) return;
        loadTotals(group.id);
    }, [group?.id]);

    const getPinned = async () => {
        const pinned = await AsyncStorage.getItem('group');
        if (pinned) {
            const p = Number(pinned);
            fetchGroupsById(p).then(g => {
                setGroup(g as Group);
            });
        } else {
            fetchLastGroup().then(g => {
                setGroup(g as Group);
            });
        }
    };

    const loadTotals = async (groupId: number) => {
        const res = await records.getAllResume(groupId)
        setResumes(res)
    };

    return (
        <>
            <View style={localStyles.container}>
                <View style={[styles.row, { justifyContent: 'center', alignItems: "flex-end", marginBottom: 10, gap: 10 }]}>
                    <GroupSelector />
                    {
                        group && (
                            <AddGroup
                                openUpdate={openUpdate}
                                setOpenUpdate={setOpenUpdate}
                                group={group}
                            >
                                <IconButton isButton={false}>
                                    <Feather size={20} name='edit' color={"#000"} />
                                </IconButton>
                            </AddGroup>
                        )
                    }

                </View>

                <BalanceBlock
                    bottom={false}
                    text={t('resume.balance')}
                    value={String(Math.abs(resumes?.balance || 0))}
                    color={resumes ? (resumes?.balance < 0 ? colors?.ExpenseColor : colors?.IncomeColor) : colors?.Debit}
                />
            </View >
            <ScrollView>
                <View style={localStyles.container}>
                    <View style={localStyles.simpleContainer}>
                        <FinanceSimpleBlock
                            text={t("resume.incomes")}
                            color={colors?.IncomeColor}
                            value={String(resumes?.incomesTotal)}
                        />
                        <FinanceSimpleBlock
                            text={t("resume.expenses")}
                            color={colors?.ExpenseColor}
                            value={String(resumes?.expensesTotal)}
                        />
                    </View>
                    <View style={localStyles.simpleContainer}>
                        <FinanceSimpleBlock
                            text={t("resume.goal")}
                            color={colors?.GoalColor}
                            value={String(group?.goal)}
                        />
                    </View>
                    <View style={{ height: 25 }}></View>
                    <View style={localStyles.simpleContainer}>
                        <DetailedFinanceBlock
                            text={t("resume.incomesDebit")}
                            color1={colors?.Debit}
                            color2={colors?.IncomeColor}
                            value={String(resumes?.incomeDebit)}
                        />
                        <DetailedFinanceBlock
                            text={t("resume.incomesCredit")}
                            color1={colors?.Credit}
                            color2={colors?.IncomeColor}
                            value={String(resumes?.incomeCredit)}
                        />
                    </View>
                    <View style={localStyles.simpleContainer}>
                        <DetailedFinanceBlock
                            text={t("resume.expensesDebit")}
                            color1={colors?.Debit}
                            color2={colors?.ExpenseColor}
                            value={String(resumes?.expenseDebit)}
                        />
                        <DetailedFinanceBlock
                            text={t("resume.expensesCredit")}
                            color1={colors?.Credit}
                            color2={colors?.ExpenseColor}
                            value={String(resumes?.expenseCredit)}
                        />
                    </View>
                    <BalanceBlock
                        bottom={true}
                        text={t('resume.balanceWithout')}
                        value={String(Math.abs(resumes?.totalWithoutDebts || 0))}
                        color={resumes ? (resumes?.totalWithoutDebts < 0 ? colors?.ExpenseColor : colors?.IncomeColor) : colors?.Debit}
                    />
                    <FinnanceTableBlock render='payments' />
                    <FinnanceTableBlock render='categories' />
                </View>
            </ScrollView>
        </>
    );
};

const localStyles = StyleSheet.create({
    balanceText: {
        borderTopWidth: 4,
        height: 60,
        paddingTop: 10,
        textAlign: "center",
        marginLeft: 5,
        fontWeight: "300",
        fontSize: 18
    },
    simpleContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20
    },
    container: {
        padding: 10,
        paddingHorizontal: 20
    }
})

export default Index;