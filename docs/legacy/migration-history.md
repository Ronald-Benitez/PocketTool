# Historial de migraciones

**Resumen:** tabla histórica de las migraciones `0001`–`0026`; la fuente vigente
es `src/db/migrations/` y el resumen operativo está en
[`../database.md`](../database.md).
**Estado:** histórico; no es documentación vigente.
**Fecha:** 2026-11-20.
**Secciones:** Migraciones.

| Versión | Nombre | Qué hace |
| ---: | --- | --- |
| 1 | `0001_baseline` | Esquema consolidado y normalización legacy. |
| 2 | `0002_audit_timestamps` | Agrega `created_at`/`updated_at`. |
| 3 | `0003_timestamp_triggers` | Crea triggers y rellena timestamps nulos. |
| 4 | `0004_budget_plans` | Crea `budget_plans`/`budget_lines`, migra `budgets` a `budgets_legacy` y amplía plantillas. |
| 5 | `0005_drop_budget_legacy` | Elimina `budgets_legacy` después de validar la migración. |
| 6 | `0006_drop_budget_plan_status` | Elimina la columna `status` de `budget_plans`. |
| 7 | `0007_vehicle_module` | Reemplaza `fuel_refills`/`trip_logs` por el módulo de vehículo y crea sus tablas. |
| 8 | `0008_fuel_baseline` | Agrega `is_baseline` y hace nullables volumen/precio/total para el registro base. |
| 9 | `0009_vehicle_type` | Agrega `vehicle_type` a `vehicles` con valor inicial `car`. |
| 10 | `0010_vehicle_type_models` | Normaliza `car`→`sedan` y `van`→`furgon` para los modelos nuevos. |
| 11 | `0011_credit_cards_and_financings` | Agrega campos visuales/tarjeta a `payment_methods` y crea `financings`, `financing_payments` y `financing_adjustments`. |
| 12 | `0012_financing_payment_cents` | Agrega `payment_cents` a `financings` para la cuota pactada opcional. |
| 13 | `0013_vehicle_settings_record_type` | Agrega `record_type_id` a `vehicle_settings` para el tipo de registro por defecto de la sección Vehículo. |
| 14 | `0014_people_and_shared_participants` | Crea `people` y `shared_expense_participants`, y migra los compartidos existentes de financiamientos. |
| 15 | `0015_records_shared_amounts` | Agrega `own_amount_cents` y `shared_amount_cents` a `records`; backfill propio = monto y compartido = 0. |
| 16 | `0016_shared_payment_allocations` | Crea `shared_payment_allocations` para el historial de pagos compartidos por persona. |
| 17 | `0017_savings_goals_and_sharing` | Agrega metas, estado, archivo, regla de aporte, intereses y cachés a `savings`; crea `savings_settings`. |
| 18 | `0018_savings_movements` | Agrega tipo, persona, período, notas y vínculo a `Records` en `savings_history`; conserva el saldo inicial. |
| 19 | `0019_records_saving_source` | Agrega `records.saving_id` y migra el vínculo existente desde `savings_history.record_id`, excepto los registros creados desde un movimiento (`Saving · `). |
| 20 | `0020_clear_movement_saving_source` | Limpia `records.saving_id` de los registros creados desde un movimiento de ahorro que quedaron marcados por error. |
| 21 | `0021_records_payer_and_scope` | Agrega `records.paid_by_person_id` y `records.paid_scope`; backfill `full`. |
| 22 | `0022_person_settlements` | Crea `person_settlements` para las liquidaciones por persona y su grupo de caja. |
| 23 | `0023_shared_participant_amounts` | Agrega `share_mode` y `share_amount_cents` a `shared_expense_participants`; backfill `percent`. |
| 24 | `0024_group_closings` | Crea `group_closings` y `group_closing_lines`; índice único de un final por grupo. |
| 25 | `0025_group_periods` | Agrega `period_start`, `period_end` y `period_mode` a `groups`; normaliza el mes del grupo de ejemplo y `month = 12`; crea `idx_groups_period`. |
| 26 | `0026_chart_preferences` | Crea `chart_preferences` con índice único parcial por `chart_key`. |
| 27 | `0027_shopping_lists` | Crea `shopping_lists` y `shopping_list_items` con índices por estado, vínculo único a `Records` y orden de artículos. |
