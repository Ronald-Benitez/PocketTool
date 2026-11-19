# Plan Fase 15 — Fechas de pagos pendientes

**Resumen:** agrega un tercer modo de fecha para pagos pendientes de tarjeta y
configuraciones de fecha y deduplicación para gastos fijos, con una sola fuente
de verdad para Registros e Inicio; no hay cambios de esquema.
**Estado:** implementado, validado y archivado.
**Fecha:** 2026-11-18.
**Leer solo si:** necesitas el detalle de las fechas de pagos pendientes de
tarjeta y fijos.
**Secciones:** [Objetivo](#objetivo) · [Decisiones](#decisiones-aprobadas) ·
[Reglas](#reglas) · [Archivos](#archivos) · [Pruebas](#pruebas) ·
[Riesgos](#riesgos) · [Verificación](#verificación) ·
[Implementación](#implementación).

## Objetivo

- Créditos: agregar `next_payment_date` a `pendingPaymentDateMode` para usar el
  próximo día de pago de la tarjeta calculado desde hoy, como en Créditos.
- Fijos: agregar `pendingFixedDateMode` (`group_month` o `next_occurrence`) y
  `pendingFixedDedupeMode` (`group` o `period`).
- Aplicar las mismas configuraciones en Registros e Inicio.
- Mostrar un aviso en el formulario de pago de un fijo pendiente.

## Decisiones aprobadas

- Defaults: `pendingFixedDateMode = 'next_occurrence'` y
  `pendingFixedDedupeMode = 'period'`.
- Créditos conserva `today` como default.
- Inicio muestra el fijo cuando la fecha resuelta es hoy y guarda esa fecha.
- El mes del grupo solo se usa cuando el modo de fecha es `group_month`.

## Reglas

- `resolveNextMonthlyDay` calcula la próxima ocurrencia mensual desde hoy:
  día futuro en el mes actual, hoy si coincide, mes siguiente si ya pasó,
  límite al último día del mes y mediodía local.
- `resolvePendingFixedDate` aplica `group_month` o `next_occurrence`.
  `group.month` es cero-based.
- `isFixedPendingPaid` con `group` revisa registros del grupo seleccionado; con
  `period` revisa registros del mismo fijo con fecha en el mes propuesto,
  aunque estén en otro grupo.
- `usePendingFixeds` es la fuente única para ambas pantallas y calcula monto
  propio/compartido.
- Sin cambios de esquema ni migraciones; las configuraciones viven en
  AsyncStorage.

## Archivos

- `src/domain/shared/recurrence.ts`
- `src/domain/credits/pending.ts`
- `src/domain/records/fixedPending.ts`
- `src/hooks/useConfigs.ts`
- `src/hooks/usePendingFixeds.ts`
- `src/db/repositories/index.ts` (`fetchFixedRecords`)
- `app/(settings)/index.tsx`
- `app/(credits)/index.tsx`
- `src/components/records/records-table.tsx`
- `src/components/records/add-record.tsx`
- `app/index.tsx`
- `src/lang/messages/settings.ts`, `records.ts`, `help.ts`
- `docs/architecture/domains.md`

## Pruebas

- Recurrencia mensual: día futuro, hoy, pasado, diciembre, febrero, bisiesto,
  día inválido.
- Fijos: mes del grupo sin off-by-one, límite de mes, próxima ocurrencia,
  deduplicación por grupo y periodo.
- Créditos: `next_payment_date` e independencia del mes del grupo.
- DB: consulta `fixed_id IN (...)` excluye borrados.
- Manual: Ajustes, Registros, Inicio, aviso y fechas guardadas.

## Riesgos

- Cambio de defaults para usuarios existentes.
- Con `group` + `next_occurrence` puede haber duplicados entre grupos.
- Con `period`, un registro del mismo mes en otro grupo oculta el pendiente.
- Inicio con `group_month` puede no mostrar el fijo si el grupo no es el mes
  actual.
- No se corrigen fechas históricas ya guardadas.

## Verificación

`npm run typecheck`, `npm test`, `npm run lint`, `npm run test:db`,
`npm run doctor`, `npm run docs:audit`, `npm run ci` y
`npx expo export --platform android`.

## Implementación

- `resolveNextMonthlyDay` comparte el cálculo entre Créditos y fijos, con
  mediodía local y límite al último día del mes.
- `pendingPaymentDateMode` acepta `next_payment_date`; `pendingFixedDateMode` y
  `pendingFixedDedupeMode` se validan al cargar AsyncStorage y usan defaults
  seguros.
- `usePendingFixeds` reemplaza la lógica duplicada de Registros e Inicio,
  incluye participantes compartidos y consulta `fetchFixedRecords` para la
  deduplicación por periodo.
- El formulario de pago de un fijo pendiente muestra el aviso
  `item.fixedPendingDateHint`.
- Ajustes, Registros e Inicio usan la misma fecha resuelta; Créditos reutiliza
  `resolveNextMonthlyDay`.
- Ayuda bilingüe actualizada en `help.ts`; textos nuevos en `settings.ts` y
  `records.ts`.
- Verificación: typecheck, 205 tests en 33 suites, `test:db`, lint sin errores,
  doctor 20/20, `docs:audit` y export Android correctos. Se actualizaron los
  parches de Expo SDK 58 requeridos por doctor.
