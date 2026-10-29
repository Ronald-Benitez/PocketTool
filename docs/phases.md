# Plan de fases

**Última actualización:** 2026-10-28

## Estado

| Fase | Estado | Fecha |
| --- | --- | --- |
| Fase 0 — Correcciones críticas | ✅ Finalizada | 2026-10-28 |
| Fase 1 — Fuente única de verdad del esquema | ✅ Finalizada | 2026-10-28 |
| Fase 2 — Repositorios y ORM robusto | ✅ Finalizada | 2026-10-28 |
| Fase 3 — Calidad, pruebas y operación | ✅ Finalizada | 2026-10-28 |
| Fase 4 — Sistema de UI reutilizable | 🔄 En progreso | — |

El detalle histórico de las fases 0–3, sus checklists y commits vive en
[`legacy/phase-history.md`](legacy/phase-history.md). Se conserva como registro,
pero no se carga en el contexto diario.

## Arquitectura actual (resumen)

- **Esquema:** `src/db/schema/tables.ts` es la fuente única; los artefactos de
  `src/db/schema/generated/` y `docs/schema.md` se generan con
  `npm run db:generate`.
- **Dinero/fechas:** centavos enteros y timestamps Unix en milisegundos.
- **Auditoría:** `created_at`/`updated_at` se llenan con triggers; soft delete
  con `deleted_at`.
- **Migraciones:** `0001_baseline`, `0002_audit_timestamps`,
  `0003_timestamp_triggers`; `SCHEMA_VERSION = 3`.
- **Acceso a datos:** ORM tipado + repositorios. La UI no usa `useORM` ni SQL.
- **Backups:** dump SQL con cabecera de metadatos y compatibilidad legacy.
- **Calidad:** `test:db` con `node:sqlite`, Jest, typecheck, lint bloqueante y
  CI en `.github/workflows/ci.yml`.
- **UI:** `src/ui/theme/` implementa tokens, paletas base bright/dark,
  `ThemeProvider`, modo `system`/`light`/`dark`, persistencia, migración y
  contraste. Los componentes legacy de `src/components/ui` siguen en uso y se
  migran incrementalmente en Fase 4.

## Fase 4 — Sistema de UI reutilizable

**Estado:** 🔄 En progreso
**Plan detallado:** [`ui-plan.md`](ui-plan.md)

Objetivo: unificar inputs, selects, modales, botones, feedback, tema, modo
oscuro y gestión de colores en componentes reutilizables con variantes, labels,
errores, accesibilidad y un único `ToastProvider`.

Incluye:

- Tokens de tema y `ThemeProvider`.
- Paletas base bright/dark y paletas personalizadas editables por el usuario.
- Modo `system`/`light`/`dark`.
- Formularios con label, required, hint y errores inline.
- `Button`/`IconButton`, `Modal`/`Dialog`, `ToastProvider`.
- Galería de componentes y migración incremental por pantalla.
- Documentación de base de datos mejorada y concisa.

### UI-0 / UI-0b — Fundaciones de tema (✅ 2026-10-28)

- `src/ui/theme/tokens.ts`: espaciado, radios, alturas, tipografía, sombras y
  z-index.
- `src/ui/theme/palettes/bright.base.json` y `dark.base.json`: paletas base
  versionadas.
- `src/ui/theme/settings.ts`: normalización, migración legacy, resolución de
  modo/paleta y merge de tokens.
- `src/ui/theme/ThemeProvider.tsx`: `system`/`light`/`dark`, paletas bright/dark
  editables, persistencia con debounce y migración desde la clave `colors`.
- `src/ui/theme/contrast.ts`: contraste WCAG AA y advertencias.
- `ColorScheme` ampliado con tokens semánticos y alias legacy derivados.
- Editor de tema en Ajustes: modo, pestañas bright/dark, grupos de color,
  restauración por color/paleta/todo, vista previa y contraste.
- `app/_layout.tsx`: `ThemeProvider`, `StatusBar`, `SystemUI` y drawer temático.
- `ColorsStore` convertido en adaptador de `useTheme`; eliminados
  `colors.json`, `colorsDark.json` y `useColors`.
- Tests en `src/ui/theme/__tests__/theme-settings.test.ts`.
- Verificado: `npm run typecheck`, Jest y `npm run lint` con 0 errores.

### UI-0 complemento — Primitivas, galería y primer bloque UI-1/UI-2 (✅ 2026-10-28)

- `src/ui/primitives`: `AppText`, `Surface`, `Divider`, `Screen`, `Stack`/`Row`/
  `Column`.
- `src/ui/actions`: `Button` (primary, secondary, outline, ghost, danger; sm/md/lg;
  loading/disabled/iconos) e `IconButton` (ghost/surface/primary; sm/md/lg).
- `src/ui/forms`: `FormField` (label, required, hint, error accesible) y
  `TextField` (tamaños, iconos, multiline, disabled, error).
- `src/ui/feedback`: `ToastProvider` único con host global y `ToastViewport` para
  modales.
- `src/hooks/useToast.tsx` y `src/hooks/useAndroidToast.ts` ahora delegan al
  `ToastProvider`; `ToastContainer` legacy queda como no-op.
- `src/ui/index.ts` como barrel público.
- Galería de desarrollo en `app/gallery.tsx` (ruta oculta en el drawer).
- Tests de render en `src/ui/__tests__/primitives.test.tsx`.
- Verificado: `npm run typecheck`, `npm test`, `npm run test:db` y `npm run lint`
  con 0 errores.

### UI-1 / UI-2 — Campos especializados, overlays y feedback (✅ 2026-10-28)

