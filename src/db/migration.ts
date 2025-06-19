import { type SQLiteDatabase } from 'expo-sqlite';
import { APP_SCHEMA } from './schema';
import { Migrations } from './types/tables';
import { migrations } from './migrations';

async function migrateDb(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');

  const currentDbVersion = result ? result.user_version : 0;
  // await down(db);
  await up(db)
  await runMigrations(db)
}

export const up = async (db: SQLiteDatabase) => {
  const tables = Object.keys(APP_SCHEMA)
  for (const table of tables) {
    const data = APP_SCHEMA[table]
    const columnsSql = data.columns.map(col => {
      let def = `${col.name} ${col.type}`;
      if (col.primaryKey) def += ' PRIMARY KEY';
      if (col.autoIncrement) def += ' AUTOINCREMENT'; // Only for INTEGER PRIMARY KEY
      if (col.notNull) def += ' NOT NULL';
      if (col.unique) def += ' UNIQUE';
      if (col.defaultValue !== undefined) {
        if (typeof col.defaultValue === 'string') def += ` DEFAULT '${col.defaultValue}'`;
        else def += ` DEFAULT ${col.defaultValue}`;
      }
      if (col.references) {
        def += ` REFERENCES ${col.references.table}(${col.references.column})`;
      }
      return def;
    }).join(', ');
    const createTableSql = `CREATE TABLE IF NOT EXISTS ${data.name} (${columnsSql});`;
    await db.execAsync(createTableSql);
    console.log(`Table '${data.name}' created or already exists.`);
  }
};

export const down = async (db: SQLiteDatabase) => {
  const tables = Object.keys(APP_SCHEMA)
  for (const table of tables) {
    await db.execAsync(`DROP TABLE IF EXISTS ${APP_SCHEMA[table].name};`);
  }
};

export const runMigrations = async (db: SQLiteDatabase) => {
  const migrationsList = await db.getAllAsync<Migrations>('SELECT * FROM Migrations');
  const names = Object.keys(migrations);
  for (const name of names) {
    if (!migrationsList.find(m => m.migration_name === name)) {
      try {
        await migrations[name as keyof typeof migrations](db);
        await db.runAsync('INSERT INTO Migrations (migration_name, applied_at) VALUES (?, ?)', name, new Date().getTime());
        console.log(`Migration '${name}' applied successfully.`);
      } catch (error) {
        console.error(`Error applying migration '${name}':`, error);
      }
    } else {
      console.log(`Migration '${name}' already applied.`);
    }
  }
  
}

export default migrateDb;
