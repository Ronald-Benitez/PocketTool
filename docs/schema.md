# Esquema de base de datos

> Documento generado por `scripts/generate-db-artifacts.js`. No editar a mano.
> Fuente de verdad: `src/db/schema/tables.ts`.

Versión de esquema: **28**

## Convenciones

- Nombres lógicos: PascalCase. Nombres físicos: snake_case.
- Dinero: `Cents` (integer cents).
- Fechas: `TimestampMs` (Unix milisegundos).
- Soft delete: `deleted_at` en tablas de negocio.

## Tablas

La columna **Línea** indica dónde empieza la sección de esa tabla. Para leer
solo una tabla, usa ese número como `offset` en lugar de abrir el documento
completo.

| Tabla | Física | Entidad | Columnas | Índices | Línea |
| --- | --- | --- | ---: | ---: | ---: |
| `Groups` | `groups` | `Group` | 11 | 2 | 59 |
| `PaymentTypes` | `payment_types` | `PaymentType` | 6 | 0 | 83 |
| `PaymentMethods` | `payment_methods` | `PaymentMethod` | 17 | 1 | 98 |
| `Categories` | `categories` | `Category` | 5 | 0 | 129 |
| `RecordTypes` | `record_types` | `RecordType` | 7 | 0 | 143 |
| `Fixed` | `fixed_records` | `FixedRecord` | 10 | 4 | 159 |
| `People` | `people` | `Person` | 7 | 1 | 186 |
| `Records` | `records` | `RecordEntry` | 18 | 7 | 205 |
| `PaidCredits` | `paid_credits` | `PaidCredit` | 8 | 3 | 243 |
| `Financings` | `financings` | `Financing` | 27 | 2 | 267 |
| `FinancingPayments` | `financing_payments` | `FinancingPayment` | 19 | 2 | 309 |
| `FinancingAdjustments` | `financing_adjustments` | `FinancingAdjustment` | 13 | 1 | 343 |
| `PersonSettlements` | `person_settlements` | `PersonSettlement` | 10 | 2 | 370 |
| `SharedExpenseParticipants` | `shared_expense_participants` | `SharedExpenseParticipant` | 11 | 2 | 395 |
| `SharedPaymentAllocations` | `shared_payment_allocations` | `SharedPaymentAllocation` | 13 | 3 | 421 |
| `BudgetTemplates` | `budget_templates` | `BudgetTemplate` | 8 | 0 | 450 |
| `BudgetTemplateItems` | `budget_template_items` | `BudgetTemplateItem` | 13 | 4 | 467 |
| `BudgetPlans` | `budget_plans` | `BudgetPlan` | 10 | 2 | 497 |
| `BudgetLines` | `budget_lines` | `BudgetLine` | 15 | 6 | 522 |
| `Savings` | `savings` | `Saving` | 21 | 1 | 556 |
| `SavingsHistory` | `savings_history` | `SavingsHistoryEntry` | 17 | 4 | 589 |
| `SavingsSettings` | `savings_settings` | `SavingsSetting` | 9 | 0 | 623 |
| `GroupClosings` | `group_closings` | `GroupClosing` | 18 | 2 | 643 |
| `GroupClosingLines` | `group_closing_lines` | `GroupClosingLine` | 20 | 9 | 676 |
| `ChartPreferences` | `chart_preferences` | `ChartPreference` | 11 | 1 | 718 |
| `ShoppingLists` | `shopping_lists` | `ShoppingList` | 10 | 2 | 741 |
| `ShoppingListItems` | `shopping_list_items` | `ShoppingListItem` | 11 | 1 | 766 |
| `Migrations` | `migrations` | `Migration` | 3 | 0 | 791 |
| `Vehicles` | `vehicles` | `Vehicle` | 19 | 1 | 801 |
| `VehicleFuelEntries` | `vehicle_fuel_entries` | `VehicleFuelEntry` | 19 | 2 | 832 |
| `VehicleMaintenance` | `vehicle_maintenance` | `VehicleMaintenanceEntry` | 13 | 2 | 866 |
| `VehicleMaintenanceItems` | `vehicle_maintenance_items` | `VehicleMaintenanceItem` | 10 | 1 | 894 |
| `VehicleReminders` | `vehicle_reminders` | `VehicleReminder` | 17 | 1 | 918 |
| `VehicleSettings` | `vehicle_settings` | `VehicleSetting` | 7 | 0 | 949 |
| `VehicleExpenseLinks` | `vehicle_expense_links` | `VehicleExpenseLink` | 6 | 3 | 967 |

