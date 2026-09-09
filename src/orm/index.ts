import { useSQLiteContext, SQLiteDatabase } from "expo-sqlite"
import relations from "./relations.json"
import columns from "./columns.json"
import { APP_SCHEMA } from "../db/schema"
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
  Budget,
  BudgetWithRelations,
  Saving,
  SavingsHistoryEntry,
  SavingsHistoryWithRelations,
  Migration,
  Insertable
} from "../interfaces/schema"

// ----------------------------------------------------------------------
// 1. Mapeo de Tablas a Interfaces (Simples y Con Relaciones)
// ----------------------------------------------------------------------
export type BaseSchemaMap = {
  Groups: Group
  PaymentTypes: PaymentType
  PaymentMethods: PaymentMethod
  Categories: Category
  RecordTypes: RecordType
  Fixed: FixedRecord
  Records: RecordEntry
  PaidCredits: PaidCredit
  BudgetTemplates: BudgetTemplate
  BudgetTemplateItems: BudgetTemplateItem
  Budgets: Budget
  Savings: Saving
  SavingsHistory: SavingsHistoryEntry
  Migrations: Migration
}

export type TableOption = keyof BaseSchemaMap

export type RelationsSchemaMap = {
  Groups: Group
  PaymentTypes: PaymentType
  PaymentMethods: PaymentMethodWithRelations
  Categories: Category
  RecordTypes: RecordType
  Fixed: FixedRecordWithRelations
  Records: RecordWithRelations
  PaidCredits: PaidCreditWithRelations
  BudgetTemplates: BudgetTemplateWithRelations
  BudgetTemplateItems: BudgetTemplateItemWithRelations
  Budgets: BudgetWithRelations
  Savings: Saving
  SavingsHistory: SavingsHistoryWithRelations
  Migrations: Migration
}

// ----------------------------------------------------------------------
// 2. Carga del árbol de relaciones desde relations.json
// ----------------------------------------------------------------------
const RELATION_TREE = relations as Record<string, Record<string, string>>
const COLUMN_TREE = columns as Record<string, Record<string, string>>

type RelationTree = typeof RELATION_TREE
type ColumnTree = typeof COLUMN_TREE

export type JoinPath<T extends TableOption> = Extract<keyof NonNullable<RelationTree[T]>, string>
export type ColumnPath<T extends TableOption> = Extract<keyof NonNullable<ColumnTree[T]>, string>
export type AvailableJoins<T extends TableOption> = Partial<Record<JoinPath<T>, JoinPath<T>>>
export type AvailableColumns<T extends TableOption> = Partial<Record<ColumnPath<T>, ColumnPath<T>>>

export type SqlOperator = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'LIKE' | 'IN' | 'IS' | 'IS NOT' | 'BETWEEN'
export type OrderDirection = 'ASC' | 'DESC'
export type SqlValue = string | number | boolean | null | Array<string | number | boolean | null>

export type WhereCondition<T extends TableOption> = {
  column: ColumnPath<T>
  value: SqlValue
  operator?: SqlOperator
}

export type OrderCondition<T extends TableOption> = {
  column: ColumnPath<T>
  direction?: OrderDirection
}

const buildAvailableJoins = <T extends TableOption>(table: T): AvailableJoins<T> => {
  const tableRelations = RELATION_TREE[table] ?? {}
  return Object.fromEntries(
    Object.keys(tableRelations).map((path) => [path, path])
  ) as AvailableJoins<T>
}

const buildAvailableColumns = <T extends TableOption>(table: T): AvailableColumns<T> => {
  const tableColumns = COLUMN_TREE[table] ?? {}
  return Object.fromEntries(
    Object.keys(tableColumns).map((path) => [path, path])
  ) as AvailableColumns<T>
}

const resolveColumnReference = (table: string, column: string) => {
  if (column.includes('.')) {
    const parts = column.split('.')
    const alias = parts.slice(0, -1).join('.')
    const field = parts[parts.length - 1]
    return `"${alias}"."${field}"`
  }

  return `"${table}"."${column}"`
}

const normalizeOperator = (operator: SqlOperator): string => {
  if (operator === 'IS') return 'IS'
  if (operator === 'IS NOT') return 'IS NOT'
  return operator
}

// ----------------------------------------------------------------------
// 3. Clase ORM con Soft Delete y Tipado Anidado
// ----------------------------------------------------------------------
class ORM<T extends TableOption = TableOption> {
  private db: SQLiteDatabase
  private table: T
  private joinedTables: string[] = []
  private joinedColumns: string[] = []
  private whereClauses: string[] = []
  private whereValues: SqlValue[] = []
  private orderClauses: string[] = []
  public availableJoins: AvailableJoins<T>
  public availableColumns: AvailableColumns<T>

