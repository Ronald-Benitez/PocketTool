# Plan de mejora — Ahorros compartidos, metas e integración con Registros

**Fase:** 11 (SAV)
**Estado:** ✅ Implementación funcional completa; pendiente QA y cierre
**Fecha:** 2026-11-04
**Objetivo:** convertir Ahorros de un saldo editable con historial básico en un
módulo de metas y cuentas compartidas, con progreso global/propio/otras partes,
intereses manuales, archivo histórico y una integración opcional y explícita con
`Records`.

---

## 1. Estado actual

### Modelo

- `Savings`: `id`, `saving_name`, `amount`, auditoría y soft delete.
- `SavingsHistory`: `savings_id`, `previous_amount`, `new_amount`,
  `change_date`, auditoría y soft delete.
- No hay metas, estado, tipo de ahorro, participantes, intereses ni vínculo con
  `Records`.
- `amount` es el saldo global; no existe separación entre propio y compartido.

### Repositorio y pantalla

- `useSavingsRepository`: alta, edición, eliminación y consulta por id.
- `useSavingsHistoryRepository`: historial por ahorro. Un método limita a 5
  movimientos y otro devuelve todos.
- La edición actualiza el saldo y luego inserta el historial desde la UI, fuera
  de una transacción.
- La pantalla permite seleccionar/fijar un ahorro, editarlo, ver un gráfico
  lineal y una lista de cambios, y eliminarlo.
- No hay dominio puro ni pruebas de ahorros.

### Limitaciones

- No se puede compartir un ahorro ni saber cuánto aportó cada persona.
- El gráfico solo refleja el saldo global.
- No se distingue depósito, retiro, interés o ajuste.
- No se puede pagar un gasto desde un ahorro ni saber de dónde salió el dinero.
- No se puede archivar una meta cumplida sin eliminarla.
- No hay metas ni proyección de cumplimiento.

---

## 2. Alcance propuesto

1. **Ahorros compartidos** con personas del registro `People`, reutilizando el
   modelo de participantes existente.
2. **Progreso global, propio y de otras partes**, con gráfico de tres series.
3. **Movimientos tipados**: aporte, retiro, interés manual, ajuste y saldo
   inicial.
4. **Metas**: monto objetivo, fecha objetivo, progreso y proyección.
5. **Intereses manuales** en la primera fase; la tasa anual queda como dato
   opcional para una fase posterior.
6. **Modo de integración con `Records` por ahorro**:
   - separado;
   - transferencias;
   - permitir pagar gastos desde el ahorro.
7. **Archivo histórico** de ahorros cumplidos o inactivos.
8. **Pago de gastos desde un ahorro** con vínculo transaccional a `Records`.

---

## 3. Modelo de datos propuesto

### 3.1 `Savings`

Agregar:

| Columna | Tipo | Uso |
| --- | --- | --- |
| `target_amount_cents` | money, nullable | Meta global opcional |
| `target_date` | timestamp, nullable | Fecha objetivo opcional |
| `status` | TEXT | `active`, `archived` |
| `goal_reached_at` | timestamp, nullable | Primera vez que se alcanzó la meta |
| `goal_alerted_at` | timestamp, nullable | Evita repetir la alerta de meta |
| `archived_at` | timestamp, nullable | Archivo histórico manual |
| `records_mode` | TEXT | `separate`, `linked` |
| `contribution_rule` | TEXT | `none`, `percent`, `fixed` |
| `contribution_percent_bps` | INTEGER, nullable | Ej. 1000 = 10% de ingresos del mes |
| `contribution_amount_cents` | money, nullable | Ej. 500 = $5 por mes |
| `interest_rate_bps` | INTEGER, nullable | Tasa anual informativa |
| `icon` / `color` | TEXT, nullable | Personalización visual |
| `own_amount_cents` | money, nullable | Caché de la parte propia |
| `shared_amount_cents` | money, nullable | Caché de la parte compartida |

Reglas:

- `own_amount_cents + shared_amount_cents = amount`.
- `amount` sigue siendo el saldo global.
- La meta es global para el ahorro; en compartidos no hay metas por persona.
- `contribution_rule`, `contribution_percent_bps` y
  `contribution_amount_cents` son opcionales y solo generan una **sugerencia**
  de aporte mensual; el usuario confirma o edita el monto real.
- Los cachés se recalculan desde los movimientos; no son la fuente de verdad.
- Al llegar a la meta se guarda `goal_reached_at` y se muestra una alerta. El
  archivo sigue siendo manual: `status = 'archived'`.
