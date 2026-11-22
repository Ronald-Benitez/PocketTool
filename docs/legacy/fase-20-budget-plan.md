# Fase 20 — Presupuestos con saldo esperado

**Cuándo leer:** al actualizar Presupuestos, el saldo esperado, las obligaciones
del periodo o la integración con compartidos, ahorros, vehículo, créditos y
compromisos.
**Resumen:** plan para que Presupuestos use el periodo real del grupo, muestre
ingresos/gastos/neto, calcule saldo esperado de consumo y caja, incluya
obligaciones sin duplicarlas y valide recordatorios de vehículo ya finalizados.
**Secciones:** Objetivo · Criterios · Decisiones · Hallazgos · Periodo ·
Ingresos · Saldos · Obligaciones · Ahorros · Vehículo · Modo · UI · Archivos ·
Modelo · Registros · Pruebas · Ayuda · Documentación · Riesgos · Verificación ·
Fases.
**Estado:** Finalizada y archivada (2026-11-21).
**Fecha:** 2026-11-20

## Objetivo

Convertir Presupuestos en una herramienta de planificación completa del periodo:

- Comparar plan vs. real con el periodo real del grupo.
- Mostrar ingresos, gastos, neto y saldo esperado al cierre en consumo y caja.
- Incorporar obligaciones de Compromisos, ahorros y vehículo sin doble conteo.
- Añadir validaciones y sugerencias para corregir el plan antes del cierre.
- Mantener el presupuesto como cálculo/estimación: no crea ni mueve `Records`.

## Criterios de aceptación

1. El presupuesto usa `period_start`/`period_end`; días transcurridos/restantes y
   pasado/actual/futuro son correctos.
2. Se muestran ingreso planificado/real, gasto planificado/real, neto
   planificado/real y dos saldos esperados: consumo y caja.
3. El saldo de consumo respeta el modo global y las reglas de compartidos.
4. El saldo de caja incluye obligaciones de Compromisos, ahorros, vehículo y
   tarjetas según las reglas definidas.
5. Las obligaciones se reconcilian contra líneas y `Records` para no duplicar.
6. Los gastos pagados con ahorro se excluyen del consumo y se muestran como nota.
7. Los ingresos con efecto `+` se muestran como ingresos, no como gasto no
   planificado.
8. Los recordatorios de vehículo se proyectan por fecha y odómetro, con costo
   estimado y confianza.
9. Un recordatorio inactivo, borrado, reemplazado o ya atendido en el periodo no
   se incluye.
10. Hay validaciones para saldo negativo, plan sin ingresos, sobrecompromiso,
    sobregasto, gastos sin planificar y obligaciones sin cubrir.
11. Todo texto es bilingüe y la ayuda se actualiza.
12. No hay migración de esquema.

## Decisiones tomadas

- Se muestran dos saldos: consumo y caja.
- Obligaciones: todo Compromisos (fijos y financiamientos), aportes propios
  esperados a ahorros y recordatorios de vehículo del periodo.
- El modo global se respeta en líneas y resumen real.
- Los `Records` con efecto `+` son ingresos reales y se respetan.
- Sin migración: todo se deriva de datos existentes.

## Hallazgos

- `calculateBudgetPlanView` usa `monthInfo(year, month)`; ignora el periodo del
  grupo y el mes 0-based puede desviar la proyección.
- `BudgetSummaryBlock` llama `useBudgetPlan(group?.id)` sin modo.
- El dominio ya calcula ingreso/gasto/neto planificado y real, pero la UI solo
  muestra gasto planificado/real, variación y fijos pendientes.
- No existe saldo esperado, días restantes ni disponible por día.
- `BudgetLines` solo soporta `category` y `fixed`; no hay líneas de ahorro,
  financiamiento o tarjeta.
- Los gastos con `saving_id` se excluyen del gasto mensual; no hay nota visible.
- Los gastos de vehículo entran por `Records`; no hay pronóstico de
  recordatorios.
- Faltan validaciones de saldo negativo, plan sin ingresos y sobrecompromiso.
- Los tests no cubren periodos, ingresos, saldos ni modos.

## Periodo

- `BudgetPlanView` añade `periodStart`, `periodEnd`, `daysInPeriod`,
  `daysElapsed`, `daysRemaining` y `periodRelation`.
