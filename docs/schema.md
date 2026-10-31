# Esquema de base de datos

> Documento generado por `scripts/generate-db-artifacts.js`. No editar a mano.
> Fuente de verdad: `src/db/schema/tables.ts`.

Versión de esquema: **7**

## Convenciones

- Nombres lógicos: PascalCase. Nombres físicos: snake_case.
- Dinero: `Cents` (integer cents).
- Fechas: `TimestampMs` (Unix milisegundos).
- Soft delete: `deleted_at` en tablas de negocio.

## Tablas

| Tabla | Física | Entidad | Columnas | Índices |
| --- | --- | --- | ---: | ---: |
| `Groups` | `groups` | `Group` | 8 | 1 |
| `PaymentTypes` | `payment_types` | `PaymentType` | 6 | 0 |
| `PaymentMethods` | `payment_methods` | `PaymentMethod` | 8 | 1 |
| `Categories` | `categories` | `Category` | 5 | 0 |
| `RecordTypes` | `record_types` | `RecordType` | 7 | 0 |
| `Fixed` | `fixed_records` | `FixedRecord` | 10 | 4 |
| `Records` | `records` | `RecordEntry` | 13 | 6 |
| `PaidCredits` | `paid_credits` | `PaidCredit` | 8 | 3 |
| `BudgetTemplates` | `budget_templates` | `BudgetTemplate` | 8 | 0 |
| `BudgetTemplateItems` | `budget_template_items` | `BudgetTemplateItem` | 13 | 4 |
| `BudgetPlans` | `budget_plans` | `BudgetPlan` | 10 | 2 |
| `BudgetLines` | `budget_lines` | `BudgetLine` | 15 | 6 |
| `Savings` | `savings` | `Saving` | 6 | 0 |
| `SavingsHistory` | `savings_history` | `SavingsHistoryEntry` | 8 | 1 |
| `Migrations` | `migrations` | `Migration` | 3 | 0 |
| `Vehicles` | `vehicles` | `Vehicle` | 18 | 1 |
| `VehicleFuelEntries` | `vehicle_fuel_entries` | `VehicleFuelEntry` | 18 | 2 |
| `VehicleMaintenance` | `vehicle_maintenance` | `VehicleMaintenanceEntry` | 13 | 2 |
| `VehicleMaintenanceItems` | `vehicle_maintenance_items` | `VehicleMaintenanceItem` | 10 | 1 |
| `VehicleReminders` | `vehicle_reminders` | `VehicleReminder` | 17 | 1 |
| `VehicleSettings` | `vehicle_settings` | `VehicleSetting` | 6 | 0 |
| `VehicleExpenseLinks` | `vehicle_expense_links` | `VehicleExpenseLink` | 6 | 3 |

## Groups (`groups`)

Entidad TypeScript: `Group`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `group_name` | `TEXT` | `string` | NOT NULL |
| `goal` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `year` | `INTEGER` | `number` | NOT NULL |
| `month` | `INTEGER` | `number` | NOT NULL |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Índices:
- `idx_groups_active` (year, month) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## PaymentTypes (`payment_types`)

Entidad TypeScript: `PaymentType`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `payment_type_name` | `TEXT` | `string` | UNIQUE |
| `payment_color` | `TEXT` | `string` | default="#000000" |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## PaymentMethods (`payment_methods`)

Entidad TypeScript: `PaymentMethod`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `method_name` | `TEXT` | `string` | NOT NULL, UNIQUE |
| `closing_date` | `INTEGER` | `number` |  |
| `payment_date` | `INTEGER` | `number` |  |
| `payment_type_id` | `INTEGER` | `number` | FK → PaymentTypes.id ON DELETE SET NULL |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `PaymentTypes`

Índices:
- `idx_payment_methods_type` (payment_type_id) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## Categories (`categories`)

Entidad TypeScript: `Category`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `category_name` | `TEXT` | `string` | NOT NULL, UNIQUE |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## RecordTypes (`record_types`)

Entidad TypeScript: `RecordType`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `type_name` | `TEXT` | `string` | NOT NULL, UNIQUE |
| `effect` | `TEXT` | `string` | default="=" |
| `record_color` | `TEXT` | `string` | default="#000000" |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## Fixed (`fixed_records`)

