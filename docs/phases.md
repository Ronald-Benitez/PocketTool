# Plan de fases

**Última actualización:** 2026-10-29

## Estado

| Fase | Estado | Fecha |
| --- | --- | --- |
| Fase 0 — Correcciones críticas | ✅ Finalizada | 2026-10-28 |
| Fase 1 — Fuente única de verdad del esquema | ✅ Finalizada | 2026-10-28 |
| Fase 2 — Repositorios y ORM robusto | ✅ Finalizada | 2026-10-28 |
| Fase 3 — Calidad, pruebas y operación | ✅ Finalizada | 2026-10-28 |
| Fase 4 — Sistema de UI reutilizable | ✅ Finalizada | 2026-10-29 |
| Fase 5 — Traducciones tipadas | 📝 Planificación | — |
| Fase 6 — Centro de ayuda | 📝 Planificación | — |

El detalle histórico de las fases 0–3 vive en
[`legacy/phase-history.md`](legacy/phase-history.md). El detalle de la Fase 4
vive en [`legacy/ui-history.md`](legacy/ui-history.md) y su plan original en
[`legacy/ui-plan.md`](legacy/ui-plan.md). Queda pendiente únicamente el checklist
visual de la Fase 4 en iOS/Android/web.

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
- **UI:** `src/ui/` contiene el sistema de componentes, tema y filtros.
  `src/components/ui` fue retirado; los resúmenes viven en
  `src/components/summaries` y los estilos legacy se adaptan con
  `src/styles/useThemedStyles.ts`.
- **Idiomas:** `LanguageContext` con `en.json`, `es.json` y
  `records-filters.*.json`; pendiente de tipado y consolidación.

## Fase 4 — Sistema de UI reutilizable (✅ 2026-10-29)

Se implementó:

- Tokens, paletas bright/dark, `ThemeProvider`, modo `system`/`light`/`dark` y
  editor de colores.
- Primitivas, acciones, formularios, overlays, feedback, filtros y componentes
  de datos en `src/ui`.
- Migración de formularios, selects, modales, toasts y listas principales.
- Filtros tipados y reutilizables para Records y Summary.
- Limpieza de componentes legacy y regla de lint para primitivas nativas.

Pendiente de QA: checklist visual en iOS/Android/web. El detalle y los commits
están en [`legacy/ui-history.md`](legacy/ui-history.md).

## Fase 5 — Traducciones tipadas (📝 Planificación)

**Plan completo:** [`i18n-help-plan.md`](i18n-help-plan.md)

Objetivo: reemplazar el `t(key: string)` actual por un hook tipado con
autocompletado, mensajes co-localizados por dominio y una única fuente de verdad
para inglés y español.

Incluye:

- Mensajes agrupados por dominio en `src/lang/messages/`.
- Tipo recursivo `TranslationKey` derivado de los mensajes.
- `t()` con autocompletado, parámetros/interpolación y fallback.
- Consolidación de `records-filters.*.json`.
- Validación de paridad de claves y tests.

## Fase 6 — Centro de ayuda (📝 Planificación)

**Plan completo:** [`i18n-help-plan.md`](i18n-help-plan.md)

Objetivo: convertir la sección de ayuda en un centro de aprendizaje con
explicaciones de la lógica, ejemplos de uso y búsqueda.

Incluye:

- Hub de temas y detalle por tema.
- Explicaciones de grupos, records, fijos, resúmenes, presupuestos, créditos,
  ahorros, filtros y tema.
- Ejemplos con datos ficticios.
- Búsqueda, accesos rápidos y contenido bilingüe.
- Reutilización de `src/ui` y navegación por rutas.

## Documentación

- [`README.md`](README.md): índice de documentación.
- [`i18n-help-plan.md`](i18n-help-plan.md): plan de traducciones y ayuda.
- [`database.md`](database.md): documentación actual de la base de datos.
- [`schema.md`](schema.md): esquema generado.
- [`legacy/phase-history.md`](legacy/phase-history.md): historial de fases 0–3.
- [`legacy/ui-history.md`](legacy/ui-history.md): historial de la Fase 4.
- [`legacy/ui-plan.md`](legacy/ui-plan.md): plan original de UI archivado.
- [`legacy/db-summary.md`](legacy/db-summary.md): resumen anterior de base de
  datos.
- [`../AGENTS.md`](../AGENTS.md): instrucciones para agentes.

## Decisiones vigentes

- Tablas lógicas PascalCase, nombres físicos y columnas snake_case.
- Dinero en centavos; fechas en milisegundos.
- Soft delete por defecto; el ORM filtra borrados.
- Migraciones en transacción exclusiva y registro posterior al commit.
- Repositorios como única puerta de acceso desde stores/pantallas.
- Backups con metadatos versionados y compatibilidad con dumps SQL antiguos.
- Lint bloqueante; CI ejecuta typecheck, artefactos, tests y lint.
- La UI nueva usa `src/ui`; los estilos legacy se adaptan con
  `useThemedStyles`.
