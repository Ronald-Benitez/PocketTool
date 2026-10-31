import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import relations from '../db/schema/generated/relations.json';
import { APP_SCHEMA, type TableName } from '../db/schema';
import { withExclusiveTransaction } from '../db/transaction';
import {
  InvalidDataError,
  InvalidIdentifierError,
  QueryError,
} from './errors';
import type {
  Group,
  PaymentType,
  PaymentMethod,
  PaymentMethodWithRelations,
  Category,
  RecordType,
  FixedRecord,
  FixedRecordWithRelations,
  RecordEntry,
  RecordWithRelations,
  PaidCredit,
  PaidCreditWithRelations,
  BudgetTemplate,
  BudgetTemplateWithRelations,
  BudgetTemplateItem,
  BudgetTemplateItemWithRelations,
  BudgetPlan,
  BudgetPlanWithRelations,
  BudgetLine,
  BudgetLineWithRelations,
  Saving,
  SavingsHistoryEntry,
  SavingsHistoryWithRelations,
  Migration,
  Vehicle,
  VehicleExpenseLink,
  VehicleFuelEntry,
  VehicleFuelEntryWithRelations,
  VehicleMaintenanceEntry,
  VehicleMaintenanceEntryWithRelations,
  VehicleMaintenanceItem,
  VehicleMaintenanceItemWithRelations,
  VehicleReminder,
  VehicleReminderWithRelations,
  VehicleSetting,
  VehicleSettingWithRelations,
  VehicleExpenseLinkWithRelations,
  Insertable,
  UpdateEntity,
} from '../interfaces/schema';

export type BaseSchemaMap = {
  Groups: Group;
  PaymentTypes: PaymentType;
  PaymentMethods: PaymentMethod;
  Categories: Category;
  RecordTypes: RecordType;
  Fixed: FixedRecord;
  Records: RecordEntry;
  PaidCredits: PaidCredit;
  BudgetTemplates: BudgetTemplate;
  BudgetTemplateItems: BudgetTemplateItem;
  BudgetPlans: BudgetPlan;
  BudgetLines: BudgetLine;
  Savings: Saving;
  SavingsHistory: SavingsHistoryEntry;
  Vehicles: Vehicle;
  VehicleFuelEntries: VehicleFuelEntry;
  VehicleMaintenance: VehicleMaintenanceEntry;
  VehicleMaintenanceItems: VehicleMaintenanceItem;
  VehicleReminders: VehicleReminder;
  VehicleSettings: VehicleSetting;
  VehicleExpenseLinks: VehicleExpenseLink;
  Migrations: Migration;
};

export type TableOption = TableName;

export type RelationsSchemaMap = {
  Groups: Group;
  PaymentTypes: PaymentType;
  PaymentMethods: PaymentMethodWithRelations;
  Categories: Category;
  RecordTypes: RecordType;
  Fixed: FixedRecordWithRelations;
  Records: RecordWithRelations;
  PaidCredits: PaidCreditWithRelations;
  BudgetTemplates: BudgetTemplateWithRelations;
  BudgetTemplateItems: BudgetTemplateItemWithRelations;
  BudgetPlans: BudgetPlanWithRelations;
  BudgetLines: BudgetLineWithRelations;
  Savings: Saving;
  SavingsHistory: SavingsHistoryWithRelations;
  Vehicles: Vehicle;
  VehicleFuelEntries: VehicleFuelEntryWithRelations;
  VehicleMaintenance: VehicleMaintenanceEntryWithRelations;
  VehicleMaintenanceItems: VehicleMaintenanceItemWithRelations;
  VehicleReminders: VehicleReminderWithRelations;
  VehicleSettings: VehicleSettingWithRelations;
  VehicleExpenseLinks: VehicleExpenseLinkWithRelations;
  Migrations: Migration;
};

const RELATION_TREE = relations as Record<string, Record<string, string>>;

type RelationTree = typeof RELATION_TREE;

export type JoinPath<T extends TableOption> = Extract<keyof NonNullable<RelationTree[T]>, string>;
export type ColumnPath<T extends TableOption> = string;
export type AvailableJoins<T extends TableOption> = Partial<Record<JoinPath<T>, JoinPath<T>>>;
export type AvailableColumns<T extends TableOption> = Record<string, string>;

export type SqlOperator =
  | '='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'LIKE'
  | 'IN'
  | 'IS'
  | 'IS NOT'
  | 'BETWEEN';
