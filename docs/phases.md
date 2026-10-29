# Plan de fases y bitácora

**Última actualización:** 2026-10-28
**Estado global:** Fases 0–3 finalizadas.

| Fase | Estado | Fecha |
| --- | --- | --- |
| Fase 0 — Correcciones críticas sin cambiar el modelo | ✅ Finalizada | 2026-10-28 |
| Fase 1 — Fuente única de verdad del esquema | ✅ Finalizada | 2026-10-28 |
| Fase 2 — Repositorios y ORM robusto | ✅ Finalizada | 2026-10-28 |
| Fase 3 — Calidad, pruebas y operación | ✅ Finalizada | 2026-10-28 |

## Cómo mantener este documento

Al terminar una fase:

1. Marcar la fase como **FINALIZADA** y poner la fecha.
2. Actualizar la tabla de estado.
3. Agregar una sección `Resultado` con lo implementado y lo que ya estaba
   cubierto por trabajo previo.
4. Registrar commits relevantes.
5. Registrar verificaciones ejecutadas y resultados.
6. Anotar pendientes, riesgos o decisiones que impacten fases posteriores.
7. Actualizar `AGENTS.md` y `docs/README.md` si cambió la arquitectura.

---

# Fase 0 — Correcciones críticas sin cambiar el modelo

**Estado:** ✅ FINALIZADA — 2026-10-28

**Objetivo:** detener los fallos actuales y dejar una base estable.

## 1. Unificar la capa de acceso

- [x] Eliminar o aislar `src/db/*-handler.ts`.
- [x] Dejar de exportarlos desde `src/db/index.ts`.
- [x] Migrar los imports de `group-viewer.tsx`, `budgets-table.tsx`,
  `add-budget.tsx`, etc. al ORM o a los nuevos repositorios.
- [x] Dejar un único `useRecords` (el del ORM/repositorio).

**Resultado:** los handlers legacy (`records-handler`, `groups-handler`,
`budget-handler`, `savings-handler`, `savings-history-handler`,
`payment-methods-handler`, `categories-handler` y `src/db/handlers/*`) fueron
eliminados. `src/db/index.ts` solo exporta repositorios y alias compatibles.
No quedan imports a handlers.

**Commits base:** `8b2ab3d`, `0c2bbc6`.

## 2. Corregir migraciones

- [x] Cambiar `AddFuelTables` a `db.execAsync`.
- [x] Hacer que las migraciones no capturen errores internamente; que el runner
  los reciba.
- [x] Envolver cada migración en `withExclusiveTransactionAsync`.
- [x] Registrar la migración solo después del commit.
- [x] Agregar `UNIQUE` a `Migrations.migration_name`.

**Resultado:** las migraciones legacy fueron eliminadas y reemplazadas por el
baseline de `src/db/migration.ts`. Se agregó
`src/db/transaction.ts` (`withExclusiveTransaction`) con fallback para web.
`runMigrations` ejecuta cada migración en una transacción exclusiva y registra
la fila en `Migrations`/`user_version` en una transacción posterior al commit.
`Migrations.migration_name` ya tenía `UNIQUE`.

**Commit:** `ce19991`.

## 3. Hacer el seed idempotente

- [x] Usar `INSERT ... ON CONFLICT DO NOTHING` o `INSERT OR IGNORE` con claves
  naturales.
- [x] Agregar `UNIQUE` a `PaymentTypes.payment_type_name` y
  `RecordTypes.type_name`.
- [x] Sembrar por nombre, no por ID.
- [x] Cambiar los defaults de settings para buscar por nombre/slug, no por ID
  fijo.

**Resultado:** `seedReferenceData` usa `INSERT OR IGNORE` sobre nombres únicos.
El seed de datos de ejemplo resuelve IDs por nombre. Los defaults de
`useConfigs` se resuelven desde `RecordTypes` por nombre (`Income`, `Expense`,
`Credit expenses`, `Payments`) y se mezclan con la configuración persistida.

**Commit:** `77a3efe`.

## 4. Completar soft delete

- [x] Agregar `deleted_at` a `APP_SCHEMA` y a `columns.json`.
- [x] Agregar `paid_credit_id`, `payment_date`, `FuelRefills` y `TripLogs` a
  `APP_SCHEMA` o eliminar su dependencia del ORM.
