# Base de datos

**Fuente de verdad:** [`../src/db/schema/tables.ts`](../src/db/schema/tables.ts)
**Esquema generado:** [`schema.md`](schema.md)
**Historial de migraciones:** `src/db/migrations/`

## Convenciones

- **Nombres lógicos:** PascalCase (`Records`, `PaymentMethods`, `Fixed`).
- **Nombres físicos:** snake_case (`records`, `payment_methods`,
  `fixed_records`).
- **Dinero:** enteros en centavos (`Cents`).
- **Fechas:** timestamps Unix en milisegundos.
- **Soft delete:** `deleted_at`.
- **Auditoría:** `created_at` y `updated_at`, llenados por triggers de SQLite.
- **Triggers:** insert rellena timestamps nulos; update actualiza `updated_at`.
- **Índices:** definidos en `APP_SCHEMA` y creados por `ensureIndexes`.

## Artefactos generados

Se regeneran con:

```bash
npm run db:generate
```

Salidas:

- `src/db/schema/generated/schema.sql`
- `src/db/schema/generated/types.ts`
- `src/db/schema/generated/relations.json`
- `src/db/schema/generated/columns.json`
- `docs/schema.md`

No editar esos archivos a mano.

## Tablas

| Tabla lógica | Tabla física | Propósito |
| --- | --- | --- |
| `Groups` | `groups` | Periodos/grupos con meta. |
| `PaymentTypes` | `payment_types` | Tipos de pago. |
| `PaymentMethods` | `payment_methods` | Métodos/tarjetas y fechas de corte. |
| `Categories` | `categories` | Categorías de movimientos. |
| `RecordTypes` | `record_types` | Tipos de movimiento y efecto. |
| `Fixed` | `fixed_records` | Movimientos recurrentes. |
| `Records` | `records` | Movimientos principales. |
| `PaidCredits` | `paid_credits` | Pagos de créditos. |
| `BudgetTemplates` | `budget_templates` | Plantillas de presupuesto reutilizables. |
| `BudgetTemplateItems` | `budget_template_items` | Líneas de plantilla (categoría o fijo). |
| `BudgetPlans` | `budget_plans` | Plan mensual por grupo. |
| `BudgetLines` | `budget_lines` | Líneas planificadas por categoría o fijo. |
| `Savings` | `savings` | Cuentas/metas de ahorro. |
| `SavingsHistory` | `savings_history` | Historial de ahorros. |
| `Migrations` | `migrations` | Historial de migraciones. |
| `FuelRefills` | `fuel_refills` | Cargas de combustible. |
| `TripLogs` | `trip_logs` | Viajes y consumo. |

## Relaciones

- `PaymentMethods` → `PaymentTypes`
- `Fixed` → `RecordTypes`, `Categories`, `PaymentMethods`
- `Records` → `RecordTypes`, `Groups`, `Categories`, `PaymentMethods`,
  `Fixed`, `PaidCredits`
- `PaidCredits` → `Groups`, `PaymentMethods`
- `BudgetTemplateItems` → `BudgetTemplates`, `RecordTypes`, `Categories`, `Fixed`
- `BudgetPlans` → `Groups`, `BudgetTemplates`
- `BudgetLines` → `BudgetPlans`, `Categories`, `RecordTypes`, `Fixed`,
  `BudgetTemplateItems`
- `SavingsHistory` → `Savings`

Las rutas navegables se generan en `relations.json` a partir de las FKs.

## Migraciones

| Versión | Nombre | Qué hace |
| ---: | --- | --- |
| 1 | `0001_baseline` | Esquema consolidado y normalización legacy. |
| 2 | `0002_audit_timestamps` | Agrega `created_at`/`updated_at`. |
| 3 | `0003_timestamp_triggers` | Crea triggers y rellena timestamps nulos. |
| 4 | `0004_budget_plans` | Crea `budget_plans`/`budget_lines`, migra `budgets` a `budgets_legacy` y amplía plantillas. |

Reglas:

- Cada migración corre en transacción exclusiva.
- Se registra solo después del commit.
- `PRAGMA user_version` es la versión rápida; `migrations` es el historial.
- Las migraciones no capturan errores internamente.
- La tabla `migrations` se crea antes del runner.

## Backup

El export es un dump SQL con cabecera opcional:

```sql
-- POCKETTOOL_BACKUP {"formatVersion":1,"appVersion":"...","schemaVersion":3,"exportedAt":...,"tables":[...]}
```

- Los dumps SQL antiguos siguen siendo importables.
- El import valida metadatos/tablas, crea backup previo, usa transacción
  exclusiva y restaura FKs.
- El backup previo se guarda en caché antes de importar.

## Acceso a datos

- `src/orm/`: ORM tipado, joins, soft delete, transacciones y errores tipados.
- `src/db/repositories/`: repositorios por agregado.
- `src/db/index.ts`: barrel público (`useRecords`, `useGroups`, etc.).
- La UI/stores no usan SQL ni `useORM` directo.

## Verificación

```bash
npm run typecheck
npm run test:db
npm test
npm run db:generate
```

`test:db` cubre migraciones, seed, ORM, triggers, backups, validación, créditos,
planes de consulta y ausencia de handlers legacy.
