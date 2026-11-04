# Plan de mejora — Ahorros compartidos, metas e integración con Registros

**Fase:** 11 (SAV)
**Estado:** 🚧 Planificación
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
| `target_amount_cents` | money, nullable | Meta global |
| `target_date` | timestamp, nullable | Fecha objetivo |
| `status` | TEXT | `active`, `completed`, `archived` |
| `completed_at` | timestamp, nullable | Cierre de meta |
| `archived_at` | timestamp, nullable | Archivo histórico |
| `records_mode` | TEXT | `separate`, `transfers`, `expenses` |
| `interest_rate_bps` | INTEGER, nullable | Tasa anual informativa |
| `icon` / `color` | TEXT, nullable | Personalización visual |
| `own_amount_cents` | money, nullable | Caché de la parte propia |
| `shared_amount_cents` | money, nullable | Caché de la parte compartida |

Reglas:

- `own_amount_cents + shared_amount_cents = amount`.
- `amount` sigue siendo el saldo global.
- Los cachés se recalculan desde los movimientos; no son la fuente de verdad.
- `status` y `archived_at` no eliminan datos.

### 3.2 Participantes del ahorro

Reutilizar `SharedExpenseParticipants` con `owner_type = 'saving'`:

- `owner_id` = id del ahorro.
- `person_id` = persona.
- `share_percent` = porcentaje esperado para repartir intereses y meta.
- La suma no puede superar 100%.

La aportación real no se limita al porcentaje: cada movimiento puede indicar
qué persona aportó y cuánto.

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
| `note` | TEXT, nullable | Nota |
| `record_id` | INTEGER, nullable | Registro vinculado |
| `group_id` | INTEGER, nullable | Grupo del mes |
| `deleted_at` | timestamp | Soft delete |

Reglas:

- `withdrawal` no puede superar el saldo disponible.
- `interest` se reparte entre los participantes según `share_percent`; el
  remanente queda en la parte propia.
- `adjustment` corrige saldos sin afectar `Records`.
- Un movimiento con `record_id` no se cuenta dos veces en resúmenes.

### 3.4 Migraciones propuestas

1. `0017_savings_goals_and_sharing`
   - columnas nuevas en `Savings`;
   - backfill `status = 'active'`, `records_mode = 'separate'`;
   - `own_amount_cents = amount`, `shared_amount_cents = 0`.
2. `0018_savings_movements`
   - columnas nuevas en `savings_history`;
   - backfill: cada fila histórica se convierte en `adjustment` con
     `amount_cents = ABS(new_amount - previous_amount)`;
   - índices por `savings_id`, `change_date`, `person_id` y `record_id`.
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
  - estado `active`/`completed`.
- `charts.ts`:
  - series de progreso global, propio y otras partes;
  - línea de meta;
  - agrupación por fecha.
- `movements.ts`:
  - validación de retiros;
  - validación de participantes;
  - decisión de crear/vincular/no vincular `Records`.

La UI no calcula dinero; solo consume estos helpers.

---

## 5. Repositorios

### `useSavingsRepository`

- `fetchSavings(options?: { status?: 'active' | 'archived' | 'all' })`.
- `fetchSavingView(id)`: ahorro + participantes + movimientos + snapshot.
- `createSaving(input)`: transacción con participantes y saldo inicial.
- `updateSaving(id, input)`: transacción; no escribe historial desde la UI.
- `archiveSaving(id)` / `restoreSaving(id)`.
- `deleteSaving(id)`: conserva el comportamiento actual con confirmación.
- `addMovement(input)`: transacción; crea/actualiza saldo, historial y, si
  aplica, `Records`.
- `deleteMovement(id)`: revierte el saldo y limpia vínculos.

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
- Meta:
  - monto objetivo;
  - progreso porcentual;
  - restante;
  - fecha objetivo y proyección.
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
- meta y fecha objetivo;
- participantes y porcentajes;
- modo de `Records`;
- tasa de interés informativa;
- color/icono.

