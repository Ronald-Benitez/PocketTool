import { View, ScrollView, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';

import { useLanguage } from '@/src/lang/LanguageContext';
import GroupSelector from '@/src/components/groups/group-selector';
import styles from '@/src/styles/styles';
import useColorStore from '@/src/stores/ColorsStore';
import FinanceSimpleBlock from '@/src/components/ui/FinanceSimpleBlock';
import BalanceBlock from '@/src/components/ui/BalanceBlock';
import useResumesStore from '@/src/stores/ResumesStore';
import { formatMoney } from '@/src/utils';

const Index = () => {
    const { t } = useLanguage();
    const { colors } = useColorStore()
    const { balance, balanceByRecordType } = useResumesStore()


    return (
        <>
            <View style={localStyles.container}>
                <View style={[styles.row, { justifyContent: 'center', alignItems: "flex-end", marginBottom: 10, gap: 10 }]}>
                    <GroupSelector />
                </View>

                <BalanceBlock
                    bottom={false}
                    text={t('resume.balance')}
                    value={formatMoney(balance)}
                    color={balance < 0 ? colors?.ExpenseColor : colors?.IncomeColor}
                />
            </View >
            <ScrollView style={{ flex: 1 }}>
                <View style={localStyles.container}>
                    {
                        balanceByRecordType?.map((item) => (
                            <View style={localStyles.simpleContainer} key={item?.id}>
                                <FinanceSimpleBlock
                                    text={item.type_name}
                                    value={formatMoney(item.total)}
                                    color={item.record_color ?? undefined}
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