- `status` y `archived_at` no eliminan datos.

### 3.2 Participantes del ahorro

Reutilizar `SharedExpenseParticipants` con `owner_type = 'saving'`:

- `owner_id` = id del ahorro.
- `person_id` = persona.
- `share_percent` = porcentaje usado para repartir intereses entre las partes.
- La suma no puede superar 100%; el remanente pertenece a la parte propia.
- La aportación real no se limita al porcentaje: cada movimiento puede indicar
  qué persona aportó y cuánto.
- La meta es global; el progreso por persona se deriva de sus aportes, sin crear
  metas individuales.
- `People` es el registro global de personas: una persona ya usada en un
  financiamiento o gasto fijo se puede seleccionar directamente para un ahorro.
  No se crean contactos paralelos.
- La sección Personas mostrará también los ahorros en los que participa cada
  persona y el total aportado.

### 3.3 Movimientos

Evolucionar `SavingsHistory` a un historial de movimientos, conservando las
columnas actuales para compatibilidad:

| Columna | Tipo | Uso |
| --- | --- | --- |
| `savings_id` | INTEGER | Ahorro |
| `person_id` | INTEGER, nullable | Persona que aporta/retira |
| `kind` | TEXT | `initial`, `deposit`, `withdrawal`, `interest`, `adjustment` |
| `amount_cents` | money | Monto del movimiento, siempre positivo |
| `previous_amount` | money | Saldo global antes |
| `new_amount` | money | Saldo global después |
| `change_date` | timestamp | Fecha del movimiento |
| `period_year` | INTEGER | Año del período para el estado de aporte |
| `period_month` | INTEGER | Mes 1–12 del período |
| `note` | TEXT, nullable | Nota |
| `record_id` | INTEGER, nullable | Registro vinculado |
| `group_id` | INTEGER, nullable | Grupo del mes |
| `record_type_id` | INTEGER, nullable | Snapshot del tipo usado |
| `deleted_at` | timestamp | Soft delete |

Reglas:

- `withdrawal` no puede superar el saldo disponible.
- `interest` se reparte entre los participantes según `share_percent`; el
  remanente queda en la parte propia.
- `adjustment` corrige saldos sin afectar `Records`.
- `period_year`/`period_month` se derivan de `change_date` al guardar y se usan
  para comparar la aportación del mes contra la regla configurada.
- Un movimiento con `record_id` no se cuenta dos veces en resúmenes.

### 3.4 Regla de aporte mensual

La regla es opcional y pertenece al ahorro:

- `contribution_rule = 'percent'`: sugiere
  `ingresos del mes × contribution_percent_bps / 10000`.
- `contribution_rule = 'fixed'`: sugiere `contribution_amount_cents`.
- `contribution_rule = 'none'`: no hay sugerencia ni estado de cumplimiento.

El monto sugerido se muestra al registrar el aporte, pero el usuario puede
cambiarlo por uno manual. Al confirmar se guarda el monto real. La regla se
mantiene hasta que el usuario la cambie; no se reinicia cada mes.

Para cada mes se compara el aporte contra el sugerido. El usuario puede elegir
en la sección Ahorros si el estado mensual se calcula sobre **la parte propia** o
sobre **el global**. En `Records` y `Budget` siempre se usa la parte propia.

- **Alcanzado**: aporte = objetivo.
- **Superado**: aporte > objetivo.
- **No alcanzado**: aporte < objetivo.
- **Sin base**: no hay ingresos para calcular el porcentaje.

La base de ingresos es la suma de registros del mes con tipo de efecto `+` en el
grupo seleccionado. Si no hay ingresos, el usuario puede usar un monto manual.

### 3.5 Proyección de meta

Cuando el ahorro tiene meta, la sección Ahorros muestra una proyección de
cuándo se alcanzará:

- Si hay aportes reales, se usa el promedio de los aportes de los últimos meses.
- Si no hay aportes reales suficientes, se usa el aporte esperado de la regla
  (porcentaje de ingresos o monto fijo).
- Si hay ambos, se muestran las dos lecturas: con aportes reales y con aportes
  esperados.
- Si no hay regla ni aportes, se indica que no hay datos suficientes.

La proyección es informativa; no modifica saldos ni metas.

### 3.6 Datos por defecto para `Records`

Nueva configuración `SavingsSettings` (singleton, como `VehicleSettings`):

