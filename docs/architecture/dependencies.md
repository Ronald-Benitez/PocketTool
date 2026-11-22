# Mapa de dependencias

**Cuándo leer:** antes de ocultar un módulo, mover una opción de pantalla o
decidir qué debe desaparecer con un flag de experiencia.
**Resumen:** mapa de módulos, pantallas, componentes, hooks, stores y dominio, y
qué feature controla cada uno. Sirve para decidir alcance; el código sigue siendo
la fuente de verdad.
**Secciones:** Features · Módulos y datos · Pantallas · Componentes y toggles ·
Hooks y stores · Dominio · Registros · Ayuda · Reglas de decisión.

## Features y dependencias duras

| Feature | Depende de | Nota |
| --- | --- | --- |
| `financings` | `fixeds` | El financiamiento vive como tab de Compromisos. |
| `shared` | `people` | Sin personas no hay participantes ni pagador. |
| `budget` | — | Si `fixeds` está apagado, se oculta “crear desde fijos”. |
| `savings` | — | Personas solo es necesaria para ahorros compartidos. |
| `closing` | — | Lee datos de otros módulos, pero no los exige. |
| `quickAdd` | — | Solo afecta la captura. |
| `smartDefaults` | — | Solo afecta la captura. |

## Módulos y datos

| Módulo / feature | Datos y dominio que consume |
| --- | --- |
| `summaries` | `Records`, `PaidCredits`, `SavingsHistory` (`savingsPaid`), `PersonSettlements`, `RecordTypes`, `Groups`; `src/domain/summaries/*`. |
| `fixeds` | `Fixed`, `Records`, `SharedExpenseParticipants`, `People`, `Categories`, `PaymentMethods`, `RecordTypes`; `src/domain/records/fixedPending.ts`. |
| `financings` | `Financings`, `FinancingPayments`, `FinancingAdjustments`, `SharedExpenseParticipants`, `People`, `Records`, `PaidCredits`; `src/domain/credits/*`. |
| `credits` | `PaymentMethods` (tarjetas), `PaidCredits`, `Records`, `Groups`, `useConfigs` (`creditType`, `paymentCreditType`). |
| `budget` | `BudgetPlans`, `BudgetLines`, `BudgetTemplates`, `Records`, `Fixed`, `Financings`, `Savings`/`SavingsHistory`, `Vehicle*`, `PaidCredits`, `Groups`; `src/domain/budgets/*`, `useSummaryMode`, `useBudgetProjection`; sugerencias de ahorros vinculados y orden manual por `sort_order`. |
| `savings` | `Savings`, `SavingsHistory`, `SavingsSettings`, `People`, `SharedExpenseParticipants`, `Records`; `src/domain/savings/*`. |
| `vehicle` | `Vehicles`, `VehicleFuelEntries`, `VehicleMaintenance`, `VehicleReminders`, `VehicleSettings`, `VehicleExpenseLinks`, `Records`; `src/domain/vehicle/*`. |
| `closing` | `GroupClosings`, `GroupClosingLines`, `Groups`, `PaymentMethods`, `Savings`, `Fixed`, `Financings`, `People`, `Records`; `src/domain/closing/*`. |
| `people` | `People`, `PersonSettlements`, `SharedExpenseParticipants`, `SharedPaymentAllocations`, `Savings`, `Fixed`, `Financings`, `Records`; `src/domain/shared/*`. |
| `shared` | `SharedExpenseParticipants`, `People`, `Records` (`paid_by_person_id`, `paid_scope`), `PersonSettlements`, `SharedPaymentAllocations`; `src/domain/shared/*`. |
| `charts` | `ChartPreferences` y builders de `src/domain/charts/*`; los datos vienen del módulo que pinta el gráfico. |
| `filters` | `Records` y campos de `src/domain/records/filterFields.ts`; `src/domain/filters/*`. |
| `advancedCatalogs` | `PaymentTypes`, `RecordTypes` (gestión); `Categories` y `PaymentMethods` son catálogos base. |
| `quickAdd` | `AddItem`, `RecordTypes`, `Categories`, `PaymentMethods`. |
| `smartDefaults` | `recordDefaults` (AsyncStorage), `AddItem`, catálogos anteriores. |

## Pantallas

