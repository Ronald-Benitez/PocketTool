import { create } from "zustand"
import { useEffect, useState } from "react"
import useRecordsStore from "./RecordsStore"
import useConfigs from "../hooks/useConfigs"
import { useDataStore } from "."
import { PaymentMethod } from "../interfaces/schema"
import { useRecords } from "../db"

const getPeriods = (card: PaymentMethod, month: number, year: number) => {
    if(!card?.closing_date) return [0,0]
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

export interface Credit extends PaymentMethod {
    totalCurrent?: number
    totalPrevious?: number
    totalCurrentPayments?: number
}

export const useCreditStore = () => {
    const { records } = useRecordsStore()
    const { PaymentMethods } = useDataStore()
    const { configs: { creditType } } = useConfigs()
    const [credits, setCredits] = useState<Credit[] | undefined>()
    const { fetchCreditPeriodTotals } = useRecords()

    useEffect(() => {
        const load = async () => {
            const result = await calculatePaymentTotal()
            setCredits(result)
        }
        load()
    }, [records, creditType])

    const calculatePaymentTotal = async () => {
        const filteredPayments = PaymentMethods.filter(p => (p?.closing_date || 0) > 0)
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

            const currentTotals = await fetchCreditPeriodTotals(
                payment.id,
                currentPeriodStart,
                currentPeriodEnd
            )
            const previousTotals = await fetchCreditPeriodTotals(
                payment.id,
                previousPeriodStart,
                previousPeriodEnd
            )

            const totalCurrent = currentTotals.recordsTotal
            const totalCurrentPayments = currentTotals.paymentsTotal
            const totalPrevious = previousTotals.recordsTotal
            
            //console.log(payment, previousCredits, new Date(previousPeriodStart), new Date(previousPeriodEnd), totalPrevious)

            const newPayment = {
                ...payment,
                totalCurrent,
                totalCurrentPayments,
                totalPrevious
            }
            //console.log("New Payment", newPayment)
            return newPayment as Credit
        }))
        //console.log(credits)
        return credits;
    }

    calculatePaymentTotal()

    return create<{ credits: Credit[] | undefined }>((set, get) => ({
        credits
    }))();

}