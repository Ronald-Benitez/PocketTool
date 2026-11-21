# AGENTS.md

Contexto e instrucciones para agentes que trabajen en PocketTool.

## Objetivo

PocketTool es una app Expo/React Native de finanzas personales con SQLite local.
Gestiona grupos, registros, presupuestos, compromisos, métodos de pago, créditos,
ahorros, personas y vehículo.

## Estado actual

El estado vigente, la fase activa y el histórico viven en
[`docs/phases.md`](docs/phases.md). No repitas el estado de las fases en este
archivo.

## Flujo de trabajo

| Situación | Acción |
| --- | --- |
| Nueva funcionalidad o cambio grande | `/nueva-funcionalidad` (modo plan) |
| Pantallas, componentes, formularios, modales, tema | Skill `pockettool-ui` |
| Esquema, migraciones, repositorios, ORM | Skill `pockettool-db` |
| Cálculos, dinero, reglas de negocio | Skill `pockettool-domain` |
| Cualquier flujo que mueva dinero | Skill `pockettool-records` (autodetecta) |
| Cualquier cambio visible al usuario | Skill `pockettool-help` (obligatorio) |
| Cerrar la fase activa | `/cerrar-fase` |
| Notas de Play, novedades in-app y versión | `/notas-version <versión>` |
| Auditar documentación | `/docs-audit` |
| Verificación completa | `/verificar` o los comandos de abajo |

Las skills contienen el procedimiento; este archivo contiene solo reglas. No
dupliques arquitectura ni checklists aquí.

## Reglas no negociables

- **Dinero:** integer cents en SQLite. La UI convierte con `src/utils`; nunca
  guardes dólares en columnas monetarias.
- **Fechas:** Unix milliseconds para `date`, `change_date`, `applied_at` y
  `deleted_at`.
- **Borrado:** soft delete con `deleted_at`; ORM y repositorios excluyen filas
  borradas por defecto.
- **Tablas:** nombre lógico PascalCase, nombre físico snake_case.
- **Acceso a datos:** UI y stores usan repositorios; nunca SQL directo ni
  `useORM` en UI.
- **Validación:** las entradas de repositorio se validan con zod; el ORM rechaza
  columnas inexistentes con errores tipados.
- **Auditoría:** `created_at`/`updated_at` se llenan con triggers; no los asignes
  manualmente salvo por un valor histórico explícito.
- **Migraciones:** transacción exclusiva, registrar solo después del commit,
  propagar errores al runner, nunca capturarlos internamente.
- **Errores de base de datos:** envuelve con `mapDatabaseError` de
  `src/db/errors.ts` y lanza `DatabaseMappedError` con un código explícito
  (`DB_MIGRATION_REQUIRED`, `DB_DUPLICATE`, `DB_REQUIRED`, `DB_FOREIGN_KEY`,
  `DB_UNKNOWN`). La UI traduce `dbErrors.<code>` y muestra el detalle real en
  `__DEV__`. Nunca muestres “la acción no se pudo completar”.
- **UI:** los componentes nuevos van en `src/ui`; las pantallas no usan
  `TextInput`, `Modal`, `Alert` ni `ToastAndroid` de React Native.
- **Colores:** no hardcodees colores. Usa tokens semánticos de `useTheme()`. Un
  color nuevo se registra en `ThemeColorTokens`, `bright.base.json`,
  `dark.base.json`, `COLOR_GROUPS` y `COLOR_LABELS_ES`.
- **Navegación:** cada sección del drawer es un grupo `app/(...)/` con
  `StackBase` y `Tabs.Screen`. No crees un `Stack` interno dentro de una sección.
- **Idiomas:** `src/lang/messages/` es la fuente de verdad, con inglés y español
  co-localizados. `t()` se tipa con `TranslationKey`. No agregues JSON de
  traducciones.
