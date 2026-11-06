# Documentación de PocketTool

Este directorio guarda el contexto de largo plazo: estado, decisiones,
arquitectura y enlaces. La documentación se lee **por secciones**, no completa.

## Contrato de documentación

- Todo documento empieza con `**Cuándo leer:**`, `**Resumen:**` y
  `**Secciones:**` cuando sea largo.
- No dupliques reglas entre `AGENTS.md`, skills y `docs/`. Una regla vive en un
  solo lugar y se enlaza desde los demás.
- Un documento no generado que supere **15 KB** debe dividirse o archivarse.
- `docs/legacy/` está exento del límite, pero cada plan debe incluir resumen,
  estado, fecha y mapa de secciones.
- `docs/schema.md` es generado: no se edita a mano ni se lee completo; usa el
  índice por tabla y lee solo el rango necesario.
- Al cerrar una fase se actualizan `phases.md`, esta tabla y el archivo
  histórico; `AGENTS.md` solo cambia si cambió una regla o el flujo. Después se
  ejecuta `npm run docs:audit`.

## Índice

### Documentación vigente

- [`phases.md`](phases.md): estado, fase activa, resumen de fases y decisiones.
- [`database.md`](database.md): base de datos, migraciones, triggers, backups y
  reglas de lectura del esquema.
- [`schema.md`](schema.md): esquema generado desde
  `src/db/schema/tables.ts`; incluye índice con líneas por tabla.
- [`architecture/ui.md`](architecture/ui.md): sistema de UI, tema, componentes y
  reglas de estilo.
- [`architecture/domains.md`](architecture/domains.md): reglas de presupuestos,
  créditos, ahorros, vehículo, personas y compartidos.
- [`release-notes/4.0.4-google-play.md`](release-notes/4.0.4-google-play.md):
  notas de Google Play 4.0.4 en inglés y español.
- [`release-notes/4.0.3-google-play.md`](release-notes/4.0.3-google-play.md):
  notas de Google Play 4.0.3 en inglés y español.

### Archivo histórico

- [`legacy/README.md`](legacy/README.md): índice del archivo.
- [`legacy/phase-history.md`](legacy/phase-history.md): fases 0–3.
- [`legacy/ui-history.md`](legacy/ui-history.md): Fase 4.
- [`legacy/ui-plan.md`](legacy/ui-plan.md): plan original de UI.
- [`legacy/i18n-help-plan.md`](legacy/i18n-help-plan.md): traducciones y ayuda.
- [`legacy/budget-plan.md`](legacy/budget-plan.md): Presupuestos (Fase 7).
- [`legacy/vehicle-plan.md`](legacy/vehicle-plan.md): Vehículo (Fase 8).
- [`legacy/credits-fixed-plan.md`](legacy/credits-fixed-plan.md): fijos y
  créditos (Fase 9).
- [`legacy/next-version-plan.md`](legacy/next-version-plan.md): ajustes de la
  siguiente versión (Fase 10).
- [`legacy/savings-plan.md`](legacy/savings-plan.md): ahorros y metas (Fase 11).
- [`legacy/db-summary.md`](legacy/db-summary.md): resumen anterior de base de
  datos.

### Contexto para agentes

- [`../AGENTS.md`](../AGENTS.md): reglas generales y flujo de trabajo.
- [`.opencode/skills/`](../.opencode/skills/): procedimientos por área.
- [`.opencode/commands/`](../.opencode/commands/): atajos como
  `/nueva-funcionalidad` y `/cerrar-fase`.
- [`../src/ui/AGENTS.md`](../src/ui/AGENTS.md): reglas de UI.
- [`../src/db/AGENTS.md`](../src/db/AGENTS.md): reglas de datos.
- [`../src/domain/AGENTS.md`](../src/domain/AGENTS.md): reglas de dominio.
- [`../src/lang/AGENTS.md`](../src/lang/AGENTS.md): idiomas y ayuda.
- [`../app/AGENTS.md`](../app/AGENTS.md): navegación y pantallas.
- [`legacy/AGENTS.md`](legacy/AGENTS.md): cómo leer el histórico.

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
| Fase 8 — Vehículo | ✅ Finalizada (2026-10-31) |
| Fase 9 — Gastos fijos y Créditos | ✅ Finalizada (2026-11-03) |
| Fase 10 — Errores y ajustes de siguiente versión | ✅ Finalizada (2026-11-03) |
| Fase 11 — Ahorros compartidos y metas | ✅ Finalizada (2026-11-04) |

## Regla de mantenimiento

Al completar una fase:

1. Cambiar su estado en `phases.md` y en la tabla anterior.
2. Agregar fecha de finalización.
3. Registrar commits, archivos principales y verificaciones ejecutadas.
4. Mover el detalle histórico a `legacy/` con resumen e índice de secciones.
5. Anotar pendientes, riesgos o decisiones que afecten fases posteriores.
6. Actualizar `AGENTS.md` solo si cambió una regla o el flujo de trabajo.
7. Ejecutar `/cerrar-fase` o el checklist de `pockettool-phase-close`.
