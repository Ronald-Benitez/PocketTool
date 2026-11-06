# Plan de fases

**Última actualización:** 2026-11-05

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

## Fase activa

**No hay fase activa.**

Para iniciar una fase, reemplaza este bloque por:

```md
## Fase activa: 12 — Nombre de la fase
- Estado: 🚧 En curso
- Inicio: 2026-11-05
- Plan: docs/plans/fase-12.md
```

`/cerrar-fase` busca este encabezado para saber qué fase cerrar. Si no existe,
se detiene y pide cuál cerrar.

## Arquitectura actual (resumen)

- **Esquema:** `src/db/schema/tables.ts` es la fuente única; los artefactos de
  `src/db/schema/generated/` y `docs/schema.md` se generan con
  `npm run db:generate`.
- **Dinero/fechas:** centavos enteros y timestamps Unix en milisegundos.
- **Auditoría:** `created_at`/`updated_at` con triggers; soft delete con
  `deleted_at`.
- **Migraciones:** `0001` a `0020`; `SCHEMA_VERSION = 20`.
- **Acceso a datos:** ORM tipado + repositorios; la UI no usa `useORM` ni SQL.
- **Backups:** dump SQL con metadatos versionados y compatibilidad legacy.
- **Calidad:** `test:db` con `node:sqlite`, Jest, typecheck, lint bloqueante y
  CI en `.github/workflows/ci.yml`.
- **UI:** sistema propio en `src/ui/` con tema, tokens, primitivas, acciones,
  formularios, overlays, feedback y filtros. `src/styles/useThemedStyles.ts`
  adapta estilos legacy.
- **Idiomas:** `src/lang/messages/` es la fuente de verdad, con inglés y español
  co-localizados; `t()` se tipa con `TranslationKey`.
- **Ayuda:** `src/help/registry.ts` define los temas y
  `src/lang/messages/help.ts` el contenido bilingüe.
- **Registros:** toda operación que mueva dinero ofrece crear, vincular u omitir
  un `Record`, validando monto/fecha y evitando vínculos duplicados.

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
- Commits principales: `d1e7e13`, `1fbb2ec`, `8e51999`, `918bf45`, `e926413`,
  `2d7280b`, `a8ee207`, `099c3b4`, `5158797`, `e6069af`, `8b30c42`, `e7de4de`,
  `f54963d`, `70aa777`, `6a27346`, `0f61fb2`.

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
- Commits principales: `1f77b6a`, `3cc8dc8`, `6de9ff7`, `745f052`, `cf50c0b`,
  `4a3afaf`, `d454e75`, `f651333`, `7e03428`, `892875d`.

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
- Commits principales: `e3e6a7a`, `b7be5c4`, `2dc3bd8`, `17cdc4f`, `cf21572`,
  `e1a281c`, `789a125`, `e5a1fc0`, `5cc9684`, `b33df55`, `7dc8c1b`.

## Decisiones vigentes

- Tablas lógicas PascalCase, nombres físicos y columnas snake_case.
- Dinero en centavos; fechas en milisegundos.
- Soft delete por defecto; el ORM filtra borrados.
- Migraciones en transacción exclusiva y registro posterior al commit.
- Repositorios como única puerta de acceso desde stores y pantallas.
- Toda operación con impacto en cuentas ofrece crear, vincular u omitir un
  `Record`, validando monto/fecha y evitando vínculos duplicados.
- Backups con metadatos versionados y compatibilidad con dumps SQL antiguos.
- Lint bloqueante; CI ejecuta typecheck, artefactos, tests y lint.
- La UI nueva usa `src/ui`; los estilos legacy se adaptan con
  `useThemedStyles`.
- La ayuda se actualiza en el mismo cambio que la funcionalidad visible.

## Documentación

- [`README.md`](README.md): índice y contrato de documentación.
- [`database.md`](database.md): base de datos y reglas de lectura.
- [`schema.md`](schema.md): esquema generado.
- [`architecture/ui.md`](architecture/ui.md): sistema de UI.
- [`architecture/domains.md`](architecture/domains.md): reglas de negocio.
- [`legacy/README.md`](legacy/README.md): índice del archivo histórico.
- [`../AGENTS.md`](../AGENTS.md): reglas para agentes.
