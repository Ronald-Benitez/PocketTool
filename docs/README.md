# Documentación de PocketTool

Este directorio guarda el contexto de largo plazo del proyecto: plan de fases,
estado de ejecución, decisiones y enlaces a la documentación técnica.

## Índice

- [`phases.md`](phases.md): plan completo de fases, estado y bitácora de lo
  ejecutado. **Es el documento que debe actualizarse al terminar cada fase.**
- [`schema.md`](schema.md): esquema generado desde
  `src/db/schema/tables.ts` (tablas, columnas, tipos, índices y relaciones).
- [`../AGENTS.md`](../AGENTS.md): contexto e instrucciones para agentes.
- [`../db.md`](../db.md): tablas, relaciones y convenciones de la base de datos.
- [`../README.md`](../README.md): descripción general del proyecto.

## Estado rápido

| Fase | Estado |
| --- | --- |
| Fase 0 — Correcciones críticas | ✅ Finalizada (2026-10-28) |
| Fase 1 — Fuente única de verdad del esquema | ✅ Finalizada (2026-10-28) |
| Fase 2 — Repositorios y ORM robusto | ⏳ Pendiente |
| Fase 3 — Calidad, pruebas y operación | ⏳ Pendiente |

## Regla de mantenimiento

Al completar una fase:

1. Cambiar su estado en `phases.md` y en la tabla anterior.
2. Agregar fecha de finalización.
3. Registrar commits, archivos principales y verificaciones ejecutadas.
4. Anotar pendientes, riesgos o decisiones que afecten a fases posteriores.
5. Actualizar `AGENTS.md` si cambió la arquitectura o las convenciones.
