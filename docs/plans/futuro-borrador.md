# Borrador — Pendientes futuros

**Cuándo leer:** al planificar una fase posterior a la 13.
**Resumen:** pendientes que no forman parte de las fases cerradas.
No implementar aquí sin convertirlos en una fase con plan aprobado.
**Secciones:** [Plan mensual](#plan-mensual) · [Otros](#otros)

## Plan mensual

**Situación:** `BudgetSummaryBlock` llama `useBudgetPlan(group?.id)` sin pasar el
modo, por lo que usa `own` por defecto. El bloque muestra el grupo seleccionado,
el total planificado y el real de gastos, y hasta 5 líneas de gasto; no sigue
`Tu parte / Compartido / Total / Propio bruto`.

**Propuesta:** queda pendiente para una actualización futura de la sección de
Presupuestos. Al abordarlo, pasar el modo de importe activo a `useBudgetPlan`.
Los importes planificados no se reparten por persona; solo cambiaría el real.
Mantenerlo en consumo (no caja), porque el plan no tiene liquidaciones.

## Otros

- Evaluar un botón manual de actualizar en Resúmenes si el refresco por foco no
  cubre algún flujo. Hoy el refresco por foco está implementado en Inicio,
  Registros, Resúmenes y Personas.
- Revisar el comportamiento de `GroupSelector` al borrar el último grupo si
  aparece otro flujo que no pase por la limpieza actual.
