# Plan de fases

**Cuándo leer:** al consultar el estado vigente, la fase activa o el resumen
histórico de PocketTool.
**Resumen:** estado de las fases, fase activa, resumen de arquitectura y enlaces
a las decisiones canónicas. Las reglas no viven aquí.
**Secciones:** Estado · Fase activa · Arquitectura actual · Fases 0–18 ·
Decisiones.

**Última actualización:** 2026-11-20

## Estado

| Fase | Estado | Fecha |
| --- | --- | --- |
| Fase 0 — Correcciones críticas | ✅ Finalizada | 2026-10-28 |
| Fase 1 — Fuente única de verdad del esquema | ✅ Finalizada | 2026-10-28 |
| Fase 2 — Repositorios y ORM robusto | ✅ Finalizada | 2026-10-28 |
| Fase 3 — Calidad, pruebas y operación | ✅ Finalizada | 2026-10-28 |
| Fase 4 — Sistema de UI reutilizable | ✅ Finalizada | 2026-10-29 |
| Fase 5 — Traducciones tipadas | ✅ Finalizada | 2026-10-29 |
| Fase 6 — Centro de ayuda | ✅ Finalizada | 2026-10-29 |
| Fase 7 — Presupuestos | ✅ Finalizada | 2026-10-29 |
| Fase 8 — Vehículo | ✅ Finalizada | 2026-10-31 |
| Fase 9 — Gastos fijos y Créditos | ✅ Finalizada | 2026-11-03 |
| Fase 10 — Errores y ajustes de siguiente versión | ✅ Finalizada | 2026-11-03 |
| Fase 11 — Ahorros compartidos y metas | ✅ Finalizada | 2026-11-04 |
| Fase 12 — Compras compartidas, saldo por persona y doble balance | ✅ Finalizada | 2026-11-11 |
| Fase 13 — Pendientes de Fase 12 y ajustes de Registros/Vehículo | ✅ Finalizada | 2026-11-17 |
| Fase 14 — “Qué hay de nuevo” acumulado | ✅ Finalizada | 2026-11-17 |
| Fase 15 — Fechas de pagos pendientes de tarjeta y fijos | ✅ Finalizada | 2026-11-18 |
| Fase 16 — Cierre informativo de periodo | ✅ Finalizada | 2026-11-18 |
| Fase 17 — Grupos automáticos y periodos unificados | ✅ Finalizada | 2026-11-19 |
| Fase 18 — Motor de gráficos nativo | ✅ Finalizada | 2026-11-19 |
| Fase 19 — Experiencia configurable y simplificación | 🚧 En proceso | — |

## Fase activa

**Fase 19 — Experiencia configurable y simplificación**

- **Inicio:** 2026-11-20.
- **Plan:** [`plans/fase-19-experiencia.md`](plans/fase-19-experiencia.md).
- **Estado:** en proceso.

`/cerrar-fase` busca este encabezado para saber qué fase cerrar. Si no existe,
se detiene y pide cuál cerrar.

## Arquitectura actual (resumen)

- **Esquema y datos:** `src/db/schema/tables.ts` es la fuente única; los
  artefactos se generan con `npm run db:generate`. ORM tipado y repositorios;
  detalles en [`database.md`](database.md).
- **Dinero, fechas y borrado:** centavos enteros, timestamps Unix y soft delete
  con `deleted_at`. Reglas en [`../AGENTS.md`](../AGENTS.md).
- **UI e i18n:** sistema propio en `src/ui`, tema por tokens y textos con `t()`.
  Ver [`architecture/ui.md`](architecture/ui.md).
- **Experiencia:** niveles, flags por módulo y captura en
  [`architecture/features.md`](architecture/features.md).
- **Dominio y Registros:** lógica pura por área y create/link/omit de `Records`
  en la misma transacción. Ver [`architecture/domains.md`](architecture/domains.md)
  y la skill `pockettool-records`.
- **Calidad:** typecheck, `test:db`, Jest, lint y `docs:audit` en CI. Ver
  [`../AGENTS.md`](../AGENTS.md) → Verificación.

## Fases 0–3 — Base técnica (✅ 2026-10-28)

Detalle completo en [`legacy/phase-history.md`](legacy/phase-history.md).

- Fase 0: unificación de la capa de acceso, migraciones, seed idempotente,
  soft delete, integridad, export/import y limpieza de deuda.
- Fase 1: esquema declarativo en `tables.ts`, artefactos generados, migraciones
  como evolución y nombres normalizados.
- Fase 2: repositorios por agregado, ORM tipado, validación en bordes y tipos
  unificados.
