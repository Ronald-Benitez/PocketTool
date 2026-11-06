---
name: pockettool-records
description: Evalúa e implementa la integración con Registros (Records) para cualquier funcionalidad de PocketTool que cree, edite, pague, transfiera, aporte o retire dinero. Detecta si aplica y decide crear, vincular u omitir, validando monto/fecha y evitando vínculos duplicados.
---

# PocketTool Records

## Autodetección

Aplica si la operación:

- crea un ingreso o gasto;
- registra un pago, cuota, abono, interés o seguro;
- mueve dinero entre cuentas o ahorros;
- registra un aporte, retiro, ajuste o saldo inicial;
- afecta las cuentas del mes o el balance de un grupo.

No aplica si la operación es solo configuración, una estimación, una simulación,
un recordatorio sin pago o un cálculo de solo lectura. En ese caso, el plan debe
explicar **por qué** no aplica y no debe crear ni vincular `Records`.

## En modo plan

1. Confirma si aplica con el árbol anterior.
2. Decide el comportamiento por defecto: crear, vincular u omitir. Mantén el
   histórico: Vehículo crea por defecto; Financiamientos no vincula por defecto.
3. Define validaciones: grupo del mes, categoría, método de pago, tipo de
   registro (ingreso/gasto) y efecto.
4. Define la búsqueda de registros compatibles: monto y fecha deben coincidir;
   excluye los ya vinculados a vehículo, financiamientos, ahorros o créditos.
5. Define el comportamiento al editar y al eliminar (conservar el registro por
   defecto y quitar solo el vínculo, salvo confirmación).
6. Indica si hay que reutilizar un picker existente o extraer un `RecordPicker`
   común al agregar un tercer flujo.
7. Enumera pruebas: monto/fecha, exclusión de ya vinculados, transaccionalidad,
   edición y eliminación.
8. No edites archivos; entrega el diseño del flujo y los archivos afectados.

## En modo build

1. La UI no escribe `Records`: el repositorio del agregado crea, actualiza o
   vincula dentro de la misma transacción que guarda la operación.
2. Al crear, resuelve grupo del mes, categoría, método y tipo; valida que no
   falten y que el efecto sea correcto.
3. Al vincular, busca solo registros compatibles; valida **monto** y **fecha**;
   guarda la relación con `record_id` o la tabla de vínculo.
4. Excluye registros ya vinculados a otra operación. Un registro no puede
   representar dos gastos.
5. Al omitir, guarda `record_id = null` y no toques `Records`.
6. Al editar, actualiza el registro vinculado solo si el flujo lo permite. Al
   eliminar, conserva el registro por defecto y quita el vínculo.
7. Reutiliza `VehicleExpensePicker` y `FinancingRecordPicker`; si aparece un
   tercer flujo, extrae un `RecordPicker` común. No dupliques la búsqueda en la
   UI.
8. Agrega pruebas de validación monto/fecha, exclusión de ya vinculados y
   creación/vinculación transaccional.
9. Actualiza la ayuda si el usuario ve el nuevo flujo.

## Referencias

- `src/components/vehicle/FuelEntryForm.tsx` y
  `src/components/vehicle/MaintenanceForm.tsx` con `VehicleExpensePicker`.
- `src/components/credits/FinancingPaymentForm.tsx` con
  `FinancingRecordPicker`.
- `src/db/repositories/vehicle.ts` y `src/db/repositories/financings.ts` como
  ejemplos de creación/vinculación transaccional.
- `src/db/repositories/savings.ts` para el vínculo con `saving_id` y
  `SavingsHistory.record_id`.
- `src/db/AGENTS.md` y `src/db/schema/tables.ts`.