| Columna | Uso |
| --- | --- |
| `record_type_id` | Tipo de registro por defecto |
| `payment_method_id` | Método de pago por defecto |
| `category_id` | Categoría por defecto |
| `trophy_color` | Color del trofeo de meta cumplida |

Se editan en Configuraciones y se precargan al crear un movimiento. El usuario
puede cambiarlos en la confirmación. El efecto (`-`, `+`, `=`) **no se elige por
separado**: se toma del tipo de registro seleccionado y solo se usa al crear el
registro en `Records`. La app no muestra una advertencia por el efecto.

### 3.7 Migraciones propuestas

1. `0017_savings_goals_and_sharing`
   - columnas nuevas en `Savings`: meta, estado, archivo, regla de aporte,
     intereses y cachés;
   - `SavingsSettings`;
   - backfill `status = 'active'`, `records_mode = 'separate'`,
     `contribution_rule = 'none'`;
   - `own_amount_cents = amount`, `shared_amount_cents = 0`.
2. `0018_savings_movements`
   - columnas nuevas en `savings_history`: tipo, persona, período, notas,
     registro y snapshot del tipo;
   - backfill: cada fila histórica se convierte en `adjustment` con
     `amount_cents = ABS(new_amount - previous_amount)` y período derivado de
     `change_date`;
   - índices por `savings_id`, `change_date`, `person_id`, `record_id` y período.
3. Actualizar `SCHEMA_VERSION`, artefactos generados y pruebas de base de datos.

---

## 4. Dominio

Crear `src/domain/savings/`:

- `types.ts`: `SavingLike`, `SavingMovementLike`, `SavingParticipantLike`,
  `SavingSnapshot`.
- `balances.ts`:
  - saldo global;
  - parte propia;
  - parte por persona;
  - reparto de intereses;
  - reconciliación `global = propio + otras partes`.
- `goals.ts`:
  - progreso y restante;
  - fecha estimada de cumplimiento según aportes recientes;
  - detección de meta alcanzada y fecha de primer cumplimiento;
  - estado `active`/`archived`; el archivo es manual.
- `contributions.ts`:
  - cálculo del aporte sugerido por porcentaje de ingresos o monto fijo;
  - comparación mensual: alcanzado, superado o no alcanzado;
  - base de ingresos del grupo seleccionado.
- `charts.ts`:
  - series de progreso global, propio y otras partes;
  - línea de meta;
  - agrupación por fecha.
- `movements.ts`:
  - validación de retiros;
  - validación de participantes;
  - decisión de crear/vincular/no vincular `Records`;
  - el efecto del registro se toma del tipo elegido, sin pedirlo por separado.

La UI no calcula dinero; solo consume estos helpers.

---

## 5. Repositorios

### `useSavingsRepository`

- `fetchSavings(options?: { status?: 'active' | 'archived' | 'all' })`.
- `fetchSavingView(id)`: ahorro + participantes + movimientos + snapshot +
  estado de aporte del período.
- `createSaving(input)`: transacción con participantes y saldo inicial.
- `updateSaving(id, input)`: transacción; no escribe historial desde la UI.
- `archiveSaving(id)` / `restoreSaving(id)`.
- `deleteSaving(id)`: conserva el comportamiento actual con confirmación.
- `addMovement(input)`: transacción; crea/actualiza saldo, historial y, si
  aplica, `Records` con tipo, categoría y método elegidos.
- `deleteMovement(id)`: revierte el saldo y limpia vínculos.
- `fetchContributionStatus(savingId, year, month)`: sugerido, aportado y estado
  `met`/`exceeded`/`not_met`/`no_base`.

### `useSavingsSettingsRepository`

- `fetchSettings()` y `saveSettings()` para tipo de registro, método de pago y
  categoría por defecto.
- Los valores se usan solo como precarga editable al confirmar un movimiento.

### Reglas de `Records`

Cada operación que afecte cuentas debe ofrecer:

1. Crear un registro nuevo.
2. Vincular un registro existente compatible.
3. No vincular.

Validaciones:

- monto y fecha coinciden al vincular;
- el registro no está vinculado a otro movimiento de ahorro, vehículo o
  financiamiento;
- un gasto pagado desde ahorro crea un solo `Record` de gasto y un movimiento de
  retiro vinculado;
- una transferencia usa un tipo de registro con efecto `=` y no cuenta como
  gasto;
