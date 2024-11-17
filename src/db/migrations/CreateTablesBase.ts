import { type SQLiteDatabase } from 'expo-sqlite';

async function createTables(db: SQLiteDatabase) {

//   await db.execAsync(`
//     DROP TABLE IF EXISTS Records;
//     DROP TABLE IF EXISTS Groups;
//     DROP TABLE IF EXISTS PaymentMethods;
//     DROP TABLE IF EXISTS Categories;
//   `);

  await db.execAsync(`
    PRAGMA journal_mode = 'wal';
    
    CREATE TABLE IF NOT EXISTS Groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_name TEXT NOT NULL,
      goal REAL NOT NULL,
      total_income REAL DEFAULT 0,
      total_expense REAL DEFAULT 0,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS PaymentMethods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      method_name TEXT NOT NULL UNIQUE,
      payment_type TEXT NOT NULL CHECK(payment_type IN ('credit', 'debit'))
    );
    
    CREATE TABLE IF NOT EXISTS Categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT NOT NULL UNIQUE
    );
    
    CREATE TABLE IF NOT EXISTS Records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      record_type TEXT NOT NULL CHECK(record_type IN ('income', 'expense')),
      group_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      payment_method_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      record_name TEXT NOT NULL,
      FOREIGN KEY (group_id) REFERENCES Groups(id),
      FOREIGN KEY (category_id) REFERENCES Categories(id),
      FOREIGN KEY (payment_method_id) REFERENCES PaymentMethods(id)
    );
  `);
}

export default createTables;
