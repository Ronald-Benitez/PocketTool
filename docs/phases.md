# Plan de fases

**Última actualización:** 2026-11-03

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
| Fase 10 - Errores y ajustes de siguiente versión | ✅ Finalizada | 2026-11-03 |

El detalle histórico de las fases 0–3 vive en
[`legacy/phase-history.md`](legacy/phase-history.md). El detalle de la Fase 4
vive en [`legacy/ui-history.md`](legacy/ui-history.md) y su plan original en
[`legacy/ui-plan.md`](legacy/ui-plan.md). Los planes de Presupuestos, Vehículo,
Gastos fijos/Créditos y de la siguiente versión están archivados en
[`legacy/budget-plan.md`](legacy/budget-plan.md),
[`legacy/vehicle-plan.md`](legacy/vehicle-plan.md),
[`legacy/credits-fixed-plan.md`](legacy/credits-fixed-plan.md) y
[`legacy/next-version-plan.md`](legacy/next-version-plan.md).

## Arquitectura actual (resumen)

- **Esquema:** `src/db/schema/tables.ts` es la fuente única; los artefactos de
  `src/db/schema/generated/` y `docs/schema.md` se generan con
  `npm run db:generate`.
- **Dinero/fechas:** centavos enteros y timestamps Unix en milisegundos.
- **Auditoría:** `created_at`/`updated_at` se llenan con triggers; soft delete
  con `deleted_at`.
- **Migraciones:** `0001_baseline`, `0002_audit_timestamps`,
  `0003_timestamp_triggers`, `0004_budget_plans`,
  `0005_drop_budget_legacy`, `0006_drop_budget_plan_status`,
  `0007_vehicle_module`, `0008_fuel_baseline`, `0009_vehicle_type`,
  `0010_vehicle_type_models`, `0011_credit_cards_and_financings`,
  `0012_financing_payment_cents`, `0013_vehicle_settings_record_type`,
  `0014_people_and_shared_participants`, `0015_records_shared_amounts`,
  `0016_shared_payment_allocations`; `SCHEMA_VERSION = 16`.
- **Presupuestos:** `BudgetPlans` (un plan por grupo), `BudgetLines` (categoría
  o fijo) y plantillas reutilizables. El real se deriva de `Records`; no se
  guarda. `budgets_legacy` se elimina en `0005`.
- **Vehículo:** `Vehicles`, `VehicleFuelEntries`, `VehicleMaintenance`,
  `VehicleMaintenanceItems`, `VehicleReminders`, `VehicleSettings` y
  `VehicleExpenseLinks`; dominio de unidades, segmentos de consumo, históricos y
  recordatorios. Los gastos se crean o vinculan con `Records`.
- **Gráficos:** `src/ui/charts/MermaidChart.tsx` renderiza Mermaid vendorizado
  en WebView, sin CDN, con tema y fallback a tabla.
- **Acceso a datos:** ORM tipado + repositorios. La UI no usa `useORM` ni SQL.
- **Backups:** dump SQL con cabecera de metadatos y compatibilidad legacy.
- **Calidad:** `test:db` con `node:sqlite`, Jest, typecheck, lint bloqueante y
  CI en `.github/workflows/ci.yml`.
- **UI:** `src/ui/` contiene el sistema de componentes, tema y filtros.
  `src/components/ui` fue retirado; los resúmenes viven en
  `src/components/summaries` y los estilos legacy se adaptan con
  `src/styles/useThemedStyles.ts`.
- **Idiomas:** `src/lang/messages/` es la fuente de verdad, con inglés y español
  co-localizados por dominio. `t()` se tipa con `TranslationKey` y permite
  autocompletado. No quedan JSON de traducciones.
- **Ayuda:** `src/help/registry.ts` define los temas y
  `src/lang/messages/help.ts` el contenido bilingüe. Ver `AGENTS.md` para el
  mantenimiento.

## Fase 4 — Sistema de UI reutilizable (✅ 2026-10-29)

Se implementó:

- Tokens, paletas bright/dark, `ThemeProvider`, modo `system`/`light`/`dark` y
  editor de colores.
- Primitivas, acciones, formularios, overlays, feedback, filtros y componentes
  de datos en `src/ui`.
- Migración de formularios, selects, modales, toasts y listas principales.
- Filtros tipados y reutilizables para Records y Summary.
- Limpieza de componentes legacy y regla de lint para primitivas nativas.

