---
description: Audita el tamaño, la duplicación y los índices de la documentación
agent: plan
---

Audita la documentación de PocketTool sin editar archivos.

1. Carga la skill `pockettool-docs`.
2. Ejecuta `npm run docs:audit`.
3. Revisa los archivos que excedan su presupuesto y los legacy sin resumen.
4. Busca duplicación entre `AGENTS.md`, las skills, `docs/phases.md` y
   `docs/architecture/`.
5. Verifica que `docs/README.md` sea un índice completo y que los enlaces
   internos funcionen.
6. Propón recortes, divisiones, archivos a archivar o reglas a mover a skills.
7. No edites sin aprobación.
