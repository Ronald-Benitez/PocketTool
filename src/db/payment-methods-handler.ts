import { useSQLiteContext } from "expo-sqlite/next";

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
          INSERT INTO PaymentMethods (method_name, payment_type) VALUES (?, ?)`,
        paymentMethod.method_name,
        paymentMethod.payment_type
      );
    } catch (error) {
      console.error(error);
      throw error; // Propaga el error
    }
  };

  const updatePaymentMethod = async (
    id: number,
    methodName: string,
    type: "credit" | "debit"
  ) => {
    try {
      await db.runAsync(
        `
          UPDATE PaymentMethods 
          SET method_name = ?, payment_type = ? 
          WHERE id = ?`,
        methodName,
        type,
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
