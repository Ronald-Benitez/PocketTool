import { create } from "zustand"
import { useEffect, useState } from "react"
import useRecordsStore from "./RecordsStore"
import { useConfigs } from "../hooks/useConfigs"
import { useDataStore } from "."
import { PaymentMethod } from "../interfaces/schema"
import { useRecords } from "../db"
import { getCreditPeriods } from "../utils/creditPeriods"

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
        
        const credits = await Promise.all(filteredPayments.map(async payment => {
            if (!payment.id) return {
                ...payment,
                totalCurrent: 0,
                totalPrevious: 0
            }

            const {
                currentPeriodStart,
                currentPeriodEnd,
                previousPeriodStart,
                previousPeriodEnd,
            } = getCreditPeriods(payment)

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