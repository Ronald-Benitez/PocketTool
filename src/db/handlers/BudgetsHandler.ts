import { useSQLiteContext } from "expo-sqlite";
import { BudgetItemJoined, BudgetJoined } from "../types/tables";
import { useHandler } from "./handler";

export const useBudgets = (table: "BudgetTemplateItems" | "Budgets") => {
  const db = useSQLiteContext();
  const handler = useHandler(table)
  const fetchBudgetTemplateItems = async (template_id: number | undefined): Promise<BudgetItemJoined[] | undefined> => {
    if (!template_id) return;
    return (await db.getAllAsync(
      `
            SELECT 
              BudgetTemplateItems.id AS budget_template_item_id, 
              Categories.id AS category_id,
              RecordTypes.id AS record_type_id,
              BudgetTemplateItems.*,
              Categories.*,
              RecordTypes.*,
            FROM BudgetTemplateItems
            JOIN Categories ON BudgetTemplateItems.category_id = Categories.id
            JOIN RecordTypes ON BudgetTemplateItems.record_type_id = RecordTypes.id
            WHERE BudgetTemplateItems.budget_template_id = ?
            ORDER BY date ASC
          `,
      [template_id]
    )) as BudgetItemJoined[];
  };
  const fetchBudgetItems = async (group_id: number | undefined): Promise<BudgetItemJoined[] | undefined> => {
    if (!group_id) return;
    return (await db.getAllAsync(
      `
            SELECT 
              Budgets.id AS budget_template_item_id, 
              Categories.id AS category_id,
              RecordTypes.id AS record_type_id,
              Budgets.*,
              Categories.*,
              RecordTypes.*,
            FROM Budgets
            JOIN Categories ON Budgets.category_id = Categories.id
            JOIN RecordTypes ON Budgets.record_type_id = RecordTypes.id
            WHERE Budgets.group_id = ?
            ORDER BY date ASC
          `,
      [group_id]
    )) as BudgetItemJoined[];
  };
  return {
    fetchBudgetTemplateItems,
    fetchBudgetItems,
    handler
  };
};