Pendiente de QA: checklist visual en iOS/Android/web. El detalle y los commits
están en [`legacy/ui-history.md`](legacy/ui-history.md).

## Fase 5 — Traducciones tipadas (✅ 2026-10-29)

**Documento de referencia:** [`legacy/i18n-help-plan.md`](legacy/i18n-help-plan.md)

Implementado:

- `src/lang/messages/` con dominios bilingües co-localizados.
- `MessageShape` para validar paridad entre `en` y `es`.
- `TranslationKey` tipado y `t()` con autocompletado, interpolación y fallback.
- Helpers para claves dinámicas (`monthKey`, `dayShortKey`, etc.).
- `LanguageContext` sin `any` y con `useLanguage()` tipado.
- Eliminados `en.json`, `es.json`, `records-filters.*.json` y
  `src/interfaces/lang.ts`.
- Tests en `src/lang/__tests__/messages.test.ts`.

## Fase 6 — Centro de ayuda (✅ 2026-10-29)

**Documento de referencia:** [`legacy/i18n-help-plan.md`](legacy/i18n-help-plan.md)

Implementado:

- Hub con búsqueda y detalle maestro-detalle en `app/(help)/index.tsx`.
- `HelpTopicView` con secciones: qué es, cómo funciona, pasos, ejemplo, consejos
  y error común.
- `src/help/registry.ts` con 10 temas y relaciones.
- Contenido bilingüe en `src/lang/messages/help.ts`.
- Búsqueda normalizada por título, resumen, secciones y pasos.
- Tests en `src/help/__tests__/registry.test.ts`.
- Instrucciones de mantenimiento en `AGENTS.md`.

## Fase 7 — Presupuestos (✅ 2026-10-29)

**Plan completo:** [`legacy/budget-plan.md`](legacy/budget-plan.md)

Objetivo: terminar y publicar la sección de Presupuestos con un plan mensual
comparado contra los registros reales, plantillas reutilizables, integración con
resúmenes y transacciones fijas, y gráficos Mermaid renderizados en WebView.

Implementado:

- **BUD-0/1:** `BudgetPlans`, `BudgetLines`, plantillas ampliadas, migraciones
  `0004`–`0006`, `SCHEMA_VERSION = 6`, zod y artefactos regenerados. Se eliminó
  el estado de plan y `budgets_legacy`.
- **BUD-2:** `src/domain/budgets` y `src/domain/summaries` con reglas
  compartidas de gasto, comparación, proyección, insights y builders Mermaid;
  `useBudgetPlansRepository` y `useBudgetTemplatesRepository`;
  `BudgetPlanView`.
- **BUD-3:** pantallas de plantillas, editor de líneas, aplicar
  `merge`/`replace`/`reset`, guardar plan como plantilla, copiar mes anterior,
  crear desde fijos, desde gastos actuales y desde la media de grupos
  seleccionables.
- **BUD-4:** pantalla principal de Presupuestos con `StackBase`, editor de plan,
  eliminación de plan para recrearlo, líneas con detalle de registros, sección
  de fijos (incluidos inactivos), sin planificar y estados; bloque “Plan vs.
  real” en Resúmenes.
- **BUD-5:** `react-native-webview` + Mermaid 11 vendorizado offline,
  `MermaidChart`, tema, accesibilidad, modos de gráfico (comparación, salud,
  distribución y proyección) y fallback a tabla.
- **BUD-6:** ruta publicada en el drawer, i18n `budget`, ayuda `budgets` +
  `budgetTemplates`, documentación y pruebas.

Estado: **Fase finalizada**. QA visual validado en dispositivo, Mermaid
funcional e import/export sin impacto porque la versión en producción usa el
esquema anterior a Presupuestos. Web queda fuera de alcance por decisión de
producto.

Criterios de aceptación principales:

- un plan por grupo y líneas sin duplicados;
- comparación plan/real consistente con resúmenes;
- plantillas aplicables y reutilizables;
- fijos pendientes/confirmados integrados;
- Mermaid offline con tema claro/oscuro y fallback;
- migración preservando datos;
- `npm run ci` y `npm run lint` en verde;
- ayuda y traducciones actualizadas.

## Fase 8 — Vehículo (✅ 2026-10-31)

**Plan completo:** [`legacy/vehicle-plan.md`](legacy/vehicle-plan.md)

