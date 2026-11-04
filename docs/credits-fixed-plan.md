# Plan de Gastos fijos y Créditos — Fase 9 (CRED)

**Estado:** 🚧 En implementación (retomado 2026-11-02)
**Fecha:** 2026-11-01 (inicio), 2026-11-02 (reanudación)
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

### 3.8 Visualización de métodos de pago

Tomar como referencia la visualización animada de Vehículo, pero aplicada a
métodos de pago. No debe ser una imagen plana: la tarjeta y los modelos no
crediticios deben tener profundidad, sombras, brillo y una animación sutil.

#### Tarjetas de crédito

- Selector de piezas para armar la tarjeta:
  - red/marca: Visa, Mastercard, American Express, Discover, Diners, JCB,
    UnionPay u otra;
  - acabado: mate, metálico, degradado o transparente;
  - color principal;
  - mostrar chip, contacto sin contacto, nombre del titular y últimos cuatro
    dígitos;
  - nombre visible de la tarjeta.
- La tarjeta muestra en el reverso o en el detalle:
  - límite de crédito;
  - saldo utilizado y disponible;
  - fecha de corte y fecha de pago;
  - banco/emisor;
  - utilización.
- Animación: inclinación 3D suave, brillo que recorre la tarjeta y entrada con
  escala/opacidad. En el detalle, un giro para ver el reverso con los datos.
- Las marcas se representan con texto o símbolos estilizados; no usar logos
  oficiales sin autorización.

#### Métodos que no son tarjeta de crédito

El usuario elige un modelo representativo:

- tarjeta de débito;
- efectivo/billetes;
- cerdito de ahorros;
- transferencia bancaria;
- billetera;
- tarjeta de regalo;
- otro/genérico.

Cada modelo tiene su propia silueta/animación y usa el color del método de pago.
La tarjeta de débito puede reutilizar el visual de tarjeta pero sin límite ni
fechas de corte.

#### Persistencia

Agregar a `PaymentMethods`:

- `visual_kind`: `credit_card`, `debit_card`, `cash`, `piggy_bank`, `transfer`,
  `wallet`, `gift_card`, `other`;
- `card_brand`: `visa`, `mastercard`, `amex`, `discover`, `diners`, `jcb`,
  `unionpay`, `other`;
- `card_style`: `matte`, `metallic`, `gradient`, `transparent`;
- `card_color`;
- `card_last4`;
- `card_holder`;
- `card_issuer`.

Los campos de tarjeta solo aplican cuando el visual es de tarjeta. Para métodos
no crediticios se usan `visual_kind` y `card_color`, y los demás quedan nulos.

#### Componentes

- `PaymentMethodVisual`: tarjeta animada o modelo no crediticio.
- `CardBuilder`: selector de piezas para tarjetas.
- `PaymentMethodForm`: integra el builder y la vista previa.
- `PaymentMethodsScreen`: muestra el visual en cada fila.
- `CreditsScreen`: muestra tarjetas con límite, utilizado y disponible.

---

## 4. UI propuesta

### 4.1 Métodos de pago

Formulario corto:

- nombre;
- tipo de pago;
- selector **¿Es tarjeta de crédito?**;
- si sí: límite, día de corte, día de pago, emisor y últimos cuatro dígitos;
- si no: sin esos campos;
- vista previa del visual;
- piezas de tarjeta: red/marca, acabado, color, chip, contacto y titular;
- para métodos no crediticios: selector de modelo representativo.

La lista muestra:

- tarjeta o método normal con su visual animado;
- límite, utilizado y disponible para tarjetas;
- utilización con color semántico;
- el visual de la tarjeta con el nombre y las fechas principales.

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

Migraciones `0011_credit_cards_and_financings` y
`0012_financing_payment_cents`; la Fase 10 añade
`0013_vehicle_settings_record_type` y el esquema actual es 13.

### 5.1 `PaymentMethods`

Agregar:

- `is_credit_card` INTEGER boolean NOT NULL DEFAULT 0.
- `credit_limit` INTEGER money NULL.
- `visual_kind` TEXT NOT NULL DEFAULT `'other'`.
- `card_brand` TEXT NULL.
- `card_style` TEXT NULL.
- `card_color` TEXT NULL.
- `card_last4` TEXT NULL.
- `card_holder` TEXT NULL.
- `card_issuer` TEXT NULL.

Backfill:

- `is_credit_card = 1` donde `closing_date IS NOT NULL`.
- `visual_kind = 'credit_card'` para tarjetas inferidas;
  `visual_kind = 'debit_card'` para métodos con fecha de pago pero sin corte;
  `visual_kind = 'other'` para el resto.
- `credit_limit = NULL` hasta que el usuario lo configure.
- `card_color` puede inicializarse desde `PaymentTypes.payment_color` cuando
  exista.

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
- `paymentVisuals.ts`: marcas, estilos, modelos no crediticios y normalización.
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
- Constructor visual de tarjeta: red, acabado, color, chip, contacto, titular,
  últimos cuatro y emisor.
