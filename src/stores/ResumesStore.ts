import { useEffect, useState } from "react";
import { create } from "zustand";

import useConfigs from "../hooks/useConfigs";
import useRecordsStore from "./RecordsStore";
import { RecordTypes, PaymentTypes, PaymentMethods, Categories } from "../db/types/tables";
import { useDataStore } from ".";
import { useCreditStore } from "./CreditsStore";

interface Resumes {
    balance: number;
    todayBalanceByRecordType: (RecordTypes & {
        total: number;
    })[];
    balanceByRecordType: (RecordTypes & {
        total: number;
    })[];
    balanceByPaymentType: (PaymentTypes & {
        totalPerRecordType: (RecordTypes & {
            total: number;
        })[];
    })[];
    balanceByPaymentMethod: (PaymentMethods & {
        totalPerRecordType: (RecordTypes & {
            total: number;
        })[];
    })[];
    balanceByCategory: (Categories & {
        totalPerRecordType: (RecordTypes & {
            total: number;
        })[];
    })[];
}

export const useResumesStore = () => {
    const { configs: { recordTypes } } = useConfigs();
    const { records } = useRecordsStore();
    const { PaymentMethods, Categories, RecordTypes, PaymentTypes } = useDataStore()

    const calculateBalance = (): number => {
        return records.reduce((acc, record) => {
            if (!recordTypes.includes(record.record_type_id)) {
                return acc;
            }
            if (record.effect === '+') {
                acc += record.amount;
            }
            else if (record.effect === '-') {
                acc -= record.amount;
            }
            return acc;
        }, 0);
    }

    const calculeteResumes = (): Omit<Resumes, "balance"> => {

        const todayBalanceByRecordType = RecordTypes.map(rt => ({
            ...rt,
            total: 0,
        }));

        const recordTypeResume = RecordTypes.map(rt => ({
            ...rt,
            total: 0,
        }));
        const paymentTypeResume = PaymentTypes.map(pt => ({
            ...pt,
            totalPerRecordType: RecordTypes.map(r => ({
                ...r,
                total: 0
            })),
        }));
        const paymentMethodResume = PaymentMethods.map(pm => ({
            ...pm,
            totalPerRecordType: RecordTypes.map(r => ({
                ...r,
                total: 0
            })),
        }));
        const categoryResume = Categories.map(cat => ({
            ...cat,
            totalPerRecordType: RecordTypes.map(r => ({
                ...r,
                total: 0
            })),
        }));

        const today = new Date()

        const endLimit = today.getTime()
        today.setHours(0, 0, 0)
        const startLimit = today.getTime()


        records.map(record => {
            const recordType = recordTypeResume.find(rt => rt.id === record.record_type_id);
            const todayRecordType = todayBalanceByRecordType.find(rt => rt.id === record.record_type_id)
            if (recordType) {
                recordType.total += record.amount;
            }

            if (todayRecordType && (record.date >= startLimit && record.date <= endLimit)) {
                todayRecordType.total += record.amount
            }

            const paymentType = paymentTypeResume.find(pt => pt.id === record.payment_type_id);
            if (paymentType) {
                paymentType.totalPerRecordType.forEach(r => {
                    if (r.id === record.record_type_id) {
                        r.total += record.amount;
                    }
                });
            }

            const paymentMethod = paymentMethodResume.find(pm => pm.id === record.payment_method_id);
            if (paymentMethod) {
                paymentMethod.totalPerRecordType.forEach(r => {
                    if (r.id === record.record_type_id) {
                        r.total += record.amount;
                    }
                });
            }

            const category = categoryResume.find(cat => cat.id === record.category_id);
            if (category) {
                category.totalPerRecordType.forEach(r => {
                    if (r.id === record.record_type_id) {
                        r.total += record.amount;
                    }
                });
            }
        })

        return {
            todayBalanceByRecordType,
            balanceByRecordType: recordTypeResume,
            balanceByPaymentType: paymentTypeResume,
            balanceByPaymentMethod: paymentMethodResume,
            balanceByCategory: categoryResume
        }
    }

    return create<Resumes>((set, get) => ({
        balance: calculateBalance(),
        ...calculeteResumes(),
    }))();
}

export default useResumesStore;