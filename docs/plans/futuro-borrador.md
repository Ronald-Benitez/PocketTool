# Borrador — Pendientes futuros fuera de la Fase 12

**Cuándo leer:** al planificar una fase posterior a la 12.
**Resumen:** problemas detectados durante la Fase 12 que no forman parte de su alcance.
No implementar aquí sin convertirlos en una fase con plan aprobado.

## 1. Refresco global después de compras de combustible

**Síntoma:** al registrar una compra de combustible, las pantallas que leen
`useRecordsStore` (Inicio, Registros, Resúmenes y Personas) pueden seguir mostrando
el estado anterior. La pantalla de combustible sí refresca sus propias entradas.

**Causa probable:** `FuelEntryForm` crea/vincula un `Record` desde el repositorio de
vehículo y refresca solo el estado del vehículo; no actualiza `useRecordsStore` ni
los resúmenes globales. Inicio/Registros dependen de la carga del grupo y no se
refrescan al recuperar el foco.

**Propuesta:**
- Extraer un helper `refreshGroupData(groupId)` que recargue registros, créditos
  pagados y liquidaciones, y actualice `useRecordsStore`.
- Usarlo al guardar combustible, mantenimiento, fijos, financiamientos, ahorros y
  cualquier flujo que cree o modifique `Records` fuera de la pantalla de Registros.
- Añadir refresco por foco (`useFocusEffect`) en Inicio, Registros y Resúmenes, o
  suscribir esas pantallas a una versión de los stores que se invalide al escribir.
- Pruebas: crear un registro desde combustible y verificar que Inicio, Registros,
  Resúmenes y Personas lo reflejan sin reiniciar.

**Archivos:** `src/components/vehicle/FuelEntryForm.tsx`,
`src/db/repositories/vehicle.ts`, `app/(vehicle)/fuel.tsx`,
`src/stores/RecordsStore.ts`, `app/index.tsx`, `app/(financials)/RecordsScreen.tsx`,
`app/(summaries)/index.tsx`, `app/(people)/index.tsx`.

## 2. Compartidos por monto

**Síntoma:** al compartir solo se pueden ingresar porcentajes. Se necesita poder
ingresar un monto, y debe aplicar a fijos, financiamientos, ahorros, registros y al
estado de cuenta por persona.

**Estado actual:**
- `SharedExpenseParticipants` solo guarda `share_percent`.
- `SharedParticipantsField` pide porcentaje.
- `computeRecordShares` y `splitSharedAmount` reparten por porcentaje.
- `ParticipantDraft` solo tiene `personId` y `sharePercent`.
- Fijos, financiamientos, ahorros y registros consumen ese mismo contrato.

**Propuesta:**
- Permitir mezclar por persona: cada participante puede usar porcentaje o monto.
- Al agregar un participante nuevo, usar por defecto el mismo tipo (porcentaje o
  monto) del participante anterior.
- En ahorros, omitir de momento la opción de monto: solo porcentaje hasta definir
  la semántica.
- Agregar a `SharedExpenseParticipants` un modo (`percent` | `amount`) y
  `share_amount_cents`. Backfill `percent` para los datos existentes.
- Regla de mezcla: los montos son fijos; los porcentajes se calculan sobre el total.
  Validar que la suma asignada no supere el total y que el resto sea la parte propia.
- Actualizar `ParticipantDraft`, `SharedParticipantsField` (selector porcentaje/monto
  por persona), `replaceOwnerParticipants`, `computeRecordShares`,
  `splitSharedAmount`, fijos, financiamientos, registros y estado de cuenta.
- Actualizar ayuda, textos, migración, generados, pruebas y documentación.

**Archivos:** `src/db/schema/tables.ts`, nueva migración,
`src/validation/entities.ts`, `src/interfaces/schema.ts`,
`src/components/shared/SharedParticipantsField.tsx`,
`src/domain/shared/split.ts`, `src/domain/shared/statement.ts`,
`src/db/repositories/people.ts`, `fixed`, `financings`, `records`, ayuda y pruebas.
Ahorros queda fuera de esta fase de montos; solo porcentaje.

## 3. Criterio del plan mensual en Resúmenes

**Situación:** `BudgetSummaryBlock` llama `useBudgetPlan(group?.id)` sin pasar el modo,
por lo que usa `own` por defecto. El plan muestra el grupo seleccionado, el total
planificado y el real de gastos, y hasta 5 líneas de gasto; no sigue `Tu parte /
Compartido / Total / Propio bruto`.

**Propuesta:** queda pendiente para una actualización futura de la sección de
Presupuestos. No cambiar el bloque en la Fase 12. Cuando se aborde, pasar el modo de
importe activo a `useBudgetPlan`; los importes planificados no se reparten por persona
y solo cambiaría el real. Mantenerlo en consumo (no caja), porque el plan no tiene
liquidaciones.

## 4. Crear ahorros con monto 0

**Síntoma:** el formulario de ahorros exige un monto inicial mayor que cero. Debe
permitirse crear una cuenta o meta con monto 0.

**Propuesta:**
- Relajar la validación de `savingInputSchema` para aceptar `amount >= 0` en creación.
- Revisar `createSaving` y el movimiento inicial: no crear `SavingsHistory` cuando
  el monto sea 0, o crear un movimiento inicial de 0 solo si la UI lo necesita.
- Revisar metas, aportes y proyecciones para no dividir por cero ni asumir saldo
  inicial positivo.
- Actualizar textos de ayuda y pruebas de creación con 0, edición y primer aporte.

**Archivos:** `src/components/savings/add-savings.tsx`,
`src/validation/entities.ts`, `src/db/repositories/savings.ts`,
`src/domain/savings/`, `src/lang/messages/savings.ts` (si aplica),
`src/help` y pruebas.

## 5. Otros puntos a revisar

- Revisar si el refresco por foco debe generalizarse a todas las secciones del drawer.
- Revisar el comportamiento de `GroupSelector` al borrar el último grupo: registros,
  liquidaciones y resúmenes pueden quedar con datos del grupo anterior en memoria.
- Evaluar un botón de “actualizar” manual en Resúmenes si el refresco automático no
  cubre todos los flujos.

## Notas de la Fase 12 ya resueltas

- El modal de detalle de Resúmenes ahora respeta `Tu parte / Compartido / Total /
  Propio bruto` y también `Caja`.
- Personas se recarga al recuperar el foco.
- `Total` es la compra completa (parte propia + compartida), no el balance de caja.
  El balance de caja se muestra aparte e incluye lo pagado/recibido y las
  liquidaciones.
- `Compartido` es lo que otras personas deben, bruto y antes de liquidar.
- `Propio bruto` es ingresos menos compras pagadas, sin liquidaciones.
