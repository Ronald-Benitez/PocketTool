import React, { useEffect, useState } from "react"
import {
    Modal,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useLanguage } from "@/src/lang/LanguageContext"
import useColorStore from "@/src/stores/ColorsStore"
import { useORM } from "@/src/orm"
import type {
    ColumnPath,
    OrderCondition,
    OrderDirection,
    SqlOperator
} from "@/src/orm"
import ModalButton from "../ui/modal-button"
import BaseSelect from "../ui/base-select"

export interface RecordFilter {
    column: ColumnPath<"Records">
    operator: SqlOperator
    value: string
}

interface RecordsFilterModalProps {
    visible: boolean
    filters: RecordFilter[]
    order: OrderCondition<"Records">[]
    onClose: () => void
    onApply: (
        filters: RecordFilter[],
        order: OrderCondition<"Records">[]
    ) => Promise<void>
}

export const RECORDS_ORDER_STORAGE_KEY = "recordsTableOrder"
const OPERATORS: SqlOperator[] = [
    "=",
    "!=",
    ">",
    ">=",
    "<",
    "<=",
    "LIKE",
    "IN",
    "IS",
    "IS NOT",
    "BETWEEN"
]
const DIRECTIONS: OrderDirection[] = ["ASC", "DESC"]

const RecordsFilterModal = ({
    visible,
    filters,
    order,
    onClose,
    onApply
}: RecordsFilterModalProps) => {
    const { t } = useLanguage()
    const { colors } = useColorStore()
    const recordsOrm = useORM("Records")
    const joins = new Set(Object.keys(recordsOrm.availableJoins))
    const columns = (Object.keys(recordsOrm.availableColumns) as ColumnPath<"Records">[])
        .filter(column => {
            const relationPath = column.split(".").slice(0, -1).join(".")
            return (relationPath === "" || joins.has(relationPath)) && !column.endsWith("id")
        })
    const [draftFilters, setDraftFilters] = useState<RecordFilter[]>([])
    const [draftOrder, setDraftOrder] = useState<OrderCondition<"Records">[]>([])
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!visible) return
        setDraftFilters(filters.map(filter => ({ ...filter })))
        setDraftOrder(order.map(condition => ({ ...condition })))
    }, [visible, filters, order])

    const updateFilter = (index: number, updates: Partial<RecordFilter>) => {
        setDraftFilters(current => current.map((filter, itemIndex) =>
            itemIndex === index ? { ...filter, ...updates } : filter
        ))
    }

    const updateOrder = (
        index: number,
        updates: Partial<OrderCondition<"Records">>
    ) => {
        setDraftOrder(current => current.map((condition, itemIndex) =>
            itemIndex === index ? { ...condition, ...updates } : condition
        ))
    }

    const handleApply = async () => {
        setSaving(true)
        try {
            await AsyncStorage.setItem(RECORDS_ORDER_STORAGE_KEY, JSON.stringify(draftOrder))
            await onApply(
                draftFilters.filter(filter => filter.value.trim().length > 0),
                draftOrder
            )
        } catch (error) {
            console.error("Error al guardar el orden de los registros:", error)
            Alert.alert(t("toast.error"))
        } finally {
            setSaving(false)
        }
    }

    const addFilter = () => {
        setDraftFilters(current => [
            ...current,
            { column: columns[0], operator: "LIKE", value: "" }
        ])
    }

    const addOrder = () => {
        setDraftOrder(current => [
            ...current,
            { column: columns[0], direction: "ASC" }
        ])
    }

    const columnLabel = (column: string) =>
        column.split(".")
            .map(part => t(`recordsFilters.columns.${part}`))
            .join(" -> ")

    const directionLabel = (direction: OrderDirection) =>
        t(direction === "ASC" ? "recordsFilters.ascending" : "recordsFilters.descending")

    const operatorLabel = (operator: SqlOperator) =>
        t(`recordsFilters.operators.${operator}`)

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={localStyles.backdrop}>
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                />
                <View style={[localStyles.modal, { borderColor: colors?.InputStroke }]}>
                    <Text style={[localStyles.title, { backgroundColor: colors?.ModalHeaderColor }]}>
                        {t("recordsFilters.title")}
                    </Text>
                    <ScrollView style={localStyles.content} keyboardShouldPersistTaps="handled">
                        <Text style={localStyles.sectionTitle}>{t("recordsFilters.sortBy")}</Text>
                        {draftOrder.map((condition, index) => (
                            <View key={`order-${index}`} style={localStyles.optionRow}>
                                <BaseSelect
                                    blockWith="62%"
                                    options={columns.map(columnLabel)}
                                    selected={columnLabel(condition.column)}
                                    title={t("recordsFilters.selectSortField")}
                                    onChange={columnIndex =>
                                        updateOrder(index, { column: columns[columnIndex] })
                                    }
                                />
                                <BaseSelect
                                    blockWith="32%"
                                    options={DIRECTIONS.map(directionLabel)}
                                    selected={directionLabel(condition.direction ?? "ASC")}
                                    title={t("recordsFilters.selectDirection")}
                                    onChange={directionIndex =>
                                        updateOrder(index, { direction: DIRECTIONS[directionIndex] })
                                    }
                                />
                                <Pressable
                                    style={localStyles.removeButton}
                                    onPress={() => setDraftOrder(current =>
                                        current.filter((_, itemIndex) => itemIndex !== index)
                                    )}
                                >
                                    <Text style={localStyles.removeText}>×</Text>
                                </Pressable>
                            </View>
                        ))}
                        <Pressable style={localStyles.addButton} onPress={addOrder}>
                            <Text style={localStyles.addButtonText}>{t("recordsFilters.addSort")}</Text>
                        </Pressable>

                        <Text style={localStyles.sectionTitle}>{t("recordsFilters.filters")}</Text>
                        {draftFilters.map((filter, index) => (
                            <View key={`filter-${index}`} style={localStyles.filterRow}>
                                <BaseSelect
                                    blockWith="62%"
                                    options={columns.map(columnLabel)}
                                    selected={columnLabel(filter.column)}
                                    title={t("recordsFilters.selectFilterField")}
                                    onChange={columnIndex =>
                                        updateFilter(index, { column: columns[columnIndex] })
                                    }
                                />
                                <BaseSelect
                                    blockWith="32%"
                                    options={OPERATORS.map(operatorLabel)}
                                    selected={operatorLabel(filter.operator)}
                                    title={t("recordsFilters.selectOperator")}
                                    onChange={operatorIndex =>
                                        updateFilter(index, { operator: OPERATORS[operatorIndex] })
                                    }
                                />
                                <TextInput
                                    style={localStyles.valueInput}
                                    value={filter.value}
                                    onChangeText={value => updateFilter(index, { value })}
                                    placeholder={
                                        filter.operator === "IN" || filter.operator === "BETWEEN"
                                            ? t("recordsFilters.commaSeparatedValues")
                                            : t("recordsFilters.value")
                                    }
                                    autoCapitalize="none"
                                />
                                <Pressable
                                    style={localStyles.removeButton}
                                    onPress={() => setDraftFilters(current =>
                                        current.filter((_, itemIndex) => itemIndex !== index)
                                    )}
                                >
                                    <Text style={localStyles.removeText}>×</Text>
                                </Pressable>
                            </View>
                        ))}
                        <Pressable style={localStyles.addButton} onPress={addFilter}>
                            <Text style={localStyles.addButtonText}>{t("recordsFilters.addFilter")}</Text>
                        </Pressable>
                    </ScrollView>
                    <View style={localStyles.footer}>
                        <ModalButton onClick={onClose} text={t("close")} type="base" />
                        <ModalButton
                            onClick={saving ? undefined : () => { void handleApply() }}
                            text={saving ? t("recordsFilters.saving") : t("confirm")}
                            type="bg"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const localStyles = StyleSheet.create({
    backdrop: {
        flex: 1,
        padding: 16,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    modal: {
        width: "100%",
        maxWidth: 480,
        maxHeight: "90%",
        backgroundColor: "#fff",
        borderWidth: 1
    },
    title: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        paddingVertical: 18
    },
    content: {
        paddingHorizontal: 14
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 18,
        marginBottom: 8
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "#bbb"
    },
    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "#bbb"
    },
    valueInput: {
        flex: 1,
        minWidth: 95,
        height: 44,
        borderWidth: 1,
        borderColor: "#aaa",
        paddingHorizontal: 8
    },
    removeButton: {
        width: 36,
        height: 42,
        alignItems: "center",
        justifyContent: "center"
    },
    removeText: {
        color: "#b00020",
        fontSize: 24
    },
    addButton: {
        paddingVertical: 12,
        alignItems: "center"
    },
    addButtonText: {
        color: "#176b70",
        fontWeight: "600"
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
        padding: 12
    }
})

export default RecordsFilterModal
