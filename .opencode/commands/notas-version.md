---
description: Prepara una versión con notas de Google Play, novedades in-app y bump de versión
agent: general
---

Prepara la versión: $1

1. Carga la skill `pockettool-release` y sigue su modo build.
2. Sube la versión en `package.json`, `package-lock.json` y `app.json`.
3. Genera `docs/release-notes/<versión>-google-play.md` en inglés y español.
4. Agrega la entrada en `src/release-notes/catalog.ts` y los textos EN/ES en
   `src/lang/messages/whatsNew.ts`.
5. Mantén los mismos hechos en Play y en la app, pero minimiza el texto en Play para no superar el limite de caracteres (explica lo mismo en menos espacio); usa viñetas `•` y lenguaje para usuarios.
6. Actualiza `docs/README.md` y ejecuta typecheck, Jest y `docs:audit`.
7. No modifiques el flujo de detección de novedades.
