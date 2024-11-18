import { type SQLiteDatabase } from 'expo-sqlite';

async function createBudgetsTable(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = 'wal';

   CREATE TABLE IF NOT EXISTS Budgets (
      id_budget INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      budget_type TEXT NOT NULL CHECK(budget_type IN ('income', 'expense', 'transfer')),
      group_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      FOREIGN KEY (group_id) REFERENCES Groups(id),
      FOREIGN KEY (category_id) REFERENCES Categories(id)
    );

  `);
}

export default createBudgetsTable;
