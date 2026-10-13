import { create } from "zustand"
import { useEffect, useState } from "react"
import useRecordsStore from "./RecordsStore"
import useConfigs from "../hooks/useConfigs"
import { useDataStore } from "."
import { PaymentMethod } from "../interfaces/schema"
import { ORM, useORM } from "../orm"
import { useSQLiteContext } from "expo-sqlite"

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
    const { configs: { creditType, paymentCreditType } } = useConfigs()
    const [credits, setCredits] = useState<Credit[] | undefined>()

    const db = useSQLiteContext()

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
            const recordsOrm = new ORM<"Records">(db, "Records")
            const paidCreditsOrm = new ORM<"PaidCredits">(db, "PaidCredits")
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

            const currentCredits = await recordsOrm.whereMany([
                {column: "payment_method_id", operator:"=", value: payment.id},
                {column: "date", operator:"BETWEEN", value:[currentPeriodStart, currentPeriodEnd]}]
            ).getAll()
            const currentPayments = await paidCreditsOrm.whereMany([
                {column: "payment_method_id", operator:"=", value: payment.id},
                {column: "date", operator:"BETWEEN", value:[currentPeriodStart, currentPeriodEnd]}]
            ).getAll()

            
            const totalCurrent = currentCredits?.reduce((acc, current) => acc + current.amount, 0) || 0
            const totalCurrentPayments = currentPayments?.reduce((acc, current) => acc + current.amount, 0) || 0
            
            const previousCredits = await recordsOrm.whereMany([
                {column: "payment_method_id", operator:"=", value: payment.id},
                {column: "date", operator:"BETWEEN", value:[previousPeriodStart, previousPeriodEnd]}]
            ).getAll()
            const totalPrevious = previousCredits?.reduce((acc, current) => acc + current.amount, 0) || 0
            
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