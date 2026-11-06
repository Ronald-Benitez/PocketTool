import { create } from "zustand"
import { useEffect, useState } from "react"
import useRecordsStore from "./RecordsStore"
import { useConfigs } from "../hooks/useConfigs"
import { useDataStore } from "."
import { PaymentMethod } from "../interfaces/schema"
import { useRecords } from "../db"
import { getCreditPeriods } from "../utils/creditPeriods"
import { cardInstallmentUsage } from "../domain/credits/cards"

export interface Credit extends PaymentMethod {
    totalCurrent?: number
    totalCurrentOwn?: number
    totalCurrentShared?: number
    totalCurrentCombined?: number
    totalPrevious?: number
    totalPreviousOwn?: number
    totalPreviousShared?: number
    totalPreviousCombined?: number
    totalCurrentPayments?: number
    installmentsPendingCents?: number
}

export const useCreditStore = () => {
    const { records } = useRecordsStore()
    const { PaymentMethods, Financings } = useDataStore()
    const { configs: { creditType } } = useConfigs()
    const [credits, setCredits] = useState<Credit[] | undefined>()
    const { fetchCreditPeriodTotals } = useRecords()

    useEffect(() => {
        const load = async () => {
            const result = await calculatePaymentTotal()
            setCredits(result)
        }
        load()
    }, [records, creditType, Financings])

    const calculatePaymentTotal = async () => {
        const filteredPayments = PaymentMethods.filter(
          p =>
            Boolean(p?.is_credit_card) ||
            (p?.closing_date || 0) > 0 ||
            p?.visual_kind === 'credit_card'
        )

        const installmentUsage = cardInstallmentUsage(Financings)
        
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

            const totalCurrentOwn = currentTotals.recordsOwnTotal
            const totalCurrentShared = currentTotals.recordsSharedTotal
            const totalCurrentCombined = currentTotals.recordsCombinedTotal
            const totalPreviousOwn = previousTotals.recordsOwnTotal
            const totalPreviousShared = previousTotals.recordsSharedTotal
            const totalPreviousCombined = previousTotals.recordsCombinedTotal
            const totalCurrentPayments = currentTotals.paymentsTotal
            const installmentsPendingCents = payment.id
                ? installmentUsage.get(payment.id) ?? 0
                : 0

            const newPayment = {
                ...payment,
                totalCurrent: totalCurrentOwn,
                totalCurrentOwn,
                totalCurrentShared,
                totalCurrentCombined,
                totalCurrentPayments,
                totalPrevious: totalPreviousOwn,
                totalPreviousOwn,
                totalPreviousShared,
                totalPreviousCombined,
                installmentsPendingCents
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