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

### Lectura eficiente del esquema

`docs/schema.md` es grande y generado. **No lo leas completo.**

1. Abre el índice “Tablas” del inicio: cada fila incluye la línea donde empieza
   la sección de esa tabla.
2. Busca la tabla con `rg -n "^## Records" docs/schema.md` si necesitas
   confirmar la línea.
3. Lee solo el rango de esa sección (columnas, relaciones e índices).
4. Para cambios de código, prefiere `src/db/schema/metadata.ts` o
   `src/db/schema/generated/columns.json` antes que el documento completo.

## Tablas

| Tabla lógica | Tabla física | Propósito |
| --- | --- | --- |
| `Groups` | `groups` | Periodos/grupos con meta. |
| `PaymentTypes` | `payment_types` | Tipos de pago. |
| `PaymentMethods` | `payment_methods` | Métodos/tarjetas y fechas de corte. |
| `Categories` | `categories` | Categorías de movimientos. |
| `RecordTypes` | `record_types` | Tipos de movimiento y efecto. |
| `Fixed` | `fixed_records` | Movimientos recurrentes. |
| `Records` | `records` | Movimientos principales. `amount` guarda el monto propio; `shared_amount_cents` guarda la parte compartida como snapshot. `saving_id` indica si el gasto se pagó con un ahorro. |
| `SharedPaymentAllocations` | `shared_payment_allocations` | Historial por persona de la parte compartida de cada pago (fijos y financiamientos). |
| `PaidCredits` | `paid_credits` | Pagos de créditos. |
| `Financings` | `financings` | Compras a plazo y préstamos con tasa, plazo y estado inicial. |
| `FinancingPayments` | `financing_payments` | Pagos, capital, interés, seguros, honorarios, abonos y vínculo opcional con `Records`. |
| `FinancingAdjustments` | `financing_adjustments` | Refinanciamientos y cambios de tasa/plazo. |
| `People` | `people` | Registro de personas para gastos compartidos. |
| `SharedExpenseParticipants` | `shared_expense_participants` | Participantes y porcentajes de fijos y financiamientos compartidos. |
| `BudgetTemplates` | `budget_templates` | Plantillas de presupuesto reutilizables. |
| `BudgetTemplateItems` | `budget_template_items` | Líneas de plantilla (categoría o fijo). |
| `BudgetPlans` | `budget_plans` | Plan mensual por grupo. |
| `BudgetLines` | `budget_lines` | Líneas planificadas por categoría o fijo. |
| `Savings` | `savings` | Cuentas/metas de ahorro con meta global opcional, regla de aporte, estado y modo de `Records`. |
| `SavingsHistory` | `savings_history` | Movimientos de ahorro: saldo inicial, aporte, retiro, interés y ajuste; incluye persona, período y registro vinculado. |
| `SavingsSettings` | `savings_settings` | Datos por defecto para registros de ahorro y color del trofeo de meta. |
| `Vehicles` | `vehicles` | Vehículos con tipo, color, unidades y consumo por defecto. |
| `VehicleFuelEntries` | `vehicle_fuel_entries` | Cargas de combustible con odómetro y unidades; `is_baseline` marca el registro inicial solo con odómetro. |
| `VehicleMaintenance` | `vehicle_maintenance` | Servicios, reparaciones y costos. |
| `VehicleMaintenanceItems` | `vehicle_maintenance_items` | Piezas y detalles flexibles. |
| `VehicleReminders` | `vehicle_reminders` | Recordatorios e intervalos de servicio. |
| `VehicleSettings` | `vehicle_settings` | Categorías, pagos y tipos de registro por defecto de la sección Vehículo. |
| `VehicleExpenseLinks` | `vehicle_expense_links` | Vínculo uno a uno con `Records`. |
| `Migrations` | `migrations` | Historial de migraciones. |

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
- `VehicleFuelEntries` → `Vehicles`
- `VehicleMaintenance` → `Vehicles`
- `VehicleMaintenanceItems` → `VehicleMaintenance`
- `VehicleReminders` → `Vehicles`
- `VehicleSettings` → `Categories`, `PaymentMethods`
- `VehicleExpenseLinks` → `Records`, `VehicleFuelEntries`, `VehicleMaintenance`
- `SavingsHistory` → `Savings`

Las rutas navegables se generan en `relations.json` a partir de las FKs.

## Migraciones

| Versión | Nombre | Qué hace |
| ---: | --- | --- |
| 1 | `0001_baseline` | Esquema consolidado y normalización legacy. |
| 2 | `0002_audit_timestamps` | Agrega `created_at`/`updated_at`. |
| 3 | `0003_timestamp_triggers` | Crea triggers y rellena timestamps nulos. |
| 4 | `0004_budget_plans` | Crea `budget_plans`/`budget_lines`, migra `budgets` a `budgets_legacy` y amplía plantillas. |
| 5 | `0005_drop_budget_legacy` | Elimina `budgets_legacy` después de validar la migración. |
| 6 | `0006_drop_budget_plan_status` | Elimina la columna `status` de `budget_plans`. |
| 7 | `0007_vehicle_module` | Reemplaza `fuel_refills`/`trip_logs` por el módulo de vehículo y crea sus tablas. |
| 8 | `0008_fuel_baseline` | Agrega `is_baseline` y hace nullables volumen/precio/total para el registro base. |
| 9 | `0009_vehicle_type` | Agrega `vehicle_type` a `vehicles` con valor inicial `car`. |
| 10 | `0010_vehicle_type_models` | Normaliza `car`→`sedan` y `van`→`furgon` para los modelos nuevos. |
| 11 | `0011_credit_cards_and_financings` | Agrega campos visuales/tarjeta a `payment_methods` y crea `financings`, `financing_payments` y `financing_adjustments`. |
| 12 | `0012_financing_payment_cents` | Agrega `payment_cents` a `financings` para la cuota pactada opcional. |
| 13 | `0013_vehicle_settings_record_type` | Agrega `record_type_id` a `vehicle_settings` para el tipo de registro por defecto de la sección Vehículo. |
| 14 | `0014_people_and_shared_participants` | Crea `people` y `shared_expense_participants`, y migra los compartidos existentes de financiamientos. |
| 15 | `0015_records_shared_amounts` | Agrega `own_amount_cents` y `shared_amount_cents` a `records`; backfill propio = monto y compartido = 0. |
| 16 | `0016_shared_payment_allocations` | Crea `shared_payment_allocations` para el historial de pagos compartidos por persona. |
| 17 | `0017_savings_goals_and_sharing` | Agrega metas, estado, archivo, regla de aporte, intereses y cachés a `savings`; crea `savings_settings`. |
| 18 | `0018_savings_movements` | Agrega tipo, persona, período, notas y vínculo a `Records` en `savings_history`; conserva el saldo inicial. |
| 19 | `0019_records_saving_source` | Agrega `records.saving_id` y migra el vínculo existente desde `savings_history.record_id`, excepto los registros creados desde un movimiento (`Saving · `). |
| 20 | `0020_clear_movement_saving_source` | Limpia `records.saving_id` de los registros creados desde un movimiento de ahorro que quedaron marcados por error. |

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
