import { useRef, useState } from "react";
import { StyleSheet, Text, View, TextStyle, ViewStyle, StyleProp, Pressable } from "react-native";

import { useLanguage } from "@/src/lang/LanguageContext";
import FinanceSimpleBlock from "./FinanceSimpleBlock";
import ColorText from "./color-text";
import useResumesStore, { Resumes } from "@/src/stores/ResumesStore";
import useFixedsResumesStore from "@/src/stores/FixedsResumesStore";
import { useDataStore } from "@/src/stores";

interface props {
    render: "categories" | "payments" | "types",
    fixed?: boolean
    onSummarySelected: (id: number | undefined, idRecordType: number | undefined) => void
}


const FinnanceTableChart = ({ render, fixed, onSummarySelected }: props) => {
    const { t } = useLanguage()
    const { balanceByCategory, balanceByPaymentMethod, balanceByPaymentType } = fixed ? useFixedsResumesStore() : useResumesStore()
    const { RecordTypes } = useDataStore()

    const renderCategories = (
        <View style={localStyles.container}>
            <Text style={localStyles.headerText}>
                {t("resume.summaryByCategories")}
            </Text>
            {
                balanceByCategory?.map((val, index) => (
                    <Pressable onPress={() => onSummarySelected(val.id, undefined)} key={index} >
                        <RecordTypeBlock
                            onSummarySelected={onSummarySelected}
                            index={index}
                            val={val}
                            nameValue={val.category_name}
                        />
                    </Pressable>
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
                    <Pressable onPress={() => onSummarySelected(val.id, undefined)} key={index} >
                        <RecordTypeBlock
                            onSummarySelected={onSummarySelected}
                            key={index}
                            index={index}
                            val={val}
                            nameValue={val.method_name}
                        />
                    </Pressable>
                ))
            }
        </View>
    )

    const renderTypes = (
        <View style={localStyles.container}>
            <Text style={localStyles.headerText}>
                {t("resume.summaryByTypes")}
            </Text>
            {
                balanceByPaymentType?.map((val, index) => (
                    <Pressable onPress={() => onSummarySelected(val.id, undefined)} key={index} >
                        <RecordTypeBlock
                            onSummarySelected={onSummarySelected}
                            key={index}
                            index={index}
                            val={val}
                            nameValue={val.payment_type_name}
                        />
                    </Pressable>
                ))
            }
        </View>
    )

    switch (render) {
        case "categories":
            return renderCategories;
        case "payments":
            return renderPayments;
        case "types":
            return renderTypes;
        default:
            return <Text>{t("resume.noData")}</Text>;
    }

}

const RecordTypeBlock = ({
    index,
    val,
    nameValue,
    onSummarySelected
}: {
    index: number,
    nameValue: string,
    val: Resumes['balanceByPaymentMethod'][number] | Resumes['balanceByCategory'][number] | Resumes['balanceByPaymentType'][number],
    onSummarySelected: (id: number | undefined, idRecordType: number | undefined) => void
}) => {
    return (
        <View key={index}>
            <View style={[localStyles.headerRow]}>
                <View style={localStyles.nameCircleBlock}>
                    <View style={[localStyles.circle]}></View>

                    <ColorText fontSize={12} fontWeight={200}>{nameValue}</ColorText>
                </View>
                <ColorText fontSize={12} fontWeight={200}>${val?.balance?.toFixed(2)}</ColorText>
            </View>
            <View style={localStyles.colContainer} key={index}>
                <View style={localStyles.wrapContainer} key={index}>
                    {
                        val?.totalPerRecordType?.map((item) => {
                            if (item.total <= 0) return null
                            return (
                                <Pressable key={item.id} onPress={() => onSummarySelected(val.id, item.id)}>
                                    <FinanceSimpleBlock
                                        key={item.id}
                                        text={item.type_name}
                                        value={String(item.total)}
                                        color={item.record_color}
                                        blockwidth={170}
                                    />
                                </Pressable>
                            )
                        })
                    }
                </View>
            </View>
        </View>
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

export default FinnanceTableChart