# Resumen de la base de datos

Basado en el esquema declarativo de [src/db/schema/tables.ts](src/db/schema/tables.ts)
y en el motor de normalización/migración [src/db/migration.ts](src/db/migration.ts).
La versión generada y detallada del esquema está en
[docs/schema.md](docs/schema.md).

## Artefactos generados

No editar a mano los archivos de `src/db/schema/generated/`. Se generan con:

```bash
npm run db:generate
```

Eso produce SQL, tipos TypeScript, relaciones, columnas y documentación a partir
de `APP_SCHEMA`.

## Tipos de datos usados

- `INTEGER`: identificadores, años, meses, días, fechas, claves foráneas y montos.
- `REAL`: medidas no monetarias (odómetro, galones, consumo, distancias).
- `TEXT`: nombres, colores, efectos y descripciones.
- Restricciones comunes: `PRIMARY KEY`, `AUTOINCREMENT`, `NOT NULL`, `UNIQUE`,
  `DEFAULT` y `REFERENCES ... ON DELETE`.

## Convenciones

- Los nombres lógicos de las tablas son PascalCase (`Records`,
  `PaymentMethods`, `Fixed`, etc.).
- Los nombres físicos en SQLite son snake_case (`records`, `payment_methods`,
  `fixed_records`, etc.). `APP_SCHEMA` es la única fuente de verdad y define
  ambos nombres.
- Los montos se guardan como enteros en centavos (`Cents`).
- Las fechas (`date`, `change_date`, `applied_at`) y `deleted_at` se guardan
  como timestamps Unix en milisegundos.
- Las tablas de negocio incluyen `deleted_at` para soft delete y `created_at` /
  `updated_at` para auditoría. Las consultas del ORM y los repositorios excluyen
  las filas borradas por defecto.

## Tablas principales

| Nombre lógico | Nombre físico | Descripción |
| --- | --- | --- |
| `Groups` | `groups` | Agrupa registros por periodo y objetivo. |
| `PaymentTypes` | `payment_types` | Define los tipos de métodos de pago. |
| `PaymentMethods` | `payment_methods` | Métodos de pago asociados a un tipo. |
| `Categories` | `categories` | Categorías para clasificar operaciones. |
| `RecordTypes` | `record_types` | Tipos de movimientos con efecto. |
| `Fixed` | `fixed_records` | Gastos o ingresos fijos recurrentes. |
| `Records` | `records` | Registros principales de movimientos. |
| `PaidCredits` | `paid_credits` | Pagos de créditos realizados. |
| `BudgetTemplates` | `budget_templates` | Plantillas de presupuesto. |
| `BudgetTemplateItems` | `budget_template_items` | Elementos de una plantilla de presupuesto. |
| `Budgets` | `budgets` | Presupuesto asignado por tipo, grupo y categoría. |
| `Savings` | `savings` | Metas o cuentas de ahorro. |
| `SavingsHistory` | `savings_history` | Historial de cambios en ahorros. |
| `Migrations` | `migrations` | Registro de migraciones aplicadas. |
| `FuelRefills` | `fuel_refills` | Cargas de combustible. |
| `TripLogs` | `trip_logs` | Registros de viajes. |

## Relaciones principales

- `PaymentMethods` → `PaymentTypes`
- `Fixed` → `RecordTypes`, `Categories`, `PaymentMethods`
- `Records` → `RecordTypes`, `Groups`, `Categories`, `PaymentMethods`, `Fixed`, `PaidCredits`
- `PaidCredits` → `Groups`, `PaymentMethods`
- `BudgetTemplateItems` → `BudgetTemplates`, `RecordTypes`, `Categories`
- `Budgets` → `RecordTypes`, `Groups`, `Categories`
- `SavingsHistory` → `Savings`

## Migraciones

`runMigrations` (en `src/db/migration.ts`) se ejecuta al inicializar SQLite:

1. Detecta tablas legadas en PascalCase y las reconstruye con el nombre físico
   snake_case.
2. Convierte montos en dólares (`REAL`) a centavos (`INTEGER`).
3. Convierte fechas en texto o segundos a milisegundos.
4. Agrega `deleted_at` cuando falta.
5. Crea índices y siembra datos de referencia de forma idempotente.

Las migraciones incrementales posteriores viven en `src/db/migrations/` y se
registran en `migrations`, usando `PRAGMA user_version` y la tabla
`migrations` para no aplicarse dos veces.

## Resumen conceptual

La base de datos está orientada a la gestión financiera personal, permitiendo
controlar:

- ingresos y egresos,
- presupuestos,
- gastos fijos,
- métodos de pago,
- créditos pagados,
- ahorros y su historial,
- combustible y viajes.