export type OrderDirection = 'ASC' | 'DESC';
export type SqlValue = string | number | boolean | null | (string | number | boolean | null)[];

export type WhereCondition<T extends TableOption> = {
  column: ColumnPath<T>;
  value: SqlValue;
  operator?: SqlOperator;
};

export type OrderCondition<T extends TableOption> = {
  column: ColumnPath<T>;
  direction?: OrderDirection;
};

const tableOf = (name: string) => {
  const table = APP_SCHEMA[name as TableName];
  if (!table) {
    throw new InvalidIdentifierError(`Unknown table "${name}"`);
  }
  return table;
};

const buildAvailableJoins = <T extends TableOption>(table: T): AvailableJoins<T> => {
  const tableRelations = RELATION_TREE[table] ?? {};
  return Object.fromEntries(
    Object.keys(tableRelations).map((path) => [path, path])
  ) as AvailableJoins<T>;
};

const buildAvailableColumns = <T extends TableOption>(table: T): AvailableColumns<T> => {
  const result: Record<string, string> = {};
  const base = tableOf(table);

  for (const column of base.columns) {
    result[column.name] = column.name;
    result[`${table}.${column.name}`] = `${table}.${column.name}`;
  }

  for (const path of Object.keys(RELATION_TREE[table] ?? {})) {
    const targetName = path.split('.').pop() as TableName;
    const target = tableOf(targetName);
    for (const column of target.columns) {
      const fullPath = `${path}.${column.name}`;
      result[fullPath] = fullPath;
    }
  }

  return result;
};

const resolveColumnReference = (table: string, column: string) => {
  if (column.includes('.')) {
    const parts = column.split('.');
    const alias = parts.slice(0, -1).join('.');
    const field = parts[parts.length - 1];
    return `"${alias}"."${field}"`;
  }

  return `"${table}"."${column}"`;
};

const normalizeOperator = (operator: SqlOperator): string => operator;

