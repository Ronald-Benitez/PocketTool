import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA, type TableName } from '@/src/db/schema';

const REQUIRED_IMPORT_TABLES: TableName[] = [
  'Groups',
  'PaymentMethods',
  'PaymentTypes',
  'Categories',
  'RecordTypes',
  'Records',
];

const escapeSqlValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (value instanceof Uint8Array) {
    return `X'${Array.from(value).map((byte) => byte.toString(16).padStart(2, '0')).join('')}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
};

export const buildSqlDump = async (db: SQLiteDatabase): Promise<string> => {
  let sqlDump = '';

  const tables = await db.getAllAsync<{ name: string; sql: string }>(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'expo_%';"
  );

  for (const table of tables) {
    if (!table.sql) continue;

    sqlDump += `-- Tabla: ${table.name}\n`;
    sqlDump += `${table.sql};\n`;

    const rows = await db.getAllAsync<Record<string, unknown>>(`SELECT * FROM "${table.name}";`);

    for (const row of rows) {
      const columns = Object.keys(row).map((column) => `"${column}"`).join(', ');
      const values = Object.values(row).map(escapeSqlValue).join(', ');
      sqlDump += `INSERT INTO "${table.name}" (${columns}) VALUES (${values});\n`;
    }

    sqlDump += '\n';
  }

  return sqlDump;
};

const hasCreateTable = (sql: string, tableName: string): boolean => {
  const pattern = new RegExp(
    `create\\s+table\\s+(if\\s+not\\s+exists\\s+)?["'\\[]?(main\\.)?${tableName}["'\\]]?`,
    'i'
  );
  return pattern.test(sql);
};

export const validateSqlDump = (sqlContent: string) => {
  if (!sqlContent.trim()) {
    throw new Error('El archivo está vacío');
  }

  const missing = REQUIRED_IMPORT_TABLES.filter((tableName) => {
    const logicalName = tableName;
    const physicalName = APP_SCHEMA[tableName].sqlName;
    return !hasCreateTable(sqlContent, logicalName) && !hasCreateTable(sqlContent, physicalName);
  });

  if (missing.length > 0) {
    throw new Error(`El backup no contiene las tablas requeridas: ${missing.join(', ')}`);
  }
};
