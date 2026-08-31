# Resumen de la base de datos

Basado en el esquema definido en [src/db/schema.ts](src/db/schema.ts) y la migración [src/db/migrations/AlterRecordsAddPaidCredit.ts](src/db/migrations/AlterRecordsAddPaidCredit.ts).

## Tipos de datos usados
- `INTEGER`: identificadores, años, meses, días, fechas y claves foráneas.
- `REAL`: montos, metas y valores monetarios.
- `TEXT`: nombres, colores, efectos y descripciones.
- Restricciones comunes: `PRIMARY KEY`, `AUTO INCREMENT`, `NOT NULL`, `UNIQUE` y `DEFAULT`.

## Tablas principales
- `Groups`: agrupa registros por periodo y objetivo.
- `PaymentTypes`: define los tipos de métodos de pago.
- `PaymentMethods`: métodos de pago asociados a un tipo.
- `Categories`: categorías para clasificar operaciones.
- `RecordTypes`: tipos de movimientos con efecto.
- `Fixed`: gastos o ingresos fijos recurrentes.
- `Records`: registros principales de movimientos.
- `PaidCredits`: pagos de créditos realizados.
- `BudgetTemplates`: plantillas de presupuesto.
- `BudgetTemplateItems`: elementos de una plantilla de presupuesto.
- `Budgets`: presupuesto asignado por tipo, grupo y categoría.
- `Savings`: metas o cuentas de ahorro.
- `SavingsHistory`: historial de cambios en ahorros.
- `Migrations`: registro de migraciones aplicadas.

## Relaciones principales
- `PaymentMethods` → `PaymentTypes`
- `Fixed` → `RecordTypes`, `Categories`, `PaymentMethods`
- `Records` → `RecordTypes`, `Groups`, `Categories`, `PaymentMethods`, `Fixed`
- `PaidCredits` → `Groups`, `PaymentMethods`
- `BudgetTemplateItems` → `BudgetTemplates`, `RecordTypes`, `Categories`
- `Budgets` → `RecordTypes`, `Groups`, `Categories`
- `SavingsHistory` → `Savings`

## Resumen conceptual
La base de datos está orientada a la gestión financiera personal, permitiendo controlar:
- ingresos y egresos,
- presupuestos,
- gastos fijos,
- métodos de pago,
- créditos pagados,
- ahorros y su historial.
