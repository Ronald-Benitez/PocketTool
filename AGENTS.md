# AGENTS.md

Contexto e instrucciones para agentes que trabajen en PocketTool.

## Objetivo del proyecto

PocketTool es una app Expo/React Native de finanzas personales con almacenamiento
local en SQLite. La app gestiona grupos, registros, presupuestos, gastos fijos,
métodos de pago, créditos, ahorros y vehículo.

## Estado actual

- **Fase 0 — Correcciones críticas: FINALIZADA** (2026-10-28).
- **Fase 1 — Fuente única de verdad del esquema: PENDIENTE**.
- **Fase 2 — Repositorios y ORM robusto: PENDIENTE**.
- **Fase 3 — Calidad, pruebas y operación: PENDIENTE**.

El plan completo, el detalle de lo ejecutado y los criterios de aceptación viven
en [`docs/phases.md`](docs/phases.md). **Cada vez que se complete una fase hay
que actualizar ese documento y marcar la fase como finalizada**, incluyendo fecha,
commits relevantes, archivos tocados y verificaciones realizadas.

## Arquitectura de datos

- `src/db/schema.ts`: `APP_SCHEMA`, única fuente de verdad del esquema. Nombres
  lógicos PascalCase (`Records`, `PaymentMethods`, `Fixed`, etc.) y nombres
  físicos snake_case (`records`, `payment_methods`, `fixed_records`, etc.).
- `src/db/migration.ts`: normalización de bases legacy, conversión de dinero a
  centavos, fechas a milisegundos, soft delete, índices y seed.
- `src/db/migrations/`: migraciones incrementales posteriores al baseline.
- `src/orm/index.ts`: ORM tipado, joins automáticos desde `relations.json`,
  filtros de soft delete y CRUD.
- `src/db/repositories/index.ts`: repositorios por agregado.
- `src/db/index.ts`: barrel público; expone `useRecords`, `useGroups`, etc.
- `src/interfaces/schema.ts`: entidades canónicas y vistas aplanadas.
- `src/utils/index.ts`: helpers de dinero (`parseMoneyToCents`, `centsToInput`,
  `formatMoney`, `formatMoneyWithSymbol`).

## Convenciones obligatorias

- Dinero: **integer cents** en SQLite. La UI convierte con los helpers; nunca
  guardar dólares en columnas monetarias.
- Fechas: **Unix milliseconds** para `date`, `change_date`, `applied_at` y
  `deleted_at`.
- Borrado: soft delete con `deleted_at`; el ORM y los repositorios excluyen
  filas borradas por defecto.
- Tablas: nombre lógico PascalCase, nombre físico snake_case.
- No volver a introducir handlers raw-SQL ni un segundo `useRecords`.
- Los componentes y stores deben usar repositorios/ORM; no SQL directo en UI.
- Export/import: usar validación, backup previo y transacción. No dropear tablas
  fuera de una transacción.
- Migraciones: no capturar errores internamente; deben propagarse al runner.
  Registrar la migración solo después del commit.

## Comandos de verificación

```bash
npx tsc --noEmit
```

Las pruebas de migración/ORM se ejecutan con un harness de SQLite en Node
(`node:sqlite`) durante el desarrollo. Si se agregan pruebas permanentes, deben
documentarse aquí y en `docs/phases.md`.

## Documentación

- [`docs/README.md`](docs/README.md): índice de documentación.
- [`docs/phases.md`](docs/phases.md): plan de fases, estado y bitácora.
- [`db.md`](db.md): resumen de tablas, relaciones y convenciones de la base.
- [`README.md`](README.md): descripción general y ejecución del proyecto.
