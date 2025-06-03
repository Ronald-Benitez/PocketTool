import { type SQLiteDatabase } from 'expo-sqlite';

async function alterRecordTypeDeleteCheck(db: SQLiteDatabase) {
  
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS RecordTypes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type_name TEXT NOT NULL UNIQUE
      );
    `);

    await db.execAsync(`
      INSERT OR IGNORE INTO RecordTypes (type_name) VALUES ('income');
      INSERT OR IGNORE INTO RecordTypes (type_name) VALUES ('expense');
      INSERT OR IGNORE INTO RecordTypes (type_name) VALUES ('transfer');
    `);

    await db.execAsync(`ALTER TABLE Records RENAME TO OldRecords;`);

    await db.execAsync(`
      CREATE TABLE Records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        record_type_id INTEGER NOT NULL,
        group_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        payment_method_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        record_name TEXT NOT NULL,
        FOREIGN KEY (record_type_id) REFERENCES RecordTypes(id),
        FOREIGN KEY (group_id) REFERENCES Groups(id),
        FOREIGN KEY (category_id) REFERENCES Categories(id),
        FOREIGN KEY (payment_method_id) REFERENCES PaymentMethods(id)
      );
    `);

    await db.execAsync(`
      INSERT INTO Records (id, amount, record_type_id, group_id, category_id, payment_method_id, date, record_name)
      SELECT
        ORec.id,
        ORec.amount,
        RT.id AS record_type_id,
        ORec.group_id,
        ORec.category_id,
        ORec.payment_method_id,
        ORec.date,
        ORec.record_name
      FROM OldRecords AS ORec
      JOIN RecordTypes AS RT ON ORec.record_type = RT.type_name;
    `);

    await db.execAsync(`DROP TABLE OldRecords;`);

  
}

export default alterRecordTypeDeleteCheck;