import { create } from "zustand";

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
    balance: number;
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

    const calculateBalance = (): number => records.reduce((balance, record) => {
        if (!configuredRecordTypes.includes(record.record_type_id ?? -1)) return balance;

        const effect = record.RecordTypes?.effect
            ?? RecordTypes.find(type => type.id === record.record_type_id)?.effect;
        if (effect === "+") return balance + record.amount;
        if (effect === "-") return balance - record.amount;
        return balance;
    }, 0);

    const createRecordTypeTotals = (): TotalPerRecordType[] =>
        RecordTypes.map(recordType => ({ ...recordType, total: 0 }));

    const calculateResumes = (): Omit<Resumes, "balance"> => {
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
            const recordType = balanceByRecordType.find(item => item.id === record.record_type_id);
            if (recordType) recordType.total += record.amount;

            const todayRecordType = todayBalanceByRecordType.find(item => item.id === record.record_type_id);
            if (todayRecordType && record.date >= startOfToday && record.date <= endOfToday) {
                todayRecordType.total += record.amount;
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
                if (typeTotal) typeTotal.total += record.amount;
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

    return create<Resumes>(() => ({
        balance: calculateBalance(),
        ...calculateResumes()
    }))();
};

const typeReducer = (balance: number, recordType: TotalPerRecordType) => {
    if (recordType.effect === "-") return balance - recordType.total;
    if (recordType.effect === "+") return balance + recordType.total;
    return balance;
};

export default useResumesStore;