Entidad TypeScript: `FixedRecord`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `fixed_amount` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `fixed_name` | `TEXT` | `string` | NOT NULL |
| `fixed_day` | `INTEGER` | `number` | NOT NULL |
| `record_type_id` | `INTEGER` | `number` | FK → RecordTypes.id ON DELETE SET NULL |
| `category_id` | `INTEGER` | `number` | FK → Categories.id ON DELETE SET NULL |
| `payment_method_id` | `INTEGER` | `number` | FK → PaymentMethods.id ON DELETE SET NULL |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `RecordTypes`, `Categories`, `PaymentMethods`, `PaymentMethods.PaymentTypes`

Índices:
- `idx_fixed_active` (fixed_day) WHERE deleted_at IS NULL
- `idx_fixed_category` (category_id) WHERE deleted_at IS NULL
- `idx_fixed_payment_method` (payment_method_id) WHERE deleted_at IS NULL
- `idx_fixed_record_type` (record_type_id) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## Records (`records`)

Entidad TypeScript: `RecordEntry`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `amount` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `record_name` | `TEXT` | `string` | NOT NULL |
| `date` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `record_type_id` | `INTEGER` | `number` | FK → RecordTypes.id ON DELETE SET NULL |
| `group_id` | `INTEGER` | `number` | FK → Groups.id ON DELETE CASCADE |
| `category_id` | `INTEGER` | `number` | FK → Categories.id ON DELETE SET NULL |
| `payment_method_id` | `INTEGER` | `number` | FK → PaymentMethods.id ON DELETE SET NULL |
| `fixed_id` | `INTEGER` | `number` | FK → Fixed.id ON DELETE SET NULL |
| `paid_credit_id` | `INTEGER` | `number` | FK → PaidCredits.id ON DELETE SET NULL |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `RecordTypes`, `Groups`, `Categories`, `PaymentMethods`, `PaymentMethods.PaymentTypes`, `Fixed`, `Fixed.RecordTypes`, `Fixed.Categories`, `Fixed.PaymentMethods`, `Fixed.PaymentMethods.PaymentTypes`, `PaidCredits`, `PaidCredits.Groups`, `PaidCredits.PaymentMethods`, `PaidCredits.PaymentMethods.PaymentTypes`

Índices:
- `idx_records_group_date` (group_id, date) WHERE deleted_at IS NULL
- `idx_records_category` (category_id) WHERE deleted_at IS NULL
- `idx_records_payment_method` (payment_method_id) WHERE deleted_at IS NULL
- `idx_records_record_type` (record_type_id) WHERE deleted_at IS NULL
- `idx_records_fixed` (fixed_id) WHERE deleted_at IS NULL
- `idx_records_paid_credit` (paid_credit_id) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## PaidCredits (`paid_credits`)

Entidad TypeScript: `PaidCredit`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `amount` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `date` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `group_id` | `INTEGER` | `number` | FK → Groups.id ON DELETE CASCADE |
| `payment_method_id` | `INTEGER` | `number` | FK → PaymentMethods.id ON DELETE SET NULL |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `Groups`, `PaymentMethods`, `PaymentMethods.PaymentTypes`

Índices:
- `idx_paid_credits_group` (group_id) WHERE deleted_at IS NULL
- `idx_paid_credits_payment_method` (payment_method_id) WHERE deleted_at IS NULL
- `idx_paid_credits_date` (date) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## BudgetTemplates (`budget_templates`)

Entidad TypeScript: `BudgetTemplate`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `template_name` | `TEXT` | `string` | NOT NULL, UNIQUE |
| `description` | `TEXT` | `string` |  |
| `is_default` | `INTEGER` | `boolean | number` | kind=boolean, default=0 |
| `notes` | `TEXT` | `string` |  |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## BudgetTemplateItems (`budget_template_items`)