export class ORM<T extends TableOption = TableOption> {
  private db: SQLiteDatabase;
  private table: T;
  private joinedTables: string[] = [];
  private joinedColumns: string[] = [];
  private whereClauses: string[] = [];
  private whereValues: SqlValue[] = [];
  private orderClauses: string[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  public availableJoins: AvailableJoins<T>;
  public availableColumns: AvailableColumns<T>;

  constructor(db: SQLiteDatabase, table: T) {
    this.db = db;
    this.table = table;
    this.availableJoins = buildAvailableJoins(table);
    this.availableColumns = buildAvailableColumns(table);
  }

  private clone(): ORM<T> {
    const next = new ORM<T>(this.db, this.table);
    next.joinedTables = [...this.joinedTables];
    next.joinedColumns = [...this.joinedColumns];
    next.whereClauses = [...this.whereClauses];
    next.whereValues = [...this.whereValues];
    next.orderClauses = [...this.orderClauses];
    next.limitValue = this.limitValue;
    next.offsetValue = this.offsetValue;
    return next;
  }

  private ensureJoined(path: string): ORM<T> {
    if (!path) return this;
    if (!Object.prototype.hasOwnProperty.call(this.availableJoins, path)) {
      throw new InvalidIdentifierError(`Table path "${path}" is not a valid join for "${this.table}"`);
    }
    return this.join(path as JoinPath<T>);
  }

  public join<Path extends JoinPath<T>>(tablePath: Path): ORM<T> {
    if (!Object.prototype.hasOwnProperty.call(this.availableJoins, tablePath)) {
      throw new InvalidIdentifierError(`Table path "${tablePath}" is not a valid join for "${this.table}"`);
    }

    const next = this.clone();
    const segments = String(tablePath).split('.');
    let prevAlias = this.table as string;
    let currentPath = '';

    for (const segment of segments) {
      const prevTableName = prevAlias.includes('.') ? prevAlias.split('.').pop()! : prevAlias;
      currentPath = currentPath ? `${currentPath}.${segment}` : segment;

      const prevTable = tableOf(prevTableName);
      const base = prevTable.columns.find((column) => column.references?.table === segment);

      if (!base) break;

      const target = tableOf(segment);
      const softDeleteFilter = target.columns.some((column) => column.name === 'deleted_at')
        ? ` AND "${currentPath}".deleted_at IS NULL`
        : '';

      const joinStr = `LEFT JOIN ${target.sqlName} AS "${currentPath}" ON "${currentPath}"."${base.references!.column}" = "${prevAlias}"."${base.name}"${softDeleteFilter}`;

      if (!next.joinedTables.includes(joinStr)) {
        next.joinedTables.push(joinStr);
      }

      const cols = target.columns
        .map((column) => `"${currentPath}"."${column.name}" AS "${currentPath}.${column.name}"`)
        .join(', ');

      if (cols && !next.joinedColumns.includes(cols)) {
        next.joinedColumns.push(cols);
      }

      prevAlias = currentPath;
    }

    return next;
  }

  public joinMany(paths: JoinPath<T>[]): ORM<T> {
    return paths.reduce<ORM<T>>((query, path) => query.join(path), this);
  }

  public where<Path extends ColumnPath<T>>(column: Path, value: SqlValue, operator?: SqlOperator): ORM<T>;
  public where<Path extends ColumnPath<T>>(filter: WhereCondition<T>): ORM<T>;
  public where<Path extends ColumnPath<T>>(
    columnOrFilter: Path | WhereCondition<T>,
    value?: SqlValue,
    operator: SqlOperator = '='
  ): ORM<T> {
    const condition = typeof columnOrFilter === 'string'
      ? { column: columnOrFilter, value: value ?? null, operator }
      : columnOrFilter;

    if (!Object.prototype.hasOwnProperty.call(this.availableColumns, condition.column)) {
      throw new InvalidIdentifierError(`Column "${condition.column}" is not valid for table "${this.table}"`);
    }

    let query: ORM<T> = this;
    if (condition.column.includes('.')) {
      const prefix = condition.column.split('.').slice(0, -1).join('.');
      if (prefix !== this.table) query = query.ensureJoined(prefix);
    }

    const next = query.clone();
    const columnRef = resolveColumnReference(this.table, condition.column);
    const normalizedOperator = normalizeOperator(condition.operator ?? '=');

    if (normalizedOperator === 'IN') {
      const values = Array.isArray(condition.value) ? condition.value : [condition.value];
      const placeholders = values.map(() => '?').join(', ');
      next.whereClauses.push(`${columnRef} IN (${placeholders})`);
      next.whereValues.push(...values);
      return next;
    }

    if (normalizedOperator === 'BETWEEN') {
      const values = Array.isArray(condition.value) ? condition.value : [condition.value, null];
      next.whereClauses.push(`${columnRef} BETWEEN ? AND ?`);
      next.whereValues.push(values[0], values[1]);
      return next;
    }

    next.whereClauses.push(`${columnRef} ${normalizedOperator} ?`);
    next.whereValues.push(condition.value);
    return next;
  }

  public whereMany(filters: WhereCondition<T>[]): ORM<T> {
    return filters.reduce<ORM<T>>((query, filter) => query.where(filter), this);
  }

  public order<Path extends ColumnPath<T>>(column: Path, direction: OrderDirection): ORM<T>;
  public order<Path extends ColumnPath<T>>(filter: OrderCondition<T>): ORM<T>;
  public order<Path extends ColumnPath<T>>(
    columnOrFilter: Path | OrderCondition<T>,
    direction: OrderDirection = 'ASC'
  ): ORM<T> {
    const condition = typeof columnOrFilter === 'string'
      ? { column: columnOrFilter, direction }
      : columnOrFilter;

    if (!Object.prototype.hasOwnProperty.call(this.availableColumns, condition.column)) {
      throw new InvalidIdentifierError(`Column "${condition.column}" is not valid for table "${this.table}"`);
    }

    let query: ORM<T> = this;
    if (condition.column.includes('.')) {
      const prefix = condition.column.split('.').slice(0, -1).join('.');
      if (prefix !== this.table) query = query.ensureJoined(prefix);
    }

    const next = query.clone();
    const columnRef = resolveColumnReference(this.table, condition.column);
    next.orderClauses.push(`${columnRef} ${condition.direction ?? 'ASC'}`);
    return next;
  }

  public orderMany(filters: OrderCondition<T>[]): ORM<T> {
    return filters.reduce<ORM<T>>((query, filter) => query.order(filter), this);
  }

  public limit(value: number): ORM<T> {
    if (!Number.isInteger(value) || value < 0) {
      throw new InvalidDataError(`Limit must be a non-negative integer, received "${value}"`);
    }
    const next = this.clone();
    next.limitValue = value;
    return next;
  }

  public offset(value: number): ORM<T> {
    if (!Number.isInteger(value) || value < 0) {
      throw new InvalidDataError(`Offset must be a non-negative integer, received "${value}"`);
    }
    const next = this.clone();
    next.offsetValue = value;
    return next;
  }

  public async getAll(options?: { includeDeleted?: boolean }): Promise<RelationsSchemaMap[T][]> {
    const table = tableOf(this.table);
    const mainColumns = `"${this.table}".*`;
    const joinedCols = this.joinedColumns.length > 0 ? this.joinedColumns.join(', ') : '';
    const selectColumns = joinedCols ? `${mainColumns}, ${joinedCols}` : mainColumns;
    const joins = this.joinedTables.join(' ');

    const hasSoftDelete = table.columns.some((column) => column.name === 'deleted_at');
    const baseFilters = !options?.includeDeleted && hasSoftDelete
      ? [`"${this.table}".deleted_at IS NULL`]
      : [];

    const filters = [...baseFilters, ...this.whereClauses];
    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const orderClause = this.orderClauses.length > 0 ? `ORDER BY ${this.orderClauses.join(', ')}` : '';
    const limitClause = this.limitValue !== undefined ? `LIMIT ${this.limitValue}` : '';
    const offsetClause = this.offsetValue !== undefined
      ? `OFFSET ${this.offsetValue}`
      : '';

    const query = `SELECT ${selectColumns} FROM ${table.sqlName} AS "${this.table}" ${joins} ${whereClause} ${orderClause} ${limitClause} ${offsetClause}`.trim();
    const params = this.whereValues as any[];

    try {
      const rows = (await this.db.getAllAsync(query, params)) as Record<string, any>[];
      return rows.map(this.mapRow) as RelationsSchemaMap[T][];
    } catch (error) {
      throw new QueryError(`Error en getAll() para ${this.table}`, error);
    }
  }

  public async first(options?: { includeDeleted?: boolean }): Promise<RelationsSchemaMap[T] | null> {
    const rows = await this.limit(1).getAll(options);
    return rows[0] ?? null;
  }

  public async getById(id: number, options?: { includeDeleted?: boolean }) {
    return this.where('id' as never, id).first(options);
  }

  public async exists(options?: { includeDeleted?: boolean }): Promise<boolean> {
    return (await this.count(options)) > 0;
  }

  public async transaction<R>(task: (orm: ORM<T>) => Promise<R>): Promise<R> {
    let result: R | undefined;
    await withExclusiveTransaction(this.db, async (txn) => {
      result = await task(new ORM<T>(txn, this.table));
    });
    return result as R;
  }

  public async count(options?: { includeDeleted?: boolean }): Promise<number> {
    const table = tableOf(this.table);
    const hasSoftDelete = table.columns.some((column) => column.name === 'deleted_at');
    const baseFilters = !options?.includeDeleted && hasSoftDelete
      ? [`"${this.table}".deleted_at IS NULL`]
      : [];
    const filters = [...baseFilters, ...this.whereClauses];
    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const query = `SELECT COUNT(*) AS total FROM ${table.sqlName} AS "${this.table}" ${this.joinedTables.join(' ')} ${whereClause}`;

    try {
      const row = await this.db.getFirstAsync<{ total: number }>(query, this.whereValues as any[]);
      return row?.total ?? 0;
    } catch (error) {
      throw new QueryError(`Error en count() para ${this.table}`, error);
    }
  }

  private mapRow = (row: Record<string, any>) => {
    const result: any = {};
    for (const key of Object.keys(row)) {
      const value = row[key];
      if (key.includes('.')) {
        const parts = key.split('.');
        let cursor = result;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (i === parts.length - 1) {
            cursor[part] = value;
          } else {
            if (cursor[part] === undefined || cursor[part] === null) cursor[part] = {};
            cursor = cursor[part];
          }
        }
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  public async raw<R = Record<string, any>>(query: string, params: SqlValue[] = []): Promise<R[]> {
    try {
      return (await this.db.getAllAsync(query, params as any[])) as R[];
    } catch (error) {
      throw new QueryError(`Error en raw() para ${this.table}`, error);
    }
  }

  private validateData(data: Record<string, unknown>, allowId: boolean) {
    const table = tableOf(this.table);
    const valid = new Set(table.columns.map((column) => column.name));
    for (const key of Object.keys(data)) {
      if (!allowId && key === 'id') continue;
      if (!valid.has(key)) {
        throw new InvalidDataError(`Column "${key}" is not valid for table "${this.table}"`);
      }
    }
  }

  public async insert(data: Insertable<BaseSchemaMap[T]>): Promise<number> {    const table = tableOf(this.table);
    const payload = Object.fromEntries(
      Object.entries(data as Record<string, unknown>).filter(([, value]) => value !== undefined)
    );
    this.validateData(payload, false);

    const columns = Object.keys(payload).join(', ');
    const placeholders = Object.keys(payload).map(() => '?').join(', ');
    const values = Object.values(payload);

    try {
      const result = await this.db.runAsync(
        `INSERT INTO ${table.sqlName} (${columns}) VALUES (${placeholders})`,
        values as any[]
      );
      return result.lastInsertRowId;
    } catch (error) {
      throw new QueryError(`Error inserting into ${this.table}`, error);
    }
  }

  public async update(id: number, data: UpdateEntity<BaseSchemaMap[T]>): Promise<void> {
    const table = tableOf(this.table);
    const payload = Object.fromEntries(
      Object.entries(data as Record<string, unknown>).filter(([key, value]) => key !== 'id' && value !== undefined)
    );
    this.validateData(payload, true);

    const keys = Object.keys(payload);
    if (keys.length === 0) return;

    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    const values = Object.values(payload);
    const softDeleteFilter = table.columns.some((column) => column.name === 'deleted_at')
      ? ' AND deleted_at IS NULL'
      : '';

    try {
      await this.db.runAsync(
        `UPDATE ${table.sqlName} SET ${setClause} WHERE id = ?${softDeleteFilter}`,
        [...values, id] as any[]
      );
    } catch (error) {
      throw new QueryError(`Error updating ${this.table} with id ${id}`, error);
    }
  }

  public async delete(id: number, column: string = 'id'): Promise<void> {
    const table = tableOf(this.table);
    if (!table.columns.some((item) => item.name === column)) {
      throw new InvalidIdentifierError(`Column "${column}" is not valid for table "${this.table}"`);
    }

    if (!table.columns.some((item) => item.name === 'deleted_at')) {
      try {
        await this.db.runAsync(`DELETE FROM ${table.sqlName} WHERE "${column}" = ?`, [id]);
      } catch (error) {
        throw new QueryError(`Error deleting from ${this.table}`, error);
      }
      return;
    }

    try {
      await this.db.runAsync(
        `UPDATE ${table.sqlName} SET deleted_at = ? WHERE "${column}" = ? AND deleted_at IS NULL`,
        [Date.now(), id]
      );
    } catch (error) {
      throw new QueryError(`Error soft-deleting from ${this.table}`, error);
    }
  }

  public async deleteWhere(column: string, value: string | number | boolean | null): Promise<void> {
    const table = tableOf(this.table);
    if (!table.columns.some((item) => item.name === column)) {
      throw new InvalidIdentifierError(`Column "${column}" is not valid for table "${this.table}"`);
    }

    if (!table.columns.some((item) => item.name === 'deleted_at')) {
      try {
        await this.db.runAsync(`DELETE FROM ${table.sqlName} WHERE "${column}" = ?`, [value]);
      } catch (error) {
        throw new QueryError(`Error deleting from ${this.table}`, error);
      }
      return;
    }

    try {
      await this.db.runAsync(
        `UPDATE ${table.sqlName} SET deleted_at = ? WHERE "${column}" = ? AND deleted_at IS NULL`,
        [Date.now(), value]
      );
    } catch (error) {
      throw new QueryError(`Error soft-deleting from ${this.table}`, error);
    }
  }

  public async restore(id: number): Promise<void> {
    const table = tableOf(this.table);
    try {
      await this.db.runAsync(
        `UPDATE ${table.sqlName} SET deleted_at = NULL WHERE id = ?`,
        [id]
      );
    } catch (error) {
      throw new QueryError(`Error restoring ${this.table} with id ${id}`, error);
    }
  }

  public async forceDelete(id: number): Promise<void> {
    const table = tableOf(this.table);
    try {
      await this.db.runAsync(`DELETE FROM ${table.sqlName} WHERE id = ?`, [id]);
    } catch (error) {
      throw new QueryError(`Error force-deleting ${this.table} with id ${id}`, error);
    }
  }
}

export const useORM = <T extends TableOption>(table: T) => {
  const db = useSQLiteContext();
  return new ORM<T>(db, table);
};
