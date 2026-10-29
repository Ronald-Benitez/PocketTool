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
- **Fase 4 — Sistema de UI reutilizable: EN PROGRESO**. UI-0, UI-0b, UI-1,
  UI-2, UI-2b, UI-2c y UI-3 completadas; UI-4 pendiente.

El plan completo, el detalle de lo ejecutado y los criterios de aceptación viven
en [`docs/phases.md`](docs/phases.md). **Cada vez que se complete una fase hay
que actualizar ese documento y marcar la fase como finalizada**, incluyendo fecha,
commits relevantes, archivos tocados y verificaciones realizadas.

## Arquitectura de UI

- `src/ui/theme/tokens.ts`: tokens de espaciado, radios, alturas, tipografía,
  sombras y z-index.
- `src/ui/theme/palettes/bright.base.json` y `dark.base.json`: paletas base
  versionadas. No editar valores base sin actualizar tests de contraste.
- `src/ui/theme/ThemeProvider.tsx`: fuente del tema. Expone `colors`,
  `palettes`, `mode`, `resolvedMode`, setters y resets.
- `src/ui/theme/settings.ts`: normalización, migración legacy, resolución de
  modo/paleta y merge; funciones puras testeables.
- `src/ui/theme/contrast.ts`: contraste WCAG AA.
- `src/ui/primitives/`: `AppText`, `Surface`, `Divider`, `Screen`, `Stack`/`Row`/
  `Column`.
- `src/ui/actions/`: `Button`, `IconButton`, `LinkButton` y `SwipeAction` con
  variantes y estados.
- `src/ui/forms/`: `FormField`, `TextField`, `MoneyField`, `SelectField`,
  `MultiSelectField`, `DateField`, `MonthField`, `SwitchField`, `ColorField` y
  `ColorPicker` con label/required/hint/error.
- `src/ui/overlays/`: `Modal` (center/bottom), `BottomSheet`, `Dialog` y
  `ConfirmDialog`. `Modal` maneja el teclado con `KeyboardAvoidingView`, insets
  y auto-scroll al `TextField` enfocado.
- `src/db/schema/metadata.ts`: resolución de columnas, tipos, `kind` y
  referencias del esquema para construir UI tipada sin ejecutar SQL.
- `src/domain/filters/types.ts` y `src/domain/records/filtering.ts`: tipos de
  filtro, matcher y orden compartidos.
- `src/domain/records/filterFields.ts`: campos curados de Records, opciones de
  relaciones y columnas avanzadas.
- `src/ui/filters/`: `FilterModal`, `FilterRow`, `OrderRow` y
  `FilterValueInput`; `RecordsFilterModal` es el wrapper de Records.
- `SelectField` y `MultiSelectField` aceptan `searchable` para buscar opciones.
- `src/ui/feedback/`: `ToastProvider` único, `InlineMessage`, `EmptyState`,
  `LoadingState` y `ToastViewport` para modales.
- `src/ui/data-display/`: `Card`, `ListItem`, `Badge`, `FinanceValue`,
  `SummaryBlock`, `SummaryGroup` y `AccentRow`; `FinanceValue` recibe centavos y
  usa el tema.
- `src/ui/index.ts`: barrel público del sistema de UI.
- `app/gallery.tsx`: galería de desarrollo, oculta del drawer.
- No crear toasts o modales locales; usar `ToastProvider` y `src/ui`.
- `eslint.config.js` bloquea `TextInput`, `Modal`, `Alert` y `ToastAndroid` de
  `react-native` fuera de `src/ui`.
- Los componentes nuevos usan `useTheme()`; no leer `useColorStore` ni claves
  legacy.
- `src/stores/ColorsStore.ts` es solo un adaptador de compatibilidad durante la
  migración.
- Persistencia del tema: clave `themeSettings`; migra desde `colors` y elimina
  la clave legacy al migrar.
- La UI no debe hardcodear colores nuevos; usar tokens semánticos.
- Los colores personalizados viven por paleta (`bright`/`dark`) y se completan
  con la base al agregar tokens nuevos.

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
- UI: los componentes nuevos van en `src/ui`; las pantallas no deben usar
  `TextInput`, `Modal`, `Alert` ni `ToastAndroid` directos. Mantener adaptadores
  legacy solo durante la migración.
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
- [`docs/phases.md`](docs/phases.md): estado actual y fases activas.
- [`docs/schema.md`](docs/schema.md): esquema generado.
- [`docs/database.md`](docs/database.md): documentación de la base de datos.
- [`docs/ui-plan.md`](docs/ui-plan.md): plan de UI, tema, color y modo oscuro.
- [`docs/legacy/phase-history.md`](docs/legacy/phase-history.md): historial de
  fases completadas.
- [`README.md`](README.md): descripción general y ejecución del proyecto.
