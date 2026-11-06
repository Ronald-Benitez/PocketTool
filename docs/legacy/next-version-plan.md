# Plan de la siguiente versión — Fase 10 (NV)

**Resumen:** ajustes de integración entre Registros, compromisos, créditos,
vehículo, personas, compartidos y modos de importe.
**Estado:** implementado y validado (2026-11-03). Documento histórico; no es
plan vigente.
**Leer solo si:** necesitas el detalle de una decisión de la Fase 10.
**Secciones:** 1. Alcance · 2. Decisiones · 3. Ítems · 4. Modelo y migraciones ·
5. Subfases · 6. Riesgos · 7. Estado · 8. Verificación.


**Estado:** ✅ Finalizada, validada y archivada (2026-11-03)
**Fecha:** 2026-11-03
**Objetivo:** cerrar los errores de integración entre Registros, Gastos fijos,
Créditos/Préstamos, Vehículo y Resúmenes, y añadir un modelo reutilizable de
personas y gastos compartidos.

---

## 1. Alcance

La siguiente versión debe resolver diez frentes:

1. Mostrar créditos/préstamos pendientes en `Records`, con el modal de registro autocompletado.
2. Llevar los compartidos de Créditos/Préstamos también a Gastos fijos.
3. Separar explícitamente total, monto propio y monto compartido.
4. Permitir compartidos con un número ilimitado de personas.
5. Crear un registro de personas reutilizable.
6. Corregir la inferencia de odómetro cuando se alternan registros con odómetro
   y registros con distancia.
7. Permitir elegir el tipo de registro al crear un gasto desde Vehículo y
   configurar un tipo por defecto.
8. Reflejar Créditos/Préstamos en los resúmenes de la sección de fijos.
9. Renombrar la sección de fijos para que represente todo su contenido.
10. Corregir el cambio de grupo en Resumen, que la primera selección se revierte.

---

## 2. Decisiones de diseño que deben cerrarse antes de implementar

### 2.1 Personas y compartidos

- Crear una tabla `People` como registro único de personas:
  - `id`
  - `name`
  - `notes`
  - `is_active`
  - `created_at`, `updated_at`, `deleted_at`
- Crear una tabla `SharedExpenseParticipants`:
  - `id`
  - `owner_type`: `fixed` | `financing` | `record`
  - `owner_id`
  - `person_id`
  - `share_percent`
  - `notes`
  - `created_at`, `updated_at`, `deleted_at`
- Regla:
  - `total = fixed_amount` o `payment_cents` del financiamiento.
  - `shared = total * sum(participant.share_percent) / 100`.
  - `own = total - shared`.
  - Validar que la suma de porcentajes no supere 100%.
- Migrar los campos actuales `Financings.is_shared`,
  `shared_percent` y `shared_counterparty` a una persona + participante. Mantener
  los campos legacy durante una versión para no romper datos existentes.
- Los registros creados desde una operación compartida deben guardar el
  snapshot de `own_amount_cents` y `shared_amount_cents`, además del total.

### 2.2 Obligaciones pendientes en Registros

- El vínculo se resolvió con `FinancingPayments.record_id`, que ya existía. No
  se añadió `Records.financing_payment_id`.
- Un pago pendiente de financiamiento no debe aparecer si ya tiene un `Record`
  vinculado.
- La obligación pendiente abre el formulario de pago de financiamiento con
  monto, fecha, tipo de registro, categoría, método de pago y financiamiento
  precargados. Al guardar, se crea el `Record` y se vincula al pago.
- La lista se filtra por el grupo/mes seleccionado y usa el próximo pago del
  calendario.

### 2.3 Tipo de registro en Vehículo

- Añadir `record_type_id` a `VehicleSettings`.
- La configuración es **global de la sección Vehículo**, por clave de flujo
  (`fuel`, `maintenance`, etc.), no por vehículo.
- El formulario de combustible y mantenimiento debe mostrar un selector de tipo
  de registro cuando el usuario elija crear un gasto.
- El valor inicial debe venir de la configuración de la sección para esa clave
  (`fuel`, `maintenance`, etc.).
