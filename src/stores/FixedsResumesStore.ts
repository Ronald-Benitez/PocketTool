import { useEffect, useState } from "react";
import { create } from "zustand";

import { useConfigs } from "../hooks/useConfigs";
import { useFinancingsRepository, useSharedParticipantsRepository } from "../db";
import { summarizeFinancing } from "../domain/credits/summary";
import type {
    RecordType as RecordTypes,
    PaymentType as PaymentTypes,
    PaymentMethod as PaymentMethods,
    Category as Categories,
    FinancingWithRelations,
    SharedExpenseParticipant,
} from "../interfaces/schema";
import { useDataStore } from ".";
interface totalPerRecordType extends RecordTypes {
    total: number;
}

export interface Resumes {
    balance: number;
    ownBalance: number;
    sharedBalance: number;
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
    const { PaymentMethods, Categories, RecordTypes, PaymentTypes, Fixeds, Financings } = useDataStore()
    const financingsRepository = useFinancingsRepository()
    const participantsRepository = useSharedParticipantsRepository()
    const [financings, setFinancings] = useState<FinancingWithRelations[]>([])
    const [participants, setParticipants] = useState<SharedExpenseParticipant[]>([])

    useEffect(() => {
        let active = true
        financingsRepository.fetchFinancings().then((rows) => {
            if (active) setFinancings(rows)
        })
        return () => { active = false }
    }, [Financings])

    useEffect(() => {
        let active = true
        participantsRepository.fetchAll().then((rows) => {
            if (active) setParticipants(rows)
        })
        return () => { active = false }
    }, [Fixeds, Financings, financings])

    const financingObligations = financings
        .filter((financing) => financing.status === 'active')
        .map((financing) => ({
            financing,
            summary: summarizeFinancing(
                financing,
                financing.FinancingPayments ?? [],
                financing.FinancingAdjustments ?? []
            ),
        }))
        .filter(({ summary }) => summary.monthlyPaymentCents > 0)

    const participantsByOwner = new Map<string, SharedExpenseParticipant[]>()
    participants.forEach((participant) => {
        const key = `${participant.owner_type}:${participant.owner_id}`
        const list = participantsByOwner.get(key) ?? []
        list.push(participant)
        participantsByOwner.set(key, list)
    })

    const splitAmount = (ownerType: 'fixed' | 'financing', ownerId: number | undefined, amount: number) => {
        if (!ownerId) return { total: amount, own: amount, shared: 0 }
        const list = participantsByOwner.get(`${ownerType}:${ownerId}`) ?? []
        const percent = Math.min(
            100,
            list.reduce((sum, participant) => sum + participant.share_percent, 0)
        )
        const shared = Math.round((amount * percent) / 100)
        return { total: amount, own: amount - shared, shared }
    }

    const calculateBalances = () => {
        const balances = { total: 0, own: 0, shared: 0 }

        Fixeds.forEach((fixed) => {
            if (fixed.record_type_id == null || !recordTypes.includes(fixed.record_type_id)) return
            const split = splitAmount('fixed', fixed.id, fixed.fixed_amount)
            if (fixed.RecordTypes?.effect === '+') {
                balances.total += split.total
                balances.own += split.own
                balances.shared += split.shared
            } else if (fixed.RecordTypes?.effect === '-') {
                balances.total -= split.total
                balances.own -= split.own
                balances.shared -= split.shared
            }
        })

        financingObligations.forEach(({ financing, summary }) => {
            if (financing.record_type_id == null || !recordTypes.includes(financing.record_type_id)) return
            const split = splitAmount('financing', financing.id, summary.monthlyPaymentCents)
            if (financing.RecordTypes?.effect === '+') {
                balances.total += split.total
                balances.own += split.own
                balances.shared += split.shared
            } else if (financing.RecordTypes?.effect === '-') {
                balances.total -= split.total
                balances.own -= split.own
                balances.shared -= split.shared
            }
        })

        return balances
    }

    const calculeteResumes = (): Omit<
        Resumes,
        "balance" | "ownBalance" | "sharedBalance"
    > => {

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

            const paymentTypeId =
                fixed.PaymentMethods?.payment_type_id ?? fixed.PaymentMethods?.PaymentTypes?.id;
            const paymentType = paymentTypeResume.find(pt => pt.id === paymentTypeId);
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

        financingObligations.forEach(({ financing, summary }) => {
            const amount = summary.monthlyPaymentCents;
            const recordType = recordTypeResume.find(
                (rt) => rt.id === financing.record_type_id
            );
            if (recordType) {
                recordType.total += amount;
            }

            const paymentTypeId =
                financing.PaymentMethods?.payment_type_id ??
                financing.PaymentMethods?.PaymentTypes?.id;
            const paymentType = paymentTypeResume.find(
                (pt) => pt.id === paymentTypeId
            );
            if (paymentType) {
                paymentType.totalPerRecordType.forEach((r) => {
                    if (r.id === financing.record_type_id) {
                        r.total += amount;
                    }
                });
                paymentType.balance =
                    paymentType?.totalPerRecordType?.reduce(typeReducer, 0) || 0;
            }

            const paymentMethod = paymentMethodResume.find(
                (pm) => pm.id === financing.payment_method_id
            );
            if (paymentMethod) {
                paymentMethod.totalPerRecordType.forEach((r) => {
                    if (r.id === financing.record_type_id) {
                        r.total += amount;
                    }
                });
                paymentMethod.balance =
                    paymentMethod?.totalPerRecordType?.reduce(typeReducer, 0) || 0;
            }

            const category = categoryResume.find(
                (cat) => cat.id === financing.category_id
            );
            if (category) {
                category.totalPerRecordType.forEach((r) => {
                    if (r.id === financing.record_type_id) {
                        r.total += amount;
                    }
                });
                category.balance =
                    category?.totalPerRecordType?.reduce(typeReducer, 0) || 0;
            }
        })

        return {
            balanceByRecordType: recordTypeResume,
            balanceByPaymentType: paymentTypeResume,
            balanceByPaymentMethod: paymentMethodResume,
            balanceByCategory: categoryResume
        }
    }

    const balances = calculateBalances()

    return create<Resumes>((set, get) => ({
        balance: balances.total,
        ownBalance: balances.own,
        sharedBalance: balances.shared,
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