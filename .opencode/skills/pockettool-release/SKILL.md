---
name: pockettool-release
description: Prepara una versión de PocketTool con notas de Google Play, novedades in-app y bump de versión. Úsala desde /notas-version.
---

# PocketTool Release

## En modo plan

1. Confirma la versión y si ya existe un archivo en `docs/release-notes/`.
2. Identifica los cambios visibles desde la versión anterior con git log.
3. Agrupa por tema: Ahorros, Personas, Registros, Vehículo, Créditos,
   Presupuestos, Compromisos, UI, correcciones.
4. No incluyas detalles internos, nombres de tablas, commits ni datos reales.
5. No edites archivos ni subas la versión; entrega el borrador EN/ES.

## En modo build

`/notas-version <versión>` prepara la entrega completa. Si el usuario solo pide
un borrador, no edites archivos ni subas la versión.

1. Confirma la versión objetivo y los cambios visibles desde la anterior con
   `git log`/tags. Si falta la versión, pregúntala.
2. Sube la versión en `package.json`, `package-lock.json` (raíz y
   `packages[""]`) y `app.json`.
3. Crea o actualiza `docs/release-notes/<versión>-google-play.md`:
   - `# Google Play — Notas de la versión <versión>`;
   - `## English (What's new)` con `PocketTool <versión>` y viñetas `•`;
   - `## Español (Novedades)` con el mismo contenido.
4. Agrega o actualiza la entrada del catálogo en
   `src/release-notes/catalog.ts`: `version`, `date` e items con `kind`,
   `titleKey` y `bodyKey`.
5. Agrega los textos EN/ES en `src/lang/messages/whatsNew.ts` y registra las
   claves en `src/lang/messages/index.ts` si hace falta.
6. Actualiza `docs/README.md` con el archivo de notas nuevo.
7. Ejecuta `npm run typecheck`, `npm test` y `npm run docs:audit`.
8. Sigue las reglas de paridad, hechos y catálogo manual de
   `src/release-notes/AGENTS.md`; no las dupliques aquí.

## Referencias

- `src/release-notes/AGENTS.md`
- `docs/release-notes/`
- `package.json`
- `docs/phases.md`
