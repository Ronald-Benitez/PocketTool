# AGENTS.md

Contexto e instrucciones para agentes que trabajen en PocketTool.

## Objetivo del proyecto

PocketTool es una app Expo/React Native de finanzas personales con almacenamiento
local en SQLite. La app gestiona grupos, registros, presupuestos, gastos fijos,
métodos de pago, créditos, ahorros y vehículo.

## Estado actual

- **Fase 0 — Correcciones críticas: FINALIZADA** (2026-10-28).
- **Fase 1 — Fuente única de verdad del esquema: FINALIZADA** (2026-10-28).
- **Fase 2 — Repositorios y ORM robusto: FINALIZADA** (2026-10-28).
- **Fase 3 — Calidad, pruebas y operación: FINALIZADA** (2026-10-28).

El plan completo, el detalle de lo ejecutado y los criterios de aceptación viven
en [`docs/phases.md`](docs/phases.md). **Cada vez que se complete una fase hay
que actualizar ese documento y marcar la fase como finalizada**, incluyendo fecha,
commits relevantes, archivos tocados y verificaciones realizadas.

## Arquitectura de datos

- `src/db/schema/tables.ts`: `APP_SCHEMA`, única fuente de verdad del esquema.
  Nombres lógicos PascalCase (`Records`, `PaymentMethods`, `Fixed`, etc.) y
  nombres físicos snake_case (`records`, `payment_methods`, `fixed_records`, etc.).
  Incluye metadatos semánticos (`kind: 'money' | 'timestamp' | 'boolean'`) y el
  nombre de la entidad TypeScript.
- `src/db/schema/generated/`: artefactos generados desde `tables.ts`
  (`schema.sql`, `types.ts`, `relations.json`, `columns.json`). **No editar a
  mano.**
- `scripts/generate-db-artifacts.js`: generador de artefactos (`npm run db:generate`).
- `src/db/schema/seed.ts`: seed idempotente de datos de referencia y ejemplo.
- `src/db/schema/apply.ts`: normalización/rebuild de tablas, conversiones legacy
  e índices.
- `src/db/migration.ts`: bootstrap, pragmas y runner de migraciones.
- `src/db/migrations/0001_baseline.ts`: baseline consolidado.
- `src/db/migrations/0002_audit_timestamps.ts`: migración incremental de auditoría.
- `src/db/migrations/0003_timestamp_triggers.ts`: triggers de `created_at`/`updated_at`.
- `src/orm/index.ts`: ORM tipado; usa las relaciones generadas, filtros de soft
  delete, CRUD y transacciones.
- `src/orm/errors.ts`: errores tipados (`InvalidIdentifierError`,
  `InvalidDataError`, `QueryError`).
- `src/db/repositories/index.ts`: repositorios por agregado.
- `src/db/repositories/fuel.ts`: consultas tipadas de combustible y viajes.
- `src/db/utils/sql-dump.ts`: generación/validación del dump SQL.
- `src/db/utils/backup.ts`: metadatos versionados del backup.
- `src/validation/entities.ts`: esquemas zod para entradas de repositorio.
- `src/db/index.ts`: barrel público; expone `useRecords`, `useGroups`, etc.
- `.github/workflows/ci.yml`: typecheck, tests, artefactos de esquema y lint no
  bloqueante.
- `src/interfaces/schema.ts`: entidades generadas + relaciones/vistas.
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
- Los componentes y stores deben usar repositorios; no SQL directo ni `useORM` en UI.
- Las entradas de repositorio se validan con zod y el ORM rechaza columnas
  inexistentes con errores tipados.
- `created_at` y `updated_at` se llenan con triggers; no asignarlos manualmente
  salvo que se requiera un valor histórico explícito.
- Export/import: usar validación, backup previo y transacción. No dropear tablas
  fuera de una transacción.
- Migraciones: no capturar errores internamente; deben propagarse al runner.
  Registrar la migración solo después del commit.

## Comandos de verificación

```bash
npm run typecheck
npm run test:db
npm test
npm run db:generate
npm run ci
```

`npm run db:generate` debe ejecutarse después de editar
`src/db/schema/tables.ts`. Los archivos de `src/db/schema/generated/` y
`docs/schema.md` se sobrescriben.

- `test:db`: suite de migraciones/ORM/backup con `node:sqlite`.
- `test`: Jest.
- `ci`: typecheck + tests de base de datos + Jest.
- `lint`: ESLint (`npm run lint`); forma parte de CI y debe pasar.

## Documentación

- [`docs/README.md`](docs/README.md): índice de documentación.
- [`docs/phases.md`](docs/phases.md): plan de fases, estado y bitácora.
- [`docs/schema.md`](docs/schema.md): esquema generado.
- [`db.md`](db.md): resumen de tablas, relaciones y convenciones de la base.
- [`README.md`](README.md): descripción general y ejecución del proyecto.
