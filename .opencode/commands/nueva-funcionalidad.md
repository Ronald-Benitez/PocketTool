---
description: Planifica una nueva funcionalidad de PocketTool en modo plan
agent: plan
---

Analiza la funcionalidad: $ARGUMENTS

Trabaja SOLO en modo plan: investiga, propone y pregunta; no edites archivos.

1. Reformula el objetivo y los criterios de aceptación.
2. Detecta áreas afectadas: UI, DB/esquema, dominio, Records, i18n/ayuda,
   pruebas y documentación.
3. Carga las skills que apliquen:
   - `pockettool-ui` si hay pantallas, componentes, formularios o modales.
   - `pockettool-db` si hay tablas, migraciones, repositorios o errores SQLite.
   - `pockettool-domain` si hay dinero, cálculos o reglas de negocio.
   - `pockettool-records` SIEMPRE que la funcionalidad mueva dinero; decide
     crear, vincular u omitir. Si no aplica, explica por qué.
   - `pockettool-help` por defecto para cualquier cambio visible.
4. Entrega un plan con: objetivo, archivos, modelo/migración, UI, reglas,
   Registros, pruebas, ayuda, documentación, riesgos y verificación.
5. Pregunta solo lo que no puedas decidir con el código y la documentación.
6. No implementes. Espera aprobación y cambio a agente de ejecución.