- Selector de modelo no crediticio: débito, efectivo, cerdito, transferencia,
  billetera, regalo u otro.
- `PaymentMethodVisual` con profundidad, brillo y animación Reanimated.
- Migración de inferencia legacy y backfill de `visual_kind`.
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
- El usuario puede armar la tarjeta con red, acabado, color, chip, contacto,
  titular, últimos cuatro y emisor.
- La tarjeta tiene una visualización animada con profundidad, no una imagen
  plana.
- Los métodos no crediticios permiten elegir un modelo representativo.
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
| Uso de marcas/logos de tarjetas | Medio | Marcas estilizadas o texto; no usar logos oficiales sin permiso |
| Visuales pesados en listas | Medio | SVG ligero + Reanimated; evitar animaciones continuas en listas largas |

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
8. ¿Qué marcas de tarjeta deben mostrarse con logo y cuáles solo con texto?
9. ¿Los últimos cuatro dígitos y el titular son obligatorios o opcionales?
10. ¿Las animaciones de tarjeta se muestran siempre o solo al abrir el detalle?

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

---

## 12. Estado de implementación (2026-11-01, reanudado 2026-11-02)

Implementado:

- Migraciones `0011_credit_cards_and_financings` y
  `0012_financing_payment_cents`; la Fase 10 añade
  `0013_vehicle_settings_record_type` y el esquema actual es 13.
- `Financings.payment_cents` para la cuota pactada opcional.
- `PaymentMethods` con `is_credit_card`, `credit_limit`, `visual_kind`,
  `card_brand`, `card_style`, `card_color`, `card_last4`, `card_holder` y
  `card_issuer`.
- Backfill legacy de tarjetas por fecha de corte y color desde el tipo de pago.
- Tablas `Financings`, `FinancingPayments` y `FinancingAdjustments`.
- Dominio inicial en `src/domain/credits/` para amortización, utilización de
  tarjeta, diferencia a seguros/honorarios y partes compartidas.
- `PaymentMethodVisual`: tarjeta animada con marca, acabado, chip, contacto,
  titular, últimos cuatro, límite, disponible, corte y pago; modelos para
  efectivo, cerdito, transferencia, billetera, regalo y otros.
- Constructor visual en el formulario de métodos de pago.
- Lista de métodos de pago con visual.
- Pantalla de Créditos con visual, límite, disponible y utilización.
- Repositorio de financiamientos y pantalla de Préstamos/Compras a plazo.
- Alta/edición de financiamientos con cuotas ya pagadas, capital abonado y parte
  compartida.
- Registro de pagos con abono a capital y reducción de cuota.
- Cuota pactada opcional (`Financings.payment_cents`) o cuota calculada; los
  pagos nuevos se autocompletan con la cuota pactada.
- Si el pago supera la cuota programada, la diferencia se registra como seguro u
  otro cargo y se muestra separada del capital y los intereses.
- Cada pago puede crear un `Records` nuevo, vincular uno existente o no
  vincular, igual que en Vehículo; así el gasto queda centralizado.
- Resumen de deuda total, cuota mensual, tasa media y tiempo restante en meses y
  años.
- Próximos pagos y financiamientos ordenados por urgencia/saldo.
- Refinanciamientos y cambios de tasa/plazo con historial de ajustes acumulados.
- Simulaciones de abono único/recurrente, nueva tasa y nuevo plazo, con
  comparación de cuota, meses e intereses, y simulaciones guardadas.
- Las compras a plazo al 0% vinculadas a una tarjeta reducen el crédito
  disponible de esa tarjeta por su saldo pendiente.
- Calendario de cuotas pendientes con pago, interés, capital y saldo.
- Gráficos de disminución del saldo y de composición de pagos (interés, capital
  y seguros/otros).
- Historial de pagos registrados con edición y eliminación.
- Totales agregados de límite, utilizado, disponible y utilización de tarjetas.
- Cuota total y parte propia visibles en préstamos compartidos.
- Plazo ingresable en meses o años, guardado siempre en meses.
- Tipo de tasa fija o variable.
- Tema de ayuda bilingüe de financiamientos y actualización del tema de créditos.

Pendiente:

- Formularios separados por caso, si se mantiene ese criterio de UX.
- QA Android/iOS y checklist visual final.
- Verificación completa con `expo-doctor` y export Android antes del cierre.

Opcionales complejos para una siguiente iteración:

- `CreditCardStatements` para estados de cuenta por ciclo.
- `FinancingParticipants` para varios participantes por financiamiento.
- Categoría propia en `Records` para seguros/honorarios.
- Amortización alemana además de la francesa.

Los errores y ajustes de integración de la siguiente versión se planifican en
[`next-version-plan.md`](next-version-plan.md).
