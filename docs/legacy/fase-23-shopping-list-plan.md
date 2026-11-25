# Fase 23 — Lista de compras

**Leer solo si:** necesitas el detalle del esquema, dominio, selector modal,
cierre en solo lectura, registro de compras o previsualización del origen de un
`Record`.
**Resumen:** listas globales tipo to-do con artículos de precio opcional, total
de artículos marcados, cierre inmutable, selector en modal y registro de la
compra mediante crear, vincular u omitir un `Record`; el detalle del registro
muestra su origen con previsualización y acceso al módulo.
**Secciones:** Objetivo · Criterios · Decisiones · Alcance · Modelo · Dominio ·
Repositorio · Registros · UI · Experiencia · i18n y ayuda · Pruebas ·
Documentación · Riesgos · Verificación · Archivos · Estado.
**Estado:** Finalizada y archivada (2026-11-22).
**Fecha:** 2026-11-22

**Verificación:** `npm run typecheck`, `test:db`, 379 tests, lint sin errores,
doctor 20/20, `docs:audit`, `ci` y export Android; QA validado por el usuario.

## Objetivo

Añadir una sección para planificar compras:

- Crear listas globales con nombre y estado abierto/cerrado.
- Añadir artículos con precio opcional y marcarlos como completados.
- Calcular el total usando solo artículos marcados con precio.
- Cerrar la lista y bloquear toda edición posterior.
- Registrar la compra como `Record` con monto calculado o manual, vincular un
  registro compatible o cerrar sin registrar.

## Criterios de aceptación

1. Se pueden crear, renombrar y eliminar listas; eliminar conserva los registros.
2. Los artículos aceptan nombre y precio opcional; el check es persistente.
3. El total suma solo artículos marcados con precio e indica si es parcial.
4. Una lista cerrada no permite editar, añadir, borrar ni marcar artículos.
5. Registrar crea o vincula un `Record` en la misma transacción y guarda
   `record_id`; no se puede registrar dos veces la misma lista.
6. Vincular valida monto y fecha, filtra por grupo y excluye registros ya
   vinculados a otros agregados.
7. La sección respeta el flag `shopping`, el drawer y el guard de rutas.
8. La ayuda bilingüe y la documentación se actualizan; pruebas en verde.

## Decisiones

- Las listas son globales; el grupo se elige al crear o vincular el `Record`.
- El total calculado usa solo artículos marcados que tengan precio.
- Un precio de cero significa que el artículo no tiene precio.
- El registro ofrece crear, vincular u omitir. Omitir es cerrar sin registrar.
- El monto manual puede diferir del total calculado; se valida antes de guardar.
- El selector de listas vive en un modal y el detalle del registro muestra su
  origen con previsualización y acceso al módulo.
- v1 no incluye cantidades, unidades, compartidos ni plantillas de compra.

## Alcance

Incluye:

- Sección nueva en el drawer y feature flag.
- Tablas, migración, repositorio, dominio, UI, i18n y ayuda.
- Selector común de registros para vincular.
- Pruebas de base de datos, dominio y registro de ayuda.

No incluye:

- Cantidades o unidades por artículo.
- Compras compartidas o reparto entre personas.
- Plantillas de listas.
- Sincronización remota.

## Modelo

### ShoppingLists

- `id`
- `list_name` TEXT not null
- `status` TEXT not null default `open` (`open`/`closed`)
- `closed_at` timestamp nullable
- `purchase_date` timestamp nullable
- `record_id` INTEGER nullable, FK `Records` `SET NULL`
- `record_total_cents` money nullable
- `created_at`, `updated_at`, `deleted_at`
- Índice `idx_shopping_lists_status` (`status`) donde no esté borrado.
- Índice único `idx_shopping_lists_record` (`record_id`) donde `record_id` no
  sea nulo y no esté borrado.

### ShoppingListItems

- `id`
- `shopping_list_id` FK `ShoppingLists` `CASCADE`, not null
- `item_name` TEXT not null
- `price_cents` money nullable
- `is_checked` boolean not null default 0
- `sort_order` INTEGER not null default 0
- `created_at`, `updated_at`, `deleted_at`
- Índice `idx_shopping_list_items_list` (`shopping_list_id`, `sort_order`) donde
  no esté borrado.

Migración `0027_shopping_lists.ts`; `SCHEMA_VERSION` sube a 27. Sin backfill.

## Dominio

`src/domain/shopping/totals.ts`:

- `calculateShoppingTotal(items)` devuelve `totalCents`, `checkedCount`,
  `pricedCheckedCount`, `unpricedCheckedCount` y `isPartial`.
- Solo suma artículos marcados con `price_cents` mayor que cero; cero es sin
  precio.
- Sin React, sin formato y sin colores.

## Repositorio

`src/db/repositories/shoppingLists.ts`:

- `fetchLists`, `fetchList`, `createList`, `renameList`, `deleteList`.
- `addItem`, `updateItem`, `deleteItem`, `toggleItem`, `reorderItems`.
- `closeList`: exige al menos un artículo y bloquea la lista.
- `registerPurchase`: modos `create`, `link`, `none` dentro de una transacción
  exclusiva; actualiza `record_id`, `record_total_cents` y `purchase_date`.
- `unlinkRecord`: solo si se elimina el registro enlazado; conserva la lista
  cerrada.
- Errores explícitos: `SHOPPING_LIST_NOT_FOUND`, `SHOPPING_LIST_CLOSED`,
  `SHOPPING_LIST_EMPTY`, `SHOPPING_ALREADY_RECORDED`, `SHOPPING_AMOUNT_REQUIRED`,
  `SHOPPING_RECORD_MISMATCH`.
