# AGENTS.md

Contexto e instrucciones para agentes que trabajen en PocketTool.

## Objetivo

PocketTool es una app Expo/React Native de finanzas personales con SQLite local.
Gestiona grupos, registros, presupuestos, compromisos, métodos de pago, créditos,
ahorros, personas y vehículo.

## Estado actual

Todas las fases 0–11 están finalizadas (2026-11-04). El estado vigente, la fase
activa y el histórico viven en [`docs/phases.md`](docs/phases.md). No repitas el
estado de las fases en este archivo.

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
| Notas de Google Play | `/notas-version <versión>` |
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
- **Plataformas:** Android e iOS. Web no es objetivo de soporte; no agregues
  ramas, polyfills ni fallbacks para web.
- **Documentación:** lee por secciones. No leas `docs/legacy/*` completos ni
  `docs/schema.md` completo; usa resúmenes, índices y rangos.

## Integración con Registros

Toda operación que represente entrada, salida, pago, transferencia, aporte,
retiro o cualquier movimiento que afecte las cuentas del mes debe evaluarse con
la skill `pockettool-records`. Si aplica, debe ofrecer siempre:

1. Crear un registro nuevo en `Records`.
2. Vincular un registro existente.
3. No vincular (`record_id = null`).

Reglas clave:

- La UI no escribe `Records`: el repositorio del agregado crea, actualiza o
  vincula dentro de la misma transacción que guarda la operación.
- Al vincular, valida que **monto** y **fecha** coincidan y excluye registros ya
  vinculados a vehículo, financiamientos, ahorros o créditos. Un registro no
  puede representar dos gastos.
- Al eliminar, conserva el registro por defecto y quita solo el vínculo, salvo
  que el usuario confirme borrarlo.
- Mantén el comportamiento histórico: Vehículo crea por defecto; Financiamientos
  no vincula por defecto.
- Reutiliza los pickers existentes; si aparece un tercer flujo, extrae un
  `RecordPicker` común.
- Agrega pruebas de monto/fecha, exclusión de ya vinculados y
  creación/vinculación transaccional.

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
- `docs:audit` falla si `AGENTS.md` o `docs/phases.md` exceden su presupuesto.

## Mapa de contexto

| Necesitas | Lee | Skill |
| --- | --- | --- |
| UI, tema, formularios, modales, filtros | `src/ui/AGENTS.md`, `docs/architecture/ui.md` | `pockettool-ui` |
| Esquema, migraciones, ORM, repositorios | `src/db/AGENTS.md`, `docs/database.md` | `pockettool-db` |
| Dominio, dinero, presupuestos, créditos, ahorros, vehículo | `src/domain/AGENTS.md`, `docs/architecture/domains.md` | `pockettool-domain` |
| Navegación y pantallas | `app/AGENTS.md` | `pockettool-ui` |
| Traducciones y centro de ayuda | `src/lang/AGENTS.md` | `pockettool-help` |
| Registros y operaciones con dinero | `src/db/AGENTS.md` | `pockettool-records` |
| Histórico de fases | `docs/legacy/AGENTS.md` | — |

## Documentación

- [`docs/README.md`](docs/README.md): contrato de documentación e índice.
- [`docs/phases.md`](docs/phases.md): estado vigente y fase activa.
- [`docs/database.md`](docs/database.md): base de datos y reglas de lectura.
- [`docs/schema.md`](docs/schema.md): esquema generado; no editar a mano.
- [`docs/release-notes/`](docs/release-notes/): notas de Google Play.
- [`docs/legacy/`](docs/legacy/): archivo histórico; no es documentación vigente.
- Skills: `.opencode/skills/<id>/SKILL.md`; el campo `name` debe ser exactamente
  el ID de la carpeta (minúsculas, números y guiones). Los comandos viven en
  `.opencode/commands/`.

Al cerrar una fase: actualiza `docs/phases.md` y la tabla de `docs/README.md`,
archiva el plan en `docs/legacy/` con resumen e índice de secciones, actualiza la
ayuda si cambió el comportamiento visible y ejecuta `/cerrar-fase`.
