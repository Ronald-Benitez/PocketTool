---
name: pockettool-db
description: Cambia el esquema SQLite, migraciones, artefactos generados, ORM, repositorios, validación zod y errores de base de datos de PocketTool. Úsala al tocar src/db/, src/validation/, backups o cualquier tabla o consulta.
---

# PocketTool DB

## En modo plan

1. Define el cambio de modelo: tablas, columnas, tipos, `kind`, FKs, índices,
   defaults y soft delete.
2. Decide la migración: número, nombre, backfill, tablas legacy y si necesita
   `ensureSchema`.
3. Identifica repositorios, zod y pruebas afectadas; define cómo se conservan
   los datos existentes.
4. Revisa el impacto en Registros con `pockettool-records` si se mueve dinero.
5. Enumera actualizaciones de `docs/database.md` y de la ayuda si el cambio es
   visible.
6. No edites archivos; entrega migración, archivos y pruebas.

## En modo build

1. Edita `src/db/schema/tables.ts` (fuente única). Nombres lógicos PascalCase,
   físicos snake_case, `kind` semántico y entidad TypeScript.
2. Sube `SCHEMA_VERSION` y crea `src/db/migrations/00XX_nombre.ts`. La migración
   corre en transacción exclusiva, no captura errores y se registra después del
   commit.
3. Si hay columnas nuevas o normalización, revisa `src/db/schema/apply.ts`.
   `ensureSchema` nunca multiplica por 100 una columna monetaria entera.
4. Ejecuta `npm run db:generate` y revisa el diff de
   `src/db/schema/generated/` y `docs/schema.md`.
5. Actualiza zod en `src/validation/entities.ts`.
6. Implementa o ajusta el repositorio en `src/db/repositories/`. La UI y los
   stores no usan SQL ni `useORM` directo.
7. Envuelve operaciones con `mapDatabaseError` de `src/db/errors.ts` y lanza
   `DatabaseMappedError` con código explícito. No silencies errores.
8. Si la operación mueve dinero, crea/vincula/omite `Records` en la misma
   transacción (skill `pockettool-records`).
9. Agrega pruebas en `scripts/db-tests.js` y Jest según corresponda.
10. Actualiza `docs/database.md` y ejecuta `npm run test:db`, `npm test`,
    `npm run typecheck` y `npm run lint`.

## Reglas

- Dinero: integer cents. Fechas: milisegundos Unix. Borrado: `deleted_at`.
- `created_at`/`updated_at` se llenan con triggers.
- Backups: dump SQL con metadatos versionados; import con validación, backup
  previo y transacción.
- No edites `src/db/schema/generated/` ni `docs/schema.md` a mano.

## Referencias

- `src/db/AGENTS.md`
- `docs/database.md`
- `docs/schema.md` (leer por tabla)
- `src/db/migrations/`
