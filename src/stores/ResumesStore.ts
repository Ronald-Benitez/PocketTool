import { create } from "zustand";

import { getEffectMap } from "@/src/domain/summaries/aggregate";
import { isMonthlyCashRecord } from "@/src/domain/summaries/monthly";
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

type AmountBuckets = {
    own: number;
    shared: number;
    total: number;
};

type TotalPerRecordType = RecordType & AmountBuckets;

type RecordTypeResume = RecordType & AmountBuckets;

type PaymentResume<T> = T & AmountBuckets & {
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
    /** Personal expenses covered by a saving instead of the month's cash. */
    savingsPaidCents: number;
    todayBalanceByRecordType: RecordTypeResume[];
    balanceByRecordType: RecordTypeResume[];
    balanceByPaymentType: PaymentResume<PaymentType>[];
    balanceByPaymentMethod: PaymentResume<PaymentMethod>[];
    balanceByCategory: PaymentResume<Category>[];
}

const emptyBuckets = (): AmountBuckets => ({ own: 0, shared: 0, total: 0 });

const addBuckets = (
    target: AmountBuckets,
    own: number,
    shared: number
) => {
    target.own += own;
    target.shared += shared;
    target.total += own + shared;
};

const reduceBuckets = (
    items: TotalPerRecordType[],
    field: keyof AmountBuckets
) =>
    items.reduce((balance, item) => {
        if (item.effect === "-") return balance - item[field];
        if (item.effect === "+") return balance + item[field];
        return balance;
    }, 0);

export const useResumesStore = (recordsToSummarize?: RecordWithRelations[]) => {
    const { configs: { recordTypes: configuredRecordTypes } } = useConfigs();
    const { records: allRecords } = useRecordsStore();
    const { PaymentMethods, Categories, RecordTypes, PaymentTypes } = useDataStore();
    const records = recordsToSummarize ?? allRecords;

    const calculateBalances = () => {
        const effectMap = getEffectMap(RecordTypes);
        const allowed = new Set(configuredRecordTypes);
        const balances = { total: 0, own: 0, shared: 0, savingsPaid: 0 };
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
            if (!isMonthlyCashRecord(record)) {
                if (effect === '-') balances.savingsPaid += own;
                return;
            }
            const shared = record.shared_amount_cents ?? 0;
            balances.total += sign * (own + shared);
            balances.own += sign * own;
            balances.shared += sign * shared;
        });
        return balances;
    };

    const createRecordTypeTotals = (): TotalPerRecordType[] =>
        RecordTypes.map(recordType => ({ ...recordType, ...emptyBuckets() }));

    const calculateResumes = (): Omit<
        Resumes,
        "balance" | "totalBalance" | "ownBalance" | "sharedBalance" | "savingsPaidCents"
    > => {
        const todayBalanceByRecordType = createRecordTypeTotals();
        const balanceByRecordType = createRecordTypeTotals();
        const balanceByPaymentType: PaymentResume<PaymentType>[] = PaymentTypes.map(paymentType => ({
            ...paymentType,
            ...emptyBuckets(),
            balance: 0,
            totalPerRecordType: createRecordTypeTotals()
        }));
        const balanceByPaymentMethod: PaymentResume<PaymentMethod>[] = PaymentMethods.map(paymentMethod => ({
            ...paymentMethod,
            ...emptyBuckets(),
            balance: 0,
            totalPerRecordType: createRecordTypeTotals()
        }));
        const balanceByCategory: PaymentResume<Category>[] = Categories.map(category => ({
            ...category,
            ...emptyBuckets(),
            balance: 0,
            totalPerRecordType: createRecordTypeTotals()
        }));

        const now = new Date();
        const endOfToday = now.getTime();
        now.setHours(0, 0, 0, 0);
        const startOfToday = now.getTime();

        records.forEach(record => {
            if (!isMonthlyCashRecord(record)) return;
            const ownAmount = record.own_amount_cents ?? record.amount;
            const sharedAmount = record.shared_amount_cents ?? 0;
            const recordType = balanceByRecordType.find(item => item.id === record.record_type_id);
            if (recordType) addBuckets(recordType, ownAmount, sharedAmount);

            const todayRecordType = todayBalanceByRecordType.find(item => item.id === record.record_type_id);
            if (
                todayRecordType &&
                record.date >= startOfToday &&
                record.date <= endOfToday
            ) {
                addBuckets(todayRecordType, ownAmount, sharedAmount);
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
                if (typeTotal) addBuckets(typeTotal, ownAmount, sharedAmount);
                resume.own = reduceBuckets(resume.totalPerRecordType, 'own');
                resume.shared = reduceBuckets(resume.totalPerRecordType, 'shared');
                resume.total = reduceBuckets(resume.totalPerRecordType, 'total');
                resume.balance = resume.own;
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
        savingsPaidCents: balances.savingsPaid,
        ...calculateResumes()
    }))();
};

export default useResumesStore;