## Groups (`groups`)

Entidad TypeScript: `Group`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `group_name` | `TEXT` | `string` | NOT NULL |
| `goal` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `year` | `INTEGER` | `number` | NOT NULL |
| `month` | `INTEGER` | `number` | NOT NULL |
| `period_start` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `period_end` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `period_mode` | `TEXT` | `string` | NOT NULL, default="calendar_month" |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Índices:
- `idx_groups_active` (year, month) WHERE deleted_at IS NULL
- `idx_groups_period` (period_start, period_end) WHERE deleted_at IS NULL

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
| `is_credit_card` | `INTEGER` | `boolean | number` | NOT NULL, kind=boolean, default=0 |
| `credit_limit` | `INTEGER` | `Cents` | kind=money |
| `visual_kind` | `TEXT` | `string` | NOT NULL, default="other" |
| `card_brand` | `TEXT` | `string` |  |
| `card_style` | `TEXT` | `string` |  |
| `card_color` | `TEXT` | `string` |  |
| `card_last4` | `TEXT` | `string` |  |
| `card_holder` | `TEXT` | `string` |  |
| `card_issuer` | `TEXT` | `string` |  |
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

## People (`people`)

Entidad TypeScript: `Person`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `name` | `TEXT` | `string` | NOT NULL |
| `notes` | `TEXT` | `string` |  |
| `is_active` | `INTEGER` | `boolean | number` | NOT NULL, kind=boolean, default=1 |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Índices:
- `idx_people_active` (is_active) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## Records (`records`)

Entidad TypeScript: `RecordEntry`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `amount` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `own_amount_cents` | `INTEGER` | `Cents` | kind=money |
| `shared_amount_cents` | `INTEGER` | `Cents` | kind=money |
| `record_name` | `TEXT` | `string` | NOT NULL |
| `date` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `record_type_id` | `INTEGER` | `number` | FK → RecordTypes.id ON DELETE SET NULL |
| `group_id` | `INTEGER` | `number` | FK → Groups.id ON DELETE CASCADE |
| `category_id` | `INTEGER` | `number` | FK → Categories.id ON DELETE SET NULL |
| `payment_method_id` | `INTEGER` | `number` | FK → PaymentMethods.id ON DELETE SET NULL |
| `fixed_id` | `INTEGER` | `number` | FK → Fixed.id ON DELETE SET NULL |
| `paid_credit_id` | `INTEGER` | `number` | FK → PaidCredits.id ON DELETE SET NULL |
| `saving_id` | `INTEGER` | `number` | FK → Savings.id ON DELETE SET NULL |
| `paid_by_person_id` | `INTEGER` | `number` | FK → People.id ON DELETE SET NULL |
| `paid_scope` | `TEXT` | `string` | NOT NULL, default="full" |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `RecordTypes`, `Groups`, `Categories`, `PaymentMethods`, `PaymentMethods.PaymentTypes`, `Fixed`, `Fixed.RecordTypes`, `Fixed.Categories`, `Fixed.PaymentMethods`, `Fixed.PaymentMethods.PaymentTypes`, `PaidCredits`, `PaidCredits.Groups`, `PaidCredits.PaymentMethods`, `PaidCredits.PaymentMethods.PaymentTypes`, `Savings`, `People`

Índices:
- `idx_records_group_date` (group_id, date) WHERE deleted_at IS NULL
- `idx_records_paid_by` (paid_by_person_id) WHERE deleted_at IS NULL
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

## Financings (`financings`)

