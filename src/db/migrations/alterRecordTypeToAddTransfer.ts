import { SQLiteDatabase } from 'expo-sqlite';

async function alterRecordTypeToAddTransfer(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = 'wal';

    -- 1. Crear una tabla temporal con el nuevo CHECK en record_type
    CREATE TABLE IF NOT EXISTS Records_temp (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      record_type TEXT NOT NULL CHECK(record_type IN ('income', 'expense', 'transfer')),
      group_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      payment_method_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      record_name TEXT NOT NULL,
      FOREIGN KEY (group_id) REFERENCES Groups(id),
      FOREIGN KEY (category_id) REFERENCES Categories(id),
      FOREIGN KEY (payment_method_id) REFERENCES PaymentMethods(id)
    );

    -- 2. Copiar datos de la tabla original a la tabla temporal
    INSERT INTO Records_temp (id, amount, record_type, group_id, category_id, payment_method_id, date, record_name)
    SELECT id, amount, record_type, group_id, category_id, payment_method_id, date, record_name
    FROM Records;

    -- 3. Eliminar la tabla original
    DROP TABLE IF EXISTS Records;

    -- 4. Renombrar la tabla temporal para que reemplace a la original
    ALTER TABLE Records_temp RENAME TO Records;
  `);
}

export default alterRecordTypeToAddTransfer;
