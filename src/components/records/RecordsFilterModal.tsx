import React, { useEffect, useState } from "react"
import {
    KeyboardAvoidingView,
    Modal,
    Alert,
    Platform,
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
import { useTableRepository } from "@/src/db"
import type {
    ColumnPath,
    OrderCondition,
    OrderDirection,
    SqlOperator
} from "@/src/orm"
import ModalButton from "../ui/modal-button"
import BaseSelect from "../ui/base-select"
import IconButton from "../ui/icon-button"
import { Feather, Octicons } from "@expo/vector-icons"

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
const DIRECTIONS = {
    "ASC": "ASC",
    "DESC": "DESC"
}

const RecordsFilterModal = ({
    visible,
    filters,
    order,
    onClose,
    onApply
}: RecordsFilterModalProps) => {
    const { t } = useLanguage()
    const { colors } = useColorStore()
    const recordsRepository = useTableRepository("Records")
    const joins = new Set(Object.keys(recordsRepository.availableJoins))
    const columns = (Object.keys(recordsRepository.availableColumns) as ColumnPath<"Records">[])
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
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
                               
                                <IconButton 
                                    isButton  
                                    shake={false}
                                    onClick={() => 
                                        updateOrder(index, { direction: condition.direction == DIRECTIONS.ASC ? "DESC" : "ASC" })
                                    } 
                                >
                                    <Octicons name={condition.direction == DIRECTIONS.ASC ? "sort-asc" : "sort-desc" } size={20} />
                                </IconButton>
                                <IconButton 
                                    isButton  
                                    shake={false}
                                    onClick={() => setDraftOrder(current =>
                                        current.filter((_, itemIndex) => itemIndex !== index)
                                    )} 
                                >
                                    <Feather name="trash" size={20} color={"#F00"} />
                                </IconButton>
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
                               
                                <IconButton 
                                    isButton  
                                    shake={false}
                                    onClick={() => setDraftFilters(current =>
                                        current.filter((_, itemIndex) => itemIndex !== index)
                                    )}
                                >
                                    <Feather name="trash" size={20} color={"#F00"} />
                                </IconButton>
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
            </KeyboardAvoidingView>
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
        alignItems: "flex-end",
        justifyContent:"center",
        gap:4
    },
    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 4
    },
    valueInput: {
        flex: 1,
        minWidth: 80,
        height: 50,
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
