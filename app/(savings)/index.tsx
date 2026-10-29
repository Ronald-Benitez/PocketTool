import { View, Text, ScrollView, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LineChart, lineDataItem } from "react-native-gifted-charts";

import { useLanguage } from '@/src/lang/LanguageContext';
import { IconButton } from '@/src/ui/actions/IconButton';
import SavingsSelector from '@/src/components/savings/saving-selector';
import AddSaving from '@/src/components/savings/add-savings';
import useSavingsStore from '@/src/stores/SavingsStore';
import useDate from '@/src/hooks/useDate';
import { Saving } from '@/src/interfaces/schema';
import { useSavings } from '@/src/db';
import useColorStore from '@/src/stores/ColorsStore';
import { formatMoney } from '@/src/utils';
import { Dialog } from '@/src/ui/overlays/Dialog';
import { Surface } from '@/src/ui/primitives/Surface';

const Index = () => {
    const { t } = useLanguage();
    const { saving, savingsHistory, setSaving, setSavingsHistory, setSavings } = useSavingsStore()
    const [pinned, setPinned] = useState(saving?.id)
    const [deleteVisible, setDeleteVisible] = useState(false)
    const [chartData, setChartData] = useState<lineDataItem[]>([])
    const { deleteSavings, fetchSavings } = useSavings()
    const date = useDate()
    const { colors } = useColorStore()

    useEffect(() => {
        if (savingsHistory) {
            const data = savingsHistory.map(e => {
                return {
                    value: Number(formatMoney(e.new_amount))
                }
            })
            if (savingsHistory.length > 0) {
                data.push({ value: Number(formatMoney(savingsHistory[savingsHistory.length - 1].previous_amount)) })
            }
            data.reverse()
            setChartData(data)
        }
    }, [savingsHistory])

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
            <IconButton
                label={isPinned ? t('savings.unpin') : t('savings.pin')}
                variant='surface'
                selected={isPinned}
                icon={<Ionicons name={isPinned ? "pin" : "pin-outline"} size={24} color={colors?.text} />}
                onPress={pinUp}
            />
        )
    }

    const onConfirmDelete = async () => {
        if (!saving?.id) return
        await deleteSavings(saving.id)
        setSaving(null)
        const newSavings = await fetchSavings() as Saving[]
        setSavings(newSavings)
        setSavingsHistory([])
        setDeleteVisible(false)
    }

    return (
        <>
            <View style={localStyles.rowContainer}>
                <View style={localStyles.colContainer}>
                    <View style={{ marginBottom: 8 }}>
                        <SavingsSelector>
                            <View style={localStyles.iconButton}>
                                <MaterialIcons name='list' size={20} color={colors?.text} />
                            </View>
                        </SavingsSelector>
                    </View>
                    <Pin />
                </View>
                <View style={localStyles.colContainer}>
                    <Text style={[localStyles.valueText, { color: colors?.text }]}> $
                        {
                            saving ? formatMoney(saving.amount) : "00.00"
                        }
                    </Text>
                    <Text style={[localStyles.nameText, { color: colors?.textMuted }]}>
                        {
                            saving ? saving?.saving_name : "Create a saving"
                        }
                    </Text>
                </View>
                <View style={[localStyles.colContainer, { paddingTop: 5 }]}>
                    {
                        saving && (
                            <AddSaving isEditing={true}>
                                <View style={localStyles.iconButton}>
                                    <Feather name='edit-2' size={20} color={colors?.text} />
                                </View>
                            </AddSaving>
                        )
                    }
                    <AddSaving isEditing={false}>
                        <View style={localStyles.iconButton}>
                            <AntDesign name='plus' size={20} color={colors?.text} />
                        </View>
                    </AddSaving>
                </View>
            </View>
            <View style={localStyles.chartContainer}>
                <LineChart
                    data={chartData}
                    color={colors?.text}
                    thickness={1}
                    dataPointsColor={colors?.primary}
                    yAxisTextStyle={[localStyles.chartYText, { color: colors?.textMuted }]}
                    yAxisLabelPrefix='$'
                    yAxisOffset={10}
                    yAxisColor={colors?.border}
                    xAxisColor={colors?.border}
                    width={300}
                    height={300}
                    adjustToWidth={true}
                />
            </View>
            <ScrollView>
                <View style={{ gap: 5, marginHorizontal: 10 }}>
                    {
                        savingsHistory?.map(e => {
                            const minus = (e.new_amount - e.previous_amount) < 0
                            return (
                                <Surface key={e.id} variant='muted' padding='sm' style={{ marginBottom: 5 }}>
                                    <View style={[localStyles.rowContainer, { justifyContent: "space-between", flex: 1 }]}>
                                        <Text style={[localStyles.dateText, { color: colors?.textMuted }]}>
                                            {
                                                date.getStringDate(e.change_date) + "     " +
                                                new Date(e.change_date).toISOString().split("T")[1]
                                            }
                                        </Text>
                                        <Text style={[localStyles.amountText, { color: colors?.text }]}>${formatMoney(e.new_amount)}</Text>
                                        <View style={[{ alignItems: "center", flexDirection: "row", gap: 5, justifyContent: "center" }]}>
                                            <Text style={[localStyles.differenceText, { color: colors?.textMuted }]}>${formatMoney(e.new_amount - e.previous_amount)}</Text>
                                            <Feather name={minus ? "arrow-down" : "arrow-up"} size={20} color={minus ? colors?.ExpenseColor : colors?.IncomeColor} />
                                        </View>
                                    </View>
                                </Surface>
                            )
                        })
                    }
                </View>
            </ScrollView>
            <View style={[localStyles.rowContainer, { justifyContent: "center" }]}>
                {
                    saving && (
                        <IconButton
                            label={t('savings.delete')}
                            variant='surface'
                            icon={<MaterialIcons name='delete-outline' size={20} color={colors?.danger} />}
                            onPress={() => setDeleteVisible(true)}
                        />
                    )
                }
            </View>
            <Dialog
                visible={deleteVisible}
                title={t("delete")}
                message={t("confirmDelete")}
                confirmLabel={t("confirm")}
                cancelLabel={t("cancel")}
                closeLabel={t("cancel")}
                tone='danger'
                onConfirm={onConfirmDelete}
                onCancel={() => setDeleteVisible(false)}
            />
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
    },
    colContainer: {
        flexDirection: "column",
        gap: 5,
        justifyContent: "center"
    },
    iconButton: {
        width: 44,
        height: 44,
        alignItems: "center",
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
    differenceText: {
        fontSize: 10,
        textAlign: "left",
        fontWeight: "200"
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