- `fetchPlanView` pasa `groupPeriodFromRow(group)`.
- `periodInfo(period, now)` sustituye a `monthInfo`.
- `projectedFor` usa días del periodo, no del mes.
- `createFromPreviousMonth` selecciona el grupo anterior por periodo/ancla.

## Ingresos

- Los `Records` con efecto `+` son ingresos reales.
- Se muestran ingreso planificado, real y neto.
- Los ingresos reales sin línea se muestran en “Ingresos sin planificar”,
  separados de los gastos.
- Las líneas de ingreso no usan el badge “Over budget”.

## Saldo de consumo esperado

```text
netoReal = ingresoReal(modo) - gastoReal(modo)
gastosRestantes = Σ max(0, proyectadoLínea(modo) - realLínea(modo))
                + fijosPendientesSinLínea(partePropia)
ingresosRestantes = max(0, ingresoPlanificado - ingresoReal(modo))
saldoConsumoEsperado = netoReal + ingresosRestantes - gastosRestantes
```

- Periodo pasado: `gastosRestantes = 0`.
- Periodo futuro: saldo = neto planificado.
- Periodo actual: ritmo de gasto + fijos pendientes.
- Si el modo es Compartido/Pagado, la tarjeta se etiqueta según el modo y avisa
  que no representa gasto propio.

## Saldo de caja esperado

```text
cajaActual = ingresosCaja + liquidacionesRecibidas
           - gastosPagados - liquidacionesPagadas
cajaEsperada = cajaActual
             + ingresosRestantesCaja
             - gastosRestantesCaja
             - obligacionesPendientes
```

Obligaciones pendientes:

- Fijos pendientes que no estén en una línea ni en un `Record`.
- Próxima cuota de financiamientos activos dentro del periodo no pagada.
- Recordatorios de vehículo previstos sin mantenimiento registrado.
- Aportes propios esperados a ahorros.
- Pagos pendientes de tarjeta, si `credits` está activo.
- Liquidaciones solo las ya registradas; no se pronostican.

La UI muestra el desglose de obligaciones.

## Obligaciones y no duplicación

| Obligación | Ya en plan | Ya en `Records` | Acción |
|---|---:|---:|---|
| Fijo con línea fija | Sí | No | La proyección de línea ya incluye el pendiente. |
| Fijo sin línea | No | No | Sumar el pendiente. |
| Fijo confirmado | — | Sí | No sumar. |
| Financiamiento | No hay línea específica | Pago registrado | No sumar si ya está pagado/vinculado. |
| Recordatorio de vehículo | Línea de la categoría | Mantenimiento en periodo | No sumar si ya está cubierto. |
| Aporte a ahorro | — | Movimiento en periodo | Sumar solo el remanente esperado. |
| Pago de tarjeta | — | Pago registrado | No sumar si ya está pagado. |

`reconcileBudgetObligations` devuelve solo lo no cubierto y una lista para la UI.
Cada fila tiene prueba.

## Aportes propios a ahorros

- Para cada ahorro activo con regla `percent` o `fixed`:
  - `sugerido = suggestedContributionCents({ rule, percentBps, fixedCents,
    incomeCents })`.
  - `partePropia = sugerido * sharePercent / 100`.
  - `real = aportes del usuario en el periodo`.
  - `remanente = max(0, partePropia - real)` en periodo actual; futuro usa el
    sugerido; pasado 0.
- Se incluye en caja, no en consumo.
- Si el aporte ya generó un `Record`, se evita doble conteo.

## Recordatorios de vehículo

### Validación de estado

Antes de evaluar fecha u odómetro, se descarta el recordatorio si:

1. `deleted_at != null`.
2. `is_active = 0` o `false`.
3. Fue reemplazado por otro recordatorio activo del mismo vehículo y
   `service_type`.
4. Ya tiene mantenimiento registrado en el periodo para el mismo vehículo y
   servicio.
5. No tiene fecha, odómetro objetivo ni intervalo para calcularlos.

No existe un campo `completed`; “finalizado” se interpreta como inactivo,
borrado, reemplazado o atendido en el periodo.

### Caso especial: recordatorio renovado

- Si el mantenimiento actualizó el recordatorio (por ejemplo, cambio de aceite),
  `last_service_date`/`last_service_odometer` se mueven y `next_due_*` queda en
  el futuro. Se excluye por fecha/odómetro, no por estado.