Objetivo: publicar la sección Vehículo y convertirla en un módulo de combustible,
mantenimiento, estadísticas y recordatorios, con unidades configurables e
integración con Registros.

Estado: **Fase finalizada y validada en dispositivo**. El plan original queda
archivado como referencia histórica.

Implementado:

- **VEH-1:** migraciones `0007_vehicle_module`, `0008_fuel_baseline`,
  `0009_vehicle_type` y `0010_vehicle_type_models`, `SCHEMA_VERSION = 10`,
  tablas de vehículos, combustible, mantenimiento, piezas, recordatorios,
  settings y vínculos de gastos. Eliminación de `fuel_refills`/`trip_logs` con
  conservación legacy.
- **VEH-2:** dominio de unidades, consumo, promedios, segmentos de tanque lleno y
  recordatorios; repositorios y vínculos transaccionales con `Records`.
- **VEH-3:** varios vehículos con predeterminado, odómetro/distancia manual,
  unidades `mi`/`km` y `gal`/`L`, cálculo del tercer valor entre volumen, precio
  y total, y ocho formatos de consumo.
- **VEH-4:** mantenimiento, piezas flexibles, cambio de aceite, recordatorios,
  reutilización de mantenimientos y creación de recordatorios con detección de
  duplicados.
- **VEH-5:** resumen, estadísticas, históricos por mes real o grupo, mejor/peor
  segmento, distancia total, combustible total, precio medio, gráficos de gasto,
  progresión y comparación combustible vs mantenimiento.
- **VEH-6:** sección publicada en el drawer, i18n bilingüe, centro de ayuda, QA
  visual Android/iOS y cierre documental.

Ajustes finales validados:

- Crear, vincular o no vincular gastos desde combustible y mantenimiento.
- Grupo del mes desde el selector global de Registros.
- Segmentos de tanque lleno con cargas parciales agrupadas con el siguiente
  tanque lleno.
- Listas ordenadas por fecha descendente.
- Recordatorios inactivos etiquetados como “Inactivo”.
- Recordatorios próximos o vencidos visibles en el inicio.
- Historial por mes real o grupo, con totales de combustible, distancia, consumo
  y precio.
- Gráficos Mermaid responsivos con scroll, zoom, límite de datos y switches para
  activar/desactivar categorías.

Decisiones y límites vigentes:

- v1 solo gasolina; eléctrico, híbrido enchufable y propano quedan para futuro.
- Web fuera del alcance de soporte.
- Los gastos sin vínculo aparecen como “Sin grupo” en el historial agrupado.

Commits principales: `d1e7e13`, `1fbb2ec`, `8e51999`, `918bf45`, `e926413`,
`2d7280b`, `a8ee207`, `099c3b4`, `5158797`, `e6069af`, `8b30c42`, `e7de4de`,
`f54963d`, `70aa777`, `6a27346`, `0f61fb2`.

Verificaciones de cierre:

- `npm run typecheck`
- `npm test` (84 tests)
- `npm run test:db`
- `npm run lint` (0 errores)
- `npm run doctor` (20/20 checks)
- `npx expo export --platform android`

Ajustes posteriores implementados (2026-11-01 y 2026-11-02):

- Registro inicial de combustible solo con odómetro como base de cálculo
  (`is_baseline`, migración `0008_fuel_baseline`).
- Cargas parciales con odómetro/distancia vacíos o en `0`, heredando el último
  odómetro conocido.
- Categorías de gráficos con límite de primeros/últimos N datos y zoom; los
  recordatorios próximos/vencidos aparecen en el inicio.
- Tipo de vehículo con referencias visuales (Mazda 3, Hilux, Jimny, Navi,
  Rogue, Hiace, John Deere y modelos genéricos), color por nombre/hex/paleta o
  color picker y visualización SVG animada.
- Resumen de mantenimientos en el inicio (total, mes y último servicio).
- Selector de unidad de volumen/precio para ver el precio medio por litro o por
  galón.
- El formulario recuerda las últimas unidades de volumen y odómetro por
  vehículo al agregar una carga nueva.
- Gráficos de volumen consumido, precio por unidad y total gastado agrupados
  por segmento de tanque lleno, más una comparativa normalizada de volumen,
  distancia y costo total.
- El error de una carga parcial sin odómetro ahora aclara que debe existir una
  carga o baseline con fecha anterior.