Entidad TypeScript: `BudgetTemplateItem`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `budget_template_id` | `INTEGER` | `number` | NOT NULL, FK → BudgetTemplates.id ON DELETE CASCADE |
| `amount` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `record_type_id` | `INTEGER` | `number` | NOT NULL, FK → RecordTypes.id ON DELETE SET NULL |
| `category_id` | `INTEGER` | `number` | NOT NULL, FK → Categories.id ON DELETE SET NULL |
| `fixed_id` | `INTEGER` | `number` | FK → Fixed.id ON DELETE SET NULL |
| `scope` | `TEXT` | `string` | NOT NULL, default="category" |
| `priority` | `INTEGER` | `number` | NOT NULL, default=2 |
| `notes` | `TEXT` | `string` |  |
| `sort_order` | `INTEGER` | `number` | NOT NULL, default=0 |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `BudgetTemplates`, `RecordTypes`, `Categories`, `Fixed`, `Fixed.RecordTypes`, `Fixed.Categories`, `Fixed.PaymentMethods`, `Fixed.PaymentMethods.PaymentTypes`

Índices:
- `idx_budget_template_items_template` (budget_template_id) WHERE deleted_at IS NULL
- `idx_budget_template_items_category` (category_id) WHERE deleted_at IS NULL
- `idx_budget_template_items_record_type` (record_type_id) WHERE deleted_at IS NULL
- `idx_budget_template_items_fixed` (fixed_id) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## BudgetPlans (`budget_plans`)

Entidad TypeScript: `BudgetPlan`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `group_id` | `INTEGER` | `number` | NOT NULL, FK → Groups.id ON DELETE CASCADE |
| `template_id` | `INTEGER` | `number` | FK → BudgetTemplates.id ON DELETE SET NULL |
| `plan_name` | `TEXT` | `string` |  |
| `alert_threshold_percent` | `INTEGER` | `number` | NOT NULL, default=80 |
| `notes` | `TEXT` | `string` |  |
| `applied_template_at` | `INTEGER` | `TimestampMs` | kind=timestamp |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `Groups`, `BudgetTemplates`

Índices:
- `idx_budget_plans_group_active` (group_id) UNIQUE WHERE deleted_at IS NULL
- `idx_budget_plans_template` (template_id) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## BudgetLines (`budget_lines`)

Entidad TypeScript: `BudgetLine`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `budget_plan_id` | `INTEGER` | `number` | NOT NULL, FK → BudgetPlans.id ON DELETE CASCADE |
| `category_id` | `INTEGER` | `number` | FK → Categories.id ON DELETE SET NULL |
| `record_type_id` | `INTEGER` | `number` | FK → RecordTypes.id ON DELETE SET NULL |
| `fixed_id` | `INTEGER` | `number` | FK → Fixed.id ON DELETE SET NULL |
| `scope` | `TEXT` | `string` | NOT NULL, default="category" |
| `source` | `TEXT` | `string` | NOT NULL, default="manual" |
| `template_item_id` | `INTEGER` | `number` | FK → BudgetTemplateItems.id ON DELETE SET NULL |
| `planned_amount` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `priority` | `INTEGER` | `number` | NOT NULL, default=2 |
| `notes` | `TEXT` | `string` |  |
| `sort_order` | `INTEGER` | `number` | NOT NULL, default=0 |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `BudgetPlans`, `BudgetPlans.Groups`, `BudgetPlans.BudgetTemplates`, `Categories`, `RecordTypes`, `Fixed`, `Fixed.RecordTypes`, `Fixed.Categories`, `Fixed.PaymentMethods`, `Fixed.PaymentMethods.PaymentTypes`, `BudgetTemplateItems`, `BudgetTemplateItems.BudgetTemplates`, `BudgetTemplateItems.RecordTypes`, `BudgetTemplateItems.Categories`, `BudgetTemplateItems.Fixed`, `BudgetTemplateItems.Fixed.RecordTypes`, `BudgetTemplateItems.Fixed.Categories`, `BudgetTemplateItems.Fixed.PaymentMethods`, `BudgetTemplateItems.Fixed.PaymentMethods.PaymentTypes`

