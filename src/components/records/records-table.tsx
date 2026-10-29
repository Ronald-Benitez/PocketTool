import {
  View,
  Text,
  Pressable,
  TextStyle,
  StyleProp,
  StyleSheet,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useLanguage } from "@/src/lang/LanguageContext";
import { ScrollView } from "react-native-gesture-handler";
import { useToast } from "@/src/ui/feedback/ToastProvider";
import AddItem from "./add-record";
import useRecordsStore from "@/src/stores/RecordsStore";
import useColorStore from "@/src/stores/ColorsStore";
import useResumesStore from "@/src/stores/ResumesStore";
import { useCreditStore } from "@/src/stores/CreditsStore";
import { useConfigs } from "@/src/hooks/useConfigs";
import { useDataStore } from "@/src/stores";
import { useThemedStyles } from "@/src/styles/useThemedStyles";
import RecordsGroup from "./RecordsGroup";
import FixedsGroup from "./FixedsGroup";
import CreditsGroups from "./CreditsGroups";
import { useRecords } from "@/src/db";
import type { OrderCondition } from "@/src/orm";
import type { RecordFormEntry, RecordType, RecordWithRelations } from "@/src/interfaces/schema";
import { formatMoney } from "@/src/utils";
import RecordsFilterModal, { RECORDS_ORDER_STORAGE_KEY } from "./RecordsFilterModal";
import type { RecordFilter } from "./RecordsFilterModal";
import {
  matchesRecordFilters,
  sortRecords,
} from "@/src/domain/records/filtering";
import { IconButton as AppIconButton } from "@/src/ui/actions/IconButton";
import { Badge } from "@/src/ui/data-display/Badge";
import { AppText } from "@/src/ui/primitives/AppText";

enum SHOW_OPTIONS {
  ALL = 0,
  RECORDS = 1,
  CREDITS = 2,
  FIXEDS = 3,
}

const ItemsTable = () => {
  const styles = useThemedStyles();
  const [selected, setSelected] = React.useState<RecordFormEntry>();
  const [openUpdate, setOpenUpdate] = React.useState<boolean>(false);
  const { showToast } = useToast();
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
  const { fetchRecords, deleteRecordWithCredit, handler: recordsRepository } = useRecords();

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

        const availableColumns = new Set(Object.keys(recordsRepository.availableColumns))
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
        if (isMounted) showToast({ message: t("toast.error"), type: "error" })
      }
    }
    void loadSavedOrder()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (!group?.id) return
    fetchRecords(group.id)
      .then((records) => setRecords(records ?? []))
      .catch(error => {
        console.error("Error al cargar los registros y sus relaciones:", error)
        showToast({ message: t("toast.error"), type: "error" })
      })
  }, [group?.id])

  const visibleRecords = useMemo(() => {
    const filtered = records.filter(record => matchesRecordFilters(record, filters))
    return sortRecords(filtered, recordOrder)
  }, [records, filters, recordOrder])

  const { balance } = useResumesStore(visibleRecords);

  const selectePaymentCreditType = RecordTypes.find(
    (e) => e.id == paymentCreditType
  );

  const handleDelete = async (toDelete: RecordWithRelations) => {
    if (!group?.id || !toDelete.id) return;
    await deleteRecordWithCredit(toDelete.id, toDelete.paid_credit_id);
    const data = await fetchRecords(group.id);
    setRecords(data ?? []);
    showToast({ message: t("item.deleted"), type: "success" });
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
  ): TextStyle => ({
    borderColor:
      type === "expense"
        ? colors?.ExpenseColor
        : type === "income"
          ? colors?.IncomeColor
          : undefined,
  });

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
              styles.textPrimary,
              color(balance < 0 ? "expense" : "income"),
            ]}
          >
            $ {formatMoney(balance)}
          </Text>
          <View style={[{ position: "absolute", right: 0, top: 0, flexDirection: "row", gap: 2, alignItems: "center" }]}>
            <AppIconButton
              label={t("recordsFilters.title")}
              variant="surface"
              icon={
                <MaterialIcons
                  name="filter-list"
                  size={20}
                  color={filters.length > 0 ? colors.primary : colors.text}
                />
              }
              onPress={() => setFilterModalVisible(true)}
            />
            {filters.length > 0 ? (
              <Badge label={String(filters.length)} tone="primary" size="sm" />
            ) : null}
            {group && (
              <AddItem>
                <View style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
                  <MaterialIcons name="add" size={24} color={colors.primary} />
                </View>
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
            {[
              { value: SHOW_OPTIONS.ALL, label: t("records.all") },
              { value: SHOW_OPTIONS.RECORDS, label: t("records.records") },
              { value: SHOW_OPTIONS.CREDITS, label: t("records.creditPayments") },
              { value: SHOW_OPTIONS.FIXEDS, label: t("records.fixeds") },
            ].map((option) => {
              const selected = showActual === option.value;
              return (
                <Pressable key={option.value} onPress={() => setShowActual(option.value)}>
                  <View
                    style={[
                      localStyles.filterPill,
                      {
                        backgroundColor: selected ? colors.primary : colors.surfaceMuted,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <AppText
                      variant='caption'
                      style={{ color: selected ? colors.onPrimary : colors.text }}
                    >
                      {option.label}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
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