- Si el mantenimiento no actualizó el recordatorio y cae en el periodo, se
  considera atendido y se excluye.
- Se compara contra el mantenimiento más reciente del mismo vehículo y servicio.

### Pronóstico

- **Fecha:** `next_due_date` o `last_service_date + interval_months` dentro del
  periodo.
- **Odómetro:** `next_due_odometer` o `last_service_odometer + interval_distance`
  menor o igual al odómetro proyectado al final del periodo.
- **Vencido:** se incluye en el periodo actual si sigue activo y sin atención.
- **Proyección:** último odómetro + km/día reciente (últimos 90 días) × días
  restantes.
- **Costo:** promedio de mantenimientos históricos del mismo vehículo y tipo de
  servicio; si no hay historial, costo 0 y aviso.
- **Confianza:** alta (fecha + odómetro), media (uno), baja (sin datos).

Se muestra en “Recordatorios del periodo”; se incluye en caja y, si no está
cubierto por una línea, también en consumo. Se puede convertir en línea de
presupuesto; no se crea un `Record`.

## Modo global

- `BudgetSummaryBlock` pasa el modo activo a `useBudgetPlan`.
- Líneas y resumen real siguen `Propio/Total/Compartido/Pagado`.
- El saldo de consumo se etiqueta según el modo; Compartido/Pagado muestran aviso
  de que no representan gasto propio.
- El saldo de caja usa el lente de caja.

## UI

- `app/(budget)/index.tsx`: ingreso/gasto planificado y real, dos tarjetas de
  saldo, neto del plan, gastos/ingresos restantes, días restantes, disponible por
  día, desglose de obligaciones y avisos.
- `BudgetSummaryBlock`: modo activo, saldo de consumo esperado y neto.
- `BudgetLineForm`: efecto ingreso/gasto; sin badge de over budget para ingresos.
- Gráficos: nuevo modo “Balance” con neto planificado, real y esperado.
- Reutilizar `Surface`, `SummaryBlock`, `FinanceValue`, `Badge`, `InlineMessage`
  y `ListItem`; sin colores nuevos.

## Archivos

- `src/domain/budgets/comparison.ts`
- `src/domain/budgets/types.ts`
- `src/domain/budgets/balance.ts` (nuevo)
- `src/domain/budgets/obligations.ts` (nuevo)
- `src/domain/budgets/charts.ts`
- `src/domain/budgets/__tests__/comparison.test.ts`
- `src/domain/budgets/__tests__/balance.test.ts`
- `src/domain/vehicle/reminderForecast.ts` (nuevo)
- `src/domain/vehicle/__tests__/reminderForecast.test.ts`
- `src/db/repositories/budgets.ts`
- `src/hooks/useBudgetPlan.ts`
- `src/hooks/useBudgetObligations.ts` (nuevo)
- `app/(budget)/index.tsx`
- `src/components/summaries/BudgetSummaryBlock.tsx`
- `src/components/budgets/BudgetBalanceCard.tsx` (nuevo)
- `src/components/budgets/BudgetObligationsCard.tsx` (nuevo)
- `src/components/budgets/BudgetLineForm.tsx`
- `src/lang/messages/budget.ts`
- `src/lang/messages/help.ts`
- `docs/architecture/domains.md`
- `docs/architecture/dependencies.md`
- `docs/plans/futuro-borrador.md`
- `docs/phases.md`

## Modelo y migración

Sin migración.

- No se agregan tablas ni columnas.
- El saldo se deriva de `BudgetPlans`, `BudgetLines`, `Records`, `Fixed`,
  `Financings`, `Savings`/`SavingsHistory`, `VehicleReminders`/
  `VehicleMaintenance` y `PaidCredits`.
- No se guarda el saldo esperado; se recalcula.
- Si más adelante se quiere saldo inicial manual o líneas de obligaciones, será
  una fase aparte con migración.

## Registros

- No aplica `pockettool-records`: Presupuestos no crea, vincula ni omite
  `Records`.
- Los actuales se leen de `Records`; se mantienen las exclusiones de gastos
  pagados con ahorro y tipo de pago de tarjeta.
- Plantillas, promedios y sugerencias no crean `Records`.
- Convertir una obligación en registro sería un flujo aparte con
  crear/vincular/omitir.

