---
description: Planifica una funcionalidad con decisión breve y anexo técnico
agent: plan
---

Analiza la funcionalidad: $ARGUMENTS

Trabaja SOLO en modo plan: investiga, propone y pregunta; no edites archivos.

## Objetivo de la respuesta

Ayudar a **decidir**, no demostrar análisis. La primera parte debe leerse en
menos de un minuto; el detalle técnico va después y solo si cambia la decisión.

## Formato obligatorio

### Decisión

- Resultado esperado en 1–2 frases.
- 3–5 bullets de alcance y beneficio para el usuario.
- **Decisiones pendientes:** máximo 3, cada una con opción recomendada primero.
- **Impacto:** tabla de máximo 6 filas (`UI`, `DB`, `Dominio`, `Registros`,
  `i18n/ayuda`, `Pruebas/docs`) con `Sí/No` y una frase. Si no aplica, escribe
  “No aplica” y no lo desarrolles.

### Plan

- 3–7 pasos con resultado verificable y archivos principales; no inventarios
  completos.
- Criterios de aceptación: máximo 6, medibles.
- Riesgos: máximo 3, con mitigación.
- Verificación: solo comandos y QA relevantes.

### Anexo técnico (opcional)

Inclúyelo solo si la decisión depende de él: modelo/migración, contratos,
pruebas, ayuda o documentación. Si no aporta, omítelo.

## Reglas

- Carga solo las skills que apliquen. Resume su impacto; no copies su checklist.
- `pockettool-records` aplica si se mueve dinero; indica crear, vincular u
  omitir o explica por qué no aplica.
- No repitas hallazgos del código, arquitectura existente ni reglas de AGENTS.
- Elimina información que no cambie una decisión, un riesgo o un paso.
- Evita repetir el objetivo, listar todos los archivos, escribir criterios
  exhaustivos o explicar lo que ya funciona.
- Si la funcionalidad es grande, propone fases y pide elegir alcance.
- Pregunta solo lo bloqueante; si puedes decidir con el código, decide y
  registra el supuesto.
- No implementes. Espera aprobación y cambio a agente de ejecución.