Entidad TypeScript: `Financing`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `name` | `TEXT` | `string` | NOT NULL |
| `kind` | `TEXT` | `string` | NOT NULL |
| `lender` | `TEXT` | `string` |  |
| `principal_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `down_payment_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `financed_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `payment_cents` | `INTEGER` | `Cents` | kind=money |
| `annual_rate_bps` | `INTEGER` | `number` | NOT NULL, default=0 |
| `rate_type` | `TEXT` | `string` | NOT NULL, default="fixed" |
| `term_months` | `INTEGER` | `number` | NOT NULL, default=1 |
| `start_date` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `first_payment_date` | `INTEGER` | `TimestampMs` | kind=timestamp |
| `payment_day` | `INTEGER` | `number` |  |
| `payment_method_id` | `INTEGER` | `number` | FK → PaymentMethods.id ON DELETE SET NULL |
| `category_id` | `INTEGER` | `number` | FK → Categories.id ON DELETE SET NULL |
| `record_type_id` | `INTEGER` | `number` | FK → RecordTypes.id ON DELETE SET NULL |
| `paid_installments_before_app` | `INTEGER` | `number` | NOT NULL, default=0 |
| `capital_paid_before_app_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `is_shared` | `INTEGER` | `boolean | number` | NOT NULL, kind=boolean, default=0 |
| `shared_percent` | `REAL` | `number` |  |
| `shared_counterparty` | `TEXT` | `string` |  |
| `status` | `TEXT` | `string` | NOT NULL, default="active" |
| `notes` | `TEXT` | `string` |  |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `PaymentMethods`, `PaymentMethods.PaymentTypes`, `Categories`, `RecordTypes`

Índices:
- `idx_financings_status` (status, first_payment_date) WHERE deleted_at IS NULL
- `idx_financings_payment_method` (payment_method_id) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## FinancingPayments (`financing_payments`)

Entidad TypeScript: `FinancingPayment`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `financing_id` | `INTEGER` | `number` | NOT NULL, FK → Financings.id ON DELETE CASCADE |
| `date` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `amount_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `principal_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `interest_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `insurance_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `fees_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `extra_principal_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `extra_reduce_payment_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `is_shared` | `INTEGER` | `boolean | number` | NOT NULL, kind=boolean, default=0 |
| `shared_amount_cents` | `INTEGER` | `Cents` | kind=money |
| `group_id` | `INTEGER` | `number` | FK → Groups.id ON DELETE SET NULL |
| `payment_method_id` | `INTEGER` | `number` | FK → PaymentMethods.id ON DELETE SET NULL |
| `record_id` | `INTEGER` | `number` |  |
| `notes` | `TEXT` | `string` |  |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `Financings`, `Financings.PaymentMethods`, `Financings.PaymentMethods.PaymentTypes`, `Financings.Categories`, `Financings.RecordTypes`, `Groups`, `PaymentMethods`, `PaymentMethods.PaymentTypes`

Índices:
- `idx_financing_payments_financing_date` (financing_id, date) WHERE deleted_at IS NULL
- `idx_financing_payments_group` (group_id) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## FinancingAdjustments (`financing_adjustments`)

Entidad TypeScript: `FinancingAdjustment`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `financing_id` | `INTEGER` | `number` | NOT NULL, FK → Financings.id ON DELETE CASCADE |
| `date` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `kind` | `TEXT` | `string` | NOT NULL |
| `new_annual_rate_bps` | `INTEGER` | `number` |  |
| `new_term_months` | `INTEGER` | `number` |  |
| `new_payment_cents` | `INTEGER` | `Cents` | kind=money |
| `capitalized_interest_cents` | `INTEGER` | `Cents` | kind=money |
| `fees_cents` | `INTEGER` | `Cents` | kind=money |
| `notes` | `TEXT` | `string` |  |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `Financings`, `Financings.PaymentMethods`, `Financings.PaymentMethods.PaymentTypes`, `Financings.Categories`, `Financings.RecordTypes`

Índices:
- `idx_financing_adjustments_financing_date` (financing_id, date) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## PersonSettlements (`person_settlements`)

Entidad TypeScript: `PersonSettlement`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `person_id` | `INTEGER` | `number` | NOT NULL, FK → People.id ON DELETE CASCADE |
| `group_id` | `INTEGER` | `number` | FK → Groups.id ON DELETE SET NULL |
| `date` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `amount_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `direction` | `TEXT` | `string` | NOT NULL |
| `notes` | `TEXT` | `string` |  |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `People`, `Groups`

Índices:
- `idx_person_settlements_person_date` (person_id, date) WHERE deleted_at IS NULL
- `idx_person_settlements_group_date` (group_id, date) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## SharedExpenseParticipants (`shared_expense_participants`)

