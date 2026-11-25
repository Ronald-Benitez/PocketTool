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

1. Crea o ajusta tipos y funciones puras en `src/domain/<área>/`. Las áreas y
   sus invariantes están en `src/domain/AGENTS.md` y en
   `docs/architecture/domains.md`; no las dupliques aquí.
2. Respeta las reglas de dominio puro, centavos, reglas compartidas de summary,
   reparto reconciliado y builders sin colores.
3. Agrega pruebas en `<área>/__tests__/` cubriendo bordes y casos reales.
4. Consume el dominio desde hooks, stores o repositorios; no desde SQL.
5. Actualiza la ayuda si cambió una regla visible.
6. Verifica con `npm test`, `npm run typecheck` y `npm run lint`.

## Referencias

- `src/domain/AGENTS.md`
- `docs/architecture/domains.md`
- `docs/legacy/*-plan.md` solo si necesitas el detalle histórico de una decisión.