### Movimiento

- tipo;
- monto;
- fecha;
- persona que aporta/retira (si es compartido);
- nota;
- crear/vincular/no vincular registro.

### Registros

- Al crear un gasto, si existen ahorros con modo `expenses`, mostrar
  **origen del dinero**:
  - dinero del mes;
  - ahorro.
- Si se elige ahorro:
  - mostrar saldo disponible;
  - validar que alcance;
  - crear el gasto y el retiro vinculado en una sola transacción;
  - impedir doble conteo.

---

## 7. Fases de implementación

### SAV-0. Decisiones y diseño

- Confirmar reparto de intereses.
- Confirmar si la meta es global o por persona.
- Confirmar si las aportaciones son libres o por porcentaje.
- Confirmar el alcance de la integración con `Records`.

### SAV-1. Esquema y migraciones

- Tablas/columnas, validaciones zod, artefactos y pruebas de migración.
- Backfill de ahorros e historial existente.

### SAV-2. Dominio y repositorios

- `balances`, `goals`, `charts`, `movements`.
- CRUD transaccional de ahorros y movimientos.
- Pruebas unitarias.

### SAV-3. UI de ahorros

- Resumen global/propio/compartido.
- Meta y progreso.
- Gráfico de tres series.
- Movimientos tipados.
- Alta/edición/archivo.

### SAV-4. Integración con Registros

- Origen del dinero en gastos.
- Transferencias.
- Crear/vincular/no vincular.
- Validación de monto/fecha y exclusión de registros ya vinculados.
- Pruebas de no duplicación.

### SAV-5. Ayuda, QA y cierre

- Actualizar tema de ayuda de Ahorros.
- Actualizar AGENTS, docs y notas de versión.
- Typecheck, test:db, Jest, lint, doctor y export Android.

---

## 8. Criterios de aceptación

- Un ahorro puede tener varias personas y la suma de porcentajes no supera 100%.
- El saldo global reconcilia con `propio + otras partes`.
- Cada persona tiene su aporte y progreso visibles.
- Los intereses manuales aumentan el saldo y se reparten según la regla elegida.
- La meta muestra progreso, restante y proyección.
- Un ahorro cumplido se puede archivar sin perder historial.
- El modo de `Records` se guarda por ahorro.
- Un gasto pagado desde ahorro crea un solo registro y descuenta el saldo una
  sola vez.
- Vincular un registro valida monto, fecha y que no esté ya vinculado.
- El gráfico muestra global, propio y otras partes.
- La ayuda y la documentación quedan actualizadas.

---

## 9. Decisiones a confirmar

1. **Intereses:** ¿se reparten por porcentaje de participantes o quedan solo en
   la parte propia?
2. **Meta:** ¿es global o cada persona tiene su propia meta?
3. **Aportaciones:** ¿libres por movimiento o calculadas por porcentaje?
4. **Transferencias:** ¿los aportes al ahorro crean un registro de transferencia
   o quedan separados por defecto?
5. **Gasto desde ahorro:** ¿se permite cualquier gasto o solo los marcados
   explícitamente?
6. **Archivo:** ¿se archiva automáticamente al llegar a la meta o lo decide el
   usuario?

Recomendación inicial:

- intereses por porcentaje, remanente a la parte propia;
- meta global con progreso por persona;
- aportaciones libres;
- `separate` por defecto;
- archivo manual;
- gasto desde ahorro solo cuando el usuario elige esa opción.

---

## 10. Riesgos

- Doble conteo entre `Records` y ahorros si no se usa una transacción única.
- Historial actual sin tipo de movimiento; el backfill puede ser ambiguo.
- Redondeo de intereses y porcentajes.
- Migración de datos existentes sin pérdida de historial.
- Complejidad de UI si se muestran demasiadas métricas a la vez.
- Cambios de esquema que obliguen a regenerar artefactos y pruebas de base de
  datos.
