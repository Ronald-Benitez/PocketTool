import { create } from "zustand";

import { getEffectMap } from "@/src/domain/summaries/aggregate";
import { useConfigs } from "../hooks/useConfigs";
import useRecordsStore from "./RecordsStore";
import type {
    Category,
    PaymentMethod,
    PaymentType,
    RecordType,
    RecordWithRelations
} from "../interfaces/schema";
import { useDataStore } from ".";

type TotalPerRecordType = RecordType & {
    total: number;
};

type RecordTypeResume = RecordType & {
    total: number;
};

type PaymentResume<T> = T & {
    balance: number;
    totalPerRecordType: TotalPerRecordType[];
};

export interface Resumes {
    /** Personal balance: only the user's own share of every record. */
    balance: number;
    /** Total balance including the shared share. */
    totalBalance: number;
    ownBalance: number;
    sharedBalance: number;
    todayBalanceByRecordType: RecordTypeResume[];
    balanceByRecordType: RecordTypeResume[];
    balanceByPaymentType: PaymentResume<PaymentType>[];
    balanceByPaymentMethod: PaymentResume<PaymentMethod>[];
    balanceByCategory: PaymentResume<Category>[];
}

export const useResumesStore = (recordsToSummarize?: RecordWithRelations[]) => {
    const { configs: { recordTypes: configuredRecordTypes } } = useConfigs();
    const { records: allRecords } = useRecordsStore();
    const { PaymentMethods, Categories, RecordTypes, PaymentTypes } = useDataStore();
    const records = recordsToSummarize ?? allRecords;

    const calculateBalances = () => {
        const effectMap = getEffectMap(RecordTypes);
        const allowed = new Set(configuredRecordTypes);
        const balances = { total: 0, own: 0, shared: 0 };
        records.forEach((record) => {
            if (
                record.record_type_id == null ||
                !allowed.has(record.record_type_id)
            ) {
                return;
            }
            const effect = effectMap.get(record.record_type_id);
            const sign = effect === '+' ? 1 : effect === '-' ? -1 : 0;
            if (sign === 0) return;
            const own = record.own_amount_cents ?? record.amount;
            const shared = record.shared_amount_cents ?? 0;
            balances.total += sign * (own + shared);
            balances.own += sign * own;
            balances.shared += sign * shared;
        });
        return balances;
    };

    const createRecordTypeTotals = (): TotalPerRecordType[] =>
        RecordTypes.map(recordType => ({ ...recordType, total: 0 }));

    const calculateResumes = (): Omit<
        Resumes,
        "balance" | "totalBalance" | "ownBalance" | "sharedBalance"
    > => {
        const todayBalanceByRecordType = createRecordTypeTotals();
        const balanceByRecordType = createRecordTypeTotals();
        const balanceByPaymentType: PaymentResume<PaymentType>[] = PaymentTypes.map(paymentType => ({
            ...paymentType,
            balance: 0,
            totalPerRecordType: createRecordTypeTotals()
        }));
        const balanceByPaymentMethod: PaymentResume<PaymentMethod>[] = PaymentMethods.map(paymentMethod => ({
            ...paymentMethod,
            balance: 0,
            totalPerRecordType: createRecordTypeTotals()
        }));
        const balanceByCategory: PaymentResume<Category>[] = Categories.map(category => ({
            ...category,
            balance: 0,
            totalPerRecordType: createRecordTypeTotals()
        }));

        const now = new Date();
        const endOfToday = now.getTime();
        now.setHours(0, 0, 0, 0);
        const startOfToday = now.getTime();

        records.forEach(record => {
            const ownAmount = record.own_amount_cents ?? record.amount;
            const recordType = balanceByRecordType.find(item => item.id === record.record_type_id);
            if (recordType) recordType.total += ownAmount;

            const todayRecordType = todayBalanceByRecordType.find(item => item.id === record.record_type_id);
            if (todayRecordType && record.date >= startOfToday && record.date <= endOfToday) {
                todayRecordType.total += ownAmount;
            }

            const paymentMethodId = record.payment_method_id;
            const paymentTypeId = record.PaymentMethods?.payment_type_id
                ?? record.PaymentMethods?.PaymentTypes?.id;
            const paymentType = balanceByPaymentType.find(item => item.id === paymentTypeId);
            const paymentMethod = balanceByPaymentMethod.find(item => item.id === paymentMethodId);
            const category = balanceByCategory.find(item => item.id === record.category_id);

            for (const resume of [paymentType, paymentMethod, category]) {
                if (!resume) continue;
                const typeTotal = resume.totalPerRecordType.find(
                    item => item.id === record.record_type_id
                );
                if (typeTotal) typeTotal.total += ownAmount;
                resume.balance = resume.totalPerRecordType.reduce(typeReducer, 0);
            }
        });

        return {
            todayBalanceByRecordType,
            balanceByRecordType,
            balanceByPaymentType,
            balanceByPaymentMethod,
            balanceByCategory
        };
    };

    const balances = calculateBalances();

    return create<Resumes>(() => ({
        balance: balances.own,
        totalBalance: balances.total,
        ownBalance: balances.own,
        sharedBalance: balances.shared,
        ...calculateResumes()
    }))();
};

const typeReducer = (balance: number, recordType: TotalPerRecordType) => {
    if (recordType.effect === "-") return balance - recordType.total;
    if (recordType.effect === "+") return balance + recordType.total;
    return balance;
};

export default useResumesStore;
