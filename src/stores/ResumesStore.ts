import { useEffect, useState } from "react";
import { create } from "zustand";

import useConfigs from "../hooks/useConfigs";
import useRecordsStore from "./RecordsStore";
import { RecordTypes, PaymentTypes, PaymentMethods, Categories } from "../db/types/tables";
import { useDataStore } from ".";
import { useCreditStore } from "./CreditsStore";

interface totalPerRecordType extends RecordTypes {
    total: number;
}

export interface Resumes {
    balance: number;
    todayBalanceByRecordType: (RecordTypes & {
        total: number;
    })[];
    balanceByRecordType: (RecordTypes & {
        total: number;
    })[];
    balanceByPaymentType: (PaymentTypes & {
        balance: number,
        totalPerRecordType: totalPerRecordType[];
    })[];
    balanceByPaymentMethod: (PaymentMethods & {
        balance: number,
        totalPerRecordType: totalPerRecordType[];
    })[];
    balanceByCategory: (Categories & {
        balance: number,
        totalPerRecordType: totalPerRecordType[];
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
            balance: 0,
            totalPerRecordType: RecordTypes.map(r => ({
                ...r,
                total: 0
            })),
        }));
        const paymentMethodResume = PaymentMethods.map(pm => ({
            ...pm,
            balance: 0,
            totalPerRecordType: RecordTypes.map(r => ({
                ...r,
                total: 0
            })),
        }));
        const categoryResume = Categories.map(cat => ({
            ...cat,
            balance: 0,
            totalPerRecordType: RecordTypes.map(r => ({
                ...r,
                total: 0
            })),
        }));

        const today = new Date()

        const endLimit = today.getTime()
        today.setHours(0, 0, 0)
        const startLimit = today.getTime()

        console.log(records, paymentTypeResume)
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
                paymentType.balance = paymentType?.totalPerRecordType?.reduce(typeReducer, 0) || 0
            }


            const paymentMethod = paymentMethodResume.find(pm => pm.id === record.payment_method_id);
            if (paymentMethod) {
                paymentMethod.totalPerRecordType.forEach(r => {
                    if (r.id === record.record_type_id) {
                        r.total += record.amount;
                    }
                });
                paymentMethod.balance = paymentMethod?.totalPerRecordType?.reduce(typeReducer, 0) || 0;
            }



            const category = categoryResume.find(cat => cat.id === record.category_id);
            if (category) {
                category.totalPerRecordType.forEach(r => {
                    if (r.id === record.record_type_id) {
                        r.total += record.amount;
                    }
                });
                category.balance = category?.totalPerRecordType?.reduce(typeReducer, 0) || 0;
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

const typeReducer = (acc: number, type: totalPerRecordType) => {
    if (type.effect == "-") {
        return acc - type.total;
    }
    if (type.effect == "+") {
        return acc + type.total;
    }
    return acc;
}

export default useResumesStore;