- si el ahorro está en modo `separate`, no se crea ni modifica `Records`.

---

## 6. Experiencia de usuario

### Sección Ahorros

- Lista/selector de ahorros activos y archivados.
- Resumen superior:
  - global;
  - propio;
  - otras partes.
- Meta opcional:
  - monto objetivo;
  - progreso porcentual;
  - restante;
  - fecha objetivo y proyección.
- Aporte del mes:
  - sugerido por porcentaje de ingresos o monto fijo;
  - aportado real;
  - estado **alcanzado**, **superado**, **no alcanzado** o **sin base**.
- La alerta de meta alcanzada aparece solo dentro de la información del propio
  ahorro.
- En la vista general, un ahorro con meta cumplida se identifica con un
  **trofeo metálico** (`SavingsGoalTrophy`), no con un mensaje de texto.
- El color del trofeo se elige en Configuraciones.
- Gráfico de líneas con tres series y línea de meta.
- Historial de movimientos con tipo, persona, monto, nota y vínculo a `Records`.
- Acciones:
  - agregar movimiento;
  - editar ahorro;
  - archivar/restaurar;
  - eliminar.

### Alta/edición de ahorro

- nombre;
- saldo inicial;
- meta y fecha objetivo (opcionales);
- participantes y porcentajes;
- regla de aporte: sin regla, porcentaje de ingresos o monto fijo;
- modo de `Records`: separado o vinculado;
- tasa de interés informativa;
- color/icono.

### Movimiento

- tipo;
- monto sugerido editable (si hay regla de aporte);
- monto real;
- fecha;
- persona que aporta/retira (si es compartido);
- nota;
- si el ahorro está en modo vinculado:
  - crear, vincular o no vincular registro;
  - tipo de registro, método de pago y categoría precargados desde
    Configuraciones y editables;
  - el efecto del registro (`-`, `+`, `=`) se toma del tipo seleccionado y no se
    muestra como una elección aparte.

### Registros

- Al crear un gasto, si existen ahorros vinculados, mostrar **origen del
  dinero**:
  - dinero del mes;
  - ahorro.
- Si se elige ahorro:
  - mostrar saldo disponible;
  - validar que alcance;
  - permitir crear/vincular/no vincular el registro del movimiento;
  - crear el gasto y el retiro vinculado en una sola transacción;
  - impedir doble conteo.
- El efecto del registro se deriva del tipo seleccionado; no se pregunta ni se
  advierte por separado.

---

## 7. Fases de implementación

### SAV-0. Decisiones y diseño

Decisiones confirmadas:

- Intereses repartidos por porcentaje de participantes.
- Meta global y opcional para ahorros compartidos.
- Aportaciones libres, con regla opcional de porcentaje de ingresos o monto
  fijo; el usuario confirma o edita el monto real.
- El usuario elige el tipo de registro, método de pago y categoría al confirmar;
  los valores por defecto se configuran globalmente y son editables.
- El tipo de registro puede generar efecto `-`, `+` o `=`; la app solo advierte
  si no coincide con el movimiento.
- El archivo por meta cumplida es manual y se muestra una alerta al alcanzarla.

### SAV-1. Esquema y migraciones

- Tablas/columnas, validaciones zod, artefactos y pruebas de migración.
- Backfill de ahorros e historial existente.

### SAV-2. Dominio y repositorios

- `balances`, `goals`, `contributions`, `charts`, `movements`.
- CRUD transaccional de ahorros, movimientos y configuración por defecto.
- Estado mensual de aporte y alerta de meta alcanzada.
- Pruebas unitarias.

### SAV-3. UI de ahorros

- Resumen global/propio/compartido.
- Meta y progreso.
- Proyección de meta.
- Gráfico de tres series.
- Movimientos tipados.
- Alta/edición/archivo.
- Trofeo metálico `SavingsGoalTrophy` para metas cumplidas y color en
  Configuraciones.
- Estado mensual propio/global seleccionable.
- Sección Personas con aportes a ahorros.

### SAV-4. Integración con Registros

- Origen del dinero en gastos.
- Crear/vincular/no vincular con tipo, método y categoría editables.
- Valores por defecto en Configuraciones.
- El efecto del registro se toma del tipo elegido.
- Validación de monto/fecha y exclusión de registros ya vinculados.
- Pruebas de no duplicación.

### SAV-5. Ayuda, QA y cierre

