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

const Index = () => {
    const { t } = useLanguage();
    const { initializeColors, colors } = useColorStore()
    const { resumes, group } = useRecordsStore()
    const [today, setToday] = useState(new Date())

    useEffect(() => {
        initializeColors()
        let date = new Date();
        let offset = date.getTimezoneOffset() * 60 * 1000; // Convertir minutos a milisegundos
        let newDate = new Date(date.getTime() - offset);
        setToday(newDate)

    }, [])

    const decideText = () => {
        const hour = new Date().getHours()
        let message = ""
        let icon = <></>
        console.log(hour)
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

    const [message, Icon] = decideText()

    return (
        <View style={styles.container}>
            <View style={[{ justifyContent: "flex-start", alignItems: "center", height: "100%", gap: 20 }]}>
                <GroupSelector />
                <View style={localStyles.blocksContainer}>
                    <View style={[localStyles.rowContainer, { margin: 10 }]}>
                        <ColorText fontWeight={"200"} fontSize={20}>
                            {message}
                        </ColorText>
                        {Icon}
                    </View>
                    <IndexBlock>
                        <FinanceSimpleBlock
                            text={t("resume.balance")}
                            value={(resumes?.balance || 0).toFixed(2)}
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
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
        justifyContent: "center"
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
