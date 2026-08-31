import { type SQLiteDatabase } from 'expo-sqlite';

const TABLES = [
  'Groups',
  'PaymentTypes',
  'PaymentMethods',
  'Categories',
  'RecordTypes',
  'Fixed',
  'Records',
  'PaidCredits',
  'BudgetTemplates',
  'BudgetTemplateItems',
  'Budgets',
  'Savings',
  'SavingsHistory',
];

async function AlterAllTablesAddDeletedAt(db: SQLiteDatabase): Promise<void> {
  for (const table of TABLES) {
    try {
      await db.runAsync(`ALTER TABLE ${table} ADD COLUMN deleted_at DATETIME DEFAULT NULL;`);
    } catch (e) {
      console.log(`Error al modificar la tabla ${table}:`, e);
    }
  }
}

export default AlterAllTablesAddDeletedAt;