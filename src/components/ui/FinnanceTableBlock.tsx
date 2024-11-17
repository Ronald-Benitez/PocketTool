import { StyleSheet, Text, View, TextStyle, ViewStyle, StyleProp } from "react-native";

import useColorStore from '@/src/stores/ColorsStore';
import { useLanguage } from "@/src/lang/LanguageContext";
import useRecordsStore from '@/src/stores/RecordsStore';
import FinanceSimpleBlock from "./FinanceSimpleBlock";
import ColorText from "./color-text";

interface props {
    render: "categories" | "payments"
}

type resumeItemBase = {
    totalIncome: number,
    totalExpense: number,
    totalTransfer: number
}

const FinnanceTableBlock = ({ render }: props) => {
    const { colors } = useColorStore()
    const { resumes } = useRecordsStore()
    const { t } = useLanguage()

    const getBorderColor = (val: resumeItemBase): StyleProp<ViewStyle> => {
        const totalExpense = val.totalExpense + val.totalTransfer
        if (val.totalIncome < totalExpense) {
            return {
                borderColor: colors?.ExpenseColor
            }
        } else {
            return {
                borderColor: colors?.IncomeColor
            }
        }
    }

    const getBalance = (val: resumeItemBase) => {
        return val.totalIncome - val.totalExpense - val.totalTransfer
    }

    const renderCategories = (
        <View style={localStyles.container}>
            <Text style={localStyles.headerText}>
                {t("resume.summaryByCategories")}
            </Text>
            {
                resumes?.categoryTotals?.map((val, index) => (
                    <>
                        <View style={[localStyles.headerRow, getBorderColor(val)]}>
                            <ColorText fontSize={12} fontWeight={200}>{val.category_name}</ColorText>
                            <ColorText fontSize={12} fontWeight={200}>${Math.abs(getBalance(val)).toFixed(2)}</ColorText>
                        </View>
                        <View style={[localStyles.colContainer]} key={index}>
                            <View style={localStyles.rowContainer} key={index}>
                                <FinanceSimpleBlock
                                    text=""
                                    value={String(val.totalIncome)}
                                    blockwidth={125}
                                    color={colors?.IncomeColor}
                                />
                                <FinanceSimpleBlock
                                    text=""
                                    value={String(val.totalExpense)}
                                    blockwidth={125}
                                    color={colors?.ExpenseColor}
                                />
                                <FinanceSimpleBlock
                                    text=""
                                    value={String(val.totalTransfer)}
                                    blockwidth={125}
                                    color={colors?.TransferColor}
                                />
                            </View>
                        </View>
                    </>
                ))
            }
        </View>
    )

    const renderPayments = (
        <View style={localStyles.container}>
            <Text style={localStyles.headerText}>
                {t("resume.summaryByPayments")}
            </Text>
            {
                resumes?.paymentMethodTotals?.map((val, index) => (
                    <>
                        <View style={[localStyles.headerRow, getBorderColor(val)]}>
                            <View style={localStyles.nameCircleBlock}>
                                <View style={[localStyles.circle, { backgroundColor: val.type == "debit" ? colors?.Debit : colors?.Credit }]}></View>
                                <ColorText fontSize={12} fontWeight={200}>{val.method_name}</ColorText>
                            </View>
                            <ColorText fontSize={12} fontWeight={200}>${Math.abs(getBalance(val)).toFixed(2)}</ColorText>
                        </View>
                        <View style={localStyles.colContainer} key={index}>
                            <View style={localStyles.rowContainer} key={index}>
                                <FinanceSimpleBlock
                                    text=""
                                    value={String(val.totalIncome)}
                                    blockwidth={125}
                                    color={colors?.IncomeColor}
                                />
                                <FinanceSimpleBlock
                                    text=""
                                    value={String(val.totalExpense)}
                                    blockwidth={125}
                                    color={colors?.ExpenseColor}
                                />
                                <FinanceSimpleBlock
                                    text=""
                                    value={String(val.totalTransfer)}
                                    blockwidth={125}
                                    color={colors?.TransferColor}
                                />
                            </View>
                        </View>
                    </>
                ))
            }
        </View>
    )

    return (
        <>
            {
                render == "categories" ? renderCategories : renderPayments
            }
        </>
    )
}

const localStyles = StyleSheet.create({
    headerText: {
        fontSize: 14,
        textAlign: "center",
        marginTop: 30,
        marginBottom: 10
    },
    nameText: {
        fontWeight: "200",
        fontSize: 12
    },
    footerText: {
        fontWeight: "200",
        fontSize: 8,
        textAlign: "center",
        margin: 0,
        padding: 0
    },
    container: {
        flexDirection: "column",
        gap: 10
    },
    rowContainer: {
        flexDirection: "row",
        gap: 5,
    },
    headerRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        justifyContent: "space-between",
        alignItems: "center"
    },
    colContainer: {
        flexDirection: "column"
    },
    nameCircleBlock: {
        flexDirection: "row",
        alignItems: "center"
    },
    circle: {
        width: 15,
        height: 15,
        borderRadius: 50
    }
})

export default FinnanceTableBlock