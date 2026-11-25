# Plan Fase 16 — Cierre informativo de periodo configurable

**Cuándo leer:** al implementar o revisar el cierre de periodo, sus reglas de
vencimiento, el modelo de datos o la validación tarjeta + ahorro.
**Estado:** implementado, validado y archivado (2026-11-18).
**Resumen:** agrega un cierre de solo cálculo con secciones de disponible,
obligaciones y cobertura; el periodo y su fecha límite son configurables y los
cierres vencidos quedan inmutables.
**Secciones:** [Objetivo](#objetivo) · [Decisiones](#decisiones-aprobadas) ·
[Periodo](#periodo-configurable) · [Modelo](#modelo-y-migración) ·
[Dominio](#dominio) · [UI](#ui-y-navegación) · [Registros](#registros-y-validación) ·
[Pruebas](#pruebas) · [Ayuda](#i18n-y-ayuda) · [Riesgos](#riesgos) ·
[Verificación](#verificación).

## Objetivo

Permitir que el usuario concilie un grupo sin cerrarlo realmente:

- comparar cada tarjeta contra el estado de cuenta manual;
- elegir qué balance usar (consumo, total, caja o pagado) y autocompletar
  tarjetas, fijos y financiamientos;
- agregar líneas manuales con suma o resta, sección y límite;
- calcular disponible, obligaciones, faltante o sobrante;
- decidir de dónde sale el faltante y a dónde va el sobrante;
- guardar el cálculo como borrador o final, con historial.

El cierre **no modifica** registros, deudas, ahorros ni saldos.

## Decisiones aprobadas

- El cierre es solo cálculo e información; no crea ni vincula `Records`,
  `PaidCredits`, `SavingsHistory` ni movimientos reales.
- Se muestra un aviso permanente de que no tiene efectos reales.
- Solo se permiten sumas y restas.
- Se agrega una sección nueva “Cierre” al menú.
- Se permiten varios borradores y **un solo final por grupo**.
- El periodo es configurable globalmente, con ajuste por cierre.
- Un cierre vencido queda inmutable: no se edita, finaliza, reabre, duplica ni
  elimina. Los cambios globales no lo reviven.
- Un rango personalizado puede usarse en un grupo de mes pasado si su fecha
  límite sigue vigente.
- La combinación tarjeta de crédito + ahorro se bloquea en registros nuevos y
  solo se advierte en registros históricos.

## Periodo configurable

Configuración global en `useConfigs` (AsyncStorage):

```ts
closingPeriodMode: 'calendar_month' | 'cutoff_day' | 'start_day' | 'custom_range'
closingCutoffDay: number        // 1-31
closingStartDay: number         // 1-31
closingGraceDays: number        // 0-31
closingAllowPeriodOverride: boolean
```

Defaults:

- `closingPeriodMode = 'calendar_month'`
- `closingCutoffDay = 31`
- `closingStartDay = 1`
- `closingGraceDays = 5`
- `closingAllowPeriodOverride = true`

Reglas:

- **Mes calendario:** primer al último día del mes del grupo.
- **Día de corte:** el periodo termina el día de corte y empieza el día
  siguiente al corte anterior; el día se limita al último del mes.
- **Día de inicio:** el periodo empieza el día elegido del mes del grupo y
  termina el mismo día del mes siguiente. Ejemplo: grupo octubre, día 18 →
  18 oct–18 nov.
- **Rango personalizado:** el usuario elige inicio y fin por cierre.
- `editable_until = period_end + closingGraceDays`, o una fecha límite manual
  por cierre.
- La fecha límite manual debe ser mayor o igual al fin del periodo.
- El cierre es editable si `now <= editable_until`.
- Al vencer, pasa a solo lectura.
- Cada cierre guarda `period_start`, `period_end` y `editable_until` como
  snapshot. La configuración global solo afecta cierres nuevos o el botón
  “Restablecer según configuración” de un borrador no vencido.
- Un borrador no vencido puede aplicar la configuración actual; uno vencido no.
- La regla real es el periodo del cierre, no el mes del grupo.
- Se permite crear un cierre de un grupo pasado si el rango elegido tiene fecha
  límite futura.

## Modelo y migración

`SCHEMA_VERSION = 24`; migración `0024_group_closings.ts`; sin backfill.

### `GroupClosings` → `group_closings`

- `id`
- `group_id` FK `Groups` `ON DELETE CASCADE`
- `close_name`
- `close_date`
- `period_start`
- `period_end`
- `editable_until`
- `status` (`draft` / `final`)
- `notes`
- `total_available_cents`
- `total_reserve_cents` (técnico; no se muestra en la UI)
- `total_obligations_cents`
- `result_cents`
- `total_resolution_cents`
- `remaining_cents`
- `created_at`, `updated_at`, `deleted_at`

Índices:

- `idx_group_closings_group` (`group_id`, `period_end`)
  `WHERE deleted_at IS NULL`.
- `idx_group_closings_final` **único** (`group_id`)
  `WHERE status = 'final' AND deleted_at IS NULL`.

### `GroupClosingLines` → `group_closing_lines`

- `id`
- `closing_id` FK `GroupClosings` `ON DELETE CASCADE`
- `section`: `available` / `obligation` / `resolution`. `reserve` queda como
  valor técnico heredado, pero no se muestra en la UI.
- `kind`: `cash` / `account` / `receivable` / `saving` / `card` / `fixed` /
  `financing` / `next_group` / `manual` / `adjustment`
- `label`
- `operation`: `add` / `subtract`
- `direction`: `from` / `to` para resolución
- `amount_cents`
- `reference_cents` (esperado o límite)
- `reason` (cashback, descuento, devolución, otro)
- `payment_method_id`, `saving_id`, `fixed_id`, `financing_id`,
  `related_group_id` (FK opcionales `SET NULL`)
- `notes`
- `sort_order`
- `created_at`, `updated_at`, `deleted_at`

Índice principal: (`closing_id`, `section`, `sort_order`)
`WHERE deleted_at IS NULL`.

### Repositorio

`src/db/repositories/closings.ts`:

- `fetchClosings(groupId)`
- `fetchClosing(id)`
- `createClosing(input)`
- `updateClosing(id, input)`
- `deleteClosing(id)`
- `duplicateClosing(id, overrides)`

Guardar cabecera y líneas en transacción exclusiva. Recalcular totales en
dominio. Validar periodo y final antes de persistir. Soft delete. Errores con
`mapDatabaseError`.

## Dominio

Nueva área `src/domain/closing/`:

- `period.ts`: modos, cálculo de rango y vencimiento.
- `calculator.ts`: totales y validaciones.
- `suggestions.ts`: autocompletado desde datos del grupo.
- `types.ts`.
- Pruebas en `__tests__/`.

Cálculos:

```text
available   = Σ(add) - Σ(subtract) en available
obligations = Σ(add) - Σ(subtract) en obligation
result      = available - obligations
resolution  = Σ montos en resolution
remaining   = abs(result) - resolution

`reserve` existe solo como valor técnico de compatibilidad y no participa en
la UI ni en el resultado visible.
```

- `result < 0`: faltante, resolución `from`.
- `result > 0`: sobrante, resolución `to`.
- `result = 0`: sin resolución.
- Cierre final exige `remaining = 0`.
- Borrador permite incompleto.

Tarjetas:

- `expected`: pendiente esperado.
- `actual`: estado de cuenta manual.
- `difference = actual - expected`.
- La obligación usa `actual` si existe; si no, `expected`.
- El motivo es informativo.

Ahorros:

- No se incluyen automáticamente en el cierre.
- Si el usuario los usa, puede agregarlos como líneas manuales con límite.
- No crea movimientos.

## UI y navegación

Nueva sección del drawer “Cierre”:

- `app/(closing)/_layout.tsx` con `StackBase`.
- `app/(closing)/index.tsx` con historial y editor local.
- `src/components/closing/`: editor, secciones, filas, tarjetas, resumen,
  resolución, historial y formulario de línea.
- `src/hooks/useClosings.ts` y `useClosingSuggestions.ts`.

Componentes existentes: `Screen`, `Surface`, `Stack`, `Row`, `Divider`,
`Button`, `IconButton`, `SwipeAction`, `TextField`, `MoneyField`, `SelectField`,
`DateField`, `SwitchField`, `Modal`, `ConfirmDialog`, `InlineMessage`,
`EmptyState`, `LoadingState`, `SummaryBlock`, `FinanceValue`, `Badge`.

Textos y reglas visibles:

- Aviso: “Solo cálculo. No modifica registros, deudas, ahorros ni saldos.”
- Selector de balance para autocompletar: consumo, total, caja o pagado.
- Botón global “Agregar línea”, selector de sección y selector de dato
  registrado (tarjeta, cuenta, fijo o financiamiento) sin repetir.
- Resumen de resultado al final del flujo, no antes de los datos.
- Badge “Editable hasta…” o “Vencido · solo lectura”.
- Bloque de periodo con “Restablecer según configuración”.
- Confirmación al finalizar: “Finalizar solo marca el cálculo como definitivo.”
- Si ya existe un final: error y opción de reabrir el final actual.
- Historial con rango, fecha límite, estado y candado en vencidos.
- Acciones deshabilitadas cuando el cierre está vencido.

## Registros y validación

El cierre no aplica a la skill `pockettool-records` en creación/vínculo/omisión:
no mueve dinero.

Validación tarjeta de crédito + ahorro:

- Bloquear en `add-record` y `saveRecord` si hay `saving_id` y el método es
  tarjeta de crédito (`is_credit_card`, `closing_date > 0` o
  `visual_kind = 'credit_card'`).
- Error `CREDIT_CARD_SAVING_CONFLICT` con mensaje claro.
- Registros históricos: advertencia en el cierre, sin bloquear la finalización.
- Los registros con `saving_id` se excluyen de tarjeta y efectivo del mes con
  `isMonthlyCashRecord`.

## Pruebas

- Periodo: mes calendario, corte 1/25/31, febrero, gracia 0/1/5, rango
  personalizado, fecha límite manual, último milisegundo y vencimiento.
- Grupo pasado con rango futuro: permitido; con periodo vencido: bloqueado.
- Cambio global no altera cierres existentes; borrador no vencido puede aplicar
  configuración; vencido no.
- Varios borradores; segundo final bloqueado por dominio y por índice único;
  reabrir final; final vencido no se reabre.
- Cálculos: suma/resta, faltante, sobrante, cero, resolución exacta/incompleta/
  excedida, tarjeta real menor/igual/mayor, ahorro como línea manual/fuente/
  destino.
- Sin escrituras en `Records`, `PaidCredits` ni `SavingsHistory`.
- Tarjeta + ahorro: nuevo bloqueado, histórico advertido, totales excluidos.
- Migración, repositorio, soft delete, cascada de grupo y backups.
- QA manual en Android/iOS: tema, teclado, pantallas pequeñas y accesibilidad.

## i18n y ayuda

Nuevo `src/lang/messages/closings.ts` con paridad EN/ES y claves para:

- secciones, acciones, estados, tipos de línea, motivos, errores y resumen;
- configuración de periodo en Ajustes;
- aviso de solo cálculo y vencimiento.

Nuevo tema de ayuda `closing`:

- `id: 'closing'`, categoría `planning`, icono `calculate`.
- Relacionados: `groups`, `summaries`, `credits`, `savings`, `records`.
- Explicar periodo configurable, gracia, vencimiento, un solo final y ausencia
  de efectos reales.

Actualizar ayuda de Grupos, Registros, Créditos y Ahorros.

## Documentación

- `docs/database.md`: nuevas tablas, índices y reglas.
- `docs/schema.md`: generado.
- `docs/architecture/domains.md`: sección “Cierre de periodo”.
- `docs/phases.md` y `docs/README.md`: fase activa y cierre.
- `docs/legacy/`: archivar el plan al cerrar.
- `src/domain/AGENTS.md`: agregar el área `closing`.

## Riesgos

- Exceso de opciones de periodo; la UI debe mostrar ejemplos.
- Cierres vencidos sin finalizar: quedan inmutables, como se pidió.
- Cambios globales que el usuario espere que actualicen cierres viejos; el
  snapshot evita sorpresas.
- Registros históricos tarjeta + ahorro; se advierten, no se corrigen solos.
- Solapamiento de rangos personalizados en el mismo grupo.
- Índice único de final y borrados lógicos.
- Complejidad de UI en pantallas pequeñas.

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

Además, QA manual en Android/iOS.

## Preguntas resueltas

- Cierre solo informativo.
- Suma y resta únicamente.
- Nueva sección.
- Varios borradores y un final.
- Periodo global configurable con ajuste por cierre.
- Los vencidos no se editan ni se reactivan por cambios globales.
- Un grupo pasado puede tener un cierre con rango futuro vigente.
- Tarjeta + ahorro: bloquear nuevos y advertir históricos.