Entidad TypeScript: `SharedExpenseParticipant`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `owner_type` | `TEXT` | `string` | NOT NULL |
| `owner_id` | `INTEGER` | `number` | NOT NULL |
| `person_id` | `INTEGER` | `number` | NOT NULL, FK → People.id ON DELETE CASCADE |
| `share_percent` | `REAL` | `number` | NOT NULL |
| `share_mode` | `TEXT` | `string` | NOT NULL, default="percent" |
| `share_amount_cents` | `INTEGER` | `Cents` | kind=money |
| `notes` | `TEXT` | `string` |  |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `People`

Índices:
- `idx_shared_owner` (owner_type, owner_id) WHERE deleted_at IS NULL
- `idx_shared_person` (person_id) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## SharedPaymentAllocations (`shared_payment_allocations`)

Entidad TypeScript: `SharedPaymentAllocation`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `person_id` | `INTEGER` | `number` | NOT NULL, FK → People.id ON DELETE CASCADE |
| `owner_type` | `TEXT` | `string` | NOT NULL |
| `owner_id` | `INTEGER` | `number` | NOT NULL |
| `record_id` | `INTEGER` | `number` | NOT NULL, FK → Records.id ON DELETE CASCADE |
| `financing_payment_id` | `INTEGER` | `number` | FK → FinancingPayments.id ON DELETE SET NULL |
| `label` | `TEXT` | `string` | NOT NULL |
| `date` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `amount_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `share_percent` | `REAL` | `number` | NOT NULL |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `People`, `Records`, `Records.RecordTypes`, `Records.Groups`, `Records.Categories`, `Records.PaymentMethods`, `Records.PaymentMethods.PaymentTypes`, `Records.Fixed`, `Records.Fixed.RecordTypes`, `Records.Fixed.Categories`, `Records.Fixed.PaymentMethods`, `Records.Fixed.PaymentMethods.PaymentTypes`, `Records.PaidCredits`, `Records.PaidCredits.Groups`, `Records.PaidCredits.PaymentMethods`, `Records.PaidCredits.PaymentMethods.PaymentTypes`, `Records.Savings`, `Records.People`, `FinancingPayments`, `FinancingPayments.Financings`, `FinancingPayments.Financings.PaymentMethods`, `FinancingPayments.Financings.PaymentMethods.PaymentTypes`, `FinancingPayments.Financings.Categories`, `FinancingPayments.Financings.RecordTypes`, `FinancingPayments.Groups`, `FinancingPayments.PaymentMethods`, `FinancingPayments.PaymentMethods.PaymentTypes`

Índices:
- `idx_shared_allocations_person_date` (person_id, date) WHERE deleted_at IS NULL
- `idx_shared_allocations_record` (record_id) WHERE deleted_at IS NULL
- `idx_shared_allocations_owner` (owner_type, owner_id) WHERE deleted_at IS NULL

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
| `target_amount_cents` | `INTEGER` | `Cents` | kind=money |
| `target_date` | `INTEGER` | `TimestampMs` | kind=timestamp |
| `status` | `TEXT` | `string` | NOT NULL, default="active" |
| `goal_reached_at` | `INTEGER` | `TimestampMs` | kind=timestamp |
| `goal_alerted_at` | `INTEGER` | `TimestampMs` | kind=timestamp |
| `archived_at` | `INTEGER` | `TimestampMs` | kind=timestamp |
| `records_mode` | `TEXT` | `string` | NOT NULL, default="separate" |
| `contribution_rule` | `TEXT` | `string` | NOT NULL, default="none" |
| `contribution_percent_bps` | `INTEGER` | `number` |  |
| `contribution_amount_cents` | `INTEGER` | `Cents` | kind=money |
| `interest_rate_bps` | `INTEGER` | `number` |  |
| `icon` | `TEXT` | `string` |  |
| `color` | `TEXT` | `string` |  |
| `own_amount_cents` | `INTEGER` | `Cents` | kind=money |
| `shared_amount_cents` | `INTEGER` | `Cents` | kind=money |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Índices:
- `idx_savings_status` (status) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## SavingsHistory (`savings_history`)

Entidad TypeScript: `SavingsHistoryEntry`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `savings_id` | `INTEGER` | `number` | FK → Savings.id ON DELETE CASCADE |
| `person_id` | `INTEGER` | `number` | FK → People.id ON DELETE SET NULL |
| `kind` | `TEXT` | `string` | NOT NULL, default="adjustment" |
| `amount_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `previous_amount` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `new_amount` | `INTEGER` | `Cents` | NOT NULL, kind=money |
| `change_date` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `period_year` | `INTEGER` | `number` | NOT NULL, default=0 |
| `period_month` | `INTEGER` | `number` | NOT NULL, default=0 |
| `note` | `TEXT` | `string` |  |
| `record_id` | `INTEGER` | `number` | FK → Records.id ON DELETE SET NULL |
| `group_id` | `INTEGER` | `number` | FK → Groups.id ON DELETE SET NULL |
| `record_type_id` | `INTEGER` | `number` | FK → RecordTypes.id ON DELETE SET NULL |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `Savings`, `People`, `Records`, `Records.RecordTypes`, `Records.Groups`, `Records.Categories`, `Records.PaymentMethods`, `Records.PaymentMethods.PaymentTypes`, `Records.Fixed`, `Records.Fixed.RecordTypes`, `Records.Fixed.Categories`, `Records.Fixed.PaymentMethods`, `Records.Fixed.PaymentMethods.PaymentTypes`, `Records.PaidCredits`, `Records.PaidCredits.Groups`, `Records.PaidCredits.PaymentMethods`, `Records.PaidCredits.PaymentMethods.PaymentTypes`, `Records.Savings`, `Records.People`, `Groups`, `RecordTypes`

