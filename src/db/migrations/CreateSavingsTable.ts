import { type SQLiteDatabase } from 'expo-sqlite';

async function createSavingsTables(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = 'wal';

    -- Crear la tabla Savings
    CREATE TABLE IF NOT EXISTS Savings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      saving_name TEXT NOT NULL,
      amount REAL NOT NULL
    );

    -- Crear la tabla SavingsHistory para registrar los cambios en Savings
    CREATE TABLE IF NOT EXISTS SavingsHistory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      saving_id INTEGER NOT NULL,
      previous_amount REAL,
      new_amount REAL NOT NULL,
      change_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (saving_id) REFERENCES Savings(id)
    );

    -- Crear trigger para registrar en SavingsHistory al insertar un nuevo registro en Savings
    CREATE TRIGGER IF NOT EXISTS insert_savings_history
    AFTER INSERT ON Savings
    FOR EACH ROW
    BEGIN
      INSERT INTO SavingsHistory (saving_id, previous_amount, new_amount)
      VALUES (NEW.id, 0, NEW.amount); -- previous_amount es NULL en una inserción inicial
    END;

    -- Crear trigger para actualizar SavingsHistory cuando se cambie el monto en Savings
    CREATE TRIGGER IF NOT EXISTS update_savings_history
    AFTER UPDATE OF amount ON Savings
    FOR EACH ROW
    BEGIN
      INSERT INTO SavingsHistory (saving_id, previous_amount, new_amount)
      VALUES (OLD.id, OLD.amount, NEW.amount);
    END;
  `);
}

export default createSavingsTables;
