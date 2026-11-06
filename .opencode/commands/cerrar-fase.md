---
description: Cierra la fase activa de PocketTool y actualiza la documentación
agent: general
---

Cierra la fase activa del proyecto.

1. Lee `docs/phases.md` y localiza el encabezado `## Fase activa`.
2. Si dice que no hay fase activa, detente y pide al usuario que indique o cree
   la fase activa. No inventes una fase.
3. Carga la skill `pockettool-phase-close` y sigue su checklist.
4. Verifica que la implementación y las pruebas estén completas. Si faltan,
   lista los pendientes y no marques la fase como finalizada.
5. Ejecuta typecheck, `test:db`, Jest, lint, doctor y `docs:audit`.
6. Actualiza `docs/phases.md`, `docs/README.md` y el archivo histórico.
   Actualiza `AGENTS.md` solo si cambió una regla o el flujo de trabajo.
7. Pide confirmación antes de marcar la fase como finalizada.