- El tipo seleccionado debe guardarse en el `Record`; no debe inferirse
  automáticamente.

### 2.4 Odómetro efectivo

- Introducir el concepto de **odómetro efectivo** por entrada:
  - Si hay odómetro explícito, usarlo.
  - Si no hay odómetro pero hay distancia, inferirlo desde el odómetro efectivo
    anterior.
  - Si no hay odómetro ni distancia, usar el odómetro efectivo anterior.
- El cálculo de consumo, los segmentos, los recordatorios y el odómetro actual
  del dashboard deben usar el odómetro efectivo, no solo el último odómetro
  explícito.

### 2.5 Nombre de la sección de fijos

- La sección contiene gastos fijos, financiamientos, categorías, tipos de pago
  y métodos de pago.
- Opciones:
  - **Compromisos** (recomendado).
  - **Obligaciones**.
  - **Gestión de pagos**.
- Si se elige “Compromisos”, los catálogos de categorías/métodos pueden quedar
  como subsección o moverse a Configuración.
- Actualizar drawer, tabs, ayuda, traducciones y documentación.

### 2.6 Resúmenes de fijos y créditos

- El resumen de fijos debe incluir:
  - gastos fijos recurrentes;
  - cuota mensual/próximo pago de financiamientos activos.
- Evitar doble conteo cuando un pago de financiamiento ya está reflejado como
  `Record`.
- Mostrar tres vistas: **total**, **propio** y **compartido**.
- Presupuestos y resúmenes personales deben usar el monto propio por defecto,
  con opción de ver el total.

---

## 3. Ítems detallados

### NV-1. Créditos/préstamos pendientes en Registros

**Problema:** `Records` solo lista gastos fijos pendientes. Los pagos de
financiamientos no aparecen como obligaciones pendientes.

**Solución propuesta:**

- Extender `records-table.tsx` para generar una lista de pagos de
  financiamientos pendientes del grupo/mes actual.
- Mostrar el pago desde el inicio del mes seleccionado, sin esperar el día
  exacto, e incluir los vencidos.
- Excluir pagos que ya tienen `record_id`.
- Añadir una sección “Créditos y préstamos” con el mismo patrón visual de
  `FixedsGroup`.
- Al pulsar, abrir `AddRecord` con:
  - monto de la cuota;
  - fecha del próximo pago;
  - grupo actual;
  - categoría y método de pago del financiamiento;
  - tipo de registro;
  - nombre `Pago · <financiamiento>`;
  - `financing_payment_id`.
- Al guardar, vincular el `Record` con el pago y refrescar la lista.

**Archivos:** `src/components/records/records-table.tsx`,
`src/components/records/FixedsGroup.tsx`, `src/components/records/add-record.tsx`,
`src/db/repositories/financings.ts`, `src/db/schema/tables.ts`,
`src/validation/entities.ts`.

**Aceptación:**

- El pago pendiente aparece en Registros.
- El modal abre con todos los datos completos.
- Al guardar, el pendiente desaparece y no se duplica.
- El pago queda vinculado al financiamiento.
- Home lista los compromisos pendientes (incluidos los que vencen hoy) y abre
  el formulario con la fecha y el monto precargados.
- Los montos mostrados y registrados son los del usuario; la parte compartida
  se muestra aparte.

### NV-2. Compartidos en Gastos fijos

**Problema:** Los compartidos solo existen en financiamientos.

**Solución propuesta:**

- Usar `SharedExpenseParticipants` también para `Fixed`.
- Añadir en `AddFixed` la gestión de participantes.
- Calcular `total`, `own`, `shared`.
- Al crear el `Record` de un fijo compartido, guardar los montos propios y
  compartidos.

**Aceptación:**

- Un gasto fijo puede tener varias personas.
- El registro y los resúmenes muestran total/propio/compartido.

### NV-3. Separar montos propios y compartidos

**Problema:** Los montos compartidos se mezclan con los reales del usuario.

**Solución propuesta:**

- Añadir a `Records`:
  - `own_amount_cents`
  - `shared_amount_cents`
- `amount` guarda el monto propio del usuario; el total se obtiene como
  `own_amount_cents + shared_amount_cents`.
