import { create } from "zustand";

import { getEffectMap } from "@/src/domain/summaries/aggregate";
import { isMonthlyCashRecord } from "@/src/domain/summaries/monthly";
import {
    getRecordPaidByMeCents,
    getRecordReceivableCents,
    getSettlementsNetCents,
} from "@/src/domain/summaries/cash";
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
    /** The user's share of every purchase. */
    own: number;
    /** What other people owe the user for shared purchases (gross). */
    shared: number;
    /** The full purchase total, regardless of who paid. */
    total: number;
    /** The gross amount the user actually paid for purchases. */
    paid: number;
    /** Cash view: income received minus expenses paid, including settlements. */
    cash: number;
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
    /** Full purchase total of the month, regardless of who paid. */
    totalPurchasesCents: number;
    /** What other people owe the user for shared purchases, gross. */
    receivableCents: number;
    /** Gross amount the user paid for purchases, before settlements. */
    grossPaidCents: number;
    /** Income minus gross purchases paid; excludes settlements. */
    paidBalanceCents: number;
    /** Personal expenses covered by a saving instead of the month's cash. */
    savingsPaidCents: number;
    /** Balance based on what the user actually paid and received. */
    cashBalance: number;
    cashPaidCents: number;
    cashIncomeCents: number;
    settlementsPaidCents: number;
    settlementsReceivedCents: number;
    todayBalanceByRecordType: RecordTypeResume[];
    balanceByRecordType: RecordTypeResume[];
    balanceByPaymentType: PaymentResume<PaymentType>[];
    balanceByPaymentMethod: PaymentResume<PaymentMethod>[];
    balanceByCategory: PaymentResume<Category>[];
}

const emptyBuckets = (): AmountBuckets => ({
    own: 0,
    shared: 0,
    total: 0,
    paid: 0,
    cash: 0,
});

