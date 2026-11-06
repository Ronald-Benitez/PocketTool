export type ColumnType = 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB';
export type ColumnKind = 'money' | 'timestamp' | 'boolean';

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  kind?: ColumnKind;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  notNull?: boolean;
  unique?: boolean;
  defaultValue?: string | number | null;
  references?: {
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  };
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  unique?: boolean;
  where?: string;
}

export interface TableDefinition {
  name: string;
  sqlName: string;
  entity: string;
  columns: ColumnDefinition[];
  indexes?: IndexDefinition[];
}

export type TableSchema = {
  [tableName: string]: TableDefinition;
};
