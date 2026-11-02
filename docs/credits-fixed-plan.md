# Plan de Gastos fijos y Créditos — Fase 9 (CRED)

**Estado:** 📝 Planificada
**Fecha:** 2026-11-01
**Objetivo:** convertir Gastos fijos y Créditos en un módulo de obligaciones
reales: tarjetas de crédito con límite, compras a plazo, préstamos, pagos,
refinanciamientos y simulaciones, sin formularios gigantes ni cálculos
duplicados en la UI.

---

## 1. Contexto actual

### 1.1 Métodos de pago

`PaymentMethods` hoy guarda:

- `method_name`
- `closing_date` (día de corte)
- `payment_date` (día de pago)
- `payment_type_id`

No hay:

- límite de crédito;
- indicador explícito de tarjeta de crédito;
- saldo utilizado, disponible o utilización;
- estado de cuenta por ciclo.

La inferencia actual es indirecta: si tiene `closing_date`, se trata como
tarjeta. Es una base válida para migrar datos existentes, pero no debe ser la
única fuente de verdad.

### 1.2 Gastos fijos

`Fixed` guarda:

- `fixed_amount`
- `fixed_name`
- `fixed_day`
- tipo de registro, categoría y método de pago.

Hoy representa solo gastos recurrentes mensuales. No hay:

- compras a plazo;
- cuotas;
- interés;
- saldo pendiente;
- número de pagos;
- fecha de finalización.

### 1.3 Créditos

`PaidCredits` registra pagos asociados a un método de pago. La pantalla de
Créditos suma el total anterior, el total actual y los pagos del ciclo.

Eso no es un crédito real: no existe principal, tasa, plazo, cuota, seguros,
abonos a capital, cuotas pagadas, préstamos compartidos ni refinanciamientos.

### 1.4 Registros

`Records` ya permite relacionar un gasto con `Fixed` y `PaidCredits`. Esa
integración debe conservarse para que un pago de crédito o una cuota pueda
reflejarse en Registros sin doble captura.

---

## 2. Problemas a resolver

1. **Tarjetas sin límite ni tipo explícito.** No se puede calcular utilización,
   disponible ni distinguir una tarjeta de crédito de una de débito.
2. **Créditos irreales.** Solo se ven montos a pagar de tarjetas, no deudas con
   principal, tasa y plazo.
3. **Gastos fijos limitados.** No se pueden registrar compras a plazo ni
   préstamos.
4. **Historial incompleto.** El usuario puede llevar meses pagando algo antes de
   registrarlo en la app.
5. **Pagos especiales.** No se puede indicar abono a capital, reducción de cuota,
   seguro, honorarios o diferencia entre cuota calculada y pagada.
6. **Préstamos compartidos.** No se puede dividir la cuota entre varias personas.
7. **Refinanciamientos.** No hay forma de cambiar tasa, plazo o cuota sin perder
   el historial.
8. **Simulaciones.** No se puede responder “¿qué pasa si abono X a capital?” o
   “¿qué pasa si abono X en cada cuota?”.

---

## 3. Decisiones de diseño

### 3.1 Tarjetas de crédito

- Agregar `is_credit_card` a `PaymentMethods`.
- Agregar `credit_limit` en centavos, nullable.
- Mantener `closing_date` y `payment_date`.
- Migración: `is_credit_card = 1` cuando `closing_date` no sea nulo; el usuario
  puede corregirlo con el selector.
- El formulario de método de pago muestra un selector explícito:
  **Tarjeta de crédito / No es tarjeta de crédito**.
- Si es tarjeta de crédito:
  - muestra fecha de corte, fecha de pago y límite;
  - valida que el límite sea positivo;
  - calcula utilizado, disponible y porcentaje de utilización a partir de los
    registros del ciclo.
- Si no es tarjeta:
  - oculta límite, corte y pago;
  - conserva el método para gastos normales.

### 3.2 Modelo unificado de financiamientos

Usar una tabla `Financings` para compras a plazo, préstamos y créditos:

