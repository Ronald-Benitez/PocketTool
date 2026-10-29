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

Pendiente de UI-0: primitivas base (`src/ui/primitives`), barrel `src/ui` y
galería de componentes. Después siguen UI-1 (formularios/acciones), UI-2
(feedback/overlays), UI-3 (datos/tablas) y UI-4 (limpieza).

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