Detalle en [`legacy/vehicle-plan.md`](legacy/vehicle-plan.md), sección 19.

## Fase 9 — Gastos fijos y Créditos (✅ Finalizada, 2026-11-03)

**Plan completo:** [`legacy/credits-fixed-plan.md`](legacy/credits-fixed-plan.md)

Estado: **finalizada y validada**. Se cerró después de los ajustes de Vehículo y
de la Fase 10.

Objetivo: pasar de montos a pagar de tarjetas a un módulo real de obligaciones:
límite y utilización de tarjetas, compras a plazo, préstamos, pagos, abonos a
capital, préstamos compartidos, refinanciamientos y simulaciones.

Alcance principal:

- `PaymentMethods`: selector explícito de tarjeta de crédito, límite, corte y
  pago; inferencia legacy por `closing_date`; constructor visual de tarjetas
  (red, acabado, color, chip, contacto) y modelos para métodos no crediticios.
- `Financings`, `FinancingPayments` y `FinancingAdjustments`.
- Cuota cero/interés, cuotas ya pagadas, capital abonado antes de registrar.
- Diferencia entre cuota calculada y pagada registrada como seguros/honorarios.
- Abonos a capital o reducción de cuota.
- Préstamos compartidos por porcentaje.
- Refinanciamientos y cambios de tasa/plazo con historial.
- Resumen: deuda total, cuota total, tasa media y años para terminar.
- Simulaciones de abono único/recurrente y cambio de tasa/plazo.
- Formularios separados por caso para evitar capturas largas.

Implementado hasta ahora:

- Migraciones `0011_credit_cards_and_financings` y
  `0012_financing_payment_cents`; `SCHEMA_VERSION = 12` al cerrar la parte de
  créditos. La Fase 10 añade `0013_vehicle_settings_record_type` y
  `0014_people_and_shared_participants`, `0015_records_shared_amounts` y
  `0016_shared_payment_allocations`, y lleva el esquema a 16.
- Campos de tarjeta en `PaymentMethods`: tarjeta de crédito explícita, límite,
  visual, marca, acabado, color, últimos cuatro, titular y emisor.
- Backfill legacy: tarjetas por `closing_date` y color desde el tipo de pago.
- Tablas `Financings`, `FinancingPayments` y `FinancingAdjustments`.
- Dominio inicial de amortización, utilización de tarjeta, diferencia a
  seguros/honorarios y préstamos compartidos.
- Constructor visual de tarjetas y modelos no crediticios
  (`PaymentMethodVisual`), con color picker, paleta y animación Reanimated.
- Pantalla de métodos de pago con vista previa y edición de piezas.
- Pantalla de Créditos con visual, límite, disponible y utilización.
- Repositorio de financiamientos y pantalla de Préstamos/Compras a plazo.
- Alta/edición de financiamientos y registro de pagos con abono a capital.
- Cuota pactada o calculada, autocompletado de pagos y diferencia registrada
  como seguro u otros cargos.
- Cada pago puede crear, vincular o no vincular un registro de `Records`.
- Resumen de deuda total, cuota mensual, tasa media y tiempo restante en meses y
  años.
- Próximos pagos y financiamientos ordenados por urgencia/saldo.
- Refinanciamientos, cambios de tasa/plazo y ajustes acumulados.
- Simulaciones de abono único/recurrente, tasa y plazo, con simulaciones
  guardadas.
- Las compras a plazo al 0% vinculadas a una tarjeta reducen el crédito
  disponible de la tarjeta por su saldo pendiente.
- Calendario de cuotas pendientes con pago, interés, capital y saldo.
- Gráficos de disminución del saldo y composición de pagos.
- Historial de pagos con edición y eliminación.
- Totales agregados de tarjetas y visualización de cuota total/parte propia.
- Plazo en meses o años y tipo de tasa fija/variable.
- Ayuda bilingüe de financiamientos y actualización del tema de créditos.

Cierre:

- Se mantuvo el criterio de formularios existentes por caso.
- QA Android/iOS y checklist visual completados.
- `expo-doctor`, typecheck, pruebas, lint y export Android verificados.
- Los opcionales complejos (estados de cuenta, amortización alemana, etc.)
  quedan fuera del alcance de la fase.

Subfases: CRED-0 a CRED-6, detalladas en el plan archivado.

