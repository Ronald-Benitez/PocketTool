import { StyleSheet, Text, View } from "react-native";

import useColorStore from '@/src/stores/ColorsStore';
import { useLanguage } from "@/src/lang/LanguageContext";
import useRecordsStore from '@/src/stores/RecordsStore';
import FinanceSimpleBlock from "./FinanceSimpleBlock";

interface props {
    render: "categories" | "payments"
}

const FinnanceTableBlock = ({ render }: props) => {
    const { colors } = useColorStore()
    const { resumes } = useRecordsStore()
    const { t } = useLanguage()

    const renderCategories = (
        <View style={localStyles.container}>
            <Text style={localStyles.headerText}>
                {t("resume.summaryByCategories")}
            </Text>
            {
                resumes?.categoryTotals?.map((val, index) => (
                    <View style={localStyles.colContainer}>
                        <Text style={localStyles.nameText}>{val.category_name}</Text>
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
                                value={Math.abs(val.totalIncome - val.totalExpense).toFixed(2)}
                                blockwidth={125}
                                color={(val.totalIncome - val.totalExpense) < 0 ? colors?.ExpenseColor : colors?.IncomeColor}
                            />
                        </View>
                    </View>
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
                    <View style={localStyles.colContainer}>
                        <Text style={localStyles.nameText}>{val.method_name}</Text>
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
                                value={Math.abs(val.totalIncome - val.totalExpense).toFixed(2)}
                                blockwidth={125}
                                color={(val.totalIncome - val.totalExpense) < 0 ? colors?.ExpenseColor : colors?.IncomeColor}
                            />
                        </View>
                        <View style={[localStyles.circle, { backgroundColor: val.type == "debit" ? colors?.Debit : colors?.Credit }]}></View>
                    </View>
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
    },
    colContainer: {
        flexDirection: "column"
    },
    circle: {
        width: 15,
        height: 15,
        position: "absolute",
        right: 0,
        top: 0,
        borderRadius: 50
    }
})

export default FinnanceTableBlock