Índices:
- `idx_savings_history_saving` (savings_id) WHERE deleted_at IS NULL
- `idx_savings_history_person` (person_id) WHERE deleted_at IS NULL
- `idx_savings_history_period` (period_year, period_month) WHERE deleted_at IS NULL
- `idx_savings_history_record` (record_id) WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## SavingsSettings (`savings_settings`)

Entidad TypeScript: `SavingsSetting`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `setting_key` | `TEXT` | `string` | NOT NULL, UNIQUE |
| `record_type_id` | `INTEGER` | `number` | FK → RecordTypes.id ON DELETE SET NULL |
| `payment_method_id` | `INTEGER` | `number` | FK → PaymentMethods.id ON DELETE SET NULL |
| `category_id` | `INTEGER` | `number` | FK → Categories.id ON DELETE SET NULL |
| `trophy_color` | `TEXT` | `string` | default="#C9A227" |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `RecordTypes`, `PaymentMethods`, `PaymentMethods.PaymentTypes`, `Categories`

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## GroupClosings (`group_closings`)

Entidad TypeScript: `GroupClosing`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `group_id` | `INTEGER` | `number` | NOT NULL, FK → Groups.id ON DELETE CASCADE |
| `close_name` | `TEXT` | `string` | NOT NULL |
| `close_date` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `period_start` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `period_end` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `editable_until` | `INTEGER` | `TimestampMs` | NOT NULL, kind=timestamp |
| `status` | `TEXT` | `string` | NOT NULL, default="draft" |
| `notes` | `TEXT` | `string` |  |
| `total_available_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `total_reserve_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `total_obligations_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `result_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `total_resolution_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `remaining_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `Groups`

Índices:
- `idx_group_closings_group` (group_id, period_end) WHERE deleted_at IS NULL
- `idx_group_closings_final` (group_id) UNIQUE WHERE status = 'final' AND deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## GroupClosingLines (`group_closing_lines`)

