# Fase 13 — Pendientes de Fase 12 y ajustes de Registros/Vehículo

**Cuándo leer:** al revisar el histórico de la Fase 13.
**Estado:** ✅ Finalizada 2026-11-17. 13A, 13B, 13C, 13D, 13E y 13F
implementados y validados en dispositivo.
**Resumen:** cierra los pendientes funcionales posteriores a la Fase 12: compartidos
por monto, refresco global, ahorros con monto 0, selector de tipo de registro en
pantallas altas, fecha configurable de pagos pendientes de tarjeta, distancia total
en segmentos de gasolina y memoria de “Use odometer”. El criterio del plan mensual
de Presupuestos queda fuera y sigue en `docs/plans/futuro-borrador.md`.
**Secciones:** [Alcance](#alcance) · [Sub-fases](#sub-fases) · [Modelo](#modelo) ·
[Reglas](#reglas) · [UI](#ui) · [Registros](#registros) · [Pruebas](#pruebas) ·
[Riesgos](#riesgos) · [Verificación](#verificación) · [Preguntas](#preguntas)

## Alcance

Incluye:

1. Compartidos por monto en fijos, financiamientos y registros; ahorros solo
   porcentaje por ahora.
2. Refresco global después de combustible y otros flujos que crean `Records`.
3. Ahorros con monto inicial 0.
4. Selector de tipo de registro cortado en S26 Ultra.
5. Configuración para la fecha de pagos pendientes de tarjeta en Registros.
6. Distancia total recorrida en los segmentos de gasolina.
7. Recordar la última elección de “Use odometer” al registrar gasolina.
8. Ajustes menores de refresco y `GroupSelector`.

Excluye:

- Criterio del bloque de plan mensual en Resúmenes. Queda para una actualización
  futura de Presupuestos.

## Sub-fases

### 13A — Compartidos por monto

- Modelo: `SharedExpenseParticipants.share_mode` (`percent` | `amount`) y
  `share_amount_cents`; migración nueva y backfill `percent`.
- `SCHEMA_VERSION` sube una versión; regenerar artefactos y `docs/schema.md`.
- Dominio: reparto que acepta modos mezclados. Los montos son fijos; los
  porcentajes se calculan sobre el total. La suma asignada no puede superar el
  total; el resto es la parte propia. Regla confirmada: ambos se calculan sobre
  el total de la compra y se bloquea si la suma supera el total.
- UI: `SharedParticipantsField` con selector porcentaje/monto por persona. Al
  agregar una persona, heredar el modo de la anterior. En ahorros ocultar monto.
- Repositorios: `replaceOwnerParticipants`, `computeRecordShares`,
  `splitSharedAmount`, fijos, financiamientos, registros y estado de cuenta.
- Ayuda: `sharedPurchases`, `people` y `amountModes`.

### 13B — Refresco global y ahorros con monto 0

- Helper `refreshGroupData(groupId)` que recarga registros, créditos pagados y
  liquidaciones, y actualiza `useRecordsStore`.
- Usarlo al guardar combustible, mantenimiento, fijos, financiamientos y ahorros.
- Refresco por foco en Inicio, Registros y Resúmenes; Personas ya lo tiene.
- Ahorros: permitir `amount = 0`; no crear movimiento inicial con 0; revisar
  metas, aportes y proyecciones para evitar división por cero.

### 13C — Selector de tipo de registro en pantallas altas

**Reporte:** en un S26 Ultra el selector de tipo de registro aparece cortado,
no permite hacer scroll y parece tapado en parte por la barra de navegación. En
un S25 Ultra no ocurre; tampoco ocurre con el selector de categoría. No hay
captura ni video porque es un reporte de un usuario.

- Reproducir en S26 Ultra con los mismos datos y comparar con S25 Ultra:
  - contar opciones y etiquetas de `RecordTypes`;
  - revisar si hay filtros en `add-record`/`AddFixed` (hoy ambos usan
    `recordTypesRepository.fetchAll()` sin filtro);
  - probar escala de fuente, barra de navegación, teclado abierto/cerrado y
    número de tipos.
- Revisar `SelectField` + `BottomSheet`:
  - `maxHeight: '88%'`, `KeyboardAvoidingView` y `ScrollView` anidado;
  - insets de seguridad y barra de navegación;
  - `flexGrow`/`flexShrink`/`minHeight` del cuerpo y del contenedor de opciones;
  - `renderOption` con `ColoredSelectOption` en tipo de registro.
- Propuesta implementada: los pickers (`SelectField`, `MultiSelectField`,
  `DateField`) usan un **modal centrado** con `maxHeight` y scroll, en lugar de
  un bottom sheet anclado al borde inferior. Así no dependen de la barra de
  navegación ni de los límites superior/inferior. El selector de categoría debe
  seguir funcionando igual.
- Criterios de aceptación: con muchos tipos de registro y teclado cerrado, todas
  las opciones son alcanzables con scroll; la última no queda bajo la barra de
  navegación; el selector de categoría no cambia.

### 13D — Fecha de pagos pendientes de tarjeta

- Configuración nueva en `useConfigs`:
  `pendingPaymentDateMode: 'today' | 'payment_date'`.
- Default `today` para conservar el comportamiento actual.
- Ajustes: selector “Hoy” / “Fecha de pago de la tarjeta” con ayuda.
- `records-table.generateCreditRecords` usa un helper
  `resolvePendingPaymentDate({ card, group, now, mode })`.
- Regla confirmada: `payment_date` es el día de pago de la tarjeta; se aplica al
  **mes del grupo seleccionado** y se limita al último día del mes. Si no hay
  `payment_date`, usar hoy. No se calcula el próximo vencimiento desde hoy.
- `Credit` ya extiende `PaymentMethod`, por lo que `payment_date` está disponible.

### 13E — Gasolina: distancia total y “Use odometer”

- Segmentos: mostrar la distancia total recorrida al usuario. Hoy `distanceKm`
  existe en `FuelMetrics` pero solo se usa para cálculos; agregar una línea
  visible en el encabezado del segmento.
- Para segmentos completos usar `segment.metrics.distanceKm`; para en progreso,
  sumar `entry.distanceKm`. Convertir de km a la unidad del vehículo con
  `fromKm`.
- “Use odometer”: persistir la última elección **por vehículo** en AsyncStorage
  (junto a las preferencias de unidades o con una clave propia).
- Al crear una entrada nueva, usar la última elección; al editar, respetar la
  entrada; el modo baseline siempre usa odómetro.
- Guardar la preferencia al cambiarla o al guardar correctamente.
- Criterios de aceptación: la distancia total aparece en cada segmento; un
  segmento en progreso muestra la suma acumulada; una entrada nueva recuerda el
  modo del mismo vehículo; editar una entrada no cambia su modo por la
  preferencia guardada.

### 13F — Ajustes menores

- `GroupSelector` al borrar el último grupo: limpiar registros, liquidaciones y
  resumen en memoria.
- Evaluar botón manual de actualizar en Resúmenes si el refresco automático no
  cubre todos los flujos.

## Modelo

### Migración de compartidos

- `SharedExpenseParticipants`:
  - `share_mode TEXT NOT NULL DEFAULT 'percent'`;
  - `share_amount_cents INTEGER NULL`.
- Backfill `share_mode = 'percent'`.
- Índices existentes se mantienen.
- `ParticipantDraft` y zod agregan modo/monto; validar monto ≥ 0 y suma ≤ total.

### Configuración

- `Configs` agrega `pendingPaymentDateMode`.
- `resolveDefaultConfigs` y `loadConfigs` mezclan el valor con default `today`.
- No requiere tabla nueva; AsyncStorage.

## Reglas

- Compartidos: permitir mezcla; el monto es fijo y el porcentaje se calcula sobre
  el total. Si la suma supera el total, bloquear y mostrar error. Redondear el
  reparto con `splitSharedAmount`/equivalente para reconciliar.
- Ahorros: sin modo monto en esta fase; solo porcentaje.
- Fecha de pago: usar el mes del grupo seleccionado; día de pago limitado al
  último día del mes; fallback hoy.
- “Use odometer”: preferencia por vehículo; baseline y edición tienen prioridad
  sobre la preferencia.
- Refresco: no duplicar registros, solo recargar stores.

## UI

- `SharedParticipantsField`: selector de modo por persona, campo monto o
  porcentaje, totales y validación.
- `app/(settings)/index.tsx`: nueva opción de fecha de pagos pendientes.
- `app/(vehicle)/fuel.tsx`: distancia total por segmento.
- `FuelEntryForm`: recordar “Use odometer”.
- `SelectField`/`BottomSheet`: corrección de altura/scroll/insets.
- Textos y ayuda bilingüe en `src/lang/messages/`.

## Registros

- Compartidos por monto no crean un `Record` nuevo: cambian el reparto del
  registro existente. `saveRecord` sigue guardando registro y participantes en
  una transacción.
- Fecha de pagos pendientes: solo cambia la fecha propuesta del registro
  pendiente; al guardar se conserva el flujo crear/vincular/omitir actual.
- Refresco: no altera la creación ni los vínculos; solo actualiza stores.
- Gasolina/ahorros: se mantienen los flujos actuales de crear/vincular/omitir.

## Pruebas

- Dominio: reparto mixto, suma ≤ total, redondeo, montos 0, fecha de pago
  (mes/día/clamp/fallback), distancia total de segmento, resolución de
  “Use odometer”.
- DB: migración de compartidos, backfill, `ensureSchema`, soft delete.
- Jest: claves de i18n, ayuda, configs.
- Manual: S26 Ultra y S25 Ultra con los mismos datos, escala de fuente, teclado,
  barra de navegación; gasolina; ajustes; dark mode.
- Regresión: selectores de tipo de registro, categoría y pago; formularios de
  fijos, financiamientos y registros.

## Riesgos

- Compartidos por monto es un cambio transversal; migración y compatibilidad con
  datos existentes.
- Mezcla de montos y porcentajes: validar reconciliación y redondeo.
- El selector cortado puede ser un problema de insets/altura del `BottomSheet`;
  una corrección global afecta todos los selectores.
- Fecha de pago en un mes distinto al grupo: definir que se usa el mes del grupo.
- Preferencia de “Use odometer” por vehículo: migrar/leer preferencias antiguas.
- Ahorros con 0: evitar división por cero en metas/proyecciones.
- Refresco global: evitar bucles y recargas excesivas.

## Verificación

```bash
npm run db:generate
npm run typecheck
npm run test:db
npm test
npm run lint
npm run doctor
npm run docs:audit
npm run ci
```

Además: QA manual en S26 Ultra y S25 Ultra, Android/iOS y dark mode.

## Decisiones confirmadas

1. Fecha de pagos pendientes: usar el **mes del grupo seleccionado** y el día
   `payment_date` de la tarjeta, limitado al último día del mes.
2. “Use odometer”: recordar la última elección **por vehículo**.
3. Selector: no hay capturas; el reporte indica que no permite scroll y queda
   tapado por la barra de navegación. Se implementará la corrección de altura,
   scroll e insets y se validará en S26 Ultra y S25 Ultra.
4. Compartidos por monto: montos y porcentajes se calculan **sobre el total**;
   se bloquea si la suma supera el total.
5. Ahorros: solo porcentaje por ahora.
6. El criterio del plan mensual de Presupuestos queda fuera de esta fase.

## Pendiente de definir

- Orden de implementación de las sub-fases. Propuesta: empezar por 13C
  (selector), 13D (fecha de pagos), 13E (gasolina), 13B (refresco/ahorros 0) y
  dejar 13A (compartidos por monto) al final por ser el cambio más transversal.
