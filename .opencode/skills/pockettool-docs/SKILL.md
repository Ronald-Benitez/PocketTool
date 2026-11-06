---
name: pockettool-docs
description: Mantiene y audita la documentación de PocketTool sin duplicar reglas ni crear archivos gigantes. Úsala para /docs-audit, para dividir documentos, actualizar índices o decidir qué va en AGENTS.md, skills y docs/.
---

# PocketTool Docs

## Presupuesto

| Archivo | Límite |
| --- | ---: |
| `AGENTS.md` | 8 KB |
| `docs/phases.md` | 12 KB |
| `docs/architecture/*.md` | 12 KB |
| Skills (`.opencode/skills/*/SKILL.md`) | 4 KB |
| Comandos (`.opencode/commands/*.md`) | 2 KB |
| Docs no generados ni legacy | 20 KB |
| `docs/schema.md`, `docs/legacy/*` | Exentos, con reglas propias |

## Dónde va cada cosa

- **Regla que aplica siempre:** `AGENTS.md` raíz.
- **Regla de un área:** `AGENTS.md` anidado (`src/ui`, `src/db`, `src/domain`,
  `app`, `src/lang`, `docs/legacy`).
- **Procedimiento repetible:** skill.
- **Atajo de invocación:** comando.
- **Explicación larga o histórica:** `docs/` o `docs/legacy/`.
- **Estado y fase activa:** `docs/phases.md`.
- **Esquema:** `docs/schema.md` generado; no editar.

No dupliques una regla en dos capas. Si necesitas repetirla, enlaza.

## Auditar

1. Ejecuta `npm run docs:audit`.
2. Revisa archivos sobre presupuesto y documentos con `**Resumen:**` faltante.
3. Propón una de estas acciones: recortar, dividir, mover a `docs/legacy/` o
   convertir en skill.
4. Verifica enlaces internos y que `docs/README.md` siga siendo el índice.
5. No edites sin aprobación si estás en modo plan.

## Escribir documentación

- Empieza con `**Cuándo leer:**`, `**Resumen:**` y `**Secciones:**` si el
  documento es largo.
- Usa encabezados estables y enlaces relativos.
- No pegues inventarios de archivos que se pueden descubrir con `rg`/`glob`.
- No repitas el estado de las fases fuera de `docs/phases.md`.
- Los ejemplos usan datos ficticios.
- Al mover un documento, actualiza `docs/README.md` y los enlaces entrantes.

## Histórico

- `docs/legacy/` no es documentación vigente.
- Cada plan archivado necesita resumen, estado, fecha y mapa de secciones.
- `docs/legacy/AGENTS.md` recuerda no leer los planes completos.

## Referencias

- `docs/README.md`
- `scripts/docs-audit.js`
- `docs/phases.md`
