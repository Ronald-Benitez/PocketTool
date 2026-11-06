---
name: pockettool-domain
description: Implementa o revisa lógica pura de PocketTool en src/domain para presupuestos, créditos, ahorros, vehículo, resúmenes, filtros y repartos compartidos. Úsala cuando haya cálculos, dinero, tasas, proyecciones o reglas de negocio sin UI.
---

# PocketTool Domain

## En modo plan

1. Define entradas, salidas y unidades (centavos, milisegundos, porcentajes).
2. Enumera reglas y bordes: cero, negativos, redondeo, tasas, plazos, periodos,
   división entre personas y reconciliación de sumas.
3. Decide si la lógica pertenece a un módulo existente o a uno nuevo dentro de
   `src/domain/<área>/`.
4. Define la matriz de pruebas.
5. Si la regla es visible para el usuario, incluye la actualización de ayuda con
   `pockettool-help`.
6. No edites archivos; entrega tipos, funciones y pruebas.

## En modo build

1. Crea o ajusta tipos y funciones puras en `src/domain/<área>/`.
2. Sin React, sin UI, sin SQLite, sin AsyncStorage y sin efectos secundarios.
3. Dinero en centavos enteros. No formatees moneda en el dominio; la UI usa
   `src/utils` y `FinanceValue`.
4. Las reglas de efecto, gasto y balance van en `src/domain/summaries/` y se
   comparten con presupuestos y resúmenes.
5. Los repartos compartidos usan `src/domain/shared/split.ts` y deben reconciliar
   la suma.
6. Los builders de gráficos devuelven datos, no componentes ni colores; la UI
   decide tokens y leyenda.
7. Agrega pruebas en `<área>/__tests__/` cubriendo bordes y casos reales.
8. Consume el dominio desde hooks, stores o repositorios; no desde SQL.
9. Actualiza la ayuda si cambió una regla visible.
10. Verifica con `npm test`, `npm run typecheck` y `npm run lint`.

## Áreas existentes

- `budgets`: comparación plan/real, proyección, insights y charts.
- `credits`: amortización, pagos, resumen, tarjetas, simulaciones y charts.
- `savings`: balances, metas, aportes, movimientos y charts.
- `vehicle`: unidades, consumo, odómetro efectivo, recordatorios, colores y
  charts.
- `summaries`: efecto, gasto y balance compartidos.
- `shared`: reparto de montos entre personas.
- `records` y `filters`: matcher, orden y campos de filtros.

## Referencias

- `src/domain/AGENTS.md`
- `docs/architecture/domains.md`
- `docs/legacy/*-plan.md` solo si necesitas el detalle histórico de una decisión.