- Regla `own + shared = total` en la UI. Los registros históricos conservan su
  snapshot y se normalizan al editarlos.
- Mostrar selectores/toggles de total/propio/compartido en:
  - Registros;
  - Resúmenes;
  - Presupuestos;
  - Gastos fijos;
  - Créditos/Préstamos.
- Los cálculos de balance personal usan `own_amount_cents` por defecto.
- Mantener una vista de total para análisis.

**Aceptación:**

- No hay ambigüedad entre lo que paga el usuario y lo que comparte.
- Los totales reconcilian.
- Los resúmenes permiten alternar entre las tres vistas.

### NV-4. Compartidos con personas ilimitadas

**Problema:** El modelo actual solo contempla un porcentaje compartido y una
contraparte.

**Solución propuesta:**

- Sustituir el modelo de un solo porcentaje por `SharedExpenseParticipants`.
- Permitir agregar, editar y quitar personas sin límite.
- Validar suma de porcentajes.
- Mostrar el desglose por persona.

**Aceptación:**

- Se pueden agregar tres o más personas.
- El total compartido se calcula por suma de participantes.
- La UI no limita a dos personas.

### NV-5. Registro de personas

**Problema:** No hay una entidad reutilizable para personas.

**Solución propuesta:**

- Crear `People`.
- Añadir una pantalla o sección “Personas” para:
  - crear;
  - editar;
  - archivar;
  - consultar totales compartidos.
- Reutilizar el selector de personas en fijos, financiamientos y registros.
- Evitar duplicados por nombre normalizado y permitir alias/notas.

**Aceptación:**

- Una persona se crea una vez y se reutiliza.
- Se puede ver cuánto se comparte con cada persona.
- No se duplican personas por errores de escritura.
- Cada persona tiene un historial de pagos compartidos
  (`SharedPaymentAllocations`) con fecha, concepto, porcentaje y monto. El
  historial registra también la parte compartida de abonos a capital y de
  pagos que reducen la cuota.

### NV-6. Inferencia correcta de odómetro

**Problema:** Al alternar registros con odómetro y registros con distancia, el
siguiente registro con odómetro calcula la distancia desde el último odómetro
explícito, ignorando los registros con distancia intermedios.

**Solución propuesta:**

- Crear un helper de dominio `resolveEffectiveOdometer` que recorra las entradas
  en orden y calcule el odómetro efectivo.
- Usar ese odómetro en:
  - `analyzeFuelEntries`;
  - segmentos de consumo;
  - `resolvePartialOdometer` al guardar;
  - recordatorios (`latestOdometerKm`);
  - odómetro actual del dashboard.
- Añadir pruebas de regresión con la secuencia:
  - odómetro 1000;
  - distancia 300;
  - distancia 200;
  - odómetro 1600.
- Resultado esperado: distancias 300, 200 y 100; alertas y dashboard en 1600.

**Archivos:** `src/domain/vehicle/fuel.ts`,
`src/domain/vehicle/reminders.ts`,
`src/db/repositories/vehicle.ts`,
`app/(vehicle)/index.tsx`,
`src/domain/vehicle/__tests__/fuel.test.ts`,
`src/domain/vehicle/__tests__/reminders.test.ts`.

### NV-7. Tipo de registro en gastos de Vehículo

**Problema:** Al crear un `Record` desde combustible, el tipo se asigna
automáticamente y el usuario no puede elegirlo ni definir un valor por defecto.

**Solución propuesta:**

- Añadir `record_type_id` a `VehicleSettings`.
- Añadir selector de tipo de registro en:
  - `FuelEntryForm`;
  - `MaintenanceForm`;
  - `VehicleSettingsPanel`.
- Precargar el tipo desde la configuración del vehículo.
- Guardar el tipo elegido en el `Record`.
- Validar que exista un tipo seleccionado al crear el gasto.
- Migrar configuraciones existentes con el tipo de gasto por defecto.

**Aceptación:**

- El usuario elige el tipo al crear el gasto.
- El tipo por defecto se configura por vehículo y por flujo.
- No se autoasigna un tipo distinto al elegido.

