import { useSQLiteContext } from "expo-sqlite";
import { SavingsHistory } from "@/src/interfaces";

export const useSavingsHistory = () => {
  const db = useSQLiteContext();

  // Obtener el historial de cambios de SavingsHistory por saving_id con límite de 5
  const fetchSavingsHistoryBySavingId = async (savingId: number): Promise<SavingsHistory[]> => {
    try {
      const result = (await db.getAllAsync(
        `
        SELECT * FROM SavingsHistory 
        WHERE saving_id = ? 
        ORDER BY change_date DESC 
        LIMIT 5
        `,
        savingId
      )) as SavingsHistory[];
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const deleteSavingsHistory = async (id: number) => {
    try {
      await db.runAsync("DELETE FROM SavingsHistory WHERE saving_id = ?", id);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    fetchSavingsHistoryBySavingId,
    deleteSavingsHistory
  };
};
