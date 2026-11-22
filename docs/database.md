# Base de datos

**Cuándo leer:** al tocar el esquema, migraciones, backups o acceso a datos.
**Resumen:** fuente de verdad del esquema, artefactos generados, reglas de
migración, backup y acceso. El inventario completo vive en `schema.md`.
**Secciones:** Fuente · Convenciones · Artefactos · Lectura del esquema ·
Tablas clave · Relaciones · Migraciones · Backup · Acceso · Verificación.

**Fuente de verdad:** [`../src/db/schema/tables.ts`](../src/db/schema/tables.ts)
**Esquema generado:** [`schema.md`](schema.md)
**Historial de migraciones:** `src/db/migrations/`

## Convenciones

- Nombres lógicos PascalCase (`Records`) y físicos snake_case (`records`).
- Dinero en centavos enteros; fechas en milisegundos Unix.
- Soft delete con `deleted_at`; el ORM filtra borrados por defecto.
- `created_at`/`updated_at` se llenan con triggers de SQLite.
- Los índices se definen en `APP_SCHEMA` y los crea `ensureIndexes`.
- Las reglas de la capa de datos viven en
  [`../src/db/AGENTS.md`](../src/db/AGENTS.md); no las dupliques aquí.

## Artefactos generados

Se regeneran con:

```bash
npm run db:generate
```

Salidas:

- `src/db/schema/generated/schema.sql`
- `src/db/schema/generated/types.ts`
- `src/db/schema/generated/relations.json`
- `src/db/schema/generated/columns.json`
- `docs/schema.md`

No edites esos archivos a mano.

### Lectura eficiente del esquema

`docs/schema.md` es grande y generado. **No lo leas completo.**

1. Abre el índice “Tablas” del inicio: cada fila incluye la línea donde empieza
   la sección de esa tabla.
2. Busca la tabla con `rg -n "^## Records" docs/schema.md` si necesitas
   confirmar la línea.
3. Lee solo el rango de esa sección (columnas, relaciones e índices).
4. Para cambios de código, prefiere `src/db/schema/metadata.ts` o
   `src/db/schema/generated/columns.json` antes que el documento completo.

## Tablas clave

El inventario completo de tablas, columnas, índices y relaciones está en
[`schema.md`](schema.md). Estas son las tablas con semántica especial:

| Tabla | Nota semántica |
| --- | --- |
| `Groups` | `year`/`month` son el mes ancla (`month` 0-based); `period_start`/`period_end` guardan el periodo local inclusivo y `period_mode` su regla. |
| `Records` | `amount` es el monto propio; `shared_amount_cents` es el snapshot compartido y `saving_id` indica pago con ahorro. `paid_by_person_id`/`paid_scope` distinguen pagador y alcance. |
| `PaidCredits` | Pagos de créditos imputados a un grupo y método. |
| `Financings` | Compras a plazo y préstamos con tasa, plazo y estado inicial. |
| `SharedExpenseParticipants` | Participantes de fijos, financiamientos, ahorros y compras (`owner_type = 'record'`); `share_mode` distingue `percent`/`amount`. |
| `PersonSettlements` | Liquidaciones por persona; `direction` indica quién pagó y `group_id` imputa el movimiento al grupo de caja. |
| `Savings` | Cuentas/metas con meta global opcional, regla de aporte, estado y modo de `Records`. |
| `SavingsHistory` | Saldo inicial, aporte, retiro, interés y ajuste; incluye persona, periodo y registro vinculado. |
| `GroupClosings` | Cierre informativo por grupo con periodo, fecha límite, estado y totales snapshot; un solo final por grupo. |
| `GroupClosingLines` | Líneas de disponible, obligación o resolución; índices únicos evitan repetir la misma tarjeta/cuenta, fijo o financiamiento. |
| `VehicleExpenseLinks` | Vínculo uno a uno con `Records` para combustible y mantenimiento. |
| `ShoppingLists` | Lista global de compras; `status` la vuelve de solo lectura y `record_id` (único) guarda la compra vinculada. |
| `ShoppingListItems` | Artículos con precio opcional, check persistente y orden; pertenecen a una `ShoppingList`. |
| `ChartPreferences` | Preferencias por gráfico: colapsado, modo, series ocultas, límite, orden y zoom. |
| `Migrations` | Historial de migraciones aplicadas. |

## Relaciones

Las FKs y rutas navegables se generan en
[`src/db/schema/generated/relations.json`](../src/db/schema/generated/relations.json)
y se documentan por tabla en [`schema.md`](schema.md).

## Migraciones

El historial completo (0001–0027) vive en `src/db/migrations/` y en
[`legacy/migration-history.md`](legacy/migration-history.md).

Reglas: transacción exclusiva, registro tras el commit, `PRAGMA user_version`
como versión rápida, sin capturar errores y tabla `migrations` creada antes del
runner. El detalle está en [`../src/db/AGENTS.md`](../src/db/AGENTS.md) y en la
skill `pockettool-db`.

## Backup

El export es un dump SQL con cabecera opcional:

```sql
-- POCKETTOOL_BACKUP {"formatVersion":1,"appVersion":"...","schemaVersion":26,"exportedAt":...,"tables":[...],"settings":{"configs":"...","appLanguage":"es"}}
```

- Los dumps SQL antiguos siguen siendo importables.
- Los backups nuevos incluyen las configuraciones de AsyncStorage: tipos de
  registro del resumen, modos de balance, idioma, tema, grupo fijado, experiencia
  y demás preferencias. Los backups antiguos sin `settings` se importan sin
  cambios.
- Al importar se restauran datos y configuraciones; el idioma y el tema pueden
  requerir reiniciar la app.
- El import valida metadatos/tablas, crea backup previo con las configuraciones
  actuales, usa transacción exclusiva y restaura FKs.
- El backup previo se guarda en caché antes de importar.

## Acceso a datos

- `src/orm/`: ORM tipado, joins, soft delete, transacciones y errores tipados.
- `src/db/repositories/`: repositorios por agregado.
- `src/db/index.ts`: barrel público (`useRecords`, `useGroups`, etc.).
- La UI y los stores no usan SQL ni `useORM` directo.
- Reglas y errores: [`../src/db/AGENTS.md`](../src/db/AGENTS.md).

## Verificación

Usa `/verificar` o los comandos de [`../AGENTS.md`](../AGENTS.md) → Verificación.
`test:db` cubre migraciones, seed, ORM, triggers, backups, validación, créditos,
planes de consulta y ausencia de handlers legacy.