### NV-8. Créditos/Préstamos en resúmenes de fijos

**Problema:** `useFixedsResumesStore` solo suma gastos fijos y no incluye
financiamientos.

**Solución propuesta:**

- Extender el store/resumen para incluir financiamientos activos.
- Calcular la obligación mensual del financiamiento desde la cuota pactada o el
  próximo pago del calendario.
- Agregar por tipo de registro, categoría y método de pago.
- Evitar doble conteo con `Records` ya vinculados.
- Mostrar desglose:
  - fijos;
  - créditos/préstamos;
  - total.
- Aplicar la separación total/propio/compartido.

**Aceptación:**

- El resumen refleja fijos + financiamientos.
- No se duplica un pago ya registrado.
- Se puede ver el desglose por sección.

### NV-9. Renombrar la sección de fijos

**Problema:** “Gastos fijos” ya no describe todo el contenido de la sección.

**Solución propuesta:**

- Elegir un nombre que englobe gastos fijos, financiamientos y catálogos.
- Recomendación: **Compromisos**.
- Actualizar:
  - drawer;
  - títulos de tabs;
  - textos de ayuda;
  - traducciones;
  - documentación;
  - rutas o etiquetas visibles si aplica.
- Si se mantiene la sección de catálogos, considerar “Compromisos y catálogos”
  o mover catálogos a Configuración.

**Aceptación:**

- El nombre describe la sección completa.
- No quedan referencias visibles a “Gastos fijos” como nombre principal.

### NV-10. Cambio de grupo en Resumen

**Problema:** Al seleccionar un grupo distinto del actual, la primera vez
cambia un momento y luego vuelve al último grupo. La segunda vez mantiene la
selección; al elegir otro grupo se repite el patrón.

**Hipótesis:** Existen dos fuentes de verdad para el grupo seleccionado
(estado local/global y AsyncStorage) y un efecto asíncrono sobrescribe la
selección con el valor persistido anterior.

**Solución propuesta:**

- Unificar el grupo seleccionado en un único store/estado.
- Cargar el grupo persistido una sola vez al iniciar.
- Al seleccionar, actualizar el estado de forma síncrona y persistir después.
- Cancelar lecturas asíncronas obsoletas.
- Evitar efectos que dependan de `group` y vuelvan a escribir el grupo.
- Añadir una prueba con almacenamiento simulado y selección repetida.

**Archivos:** `src/components/groups/group-selector.tsx`,
`src/stores/RecordsStore.ts`, `app/(summaries)/index.tsx`,
`src/hooks/useGroups` o repositorio correspondiente.

**Aceptación:**

- La primera selección de un grupo se mantiene.
- No hay parpadeo ni reversión al grupo anterior.
- Cambios sucesivos funcionan siempre.

### NV-11. Modo de importe y desglose por bucket (implementado)

**Problema:** Los resúmenes solo mostraban el total propio y un total general
compartido, sin poder alternar entre propio, total y compartido ni ver el
desglose dentro de cada categoría, método o tipo.

**Solución propuesta:**

- Añadir a cada bucket de resumen (`categoría`, `método de pago`, `tipo de pago`
  y `tipo de registro`) los valores `own`, `shared` y `total`.
- Crear un selector reutilizable **Tu parte / Total / Compartido** persistido en
  `AsyncStorage`.
- Aplicarlo en Resúmenes, Compromisos, Presupuestos y Créditos.
- En Presupuestos y Créditos, el modo selecciona el importe usado para los
  totales y las filas; los registros de origen no se modifican.

**Archivos:** `src/hooks/useSummaryMode.ts`,
`src/components/summaries/SummaryModeToggle.tsx`,
`src/stores/ResumesStore.ts`, `src/stores/FixedsResumesStore.ts`,
`src/components/summaries/FinanceTableBlock.tsx`,
`src/hooks/useBudgetPlan.ts`, `src/db/repositories/budgets.ts`,
`src/stores/CreditsStore.ts`, `app/(summaries)/index.tsx`,
`app/(fixeds)/RecordTypeScreen.tsx`, `app/(budget)/index.tsx`,
`app/(credits)/index.tsx`.