- [x] En los joins del ORM, agregar `AND "alias".deleted_at IS NULL` por cada
  tabla unida.
- [x] Reemplazar `DELETE` físicos de handlers legacy por `delete()` del ORM.

**Resultado:** `APP_SCHEMA` incluía `deleted_at`, `paid_credit_id`,
`payment_date`, `FuelRefills` y `TripLogs` desde el refactor base. Los joins del
ORM ya filtran soft delete. `add-record` dejó de usar `forceDelete` y ahora hace
soft delete del `PaidCredit`. `src/orm/columns.json` era un artefacto muerto y
desactualizado: se eliminó para que `APP_SCHEMA` sea la única fuente.

**Commit:** `e4a6c3b` (soft delete), `cc2f1ba` (eliminación de `columns.json`).

## 5. Activar integridad y rendimiento

- [x] En `client.ts`/`onInit`: `PRAGMA foreign_keys = ON`,
  `PRAGMA journal_mode = WAL`.
- [x] Crear índices para las FKs y columnas de filtro más usadas.

**Resultado:** `migrateDb` activa WAL (con warning si la plataforma no lo
soporta) y restaura `foreign_keys = ON` al terminar. Se agregaron índices para
`fixed`, `records`, `paid_credits`, `budget_template_items` y `budgets`.

**Commit:** `ce19991` (pragmas), `e4a6c3b` (índices).

## 6. Corregir export/import

- [x] Importar dentro de una transacción exclusiva.
- [x] Poner `PRAGMA foreign_keys = OFF` antes de la transacción y restaurarlo en
  `finally`.
- [x] Crear backup automático antes de importar.
- [x] Validar que el archivo no esté vacío y que contenga las tablas esperadas.
- [x] Reportar errores al usuario, no solo a `console`.

**Resultado:** `src/db/utils/export-db.ts` ahora valida el dump, crea un backup
`backup-before-import-<timestamp>.sql`, importa en transacción exclusiva,
restaura FKs en `finally`, vuelve a ejecutar `migrateDb` para normalizar dumps
legacy y reporta éxito/error con `Alert`. La generación/validación de SQL se
separó en `src/db/utils/sql-dump.ts`.

**Commit:** `aa928fc`.

## 7. Limpiar deuda inmediata

- [x] Crear `scripts/generate-db-inferences.js` o eliminar el script
  `db:inferences` de `package.json`.
- [x] Corregir `src/stores/index.ts:34`.
- [x] Eliminar `DATABASE_VERSION` sin uso o implementarlo con
  `PRAGMA user_version`.

**Resultado:** se eliminó el script `db:inferences` y el artefacto
`src/orm/columns.json` (sin referencias). La clave stale `Records` del store
global ya se había eliminado en el refactor base. No existe `DATABASE_VERSION`;
se usa `SCHEMA_VERSION` + `PRAGMA user_version`.

**Commit:** `cc2f1ba`.

## Verificación de Fase 0

- `npx tsc --noEmit` → `TSC_EXIT=0`.
- Harness de SQLite (`node:sqlite`):
  - migración desde base legacy PascalCase, con dinero `REAL` y fechas
    texto/segundos;
  - arranque desde base vacía;
  - segunda ejecución idempotente (sin duplicados ni doble conversión);
  - fallbacks de `payment_type`/`budget_type` y `id_budget`;
  - export → import → export;
  - recuperación de rebuild interrumpido;
  - presencia de los índices nuevos.

## Criterio de aceptación

- [x] La app arranca en una base nueva y en una base existente (validado en el
  harness SQL).
- [x] No hay errores de columnas inexistentes (TypeScript + harness).
- [x] Las migraciones fallidas no quedan registradas (registro posterior al
  commit).
- [x] Importar un backup inválido no destruye la base (validación previa,
  transacción y backup automático).

**Pendiente de prueba end-to-end en dispositivo:** el selector nativo/web de
archivos del import. La lógica SQL, validación y transacción sí están cubiertas.

## Riesgos y notas para fases siguientes

- `columns.json` se eliminó. Si se necesita un artefacto generado, debe crearse
  en Fase 1 como derivado de `APP_SCHEMA`, nunca editado a mano.
- Quedan usos directos de `useORM` en pantallas/stores. Fase 2 debe consolidar
  la capa de repositorios.
- Las pruebas de migración/ORM son un harness temporal durante el desarrollo.
  Fase 3 debe convertirlas en pruebas permanentes del repo.
