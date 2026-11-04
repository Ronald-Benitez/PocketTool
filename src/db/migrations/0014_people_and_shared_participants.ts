import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { createTableSql } from '../schema/sql';

const up = async (db: SQLiteDatabase) => {
  await db.execAsync(createTableSql(APP_SCHEMA.People));
  await db.execAsync(createTableSql(APP_SCHEMA.SharedExpenseParticipants));

  const financings = await db.getAllAsync<{
    id: number;
    shared_percent: number | null;
    shared_counterparty: string | null;
  }>(
    `SELECT id, shared_percent, shared_counterparty
     FROM ${APP_SCHEMA.Financings.sqlName}
     WHERE is_shared = 1 AND shared_percent IS NOT NULL AND deleted_at IS NULL`
  );

  for (const financing of financings) {
    if (financing.shared_percent == null) continue;
    const existing = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM ${APP_SCHEMA.SharedExpenseParticipants.sqlName}
       WHERE owner_type = 'financing' AND owner_id = ? AND deleted_at IS NULL`,
      [financing.id]
    );
    if (existing) continue;

    const name = financing.shared_counterparty?.trim() || 'Shared';
    let person = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM ${APP_SCHEMA.People.sqlName}
       WHERE name = ? COLLATE NOCASE AND deleted_at IS NULL`,
      [name]
    );
    let personId = person?.id;
    if (personId == null) {
      const result = await db.runAsync(
        `INSERT INTO ${APP_SCHEMA.People.sqlName} (name) VALUES (?)`,
        [name]
      );
      personId = result.lastInsertRowId;
    }

    await db.runAsync(
      `INSERT INTO ${APP_SCHEMA.SharedExpenseParticipants.sqlName}
       (owner_type, owner_id, person_id, share_percent)
       VALUES ('financing', ?, ?, ?)`,
      [financing.id, personId, financing.shared_percent]
    );
  }
};

export default {
  version: 14,
  name: '0014_people_and_shared_participants',
  up,
};
