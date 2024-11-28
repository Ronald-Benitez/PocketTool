import { useSQLiteContext } from "expo-sqlite";

import { PaymentMethod, CreatePaymentMethodRequest } from "@/src/interfaces";

export const usePaymentMethods = () => {
  const db = useSQLiteContext();

  const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
    try {
      const result = (await db.getAllAsync(
        "SELECT * FROM PaymentMethods"
      )) as PaymentMethod[];
      return result;
    } catch (error) {
      console.error(error);
      throw error; // Propaga el error
    }
  };

  const addPaymentMethod = async (
    paymentMethod: CreatePaymentMethodRequest
  ) => {
    try {
      await db.runAsync(
        `
          INSERT INTO PaymentMethods (method_name, payment_type, closing_date) VALUES (?, ?, ?)`,
        paymentMethod.method_name,
        paymentMethod.payment_type,
        paymentMethod.closing_date
      );
    } catch (error) {
      console.error(error);
      throw error; // Propaga el error
    }
  };

  const updatePaymentMethod = async (
    id: number,
    methodName: string,
    type: "credit" | "debit",
    closingDate: number
  ) => {
    try {
      await db.runAsync(
        `
          UPDATE PaymentMethods 
          SET method_name = ?, payment_type = ?, closing_date = ?
          WHERE id = ?`,
        methodName,
        type,
        closingDate,
        id
      );
    } catch (error) {
      console.error(error);
      throw error; // Propaga el error
    }
  };

  const deletePaymentMethod = async (id: number) => {
    try {
      await db.runAsync("DELETE FROM PaymentMethods WHERE id = ?", id);
    } catch (error) {
      console.error(error);
      throw error; // Propaga el error
    }
  };
  return {
    addPaymentMethod,
    deletePaymentMethod,
    fetchPaymentMethods,
    updatePaymentMethod,
  };
};