Índices:
- `idx_budget_lines_plan` (budget_plan_id) WHERE deleted_at IS NULL
- `idx_budget_lines_category` (category_id) WHERE deleted_at IS NULL
- `idx_budget_lines_record_type` (record_type_id) WHERE deleted_at IS NULL
- `idx_budget_lines_fixed` (fixed_id) WHERE deleted_at IS NULL
- `idx_budget_lines_category_unique` (budget_plan_id, category_id, record_type_id) UNIQUE WHERE deleted_at IS NULL AND scope = 'category' AND category_id IS NOT NULL AND record_type_id IS NOT NULL
- `idx_budget_lines_fixed_unique` (budget_plan_id, fixed_id) UNIQUE WHERE deleted_at IS NULL AND scope = 'fixed' AND fixed_id IS NOT NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## Savings (`savings`)

Entidad TypeScript: `Saving`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `saving_name` | `TEXT` | `string` | NOT NULL |
| `amount` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## SavingsHistory (`savings_history`)

Entidad TypeScript: `SavingsHistoryEntry`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `savings_id` | `INTEGER` | `number` | FK → Savings.id ON DELETE CASCADE |
| `previous_amount` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `new_amount` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `change_date` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `Savings`

Índices:
- `idx_savings_history_saving` (savings_id) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## Migrations (`migrations`)

Entidad TypeScript: `Migration`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `migration_name` | `TEXT` | `string` | NOT NULL, UNIQUE |
| `applied_at` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |

## Vehicles (`vehicles`)

Entidad TypeScript: `Vehicle`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `name` | `TEXT` | `string` | NOT NULL |
| `make` | `TEXT` | `string` |  |
| `model` | `TEXT` | `string` |  |
| `year` | `INTEGER` | `number` |  |
| `plate` | `TEXT` | `string` |  |
| `color` | `TEXT` | `string` |  |
| `fuel_type` | `TEXT` | `string` | NOT NULL, default="gasoline" |
| `distance_unit` | `TEXT` | `string` | NOT NULL, default="mi" |
| `volume_unit` | `TEXT` | `string` | NOT NULL, default="gal" |
| `consumption_format` | `TEXT` | `string` | NOT NULL, default="mi_gal" |
| `tank_capacity` | `REAL` | `number` |  |
| `tank_capacity_unit` | `TEXT` | `string` |  |
| `is_default` | `INTEGER` | `boolean | number` | NOT NULL, kind=boolean, default=0 |
| `notes` | `TEXT` | `string` |  |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Índices:
- `idx_vehicles_default` (is_default) UNIQUE WHERE is_default = 1 AND deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## VehicleFuelEntries (`vehicle_fuel_entries`)

Entidad TypeScript: `VehicleFuelEntry`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `vehicle_id` | `INTEGER` | `number` | NOT NULL, FK → Vehicles.id ON DELETE CASCADE |
| `date` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `odometer` | `REAL` | `number` |  |
| `odometer_source` | `TEXT` | `string` |  |
| `distance_unit` | `TEXT` | `string` | NOT NULL, default="mi" |
| `distance_traveled` | `REAL` | `number` |  |
| `distance_source` | `TEXT` | `string` |  |
| `volume` | `REAL` | `number` | NOT NULL |
| `volume_unit` | `TEXT` | `string` | NOT NULL, default="gal" |
| `price_per_unit` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `total_cost` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `is_full_tank` | `INTEGER` | `boolean | number` | NOT NULL, kind=boolean, default=1 |
| `station` | `TEXT` | `string` |  |
| `notes` | `TEXT` | `string` |  |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `Vehicles`

Índices:
- `idx_vehicle_fuel_vehicle_date` (vehicle_id, date) WHERE deleted_at IS NULL
- `idx_vehicle_fuel_vehicle_odometer` (vehicle_id, odometer) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## VehicleMaintenance (`vehicle_maintenance`)

Entidad TypeScript: `VehicleMaintenanceEntry`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `vehicle_id` | `INTEGER` | `number` | NOT NULL, FK → Vehicles.id ON DELETE CASCADE |
| `date` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `odometer` | `REAL` | `number` |  |
| `distance_unit` | `TEXT` | `string` | NOT NULL, default="mi" |
| `service_type` | `TEXT` | `string` | NOT NULL |
| `title` | `TEXT` | `string` | NOT NULL |
| `cost` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `vendor` | `TEXT` | `string` |  |
| `notes` | `TEXT` | `string` |  |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `Vehicles`