| Campo | Uso |
| --- | --- |
| `kind` | `installment_purchase`, `bank_loan`, `mortgage`, `auto_loan`, `personal_loan`, `shared_loan`, `other` |
| `name` | nombre visible |
| `lender` | tienda, banco o persona |
| `principal_cents` | monto original |
| `down_payment_cents` | enganche o pago inicial |
| `financed_cents` | principal financiado |
| `annual_rate_bps` | tasa anual en puntos base (1250 = 12.5 %) |
| `rate_type` | `fixed` / `variable` |
| `term_months` | plazo original |
| `start_date` | inicio |
| `first_payment_date` | primera cuota |
| `payment_day` | día de pago |
| `payment_method_id` | método de pago |
| `category_id` | categoría |
| `record_type_id` | tipo de registro |
| `paid_installments_before_app` | cuotas ya pagadas antes de registrar |
| `capital_paid_before_app_cents` | capital ya abonado antes de registrar |
| `is_shared` | préstamo compartido |
| `shared_percent` | porcentaje que paga el usuario |
| `shared_counterparty` | persona o entidad compartida |
| `status` | `active`, `paid`, `refinanced`, `cancelled` |
| `notes` | notas |

- `annual_rate_bps` evita errores de punto flotante.
- `financed_cents = principal_cents - down_payment_cents`.
- El estado inicial se reconstruye con cuotas pagadas y capital abonado.
- No se guarda el saldo actual como fuente de verdad: se deriva de pagos y
  ajustes.

### 3.3 Pagos

`FinancingPayments`:

- `financing_id`
- `date`
- `amount_cents`
- `principal_cents`
- `interest_cents`
- `insurance_cents`
- `fees_cents`
- `extra_principal_cents`
- `extra_reduce_payment_cents`
- `is_shared`
- `shared_amount_cents`
- `group_id`
- `payment_method_id`
- `record_id` o tabla de vínculo con `Records`
- `notes`

Regla clave: si el usuario registra una cuota distinta a la calculada, la
diferencia se registra como **seguro u otros honorarios**, no como capital ni
interés.

### 3.4 Refinanciamientos y cambios de tasa

`FinancingAdjustments`:

- `financing_id`
- `date`
- `kind`: `refinance`, `rate_change`, `term_change`, `payment_change`
- `new_annual_rate_bps`
- `new_term_months`
- `new_payment_cents`
- `capitalized_interest_cents`
- `fees_cents`
- `notes`

El historial se conserva; el financiamiento activo se recalcula desde el último
ajuste y los pagos posteriores.

### 3.5 Préstamos compartidos

- `is_shared`
- `shared_percent` (porcentaje del usuario)
- `shared_counterparty` (opcional)

La cuota total se calcula sobre el 100 %. La cuota del usuario se obtiene por
porcentaje. Los pagos pueden registrar la parte compartida y la parte propia.
La UI debe mostrar ambas.

### 3.6 Cálculos

- **Tasa cero:** `cuota = financed_cents / term_months`; la última cuota absorbe
  el redondeo.
- **Interés fijo:** amortización francesa por defecto:
  - tasa mensual = tasa anual / 12;
  - cuota = principal * i / (1 - (1 + i)^-n);
  - si la tasa es 0, usar división simple.
- **Saldo:** principal - capital pagado - abonos a capital.
- **Interés medio:** promedio ponderado por saldo insoluto de cada
  financiamiento activo.
- **Años para terminar:** fecha estimada del último pago según el calendario
  vigente.
- **Diferencia de cuota:** se asigna a seguros/honorarios.
- **Abono a capital:** reduce plazo por defecto; el usuario puede elegir reducir
  cuota.
- **Abono recurrente:** se simula como pago extra en cada cuota.
- **Refinanciamiento:** recalcula saldo, tasa, plazo y cuota desde la fecha del
  ajuste.

### 3.7 Tarjetas de crédito

- Saldo utilizado: compras del ciclo menos pagos, según `Records` y el método.
- Límite disponible: límite - saldo utilizado.
- Utilización: saldo utilizado / límite.
- Corte y pago: se calculan con `closing_date` y `payment_date`.
- Si en el futuro se necesita precisión por estado de cuenta, agregar
  `CreditCardStatements`; no es obligatorio para la primera versión.

---

## 4. UI propuesta

### 4.1 Métodos de pago

Formulario corto:

- nombre;
- tipo de pago;
- selector **¿Es tarjeta de crédito?**;
- si sí: límite, día de corte, día de pago;
- si no: sin esos campos.

La lista muestra:

- tarjeta o método normal;
- límite y disponible para tarjetas;
- utilización con color semántico.

