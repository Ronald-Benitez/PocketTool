import { View, ScrollView, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Feather } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import { useGroups, useRecords } from '@/src/db';
import { Group } from '@/src/interfaces';
import GroupSelector from '@/src/components/groups/group-selector';
import styles from '@/src/styles/styles';
import useRecordsStore from '@/src/stores/RecordsStore';
import useColorStore from '@/src/stores/ColorsStore';
import FinanceSimpleBlock from '@/src/components/ui/FinanceSimpleBlock';
import DetailedFinanceBlock from '@/src/components/ui/DetailedFinanceBlock';
import BalanceBlock from '@/src/components/ui/BalanceBlock';
import FinnanceTableBlock from '@/src/components/ui/FinanceTableBlock';
import useResumesStore from '@/src/stores/ResumesStore';

const Index = () => {
    const { t } = useLanguage();
    const { group, setGroup, resumes, setResumes } = useRecordsStore()
    const records = useRecords();
    const { fetchGroupsById, fetchLastGroup } = useGroups();
    const [openUpdate, setOpenUpdate] = useState(false)
    const { colors } = useColorStore()
    const { balance, balanceByRecordType } = useResumesStore()

    // useEffect(() => {
    //     getPinned();
    // }, []);

    // useEffect(() => {
    //     if (!group) return;
    //     loadTotals(group.id);
    // }, [group?.id]);

    // const getPinned = async () => {
    //     const pinned = await AsyncStorage.getItem('group');
    //     if (pinned) {
    //         const p = Number(pinned);
    //         fetchGroupsById(p).then(g => {
    //             setGroup(g as Group);
    //         });
    //     } else {
    //         fetchLastGroup().then(g => {
    //             setGroup(g as Group);
    //         });
    //     }
    // };

    // const loadTotals = async (groupId: number) => {
    //     const res = await records.getAllResume(groupId)
    //     setResumes(res)
    // };

    return (
        <>
            <View style={localStyles.container}>
                <View style={[styles.row, { justifyContent: 'center', alignItems: "flex-end", marginBottom: 10, gap: 10 }]}>
                    <GroupSelector />
                    {/* {
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
                    } */}

                </View>

                <BalanceBlock
                    bottom={false}
                    text={t('resume.balance')}
                    value={(balance || 0).toFixed(2)}
                    color={balance < 0 ? colors?.ExpenseColor : colors?.IncomeColor}
                />
            </View >
            <ScrollView style={{ flex: 1 }}>
                <View style={localStyles.container}>
                    {/* <View style={localStyles.simpleContainer}>
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
                            text={t("resume.transfers")}
                            color={colors?.TransferColor}
                            value={String(resumes?.transferTotal || 0)}
                        />
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
                    </View>
                    <View style={localStyles.simpleContainer}>
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
                    </View>
                    <View style={localStyles.simpleContainer}>
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
                        value={String((resumes?.totalWithoutDebts || 0).toFixed(2))}
                        color={resumes ? (resumes?.totalWithoutDebts < 0 ? colors?.ExpenseColor : colors?.IncomeColor) : colors?.Debit}
                    /> */}
                    {
                        balanceByRecordType?.map((item) => (
                            <View style={localStyles.simpleContainer} key={item?.id}>
                                <FinanceSimpleBlock
                                    text={item.type_name}
                                    value={String(item.total)}
                                    color={item.record_color}
                                />
                            </View>
                        ))
                    }
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
        gap: 30,
        paddingVertical: 15
    },
    container: {
        padding: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        width: '100%',
    }
})

export default Index;
