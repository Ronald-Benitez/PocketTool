import { useEffect } from "react";

import useConfigs from "../hooks/useConfigs";
import useRecordsStore from "./RecordsStore";
import { RecordTypes, PaymentTypes, PaymentMethods, Categories } from "../db/types/tables";
import { useDataStore } from ".";

interface Resumes {
    balance: number;
    balanceByRecordType: RecordTypes & {
        total: number;
    }[];
    balanceByPaymentType: PaymentTypes & {
        total: number;
    }[];
    balanceByPaymentMethod: PaymentMethods & {
        total: number;
    }[]
    balanceByCategory: Categories & {
        total: number;
    }[]
}

export const useResumesStore = () => {
    const { configs: { recordTypes } } = useConfigs();
    const { records } = useRecordsStore();
    const { PaymentMethods, Categories, RecordTypes, PaymentTypes } = useDataStore()

    useEffect(() => {
        calculeteResumes();
    }, [records, recordTypes]);

    const calculateBalance = (filterByConfig = false): number => {
        return records.reduce((acc, record) => {
            // effect =, -, +
            if (filterByConfig && !recordTypes.includes(record.record_type_id)) {
                return acc;
            }
            if (record.effect === '+') {
                acc += record.amount;
            }
            else if (record.effect === '-') {
                acc -= record.amount;
            }
            else if (record.effect === '=') {
                // Do nothing for '=' effect
            }
            return acc;
        }, 0);
    }

    // all the resumes exluding balance
    const calculeteResumes = (filterByConfig = false): Omit<Resumes, "balance"> => {
        const recordTypeResume = RecordTypes.map(rt => ({
            ...rt,
            total: 0
        }));
        const paymentTypeResume = PaymentTypes.map(pt => ({
            ...pt,
            total: 0
        }));
        const paymentMethodResume = PaymentMethods.map(pm => ({
            ...pm,
            total: 0

        }));
        const categoryResume = Categories.map(cat => ({
            ...cat,
            total: 0
        }));


        records.map(record => {
            const recordType = recordTypeResume.find(rt => rt.id === record.record_type_id);
            if (recordType) {
                recordType.total += record.amount;
            }

            const paymentType = paymentTypeResume.find(pt => pt.id === record.payment_type_id);
            if (paymentType) {
                paymentType.total += record.amount;
            }

            const paymentMethod = paymentMethodResume.find(pm => pm.id === record.payment_method_id);
            if (paymentMethod) {
                paymentMethod.total += record.amount;
            }

            const category = categoryResume.find(cat => cat.id === record.category_id);
            if (category) {
                category.total += record.amount;
            }
        })

        return {
            balanceByRecordType: recordTypeResume,
            balanceByPaymentType: paymentTypeResume,
            balanceByPaymentMethod: paymentMethodResume,
            balanceByCategory: categoryResume
        }
    }

    const calculeteResumes = (): Resumes => {
        return {
            balance: calculateBalance()
        }
    }

}

export default useResumesStore;