- `src/ui/forms`: `MoneyField` (centavos), `SelectField` value-based, `DateField`
  con calendario, `MonthField`, `SwitchField` y `ColorField`.
- `src/ui/actions`: `LinkButton`.
- `src/ui/overlays`: `Modal` center/bottom, `BottomSheet`, `Dialog` y
  `ConfirmDialog`.
- `src/ui/feedback`: `InlineMessage`, `EmptyState` y `LoadingState`.
- `ConfirmModal` legacy ahora usa `Dialog` y los botones/textos del tema.
- Piloto migrado: `src/components/groups/add-group.tsx` usa `Modal`,
  `TextField`, `MoneyField`, `MonthField` y `Button`; ya no usa
  `ModalContainer`, `InputLabel` ni `MonthSelector`.
- Piloto migrado: `src/components/records/add-record.tsx` usa `Modal`,
  `TextField`, `MoneyField`, `DateField`, `SelectField` y `Button`; conserva los
  bordes de color de tipos/métodos con `renderOption`/`renderValue`.
- Migrados también: `AddFixed`, `AddTemplateItem`, `add-budget` y `AddSaving`
  usan `Modal`, `TextField`/`MoneyField`/`SelectField`/`DateField` y `Button`.
- `ColoredSelectOption` centraliza las filas de select con borde de color.
- `MultiSelectField` agregado para selección múltiple con checkboxes.
- Migrados a los nuevos selects: Ajustes, métodos de pago, selector de grupos y
  selector de ahorros. `BaseSelect` queda solo en `RecordsFilterModal`.
- `Modal` incluye `KeyboardAvoidingView` para iOS y Android y auto-scroll al
  campo enfocado mediante `TextField`.
- Modales legacy (`ModalContainer`, `base-modal`, `RecordsFilterModal`) también
  usan `KeyboardAvoidingView`; `app.json` fija
  `android.softwareKeyboardLayoutMode: "resize"`.
- Galería ampliada con campos especializados, feedback, loading, empty state y
  diálogo.
- Tests de render ampliados en `src/ui/__tests__/primitives.test.tsx`.
- Verificado: `npm run ci` y `npm run lint` con 0 errores.

Pendiente de UI-1: migrar `RecordsFilterModal`, que es el último consumidor de
`BaseSelect`.
Pendiente de UI-2: migrar `ModalContainer`, `base-modal`, `confirm` y
`HelpModal`, y reemplazar `Alert`/`useAndroidToast` restantes por feedback
global.

### UI-2b — Filtros tipados y reutilizables (✅ 2026-10-28)

- `src/db/schema/metadata.ts`: resolución de columnas, tipos, `kind` y
  referencias sin ejecutar SQL.
- `src/domain/filters/types.ts`: tipos de campo, operador, opciones y valores.
- `src/domain/records/filtering.ts`: matcher y orden compartidos, con soporte
  para fechas, dinero, booleanos `0/1`, `BETWEEN`, `IN`, `IS` e `IS NOT`.
- `src/domain/records/filterFields.ts`: campos curados de Records, opciones de
  relaciones y sección `advanced`.
- `src/ui/filters/`: `FilterModal`, `FilterRow`, `OrderRow` y
  `FilterValueInput`.
- `SelectField` y `MultiSelectField` aceptan `searchable` y filtran opciones.
- `RecordsFilterModal` ahora es un wrapper del modal genérico.
- `records-table` usa los filtros compartidos y muestra el contador de filtros.
- `RecordsModal` de Summary usa el mismo modal, filtra solo su detalle y no
  persiste el orden.
- Tests en `src/domain/records/__tests__/filtering.test.ts`.
- Verificado: `npm run ci` y `npm run lint` con 0 errores.

Pendiente de UI-2b: filtros persistidos por vista y filtros en las tablas
resumen (fuera del alcance de esta fase).

### UI-3 — Datos y presentación (🔄 Parcial · 2026-10-28)

- `src/ui/data-display`: `Card`, `ListItem`, `Badge`, `FinanceValue` y
  `SummaryBlock`.
- `FinanceValue` recibe centavos y resuelve el color/tamaño desde el tema.
- `SummaryBlock` compone label, valor monetario/texto e icono.
- Galería y tests actualizados.
- Verificado: `npm run ci` y `npm run lint` con 0 errores.

Pendiente de UI-3: `SwipeAction` y migrar `FinanceSimpleBlock`,
`FinanceSmallBlock`, `FinanceTableBlock`, `FinanceTableChart`, `BalanceBlock`,
`IndexBlock`, `BGSimpleBlock`, `BorderLeftBlock` y `BorderLeftButtonBlock`.

## Documentación

- [`README.md`](README.md): índice de documentación.
- [`ui-plan.md`](ui-plan.md): plan activo de UI, tema, color y modo oscuro.
- [`database.md`](database.md): documentación actual de la base de datos.
- [`schema.md`](schema.md): esquema generado.
- [`legacy/phase-history.md`](legacy/phase-history.md): historial detallado de
  fases 0–3.
- [`legacy/db-summary.md`](legacy/db-summary.md): resumen de base de datos
  anterior, conservado como archivo.
- [`../AGENTS.md`](../AGENTS.md): instrucciones para agentes.

## Decisiones vigentes

- Tablas lógicas PascalCase, nombres físicos y columnas snake_case.
- Dinero en centavos; fechas en milisegundos.
- Soft delete por defecto; el ORM filtra borrados.
- Migraciones en transacción exclusiva y registro posterior al commit.
- Repositorios como única puerta de acceso desde stores/pantallas.
- Backups con metadatos versionados y compatibilidad con dumps SQL antiguos.
- Lint bloqueante; CI ejecuta typecheck, artefactos, tests y lint.
