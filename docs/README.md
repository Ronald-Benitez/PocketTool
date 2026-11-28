# Documentación de PocketTool

Este directorio guarda el contexto de largo plazo: estado, decisiones,
arquitectura y enlaces. La documentación se lee **por secciones**, no completa.

**Contrato:** no dupliques reglas entre `AGENTS.md`, skills y `docs/`; una regla
vive en una sola capa. El procedimiento y los límites están en la skill
`pockettool-docs`. `docs/schema.md` es generado y `docs/legacy/` es histórico.

## Índice

### Documentación vigente

- [`phases.md`](phases.md): estado, fase activa y resumen histórico.
- [`database.md`](database.md): esquema, migraciones, backups y acceso a datos.
- [`schema.md`](schema.md): esquema generado; no editar ni leer completo.
- [`architecture/ui.md`](architecture/ui.md): sistema de UI y tema.
- [`architecture/visual-identity.md`](architecture/visual-identity.md):
  contrato visual, glass, agrupadores, tooltips y checklist.
- [`architecture/dashboard.md`](architecture/dashboard.md): modelo, bloques,
  layout, persistencia y navegación del Home.
- [`architecture/domains.md`](architecture/domains.md): reglas de dominio.
- [`architecture/features.md`](architecture/features.md): experiencia, flags,
  presets, captura rápida y ayuda por módulo.
- [`architecture/dependencies.md`](architecture/dependencies.md): mapa de qué
  módulos, pantallas, componentes, hooks y dominios dependen de cada feature.
- [`plans/futuro-borrador.md`](plans/futuro-borrador.md): pendientes futuros.
- [`plans/fase-24-escaneo-facturas-plan.md`](plans/fase-24-escaneo-facturas-plan.md):
  escaneo de facturas para Compras (fase activa).

### Notas de versión

- [`release-notes/`](release-notes/): notas de Google Play en inglés y español.
  - [4.0.7](release-notes/4.0.7-google-play.md)
  - [4.0.6](release-notes/4.0.6-google-play.md)
  - [4.0.5](release-notes/4.0.5-google-play.md)
  - [4.0.4](release-notes/4.0.4-google-play.md)
  - [4.0.3](release-notes/4.0.3-google-play.md)
  - [4.0.0](release-notes/4.0.0-google-play.md)
  - [3.0.0](release-notes/3.0.0-google-play.md)

### Archivo histórico

- [`legacy/README.md`](legacy/README.md): índice de planes archivados.
- [`legacy/AGENTS.md`](legacy/AGENTS.md): cómo leer el histórico.

### Contexto para agentes

Consulta [`../AGENTS.md`](../AGENTS.md) para el mapa de contexto, las reglas
globales y los enlaces a skills, comandos y `AGENTS.md` por área.

## Mantenimiento

El cierre de fase sigue `pockettool-phase-close`; el contrato de documentación
está en `pockettool-docs`. Al crear o mover un documento, actualiza este índice.