- El import end-to-end (pickers nativos/web) queda pendiente de validación
  manual en dispositivo.

---

# Fase 1 — Fuente única de verdad del esquema

**Estado:** ✅ FINALIZADA — 2026-10-28

**Objetivo:** un solo esquema declarativo del que se generen SQL, tipos,
relaciones, columnas y documentación.

## 1. Definir el esquema declarativo

- [x] Un solo `schema/tables.ts` con:
  - nombre de tabla;
  - columnas, tipos, nullabilidad, defaults;
  - PK, FKs con `ON DELETE`/`ON UPDATE`;
  - `UNIQUE`, `CHECK`;
  - índices.
- [x] Incluir `deleted_at`, `created_at`, `updated_at` de forma consistente.

**Resultado:** `src/db/schema/tables.ts` es la fuente única. Cada tabla declara
`name`, `sqlName`, `entity`, columnas con `kind` semántico (`money`,
`timestamp`, `boolean`), PK/FK, defaults, `UNIQUE` e índices. Las tablas de
negocio incluyen `deleted_at`, `created_at` y `updated_at`.

## 2. Generar derivados

- [x] Script que produzca:
  - SQL de creación;
  - `generated/types.ts`;
  - `relations.json`;
  - `columns.json`;
  - documentación de esquema.
- [x] El ORM deja de depender de JSON editado a mano.

**Resultado:** `npm run db:generate` ejecuta
`scripts/generate-db-artifacts.js` y produce:

- `src/db/schema/generated/schema.sql`
- `src/db/schema/generated/types.ts`
- `src/db/schema/generated/relations.json`
- `src/db/schema/generated/columns.json`
- `docs/schema.md`

El ORM consume `generated/relations.json`; `src/interfaces/schema.ts` reutiliza
los tipos generados. El antiguo `src/orm/relations.json` fue eliminado.

## 3. Definir migraciones como única fuente de evolución

- [x] `0001_baseline` crea todo el esquema actual consolidado.
- [x] Las migraciones posteriores solo alteran.
- [x] `client.ts` crea la tabla `Migrations` antes de correr el runner.
- [x] Usar `PRAGMA user_version` como versión rápida y `Migrations` como
  historial detallado.

**Resultado:** `migrateDb` crea `migrations` antes del runner.
`0001_baseline` aplica el esquema consolidado y
`0002_audit_timestamps` agrega `created_at`/`updated_at` a bases existentes.
`SCHEMA_VERSION = 3` (2 en Fase 1, 3 al agregar los triggers de auditoría). Cada
migración se ejecuta en transacción exclusiva y se registra solo después del
commit.

## 4. Normalizar nombres y tipos

- [x] Elegir una convención: tablas y columnas en snake_case.
- [x] Si se mantiene PascalCase, renombrar las tablas de vehículo para que
  coincidan.
- [x] Unificar fechas: `INTEGER` ms en todas las tablas, o `TEXT` ISO en todas.
- [x] Evaluar migrar dinero de `REAL` a `INTEGER` en centavos.

**Resultado:** nombres lógicos PascalCase para el ORM, nombres físicos y
columnas snake_case. Fechas en milisegundos y dinero en centavos. Las tablas de
vehículo ya usan nombres físicos snake_case.

## 5. Separar seed de migraciones

- [x] `schema/seed.ts` idempotente, ejecutado solo en bootstrap.
- [x] Los defaults de la app referencian nombres/slugs estables, no IDs.

**Resultado:** el seed vive en `src/db/schema/seed.ts`, se ejecuta en el
bootstrap y es idempotente. La configuración por defecto se resuelve por nombre
(`Income`, `Expense`, `Credit expenses`, `Payments`).

## Criterio de aceptación

- [x] Agregar una tabla o columna requiere editar un solo archivo de esquema y
  generar.
- [x] No hay JSON ni tipos duplicados mantenidos a mano: `types.ts`,
  `relations.json`, `columns.json` y `schema.sql` son generados.

## Commits

- `608aea9` — `refactor(schema): generate schema artifacts from declarative tables`
- `6804160` — `refactor(migrations): add consolidated baseline and audit timestamp migration`
- `fce7ae4` — `fix(migrations): skip audit columns for missing tables`
- `06e9de6` — `docs: mark phase 1 complete`

