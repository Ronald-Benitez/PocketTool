# Dashboard de Inicio

**Cuándo leer:** al cambiar el Home, sus bloques, el orden, la visibilidad, las
acciones rápidas o la navegación desde el panel.
**Resumen:** modelo del dashboard configurable: registro de bloques, layout en
AsyncStorage, normalización, navegación con flags y fuentes de datos.
**Secciones:** Modelo · Registro · Layout · Persistencia · Navegación · Bloques ·
Estados · Pruebas · Archivos.
**Skill:** `pockettool-ui`.

## Modelo

```ts
type DashboardBlockId =
  | 'summary' | 'obligations' | 'budget' | 'savings'
  | 'people' | 'recentRecords' | 'credits' | 'vehicle' | 'closing';

type DashboardActionId = 'record' | 'fixed' | 'saving' | 'group';

type DashboardLayout = {
  version: 1;
  blocks: { id: DashboardBlockId; visible: boolean }[];
  quickActions: DashboardActionId[];
};
```

- `blocks` guarda todos los bloques, visibles y ocultos, en el orden elegido.
- `quickActions` guarda entre 1 y 4 acciones; `record` siempre está disponible.
- `version` permite migrar el formato sin tocar SQLite.

## Registro

`src/dashboard/registry.ts` define para cada bloque:

- `labelKey` y `descriptionKey` bilingües.
- Icono de `MaterialIcons`.
- `feature` que lo habilita o `null` si siempre está disponible.
- `relatedFeatures` para bloques agregados como `obligations`.
- `defaultVisible`, orden de `DASHBOARD_BLOCK_IDS` y `placement`.

Visibles por defecto: `summary`, `obligations`, `budget`, `savings` y
`recentRecords`. `budget` y `savings` solo se renderizan si su flag está activo.

Acciones rápidas registradas: `record`, `fixed`, `saving` y `group`. Las dos
últimas crean entidades que no mueven dinero por sí mismas.

## Layout

`src/dashboard/layout.ts` es puro y testeable:

- `createDefaultDashboardLayout()` y `resetDashboardLayout()`.
- `normalizeDashboardLayout(value)`: descarta ids desconocidos, deduplica,
  agrega bloques nuevos con su visibilidad por defecto y normaliza acciones.
- `normalizeDashboardQuickActions(value)`: filtra, limita a cuatro y garantiza
  `record`.
- `moveDashboardBlock`, `setDashboardBlockVisibility` y
  `setDashboardQuickActions` devuelven un layout nuevo y la misma referencia si
  no hay cambios.
- `getVisibleDashboardBlocks`.

## Persistencia

- Clave AsyncStorage: `dashboardLayout`.
- Store Zustand: `src/dashboard/store.ts` con `load`, `reload`, `moveBlock`,
  `setVisibility`, `setQuickActions` y `reset`.
- Guardado optimista: actualiza memoria, persiste y revierte si AsyncStorage
  falla; el error se propaga para que la UI muestre el toast.
- El backup ya incluye todas las claves de AsyncStorage; `applySettings` en
  `src/db/utils/export-db.ts` recarga el store tras importar.

## Navegación

`src/dashboard/navigation.ts`:

- `DASHBOARD_BLOCK_TARGETS` mapea cada bloque a su ruta. `obligations` abre
  Compromisos cuando `fixeds` está activo; cada fila navega además a su módulo.
- `isDashboardTargetEnabled` e `isDashboardBlockAvailable` comprueban flags antes
  de navegar o renderizar.
- Si un bloque está oculto o su módulo está apagado, no se monta y no consulta
  datos.

Rutas: `/(summaries)`, `/(budget)`, `/(savings)`, `/(people)`,
`/(financials)/RecordsScreen`, `/(credits)`, `/(vehicle)` y `/(closing)`.

## Bloques

| Bloque | Fuente | Enlace | Flag |
| --- | --- | --- | --- |
| summary | `useResumesStore`, meta y progreso | `/(summaries)` | summaries |
| obligations | fijos, financiamientos, créditos y vehículo | `/(fixeds)` y por fila | agregado |
| budget | `useBudgetProjection` | `/(budget)` | budget |
| savings | repositorio de ahorros y metas; selección en `dashboardSavingsSelection` | `/(savings)` | savings |
| people | ledger compartido | `/(people)` | people |
| recentRecords | `useRecordsStore().records` | `/(financials)/RecordsScreen` | — |
| credits | `useCreditStore` y fecha de pago | `/(credits)` | credits |
| vehicle | repositorios y pronóstico de recordatorios | `/(vehicle)` | vehicle |
| closing | `useClosings` | `/(closing)` | closing |

## Componentes

- `DashboardScreen`: carga layout, configs y fijos; refresca al enfocar y
  compone los bloques visibles.
- `DashboardBlock`: `SectionCard` con icono, tooltip y acción “Ver todo”.
- `DashboardRefreshContext`: `refreshKey` compartido para que cada bloque
  recargue sus datos después de guardar.
- `QuickActionsFab`: FAB principal + acciones secundarias; abre `AddItem`,
  `AddFixed`, `AddSaving` o `AddGroup`.
- `useDashboardNavigation`: resuelve rutas y comprueba flags antes de navegar.
- Bloques por dominio en `src/components/dashboard/blocks/`.

## Editor

- Se abre desde el header de Inicio con el icono `tune` (“Personalizar”).
- Header de edición: “Listo” y “Restablecer” con `ConfirmDialog`.
- Bloques visibles en `SortableList` compacta: drag, ocultar con ojo y acciones
  de accesibilidad para subir/bajar.
- Sección “Bloques ocultos” para volver a mostrarlos.
- Acciones rápidas con `SwitchField`; `record` siempre activo, máximo cuatro y
  módulos apagados deshabilitados con acceso a Ajustes → Experiencia.
- El FAB se oculta durante la edición.
- Guardado optimista en el store; si AsyncStorage falla, se revierte el cambio y
  se muestra `dashboard.saveError`.

## Estados

Cada bloque maneja carga, vacío y error sin bloquear al resto. El Home comparte
un `refreshKey` que se incrementa al enfocar y después de guardar. Si todos los
bloques están ocultos, se muestra un estado vacío con “Restablecer”. El bloque de
ahorros permite elegir qué ahorros cuentan para el total
(`dashboardSavingsSelection`) y el presupuesto compara el saldo esperado del plan
con el saldo actual del grupo.

## Pruebas

- `src/dashboard/__tests__/layout.test.ts`: defaults, normalización, mover,
  visibilidad y acciones.
- `src/dashboard/__tests__/registry.test.ts`: ids, etiquetas bilingües y flags.
- `src/dashboard/__tests__/navigation.test.ts`: rutas y gating.
- `src/dashboard/__tests__/store.test.ts`: carga, persistencia, reset y datos
  corruptos.
- `src/domain/dashboard/__tests__/obligations.test.ts`: urgencia y orden.

## Archivos

- `src/dashboard/types.ts`, `registry.ts`, `layout.ts`, `navigation.ts`,
  `store.ts`.
- `src/domain/dashboard/obligations.ts`.
- `src/lang/messages/home.ts` (`dashboard.*`).
- `src/db/utils/export-db.ts` (recarga tras importar).
