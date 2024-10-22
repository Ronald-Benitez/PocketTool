import { type SQLiteDatabase } from 'expo-sqlite';

// Asume que `db` es tu instancia de SQLiteDatabase.
async function migrateDb(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  
  // Obtener la versión actual de la base de datos
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');

  // Manejar el caso en que result sea null
  const currentDbVersion = result ? result.user_version : 0;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }
  // if (currentDbVersion === 0) {

  await db.execAsync(`
    DROP TABLE IF EXISTS Records;
    DROP TABLE IF EXISTS Groups;
    DROP TABLE IF EXISTS PaymentMethods;
    DROP TABLE IF EXISTS Categories;
  `);

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

  // Insertar valores predeterminados en PaymentMethods y Categories
  await db.runAsync('INSERT INTO PaymentMethods (method_name, payment_type) VALUES (?, ?)', 'Método de Pago Predeterminado', 'credit');
  await db.runAsync('INSERT INTO PaymentMethods (method_name, payment_type) VALUES (?, ?)', 'Método de Pago en Efectivo', 'debit');
  await db.runAsync('INSERT INTO Categories (category_name) VALUES (?)', 'Categoría Predeterminada');

  // Obtener los ID de los valores insertados
  const paymentMethodIdCredit = 1; // Método de pago crédito
  const paymentMethodIdDebit = 2; // Método de pago débito
  const categoryId = 1; // Categoría predeterminada

  // Insertar un grupo predeterminado
  await db.runAsync('INSERT INTO Groups (group_name, goal, year, month) VALUES (?, ?, ?, ?)', 'Grupo Predeterminado', 1000, 2024, 1);

  // Obtener el ID del grupo insertado
  const groupId = 1; // Grupo predeterminado

  // Insertar registros predeterminados usando los valores de ID
  await db.runAsync(`
    INSERT INTO Records (amount, record_type, group_id, category_id, payment_method_id, date, record_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [100.0, 'income', groupId, categoryId, paymentMethodIdCredit, '2024-01-01', 'base1']);

  await db.runAsync(`
    INSERT INTO Records (amount, record_type, group_id, category_id, payment_method_id, date, record_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [50.0, 'expense', groupId, categoryId, paymentMethodIdDebit, '2024-01-02','base2']);
  
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
//   // Actualizar la versión de la base de datos
// }

export default migrateDb;