Entidad TypeScript: `GroupClosingLine`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `closing_id` | `INTEGER` | `number` | NOT NULL, FK → GroupClosings.id ON DELETE CASCADE |
| `section` | `TEXT` | `string` | NOT NULL, default="available" |
| `kind` | `TEXT` | `string` | NOT NULL, default="manual" |
| `label` | `TEXT` | `string` | NOT NULL |
| `operation` | `TEXT` | `string` | NOT NULL, default="add" |
| `direction` | `TEXT` | `string` |  |
| `amount_cents` | `INTEGER` | `Cents` | NOT NULL, kind=money, default=0 |
| `reference_cents` | `INTEGER` | `Cents` | kind=money |
| `reason` | `TEXT` | `string` |  |
| `payment_method_id` | `INTEGER` | `number` | FK → PaymentMethods.id ON DELETE SET NULL |
| `saving_id` | `INTEGER` | `number` | FK → Savings.id ON DELETE SET NULL |
| `fixed_id` | `INTEGER` | `number` | FK → Fixed.id ON DELETE SET NULL |
| `financing_id` | `INTEGER` | `number` | FK → Financings.id ON DELETE SET NULL |
| `related_group_id` | `INTEGER` | `number` | FK → Groups.id ON DELETE SET NULL |
| `notes` | `TEXT` | `string` |  |
| `sort_order` | `INTEGER` | `number` | NOT NULL, default=0 |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `GroupClosings`, `GroupClosings.Groups`, `PaymentMethods`, `PaymentMethods.PaymentTypes`, `Savings`, `Fixed`, `Fixed.RecordTypes`, `Fixed.Categories`, `Fixed.PaymentMethods`, `Fixed.PaymentMethods.PaymentTypes`, `Financings`, `Financings.PaymentMethods`, `Financings.PaymentMethods.PaymentTypes`, `Financings.Categories`, `Financings.RecordTypes`, `Groups`

Índices:
- `idx_group_closing_lines_closing` (closing_id, section, sort_order) WHERE deleted_at IS NULL
- `idx_group_closing_lines_saving` (saving_id) WHERE deleted_at IS NULL
- `idx_group_closing_lines_payment_method` (payment_method_id) WHERE deleted_at IS NULL
- `idx_group_closing_lines_fixed` (fixed_id) WHERE deleted_at IS NULL
- `idx_group_closing_lines_financing` (financing_id) WHERE deleted_at IS NULL
- `idx_group_closing_lines_payment_unique` (closing_id, payment_method_id) UNIQUE WHERE deleted_at IS NULL AND payment_method_id IS NOT NULL AND kind IN ('card', 'account')
- `idx_group_closing_lines_saving_unique` (closing_id, saving_id) UNIQUE WHERE deleted_at IS NULL AND saving_id IS NOT NULL
- `idx_group_closing_lines_fixed_unique` (closing_id, fixed_id) UNIQUE WHERE deleted_at IS NULL AND fixed_id IS NOT NULL
- `idx_group_closing_lines_financing_unique` (closing_id, financing_id) UNIQUE WHERE deleted_at IS NULL AND financing_id IS NOT NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## ChartPreferences (`chart_preferences`)

Entidad TypeScript: `ChartPreference`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `chart_key` | `TEXT` | `string` | NOT NULL |
| `collapsed` | `INTEGER` | `boolean | number` | NOT NULL, kind=boolean, default=0 |
| `mode` | `TEXT` | `string` | default=null |
| `hidden_series` | `TEXT` | `string` | default=null |
| `data_limit` | `INTEGER` | `number` | default=null |
| `limit_from_end` | `INTEGER` | `boolean | number` | NOT NULL, kind=boolean, default=1 |
| `zoom` | `REAL` | `number` | default=null |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Índices:
- `idx_chart_preferences_key` (chart_key) UNIQUE WHERE deleted_at IS NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## ShoppingLists (`shopping_lists`)

Entidad TypeScript: `ShoppingList`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `list_name` | `TEXT` | `string` | NOT NULL |
| `status` | `TEXT` | `string` | NOT NULL, default="open" |
| `closed_at` | `INTEGER` | `TimestampMs` | kind=timestamp |
| `purchase_date` | `INTEGER` | `TimestampMs` | kind=timestamp |
| `record_id` | `INTEGER` | `number` | FK → Records.id ON DELETE SET NULL |
| `record_total_cents` | `INTEGER` | `Cents` | kind=money |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `Records`, `Records.RecordTypes`, `Records.Groups`, `Records.Categories`, `Records.PaymentMethods`, `Records.PaymentMethods.PaymentTypes`, `Records.Fixed`, `Records.Fixed.RecordTypes`, `Records.Fixed.Categories`, `Records.Fixed.PaymentMethods`, `Records.Fixed.PaymentMethods.PaymentTypes`, `Records.PaidCredits`, `Records.PaidCredits.Groups`, `Records.PaidCredits.PaymentMethods`, `Records.PaidCredits.PaymentMethods.PaymentTypes`, `Records.Savings`, `Records.People`

