# AGENTS.md — src/domain

Reglas locales de la lógica pura. El procedimiento está en la skill
`pockettool-domain` y la referencia en
[`../../docs/architecture/domains.md`](../../docs/architecture/domains.md).

- El dominio es puro: sin React, sin UI, sin SQLite, sin AsyncStorage y sin
  efectos secundarios.
- Dinero en centavos enteros. El dominio no formatea moneda; la UI usa
  `src/utils` y `FinanceValue`.
- Las reglas compartidas de efecto, gasto y balance viven en
  `src/domain/summaries/`; no las dupliques en pantallas.
- Cada área tiene su carpeta: `budgets`, `credits`, `savings`, `vehicle`,
  `records`, `filters`, `shared`, `summaries`.
- Los builders de gráficos devuelven datos, no componentes ni colores
  hardcodeados; la UI decide tokens y leyenda.
- Los repartos compartidos deben reconciliar la suma; usa
  `src/domain/shared/split.ts`.
- Los tests viven en `<área>/__tests__/` y cubren bordes: cero, negativos,
  redondeo, tasas, plazos, división entre personas y periodos.
- Si el cambio altera una regla visible para el usuario, actualiza la ayuda con
  `pockettool-help`.