**Aceptación:**

- El modo elegido se mantiene al cambiar de pantalla o reiniciar.
- Los buckets muestran el importe del modo activo.
- `own + shared = total` en cada bucket.
- Presupuestos y Créditos respetan el modo sin alterar datos guardados.

---

## 4. Modelo de datos y migraciones propuestas

Migraciones pequeñas por dominio:

1. `0013_vehicle_settings_record_type` — **implementada**.
   - `VehicleSettings.record_type_id`.
2. `0014_people_and_shared_participants` — **implementada**.
   - `People`.
   - `SharedExpenseParticipants`.
   - Backfill de `Financings.is_shared`/`shared_percent`/
     `shared_counterparty`.
3. `0015_records_shared_amounts` — **implementada**.
   - `Records.own_amount_cents`.
   - `Records.shared_amount_cents`.
   - Backfill: `own = amount`, `shared = 0`.
4. `0016_shared_payment_allocations` — **implementada**.
   - `SharedPaymentAllocations` con persona, dueño, registro, fecha, etiqueta,
     porcentaje y monto.
   - Registra el historial por persona de fijos y financiamientos, incluidos
     abonos a capital.

No se requiere una migración adicional para el vínculo de pagos de
financiamiento: se usa `FinancingPayments.record_id`.

Reglas:

- No guardar montos compartidos como columnas duplicadas sin snapshot cuando el
  registro histórico lo requiera.
- Los campos legacy de `Financings` se conservan durante una versión.
- Actualizar `src/db/schema/generated/` con `npm run db:generate`.
- Añadir pruebas en `scripts/db-tests.js` para cada migración y backfill.

---

## 5. Subfases de ejecución

### NV-0 — Decisiones y contratos

- Nombre de la sección.
- Regla de total/propio/compartido.
- Definición de “pendiente” para financiamientos.
- Alcance de personas y participantes.
- Criterio de resúmenes con doble conteo.

### NV-1 — Esquema y migraciones

- Personas, participantes, montos propios/compartidos, vínculo de pagos y tipo de
  registro en vehículo.
- Artefactos generados y tests de DB.

### NV-2 — Personas y compartidos

- Pantalla de personas.
- Selector de personas.
- Compartidos en fijos y financiamientos.
- Totales y desglose.

### NV-3 — Registros y obligaciones pendientes

- Créditos/préstamos pendientes en Registros.
- Precarga del modal.
- Vínculo con pagos de financiamiento.
- Evitar duplicados.

### NV-4 — Vehículo

- Odómetro efectivo en consumo, segmentos, recordatorios y dashboard.
- Selector de tipo de registro y configuración por defecto.

### NV-5 — Resúmenes y renombre

- Incluir financiamientos en resúmenes de fijos.
- Totales total/propio/compartido.
- Renombrar la sección.
- Corregir el cambio de grupo en Resumen.

### NV-6 — QA y cierre

- Typecheck, Jest, `test:db`, lint, doctor y export Android.
- QA Android/iOS.
- Notas de versión y actualización de documentación/ayuda.

---

## 6. Riesgos

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| Cambios de compartidos afectan todos los resúmenes | Alto | Definir contrato total/propio/compartido y tests de reconciliación |
| Doble conteo entre fijos, financiamientos y registros | Alto | Reglas explícitas de vínculo y pruebas de integración |
| Migración de compartidos existentes | Medio | Backfill con una persona por contraparte y tests |
| Cambio de inferencia de odómetro altera historiales | Medio | Tests de regresión y validación de datos existentes |
| Tipo de registro por defecto mal configurado | Medio | Backfill y validación de tipo al crear |
| Renombre de sección rompe rutas o ayuda | Medio | Cambiar solo etiquetas visibles y actualizar i18n/ayuda |
| Carrera de grupo en Resumen | Medio | Una sola fuente de verdad y pruebas con AsyncStorage |

---

## 7. Estado de implementación

Implementado:

