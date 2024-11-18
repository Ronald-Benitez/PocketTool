import { useSQLiteContext } from "expo-sqlite";
import {
  RecordI,
  CreateRecordRequest,
  Group,
  Category,
  PaymentMethod,
  BudgetInsert,
  Budget,
} from "@/src/interfaces";

export interface ResumeTotalsBudget {
  transferTotal: number | null;
  expensesTotal: number | null;
  incomesTotal: number | null;
  balance: number;
}


export const useBudget = () => {
  const db = useSQLiteContext();


  const fetchBudget = async (group_id: number | undefined) => {
    if (!group_id) return;
    return (await db.getAllAsync(
      `
        SELECT 
          Budgets.*, 
          Categories.*
        FROM Budgets
        JOIN Groups ON Budgets.group_id = Groups.id
        JOIN Categories ON Budgets.category_id = Categories.id
        WHERE Budgets.group_id = ?
      `,
      [group_id]
    )) as Budget[];
  };

  const fetchTotalExpenses = async (
    group_id: number | undefined
  ): Promise<number | null> => {
    if (!group_id) return null;
    try {
      const result = await db.getAllAsync(
        `
            SELECT SUM(amount) as totalExpense 
            FROM Budgets
            WHERE group_id = ? AND budget_type = 'expense'
            `,
        [group_id]
      );
      //@ts-ignore
      return result[0]?.totalExpense ?? 0; // Si no hay resultado, devuelve 0
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const fetchTotalIncomes = async (
    group_id: number | null
  ): Promise<number | null> => {
    if (!group_id) return null;
    try {
      const result = await db.getAllAsync(
        `
          SELECT SUM(amount) as totalIncome 
          FROM Budgets
          WHERE group_id = ? AND budget_type = 'income'
          `,
        [group_id]
      );
      //@ts-ignore
      return result[0]?.totalIncome ?? 0; // Si no hay resultado, devuelve 0
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const fetchTotalTransfers = async (
    group_id: number | null
  ): Promise<number | null> => {
    if (!group_id) return null;
    try {
      const result = await db.getAllAsync(
        `
          SELECT SUM(amount) as totalTransfer 
          FROM Budgets
          WHERE group_id = ? AND budget_type = 'transfer'
          `,
        [group_id]
      );
      //@ts-ignore
      return result[0]?.totalTransfer ?? 0; // Si no hay resultado, devuelve 0
    } catch (error) {
      console.error(error);
      return null;
    }
  };


  const addBudget = async (record: BudgetInsert) => {
    return await db.runAsync(
      `
            INSERT INTO Budgets (amount, budget_type, group_id, category_id) 
            VALUES (?, ?, ?, ?)`,
      record.amount,
      record.budget_type,
      record.group_id,
      record.category_id,
    );
  };

  const updateBudget = async (id: number, record: BudgetInsert) => {
    return await db.runAsync(
      `
            UPDATE Budgets SET amount = ?, budget_type = ?, group_id = ?, category_id = ?
            WHERE id_budget = ?`,
      record.amount,
      record.budget_type,
      record.group_id,
      record.category_id,
      id
    );
  };

  const deleteBudget = async (id: number) => {
    return await db.runAsync("DELETE FROM Budgets WHERE id_budget = ?", id);
  };
  const deleteBudgetByGroup = async (id: number) => {
    return await db.runAsync("DELETE FROM Budgets WHERE group_id = ?", id);
  };

  const getAllResume = async (group_id: number): Promise<ResumeTotalsBudget> => {

    const expensesTotal = await fetchTotalExpenses(group_id);
    const incomesTotal = await fetchTotalIncomes(group_id);
    const transferTotal = await fetchTotalTransfers(group_id);


    return {
      expensesTotal,
      incomesTotal,
      transferTotal,
      balance: ((incomesTotal || 0) - (expensesTotal || 0)),
    };
  };

  return {
    fetchTotalExpenses,
    fetchTotalIncomes,
    fetchTotalTransfers,
    addBudget,
    deleteBudget,
    fetchBudget,
    updateBudget,
    getAllResume,
  };
};
