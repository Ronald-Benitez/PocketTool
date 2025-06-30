import { View, Text, ScrollView, TextStyle, StyleSheet, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import styles from '@/src/styles/styles';
import useColorStore from '@/src/stores/ColorsStore';
import GroupSelector from '@/src/components/groups/group-selector';
import IndexBlock from '@/src/components/ui/IndexBlock';
import FinanceSimpleBlock from '@/src/components/ui/FinanceSimpleBlock';
import useRecordsStore from '@/src/stores/RecordsStore';
import AddItem from '@/src/components/records/add-record';
import ColorText from '@/src/components/ui/color-text';
import useResumesStore from '@/src/stores/ResumesStore';
import { useDataStore } from '@/src/stores';
import { Fixed, FixedJoined, RecordJoined } from '@/src/db/types/tables';
import useConfigs from '@/src/hooks/useConfigs';

const Index = () => {
    const { t } = useLanguage();
    const { initializeColors, colors } = useColorStore()
    const { group } = useRecordsStore()
    const [today, setToday] = useState(new Date())
    const [todayFixeds, setTodayFixeds] = useState<FixedJoined[]>()
    const { balance, todayBalanceByRecordType } = useResumesStore()
    const [fixedToSave, setFixedToSave] = useState<RecordJoined>()
    const { loadConfigs } = useConfigs()
    const [open, setOpen] = useState(false)
    const { records } = useRecordsStore()
    const { Fixeds } = useDataStore()

    useEffect(() => {
        initializeColors()
        let date = new Date();
        let offset = date.getTimezoneOffset() * 60 * 1000;
        let newDate = new Date(date.getTime() - offset);
        setToday(newDate)
        loadConfigs()

    }, [])

    const verifyFixedsForToday = () => {
        const today = new Date()
        const day = today.getDate()
        const list: FixedJoined[] = []
        const todayFixeds = Fixeds.filter(fixed => fixed.fixed_day == day)
        todayFixeds.map((fixed) => {
            const record = records.find(record => record.fixed_id == fixed.id)
            if (!record) {
                list.push(fixed)
            }
        })
        setTodayFixeds(list)
    }

    useEffect(verifyFixedsForToday, [records, Fixeds])

    const decideText = () => {
        const hour = new Date().getHours()
        let message = ""
        let icon = <></>
        if (hour >= 5 && hour < 12) {
            message = t("greeting.morning")
            icon = <MaterialCommunityIcons name="weather-partly-cloudy" size={24} color="#179BAE" />
        } else if (hour >= 12 && hour < 18) {
            icon = <MaterialCommunityIcons name="weather-sunny" size={24} color="#FFB200" />
            message = t("greeting.afternoon")
        } else {
            message = t("greeting.night")
            icon = <MaterialCommunityIcons name="weather-night" size={24} color="blue" />
        }

        return [message, icon]
    }

    const onFixedPress = (item: FixedJoined) => {
        const today = new Date()
        today.setDate(item.fixed_day)
        setFixedToSave({
            ...item,
            amount: item.fixed_amount,
            date: today.getTime(),
            goal: 0,
            group_id: group?.id || 0,
            group_name: "",
            month: today.getMonth(),
            year: today.getFullYear(),
            record_name: item.fixed_name
        })
        setOpen(!open)
    }

    const [message, Icon] = decideText()

    return (
        <ScrollView>
            <View style={[styles.container, { paddingBottom: 20 }]}>
                <View style={[{ justifyContent: "center", alignItems: "center", height: "100%", gap: 20 }]}>
                    <GroupSelector />
                    <View style={localStyles.blocksContainer}>
                        <View style={[localStyles.rowContainer, { margin: 10 }]}>
                            <ColorText fontWeight={"200"} fontSize={20}>
                                {message}
                            </ColorText>
                            {Icon}
                        </View>
                        {
                            todayFixeds && todayFixeds.length > 0 ? (
                                <View style={[localStyles.rowContainer, { backgroundColor: colors?.BGSimple, paddingVertical: 10, paddingTop: 30 }]}>
                                    <ScrollView>
                                        <Text style={[styles.textCenter, styles.smallText]}>{t("index.fixedsMessage")}</Text>
                                        <View style={[localStyles.colContainer, { padding: 10 }]}>
                                            {
                                                todayFixeds?.map((item) => (
                                                    <Pressable key={item.id} onPress={() => onFixedPress(item)} >
                                                        <View style={[localStyles.fixedContainer, {
                                                            borderLeftColor: item.payment_color, borderBottomColor: item.record_color
                                                        }]}>
                                                            <Text style={localStyles.nameText}>{item.fixed_name}</Text>
                                                            <Text style={localStyles.valueText}>${item.fixed_amount}</Text>
                                                        </View>
                                                    </Pressable>
                                                ))
                                            }
                                        </View>
                                    </ScrollView>
                                </View>
                            ) : null
                        }
                        <IndexBlock>
                            <FinanceSimpleBlock
                                text={t("resume.balance")}
                                value={(balance || 0).toFixed(2)}
                                color={balance < 0 ? colors?.ExpenseColor : colors?.IncomeColor}
                            />
                        </IndexBlock>
                        <IndexBlock>
                            <FinanceSimpleBlock
                                text={t("resume.goal")}
                                value={String(group?.goal || 0)}
                                color={colors?.GoalColor}
                            />
                        </IndexBlock>

                        <View style={[localStyles.rowContainer, { position: "relative", backgroundColor: colors?.BGSimple, paddingVertical: 10, paddingTop: 30 }]}>
                            <ScrollView>
                                <Text style={localStyles.blockText}>{t("resume.today")}</Text>
                                <View style={localStyles.colContainer}>
                                    {
                                        todayBalanceByRecordType?.map((item) => (
                                            <FinanceSimpleBlock
                                                key={item.id}
                                                text={item.type_name}
                                                value={item.total.toFixed(2)}
                                                color={item.record_color}
                                            />
                                        ))
                                    }
                                </View>
                            </ScrollView>
                            <View style={[{ position: "absolute", right: 0, top: 0 }]}>
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
                    </View>
                </View>
            </View>
            {
                group && <AddItem open={open} item={fixedToSave} />

            }
            <View style={{ padding: 40 }}></View>
        </ScrollView>
    );
};

const localStyles = StyleSheet.create({
    blocksContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        gap: 10
    },
    rowContainer: {
        flex: 1,
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
        justifyContent: "center"
    },
    colContainer: {
        flexDirection: "column",
        gap: 5,
        alignItems: "center",
        justifyContent: "center"
    },
    blockText: {
        fontWeight: "200",
        fontSize: 12,
        marginBottom: 10,
        textAlign: "center",
    },
    button: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center"
    },
    nameText: {
        fontSize: 12,
        textAlign: "left",
        maxWidth: 200
    },
    valueText: {
        fontSize: 12,
        textAlign: "center",
        fontWeight: "300",
    },
    dayText: {
        borderColor: "#acacac",
        borderWidth: 1,
        borderRadius: 100,
    },
    fixedContainer: {
        justifyContent: "space-between",
        width: "100%",
        flexDirection: "row",
        margin: 10,
        padding: 10,
        borderLeftWidth: 3,
        borderBottomWidth: 1,
        borderBottomLeftRadius: 5,
        borderTopLeftRadius: 5
    }
})
export default Index;