- Todas las operaciones pasan por `mapDatabaseError`.

## Registros

- Crear: valida grupo actual, fecha, tipo de gasto con efecto `-`, categoría,
  método de pago y monto mayor que cero; inserta `Records` y actualiza la lista
  en la misma transacción.
- Vincular: busca registros de gasto compatibles por grupo, monto y fecha;
  excluye registros ya vinculados a vehículo, financiamientos, ahorros, créditos
  y otras listas. Guarda `record_id` y `record_total_cents`.
- Omitir: cierra la lista sin tocar `Records`.
- Eliminar la lista conserva el registro; eliminar el registro deja
  `record_id = null` por FK.
- Se crea un `RecordPicker` común para shopping y se migran los pickers
  existentes si el cambio cabe en la fase; no se duplica la búsqueda.
- El detalle del registro resuelve sus vínculos (fijo, ahorro, financiamiento,
  combustible, mantenimiento, lista de compras o crédito) y muestra una
  previsualización con acceso al módulo; compras y ahorros abren el elemento
  exacto.

## UI

- `app/(shopping)/index.tsx`: sección del drawer con `Screen` scroll.
- Header con título, tooltip y acción “Nueva lista”.
- Filtros Abiertas/Cerradas/Todas.
- Selector de lista en modal con filtros y filas de estado/total.
- Detalle de la lista seleccionada debajo del selector.
- Artículos con checkbox, nombre, precio opcional y acción de eliminar.
- Alta y edición de artículo en modal; alta de lista en modal.
- Estado cerrado en solo lectura con badge y acciones de registro/eliminación.
- `ShoppingPurchaseForm`: monto prellenado editable, fecha, tipo, categoría,
  método, nombre y modo Crear/Vincular.
- Confirmación para cerrar y eliminar; `ToastProvider` global.
- Reutilizar `Screen`, `SectionCard`, `Badge`, `MoneyField`, `SelectField`,
  `DateField`, `ConfirmDialog`, `EmptyState` y `RecordPicker`.

## Experiencia

- Nueva feature `shopping` en `modules`.
- Presets: balanced y complete activos; essential inactivo.
- Drawer con icono de carrito y `drawerItemStyle` según el flag.
- `GROUP_FEATURES['(shopping)'] = 'shopping'` para el guard de rutas.
- `HELP_TOPIC_FEATURES.shopping = 'shopping'`.

## i18n y ayuda

- `src/lang/messages/shopping.ts` con textos de lista, artículo, cierre,
  registro, vínculo, estados y errores.
- Tema `shopping`, categoría `planning`, icono `shopping-cart`, relacionados
  `records`, `groups`, `summaries` y `budgets`.
- Contenido bilingüe completo: what/how/steps/example/tips/warning.
- El ejemplo debe validarse con `useResumesStore` y el registro creado.

## Pruebas

- `test:db`: migración, tablas, índices, CRUD, cierre, bloqueo de edición,
  total, crear, vincular, omitir, duplicado, borrado de lista/registro.
- Jest: `calculateShoppingTotal` y validaciones puras.
- Ayuda: registro, paridad y tres pasos.
- Manual: Android/iOS, teclado, solo lectura, flag y estados vacíos.

## Documentación

- `docs/database.md` y `docs/schema.md` generado.
- `docs/architecture/features.md` y `dependencies.md`.
- `docs/phases.md` y este plan al cerrar.
- `docs/README.md` si aparece un documento nuevo.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Registrar dos veces la misma compra | Índice único y validación transaccional |
| Vincular un registro incompatible | Validar monto, fecha, grupo y vínculos existentes |
| Lista cerrada editable | Guard en repositorio y UI |
| Registro eliminado | FK `SET NULL`; mostrar “registro eliminado” |
| Duplicar pickers | Extraer `RecordPicker` común |
| Crecimiento de alcance | Cantidades, compartidos y plantillas fuera de v1 |

## Verificación

```bash
npm run typecheck
npm run db:generate
npm run test:db
npm test
npm run lint
npm run docs:audit
npm run ci
npm run doctor
npx expo export --platform android
```

## Archivos

- `src/db/schema/tables.ts`, `src/db/schema/generated/*`,
  `src/db/migrations/0027_shopping_lists.ts`, `src/db/migrations/index.ts`.
- `src/validation/entities.ts`.
- `src/db/repositories/shoppingLists.ts`, `src/db/repositories/index.ts`.
- `src/domain/shopping/totals.ts` y pruebas.
- `src/components/shopping/*`, `src/components/records/RecordPicker.tsx`.
- `app/(shopping)/index.tsx`, `app/_layout.tsx`.
- `src/features/{types,definitions,routes,help}.ts`.
- `src/lang/messages/{shopping,features,help}.ts`.
- `src/help/{types,registry}.ts`.
- `docs/database.md`, `docs/schema.md`, `docs/architecture/*`,
  `docs/phases.md`.

## Estado

- [x] Paso 1 — Esquema, migración y artefactos generados.
- [x] Paso 2 — Dominio de totales y pruebas.
- [x] Paso 3 — Repositorio CRUD, cierre y solo lectura.
- [x] Paso 4 — Registro crear/vincular/omitir y `RecordPicker` común.
- [x] Paso 5 — Feature flag, drawer y guard.
- [x] Paso 6 — UI de listas, artículos y registro.
- [x] Paso 7 — i18n, ayuda, documentación y verificación.
