# AGENTS.md — src/release-notes

Reglas de mantenimiento de “Qué hay de nuevo”.

- El catálogo es **manual y versionado**. No generes novedades en tiempo de
  ejecución ni desde la app.
- Cada entrega de tienda agrega una entrada en `catalog.ts` con `version`,
  `date` e items (`feature`, `improvement`, `fix`).
- Los textos viven en `src/lang/messages/whatsNew.ts` en inglés y español; no
  uses cadenas sueltas ni copies las notas de Play sin adaptarlas.
- `/notas-version <versión>` es el flujo único de entrega: sube la versión en
  `package.json`, `package-lock.json` y `app.json`, crea
  `docs/release-notes/<versión>-google-play.md` y actualiza catálogo, textos,
  pruebas e índice de documentación.
- Las notas de Play y las de la app deben contar los mismos hechos. Las de la
  app pueden agrupar o detallar más, pero no anunciar algo que no existe.
- Mantén las versiones ordenadas, sin duplicados y con la versión actual
  incluida; `catalog.test.ts` lo valida.
- No modifiques la clave `whatsNewLastSeenVersion` ni el flujo de detección para
  “corregir” una entrega. La excepción de lanzamiento 4.0.5 es histórica.
- Actualiza la ayuda `whatsNew` solo si cambia el comportamiento visible.
