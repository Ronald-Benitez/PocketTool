import { useSQLiteContext } from "expo-sqlite";
import { FixedJoined } from "../types/tables";
import { useHandler } from "./handler";

export const useFixeds = () => {
    const db = useSQLiteContext();
    const handler = useHandler("Fixed")
    const fetchFixeds = async (): Promise<FixedJoined[] | undefined> => {
        return (await db.getAllAsync(
            `
        SELECT 
          Fixed.id AS fixed_id,
          Categories.id AS category_id,
          PaymentMethods.id AS payment_method_id,
          PaymentTypes.id AS payment_type_id,
          RecordTypes.id AS record_type_id,
          Fixed.*,
          Categories.*, 
          PaymentMethods.*,
          PaymentTypes.*,
          RecordTypes.*
        FROM Fixed
        JOIN Categories ON Fixed.category_id = Categories.id
        JOIN PaymentMethods ON Fixed.payment_method_id = PaymentMethods.id
        JOIN PaymentTypes ON PaymentMethods.payment_type_id = PaymentTypes.id
        JOIN RecordTypes ON Fixed.record_type_id = RecordTypes.id
        ORDER BY fixed_day ASC
      `
        )) as FixedJoined[];
    };
    return {
        fetchFixeds,
        handler
    };
};