- Fase 3: pruebas, export/import v2, rendimiento, CI, auditoría de timestamps y
  ESLint.

## Fase 4 — Sistema de UI reutilizable (✅ 2026-10-29)

Detalle en [`legacy/ui-history.md`](legacy/ui-history.md) y plan original en
[`legacy/ui-plan.md`](legacy/ui-plan.md).

- Tokens, paletas bright/dark, `ThemeProvider`, modo `system`/`light`/`dark` y
  editor de colores.
- Primitivas, acciones, formularios, overlays, feedback, filtros y componentes
  de datos en `src/ui`.
- Migración de formularios, selects, modales, toasts y listas principales.
- Filtros tipados para Records y Summary; lint que bloquea primitivas nativas.

## Fases 5–6 — Traducciones y ayuda (✅ 2026-10-29)

Plan archivado en [`legacy/i18n-help-plan.md`](legacy/i18n-help-plan.md).

- Fase 5: `src/lang/messages/` bilingüe co-localizado, `MessageShape`,
  `TranslationKey`, helpers de claves dinámicas y `LanguageContext` tipado.
- Fase 6: hub de ayuda con búsqueda, `HelpTopicView`, 10 temas iniciales,
  contenido bilingüe y tests de registro.

## Fase 7 — Presupuestos (✅ 2026-10-29)

Plan completo en [`legacy/budget-plan.md`](legacy/budget-plan.md).

- `BudgetPlans`/`BudgetLines` y plantillas reutilizables; migraciones
  `0004`–`0006` y eliminación de `budgets_legacy`.
- Comparación plan/real derivada de `Records`, proyección, insights y builders
  Mermaid.
- Editor de plan, plantillas, aplicar `merge`/`replace`/`reset`, copiar mes
  anterior y crear desde fijos o media de grupos.
- Mermaid vendorizado offline con tema, accesibilidad y fallback a tabla.
- Ayuda `budgets` y `budgetTemplates`; `npm run ci` y `lint` en verde.

## Fase 8 — Vehículo (✅ 2026-10-31)

Plan completo en [`legacy/vehicle-plan.md`](legacy/vehicle-plan.md).

- Migraciones `0007`–`0010`; vehículos, combustible, mantenimiento, piezas,
  recordatorios, settings y vínculos con `Records`.
- Unidades `mi`/`km` y `gal`/`L`, consumo, segmentos de tanque lleno, odómetro
  efectivo y recordatorios.
- Varios vehículos, visuales SVG animados, color por nombre/HEX/paleta y
  preferencias de unidades por vehículo.
- Resumen, estadísticas, históricos y gráficos Mermaid responsivos.
- Verificación: typecheck, 84 tests, `test:db`, lint, doctor y export Android.

## Fase 9 — Gastos fijos y Créditos (✅ 2026-11-03)

Plan completo en [`legacy/credits-fixed-plan.md`](legacy/credits-fixed-plan.md).

- Tarjetas de crédito con límite, corte, pago, visual y modelos no crediticios.
- `Financings`, `FinancingPayments` y `FinancingAdjustments`; cuota francesa,
  tasa cero, pagos, abonos a capital, refinanciamientos y simulaciones.
- Resumen de deuda, cuota, tasa media y tiempo restante; próximos pagos y
  gráficos de saldo/composición.
- Compras a plazo al 0% reducen el crédito disponible de la tarjeta.
- Cada pago puede crear, vincular o no vincular un `Record`; ayuda bilingüe de
  financiamientos y QA Android/iOS completados.

## Fase 10 — Errores y ajustes de siguiente versión (✅ 2026-11-03)

Plan completo en [`legacy/next-version-plan.md`](legacy/next-version-plan.md).

- Créditos/préstamos pendientes en Registros, tipo de registro de Vehículo,
  odómetro efectivo y financiamientos en resúmenes de fijos.
- Renombre a Compromisos, cambio de grupo en Resumen y personas como sección
  propia con ledger de pagos compartidos.
- Compartidos ilimitados, snapshot propio/compartido en `Records` y modos de
  importe propio/total/compartido.
- Temas de ayuda de Personas y “Tu parte / Total / Compartido”.

## Fase 11 — Ahorros compartidos y metas (✅ 2026-11-04)

Plan completo en [`legacy/savings-plan.md`](legacy/savings-plan.md).

- Migraciones `0017`–`0020`; `Savings` con meta, estado, archivo, regla de
  aporte, interés y cachés; `SavingsSettings`.
- Movimientos tipados con persona, periodo, notas y vínculo a `Records`;
  dominio de balances, metas, aportes, proyección y gráficos.
