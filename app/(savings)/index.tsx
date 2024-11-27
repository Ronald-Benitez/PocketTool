import { View, Text, ScrollView, TextStyle, TurboModuleRegistry, ViewStyle, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LineChart, lineDataItem } from "react-native-gifted-charts";

import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
import useColorStore from '@/src/stores/ColorsStore';
import IconButton from '@/src/components/ui/icon-button';
import SavingsSelector from '@/src/components/savings/saving-selector';
import AddSaving from '@/src/components/savings/add-savings';
import useSavingsStore from '@/src/stores/SavingsStore';
import { useSavings, useSavingsHistory } from '@/src/db';
import { Savings, SavingsHistory } from '@/src/interfaces';
import BGSimpleBlock from '@/src/components/ui/BGSimpleBlock';
import useDate from '@/src/hooks/useDate';
import useBaseModal from '@/src/components/ui/base-modal';
import styles from '@/src/styles/styles';

const Index = () => {
    const { t } = useLanguage();
    const [openUpdate, setOpenUpdate] = useState(false)
    const { colors } = useColorStore()
    const { saving, savingsHistory, setSaving, setSavingsHistory, setSavings } = useSavingsStore()
    const { fetchSavingsById, deleteSavings, fetchSavings } = useSavings()
    const { fetchSavingsHistoryBySavingId, deleteSavingsHistory } = useSavingsHistory()
    const [pinned, setPinned] = useState(saving?.id)
    const { CustomModal, showModal, hideModal } = useBaseModal(true)
    const [chartData, setChartData] = useState<lineDataItem[]>([])


    useEffect(() => {
        getPinned();
    }, []);

    useEffect(() => {
        if (savingsHistory) {
            const historyCopy = [...savingsHistory]
            const data = historyCopy.reverse().map(e => {
                return {
                    value: e.new_amount
                }
            })
            setChartData(data)
        }
    }, [savingsHistory])


    const getPinned = async () => {
        const pinned = await AsyncStorage.getItem('savings');
        if (pinned) {
            const p = Number(pinned)
            fetchSavingsById(p).then(g => {
                onSelect(g as Savings)
            })
        }
    };

    const onSelect = async (saving: Savings) => {
        setSaving(saving)
        await fetchSavingsHistoryBySavingId(saving.id).then((res) => {
            setSavingsHistory(res as SavingsHistory[])
        })
    }

    const pinUp = async () => {
        if (!saving) return
        if (pinned != 0 && pinned === saving?.id) {
            await AsyncStorage.removeItem("savings")
            setPinned(0)
        } else {
            await AsyncStorage.setItem("savings", String(saving.id))
            setPinned(saving.id)
        }
    }

    const Pin = () => {
        let isPinned = false

        if (pinned != 0 && pinned === saving?.id) {
            isPinned = true
        }

        return (
            <IconButton onClick={pinUp}>
                <Ionicons name={isPinned ? "pin" : "pin-outline"} size={24} color="#000" />
            </IconButton>

        )
    }

    const onConfirmDelete = async () => {
        if (!saving) return
        await deleteSavings(saving.id)
        await deleteSavingsHistory(saving.id)
        setSaving(null)
        const newSavings = await fetchSavings()
        setSavings(newSavings)
        setSavingsHistory([])
        hideModal()
    }

    return (
        <>
            <View style={localStyles.rowContainer}>
                <View style={localStyles.colContainer}>
                    <View style={{ marginBottom: 8 }}>
                        <SavingsSelector>
                            <IconButton isButton={false}>
                                <MaterialIcons name='list' size={20} color={"#000"} />
                            </IconButton>
                        </SavingsSelector>
                    </View>
                    <Pin />
                </View>
                <View style={localStyles.colContainer}>
                    <Text style={localStyles.valueText}> $
                        {
                            saving ? saving?.amount : "00.00"
                        }
                    </Text>
                    <Text style={localStyles.nameText}>
                        {
                            saving ? saving?.saving_name : "Create a saving"
                        }
                    </Text>
                </View>
                <View style={[localStyles.colContainer, { paddingTop: 5 }]}>
                    {
                        saving && (
                            <AddSaving isEditing={true}>
                                <IconButton isButton={false}>
                                    <Feather name='edit-2' size={20} color={"#000"} />
                                </IconButton>
                            </AddSaving>
                        )
                    }
                    <AddSaving>
                        <IconButton isButton={false}>
                            <AntDesign name='plus' size={20} color={"#000"} />
                        </IconButton>
                    </AddSaving>
                </View>
            </View>
            <View style={localStyles.chartContainer}>
                <LineChart
                    data={chartData}
                    color={'#000'}
                    thickness={1}
                    dataPointsColor={'#45ADBF'}
                    yAxisTextStyle={localStyles.chartYText}
                    yAxisLabelPrefix='$'
                    yAxisOffset={10}
                    width={250}
                    yAxisColor="#9c9c9c"
                    xAxisColor="#9c9c9c"
                    height={300}
                />
            </View>
            <ScrollView>
                <View style={{ gap: 5, marginHorizontal: 10 }}>
                    {
                        savingsHistory?.map(e => (
                            <BGSimpleBlock key={e.id}>
                                <View style={[localStyles.rowContainer, { justifyContent: "space-between", flex: 1 }]}>
                                    <Text style={localStyles.dateText}>
                                        {
                                            useDate().getStringDate(e.change_date) + "     " +
                                            new Date(e.change_date).toISOString().split("T")[1]
                                        }
                                    </Text>
                                    <Text style={localStyles.amountText}>${e.new_amount}</Text>
                                </View>
                            </BGSimpleBlock>
                        ))
                    }
                </View>
            </ScrollView>
            <View style={[localStyles.rowContainer, { justifyContent: "center" }]}>
                <IconButton onClick={showModal}>
                    <MaterialIcons name='delete-outline' size={20} color={"#000"}></MaterialIcons>
                </IconButton>
            </View>
            <CustomModal title={t("delete")}>
                <View style={styles.col}>
                    <Text style={styles.text}>{t("confirmDelete")}</Text>
                    <View style={[styles.row, { justifyContent: "space-around" }]}>
                        <TouchableOpacity style={styles.button} onPress={hideModal}>
                            <Text style={styles.text}>{t("cancel")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.enfasizedButton} onPress={onConfirmDelete}>
                            <Text style={styles.text}>{t("confirm")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </CustomModal>
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
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        paddingHorizontal: 30,
    },
    colContainer: {
        flexDirection: "column",
        gap: 5,
        justifyContent: "center"
    },
    valueText: {
        fontSize: 16,
        textAlign: "center",
        fontWeight: "500"
    },
    nameText: {
        fontSize: 8,
        textAlign: "center",
        fontWeight: "200"
    },
    dateText: {
        fontSize: 10,
        textAlign: "left",
        fontWeight: "200"
    },
    amountText: {
        fontSize: 12,
        textAlign: "left",
        fontWeight: "300",
    },
    chartContainer: {
        marginHorizontal: 40,
        marginVertical: 20,
        // borderWidth: 1,
        // borderColor: "#00",
        justifyContent: "center"
    },
    chartYText: {
        fontSize: 10,
        fontWeight: 200
    }
})

export default Index;
