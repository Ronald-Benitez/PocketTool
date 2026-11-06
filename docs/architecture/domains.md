# Dominios de negocio

**Cuándo leer:** al tocar presupuestos, créditos, ahorros, vehículo, personas,
compartidos, resúmenes o reglas de dinero.
**Resumen:** cada dominio tiene lógica pura en `src/domain`, repositorios en
`src/db/repositories` y UI en `app/` + `src/components`. La UI no calcula dinero.
**Skills:** `pockettool-domain`, `pockettool-records`, `pockettool-db`.

## Reglas transversales

- Dinero en centavos enteros; fechas en milisegundos Unix.
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
- Todo flujo que mueva dinero evalúa la integración con `Records` mediante la
  skill `pockettool-records`.

## Presupuestos

- `BudgetPlans`: un plan por grupo. `BudgetLines`: líneas `category` o `fixed`.
- El monto planificado es un snapshot; el real se deriva de `Records` y no se
  guarda.
- Plantillas reutilizables en `BudgetTemplates`/`BudgetTemplateItems`.
- Dominio en `src/domain/budgets/`: comparación, estados de línea, proyección,
  insights y builders Mermaid.
- Repositorios en `src/db/repositories/budgets.ts`; entregan `BudgetPlanView`.
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
  compartidos (`fixed`/`financing`/`saving`) e historial de pagos compartidos.
- `src/domain/shared/split.ts`: reparte un monto entre personas y garantiza que
  la suma reconcilie.
- `src/db/shared-ledger.ts`: sincroniza `SharedPaymentAllocations` desde
  registros de fijos y pagos de financiamientos.
- `app/(people)/index.tsx`: sección Personas con alta, edición, archivo y
  ledger por persona.
- `src/components/shared/SharedParticipantsField.tsx`: selector reutilizable de
  personas y porcentajes con total/propio/compartido.

## Compromisos (fijos)

- `src/stores/FixedsResumesStore.ts`: resumen de compromisos; suma gastos fijos
  y cuotas mensuales de financiamientos activos por tipo, pago, método y
  categoría.
- `src/components/groups/group-selector.tsx`: una sola selección de grupo; las
  cargas asíncronas no deben pisar una selección del usuario.
- Detalle en `docs/legacy/next-version-plan.md` (histórico).