## Fase 10 — Errores y ajustes de siguiente versión (✅ Finalizada, 2026-11-03)

**Plan completo:** [`legacy/next-version-plan.md`](legacy/next-version-plan.md)

Estado: **finalizada y validada**. Se completaron créditos/préstamos pendientes
en Registros, tipo de registro de Vehículo, odómetro efectivo, financiamientos
en resúmenes de fijos, renombre de la sección a Compromisos, corrección del
cambio de grupo en Resumen, personas y compartidos ilimitados, snapshot
propio/compartido en `Records`, sección propia de Personas con ledger de pagos
compartidos, compromisos pendientes listados en Home y Registros, correcciones
de vínculo e inferencia de odómetro en Vehículo, modo de importe
propio/total/compartido y desglose por bucket, además de la protección de
centavos al reconstruir el esquema.

Objetivo: resolver la integración pendiente entre Registros, Gastos fijos,
Créditos/Préstamos, Vehículo y Resúmenes, y añadir un modelo reutilizable de
personas y compartidos.

Alcance:

- Créditos/préstamos pendientes en Registros con modal autocontentado.
- Compartidos ilimitados y registro de personas, aplicados a fijos y
  financiamientos.
- Separación explícita de total, propio y compartido.
- Odómetro efectivo para consumo, recordatorios y dashboard.
- Tipo de registro seleccionable y configurable en Vehículo.
- Créditos/préstamos en los resúmenes de fijos.
- Renombre de la sección de fijos.
- Corrección del cambio de grupo en Resumen.

Subfases: NV-0 a NV-11, detalladas en el plan archivado.

Cierre:

- QA Android/iOS, checklist visual y validación de los ajustes de scroll,
  swipe, unidades de combustible y modos de importe.
- Verificación completa con typecheck, pruebas de base de datos, Jest, lint,
  `expo-doctor` y export Android.
- Temas de ayuda de **Personas** y **Tu parte / Total / Compartido** agregados.
- Commits principales: `1f77b6a`, `3cc8dc8`, `6de9ff7`, `745f052`, `cf50c0b`,
  `4a3afaf`, `d454e75`, `f651333`, `7e03428`, `892875d`.

## Documentación

- [`README.md`](README.md): índice de documentación.
- [`legacy/credits-fixed-plan.md`](legacy/credits-fixed-plan.md): plan de Gastos
  fijos y Créditos (Fase 9) archivado.
- [`legacy/next-version-plan.md`](legacy/next-version-plan.md): plan de errores y
  ajustes de la siguiente versión (Fase 10) archivado.
- [`legacy/budget-plan.md`](legacy/budget-plan.md): plan de Presupuestos
  archivado.
- [`legacy/vehicle-plan.md`](legacy/vehicle-plan.md): plan de Vehículo (Fase 8)
  implementado y archivado.
- [`database.md`](database.md): documentación actual de la base de datos.
- [`schema.md`](schema.md): esquema generado.
- [`legacy/i18n-help-plan.md`](legacy/i18n-help-plan.md): plan de traducciones y
  ayuda archivado.
- [`legacy/phase-history.md`](legacy/phase-history.md): historial de fases 0–3.
- [`legacy/ui-history.md`](legacy/ui-history.md): historial de la Fase 4.
- [`legacy/ui-plan.md`](legacy/ui-plan.md): plan original de UI archivado.
- [`legacy/db-summary.md`](legacy/db-summary.md): resumen anterior de base de
  datos.
- [`../AGENTS.md`](../AGENTS.md): instrucciones para agentes.

## Decisiones vigentes

- Tablas lógicas PascalCase, nombres físicos y columnas snake_case.
- Dinero en centavos; fechas en milisegundos.
- Soft delete por defecto; el ORM filtra borrados.
- Migraciones en transacción exclusiva y registro posterior al commit.
- Repositorios como única puerta de acceso desde stores/pantallas.
- Toda operación con impacto en cuentas (ingreso, gasto, pago, transferencia,
  aporte o retiro) debe ofrecer crear, vincular u omitir un registro de
  `Records`, validando monto/fecha y evitando vínculos duplicados.
- Backups con metadatos versionados y compatibilidad con dumps SQL antiguos.
- Lint bloqueante; CI ejecuta typecheck, artefactos, tests y lint.
- La UI nueva usa `src/ui`; los estilos legacy se adaptan con
  `useThemedStyles`.
