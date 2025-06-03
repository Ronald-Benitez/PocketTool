import { type SQLiteDatabase } from 'expo-sqlite';
import createTables from './migrations/CreateTablesBase';
import insertDefault from './migrations/InsertDefaults';
import alterRecordTypeDeleteCheck from './migrations/alterRecordTypeDeleteCheck'
import createSavingsTable from './migrations/CreateSavingsTable';
import createBudgetsTable from './migrations/CreateTableBudgets';

export interface Migration {
  id: number;
  migration_name: string;
  applied_at: string;
}


async function migrateDb(db: SQLiteDatabase) {
  const DATABASE_VERSION = 2;

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');

  const currentDbVersion = result ? result.user_version : 0;

  // await db.execAsync(`
  //   DROP TABLE IF EXISTS Records;
  //   DROP TABLE IF EXISTS Groups;
  //   DROP TABLE IF EXISTS PaymentMethods;
  //   DROP TABLE IF EXISTS Categories;
  //   DROP TABLE IF EXISTS Migrations;
  //   DROP TABLE IF EXISTS Savings;
  //   DROP TABLE IF EXISTS SavingsHistory;
  //   DROP TABLE IF EXISTS Budgets;
  // `);

  // if (currentDbVersion === 0) {

  await db.execAsync(`
    PRAGMA journal_mode = 'wal';

    CREATE TABLE IF NOT EXISTS Migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      migration_name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const migrations = await db.getAllAsync('SELECT * FROM Migrations') as Migration[]
  try{
    if(!migrations.find(val => val.migration_name == "base")){
      await createTables(db)
      await db.runAsync('INSERT INTO Migrations (migration_name) VALUES (?)', 'base');
    }

    if(!migrations.find(val => val.migration_name == "alterRecordTypeDeleteCheck")){
      await alterRecordTypeDeleteCheck(db)
      await db.runAsync('INSERT INTO Migrations (migration_name) VALUES (?)', 'alterRecordTypeDeleteCheck');
    }

    if(!migrations.find(val => val.migration_name == "createSavingsTables")){
      await createSavingsTable(db)
      await db.runAsync('INSERT INTO Migrations (migration_name) VALUES (?)', 'createSavingsTables');
    }

    if(!migrations.find(val => val.migration_name == "createBudgetsTable")){
      await createBudgetsTable(db)
      await db.runAsync('INSERT INTO Migrations (migration_name) VALUES (?)', 'createBudgetsTable');
    }

  }catch(e){
    console.log(e)
  }

  // await db.runAsync('INSERT INTO Migrations (migration_name) VALUES (?)', 'Prueba');

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  await insertDefault(db)
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export default migrateDb;