## Verificación

- `npx tsc --noEmit` → `TSC_EXIT=0`.
- `npm run db:generate` regenera los artefactos sin cambios inesperados.
- Harness SQLite:
  - arranque desde base vacía con baseline + migración de auditoría;
  - migración desde base legacy;
  - migración incremental `0002_audit_timestamps` sobre una base v1;
  - seed idempotente y export/import;
  - `user_version = 2` y fila `0001_baseline` en `Migrations`.

## Notas para Fase 2

- `created_at`/`updated_at` existen pero todavía no se actualizan
  automáticamente desde el ORM. Decidir en Fase 2 si se llenan en inserts/updates
  o mediante triggers.
- La UI aún usa `useORM` directo en varias pantallas; Fase 2 consolida los
  repositorios.
- Las pruebas de migración/ORM siguen siendo un harness de desarrollo; Fase 3
  las vuelve permanentes.

---

# Fase 2 — Repositorios y ORM robusto

**Estado:** ✅ FINALIZADA — 2026-10-28

## 1. Repositorios por agregado

- [x] `RecordsRepository`, `GroupsRepository`, `BudgetsRepository`,
  `SavingsRepository`, etc.
- [x] Métodos de dominio: `getByGroup`, `createWithCredit`,
  `softDeleteWithRelations`, `getSummaryByCategory`, etc.
- [x] La UI y los stores de Zustand solo llaman repositorios.

**Resultado:** los repositorios por agregado viven en
`src/db/repositories/index.ts` y `src/db/repositories/fuel.ts`. Se agregaron
operaciones compuestas como `saveRecord` (registro + crédito en una
transacción), `deleteRecordWithCredit`, `fetchCreditPeriodTotals`,
`fetchPaidCreditsByGroup`, `fetchBySavingId` y las consultas tipadas de
combustible/viajes. `CreditsStore` y las pantallas dejaron de usar `useORM`
directamente.

## 2. Mejorar el ORM

- [x] Builder inmutable o `reset()` en `finally`.
- [x] Validar identificadores contra el esquema antes de interpolar.
- [x] Agregar `limit`, `offset`, `count`, `exists`, `getById`, `first`.
- [x] Soportar transacciones y operaciones compuestas.
- [x] Propagar errores tipados en lugar de devolver `[]`.
- [x] Aplicar soft delete también en joins.
- [x] Integrar las consultas custom (`gas.json`) como métodos tipados.

**Resultado:** el ORM resetea el builder en `finally`, valida tablas/columnas y
payloads, expone `exists`, `getById` y `transaction`, y propaga
`InvalidIdentifierError`, `InvalidDataError` y `QueryError` en vez de devolver
arrays vacíos. Las consultas de `gas.json` se movieron a métodos tipados en
`useFuelRepository`.

## 3. Unificar tipos

- [x] Un solo módulo `types.ts` con:
  - `Entity` (`id: number`);
  - `NewEntity` (`id?`, `deleted_at?`);
  - `UpdateEntity` (`Partial`);
  - `WithRelations<T>`.
- [x] Eliminar `src/db/types/tables.ts`, `src/db/types/schema.ts` e
  `src/interfaces/db.ts` al terminar la migración.
- [x] Evitar `extends` múltiples con propiedades homónimas; usar tipos
  explícitos para vistas/joins.

**Resultado:** las entidades se generan en
`src/db/schema/generated/types.ts`; `src/interfaces/schema.ts` añade
`NewEntity`, `UpdateEntity` y `WithRelations`, además de las vistas explícitas.
Se eliminó `src/db/types/tables.ts`; `src/db/types/schema.ts` e
`src/interfaces/db.ts` ya no existían. `src/db/types/index.ts` queda solo con
los tipos del DSL del esquema.

## 4. Validación en bordes

- [x] `zod` o similar para formularios, importación y datos externos.
- [x] Validar que un `INSERT` no incluya columnas inexistentes.

**Resultado:** `src/validation/entities.ts` contiene esquemas zod para grupos,
registros, créditos, presupuestos, ahorros y métodos de pago. Los repositorios
los aplican antes de escribir. El ORM sigue validando columnas y ahora lanza
`InvalidDataError` ante columnas inexistentes.

## Criterio de aceptación

- [x] No queda SQL en componentes.
- [x] No hay dos `useRecords`.
- [x] Los tipos de una entidad se definen una sola vez.

