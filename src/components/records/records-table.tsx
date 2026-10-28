import {
  View,
  Text,
  Pressable,
  TextStyle,
  StyleProp,
  StyleSheet,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useLanguage } from "@/src/lang/LanguageContext";
import { ScrollView } from "react-native-gesture-handler";
import useToast from "@/src/hooks/useToast";
import AddItem from "./add-record";
import useRecordsStore from "@/src/stores/RecordsStore";
import useColorStore from "@/src/stores/ColorsStore";
import IconButton from "../ui/icon-button";
import useResumesStore from "@/src/stores/ResumesStore";
import { useCreditStore } from "@/src/stores/CreditsStore";
import useConfigs from "@/src/hooks/useConfigs";
import { useDataStore } from "@/src/stores";
import styles from "@/src/styles/styles";
import RecordsGroup from "./RecordsGroup";
import FixedsGroup from "./FixedsGroup";
import CreditsGroups from "./CreditsGroups";
import ColorText from "../ui/color-text";
import { useORM } from "@/src/orm";
import type { JoinPath, OrderCondition } from "@/src/orm";
import type { RecordFormEntry, RecordType, RecordWithRelations } from "@/src/interfaces/schema";
import { formatMoney } from "@/src/utils";
import RecordsFilterModal, { RECORDS_ORDER_STORAGE_KEY } from "./RecordsFilterModal";
import type { RecordFilter } from "./RecordsFilterModal";

enum SHOW_OPTIONS {
  ALL = 0,
  RECORDS = 1,
  CREDITS = 2,
  FIXEDS = 3,
}

const getRecordColumnValue = (record: RecordWithRelations, column: string): unknown => {
  return column.split(".").reduce<unknown>((value, part) => {
    if (!value || typeof value !== "object") return undefined
    return (value as Record<string, unknown>)[part]
  }, record)
}

const parseFilterValue = (value: string): string | number | boolean | null => {
  const normalized = value.trim()
  if (normalized.toLowerCase() === "null") return null
  if (normalized.toLowerCase() === "true") return true
  if (normalized.toLowerCase() === "false") return false
  if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return Number(normalized)
  return normalized
}

const normalizeFilterValue = (
  value: string | number | boolean | null,
  actual: unknown
): string | number | boolean | null => {
  if (typeof actual === "number" && typeof value === "string" && value.trim() !== "") {
    const number = Number(value)
    return Number.isNaN(number) ? value : number
  }
  if (typeof actual === "boolean" && typeof value === "string") {
    if (value.toLowerCase() === "true" || value === "1") return true
    if (value.toLowerCase() === "false" || value === "0") return false
  }
  return value
}

const compareRecordValue = (left: unknown, right: unknown): number => {
  if (left == null && right == null) return 0
  if (left == null) return -1
  if (right == null) return 1
  if (typeof left === "number" && typeof right === "number") return left - right
  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" })
}

const matchesRecordFilter = (record: RecordWithRelations, filter: RecordFilter): boolean => {
  const actual = getRecordColumnValue(record, filter.column)
  const rawValues = filter.operator === "IN" || filter.operator === "BETWEEN"
    ? filter.value.split(",").map(value => parseFilterValue(value))
    : [parseFilterValue(filter.value)]
  const values = rawValues.map(value => normalizeFilterValue(value, actual))

  if (filter.operator === "IN") {
    return values.some(value => compareRecordValue(actual, value) === 0)
  }
  if (filter.operator === "BETWEEN") {
    return values.length === 2 &&
      compareRecordValue(actual, values[0]) >= 0 &&
      compareRecordValue(actual, values[1]) <= 0
  }
  if (filter.operator === "IS") return compareRecordValue(actual, values[0]) === 0
  if (filter.operator === "IS NOT") return compareRecordValue(actual, values[0]) !== 0
  if (actual == null || values[0] == null) return false

  if (filter.operator === "LIKE") {
    const pattern = `%${filter.value}%`
      .split("")
      .map(character => character === "%"
        ? ".*"
        : character === "_"
          ? "."
          : character.replace(/[|\\{}()[\]^$+?.]/g, "\\$&"))
      .join("")
    return new RegExp(`^${pattern}$`, "i").test(String(actual))
  }

  const comparison = compareRecordValue(actual, values[0])
  switch (filter.operator) {
    case "=": return comparison === 0
    case "!=": return comparison !== 0
    case ">": return comparison > 0
    case ">=": return comparison >= 0
    case "<": return comparison < 0
    case "<=": return comparison <= 0
    default: return true
  }
}