  constructor(db: SQLiteDatabase, table: T) {
    this.db = db
    this.table = table
    this.availableJoins = buildAvailableJoins(table)
    this.availableColumns = buildAvailableColumns(table)
  }

  public join<Path extends JoinPath<T>>(tablePath: Path): this {
    if (!Object.prototype.hasOwnProperty.call(this.availableJoins, tablePath)) {
      throw new Error(`Table path "${tablePath}" is not a valid join for "${this.table}"`)
    }

    const segments = tablePath.split('.')
    let prevAlias = this.table as string
    let currentPath = ''

    for (const segment of segments) {
      // Manejo de origen de metadatos (extrae el nombre real de la tabla anterior si era un alias)
      const prevTableName = prevAlias.includes('.') ? prevAlias.split('.').pop()! : prevAlias
      currentPath = currentPath ? `${currentPath}.${segment}` : segment

      const base = APP_SCHEMA[prevTableName as TableOption]?.columns?.find(
        (e) => e?.references?.table === segment
      )

      if (!base) break

      // LEFT JOIN con Soft Delete implícito en la relación y alias entre comillas para soportar puntos
      const joinStr = `LEFT JOIN ${segment} AS "${currentPath}" ON "${currentPath}".${base.references?.column} = "${prevAlias}".${base.name}`

      if (!this.joinedTables.includes(joinStr)) {
        this.joinedTables.push(joinStr)
      }

      const referencedColumns = APP_SCHEMA[segment as TableOption]?.columns ?? []
      const cols = referencedColumns
        .map((e) => `"${currentPath}".${e.name} AS "${currentPath}.${e.name}"`)
        .join(', ')

      if (cols && !this.joinedColumns.includes(cols)) {
        this.joinedColumns.push(cols)
      }

      prevAlias = currentPath
    }

    return this
  }

  public joinMany(paths: JoinPath<T>[]) {
    for (const path of paths) {
      this.join(path)
    }

    return this
  }

  public where<Path extends ColumnPath<T>>(column: Path, value: SqlValue, operator: SqlOperator): this
  public where<Path extends ColumnPath<T>>(filter: WhereCondition<T>): this
  public where<Path extends ColumnPath<T>>(
    columnOrFilter: Path | WhereCondition<T>,
    value?: SqlValue,
    operator: SqlOperator = '='
  ) {
    const condition = typeof columnOrFilter === 'string'
      ? { column: columnOrFilter, value: value ?? null, operator }
      : columnOrFilter

    if (!Object.prototype.hasOwnProperty.call(this.availableColumns, condition.column)) {
      throw new Error(`Column "${condition.column}" is not valid for table "${this.table}"`)
    }

    const columnRef = resolveColumnReference(this.table, condition.column)
    const normalizedOperator = normalizeOperator(condition.operator ?? '=')

    if (normalizedOperator === 'IN') {
      const values = Array.isArray(condition.value) ? condition.value : [condition.value]
      const placeholders = values.map(() => '?').join(', ')
      this.whereClauses.push(`${columnRef} IN (${placeholders})`)
      this.whereValues.push(...values)
      return this
    }

    if (normalizedOperator === 'BETWEEN') {
      const values = Array.isArray(condition.value) ? condition.value : [condition.value, null]
      this.whereClauses.push(`${columnRef} BETWEEN ? AND ?`)
      this.whereValues.push(values[0], values[1])
      return this
    }

    if (normalizedOperator === 'IS' || normalizedOperator === 'IS NOT') {
      this.whereClauses.push(`${columnRef} ${normalizedOperator} ?`)
      this.whereValues.push(condition.value)
      return this
    }

    this.whereClauses.push(`${columnRef} ${normalizedOperator} ?`)
    this.whereValues.push(condition.value)
    return this
  }

  public whereMany(filters: Array<WhereCondition<T>>) {
    for (const filter of filters) {
      this.where(filter)
    }

    return this
  }