### 4.2 Gastos fijos

Separar en tabs o secciones:

1. **Recurrentes** (los `Fixed` actuales).
2. **Compras a plazo**.
3. **Préstamos** (banco, hipotecario, automotriz, personal, compartido).

No usar un único formulario gigante. Formularios separados:

- gasto fijo recurrente;
- compra a plazo sin interés;
- compra a plazo con interés;
- préstamo bancario/personal;
- hipotecario;
- automotriz;
- préstamo compartido;
- pago de cuota;
- abono a capital;
- refinanciamiento.

Cada formulario muestra solo los campos de su caso.

### 4.3 Detalle de un financiamiento

- Datos generales.
- Saldo actual, capital pagado, interés pagado, seguros/honorarios.
- Cuota calculada vs. cuota pactada.
- Tabla de cuotas y pagos.
- Abonos a capital y reducciones de cuota.
- Cambios de tasa y refinanciamientos.
- Parte compartida.
- Botones: pagar, abonar a capital, refinanciar, simular.

### 4.4 Resumen de Créditos

- Deuda total.
- Cuota mensual total.
- Tasa media ponderada.
- Años estimados para terminar.
- Tarjetas: límite total, utilizado, disponible y utilización.
- Financiamientos activos ordenados por urgencia/saldo.
- Próximos pagos.

### 4.5 Simulaciones

Pantalla o modal de simulación:

- financiamiento seleccionado;
- escenario:
  - abono único a capital;
  - abono recurrente por cuota;
  - reducir cuota vs. reducir plazo;
  - cambio de tasa;
  - cambio de plazo;
  - porcentaje compartido.
- resultados:
  - nueva cuota;
  - nuevo plazo;
  - intereses ahorrados;
  - fecha de término;
  - comparación contra el escenario actual.

Las simulaciones no se guardan por defecto; se puede agregar “guardar
simulación” después si el usuario lo necesita.

---

## 5. Esquema y migración

Migración `0011_credit_cards_and_financings`; `SCHEMA_VERSION = 11`.

### 5.1 `PaymentMethods`

Agregar:

- `is_credit_card` INTEGER boolean NOT NULL DEFAULT 0.
- `credit_limit` INTEGER money NULL.

Backfill:

- `is_credit_card = 1` donde `closing_date IS NOT NULL`.
- `credit_limit = NULL` hasta que el usuario lo configure.

### 5.2 Tablas nuevas

- `Financings`
- `FinancingPayments`
- `FinancingAdjustments`
- `FinancingParticipants` (solo si se modelan varios participantes; para v1
  basta `shared_percent` y `shared_counterparty` en `Financings`).

### 5.3 Vínculos

- `FinancingPayments` puede vincularse con `Records` mediante una tabla
  `FinancingPaymentRecords` o un `record_id` nullable.
- Preferir tabla de vínculo para mantener la misma estrategia que Vehículo y
  evitar duplicar el gasto.

### 5.4 Índices

- `(status, first_payment_date)`
- `(payment_method_id)`
- `(financing_id, date)` en pagos
- `(financing_id, date)` en ajustes

---

## 6. Dominio

Crear `src/domain/credits/`:

- `amortization.ts`: cuota francesa, tasa cero, redondeo, calendario.
- `balance.ts`: saldo, capital, interés, seguros/honorarios.
- `shared.ts`: parte compartida.
- `payments.ts`: aplicación de pagos, diferencia a seguros, abono a capital.
- `refinancing.ts`: cambios de tasa/plazo y capitalización.
- `simulations.ts`: escenarios y comparaciones.
- `summary.ts`: deuda total, tasa media, años, próximos pagos.
- `cards.ts`: utilización, disponible y ciclo de tarjeta.
- `types.ts`: tipos puros.

Reglas:

- Dinero en centavos.
- Tasas en puntos base.
- Fechas en milisegundos.
- La UI no calcula dinero ni tasas.
- Tests unitarios para cada caso.

---

## 7. Plan de ejecución

### CRED-0 — Validación y decisiones

- Confirmar amortización francesa como método por defecto.
- Confirmar tasa anual nominal y puntos base.
- Definir si el saldo de tarjeta se calcula desde `Records` o con estados de
  cuenta.
- Validar formularios separados.
- Congelar alcance de compartidos y refinanciamientos.

### CRED-1 — Esquema, migración y dominio