Índices:
- `idx_shopping_lists_status` (status) WHERE deleted_at IS NULL
- `idx_shopping_lists_record` (record_id) UNIQUE WHERE deleted_at IS NULL AND record_id IS NOT NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

## ShoppingListItems (`shopping_list_items`)

Entidad TypeScript: `ShoppingListItem`

| Columna | SQL | TS | Notas |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `number` | PK, autoincrement |
| `shopping_list_id` | `INTEGER` | `number` | NOT NULL, FK → ShoppingLists.id ON DELETE CASCADE |
| `item_name` | `TEXT` | `string` | NOT NULL |
| `price_cents` | `INTEGER` | `Cents` | kind=money |
| `quantity` | `REAL` | `number` |  |
| `unit` | `TEXT` | `string` |  |
| `is_checked` | `INTEGER` | `boolean | number` | NOT NULL, kind=boolean, default=0 |
| `sort_order` | `INTEGER` | `number` | NOT NULL, default=0 |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `deleted_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `ShoppingLists`, `ShoppingLists.Records`, `ShoppingLists.Records.RecordTypes`, `ShoppingLists.Records.Groups`, `ShoppingLists.Records.Categories`, `ShoppingLists.Records.PaymentMethods`, `ShoppingLists.Records.PaymentMethods.PaymentTypes`, `ShoppingLists.Records.Fixed`, `ShoppingLists.Records.Fixed.RecordTypes`, `ShoppingLists.Records.Fixed.Categories`, `ShoppingLists.Records.Fixed.PaymentMethods`, `ShoppingLists.Records.Fixed.PaymentMethods.PaymentTypes`, `ShoppingLists.Records.PaidCredits`, `ShoppingLists.Records.PaidCredits.Groups`, `ShoppingLists.Records.PaidCredits.PaymentMethods`, `ShoppingLists.Records.PaidCredits.PaymentMethods.PaymentTypes`, `ShoppingLists.Records.Savings`, `ShoppingLists.Records.People`

Índices:
- `idx_shopping_list_items_list` (shopping_list_id, sort_order) WHERE deleted_at IS NULL

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
| `vehicle_type` | `TEXT` | `string` | NOT NULL, default="sedan" |
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
| `volume` | `REAL` | `number` |  |
| `volume_unit` | `TEXT` | `string` | NOT NULL, default="gal" |
| `price_per_unit` | `INTEGER` | `Cents` | kind=money |
| `total_cost` | `INTEGER` | `Cents` | kind=money |
| `is_full_tank` | `INTEGER` | `boolean | number` | NOT NULL, kind=boolean, default=1 |
| `is_baseline` | `INTEGER` | `boolean | number` | NOT NULL, kind=boolean, default=0 |
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
| `record_type_id` | `INTEGER` | `number` | FK → RecordTypes.id ON DELETE SET NULL |
| `created_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |
| `updated_at` | `INTEGER` | `TimestampMs` | kind=timestamp, default=null |

Relaciones navegables: `Categories`, `PaymentMethods`, `PaymentMethods.PaymentTypes`, `RecordTypes`

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

Relaciones navegables: `Records`, `Records.RecordTypes`, `Records.Groups`, `Records.Categories`, `Records.PaymentMethods`, `Records.PaymentMethods.PaymentTypes`, `Records.Fixed`, `Records.Fixed.RecordTypes`, `Records.Fixed.Categories`, `Records.Fixed.PaymentMethods`, `Records.Fixed.PaymentMethods.PaymentTypes`, `Records.PaidCredits`, `Records.PaidCredits.Groups`, `Records.PaidCredits.PaymentMethods`, `Records.PaidCredits.PaymentMethods.PaymentTypes`, `Records.Savings`, `Records.People`, `VehicleFuelEntries`, `VehicleFuelEntries.Vehicles`, `VehicleMaintenance`, `VehicleMaintenance.Vehicles`

Índices:
- `idx_vehicle_expense_links_record` (record_id) UNIQUE
- `idx_vehicle_expense_links_fuel` (fuel_entry_id) UNIQUE WHERE fuel_entry_id IS NOT NULL
- `idx_vehicle_expense_links_maintenance` (maintenance_id) UNIQUE WHERE maintenance_id IS NOT NULL

Triggers de auditoría: `created_at`/`updated_at` gestionados automáticamente.