Índices:
- `idx_vehicle_maintenance_vehicle_date` (vehicle_id, date) WHERE deleted_at IS NULL
- `idx_vehicle_maintenance_vehicle_type` (vehicle_id, service_type) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## VehicleMaintenanceItems (`vehicle_maintenance_items`)

Entidad TypeScript: `VehicleMaintenanceItem`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `maintenance_id` | `INTEGER` | `number` | NOT NULL, FK → VehicleMaintenance.id ON DELETE CASCADE |
| `name` | `TEXT` | `string` | NOT NULL |
| `notes` | `TEXT` | `string` |  |
| `quantity` | `REAL` | `number` |  |
| `unit` | `TEXT` | `string` |  |
| `cost` | `INTEGER` | `Cents` | kind=money |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `VehicleMaintenance`, `VehicleMaintenance.Vehicles`

Índices:
- `idx_vehicle_maintenance_items_maintenance` (maintenance_id) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## VehicleReminders (`vehicle_reminders`)

Entidad TypeScript: `VehicleReminder`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `vehicle_id` | `INTEGER` | `number` | NOT NULL, FK → Vehicles.id ON DELETE CASCADE |
| `service_type` | `TEXT` | `string` | NOT NULL |
| `title` | `TEXT` | `string` | NOT NULL |
| `interval_distance` | `REAL` | `number` |  |
| `interval_distance_unit` | `TEXT` | `string` |  |
| `interval_months` | `INTEGER` | `number` |  |
| `last_service_date` | `INTEGER` | `TimestampMs` | kind=timestamp |
| `last_service_odometer` | `REAL` | `number` |  |
| `odometer_unit` | `TEXT` | `string` |  |
| `next_due_date` | `INTEGER` | `TimestampMs` | kind=timestamp |
| `next_due_odometer` | `REAL` | `number` |  |
| `is_active` | `INTEGER` | `boolean | number` | NOT NULL, kind=boolean, default=1 |
| `notes` | `TEXT` | `string` |  |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `Vehicles`

Índices:
- `idx_vehicle_reminders_vehicle_active` (vehicle_id, is_active) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## VehicleSettings (`vehicle_settings`)

Entidad TypeScript: `VehicleSetting`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `setting_key` | `TEXT` | `string` | NOT NULL, UNIQUE |
| `category_id` | `INTEGER` | `number` | FK → Categories.id ON DELETE SET NULL |
| `payment_method_id` | `INTEGER` | `number` | FK → PaymentMethods.id ON DELETE SET NULL |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `Categories`, `PaymentMethods`, `PaymentMethods.PaymentTypes`

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## VehicleExpenseLinks (`vehicle_expense_links`)

Entidad TypeScript: `VehicleExpenseLink`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `record_id` | `INTEGER` | `number` | NOT NULL, FK → Records.id ON DELETE CASCADE |
| `fuel_entry_id` | `INTEGER` | `number` | FK → VehicleFuelEntries.id ON DELETE CASCADE |
| `maintenance_id` | `INTEGER` | `number` | FK → VehicleMaintenance.id ON DELETE CASCADE |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `Records`, `Records.RecordTypes`, `Records.Groups`, `Records.Categories`, `Records.PaymentMethods`, `Records.PaymentMethods.PaymentTypes`, `Records.Fixed`, `Records.Fixed.RecordTypes`, `Records.Fixed.Categories`, `Records.Fixed.PaymentMethods`, `Records.Fixed.PaymentMethods.PaymentTypes`, `Records.PaidCredits`, `Records.PaidCredits.Groups`, `Records.PaidCredits.PaymentMethods`, `Records.PaidCredits.PaymentMethods.PaymentTypes`, `VehicleFuelEntries`, `VehicleFuelEntries.Vehicles`, `VehicleMaintenance`, `VehicleMaintenance.Vehicles`

Índices:
- `idx_vehicle_expense_links_record` (record_id) UNIQUE
- `idx_vehicle_expense_links_fuel` (fuel_entry_id) UNIQUE WHERE fuel_entry_id IS NOT NULL
- `idx_vehicle_expense_links_maintenance` (maintenance_id) UNIQUE WHERE maintenance_id IS NOT NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