- UI de Ahorros con resumen global/propio/compartido, trofeo, historial y
  detalle de movimiento de solo lectura.
- Selector de origen del dinero en `Records`; los gastos pagados con ahorro se
  excluyen del gasto del mes.
- Personas con aportes y saldo en ahorros; pruebas de migración, movimientos,
  saldo insuficiente y vínculo/desvínculo.

## Fase 12 — Compras compartidas, saldo por persona y doble balance (✅ 2026-11-11)

Plan completo en [`legacy/shared-purchases-plan.md`](legacy/shared-purchases-plan.md).

- Migraciones `0021` y `0022`: pagador y alcance en `Records`, y
  `PersonSettlements` para liquidaciones por persona y grupo.
- Compras compartidas con participantes y pagador; fijos con total, solo mi
  parte o pagó otra persona.
- Estado de cuenta por persona con saldo, movimientos y liquidaciones totales o
  parciales; aviso de saldos al crear un grupo.
- Doble balance consumo/caja y modos `Tu parte`, `Compartido`, `Total` y
  `Propio bruto`.
- Ayuda bilingüe `sharedPurchases` y `settlements`. Commits: `5622d5c`,
  `d61072b`.

## Fase 13 — Pendientes de Fase 12 y ajustes de Registros/Vehículo (✅ 2026-11-17)

Plan completo en [`legacy/pending-adjustments-plan.md`](legacy/pending-adjustments-plan.md).

- Migración `0023`: reparto por porcentaje o monto en compartidos; ahorros
  sigue solo con porcentaje.
- Refresco global tras combustible, mantenimiento y ahorros; ahorros con monto
  inicial 0.
- Pickers centrados con altura máxima y scroll.
- Fecha configurable de pagos pendientes de tarjeta y distancia por segmento en
  gasolina, con memoria de “Use odometer” por vehículo.
- Limpieza de datos en memoria al borrar el último grupo. Commit: `0265179`.

## Fase 14 — “Qué hay de nuevo” acumulado (✅ 2026-11-17)

Plan completo en [`legacy/whats-new-plan.md`](legacy/whats-new-plan.md).

- Catálogo bilingüe versionado desde 4.0.5, con comparación semver y acumulación
  de versiones pendientes; instalaciones nuevas se marcan vistas salvo la
  excepción de lanzamiento 4.0.5.
- Modal único con todas las novedades, un botón “Entendido” y acceso manual
  desde la sección especial de Ayuda.
- `useWhatsNew` guarda `whatsNewLastSeenVersion` en AsyncStorage; no toca SQLite
  ni bloquea el arranque.
- `/notas-version` queda a cargo de las notas de Play, el catálogo in-app y el
  bump de versión.

## Fase 15 — Fechas de pagos pendientes de tarjeta y fijos (✅ 2026-11-18)

Plan en
[`legacy/fase-15-pending-dates-plan.md`](legacy/fase-15-pending-dates-plan.md).

- `next_payment_date`, modos de fijos y `usePendingFixeds` para Registros e
  Inicio; ayuda bilingüe y pruebas. Sin cambios de esquema.

## Fase 16 — Cierre informativo de periodo configurable (✅ 2026-11-18)

Plan en
[`legacy/fase-16-group-closing-plan.md`](legacy/fase-16-group-closing-plan.md).

- Migración `0024`: cierres configurables, balances, validación y backups.

## Fase 17 — Grupos automáticos y periodos unificados (✅ 2026-11-19)

Plan en
[`legacy/fase-17-group-periods-plan.md`](legacy/fase-17-group-periods-plan.md).

- Migración `0025`: periodo por grupo, creación automática y cierre unificado.

## Fase 18 — Motor de gráficos nativo (✅ 2026-11-19)

Plan en
[`legacy/fase-18-chart-engine-plan.md`](legacy/fase-18-chart-engine-plan.md).

- Migración `0026`: preferencias de gráficos en SQLite.
- Motor SVG con specs, tooltips multi-serie, colapsables y zoom.
- Migración total y eliminación de Mermaid/WebView/`gifted-charts`.

## Decisiones

Las reglas no negociables viven en [`../AGENTS.md`](../AGENTS.md) y en los
`AGENTS.md` de cada área. Las decisiones de dominio (compartidos por porcentaje o
monto, pagador, liquidaciones, pickers, modos de importe, cierre, ahorros y
gráficos) están en [`architecture/domains.md`](architecture/domains.md). Este
documento solo mantiene estado e historial; no dupliques reglas aquí.
