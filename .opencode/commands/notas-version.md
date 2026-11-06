---
description: Genera las notas de Google Play en inglés y español para una versión
agent: general
---

Genera las notas de Google Play para la versión: $1

1. Carga la skill `pockettool-release`.
2. Confirma la versión con `package.json` y revisa los cambios desde la versión
   anterior con git log.
3. Crea o actualiza `docs/release-notes/<versión>-google-play.md` con secciones
   `English (What's new)` y `Español (Novedades)`.
4. Usa viñetas `•`, lenguaje para usuarios y paridad de contenido entre idiomas.
5. No incluyas detalles internos, nombres de tablas, commits ni datos reales.
6. No cambies `package.json` ni la versión sin pedirlo explícitamente.