- **Ayuda:** todo cambio visible al usuario actualiza la ayuda bilingüe en el
  mismo cambio. No esperes a que el usuario lo pida.
- **Novedades:** el catálogo de “Qué hay de nuevo” es manual y versionado. Cada
  entrega actualiza catálogo, textos y notas de Play con `/notas-version`; nunca
  se generan en tiempo de ejecución.
- **Plataformas:** Android e iOS. Web no es objetivo de soporte; no agregues
  ramas, polyfills ni fallbacks para web.
- **Documentación:** lee por secciones. No leas `docs/legacy/*` completos ni
  `docs/schema.md` completo; usa resúmenes, índices y rangos.

## Integración con Registros

Toda operación que represente entrada, salida, pago, transferencia, aporte,
retiro o movimiento de cuentas debe evaluarse con la skill
`pockettool-records`. Si aplica, ofrece crear, vincular o omitir
(`record_id = null`). La UI no escribe `Records`: el repositorio del agregado lo
hace en la misma transacción. Al vincular, valida monto/fecha y excluye
registros ya vinculados; al eliminar, conserva el registro y quita solo el
vínculo salvo confirmación. Mantén los defaults históricos (Vehículo crea;
Financiamientos no vincula), reutiliza los pickers existentes y agrega pruebas
de monto/fecha, exclusión y transaccionalidad.

## Verificación

```bash
npm run typecheck
npm run test:db
npm test
npm run lint
npm run db:generate
npm run doctor
npm run docs:audit
npm run ci
```

- `db:generate` es obligatorio después de editar `src/db/schema/tables.ts`.
  `src/db/schema/generated/` y `docs/schema.md` se sobrescriben.
- `test:db` usa `node:sqlite` para migraciones, seed, ORM, triggers, backups,
  validación y créditos.
- `doctor` se ejecuta antes de cerrar una fase o entregar cambios de Expo; no
  sustituye typecheck, Jest, `test:db` ni lint.
- `docs:audit` falla si `AGENTS.md`, `docs/phases.md`, arquitectura, skills o
  comandos exceden su presupuesto; también advierte por índice, enlaces, anclas
  y cabeceras faltantes.

## Mapa de contexto

| Necesitas | Lee | Skill |
| --- | --- | --- |
| UI, tema, formularios, modales, filtros | `src/ui/AGENTS.md`, `docs/architecture/ui.md` | `pockettool-ui` |
| Esquema, migraciones, ORM, repositorios | `src/db/AGENTS.md`, `docs/database.md` | `pockettool-db` |
| Dominio, dinero, presupuestos, créditos, ahorros, vehículo | `src/domain/AGENTS.md`, `docs/architecture/domains.md` | `pockettool-domain` |
| Navegación y pantallas | `app/AGENTS.md` | `pockettool-ui` |
| Traducciones y centro de ayuda | `src/lang/AGENTS.md` | `pockettool-help` |
| Registros y operaciones con dinero | `src/db/AGENTS.md` | `pockettool-records` |
| Notas de Play y novedades in-app | `src/release-notes/AGENTS.md` | `pockettool-release` |
| Experiencia, flags y dependencias entre módulos | `docs/architecture/features.md`, `docs/architecture/dependencies.md` | `pockettool-ui` |
| Histórico de fases | `docs/legacy/AGENTS.md` | — |

## Documentación

El índice completo vive en [`docs/README.md`](docs/README.md). Lee por secciones;
no leas `docs/legacy/*` completos ni `docs/schema.md` completo. Skills:
`.opencode/skills/<id>/SKILL.md`; el campo `name` debe ser exactamente el ID de la
carpeta. Los comandos viven en `.opencode/commands/`.

Al cerrar una fase: actualiza `docs/phases.md` y el índice de `docs/README.md`,
archiva el plan en `docs/legacy/` con resumen e índice de secciones, actualiza la
ayuda si cambió el comportamiento visible y ejecuta `/cerrar-fase`.
