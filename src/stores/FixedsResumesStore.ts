import { useEffect, useState } from "react";
import { create } from "zustand";

import useConfigs from "../hooks/useConfigs";
import { RecordTypes, PaymentTypes, PaymentMethods, Categories } from "../db/types/tables";
import { useDataStore } from ".";
interface totalPerRecordType extends RecordTypes {
    total: number;
}

export interface Resumes {
    balance: number;
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

export const useFixedsResumesStore = () => {
    const { configs: { recordTypes } } = useConfigs();
    const { PaymentMethods, Categories, RecordTypes, PaymentTypes, Fixeds } = useDataStore()

    const calculateBalance = (): number => {
        return Fixeds.reduce((acc, fixed) => {
            if (!recordTypes.includes(fixed.record_type_id)) {
                return acc;
            }
            if (fixed.effect === '+') {
                acc += fixed.fixed_amount;
            }
            else if (fixed.effect === '-') {
                acc -= fixed.fixed_amount;
            }
            return acc;
        }, 0);
    }

    const calculeteResumes = (): Omit<Resumes, "balance"> => {

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

        Fixeds.map(fixed => {
            const recordType = recordTypeResume.find(rt => rt.id === fixed.record_type_id);
            if (recordType) {
                recordType.total += fixed.fixed_amount;
            }

            const paymentType = paymentTypeResume.find(pt => pt.id === fixed.payment_type_id);
            if (paymentType) {
                paymentType.totalPerRecordType.forEach(r => {
                    if (r.id === fixed.record_type_id) {
                        r.total += fixed.fixed_amount;
                    }
                });
                paymentType.balance = paymentType?.totalPerRecordType?.reduce(typeReducer, 0) || 0
            }


            const paymentMethod = paymentMethodResume.find(pm => pm.id === fixed.payment_method_id);
            if (paymentMethod) {
                paymentMethod.totalPerRecordType.forEach(r => {
                    if (r.id === fixed.record_type_id) {
                        r.total += fixed.fixed_amount;
                    }
                });
                paymentMethod.balance = paymentMethod?.totalPerRecordType?.reduce(typeReducer, 0) || 0;
            }



            const category = categoryResume.find(cat => cat.id === fixed.category_id);
            if (category) {
                category.totalPerRecordType.forEach(r => {
                    if (r.id === fixed.record_type_id) {
                        r.total += fixed.fixed_amount;
                    }
                });
                category.balance = category?.totalPerRecordType?.reduce(typeReducer, 0) || 0;
            }
        })

        return {
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

export default useFixedsResumesStore;