- NV-1: créditos/préstamos pendientes en Registros, visibles durante todo el
  mes seleccionado (incluidos vencidos), con apertura del formulario de pago
  precargado y creación/vínculo del `Record` sin duplicados. Home muestra solo
  las obligaciones que vencen hoy y abre el formulario.
- NV-6: odómetro efectivo en análisis de combustible, recordatorios y lectura
  previa para cargas parciales.
- NV-7: `VehicleSettings.record_type_id` global de la sección Vehículo (no por
  vehículo), selector en ajustes, combustible y mantenimiento. Los pagos de
  financiamientos también permiten seleccionar el tipo de registro al crear el
  gasto, sin asignación automática.
- NV-8: los resúmenes de fijos incluyen la cuota mensual de financiamientos
  activos por tipo de registro, tipo de pago, método de pago y categoría.
- NV-4/NV-5: registro de personas y participantes ilimitados con porcentajes;
  aplicado a financiamientos y gastos fijos. Personas tiene su propia sección en
  el drawer y cada persona muestra un historial de pagos compartidos con el
  monto de su parte.
- Compromisos: los fijos pendientes se listan con la fecha del grupo
  seleccionado y los financiamientos muestran siempre su próximo pago, sin
  depender del día exacto. El monto propio se muestra completo cuando el
  compromiso no es compartido.
- Vehículo: al vincular un gasto de combustible se muestran el monto y la fecha
  de ambas partes para validar diferencias, y la inferencia de odómetro se
  aplica también a tanques llenos registrados con distancia y conserva el orden
  de creación en registros de la misma fecha.
- NV-9: la sección se renombró a **Compromisos** en el drawer.
- NV-10: se corrigió la carrera de selección de grupo en Resumen; una selección
  del usuario ya no es sobrescrita por la carga asíncrona del grupo fijado y las
  cargas antiguas de registros no pisan la selección nueva.
- NV-2/NV-3: compartidos en fijos y financiamientos, con total/propio/compartido
  en formularios y resúmenes. `Records.amount` guarda el monto propio;
  `shared_amount_cents` guarda la parte compartida como snapshot. Los resúmenes
  personales usan el monto propio y muestran el total/compartido aparte.
- Migraciones `0013_vehicle_settings_record_type`,
  `0014_people_and_shared_participants`, `0015_records_shared_amounts` y
  `0016_shared_payment_allocations`; `SCHEMA_VERSION = 16`.
- Corrección de integridad: `ensureSchema` ya no multiplica por 100 las columnas
  monetarias enteras (centavos) al reconstruir una tabla; solo convierte a
  centavos las columnas legacy REAL/TEXT. Evita que $25 pase a $2,500.
- Combustible: al editar una carga se respeta la unidad de volumen guardada
  (galones o litros) sin heredar la unidad por defecto del vehículo, y los
  selectores de consumo y de volumen/precio recuerdan la selección del usuario.
- UI: los modales ajustan el scroll vertical (`nestedScrollEnabled`,
  `flexGrow`) y el swipe de las tarjetas solo se activa en gestos horizontales
  (`activeOffsetX`/`failOffsetY`) para no bloquear el scroll vertical.
- NV-11: selector persistente **Tu parte / Total / Compartido** y desglose
  `own`/`shared`/`total` por bucket en Resúmenes, Compromisos, Presupuestos y
  Créditos.

Pendiente:

- QA Android/iOS y checklist visual.
- Verificación completa de cierre.
- Temas del centro de ayuda para **Personas** y para el selector
  **Tu parte / Total / Compartido** (NV-11).
- Pruebas de reconciliación `total = own + shared` por bucket, de pendientes de
  financiamiento sin duplicar `Records` y de selección de grupo repetida.
- Fase 9: decidir si se mantienen formularios separados por caso y cerrar su QA.

## 8. Verificación

```bash
npm run typecheck
npm test
npm run test:db
npm run lint
npm run doctor
npx expo export --platform android
```

Además:

- Pruebas de reconciliación `total = own + shared`.
- Pruebas de secuencia de odómetro con odómetro/distancia alternados.
- Pruebas de pendientes de financiamiento sin duplicar `Records`.
- Pruebas de selección de grupo repetida.
- QA visual Android/iOS.
