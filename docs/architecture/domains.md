# Dominios de negocio

**Cuándo leer:** al tocar presupuestos, créditos, ahorros, vehículo, personas,
compartidos, resúmenes o reglas de dinero.
**Resumen:** cada dominio tiene lógica pura en `src/domain`, repositorios en
`src/db/repositories` y UI en `app/` + `src/components`. La UI no calcula dinero.
**Skills:** `pockettool-domain`, `pockettool-records`, `pockettool-db`.
**Secciones:** Reglas transversales · Gráficos · Presupuestos · Créditos ·
Ahorros · Vehículo · Personas y compartidos · Compromisos · Periodos · Cierre.

## Reglas transversales

Dinero en centavos, fechas en ms, dominio puro y UI sin cálculos: ver
[`../../AGENTS.md`](../../AGENTS.md) y
[`../../src/domain/AGENTS.md`](../../src/domain/AGENTS.md).

- `Records.amount` guarda el monto propio del usuario; `own_amount_cents` lo
  replica y `shared_amount_cents` es el snapshot de la parte compartida. El
  total es `own + shared`; los resúmenes personales usan el monto propio.
- Los gastos pagados con ahorro (`records.saving_id`) se conservan en Registros
  pero no cuentan como gasto del mes en resúmenes, presupuestos ni créditos. El
  monto se descuenta del ahorro mediante `SavingsHistory`.
- Un `Record` creado desde un movimiento de ahorro es un registro normal:
  conserva categoría, método y tipo elegidos, y no lleva `saving_id`.
  `SavingsHistory.record_id` solo indica el vínculo.
- Las reglas de efecto, gasto y balance viven en `src/domain/summaries/` y las
  usan resúmenes y presupuestos.
- Todo flujo que mueva dinero evalúa la integración con `Records` mediante
  `pockettool-records`; el procedimiento vive en la skill.

## Gráficos

- `src/domain/charts/`: `ChartSpec`, `ChartKind`, `ChartTone`, escalas, ticks y
  validación pura.
- Los builders de presupuestos, créditos, vehículo y ahorros devuelven specs con
  centavos, timestamps y tonos semánticos; no formatean moneda/fechas ni
  devuelven colores.
- `src/ui/charts/` resuelve tema, leyenda, tooltip, tabla de datos y renderers
  SVG. `ChartCard` añade colapso persistente y `ChartSection` acciones de grupo.
- Las preferencias de gráficos viven en `chart_preferences` (SQLite).

## Presupuestos

- `BudgetPlans`: un plan por grupo. `BudgetLines`: líneas `category` o `fixed`.
- El monto planificado es un snapshot; el real se deriva de `Records` y no se
  guarda.
- El cálculo usa el periodo real del grupo (`period_start`/`period_end`), no el
  mes calendario. `BudgetPlanView` expone días del periodo, transcurridos,
  restantes y relación pasado/actual/futuro.
- `src/domain/budgets/balance.ts` proyecta el saldo de consumo: neto real +
  ingresos restantes - gastos restantes (ritmo por línea + fijos pendientes).
  También calcula caja con obligaciones separadas.
- Obligaciones: fijos, financiamientos, aportes propios a ahorros, recordatorios
  de vehículo y pagos de tarjeta. `useBudgetObligations` las reconcilia contra
  líneas y `Records` para evitar duplicados.
- Los recordatorios de vehículo validan estado (`is_active`, `deleted_at`,
  reemplazo, mantenimiento en periodo) antes de pronosticar fecha/odómetro.
- Plantillas reutilizables en `BudgetTemplates`/`BudgetTemplateItems`.
- Dominio en `src/domain/budgets/`: comparación, estados de línea, proyección,
  balances, insights y builders de gráficos (`ChartSpec`).
- Repositorios en `src/db/repositories/budgets.ts`; entregan `BudgetPlanView`.
- Sin migración: el saldo es derivado y no se guarda.
- Detalle en `docs/legacy/budget-plan.md` (histórico).

## Créditos y financiamientos

- `app/(credits)/index.tsx`: resumen de tarjetas, crédito en uso, disponible y
  utilización; incluye compras a plazo al 0%.
- `app/(fixeds)/FinancingsScreen.tsx`: deuda, cuota mensual, tasa media,
  financiamientos, pagos, refinanciamientos y simulaciones.
- `src/domain/credits/amortization.ts`: cuota francesa, tasa cero, calendario,
  utilización de tarjeta y partes compartidas.
