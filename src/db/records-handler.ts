import { useSQLiteContext } from "expo-sqlite";
import {
  RecordI,
  CreateRecordRequest,
  Group,
  Category,
  PaymentMethod,
} from "@/src/interfaces";
import { getToday } from "../utils";

export interface ResumeTotals {
  incomeCredit: number | null;
  incomeDebit: number | null;
  expenseCredit: number | null;
  expenseDebit: number | null;
  transferTotal: number | null;
  categoryTotals:
    | {
        category_name: string;
        totalIncome: number;
        totalExpense: number;
        totalTransfer: number;
        category_id: number;
      }[]
    | null;
  paymentMethodTotals:
    | {
        method_name: string;
        totalIncome: number;
        totalExpense: number;
        totalTransfer: number;
        type: string;
      }[]
    | null;
  expensesTotal: number | null;
  incomesTotal: number | null;
  balance: number;
  totalWithoutDebts: number;
  todayTotal: TodayTotals | null;
  transferDebit: number | null;
  transferCredit: number | null;
}

export interface ResumeByCreditCards {
  creditCardName: string;
  closingDate: number;
  current: number;
  previous: number;
}

interface TodayTotals {
  totalIncomeToday: number;
  totalExpenseToday: number;
}

export const useRecords = () => {
  const db = useSQLiteContext();

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchTotalForToday = async (
    group_id: number | undefined
  ): Promise<TodayTotals | null> => {
    if (!group_id) return null;
    const currentDate = getToday().toISOString().split("T")[0];

    try {
      const result = (await db.getAllAsync(
        `
        SELECT 
          SUM(CASE WHEN record_type = 'income' THEN amount ELSE 0 END) as totalIncomeToday, 
          SUM(CASE WHEN record_type = 'expense' THEN amount ELSE 0 END) as totalExpenseToday
        FROM Records
        WHERE group_id = ? AND date = ?
      `,
        [group_id, currentDate]
      )) as TodayTotals[];

      return {
        totalIncomeToday: result[0]?.totalIncomeToday ?? 0,
        totalExpenseToday: result[0]?.totalExpenseToday ?? 0,
      };
    } catch (error) {
      console.error("Error fetching totals for today:", error);
      return null;
    }
  };

  const fetchRecords = async (group_id: number | undefined) => {
    if (!group_id) return;
    return (await db.getAllAsync(
      `
        SELECT 
          Records.id AS record_id, 
          Records.*, 
          Groups.*, 
          Categories.*, 
          PaymentMethods.*
        FROM Records
        JOIN Groups ON Records.group_id = Groups.id
        JOIN Categories ON Records.category_id = Categories.id
        JOIN PaymentMethods ON Records.payment_method_id = PaymentMethods.id
        WHERE Records.group_id = ?
        ORDER BY date ASC
      `,
      [group_id]
    )) as RecordI[];
  };

  const fetchTotalExpenses = async (
    group_id: number | undefined
  ): Promise<number | null> => {
    if (!group_id) return null;
    try {
      const result = await db.getAllAsync(
        `
            SELECT SUM(amount) as totalExpense 
            FROM Records
            WHERE group_id = ? AND record_type = 'expense'
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
          FROM Records
          WHERE group_id = ? AND record_type = 'income'
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
          FROM Records
          WHERE group_id = ? AND record_type = 'transfer'
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

  const fetchTotalExpensesByPaymentType = async (
    group_id: number | undefined,
    payment_type: "credit" | "debit"
  ): Promise<number | null> => {
    if (!group_id) return null;
    try {
      const result = await db.getAllAsync(
        `
          SELECT SUM(amount) as totalExpense 
          FROM Records
          JOIN PaymentMethods ON Records.payment_method_id = PaymentMethods.id
          WHERE group_id = ? 
          AND record_type = 'expense' 
          AND PaymentMethods.payment_type = ?
        `,
        [group_id, payment_type]
      );
      //@ts-ignore
      return result[0]?.totalExpense ?? 0; // Si no hay resultado, devuelve 0
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const fetchTotalTrasnfersByPaymentType = async (
    group_id: number | undefined,
    payment_type: "credit" | "debit"
  ): Promise<number | null> => {
    if (!group_id) return null;
    try {
      const result = await db.getAllAsync(
        `
          SELECT SUM(amount) as totalTransfer 
          FROM Records
          JOIN PaymentMethods ON Records.payment_method_id = PaymentMethods.id
          WHERE group_id = ? 
          AND record_type = 'transfer' 
          AND PaymentMethods.payment_type = ?
        `,
        [group_id, payment_type]
      );
      //@ts-ignore
      return result[0]?.totalTransfer ?? 0; // Si no hay resultado, devuelve 0
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const fetchTotalIncomesByPaymentType = async (
    group_id: number | undefined,
    payment_type: "credit" | "debit"
  ): Promise<number | null> => {
    if (!group_id) return null;
    try {
      const result = await db.getAllAsync(
        `
          SELECT SUM(amount) as totalIncome 
          FROM Records
          JOIN PaymentMethods ON Records.payment_method_id = PaymentMethods.id
          WHERE group_id = ? 
          AND record_type = 'income' 
          AND PaymentMethods.payment_type = ?
        `,
        [group_id, payment_type]
      );
      //@ts-ignore
      return result[0]?.totalIncome ?? 0; // Si no hay resultado, devuelve 0
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const fetchTotalByCategoryWithIncomeExpense = async (
    group_id: number | undefined
  ): Promise<
    | {
        category_name: string;
        totalIncome: number;
        totalExpense: number;
        totalTransfer: number;
        category_id: number;
      }[]
    | null
  > => {
    if (!group_id) return null;
    try {
      const result = await db.getAllAsync(
        `
          SELECT 
            Categories.category_name, 
            SUM(CASE WHEN Records.record_type = 'income' THEN Records.amount ELSE 0 END) as totalIncome, 
            SUM(CASE WHEN Records.record_type = 'expense' THEN Records.amount ELSE 0 END) as totalExpense,
            SUM(CASE WHEN Records.record_type = 'transfer' THEN Records.amount ELSE 0 END) as totalTransfer,
            Records.category_id
          FROM Records
          JOIN Categories ON Records.category_id = Categories.id
          WHERE group_id = ?
          GROUP BY Records.category_id
        `,
        [group_id]
      );
      //@ts-ignore
      return result.map((row: any) => ({
        category_name: row.category_name,
        totalIncome: row.totalIncome ?? 0,
        totalExpense: row.totalExpense ?? 0,
        totalTransfer: row.totalTransfer ?? 0,
        category_id: row.category_id,
      }));
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const fetchTotalByPaymentMethod = async (
    group_id: number | undefined
  ): Promise<
    | {
        method_name: string;
        totalIncome: number;
        totalExpense: number;
        totalTransfer: number;
        type: string;
      }[]
    | null
  > => {
    if (!group_id) return null;
    try {
      const result = await db.getAllAsync(
        `
        SELECT 
          PaymentMethods.method_name, 
          PaymentMethods.payment_type,
          SUM(CASE WHEN Records.record_type = 'income' THEN Records.amount ELSE 0 END) as totalIncome,
          SUM(CASE WHEN Records.record_type = 'expense' THEN Records.amount ELSE 0 END) as totalExpense,
          SUM(CASE WHEN Records.record_type = 'transfer' THEN Records.amount ELSE 0 END) as totalTransfer
        FROM Records
        JOIN PaymentMethods ON Records.payment_method_id = PaymentMethods.id
        WHERE Records.group_id = ?
        GROUP BY PaymentMethods.method_name
        `,
        [group_id]
      );

      // Formatear los resultados para asegurarnos de que la estructura sea la esperada
      return result.map((row: any) => ({
        method_name: row.method_name,
        totalIncome: row.totalIncome ?? 0,
        totalExpense: row.totalExpense ?? 0,
        totalTransfer: row.totalTransfer ?? 0,
        type: row.payment_type ?? "debit",
      }));
    } catch (error) {
      console.error("Error fetching totals by payment method:", error);
      return null;
    }
  };

  const addRecord = async (record: CreateRecordRequest) => {
    return await db.runAsync(
      `
            INSERT INTO Records (amount, record_type, group_id, category_id, payment_method_id, date, record_name) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      record.amount,
      record.record_type,
      record.group_id,
      record.category_id,
      record.payment_method_id,
      record.date,
      record.record_name
    );
  };

  const updateRecord = async (id: number, record: CreateRecordRequest) => {
    return await db.runAsync(
      `
            UPDATE Records SET amount = ?, record_type = ?, group_id = ?, category_id = ?, payment_method_id = ?, date = ?, record_name = ?
            WHERE id = ?`,
      record.amount,
      record.record_type,
      record.group_id,
      record.category_id,
      record.payment_method_id,
      record.date,
      record.record_name,
      id
    );
  };

  const deleteRecord = async (id: number) => {
    return await db.runAsync("DELETE FROM Records WHERE id = ?", id);
  };
  const deleteRecordByGroup = async (id: number) => {
    return await db.runAsync("DELETE FROM Records WHERE group_id = ?", id);
  };

  const getAllResume = async (group_id: number) => {
    const incomeCredit = await fetchTotalIncomesByPaymentType(
      group_id,
      "credit"
    );
    const incomeDebit = await fetchTotalIncomesByPaymentType(group_id, "debit");
    const expenseCredit = await fetchTotalExpensesByPaymentType(
      group_id,
      "credit"
    );
    const expenseDebit = await fetchTotalExpensesByPaymentType(
      group_id,
      "debit"
    );
    const categoryTotals = await fetchTotalByCategoryWithIncomeExpense(
      group_id
    );
    const transferCredit = await fetchTotalTrasnfersByPaymentType(
      group_id,
      "credit"
    );
    const transferDebit = await fetchTotalTrasnfersByPaymentType(
      group_id,
      "debit"
    );

    const paymentMethodTotals = await fetchTotalByPaymentMethod(group_id);
    const expensesTotal = await fetchTotalExpenses(group_id);
    const incomesTotal = await fetchTotalIncomes(group_id);
    const transferTotal = await fetchTotalTransfers(group_id);

    const todayTotal = await fetchTotalForToday(group_id);

    return {
      incomeCredit,
      incomeDebit,
      expenseCredit,
      expenseDebit,
      categoryTotals,
      paymentMethodTotals,
      expensesTotal,
      incomesTotal,
      transferTotal,
      transferCredit,
      transferDebit,
      balance: (incomesTotal || 0) - (expensesTotal || 0),
      totalWithoutDebts:
        (incomesTotal || 0) - ((expensesTotal || 0) - (expenseCredit || 0)),
      todayTotal,
    };
  };

  const fetchResumeByCreditCards = async (): Promise<ResumeByCreditCards[]> => {
    try {
      const creditCards = await db.getAllAsync<PaymentMethod>(
        `
        SELECT *
        FROM PaymentMethods
        WHERE payment_type = 'credit' 
        `
      );

      if (!creditCards || creditCards.length === 0) return [];

      let today = getToday()
      const currentMonth = today.getMonth() + 1; // Mes actual (1-12)
      const currentYear = today.getFullYear();

      const getPeriods = (card: PaymentMethod, month: number, year: number) => {
        const periodStart = new Date(
          year,
          month - 1,
          Number(card.closing_date + 1)
        )
          .toISOString()
          .split("T")[0]; // Día siguiente al cierre
        const periodEnd = new Date(year, month, Number(card.closing_date))
          .toISOString()
          .split("T")[0]; // Día del cierre en el mes siguiente
        return [periodStart, periodEnd];
      };

      const results = await Promise.all(
        creditCards?.map(async (card) => {
          if (card?.closing_date) {
            // Calcular las fechas de inicio y fin para los períodos actual y anterior
            const [currentPeriodStart, currentPeriodEnd] = getPeriods(
              card,
              currentMonth,
              currentYear
            );
            const [previousPeriodStart, previousPeriodEnd] = getPeriods(
              card,
              currentMonth === 1 ? 12 : currentMonth - 1,
              currentMonth === 1 ? currentYear - 1 : currentYear
            );
            const currentResult = await db.getAllAsync(
              `
            SELECT
              SUM(CASE WHEN record_type = 'expense' THEN amount ELSE 0 END) +
              SUM(CASE WHEN record_type = 'transfer' THEN amount ELSE 0 END) AS total
            FROM Records
            WHERE payment_method_id = ? AND date BETWEEN ? AND ?
            `,
              [card.id, currentPeriodStart, currentPeriodEnd]
            );

            // Consultar las sumas para el período anterior
            const previousResult = await db.getAllAsync(
              `
            SELECT
              SUM(CASE WHEN record_type = 'expense' THEN amount ELSE 0 END) +
              SUM(CASE WHEN record_type = 'transfer' THEN amount ELSE 0 END) AS total
            FROM Records
            WHERE payment_method_id = ? AND date BETWEEN ? AND ?
            `,
              [card.id, previousPeriodStart, previousPeriodEnd]
            );

            return {
              creditCardName: card.method_name,
              closingDate: card.closing_date,
              //@ts-ignore
              current: currentResult[0]?.total || 0,
              //@ts-ignore
              previous: previousResult[0]?.total || 0,
            };
          }
        })
      );

      //@ts-ignore
      return results;
    } catch (error) {
      console.error("Error fetching resume by credit cards:", error);
      return [];
    }
  };

  return {
    fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    deleteRecordByGroup,
    fetchTotalExpenses,
    fetchTotalIncomes,
    fetchTotalExpensesByPaymentType,
    fetchTotalIncomesByPaymentType,
    fetchTotalByCategoryWithIncomeExpense,
    fetchTotalByPaymentMethod,
    fetchTotalTransfers,
    fetchTotalTrasnfersByPaymentType,
    getAllResume,
    fetchResumeByCreditCards,
  };
};