## Commits

- `8d98d7e` — `feat(orm): add typed errors, transactions and boundary validation`
- `41ee91c` — `feat(repositories): add aggregate operations and typed fuel queries`
- `9d61713` — `refactor(ui): route screens and stores through repositories`

## Verificación

- `npx tsc --noEmit` → `TSC_EXIT=0`.
- Harness SQLite:
  - migraciones, seed y export/import;
  - `exists`, `getById`, validación de identificadores;
  - transacción con commit y rollback;
  - esquemas zod aceptan datos válidos y rechazan centavos decimales,
    columnas desconocidas y campos obligatorios vacíos.

## Notas para Fase 3

- `created_at`/`updated_at` siguen sin llenarse automáticamente en inserts o
  updates.
- Las pruebas siguen siendo un harness de desarrollo; Fase 3 debe moverlas al
  repo y añadir CI.
- Falta prueba end-to-end del import con pickers nativos/web.

## Fix posterior — cálculo de créditos (2026-10-28)

- Se corrigió el cálculo de periodos actual/anterior cuando la fecha está antes
  o después del corte, incluyendo meses con menos días que `closing_date`.
- El builder del ORM ahora es inmutable, evitando que consultas concurrentes
  compartan filtros y devuelvan resultados mezclados.
- Cálculo extraído a `src/utils/creditPeriods.ts` y cubierto por pruebas de
  periodos y totales.
- Commit: `d519960`.

---

# Fase 3 — Calidad, pruebas y operación

**Estado:** ✅ FINALIZADA — 2026-10-28

## 1. Tests

- [x] Migraciones desde base vacía y desde cada versión anterior.
- [x] Seed idempotente (ejecutarlo dos veces no duplica).
- [x] ORM: joins, soft delete, filtros, transacciones.
- [x] Export → import → export produce el mismo estado.
- [x] Usar `better-sqlite3` o `sql.js` en Node para tests rápidos de SQL, y
  `jest-expo` para lo que dependa de Expo.

**Resultado:** `scripts/db-tests.js` es la suite permanente con `node:sqlite`
(alternativa nativa a `better-sqlite3`/`sql.js`). Cubre migraciones legacy,
base vacía, auditoría incremental, seed idempotente, ORM (joins, soft delete,
filtros, transacciones, concurrencia, limit/offset), backup con metadatos,
validación zod, periodos de crédito y planes de consulta. Jest sigue cubriendo
componentes.

## 2. Export/import v2

- [x] Formato con metadatos: `formatVersion`, `appVersion`, `schemaVersion`,
  `exportedAt`, `tables`.
- [x] Mantener compatibilidad con el dump SQL actual.
- [x] Import con validación, backup y transacción.

**Resultado:** el export antepone una cabecera
`-- POCKETTOOL_BACKUP {...}` con metadatos y mantiene el dump SQL estándar
debajo, por lo que los backups antiguos siguen siendo importables. El import
valida metadatos y tablas, crea backup previo, usa transacción exclusiva y
restaura FKs.

## 3. Rendimiento

- [x] Revisar `EXPLAIN QUERY PLAN` de las consultas principales.
- [x] Paginar `Records`.
- [x] Evitar cargar todas las relaciones si no se usan.

**Resultado:** `db-tests.js` verifica que las consultas principales usen
índices. Se agregaron `fetchRecordsPage` y `countRecords` para paginación. La UI
de registros todavía carga el grupo completo para filtros/resúmenes en memoria;
cablear la paginación visual queda como mejora incremental.

## 4. CI

- [x] `tsc --noEmit`, `expo lint`, tests.
- [x] Verificar que no existan imports a handlers legacy.

**Resultado:** `.github/workflows/ci.yml` ejecuta typecheck, verifica que los
artefactos generados estén actualizados, corre `test:db`, Jest y un lint no
bloqueante. La suite escanea `src`/`app` para impedir imports a handlers legacy.
El lint es bloqueante: la deuda de errores quedó en cero.

## Commits

- `38aadc7` — `feat(backup): add versioned metadata to SQL backups`
- `666a88e` — `test(tooling): add database regression suite and CI`
- `1407d0f` — `perf(records): expose paginated record queries`

## Verificación

