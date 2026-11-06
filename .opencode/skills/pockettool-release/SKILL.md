---
name: pockettool-release
description: Genera las notas de Google Play en inglés y español para una versión de PocketTool a partir de los cambios reales. Úsala desde /notas-version o cuando haya que preparar una entrega.
---

# PocketTool Release

## En modo plan

1. Confirma la versión y si ya existe un archivo en `docs/release-notes/`.
2. Identifica los cambios visibles desde la versión anterior con git log.
3. Agrupa por tema: Ahorros, Personas, Registros, Vehículo, Créditos,
   Presupuestos, Compromisos, UI, correcciones.
4. No incluyas detalles internos, nombres de tablas, commits ni datos reales.
5. No edites archivos; entrega el borrador EN/ES.

## En modo build

1. Lee `package.json` para la versión actual y `git log`/tags para el rango.
2. Crea o actualiza `docs/release-notes/<versión>-google-play.md` con el formato:
   - `# Google Play — Notas de la versión <versión>`;
   - `## English (What's new)`;
   - `PocketTool <versión>` y viñetas `•`;
   - `## Español (Novedades)`;
   - el mismo contenido en español.
3. Usa lenguaje para usuarios, no técnico. Explica el beneficio, no la
   implementación.
4. Mantén paridad de contenido entre inglés y español.
5. No cambies `package.json` ni la versión sin pedirlo explícitamente.
6. Si agregaste un archivo nuevo, actualiza el índice de `docs/README.md`.
7. Referencia: `docs/release-notes/4.0.4-google-play.md`.

## Referencias

- `docs/release-notes/`
- `package.json`
- `docs/phases.md`
