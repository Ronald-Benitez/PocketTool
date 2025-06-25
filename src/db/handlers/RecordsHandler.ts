import { useSQLiteContext } from "expo-sqlite";
import { RecordJoined } from "../types/tables";
import { useHandler } from "./handler";

export const useRecords = () => {
    const db = useSQLiteContext();
    const handler = useHandler("Records")
    const fetchRecords = async (group_id: number | undefined): Promise<RecordJoined[] | undefined> => {
        if (!group_id) return;
        return (await db.getAllAsync(
            `
        SELECT 
          Records.id AS record_id, 
          Groups.id AS group_id,
          Categories.id AS category_id,
          PaymentMethods.id AS payment_method_id,
          PaymentTypes.id AS payment_type_id,
          RecordTypes.id AS record_type_id,
          Records.*, 
          Groups.*, 
          Categories.*, 
          PaymentMethods.*,
          PaymentTypes.*,
          RecordTypes.*
        FROM Records
        JOIN Groups ON Records.group_id = Groups.id
        JOIN Categories ON Records.category_id = Categories.id
        JOIN PaymentMethods ON Records.payment_method_id = PaymentMethods.id
        JOIN PaymentTypes ON PaymentMethods.payment_type_id = PaymentTypes.id
        JOIN RecordTypes ON Records.record_type_id = RecordTypes.id
        WHERE Records.group_id = ?
        ORDER BY date ASC
      `,
            [group_id]
        )) as RecordJoined[];
    };

    const fetchCredits = async (payment_method_id: number, record_type_id: number, startLimit: number, endLimit: number) => {
        if (!payment_method_id) return;
        return (await db.getAllAsync(
            `
        SELECT 
          Records.id AS record_id, 
          Groups.id AS group_id,
          Categories.id AS category_id,
          PaymentMethods.id AS payment_method_id,
          PaymentTypes.id AS payment_type_id,
          RecordTypes.id AS record_type_id,
          Records.*, 
          Groups.*, 
          Categories.*, 
          PaymentMethods.*,
          PaymentTypes.*,
          RecordTypes.*
        FROM Records
        JOIN Groups ON Records.group_id = Groups.id
        JOIN Categories ON Records.category_id = Categories.id
        JOIN PaymentMethods ON Records.payment_method_id = PaymentMethods.id
        JOIN PaymentTypes ON PaymentMethods.payment_type_id = PaymentTypes.id
        JOIN RecordTypes ON Records.record_type_id = RecordTypes.id
        WHERE Records.payment_method_id = ? AND Records.record_type_id = ? AND Records.date BETWEEN ? AND ?
        ORDER BY date ASC
      `,
            [payment_method_id, record_type_id, startLimit, endLimit]
        )) as RecordJoined[];
    }

    return {
        fetchRecords,
        fetchCredits,
        handler
    };
};