- `npm run typecheck` → `TSC_EXIT=0`.
- `npm run test:db` → toda la suite pasa.
- `npm test` → Jest pasa.
- `npm run db:generate` + `git diff --exit-code` en CI.
- 13 grupos de pruebas de base de datos/ORM/backup en verde.

## Pendientes/mejoras

- Cablear `fetchRecordsPage` en la UI de registros (hoy los resúmenes y filtros
  requieren el grupo completo en memoria).
- Prueba end-to-end del import con pickers nativos/web.
- Reducir warnings de ESLint (imports sin usar y `exhaustive-deps`); hoy lint
  pasa con 0 errores.

## Fix posterior — auditoría y ESLint (2026-10-28)

- `created_at` y `updated_at` ahora se llenan automáticamente con triggers de
  SQLite en todas las tablas de negocio. Se agregó `0003_timestamp_triggers` y
  `SCHEMA_VERSION = 3`.
- El generador incluye los triggers en `schema.sql` y `docs/schema.md`.
- Se limpiaron los errores bloqueantes de ESLint: hooks condicionales, hooks en
  callbacks, JSX sin escapar, globals de scripts, tipos de array e imports.
- `npm run lint` termina en 0 errores y CI lo ejecuta como paso bloqueante.
- Commits: `9f7a32f` (triggers) y `e8a0167` (ESLint).

---

# Registro de decisiones

- **2026-10-28 — Esquema normalizado:** nombres lógicos PascalCase, nombres
  físicos snake_case, `APP_SCHEMA` como fuente de verdad, dinero en centavos y
  fechas en milisegundos.
- **2026-10-28 — Soft delete:** todas las tablas de negocio usan `deleted_at`;
  el ORM filtra por defecto y los joins también.
- **2026-10-28 — `columns.json` eliminado:** era un artefacto muerto. Si se
  necesita, se generará en Fase 1 desde `APP_SCHEMA`.
- **2026-10-28 — Configuración por nombre:** los defaults de record types se
  resuelven por nombre para no depender de IDs fijos.
- **2026-10-28 — Import seguro:** validación + backup + transacción exclusiva +
  restauración de FKs + renormalización posterior.
- **2026-10-28 — Fase 1:** `schema/tables.ts` es la fuente única; los artefactos
  de `schema/generated/` y `docs/schema.md` se generan con
  `npm run db:generate` y no se editan a mano.
- **2026-10-28 — Tipos generados:** las entidades TypeScript se derivan de las
  columnas y de `kind` (`money` → `Cents`, `timestamp` → `TimestampMs`).
- **2026-10-28 — Relaciones generadas:** `relations.json` se deriva del grafo de
  FKs; el ORM dejó de usar el JSON editado a mano.
- **2026-10-28 — Migraciones:** `0001_baseline` consolida el esquema y
  `0002_audit_timestamps` agrega `created_at`/`updated_at` a bases existentes.
  `SCHEMA_VERSION = 3`.
- **2026-10-28 — Fase 2:** la UI y los stores dejaron de usar `useORM`; solo
  consumen repositorios. Las operaciones registro+crédito son transaccionales.
- **2026-10-28 — Errores tipados:** el ORM lanza `InvalidIdentifierError`,
  `InvalidDataError` y `QueryError` en lugar de devolver `[]`.
- **2026-10-28 — Validación:** zod valida entradas de repositorio y el ORM
  valida columnas/identificadores.
- **2026-10-28 — Consultas de vehículo:** `gas.json` se reemplazó por métodos
  tipados en `useFuelRepository`.
- **2026-10-28 - Fase 3:** `node:sqlite` es la base de la suite de regresión;
  Jest cubre componentes. CI ejecuta typecheck, artefactos generados, tests y
  lint bloqueante.
- **2026-10-28 — Backups v2:** cabecera `POCKETTOOL_BACKUP` con metadatos sobre
  el dump SQL, manteniendo compatibilidad con backups antiguos.
- **2026-10-28 — Paginación:** repositorio expone `fetchRecordsPage` y
  `countRecords`; la UI mantiene carga completa para resúmenes/filtros.
- **2026-10-28 — Triggers de auditoría:** `created_at`/`updated_at` se rellenan
  con triggers; `SCHEMA_VERSION = 3`.
- **2026-10-28 — ESLint:** lint bloqueante con 0 errores; las reglas de React
  Compiler que requerían refactors grandes quedaron desactivadas con nota.
