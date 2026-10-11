import { useEffect, useState } from "react";

import { useORM } from "../orm";
import type { PaidCredit, PaymentMethod } from "../interfaces/schema";
import useConfigs from "../hooks/useConfigs";
import { useDataStore } from ".";

const getClosingDate = (year: number, month: number, day: number) => {
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(day, lastDayOfMonth));
};

const getCurrentAndPreviousPeriods = (closingDay: number, today: Date) => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let periodEnd = getClosingDate(today.getFullYear(), today.getMonth(), closingDay);

    if (periodEnd < todayStart) {
        periodEnd = getClosingDate(today.getFullYear(), today.getMonth() + 1, closingDay);
    }

    const periodStart = getClosingDate(
        periodEnd.getFullYear(),
        periodEnd.getMonth() - 1,
        closingDay
    );
    periodStart.setDate(periodStart.getDate() + 1);
    periodStart.setHours(0, 0, 0, 0);
    periodEnd.setHours(23, 59, 59, 999);

    const previousEnd = new Date(periodStart.getTime() - 1);
    const previousStart = getClosingDate(
        previousEnd.getFullYear(),
        previousEnd.getMonth() - 1,
        closingDay
    );
    previousStart.setDate(previousStart.getDate() + 1);
    previousStart.setHours(0, 0, 0, 0);

    return {
        current: [periodStart.getTime(), periodEnd.getTime()] as const,
        previous: [previousStart.getTime(), previousEnd.getTime()] as const
    };
};

export interface Credit extends PaymentMethod {
    totalCurrent: number;
    totalPrevious: number;
    totalCurrentPayments: number;
}

export const useCreditStore = () => {
    const { PaymentMethods } = useDataStore();
    const { configs: { creditType } } = useConfigs();
    const recordsOrm = useORM("Records");
    const paidCreditsOrm = useORM("PaidCredits");
    const [credits, setCredits] = useState<Credit[]>([]);

    useEffect(() => {
        let isMounted = true;

        const loadCredits = async () => {
            try {
                const [records, paidCredits] = await Promise.all([
                    recordsOrm.getAll(),
                    paidCreditsOrm.getAll()
                ]);
                const today = new Date();

                const calculatedCredits = PaymentMethods
                    .filter((payment): payment is PaymentMethod & { id: number; closing_date: number } =>
                        payment.id !== undefined &&
                        payment.closing_date !== undefined &&
                        payment.closing_date !== null &&
                        payment.closing_date > 0
                    )
                    .map(payment => {
                        const { current, previous } = getCurrentAndPreviousPeriods(
                            payment.closing_date,
                            today
                        );
                        const isInPeriod = (date: number, period: readonly [number, number]) =>
                            date >= period[0] && date <= period[1];
                        const cardRecords = records.filter(record =>
                            record.payment_method_id === payment.id &&
                            record.record_type_id === creditType
                        );
                        const cardPayments = paidCredits.filter(
                            (paidCredit: PaidCredit) => paidCredit.payment_method_id === payment.id
                        );

                        return {
                            ...payment,
                            totalCurrent: cardRecords
                                .filter(record => isInPeriod(record.date, current))
                                .reduce((total, record) => total + record.amount, 0),
                            totalPrevious: cardRecords
                                .filter(record => isInPeriod(record.date, previous))
                                .reduce((total, record) => total + record.amount, 0),
                            totalCurrentPayments: cardPayments
                                .filter(paidCredit => isInPeriod(paidCredit.date, current))
                                .reduce((total, paidCredit) => total + paidCredit.amount, 0)
                        };
                    });

                if (isMounted) setCredits(calculatedCredits);
            } catch (error) {
                console.error("Error loading credit card summaries:", error);
            }
        };

        void loadCredits();
        return () => {
            isMounted = false;
        };
    }, [PaymentMethods, creditType]);

    return { credits };
};
