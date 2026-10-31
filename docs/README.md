# Documentación de PocketTool

Este directorio guarda el contexto de largo plazo del proyecto: plan de fases,
estado de ejecución, decisiones y enlaces a la documentación técnica.

## Índice

- [`phases.md`](phases.md): estado actual y fases activas. El detalle histórico
  de fases completadas vive en `legacy/`.
- [`vehicle-plan.md`](vehicle-plan.md): plan de la sección Vehículo (Fase 8):
  combustible, mantenimiento, unidades, estadísticas y Registros.
- [`database.md`](database.md): documentación actual de la base de datos,
  migraciones, triggers y backups.
- [`schema.md`](schema.md): esquema generado desde
  `src/db/schema/tables.ts` (tablas, columnas, tipos, índices y relaciones).
- [`legacy/README.md`](legacy/README.md): índice del archivo histórico.
- [`legacy/phase-history.md`](legacy/phase-history.md): historial detallado de
  fases 0–3.
- [`legacy/ui-history.md`](legacy/ui-history.md): historial de la Fase 4.
- [`legacy/ui-plan.md`](legacy/ui-plan.md): plan original de UI archivado.
- [`legacy/i18n-help-plan.md`](legacy/i18n-help-plan.md): plan de traducciones
  tipadas y centro de ayuda archivado.
- [`legacy/budget-plan.md`](legacy/budget-plan.md): plan de Presupuestos (Fase 7)
  implementado y archivado.
- [`legacy/db-summary.md`](legacy/db-summary.md): resumen anterior de base de
  datos.
- [`../AGENTS.md`](../AGENTS.md): contexto e instrucciones para agentes.
- [`../README.md`](../README.md): descripción general del proyecto.

## Estado rápido

| Fase | Estado |
| --- | --- |
| Fase 0 — Correcciones críticas | ✅ Finalizada (2026-10-28) |
| Fase 1 — Fuente única de verdad del esquema | ✅ Finalizada (2026-10-28) |
| Fase 2 — Repositorios y ORM robusto | ✅ Finalizada (2026-10-28) |
| Fase 3 — Calidad, pruebas y operación | ✅ Finalizada (2026-10-28) |
| Fase 4 — Sistema de UI reutilizable | ✅ Finalizada (2026-10-29) |
| Fase 5 — Traducciones tipadas | ✅ Finalizada (2026-10-29) |
| Fase 6 — Centro de ayuda | ✅ Finalizada (2026-10-29) |
| Fase 7 — Presupuestos | ✅ Finalizada (2026-10-29) |
| Fase 8 — Vehículo | 📝 Planificación (2026-10-30) |

## Regla de mantenimiento

Al completar una fase:

1. Cambiar su estado en `phases.md` y en la tabla anterior.
2. Agregar fecha de finalización.
3. Registrar commits, archivos principales y verificaciones ejecutadas.
4. Mover el detalle histórico a `legacy/` y dejar en `phases.md` solo el estado
   vigente y los enlaces.
5. Anotar pendientes, riesgos o decisiones que afecten a fases posteriores.
6. Actualizar `AGENTS.md` si cambió la arquitectura o las convenciones.