- Migración `0011`.
- Tablas y zod.
- Artefactos generados.
- Dominio de amortización, saldo, compartidos, refinanciamiento y simulaciones.
- Tests.

### CRED-2 — Métodos de pago y tarjetas

- Selector de tarjeta de crédito.
- Límite, corte y pago.
- Migración de inferencia legacy.
- Resumen de utilización y disponible.
- Tests de migración y dominio de tarjetas.

### CRED-3 — Compras a plazo y préstamos

- Formularios separados.
- Estado inicial: cuotas pagadas, capital abonado.
- Cuota cero/interés.
- Préstamo compartido.
- Lista y detalle.
- Tests de cálculo.

### CRED-4 — Pagos, abonos y refinanciamientos

- Registrar pago.
- Diferencia a seguros/honorarios.
- Abono a capital y reducción de cuota.
- Refinanciamiento/cambio de tasa.
- Vínculo con `Records`.
- Tests.

### CRED-5 — Resumen y simulaciones

- Dashboard de deuda.
- Tasa media, años, cuota total.
- Tarjetas: límite, utilizado, disponible.
- Simulaciones de abono único/recurrente y cambio de tasa/plazo.
- Charts si aportan claridad.

### CRED-6 — Ayuda, i18n, QA y cierre

- Textos bilingües.
- Temas de ayuda: tarjetas, compras a plazo, préstamos, pagos, refinanciamiento
  y simulaciones.
- QA Android/iOS.
- `npm run typecheck`, `npm test`, `npm run test:db`, `npm run lint`,
  `npm run doctor`, export Android.
- Documentación y cierre de fase.

---

## 8. Criterios de aceptación

- El método de pago permite indicar explícitamente si es tarjeta de crédito.
- Las tarjetas existentes se infieren por fecha de corte y se pueden corregir.
- Una tarjeta muestra límite, utilizado, disponible y utilización.
- Se puede registrar una compra a plazo a tasa cero.
- Se puede registrar una compra a plazo o préstamo con interés.
- El usuario puede indicar cuántas cuotas lleva pagadas y cuánto capital ha
  abonado antes de usar la app.
- La cuota se calcula y se muestra separada de seguros/honorarios.
- Un pago distinto al calculado registra la diferencia como seguro/honorario.
- Se puede abonar a capital y elegir reducir plazo o cuota.
- Se puede registrar un préstamo compartido y su porcentaje.
- Se puede refinanciar conservando el historial.
- El resumen muestra deuda total, cuota total, tasa media y años estimados.
- Las simulaciones comparan escenario actual vs. abono único/recurrente y
  cambio de tasa/plazo.
- Los pagos pueden reflejarse en Registros sin doble captura.
- Migración segura y `expo-doctor` en verde.

---

## 9. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| Cálculos financieros inconsistentes | Alto | Dominio puro + tests con casos conocidos |
| Redondeo de cuotas | Medio | Ajustar última cuota y probar tasas cero/positivas |
| Datos previos a la app | Alto | Campos de cuotas/capital pagados y conciliación |
| Préstamos compartidos ambiguos | Medio | `shared_percent` explícito y parte propia visible |
| Refinanciamientos complejos | Alto | Historial de ajustes y recálculo desde el último ajuste |
| Formularios demasiado largos | Medio | Un formulario por caso |
| Cambios de esquema | Medio | Migración incremental, backups y tests de DB |
| Tarjetas sin estado de cuenta | Medio | v1 derivar de `Records`; estados de cuenta después |

---

## 10. Preguntas abiertas

1. ¿La tasa se ingresa como anual nominal, mensual o efectiva anual?
2. ¿El método por defecto debe ser amortización francesa o permitir alemana?
3. ¿El saldo de tarjeta se calcula desde `Records` o se registran estados de
   cuenta?
4. ¿Los seguros/honorarios deben tener categoría propia en Registros?
5. ¿Los préstamos compartidos se dividen por porcentaje o por monto fijo?
6. ¿Las simulaciones deben guardarse o son efímeras?
7. ¿Se permite modificar la cuota pactada sin refinanciar?

---

## 11. Verificación

```bash
npm run typecheck
npm test
npm run test:db
npm run lint
npm run doctor
npx expo export --platform android
```

`npm run doctor` es obligatorio además de los tests para cerrar la fase.