- Actualizar tema de ayuda de Ahorros.
- Actualizar AGENTS, docs y notas de versión.
- Typecheck, test:db, Jest, lint, doctor y export Android.

---

## 7.1. Implementado hasta ahora

- `0017_savings_goals_and_sharing` y `0018_savings_movements`;
  `SCHEMA_VERSION = 18`.
- `SavingsSettings` y campos nuevos de `Savings`/`SavingsHistory`.
- Dominio `src/domain/savings/`: balances, metas, aportes, proyección, gráficos y
  pruebas.
- Repositorio transaccional: alta/edición/archivo/eliminación, movimientos,
  participantes, settings, búsqueda de registros y totales por persona.
- UI de Ahorros: selector, resumen global/propio/compartido, meta, proyección,
  estado mensual, gráfico de tres series con leyenda de colores, trofeo,
  historial, formularios de ahorro y movimiento.
- Lista de ahorros con altura uniforme, ahorro fijado persistente y orden de
  movimientos ascendente/descendente recordado.
- Aporte sugerido proporcional a la parte propia o a la persona seleccionada en
  un ahorro compartido.
- Integración inicial con `Records`: origen del dinero en gastos y creación de
  movimiento de retiro dentro de la misma transacción.
- Configuración de defaults de registros y color del trofeo en Ajustes, con
  secciones colapsables y buscador.
- Personas muestra aportes y saldo en ahorros.
- Pruebas de migración legacy, movimientos, retiros, saldo insuficiente y
  vínculo/desvínculo de `Records` sin crear registros duplicados.

Pendiente:

- QA Android/iOS y checklist visual.
- Cierre documental y de fase.

---

## 8. Criterios de aceptación

- Un ahorro puede tener varias personas y la suma de porcentajes no supera 100%.
- El saldo global reconcilia con `propio + otras partes`.
- Cada persona tiene su aporte y progreso visibles.
- Los intereses manuales aumentan el saldo y se reparten por porcentaje de
  participantes; el remanente queda en la parte propia.
- La meta es global, opcional, y muestra progreso, restante y proyección.
- La regla de aporte mensual se configura por porcentaje de ingresos o monto
  fijo, y el usuario puede editar el monto sugerido.
- El estado mensual indica alcanzado, superado o no alcanzado.
- Al alcanzar la meta se muestra una alerta; el archivo es manual y conserva el
  historial.
- El modo de `Records` se guarda por ahorro (`separate`/`linked`).
- El usuario elige tipo de registro, método de pago y categoría al confirmar;
  los valores por defecto se configuran globalmente y son editables.
- El efecto del registro se toma del tipo seleccionado y solo aplica al
  `Record` creado.
- Un gasto pagado desde ahorro crea un solo registro y descuenta el saldo una
  sola vez.
- Vincular un registro valida monto, fecha y que no esté ya vinculado.
- El gráfico muestra global, propio y otras partes.
- La ayuda y la documentación quedan actualizadas.

---

## 9. Decisiones confirmadas

- **Intereses:** repartidos por porcentaje de participantes.
- **Meta:** global para ahorros compartidos y opcional.
- **Aportaciones:** libres; la regla de porcentaje o monto fijo es una
  sugerencia editable.
- **Registros:** tipo, método y categoría elegidos por el usuario; defaults
  globales editables; el efecto se deriva del tipo y solo aplica al `Record`.
- **Archivo:** manual al alcanzar la meta, con alerta dentro del ahorro y trofeo
  metálico en la vista general.
- **Regla de aporte:** se mantiene hasta que el usuario la cambie.
- **Estado mensual:** el usuario elige propio o global en Ahorros; en `Records` y
  `Budget` se usa solo el propio.
- **Personas:** registro global reutilizable; la sección Personas muestra sus
  aportes a ahorros.

Decisiones menores pendientes de diseño:

- texto exacto de la alerta de meta;
- color inicial del trofeo en Configuraciones;
- si la proyección muestra una sola fecha o dos escenarios (real y esperado).
  Recomendación: mostrar ambos cuando existan datos.

---

## 10. Riesgos

- Doble conteo entre `Records` y ahorros si no se usa una transacción única.
- Historial actual sin tipo de movimiento; el backfill puede ser ambiguo.
- Redondeo de intereses y porcentajes.
- Migración de datos existentes sin pérdida de historial.
- Complejidad de UI si se muestran demasiadas métricas a la vez.
- Cambios de esquema que obliguen a regenerar artefactos y pruebas de base de
  datos.
