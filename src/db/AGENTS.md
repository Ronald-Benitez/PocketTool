# AGENTS.md — src/db

Reglas locales de datos. El procedimiento está en la skill `pockettool-db` y la
referencia en [`../../docs/database.md`](../../docs/database.md).

- `src/db/schema/tables.ts` es la única fuente de verdad del esquema.
  Nombres lógicos PascalCase y físicos snake_case; incluye `kind` semántico y la
  entidad TypeScript.
- `src/db/schema/generated/` y `docs/schema.md` se generan con
  `npm run db:generate`. **No los edites a mano.**
- Al cambiar el esquema: edita `tables.ts`, sube `SCHEMA_VERSION`, crea la
  migración en `src/db/migrations/`, actualiza zod y regenera artefactos.
- Migraciones: transacción exclusiva, registrar después del commit, propagar
  errores. `ensureSchema` es la red de seguridad y nunca multiplica por 100 una
  columna monetaria entera.
- `src/db/schema/apply.ts` normaliza y reconstruye tablas; `migration.ts` hace
  bootstrap, pragmas y runner.
- Dinero en centavos enteros; fechas en milisegundos; soft delete con
  `deleted_at`; auditoría con triggers.
- La UI y los stores usan repositorios de `src/db/repositories/`; nunca SQL
  directo ni `useORM` fuera de la capa de datos.
- Las entradas se validan con zod en `src/validation/entities.ts`.
- Errores: `mapDatabaseError` + `DatabaseMappedError` con código explícito. No
  silencies errores de SQLite.
- Los repositorios que mueven dinero deben crear, vincular o omitir `Records`
  dentro de la misma transacción. Ver skill `pockettool-records`.
- Backups: dump SQL con metadatos versionados; import con validación, backup
  previo y transacción.
- Al cambiar la base de datos actualiza `docs/database.md` y ejecuta
  `npm run test:db`.
