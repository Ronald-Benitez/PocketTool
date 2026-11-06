---
name: pockettool-phase-close
description: Cierra la fase activa de PocketTool. Detecta la fase en docs/phases.md, verifica pruebas y QA, actualiza el estado, archiva el plan en docs/legacy y ejecuta la verificación completa. Úsala desde /cerrar-fase.
---

# PocketTool Phase Close

## Detectar la fase activa

1. Lee `docs/phases.md` y busca el encabezado `^## Fase activa`.
2. Si dice `No hay fase activa`, detente y pide al usuario que indique o cree la
   fase activa. No inventes una fase.
3. Si hay una, usa su número, nombre, fecha de inicio y plan.

## Antes de cerrar

1. Revisa el plan y los criterios de aceptación.
2. Confirma que la implementación está completa y que no quedan pendientes
   críticos.
3. Revisa que la ayuda (`pockettool-help`) esté actualizada si hubo cambios
   visibles.
4. Si faltan pruebas o QA, lista los pendientes y **no** marques la fase como
   finalizada.

## Verificación

Ejecuta y registra el resultado:

```bash
npm run typecheck
npm run test:db
npm test
npm run lint
npm run doctor
npm run docs:audit
```

Ejecuta `npx expo export --platform android` cuando la fase toque código de
producto o Expo. No bloquees por web.

## Actualizar documentación

1. `docs/phases.md`:
   - mueve la fase de “Fase activa” a la tabla de estado;
   - marca `✅ Finalizada` con fecha;
   - deja 3–5 bullets de resultado y enlaces;
   - agrega commits principales y verificaciones;
   - deja “Fase activa” en `No hay fase activa`.
2. `docs/README.md`: actualiza la tabla de estado y el índice si hay documentos
   nuevos.
3. `AGENTS.md`: actualiza solo la línea de estado o una regla si cambió.
4. Archiva el plan en `docs/legacy/<nombre>-plan.md` con:
   - `**Resumen:**`, `**Estado:**`, `**Fecha:**`, `**Leer solo si:**`;
   - `## Secciones` con nombres y líneas;
   - el detalle de implementación.
5. `docs/legacy/README.md`: agrega una línea al índice.
6. `docs/architecture/` y `docs/database.md`: actualiza si cambió la
   arquitectura o el esquema.
7. Si el plan estaba en otro sitio, elimina el duplicado.

## Cierre

- Pide confirmación antes de marcar la fase como finalizada.
- Reporta: fase cerrada, verificaciones, documentos tocados, commits y
  pendientes.
- No cierres una fase con errores de typecheck, tests, `test:db`, lint, doctor o
  presupuesto de documentación.

## Referencias

- `docs/phases.md`
- `docs/README.md`
- `docs/legacy/README.md`
- skill `pockettool-docs`