const addBuckets = (
    target: AmountBuckets,
    own: number,
    total: number,
    receivable: number,
    paid: number,
    cash: number
) => {
    target.own += own;
    target.shared += receivable;
    target.total += total;
    target.paid += paid;
    target.cash += cash;
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

const sumBuckets = (
    items: TotalPerRecordType[],
    field: keyof AmountBuckets
) => items.reduce((total, item) => total + item[field], 0);

export const useResumesStore = (
    recordsToSummarize?: RecordWithRelations[],
    options?: { includeSettlements?: boolean }
) => {
    const { configs: { recordTypes: configuredRecordTypes } } = useConfigs();
    const { records: allRecords, settlements } = useRecordsStore();
    const { PaymentMethods, Categories, RecordTypes, PaymentTypes } = useDataStore();
    const records = recordsToSummarize ?? allRecords;
    const includeSettlements = options?.includeSettlements ?? true;

    const calculateBalances = () => {
        const effectMap = getEffectMap(RecordTypes);
        const allowed = new Set(configuredRecordTypes);
        const balances = {
            total: 0,
            own: 0,
            shared: 0,
            cash: 0,
            savingsPaid: 0,
            cashPaid: 0,
            cashIncome: 0,
            grossPaid: 0,
            receivable: 0,
            totalPurchases: 0,
        };
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
            const sharedSnapshot = record.shared_amount_cents ?? 0;
            const totalPurchase = own + sharedSnapshot;
            const receivable = effect === '-'
                ? getRecordReceivableCents(record)
                : 0;

            balances.total += sign * totalPurchase;
            balances.own += sign * own;
            balances.shared += sign * receivable;

            if (effect === '+') {
                balances.cash += own;
                balances.cashIncome += own;
            } else if (effect === '-') {
                const paid = getRecordPaidByMeCents(record);
                balances.cash -= paid;
                balances.cashPaid += paid;
                balances.grossPaid += paid;
                balances.receivable += receivable;
                balances.totalPurchases += totalPurchase;
            }
        });

        const activeSettlements = includeSettlements ? settlements : [];
        const settlementsPaid = activeSettlements.reduce(
            (total, settlement) =>
                settlement.direction === 'i_paid_them'
                    ? total + settlement.amount_cents
                    : total,
            0
        );
        const settlementsReceived = activeSettlements.reduce(
            (total, settlement) =>
                settlement.direction === 'they_paid_me'
                    ? total + settlement.amount_cents
                    : total,
            0
        );
        balances.cash += getSettlementsNetCents(activeSettlements);

        return {
            ...balances,
            settlementsPaid,
            settlementsReceived,
        };
    };

    const createRecordTypeTotals = (): TotalPerRecordType[] =>
        RecordTypes.map(recordType => ({ ...recordType, ...emptyBuckets() }));

    const calculateResumes = (): Omit<
        Resumes,
        | "balance"
        | "totalBalance"
        | "ownBalance"
        | "sharedBalance"
        | "totalPurchasesCents"
        | "receivableCents"
        | "grossPaidCents"
        | "paidBalanceCents"
        | "savingsPaidCents"
        | "cashBalance"
        | "cashPaidCents"
        | "cashIncomeCents"
        | "settlementsPaidCents"
        | "settlementsReceivedCents"
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
        const effectMap = getEffectMap(RecordTypes);
        const allowed = new Set(configuredRecordTypes);

        records.forEach(record => {
            if (
                record.record_type_id == null ||
                !allowed.has(record.record_type_id)
            ) {
                return;
            }
            if (!isMonthlyCashRecord(record)) return;
            const ownAmount = record.own_amount_cents ?? record.amount;
            const sharedSnapshot = record.shared_amount_cents ?? 0;
            const totalPurchase = ownAmount + sharedSnapshot;
            const effect = record.record_type_id != null
                ? effectMap.get(record.record_type_id)
                : null;
            const receivable = effect === '-'
                ? getRecordReceivableCents(record)
                : 0;
            const paid = effect === '-'
                ? getRecordPaidByMeCents(record)
                : effect === '+'
                    ? ownAmount
                    : 0;
            const cashAmount = effect === '+'
                ? ownAmount
                : effect === '-'
                    ? paid
                    : 0;

            const recordType = balanceByRecordType.find(item => item.id === record.record_type_id);
            if (recordType) {
                addBuckets(
                    recordType,
                    ownAmount,
                    totalPurchase,
                    receivable,
                    paid,
                    cashAmount
                );
            }

            const todayRecordType = todayBalanceByRecordType.find(item => item.id === record.record_type_id);
            if (
                todayRecordType &&
                record.date >= startOfToday &&
                record.date <= endOfToday
            ) {
                addBuckets(
                    todayRecordType,
                    ownAmount,
                    totalPurchase,
                    receivable,
                    paid,
                    cashAmount
                );
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
                if (typeTotal) {
                    addBuckets(
                        typeTotal,
                        ownAmount,
                        totalPurchase,
                        receivable,
                        paid,
                        cashAmount
                    );
                }
                resume.own = sumBuckets(resume.totalPerRecordType, 'own');
                resume.shared = sumBuckets(resume.totalPerRecordType, 'shared');
                resume.total = sumBuckets(resume.totalPerRecordType, 'total');
                resume.paid = sumBuckets(resume.totalPerRecordType, 'paid');
                resume.cash = reduceBuckets(resume.totalPerRecordType, 'cash');
                resume.balance = reduceBuckets(
                    resume.totalPerRecordType,
                    'own'
                );
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
        totalPurchasesCents: balances.totalPurchases,
        receivableCents: balances.receivable,
        grossPaidCents: balances.grossPaid,
        paidBalanceCents: balances.cashIncome - balances.grossPaid,
        savingsPaidCents: balances.savingsPaid,
        cashBalance: balances.cash,
        cashPaidCents: balances.cashPaid,
        cashIncomeCents: balances.cashIncome,
        settlementsPaidCents: balances.settlementsPaid,
        settlementsReceivedCents: balances.settlementsReceived,
        ...calculateResumes()
    }))();
};

export default useResumesStore;
