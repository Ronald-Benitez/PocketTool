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

type AmountBuckets = {
    own: number;
    shared: number;
    total: number;
    paid: number;
    cash: number;
};

interface totalPerRecordType extends RecordTypes, AmountBuckets {}

type BucketResume<T> = T & AmountBuckets & {
    balance: number;
    totalPerRecordType: totalPerRecordType[];
};

export interface Resumes {
    /** Personal balance: only the user's own share. */
    balance: number;
    /** Total balance including the shared share. */
    totalBalance: number;
    ownBalance: number;
    sharedBalance: number;
    balanceByRecordType: (RecordTypes & AmountBuckets)[];
    balanceByPaymentType: BucketResume<PaymentTypes>[];
    balanceByPaymentMethod: BucketResume<PaymentMethods>[];
    balanceByCategory: BucketResume<Categories>[];
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
    shared: number,
    paid = own + shared,
    cash = 0
) => {
    target.own += own;
    target.shared += shared;
    target.total += own + shared;
    target.paid += paid;
    target.cash += cash;
};

const sumBuckets = (
    items: totalPerRecordType[],
    field: keyof AmountBuckets
) => items.reduce((total, item) => total + item[field], 0);

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
        "balance" | "totalBalance" | "ownBalance" | "sharedBalance"
    > => {
        const recordTypeResume = RecordTypes.map(rt => ({
            ...rt,
            ...emptyBuckets(),
        }));
        const paymentTypeResume = PaymentTypes.map(pt => ({
            ...pt,
            ...emptyBuckets(),
            balance: 0,
            totalPerRecordType: RecordTypes.map(r => ({
                ...r,
                ...emptyBuckets(),
            })),
        }));
        const paymentMethodResume = PaymentMethods.map(pm => ({
            ...pm,
            ...emptyBuckets(),
            balance: 0,
            totalPerRecordType: RecordTypes.map(r => ({
                ...r,
                ...emptyBuckets(),
            })),
        }));
        const categoryResume = Categories.map(cat => ({
            ...cat,
            ...emptyBuckets(),
            balance: 0,
            totalPerRecordType: RecordTypes.map(r => ({
                ...r,
                ...emptyBuckets(),
            })),
        }));

        const addToResumes = (
            recordTypeId: number | null | undefined,
            paymentTypeId: number | null | undefined,
            paymentMethodId: number | null | undefined,
            categoryId: number | null | undefined,
            own: number,
            shared: number
        ) => {
            const recordType = recordTypeResume.find(rt => rt.id === recordTypeId);
            if (recordType) addBuckets(recordType, own, shared);

            const paymentType = paymentTypeResume.find(pt => pt.id === paymentTypeId);
            if (paymentType) {
                paymentType.totalPerRecordType.forEach(r => {
                    if (r.id === recordTypeId) addBuckets(r, own, shared);
                });
                paymentType.own = sumBuckets(paymentType.totalPerRecordType, 'own');
                paymentType.shared = sumBuckets(paymentType.totalPerRecordType, 'shared');
                paymentType.total = sumBuckets(paymentType.totalPerRecordType, 'total');
                paymentType.paid = sumBuckets(paymentType.totalPerRecordType, 'paid');
                paymentType.balance = paymentType.own;
            }

            const paymentMethod = paymentMethodResume.find(pm => pm.id === paymentMethodId);
            if (paymentMethod) {
                paymentMethod.totalPerRecordType.forEach(r => {
                    if (r.id === recordTypeId) addBuckets(r, own, shared);
                });
                paymentMethod.own = sumBuckets(paymentMethod.totalPerRecordType, 'own');
                paymentMethod.shared = sumBuckets(paymentMethod.totalPerRecordType, 'shared');
                paymentMethod.total = sumBuckets(paymentMethod.totalPerRecordType, 'total');
                paymentMethod.paid = sumBuckets(paymentMethod.totalPerRecordType, 'paid');
                paymentMethod.balance = paymentMethod.own;
            }

            const category = categoryResume.find(cat => cat.id === categoryId);
            if (category) {
                category.totalPerRecordType.forEach(r => {
                    if (r.id === recordTypeId) addBuckets(r, own, shared);
                });
                category.own = sumBuckets(category.totalPerRecordType, 'own');
                category.shared = sumBuckets(category.totalPerRecordType, 'shared');
                category.total = sumBuckets(category.totalPerRecordType, 'total');
                category.paid = sumBuckets(category.totalPerRecordType, 'paid');
                category.balance = category.own;
            }
        };

        Fixeds.map(fixed => {
            const split = splitAmount('fixed', fixed.id, fixed.fixed_amount);
            addToResumes(
                fixed.record_type_id,
                fixed.PaymentMethods?.payment_type_id ?? fixed.PaymentMethods?.PaymentTypes?.id,
                fixed.payment_method_id,
                fixed.category_id,
                split.own,
                split.shared
            );
        })

        financingObligations.forEach(({ financing, summary }) => {
            const split = splitAmount(
                'financing',
                financing.id,
                summary.monthlyPaymentCents
            );
            addToResumes(
                financing.record_type_id,
                financing.PaymentMethods?.payment_type_id ?? financing.PaymentMethods?.PaymentTypes?.id,
                financing.payment_method_id,
                financing.category_id,
                split.own,
                split.shared
            );
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
        balance: balances.own,
        totalBalance: balances.total,
        ownBalance: balances.own,
        sharedBalance: balances.shared,
        ...calculeteResumes(),
    }))();
}

export default useFixedsResumesStore;