  public order<Path extends ColumnPath<T>>(column: Path, direction: OrderDirection): this
  public order<Path extends ColumnPath<T>>(filter: OrderCondition<T>): this
  public order<Path extends ColumnPath<T>>(
    columnOrFilter: Path | OrderCondition<T>,
    direction: OrderDirection = 'ASC'
  ) {
    const condition = typeof columnOrFilter === 'string'
      ? { column: columnOrFilter, direction }
      : columnOrFilter

    if (!Object.prototype.hasOwnProperty.call(this.availableColumns, condition.column)) {
      throw new Error(`Column "${condition.column}" is not valid for table "${this.table}"`)
    }

    const columnRef = resolveColumnReference(this.table, condition.column)
    this.orderClauses.push(`${columnRef} ${condition.direction ?? 'ASC'}`)
    return this
  }

  public orderMany(filters: Array<OrderCondition<T>>) {
    for (const filter of filters) {
      this.order(filter)
    }

    return this
  }

  public async getAll(options?: { includeDeleted?: boolean }): Promise<RelationsSchemaMap[T][]> {
    try {
      const mainColumns = `${this.table}.*`
      const joinedCols = this.joinedColumns.length > 0 ? this.joinedColumns.join(', ') : ''
      const selectColumns = joinedCols ? `${mainColumns}, ${joinedCols}` : mainColumns
      const joins = this.joinedTables.join(' ')

      const baseFilters = options?.includeDeleted
        ? []
        : [`${this.table}.deleted_at IS NULL`]

      const filters = [...baseFilters, ...this.whereClauses]
      const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''
      const orderClause = this.orderClauses.length > 0 ? `ORDER BY ${this.orderClauses.join(', ')}` : ''

      const query = `SELECT ${selectColumns} FROM ${this.table} ${joins} ${whereClause} ${orderClause}`.trim()
      const rows = (await this.db.getAllAsync(query, this.whereValues as any[])) as Record<string, any>[]

      const mapRow = (row: Record<string, any>) => {
        const result: any = {}
        for (const key of Object.keys(row)) {
          const value = row[key]
          if (key.includes('.')) {
            const parts = key.split('.')
            let cursor = result
            for (let i = 0; i < parts.length; i++) {
              const p = parts[i]
              if (i === parts.length - 1) {
                cursor[p] = value
              } else {
                if (cursor[p] === undefined) cursor[p] = {}
                cursor = cursor[p]
              }
            }
          } else {
            result[key] = value
          }
        }
        return result
      }

      return rows.map(mapRow) as RelationsSchemaMap[T][]
    } catch (error) {
      console.error(`Error en getAll() para ${this.table}:`, error)
      return []
    }
  }

  public async insert(data: Insertable<BaseSchemaMap[T]>): Promise<void> {
    const columns = Object.keys(data).join(', ')
    const placeholders = Object.keys(data).map(() => '?').join(', ')
    const values = Object.values(data)

    try {
      await this.db.runAsync(
        `INSERT INTO ${this.table} (${columns}) VALUES (${placeholders})`,
        values as any[]
      )
    } catch (error) {
      console.error(`Error en insert() para ${this.table}:`, error)
    }
  }

  public async update(id: number, data: Partial<BaseSchemaMap[T]>): Promise<void> {
    const setClause = Object.keys(data).map((key) => `${key} = ?`).join(', ')
    const values = Object.values(data)

    try {
      await this.db.runAsync(
        `UPDATE ${this.table} SET ${setClause} WHERE id = ? AND deleted_at IS NULL`,
        [...values, id] as any[]
      )
    } catch (error) {
      console.error(`Error en update() para ${this.table}:`, error)
    }
  }

  // Realiza soft delete asignando el ISO string actual en deleted_at
  public async delete(id: number): Promise<void> {
    try {
      const now = new Date().toISOString()
      await this.db.runAsync(
        `UPDATE ${this.table} SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL`,
        [now, id]
      )
    } catch (error) {
      console.error(`Error en delete() para ${this.table}:`, error)
    }
  }

  // Restaura un registro previamente marcado como eliminado
  public async restore(id: number): Promise<void> {
    try {
      await this.db.runAsync(
        `UPDATE ${this.table} SET deleted_at = NULL WHERE id = ?`,
        [id]
      )
    } catch (error) {
      console.error(`Error en restore() para ${this.table}:`, error)
    }
  }

  // Elimina físicamente el registro de la base de datos
  public async forceDelete(id: number): Promise<void> {
    try {
      await this.db.runAsync(`DELETE FROM ${this.table} WHERE id = ?`, [id])
    } catch (error) {
      console.error(`Error en forceDelete() para ${this.table}:`, error)
    }
  }
}

// ----------------------------------------------------------------------
// 4. Hook ejecutable
// ----------------------------------------------------------------------
export const useORM = <T extends TableOption>(table: T) => {
  const db = useSQLiteContext()
  return new ORM<T>(db, table)
}