- `src/domain/credits/summary.ts`: saldo y calendario vigente con ajustes
  acumulados y `payment_cents` como cuota pactada opcional.
- `src/domain/credits/payments.ts`: separa interés, capital y diferencia a
  seguro/otros cargos; esa diferencia nunca aumenta capital ni interés.
- `src/domain/credits/charts.ts`: disminución del saldo y composición de pagos.
- `src/domain/credits/simulations.ts`: comparación de escenarios; el formulario
  puede guardar simulaciones en AsyncStorage.
- `src/domain/credits/cards.ts`: agrupa compras a plazo al 0% activas por
  tarjeta; su saldo pendiente reduce el crédito disponible.
- `src/stores/CreditsStore.ts`: totales por ciclo y uso de tarjeta. No dupliques
  una compra como gasto de tarjeta y financiamiento.
- Fecha de pagos pendientes de tarjeta (`pendingPaymentDateMode`): `today` usa
  hoy; `payment_date` usa el día de pago dentro del mes del grupo; y
  `next_payment_date` usa la próxima ocurrencia desde hoy, igual que Créditos.
  El helper compartido vive en `src/domain/shared/recurrence.ts`.
- Detalle en `docs/legacy/credits-fixed-plan.md` (histórico).

## Ahorros

- `Savings`: cuentas/metas con meta global opcional, regla de aporte, estado y
  modo de `Records`.
- `SavingsHistory`: movimientos tipados (inicial, aporte, retiro, interés,
  ajuste) con persona, periodo, notas y vínculo opcional a `Records`.
- `SavingsSettings`: valores por defecto de registros y color del trofeo.
- Dominio en `src/domain/savings/`: balances, metas, aportes, proyección y
  gráficos.
- El aporte sugerido es proporcional a la parte propia o a la persona
  seleccionada; la regla se mantiene hasta que el usuario la cambie.
- Detalle en `docs/legacy/savings-plan.md` (histórico).

## Vehículo

- `src/domain/vehicle/`: unidades, consumo, promedios, recordatorios,
  resolución de colores (`colors.ts`) y tipos/referencias visuales
  (`models.ts`).
- `src/domain/vehicle/fuel.ts`: odómetro efectivo que conserva la inferencia a
  través de entradas con solo distancia; se usa en consumo, recordatorios y
  lecturas previas.
- `src/domain/vehicle/charts.ts`: builders de rendimiento, volumen, precio,
  total gastado y comparativa de movilidad por segmento de tanque lleno.
- `app/(vehicle)/fuel.tsx`: segmentos, selector de unidad de volumen/precio y
  gráficos.
- `src/components/vehicle/FuelEntryForm.tsx`: alta/edición de combustible y
  preferencias de unidades por vehículo en AsyncStorage.
- `src/components/vehicle/VehicleVisual.tsx`: modelos SVG por tipo de vehículo
  con animación Reanimated; `VehicleColorField` resuelve texto/HEX/paleta.
- `src/db/repositories/vehicle.ts`: vehículos, combustible, mantenimiento,
  piezas, recordatorios, settings y vínculos con `Records`. El tipo de registro
  se configura en `VehicleSettings.record_type_id`.
- `src/hooks/useVehicle.ts` y `src/stores/VehicleStore.ts`: vehículo activo y
  refresco.
- `app/(vehicle)/`: `StackBase` con tabs de resumen, combustible, mantenimiento
  y recordatorios.
- Detalle en `docs/legacy/vehicle-plan.md` (histórico).

## Personas y compartidos

- `src/db/repositories/people.ts`: personas, participantes de gastos
  compartidos (`fixed`/`financing`/`saving`/`record`), liquidaciones y estado de
  cuenta por persona.
- `src/domain/shared/split.ts`: reparte un monto entre personas y garantiza que
  la suma reconcilie. `computeParticipantShares` admite porcentajes y montos
  mezclados; ambos se calculan sobre el total y se bloquea si la suma supera el
  total. `computeRecordShares` separa la parte propia y la compartida de una
  compra.
- `src/domain/shared/statement.ts`: construye el estado de cuenta por persona.
  Las compras pagadas por el usuario generan “te debe”; las pagadas por otra
  persona generan “le debes”; los financiamientos son informativos y los
  ahorros se mantienen aparte.
- `src/domain/summaries/cash.ts`: calcula lo que el usuario realmente pagó por
  un registro, lo que le deben por compras compartidas y el neto de las
  liquidaciones.
