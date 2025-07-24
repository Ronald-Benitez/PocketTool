import { create } from "zustand"
import { useEffect, useState } from "react"
import useRecordsStore from "./RecordsStore"
import useConfigs from "../hooks/useConfigs"
import { useDataStore } from "."
import { useRecords } from "../db/handlers/RecordsHandler"
import { PaymentMethods } from "../db/types/tables"

const getPeriods = (card: PaymentMethods, month: number, year: number) => {
    let localMonth = month;
    let localYear = year;

    if (card.closing_date < new Date().getDate()) {
        localMonth += 1;
        if (localMonth > 12) {
            localMonth = 1;
            localYear += 1;
        }
    }

    const periodStart = new Date(localYear, localMonth - 1, card.closing_date + 1, 0, 0, 0, 0).getTime();
    const periodEnd = new Date(localYear, localMonth, card.closing_date + 1, 0, 0, 0, 0).getTime() - 1;

    return [periodStart, periodEnd];
};

export interface Credit extends PaymentMethods {
    totalCurrent?: number
    totalPrevious?: number
    totalCurrentPayments?: number
}

export const useCreditStore = () => {
    const { records } = useRecordsStore()
    const { PaymentMethods } = useDataStore()
    const { configs: { creditType, paymentCreditType } } = useConfigs()
    const { fetchCredits, fetchPaidCredits } = useRecords()
    const [credits, setCredits] = useState<Credit[] | undefined>()

    useEffect(() => {
        const load = async () => {
            const result = await calculatePaymentTotal()
            setCredits(result)
        }
        load()
    }, [records, creditType])

    const calculatePaymentTotal = async () => {
        const filteredPayments = PaymentMethods.filter(p => p.closing_date > 0)
        let today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear()
        const credits = await Promise.all(filteredPayments.map(async payment => {
            if (!payment.id) return {
                ...payment,
                totalCurrent: 0,
                totalPrevious: 0
            }
            const [currentPeriodStart, currentPeriodEnd] = getPeriods(
                payment,
                month,
                year
            );
            const [previousPeriodStart, previousPeriodEnd] = getPeriods(
                payment,
                month - 1,
                year
            );
            const currentCredits = await fetchCredits(payment.id, creditType, currentPeriodStart, currentPeriodEnd)
            const currentPayments = await fetchPaidCredits(payment.id, currentPeriodStart, currentPeriodEnd)
            const totalCurrentPayments = currentPayments?.reduce((acc, current) => acc + current.amount, 0) || 0
            const previousCredits = await fetchCredits(payment.id, creditType, previousPeriodStart, previousPeriodEnd)
            const totalCurrent = currentCredits?.reduce((acc, current) => acc + current.amount, 0)
            const totalPrevious = previousCredits?.reduce((acc, current) => acc + current.amount, 0)
            const newPayment = {
                ...payment,
                totalCurrent,
                totalCurrentPayments,
                totalPrevious
            }
            return newPayment as Credit
        }))
        return credits;
    }

    calculatePaymentTotal()

    return create<{ credits: Credit[] | undefined }>((set, get) => ({
        credits
    }))();

}