| Pantalla | Muestra / usa | Flags que la afectan |
| --- | --- | --- |
| `app/index.tsx` | Dashboard de Inicio con bloques y FAB | Cada bloque y acción comprueba su flag |
| `(summaries)/index` | Resumen, presupuesto, ahorros, compartidos | `summaries`, `budget`, `savings`, `shared` |
| `(summaries)/*Screen` | Vistas analíticas por categoría, pago y tipo | `summaries`; el toggle interno depende de `shared` |
| `(financials)/RecordsScreen` | Registros, filtros, grupos, pendientes | `filters`, `credits`, `fixeds`, `financings`, `shared`, `savings` |
| `(financials)/CategoriesScreen` | Gestión de categorías | Catálogo base |
| `(financials)/PaymentMethodsScreen` | Gestión de métodos | Catálogo base |
| `(financials)/PaymentTypesScreen` | Gestión de tipos de pago | `advancedCatalogs` |
| `(financials)/RecordTypesScreen` | Gestión de tipos de registro | `advancedCatalogs` |
| `(fixeds)/index` | Compromisos y tabs analíticas | `fixeds` |
| `(fixeds)/FinancingsScreen` | Financiamientos | `financings` |
| `(credits)/index` | Tarjetas y pagos | `credits`; `SummaryModeToggle` → `shared` |
| `(savings)/index` | Ahorros, metas y movimientos | `savings`; usa `people` para ahorros compartidos |
| `(budget)/index` | Plan, real, saldos de consumo/caja, obligaciones y gráficos | `budget`, `charts`; “desde fijos” requiere `fixeds`; obligaciones respetan `financings`, `savings`, `vehicle` y `credits`; `SummaryModeToggle` → `shared` |
| `(budget)/templates` | Plantillas | `budget` |
| `(vehicle)/*` | Vehículo, combustible, mantenimiento y recordatorios | `vehicle`, `charts` |
| `(closing)/index` | Cierre y cobertura | `closing`; lee `credits`, `savings`, `fixeds`, `financings` y `people` |
| `(people)/index` | Personas, saldos y liquidaciones | `people`; lee `savings`, `fixeds` y `financings` |
| `(settings)/index` | Experiencia y ajustes por área | `experience`; secciones según flags |
| `(help)/index` | Hub de ayuda | Filtra por `src/features/help.ts` |

## Componentes y toggles

| Componente | Depende de | Qué ocultar si el flag está apagado |
| --- | --- | --- |
| `SummaryModeToggle` | `shared` | Todo el selector “Propio / Compartido / Total / Pagado”. |
| `BalanceModeToggle` | `savings` | Todo el selector “Consumo / Caja”. |
| `FinanceTableBlock` | `summaries` + `shared` | La tabla sigue; el toggle interno desaparece. |
| `records-table` | `filters`, `credits`, `fixeds`, `financings` | Botón de filtros, orden, pills y grupos de pendientes. |
| `add-record` | `shared`, `savings`, `quickAdd`, `smartDefaults` | Participantes/pagador, origen en ahorros, campos avanzados y precarga. |
| `AddFixed` | `fixeds`, `shared` | Participantes compartidos al crear; al editar se conservan. |
| `FinancingForm` | `financings`, `shared` | Participantes compartidos al crear; al editar se conservan. |
| `AddSaving` | `savings`, `people` | Participantes al crear; al editar se conservan. |
| `FinancingPaymentForm` | `financings`, `shared` | El desglose compartido de un financiamiento existente se mantiene visible. |
| `BudgetSummaryBlock` | `budget` | El bloque completo. |
| `Chart` / `ChartCard` | `charts` | Las tarjetas de gráfico, no el módulo. |
| `ExperienceSettings` | Todos | Nada: es el panel de control. |
| `ExperienceOnboardingGate` | Todos + `useWhatsNew` | Se pospone si hay novedades pendientes. |
| `SettlementForm` | `people` / `shared` | El flujo de liquidación. |
| `DashboardScreen` / `DashboardBlock` | Flags de cada bloque | Bloques ocultos o de módulos apagados; acción “Ver todo” sin destino |
| `DashboardObligationsBlock` | `fixeds`, `financings`, `credits`, `vehicle` | Filas de módulos apagados; bloque completo si ninguno está activo |
| `Dashboard*Block` (budget, savings, people, credits, vehicle, closing) | Su feature | El bloque completo |
| `QuickActionsFab` | `quickAdd`, `fixeds`, `savings` | Acciones no disponibles; “Agregar registro” siempre |

## Hooks y stores

