---
description: Ejecuta la verificación completa del proyecto
agent: general
---

Ejecuta la verificación completa de PocketTool:

```bash
npm run typecheck
npm run test:db
npm test
npm run lint
npm run docs:audit
```

- Si un comando falla, muestra el error real, el archivo y la causa.
- No ocultes fallos ni los resumas como “la acción no se pudo completar”.
- No corrijas nada sin pedir confirmación.
- Al final, entrega una tabla con comando, resultado y duración aproximada.