## Pruebas

- Periodo calendario, día de inicio, cruce de mes, pasado/actual/futuro.
- Ingresos reales y planificados; ingresos sin planificar.
- Saldo de consumo positivo, cero, negativo y sin ingresos.
- Saldo de caja con liquidaciones, ahorros y tarjetas.
- Obligaciones: fijos, financiamientos, ahorros, vehículo y tarjetas.
- No duplicación por cada fila de la tabla.
- Vehículo: activo, inactivo, borrado, reemplazado, atendido, renovado, sin
  datos, costo estimado y confianza.
- Ahorros: regla porcentaje/fija, parte propia, aporte real y remanente.
- Gráfico de balance.
- Ayuda bilingüe y registro.

## Ayuda e i18n

- Actualizar `budgets` con saldo de consumo/caja, fórmula, obligaciones,
  compartidos, ahorros, vehículo, tarjetas y ejemplos ficticios.
- Nuevas claves en `budget.ts`: `expectedConsumptionBalance`,
  `expectedCashBalance`, `currentNet`, `remainingIncome`, `remainingExpense`,
  `daysRemaining`, `dailyAvailable`, `obligations`, `fixedPending`,
  `financingDue`, `savingsContribution`, `vehicleReminder`, `cardPayment`,
  `noIncomeWarning`, `negativeBalanceWarning`, `savingsExcludedNote`, `modeNote`.
- Si el contenido crece, crear `budgetBalance` relacionado con `budgets`.

## Documentación

- `docs/architecture/domains.md`: periodo, fórmulas, obligaciones y modos.
- `docs/architecture/dependencies.md`: Presupuestos depende de `shared`,
  `savings`, `credits`, `financings`, `fixeds`, `vehicle` y `charts`.
- `docs/plans/futuro-borrador.md`: marcar resueltos los pendientes de
  Presupuestos.
- `docs/phases.md`: Fase 20 al planificar/cerrar.
- `docs/database.md`: sin cambios.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Doble conteo de obligaciones | `reconcileBudgetObligations` + tests. |
| Vehículo sin costo histórico | Costo 0 y aviso; confianza baja. |
| Proyección de odómetro imprecisa | Km/día reciente, confianza y exclusión por mantenimiento. |
| Modo Compartido/Pagado no es consumo | Etiquetas y aviso; caja como referencia. |
| Aportes a ahorro ya registrados | Restar remanente, no el sugerido completo. |
| Rendimiento por más consultas | Consultas mínimas y caché por foco. |
| Planes antiguos sin periodo | Fallback a mes calendario. |
| UI sobrecargada | Resumen compacto + obligaciones expandibles. |

## Verificación

```bash
npm run typecheck
npm run test:db
npm test
npm run lint
npm run doctor
npm run docs:audit
npm run ci
npx expo export --platform android
```

QA manual: periodo calendario y día de inicio, ingresos, gastos, fijos,
financiamiento, ahorro, vehículo, tarjeta, compartido, saldo negativo, EN/ES y
claro/oscuro.

## Fases de ejecución

| Fase | Contenido | Estado |
|---|---|---|
| 20A — Núcleo | Periodo real, ingresos/gastos/neto, saldo de consumo, avisos básicos y tests. | ✅ |
| 20B — Caja y Compromisos | Saldo de caja, fijos y financiamientos, reconciliación sin duplicados. | ✅ |
| 20C — Ahorros y Vehículo | Aportes propios, recordatorios de vehículo, tarjetas y sugerencias. | ✅ |
| 20D — Cierre | Gráfico de balance, ayuda, i18n, documentación, QA y verificación. | ✅ |

## Resultado del cierre

- Fase 20 finalizada el 2026-11-21.
- Presupuestos con periodo real, ingresos/gastos/neto, saldo de consumo y caja.
- Obligaciones reconciliadas de fijos, financiamientos, ahorros, vehículo y
  tarjetas.
- Sugerencias de ahorros vinculados, orden manual por `sort_order` y arrastre.
- Verificación: `typecheck`, `test:db`, 318 tests, lint, `doctor` 20/20,
  `docs:audit`, `ci` y export Android.
- Commits principales: `d943930`, `771578c`, `7fe1654`, `e6865f8`, `aa952e4`,
  `b7a042f`.