| Hook / store | Usa | Flag que lo hace visible |
| --- | --- | --- |
| `useFeatures` | `experienceSettings` | Siempre. |
| `useSummaryMode` | Modo `own/shared/total/paid`; lo consume `budget` | `shared` para el selector. |
| `useBalanceMode` | Modo `consumption/cash`; lo consume `closing` | `savings` para el selector de Resumen. |
| `usePendingFixeds` | `Fixed`, `Records`, participantes, `useConfigs` | `fixeds`; los montos compartidos dependen de `shared`/`people`. |
| `useBudgetPlan` / `useBudgetProjection` / `useBudgetObligations` | `BudgetPlans`, `Financings`, `Savings`, `Vehicle*`, `PaidCredits` y `SummaryMode` | `budget`; obligaciones filtradas por `financings`, `savings`, `vehicle` y `credits`. |
| `useRecordDefaults` | `recordDefaults` | `smartDefaults`. |
| `useDashboardLayout` | `dashboardLayout` (AsyncStorage) | Core; el orden y la visibilidad no dependen de flags. |
| `useAutoGroup` | Grupos del periodo | Core. |
| `ResumesStore` | `Records`, `PaidCredits`, `SavingsHistory`, `PersonSettlements` | `summaries`; las filas de ahorros/compartidos se ocultan por flag. |
| `FixedsResumesStore` | `Fixed`, `Financings`, participantes | `fixeds`, `financings`, `shared`. |
| `CreditsStore` | Tarjetas, pagos y `Records` | `credits`. |
| `SavingsStore` | `Savings`, `SavingsHistory`, `People` | `savings`; lo compartido depende de `people`. |
| `VehicleStore` | `Vehicles`, `Records` | `vehicle`. |
| `useClosings` / `useClosingSuggestions` | `GroupClosings`, `Fixed`, `Financings`, `Savings`, `People`, `Records` | `closing`; las fuentes de créditos/fijos/financiamientos se filtran por sus flags. |
| `useClosingSources` | `PaymentMethods`, `Fixed`, `Financings`, `Credits` | `closing`; no ofrece fuentes de módulos apagados. |

## Dominio

| Dominio | Depende de | Nota |
| --- | --- | --- |
| `src/domain/summaries/monthly.ts` | `Records.saving_id` | `isMonthlyCashRecord` excluye gastos pagados con ahorro. |
| `src/domain/summaries/cash.ts` | Pagador, `paid_scope`, liquidaciones | Base de “Caja” y de los modos compartidos. |
| `src/domain/summaries/aggregate.ts` | `Records`, `PaidCredits` | Efecto, gasto y balance. |
| `src/domain/records/fixedPending.ts` | `Fixed`, `Records`, configs | Fechas y deduplicación de fijos. |
| `src/domain/credits/*` | `Financings`, pagos, ajustes | No depende de flags. |
| `src/domain/savings/*` | `Savings`, movimientos | No depende de flags. |
| `src/domain/vehicle/*` | `Vehicle*` | No depende de flags. |
| `src/domain/closing/*` | Cierre y fuentes | No depende de flags. |
| `src/domain/shared/*` | Personas, repartos y liquidaciones | No depende de flags. |
| `src/domain/budgets/*` | Plan, real y proyección | No depende de flags. |
| `src/domain/charts/*` | Specs y builders | No depende de flags. |
| `src/domain/filters/*` | Campos y matcher | No depende de flags. |

## Registros

- `AddItem` combina `shared`, `savings`, `quickAdd` y `smartDefaults`.
- `saveRecord` recibe `own_amount_cents`, `shared_amount_cents`,
  `paid_by_person_id`, `paid_scope` y `saving_id`.
- Si `shared` está apagado, se ocultan participantes y pagador; al editar un
  registro existente se conservan y se muestran en lectura.
- Si `savings` está apagado, se oculta el origen en ahorros para registros
  nuevos; al editar se conserva `saving_id` y se muestra el nombre.
- `quickAdd` no cambia el payload; solo oculta campos opcionales.
- `smartDefaults` no crea ni vincula registros; solo precarga valores.

## Ayuda

El mapa vive en `src/features/help.ts`:

| Tema | Feature |
| --- | --- |
| `summaries` | `summaries` |
| `fixeds` | `fixeds` |
| `financings` | `financings` |
| `credits` | `credits` |
| `budgets`, `budgetTemplates` | `budget` |
| `savings` | `savings` |
| `vehicle`, `vehicleFuel`, `vehicleMaintenance`, `vehicleReminders` | `vehicle` |
| `closing` | `closing` |
| `people`, `settlements` | `people` |
| `sharedPurchases` | `shared` |
| `filters` | `filters` |
| `charts` | `charts` |
| `gettingStarted`, `whatsNew`, `groups`, `records`, `amountModes`, `theme`, `experience` | Siempre visibles |

## Reglas de decisión

1. Un flag de presentación nunca cambia cálculos, `Records` ni saldos.
2. Ata cada control al feature que posee el concepto:
   - modos de importe (`Propio/Compartido/Total/Pagado`) → `shared`;
   - modo `Consumo/Caja` → `savings`;
   - filas de liquidación → `shared`/`people`;
   - filtros y orden → `filters`;
   - gráficos → `charts`.
3. Si un módulo lee datos de otro, oculta la presentación, no el cálculo.
4. En edición, los campos obligatorios y los vínculos existentes se mantienen
   visibles aunque el módulo esté oculto.
5. Al agregar un feature: actualiza `definitions.ts`, `features.md`, este mapa,
   la ayuda y las pruebas.
6. Si una pantalla nueva usa un toggle o dato de otro módulo, agrega una fila en
   “Pantallas” o “Componentes y toggles”.
