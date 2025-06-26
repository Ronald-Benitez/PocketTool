import { StyleSheet, Text, View, TextStyle, ViewStyle, StyleProp } from "react-native";

import useColorStore from '@/src/stores/ColorsStore';
import { useLanguage } from "@/src/lang/LanguageContext";
import useRecordsStore, { ResumeTotals } from '@/src/stores/RecordsStore';
import FinanceSimpleBlock from "./FinanceSimpleBlock";
import ColorText from "./color-text";
import useResumesStore, { Resumes } from "@/src/stores/ResumesStore";

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
    const { balanceByCategory, balanceByPaymentMethod } = useResumesStore()

    // const getBorderColor = (val: resumeItemBase): StyleProp<ViewStyle> => {
    //     const totalExpense = val.totalExpense + val.totalTransfer
    //     if (val.totalIncome < totalExpense) {
    //         return {
    //             borderColor: colors?.ExpenseColor
    //         }
    //     } else {
    //         return {
    //             borderColor: colors?.IncomeColor
    //         }
    //     }
    // }

    // const getBalance = (val: Resumes['balanceByCategory']) => {
    //     return val.totalIncome - val.totalExpense - val.totalTransfer
    // }

    const renderCategories = (
        <View style={localStyles.container}>
            <Text style={localStyles.headerText}>
                {t("resume.summaryByCategories")}
            </Text>
            {
                balanceByCategory?.map((val, index) => (
                    <View key={index}>
                        <View style={[localStyles.headerRow]}>
                            <ColorText fontSize={12} fontWeight={200}>{val.category_name}</ColorText>
                            {/* <ColorText fontSize={12} fontWeight={200}>${Math.abs(getBalance(val)).toFixed(2)}</ColorText> */}
                        </View>
                        <View style={[localStyles.colContainer]} key={index}>
                            <View style={localStyles.rowContainer} key={index}>
                                {
                                    val?.totalPerRecordType?.map((item) => {
                                        if (item.total <= 0) return null
                                        return (
                                            <FinanceSimpleBlock
                                                key={item.id}
                                                text={item.type_name}
                                                value={String(item.total)}
                                                color={item.record_color}
                                            />
                                        )
                                    })
                                }
                            </View>
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
                balanceByPaymentMethod?.map((val, index) => (
                    <View key={index}>
                        <View style={[localStyles.headerRow]}>
                            <View style={localStyles.nameCircleBlock}>
                                <View style={[localStyles.circle]}></View>
                                <ColorText fontSize={12} fontWeight={200}>{val.method_name}</ColorText>
                            </View>
                            {/* <ColorText fontSize={12} fontWeight={200}>${Math.abs(getBalance(val)).toFixed(2)}</ColorText> */}
                        </View>
                        <View style={localStyles.colContainer} key={index}>
                            <View style={localStyles.wrapContainer} key={index}>
                                {
                                    val?.totalPerRecordType?.map((item) => {
                                        if (item.total <= 0) return null
                                        return (
                                            <FinanceSimpleBlock
                                                key={item.id}
                                                text={item.type_name}
                                                value={String(item.total)}
                                                color={item.record_color}
                                                blockwidth={170}
                                            />
                                        )
                                    })
                                }
                            </View>
                        </View>
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
        gap: 5,
    },
    wrapContainer: {
        flexWrap: "wrap",
        flexDirection: 'row',
        gap: 5,
        justifyContent: 'space-between'
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