- Modos de importe: `Tu parte` (parte propia de cada compra), `Compartido`
  (lo que le deben, bruto y antes de liquidar), `Total` (compra completa sin
  importar quién pagó) y `Propio bruto` (ingresos menos lo que pagó por compras,
  sin liquidaciones). El balance de consumo y el balance de caja se muestran
  aparte.
- `src/db/shared-ledger.ts`: sincroniza participantes y las asignaciones de
  fijos/financiamientos. El estado de cuenta nuevo deriva fijos y compras desde
  `Records` y no duplica las asignaciones.
- `app/(people)/index.tsx`: sección Personas con alta, edición, archivo, estado
  de cuenta y registro de pagos.
- `src/components/people/`: modal de estado de cuenta y formulario de
  liquidación.
- `src/components/groups/PendingBalancesDialog.tsx`: al crear un grupo, informa
  saldos pendientes y permite liquidarlos en el grupo anterior, en el nuevo o
  darles seguimiento.
- `src/components/shared/SharedParticipantsField.tsx`: selector reutilizable de
  personas y porcentajes con total/propio/compartido.

## Compromisos (fijos)

- `src/stores/FixedsResumesStore.ts`: resumen de compromisos; suma gastos fijos
  y cuotas mensuales de financiamientos activos por tipo, pago, método y
  categoría.
- `src/domain/records/fixedPending.ts`: fecha propuesta y deduplicación de fijos
  pendientes. `pendingFixedDateMode` permite `group_month` (día del fijo en el
  mes del grupo, con `group.month` cero-based) o `next_occurrence` (próxima
  ocurrencia desde hoy). `pendingFixedDedupeMode` permite `group` (registro en
  el grupo seleccionado) o `period` (registro del mismo fijo con fecha en el mes
  propuesto, aunque esté en otro grupo).
- `src/hooks/usePendingFixeds.ts`: fuente única para Registros e Inicio; aplica
  las dos configuraciones anteriores y calcula monto propio/compartido.
- Inicio muestra un fijo cuando la fecha resuelta es hoy.
- `src/components/groups/group-selector.tsx`: una sola selección de grupo; las
  cargas asíncronas no deben pisar una selección del usuario.
- Detalle en `docs/legacy/next-version-plan.md` (histórico).

## Periodos y grupos

- `src/domain/periods/`: motor compartido por grupos y cierres.
  `resolvePeriod` genera periodos locales inclusivos y contiguos; el fin de un
  periodo `start_day` es el día anterior al siguiente inicio, con clamp en meses
  cortos.
- Modos: `calendar_month`, `start_day`, `cutoff_day` y `custom_range`. Los
  grupos recurrentes usan los tres primeros; `custom_range` queda como override
  manual de un cierre.
- `src/domain/groups/`: `groupPeriodFromRow` resuelve el periodo guardado o cae
  al mes calendario de `year`/`month`; `planCurrentGroup` decide si falta el
  grupo del periodo actual.
- `month` es 0-based. El mes ancla es el mes de inicio, salvo `cutoff_day`, que
  se etiqueta por el mes donde termina.
- `ensureCurrentGroup` crea solo el periodo que contiene hoy, no duplica y
  respeta grupos borrados. No crea periodos futuros.
- Los grupos existentes conservan su periodo; cambiar la configuración solo
  afecta a los grupos nuevos.

## Cierre de periodo

- `src/domain/closing/`: cálculo de totales, validaciones, periodo configurable
  y sugerencias.
- `GroupClosings` y `GroupClosingLines`: snapshot informativo por grupo. No
  crea ni modifica `Records`, `PaidCredits`, `SavingsHistory` ni saldos.
- Secciones: `available`, `obligation` y `resolution`. Los ahorros no se
  incluyen automáticamente; se pueden agregar como líneas manuales si el
  usuario decide usarlos.
- El periodo del cierre sale del periodo del grupo. `closingGraceDays` y
  `closingAllowPeriodOverride` siguen siendo propios del cierre; cada cierre
  guarda `period_start`, `period_end` y `editable_until`.
- Lo normal es crear el cierre cuando el periodo termina, pero la app no bloquea
  crearlo antes; solo muestra una sugerencia.
- Un cierre vencido es inmutable. Los cambios globales no reactivan cierres
  existentes.
- Varios borradores y un único final por grupo, reforzado con índice único.
- Las líneas manuales pueden vincular tarjetas, cuentas, fijos o financiamientos
  registrados; la misma fuente no se puede repetir en el cierre.
- La combinación tarjeta de crédito + ahorro se bloquea en registros nuevos y
  se advierte en registros históricos.
