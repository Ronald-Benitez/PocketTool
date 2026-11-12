# Fase 12 — Compras compartidas, saldo por persona y doble balance

**Estado:** ✅ Finalizada 2026-11-11.
**Cuándo leer:** al revisar el histórico de la fase 12.
**Resumen:** compras compartidas en `Records`, pagador por compra, estado de cuenta por persona,
doble balance (consumo/caja), liquidaciones y arrastre de saldo al crear un grupo. Los
financiamientos quedan fuera del cálculo y los ahorros se mantienen aparte. Incluye los
modos de importe `Tu parte`, `Compartido`, `Total` y `Propio bruto`.
**Secciones:** [Decisiones](#decisiones) · [Modelo](#modelo) · [Reglas](#reglas) ·
[Registros](#registros) · [UI](#ui) · [Pruebas](#pruebas) · [Riesgos](#riesgos) ·
[Verificación](#verificación)

## Decisiones

| Tema | Decisión |
| --- | --- |
| Balance mensual | Dos balances: consumo (mi parte) y caja (lo que pagué/recibí). |
| Resumen por persona | Total pagado por cada parte, porcentajes, modal de movimientos y saldo neto. |
| Liquidación | Registrar pago y, al crear un grupo, decidir liquidar en el anterior, en el nuevo o dar seguimiento. |
| Fijos | Validar si pagué el total, solo mi parte, o pagó otra persona. |
| Financiamientos | Se dejan como están y no entran al nuevo saldo. |
| Ahorros | Se mantienen aparte; no son deuda. |

## Modelo

### `Records`

| Columna | Tipo | Regla |
| --- | --- | --- |
| `paid_by_person_id` | INTEGER nullable, FK `People.id` `ON DELETE SET NULL` | `NULL` = pagué yo. |
| `paid_scope` | TEXT NOT NULL DEFAULT `'full'` | `full` = cubrió el total; `own` = cada uno pagó su parte. |

Índice `idx_records_paid_by` (`paid_by_person_id`) con `deleted_at IS NULL`.

### `PersonSettlements`

`id`, `person_id` (FK People CASCADE), `group_id` (FK Groups SET NULL), `date`,
`amount_cents`, `direction` (`i_paid_them` | `they_paid_me`), `notes`, timestamps y
`deleted_at`. Índices por persona/fecha y grupo/fecha.

### Migraciones

- `0021_records_payer_and_scope`: columnas, backfill `paid_scope = 'full'`, índice.
- `0022_person_settlements`: tabla e índices.
- `SCHEMA_VERSION = 22`. Regenerar artefactos con `npm run db:generate`.

Los registros de fijos existentes quedan en `full`, que coincide con el comportamiento
histórico (se asumía que el usuario pagó el total).

## Reglas

### Reparto de una compra

```text
percent = min(100, Σ porcentajes)
shared = round(total * percent / 100)
own = total - shared
```

`splitSharedAmount(shared, participants)` reparte por persona y reconcilia la suma.

### Estado de cuenta por persona

| Caso | Pagado por ti | Pagado por ella | Te debe | Le debes |
| --- | --- | --- | --- | --- |
| Pagué el total | total | 0 | su parte | 0 |
| Pagué solo mi parte | mi parte | su parte | 0 | 0 |
| Ella pagó el total | 0 | total | 0 | mi parte |
| Ella pagó solo su parte | mi parte | su parte | 0 | 0 |

Los modos de importe de los resúmenes son:
- `Tu parte`: parte propia de cada compra.
- `Compartido`: lo que otras personas deben al usuario, bruto y antes de liquidar.
- `Total`: compra completa sin importar quién pagó.
- `Propio bruto`: ingresos menos lo que el usuario pagó por compras, sin liquidaciones.

```text
balance = te debe - le debo + liquidaciones que pagué - liquidaciones que recibí
```

`balance > 0` → a mi favor; `balance < 0` → a su favor; `0` → sin saldo.

### Doble balance

- **Consumo:** ingresos − mi parte de gastos. No incluye liquidaciones.
- **Caja:** ingresos − lo que realmente pagué + liquidaciones recibidas − liquidaciones pagadas.

Lo que realmente pagué:

| Caso | Caja |
| --- | --- |
| Sin compartir / pagué todo | total |
| Compartida pagada por mí | total |
| Fijo pagado solo mi parte | mi parte |
| Pagó otra persona | 0 |
| Gasto pagado con ahorro | 0 |
| Ingreso | monto |

### Fijos

- Pagué el total → `paid_by_person_id = NULL`, `paid_scope = 'full'`.
- Pagué solo mi parte → `paid_by_person_id = NULL`, `paid_scope = 'own'`.
- Pagó otra persona el total → `paid_by_person_id = persona`, `paid_scope = 'full'`.
- Fijo sin participantes: sin selector, sin deuda.

### Liquidaciones

- Se guardan en `PersonSettlements`; no crean `Records` para no duplicar el consumo.
- Afectan el saldo por persona y el balance de caja, no el de consumo.
- Permiten pagos parciales.
- Al crear un grupo: se calculan saldos pendientes hasta el fin del grupo anterior y se
  ofrece liquidar en el grupo anterior, en el nuevo o dar seguimiento. El saldo es global;
  el grupo solo imputa la liquidación para caja.

### Financiamientos y ahorros

- Financiamientos: sus allocations se conservan y se muestran como informativas; no suman
  al saldo.
- Ahorros: aportes y saldo se muestran aparte; no son deuda.

## Registros

- La compra se guarda una sola vez en `Records`; no se crea un segundo registro.
- `saveRecord` guarda el registro y los participantes `owner_type = 'record'` en la misma
  transacción.
- Editar reemplaza participantes y pagador; eliminar hace soft delete de ambos.
- Registros con `fixed_id`, vínculo a financiamiento o ahorro no se comparten manualmente.
- La liquidación se evalúa como **omitir** `Record`: el consumo ya está registrado en la
  compra; un registro extra lo duplicaría.
- Se reutiliza `SharedParticipantsField`; no se crea otro picker.

## UI

- `src/components/records/add-record.tsx`: total de la compra, participantes, pagador,
  alcance en fijos, avisos y bloqueo de registros gestionados.
- `src/components/records/RecordsGroup.tsx`: pagador y deuda por registro.
- `app/(people)/index.tsx`: tarjeta con pagado por ti/ella, saldo, movimientos y registrar
  pago.
- `src/components/people/PersonStatementModal.tsx` y `SettlementForm.tsx`.
- `src/components/groups/PendingBalancesDialog.tsx` y `add-group.tsx`.
- `app/index.tsx`, `app/(summaries)/index.tsx` y `records-table.tsx`: doble balance.
- `src/stores/ResumesStore.ts` y `src/hooks/useBalanceMode.ts`.
- El bloque de los tres balances del index de Resúmenes se muestra en 3 filas × 2
  columnas (etiqueta y valor), no en tres columnas.
- El bloque del plan mensual queda como está; su criterio de modo se revisará en una
  actualización futura de Presupuestos.
- Todo texto con `t()` y tokens de `useTheme()`.

## Pruebas

- Dominio: reparto, estado de cuenta, fijos, caja, consumo, arrastre y liquidaciones.
- DB: migraciones 0021/0022, FKs, índices, backfill, `ensureSchema`, soft delete y backup.
- Ayuda: registro de temas y paridad EN/ES.
- Manual: compras, fijos, registros gestionados, liquidaciones, grupos, doble balance,
  dark mode y Android/iOS.

## Riesgos

- Duplicar deuda de fijos si se mezclan allocations y derivación: el nuevo estado de cuenta
  deriva fijos desde `Records` e ignora allocations de fijos/financiamientos.
- Liquidar no debe duplicar consumo: se guarda solo en `PersonSettlements`.
- Limpieza de participantes al borrar registro, grupo o persona.
- Redondeo: usar `splitSharedAmount` y probar reconciliación.
- Backup antiguo sin columnas nuevas: verificar importación y `ensureSchema`.
- Cambio visible en Personas: financiamientos ya no suman y fijos se recalculan.
- Compartidos por monto: pendiente de una fase futura. El modelo actual solo guarda
  porcentaje (`SharedExpenseParticipants.share_percent`); habilitar montos afecta
  `SharedParticipantsField`, `computeRecordShares`, `splitSharedAmount`, fijos,
  financiamientos, ahorros, registros, estado de cuenta y ayuda. Ver
  `docs/plans/futuro-borrador.md`.

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

Resultado: typecheck, `test:db`, 161 tests, lint sin errores, `doctor` 20/20,
`docs:audit` y `ci` en verde. Exportación Android/iOS correcta con
`npx expo export --no-bytecode`; el bytecode Hermes falla por el entorno Windows.
QA manual confirmado por el usuario antes del cierre.
