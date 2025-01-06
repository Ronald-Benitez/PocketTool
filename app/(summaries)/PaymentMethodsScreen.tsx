import { View, ScrollView,  StyleSheet } from 'react-native';
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
import FinnanceTableBlock from '@/src/components/ui/FinnanceTableBlock';

const PaymentMethodsScreen = () => {
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
                </View>

            </View >
            <ScrollView>
                <View style={localStyles.container}>
                    <FinnanceTableBlock render='payments' />
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

export default PaymentMethodsScreen;
