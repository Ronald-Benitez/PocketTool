import { useSQLiteContext, SQLiteDatabase } from "expo-sqlite"
import { APP_SCHEMA } from "../db/schema"
import type {
    Groups,
    PaymentTypes,
    PaymentMethods,
    Categories,
    RecordTypes,
    Fixed,
    Records,
    PaidCredits,
    BudgetTemplates,
    BudgetTemplateItems,
    Budgets,
    Savings,
    SavingsHistory,
    Migrations,
} from "../db/types/schema"

type TableOption = keyof typeof APP_SCHEMA

type RelationshipsMap = Partial<Record<TableOption, string[]>>
type RelationshipsObject = Partial<Record<TableOption, Record<string, string>>>

const relationships: RelationshipsMap = {}
const relationshipsTree: RelationshipsObject = {}

const TABLES = Object.keys(APP_SCHEMA) as TableOption[]

for (const index in TABLES) {
    const table = TABLES[index]
    const columns = APP_SCHEMA[table as TableOption]?.columns
    const references = columns?.filter((column) => column.references)
    if (references && references.length > 0) {
        references.forEach((column) => {
            const referencedTable = column.references?.table
            if (referencedTable) {
                relationships[table] = [...(relationships[table] || []), referencedTable]
            }
        })
    }
}

const recursiveRelationships = (table: string, base: string): string[] => {
    const referencedTables = relationships[table] || []
    return referencedTables.map((referencedTable) => {
        return [`${base}.${referencedTable}`, ...recursiveRelationships(referencedTable, base)]
    }).flat()
}

const relationArrayToObject = (references: string[]) => {
    return Object.fromEntries(references.map((value) => [value, value]))
}

for (const table in relationships) {
    const references: string[] = []

    for (const referencedTable of relationships[table] ?? []) {
        const nestedReferences = recursiveRelationships(referencedTable, referencedTable)
        references.push(referencedTable, ...nestedReferences)
    }

    relationshipsTree[table] = relationArrayToObject(references)
}




type TableSchemaMap = {
    Groups: Groups
    PaymentTypes: PaymentTypes
    PaymentMethods: PaymentMethods
    Categories: Categories
    RecordTypes: RecordTypes
    Fixed: Fixed
    Records: Records
    PaidCredits: PaidCredits
    BudgetTemplates: BudgetTemplates
    BudgetTemplateItems: BudgetTemplateItems
    Budgets: Budgets
    Savings: Savings
    SavingsHistory: SavingsHistory
    Migrations: Migrations
}

type TableSchema<T extends TableOption = TableOption> = T extends keyof TableSchemaMap
    ? TableSchemaMap[T]
    : never

class ORM<T extends TableOption = TableOption> {
    private db: SQLiteDatabase

    private table: T | undefined

    private joinedTables: Array<String> = []

    private joinedColumns: Array<String> = []

    public availableJoins: Record<string, string>

    constructor(db: SQLiteDatabase, table: T) {
        this.db = db
        this.table = table
        this.availableJoins = relationshipsTree[table] || {}
    }

    public join(table: string) {
        if (!this.table) return this
        if (!Object.prototype.hasOwnProperty.call(this.availableJoins, table)) {
            throw new Error(`Table "${table}" is not a valid join for "${this.table}"`)
        }

        const segments = table.split('.')
        let prevTable = this.table as string

        for (const segment of segments) {
            const base = APP_SCHEMA[prevTable].columns?.find(e => e?.references?.table === segment)
            if (!base) {
                break
            }

            const joinStr = `inner join ${segment} on ${segment}.${base.references?.column} = ${prevTable}.${base.name}`

            if (!this.joinedTables.includes(joinStr)) {
                this.joinedTables.push(joinStr)
            }

            const referencedColumns = APP_SCHEMA[segment].columns ?? []
            const cols = referencedColumns
                .map((e) => `${segment}.${e.name} as "${segment}.${e.name}"`)
                .join(', ')

            if (cols && !this.joinedColumns.includes(cols)) {
                this.joinedColumns.push(cols)
            }

            prevTable = segment
        }

        return this
    }

    public async getAll(): Promise<TableSchema<T>[]> {
        if (!this.table) {
            throw new Error("Table not specified")
        }

        try {
            const mainColumns = `${this.table}.*`
            const joinedCols = this.joinedColumns.length > 0 ? this.joinedColumns.join(', ') : ''
            const selectColumns = joinedCols ? `${mainColumns}, ${joinedCols}` : mainColumns
            const joins = this.joinedTables.join(' ')

            const rows = (await this.db.getAllAsync(`SELECT ${selectColumns} FROM ${this.table} ${joins}`)) as any[]

            const mapRow = (row: any) => {
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
                                if (cursor[p] == null) cursor[p] = {}
                                cursor = cursor[p]
                            }
                        }
                    } else {
                        result[key] = value
                    }
                }
                return result
            }

            return rows.map(mapRow) as TableSchema<T>[]
        } catch (error) {
            console.error(error)
            return []
        }
    }

    public async insert(data: TableSchema<T>): Promise<void> {
        if (!this.table) {
            throw new Error("Table not specified")
        }
        const columns = Object.keys(data).join(", ")
        const placeholders = Object.keys(data).map(() => "?").join(", ")
        const values = Object.values(data)

        try {
            await this.db.runAsync(
                `INSERT INTO ${this.table} (${columns}) VALUES (${placeholders})`,
                values
            )
        } catch (error) {
            console.error(error)
        }
    }

    public async update(id: number, data: Partial<TableSchema<T>>): Promise<void> {
        if (!this.table) {
            throw new Error("Table not specified")
        }
        const setClause = Object.keys(data).map((key) => `${key} = ?`)
            .join(", ")
        const values = Object.values(data)

        try {
            await this.db.runAsync(
                `UPDATE ${this.table} SET ${setClause} WHERE id = ?`,
                [...values, id]
            )
        } catch (error) {
            console.error(error)
        }
    }

    public async delete(id: number): Promise<void> {
        if (!this.table) {
            throw new Error("Table not specified")
        }
        try {
            await this.db.runAsync(`DELETE FROM ${this.table} WHERE id = ?`, [id])
        } catch (error) {
            console.error(error)
        }
    }
}

export const useORM = <T extends TableOption>(table: T) => {
    const db = useSQLiteContext()

    return new ORM<T>(db, table)
}