const ItemsTable = () => {
  const [selected, setSelected] = React.useState<RecordFormEntry>();
  const [openUpdate, setOpenUpdate] = React.useState<boolean>(false);
  const { ToastContainer, showToast } = useToast();
  const { t } = useLanguage();
  const { records, group, setRecords } = useRecordsStore();
  const { colors } = useColorStore();
  const { credits } = useCreditStore();
  const { RecordTypes, Fixeds } = useDataStore();
  const [creditRecords, setCreditRecords] = useState<RecordFormEntry[]>();
  const {
    configs: { paymentCreditType },
  } = useConfigs();
  const [fixedsToShow, setFixedsToShow] = useState<RecordFormEntry[]>([]);
  const [showActual, setShowActual] = useState<SHOW_OPTIONS>(SHOW_OPTIONS.ALL);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<RecordFilter[]>([]);
  const [recordOrder, setRecordOrder] = useState<OrderCondition<"Records">[]>([
    { column: "date", direction: "ASC" }
  ]);
  const paidCreditsOrm = useORM("PaidCredits");
  const recordsOrm = useORM("Records");

  useEffect(() => {
    let isMounted = true
    const loadSavedOrder = async () => {
      try {
        const storedOrder = await AsyncStorage.getItem(RECORDS_ORDER_STORAGE_KEY)
        if (!storedOrder) return
        const parsedOrder: unknown = JSON.parse(storedOrder)
        if (!Array.isArray(parsedOrder)) {
          throw new Error("El orden guardado de registros no es válido")
        }

        const availableColumns = new Set(Object.keys(recordsOrm.availableColumns))
        const validOrder = parsedOrder.filter((item): item is OrderCondition<"Records"> =>
          item !== null &&
          typeof item === "object" &&
          availableColumns.has(item.column) &&
          (item.direction === "ASC" || item.direction === "DESC")
        )
        if (validOrder.length !== parsedOrder.length) {
          throw new Error("El orden guardado contiene columnas o direcciones no válidas")
        }
        if (isMounted) setRecordOrder(validOrder)
      } catch (error) {
        console.error("Error al cargar el orden de los registros:", error)
        if (isMounted) showToast({ message: t("toast.error"), type: "ERROR" })
      }
    }
    void loadSavedOrder()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (!group?.id) return
    const relationPaths = Object.keys(recordsOrm.availableJoins) as JoinPath<"Records">[]
    recordsOrm
      .joinMany(relationPaths)
      .where("group_id", group.id, "=")
      .order("date", "ASC")
      .getAll()
      .then(setRecords)
      .catch(error => {
        console.error("Error al cargar los registros y sus relaciones:", error)
        showToast({ message: t("toast.error"), type: "ERROR" })
      })
  }, [group?.id])

  const visibleRecords = useMemo(() => {
    const filtered = records.filter(record =>
      filters.every(filter => matchesRecordFilter(record, filter))
    )
    return [...filtered].sort((left, right) => {
      for (const condition of recordOrder) {
        const comparison = compareRecordValue(
          getRecordColumnValue(left, condition.column),
          getRecordColumnValue(right, condition.column)
        )
        if (comparison !== 0) return condition.direction === "DESC" ? -comparison : comparison
      }
      return 0
    })
  }, [records, filters, recordOrder])

  const { balance } = useResumesStore(visibleRecords);

  const selectePaymentCreditType = RecordTypes.find(
    (e) => e.id == paymentCreditType
  );

  const handleDelete = async (toDelete: RecordWithRelations) => {
    if (!group?.id || !toDelete.id) return;
    await recordsOrm.delete(toDelete.id);
    if (toDelete.paid_credit_id)
      await paidCreditsOrm.delete(toDelete.paid_credit_id);
    const relationPaths = Object.keys(recordsOrm.availableJoins) as JoinPath<"Records">[]
    const data = await recordsOrm
      .joinMany(relationPaths)
      .where("group_id", group.id, "=")
      .order("date", "ASC")
      .getAll();
    setRecords(data);
    showToast({ message: t("item.deleted"), type: "SUCCESS" });
  };

  const handleUpdate = (record: RecordWithRelations) => {
    setSelected(record);
    setOpenUpdate(!openUpdate);
  };

  const applyFiltersAndOrder = async (
    nextFilters: RecordFilter[],
    nextOrder: OrderCondition<"Records">[]
  ) => {
    setFilters(nextFilters)
    setRecordOrder(nextOrder)
    setFilterModalVisible(false)
  }

  const color = (
    type: "income" | "expense" | "transfer"
  ): StyleProp<TextStyle> => {
    const c: StyleProp<TextStyle> = {};
    if (type === "expense") {
      c.borderColor = colors?.ExpenseColor;
    } else if (type === "income") {
      c.borderColor = colors?.IncomeColor;
    }
    return c;
  };

  const generateCreditRecords = () => {
    const list: RecordFormEntry[] = [];
    const today = new Date();
    credits?.map((credit) => {
      if (!credit.totalPrevious) return;
      if ((credit?.totalCurrentPayments || 0) >= (credit?.totalPrevious || 0))
        return;

      const newJoined: RecordFormEntry = {
        record_type_id: paymentCreditType,
        amount: credit?.totalPrevious - (credit?.totalCurrentPayments || 0),
        category_id: 0,
        date: today.getTime(),
        group_id: group?.id || 0,
        record_name: credit.method_name,
        payment_method_id: 0,
        paid_method_id: credit.id,
      };
      list.push(newJoined);
    });
    setCreditRecords(list);
  };

  useEffect(generateCreditRecords, [credits]);

  const generateFixedsToShow = () => {
    const list: RecordFormEntry[] = [];
    const today = new Date()
    Fixeds.map((fixed) => {
      const alreadyAdded = records.find(
        (records) => records.fixed_id == fixed.id
      );
      if (!alreadyAdded) {
        const date = new Date();
        date.setDate(fixed.fixed_day);


        if(date?.getTime() < today.getTime()){
          date.setMonth(date?.getMonth() + 1)
        }

        list.push({
          id: undefined,
          fixed_id: fixed.id,
          amount: fixed.fixed_amount,
          date: date.getTime(),
          group_id: group?.id || 0,
          record_name: fixed.fixed_name,
          record_type_id: fixed.record_type_id,
          category_id: fixed.category_id,
          payment_method_id: fixed.payment_method_id,
          RecordTypes: fixed.RecordTypes,
          PaymentMethods: fixed.PaymentMethods,
        });
      }
    });
    setFixedsToShow(list);
  };

  useEffect(generateFixedsToShow, [records, Fixeds]);

  const onCreditPayment = (item: RecordFormEntry) => {
    setSelected(item);
    setOpenUpdate(!openUpdate);
  };

  return (
    <>
      <View>
        <View style={localStyles.rowContainer}>
          <Text
            style={[
              localStyles.balanceText,
              color(balance < 0 ? "expense" : "income"),
            ]}
          >
            $ {formatMoney(balance)}
          </Text>
          <View style={[{ position: "absolute", right: 0, top: 0, flexDirection: "row", gap: 2 }]}>
            <IconButton onClick={() => setFilterModalVisible(true)}>
              <AntDesign size={20} name="filter" color={"#000"} />
            </IconButton>
            {group && (
              <AddItem>
                <IconButton isButton={false}>
                  <AntDesign size={20} name="plus" color={"#000"} />
                </IconButton>
              </AddItem>
            )}
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, height: 40 }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 20,
              marginVertical: 10,
            }}
          >
            <Pressable onPress={() => setShowActual(SHOW_OPTIONS.ALL)}>
              <View
                style={[
                  localStyles.filterPill,
                  showActual === SHOW_OPTIONS.ALL
                    ? { backgroundColor: colors?.ModalHeaderColor }
                    : {},
                ]}
              >
                <ColorText
                  backgroundColor={
                    showActual === SHOW_OPTIONS.ALL
                      ? colors?.ModalHeaderColor
                      : "#fff"
                  }
                  fontSize={10}
                  padding={0}
                >
                  {t("records.all")}
                </ColorText>
              </View>
            </Pressable>
            <Pressable onPress={() => setShowActual(SHOW_OPTIONS.RECORDS)}>
              <View
                style={[
                  localStyles.filterPill,
                  showActual === SHOW_OPTIONS.RECORDS
                    ? { backgroundColor: colors?.ModalHeaderColor }
                    : {},
                ]}
              >
                <ColorText
                  backgroundColor={
                    showActual === SHOW_OPTIONS.RECORDS
                      ? colors?.ModalHeaderColor
                      : "#fff"
                  }
                  fontSize={10}
                  padding={0}
                >
                  {t("records.records")}
                </ColorText>
              </View>
            </Pressable>
            <Pressable onPress={() => setShowActual(SHOW_OPTIONS.CREDITS)}>
              <View
                style={[
                  localStyles.filterPill,
                  showActual === SHOW_OPTIONS.CREDITS
                    ? { backgroundColor: colors?.ModalHeaderColor }
                    : {},
                ]}
              >
                <ColorText
                  backgroundColor={
                    showActual === SHOW_OPTIONS.CREDITS
                      ? colors?.ModalHeaderColor
                      : "#fff"
                  }
                  fontSize={10}
                  padding={0}
                >
                  {t("records.creditPayments")}
                </ColorText>
              </View>
            </Pressable>
            <Pressable onPress={() => setShowActual(SHOW_OPTIONS.FIXEDS)}>
              <View
                style={[
                  localStyles.filterPill,
                  showActual === SHOW_OPTIONS.FIXEDS
                    ? { backgroundColor: colors?.ModalHeaderColor }
                    : {},
                ]}
              >
                <ColorText
                  backgroundColor={
                    showActual === SHOW_OPTIONS.FIXEDS
                      ? colors?.ModalHeaderColor
                      : "#fff"
                  }
                  fontSize={10}
                  padding={0}
                >
                  {t("records.fixeds")}
                </ColorText>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {showActual === SHOW_OPTIONS.ALL && (
          <>
            <RecordsGroup
              records={visibleRecords}
              handleDelete={handleDelete}
              handleUpdate={handleUpdate}
            />
            <FixedsGroup
              fixeds={fixedsToShow}
              onCreditPayment={onCreditPayment}
            />
            <CreditsGroups
              credits={creditRecords || []}
              selectedPaymentCreditType={selectePaymentCreditType}
              onCreditPayment={onCreditPayment}
            />
          </>
        )}
        {showActual === SHOW_OPTIONS.RECORDS && (
          <RecordsGroup
            records={visibleRecords}
            handleDelete={handleDelete}
            handleUpdate={handleUpdate}
          />
        )}
        {showActual === SHOW_OPTIONS.CREDITS && (
          <CreditsGroups
            credits={creditRecords || []}
            selectedPaymentCreditType={selectePaymentCreditType}
            onCreditPayment={onCreditPayment}
          />
        )}
        {showActual === SHOW_OPTIONS.FIXEDS && (
          <FixedsGroup
            fixeds={fixedsToShow}
            onCreditPayment={onCreditPayment}
          />
        )}
        <ToastContainer />
        <AddItem openUpdate={openUpdate} open={openUpdate} item={selected} />
      </ScrollView>
      <RecordsFilterModal
        visible={filterModalVisible}
        filters={filters}
        order={recordOrder}
        onClose={() => setFilterModalVisible(false)}
        onApply={applyFiltersAndOrder}
      />
    </>
  );
};

const localStyles = StyleSheet.create({
  rowContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: {
    width: 50,
  },
  dateText: {
    fontWeight: "100",
    fontSize: 8,
    textAlign: "center",
  },
  nameText: {
    fontSize: 12,
    textAlign: "left",
    maxWidth: 200,
  },
  valueText: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "300",
  },
  balanceText: {
    width: "60%",
    borderTopWidth: 4,
    height: 60,
    paddingTop: 10,
    textAlign: "center",
    marginLeft: 5,
    fontWeight: "300",
    fontSize: 18,
  },
  filterPill: {
    borderWidth: 1,
    padding: 6,
    height: 30,
    borderRadius: 100,
  },
});

export default ItemsTable;
