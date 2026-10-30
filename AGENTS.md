# AGENTS.md

Contexto e instrucciones para agentes que trabajen en PocketTool.

## Objetivo del proyecto

PocketTool es una app Expo/React Native de finanzas personales con almacenamiento
local en SQLite. La app gestiona grupos, registros, presupuestos, gastos fijos,
métodos de pago, créditos, ahorros y vehículo.

## Estado actual

- **Fase 0 — Correcciones críticas: FINALIZADA** (2026-10-28).
- **Fase 1 — Fuente única de verdad del esquema: FINALIZADA** (2026-10-28).
- **Fase 2 — Repositorios y ORM robusto: FINALIZADA** (2026-10-28).
- **Fase 3 — Calidad, pruebas y operación: FINALIZADA** (2026-10-28).
- **Fase 4 — Sistema de UI reutilizable: FINALIZADA** (2026-10-29). Queda
  pendiente el checklist visual final.
- **Fase 5 — Traducciones tipadas: FINALIZADA** (2026-10-29).
- **Fase 6 — Centro de ayuda: FINALIZADA** (2026-10-29).
- **Fase 7 — Presupuestos: EN IMPLEMENTACIÓN** (2026-10-29). El plan vive en
  [`docs/budget-plan.md`](docs/budget-plan.md); queda QA visual y validación en
  dispositivo antes de cerrarla.

El plan completo, el detalle de lo ejecutado y los criterios de aceptación viven
en [`docs/phases.md`](docs/phases.md). **Cada vez que se complete una fase hay
que actualizar ese documento y marcar la fase como finalizada**, incluyendo fecha,
commits relevantes, archivos tocados y verificaciones realizadas.

## Arquitectura de UI

- `src/ui/theme/tokens.ts`: tokens de espaciado, radios, alturas, tipografía,
  sombras y z-index.
- `src/ui/theme/palettes/bright.base.json` y `dark.base.json`: paletas base
  versionadas. No editar valores base sin actualizar tests de contraste.
- `src/ui/theme/ThemeProvider.tsx`: fuente del tema. Expone `colors`,
  `palettes`, `mode`, `resolvedMode`, setters y resets.
- `src/ui/theme/settings.ts`: normalización, migración legacy, resolución de
  modo/paleta y merge; funciones puras testeables.
- `src/ui/theme/contrast.ts`: contraste WCAG AA.
- `src/ui/primitives/`: `AppText`, `Surface`, `Divider`, `Screen`, `Stack`/`Row`/
  `Column`.
- `src/ui/actions/`: `Button`, `IconButton`, `LinkButton` y `SwipeAction` con
  variantes y estados.
- `src/ui/forms/`: `FormField`, `TextField`, `MoneyField`, `SelectField`,
  `MultiSelectField`, `DateField`, `MonthField`, `SwitchField`, `ColorField` y
  `ColorPicker` con label/required/hint/error.
- `src/ui/overlays/`: `Modal` (center/bottom), `BottomSheet`, `Dialog` y
  `ConfirmDialog`. `Modal` maneja el teclado con `KeyboardAvoidingView`, insets
  y auto-scroll al `TextField` enfocado.
- `src/db/schema/metadata.ts`: resolución de columnas, tipos, `kind` y
  referencias del esquema para construir UI tipada sin ejecutar SQL.
- `src/domain/filters/types.ts` y `src/domain/records/filtering.ts`: tipos de
  filtro, matcher y orden compartidos.
- `src/domain/records/filterFields.ts`: campos curados de Records, opciones de
  relaciones y columnas avanzadas.
- `src/domain/budgets/`: comparación plan/real, estados, proyección, insights y
  builders de gráficos Mermaid. La UI no calcula dinero.
- `src/db/repositories/budgets.ts`: repositorios de planes, líneas y plantillas;
  entrega `BudgetPlanView` listo para la UI.
- `src/ui/charts/MermaidChart.tsx`: WebView offline con Mermaid vendorizado,
  tema y fallback accesible.
- `src/hooks/useBudgetPlan.ts`: carga y refresco del plan mensual y plantillas.
- `src/ui/filters/`: `FilterModal`, `FilterRow`, `OrderRow` y
  `FilterValueInput`; `RecordsFilterModal` es el wrapper de Records.
- `SelectField` y `MultiSelectField` aceptan `searchable` para buscar opciones.
- `src/ui/feedback/`: `ToastProvider` único, `InlineMessage`, `EmptyState`,
  `LoadingState` y `ToastViewport` para modales.
- `src/ui/data-display/`: `Card`, `ListItem`, `Badge`, `FinanceValue`,
  `SummaryBlock`, `SummaryGroup` y `AccentRow`; `FinanceValue` recibe centavos y
  usa el tema.
- `src/ui/index.ts`: barrel público del sistema de UI.
- `src/styles/useThemedStyles.ts`: adapta los estilos legacy al tema activo.
- `src/components/summaries/`: `FinanceTableBlock`/`FinanceTableChart` con
  `SummaryGroup`.
- `app/gallery.tsx`: galería de desarrollo, oculta del drawer.
- No crear toasts o modales locales; usar `ToastProvider` y `src/ui`.
- `eslint.config.js` bloquea `TextInput`, `Modal`, `Alert` y `ToastAndroid` de
  `react-native` fuera de `src/ui`.
- Los componentes nuevos usan `useTheme()`; no leer `useColorStore` ni claves
  legacy.
- `src/stores/ColorsStore.ts` es solo un adaptador de compatibilidad durante la
  migración.

### Navegación por grupos

- Cada sección del drawer vive en un grupo `app/(...)/` con un `_layout.tsx`
  basado en `StackBase`, igual que `app/(financials)/_layout.tsx`.
- Declarar cada pantalla con `<Tabs.Screen name='...'>`; `StackBase` aporta el
  header, el botón de menú del drawer, el tema y la tab bar.
- **No** crear un `Stack` interno para una sección del drawer. Un `Stack`
  reemplaza el header de `StackBase` y puede dejar al usuario sin acceso al
  drawer. Si se necesita navegación interna, usar estado/modal dentro de la
  pantalla o una ruta del mismo grupo declarada como tab.
- Para editores de una entidad (por ejemplo plantillas), preferir estado local
  en la pantalla de la sección y un componente editor, no una ruta dinámica
  oculta dentro de `Tabs`.
- Referencia vigente: `app/(budget)/_layout.tsx` declara `index` y `templates`
  con `Tabs.Screen`; el editor de plantillas es un componente dentro de
  `templates.tsx`.

### Footers de modales

- El contenedor interno del `footer` de un `Modal` debe tener `flex: 1` cuando
  los botones usan `flex: 1`. Sin ese `flex`, el contenedor queda con ancho
  automático, los botones colapsan y el texto desaparece.
- Patrón correcto, igual que `src/components/records/add-record.tsx`:
  ```tsx
  footer={
    <View style={styles.footer}>
      <Button label='Cancel' variant='outline' style={styles.footerButton} />
      <Button label='Save' style={styles.footerButton} />
    </View>
  }
  // styles.footer = { flex: 1, flexDirection: 'row', gap: 8 }
  // styles.footerButton = { flex: 1 }
  ```
- Si se usa `Row` de `src/ui/primitives` como footer, pasarle
  `style={{ flex: 1 }}`.
- No usar `flexDirection: 'row'` sin `flex: 1` en el footer interno.

### Carpetas de la sección Presupuestos

- `app/(budget)/_layout.tsx`: `StackBase` con tabs `index` y `templates`.
- `app/(budget)/index.tsx`: plan mensual, comparación, fijos y acciones.
- `app/(budget)/templates.tsx`: lista de plantillas y editor embebido.
- `src/components/budgets/`: formularios y diálogos de presupuesto y plantillas.
- `src/domain/budgets/`: lógica pura de comparación, media, charts e insights.
- `src/hooks/useBudgetPlan.ts`: carga/refresco de plan y plantillas.
- `src/ui/charts/`: `MermaidChart` y wrappers de gráficos.
- `assets/vendor/mermaid/`: bundle offline generado con `npm run vendor:mermaid`.
- Persistencia del tema: clave `themeSettings`; migra desde `colors` y elimina
  la clave legacy al migrar.
- La UI no debe hardcodear colores nuevos; usar tokens semánticos.
- Los colores personalizados viven por paleta (`bright`/`dark`) y se completan
  con la base al agregar tokens nuevos.

- **Idiomas:** `src/lang/messages/` es la fuente de verdad. Cada dominio contiene
  inglés y español; `t()` se tipa con `TranslationKey`. No agregar JSON de
  traducciones.
- **Ayuda:** `src/help/registry.ts` define los temas y `src/lang/messages/help.ts`
  su contenido bilingüe. Ver “Mantenimiento del centro de ayuda”.

## Mantenimiento del centro de ayuda

La sección de ayuda debe actualizarse cuando cambie una funcionalidad, una regla
de negocio o se agregue una pantalla.

### Agregar un tema

1. Agregar el ID a `HelpTopicId` en `src/help/types.ts`.
2. Agregar el seed en `src/help/registry.ts` con:
   - `id`, `icon`, `category` y `related`;
   - un tema por cada flujo importante.
3. Agregar el contenido en `src/lang/messages/help.ts` dentro de
   `helpEn.topics.<id>` y `helpEs.topics.<id>`.
4. Mantener exactamente las mismas claves en inglés y español:
   - `title`, `summary`;
   - `what.{title,body}`;
   - `how.{title,body}`;
   - `steps.{title,step1,step2,step3}`;
   - `example.{title,body}`;
   - `tips.{title,body}`;
   - `warning.{title,body}`.
5. Agregar relaciones en `related` solo con IDs existentes.
6. Usar datos ficticios en los ejemplos; nunca datos reales del usuario.
7. Validar la lógica del ejemplo contra los stores reales:
   - `useResumesStore` para balances y resúmenes;
   - `useCreditStore` para créditos;
   - `useBudgetPlan`/`useBudgetPlansRepository` para presupuestos;
   - `useSavingsStore` para ahorros.

### Agregar una categoría de ayuda

1. Agregar el valor a `HelpCategory` en `src/help/types.ts`.
2. Agregarla a `HELP_CATEGORIES` en `src/help/registry.ts`.
3. Agregar su etiqueta en `helpEn.categories` y `helpEs.categories`.

### Reglas de contenido

- No escribir texto directamente en `app/(help)` ni en componentes; usar
  `titleKey`/`bodyKey` y `t()`.
- Cada tema debe explicar la lógica, no solo describir botones.
- Los cambios de lógica deben reflejarse en el tema correspondiente y en su
  ejemplo.
- La búsqueda del hub indexa título, resumen y secciones; si se agrega contenido
  nuevo, no hace falta un índice aparte.
- Usar `Screen`, `Surface`, `ListItem`, `InlineMessage` y el resto de `src/ui`
  para mantener dark mode y accesibilidad.
- Ejecutar `npm run typecheck` y `npm test` después de cambiar ayuda o
  traducciones.

### Tests de ayuda

- `src/help/__tests__/registry.test.ts` valida IDs, categorías, relaciones,
  claves bilingües y pasos.
- Si se agrega una sección obligatoria, actualizar ese test.
- Si se agrega una nueva categoría, actualizar `HELP_CATEGORIES` y el test.

## Arquitectura de datos

- `src/db/schema/tables.ts`: `APP_SCHEMA`, única fuente de verdad del esquema.
  Nombres lógicos PascalCase (`Records`, `PaymentMethods`, `Fixed`, etc.) y
  nombres físicos snake_case (`records`, `payment_methods`, `fixed_records`, etc.).
  Incluye metadatos semánticos (`kind: 'money' | 'timestamp' | 'boolean'`) y el
  nombre de la entidad TypeScript.
- `src/db/schema/generated/`: artefactos generados desde `tables.ts`
  (`schema.sql`, `types.ts`, `relations.json`, `columns.json`). **No editar a
  mano.**
- `scripts/generate-db-artifacts.js`: generador de artefactos (`npm run db:generate`).
- `src/db/schema/seed.ts`: seed idempotente de datos de referencia y ejemplo.
- `src/db/migrations/0004_budget_plans.ts`: migra `budgets` a
  `budget_plans`/`budget_lines` y conserva `budgets_legacy` durante una versión.
- `src/db/migrations/0005_drop_budget_legacy.ts`: elimina la tabla legacy
  después de validar la migración.
- Presupuestos: un plan por grupo, líneas `category` o `fixed`, snapshot del
  monto planificado y comparación derivada desde `Records`. No guardar el real.
- Gráficos: Mermaid se vendoriza en `assets/vendor/mermaid/mermaid.min.js.txt`
  con `node scripts/vendor-mermaid.js`; no usar CDN.
- `src/db/schema/apply.ts`: normalización/rebuild de tablas, conversiones legacy
  e índices.
- `src/db/migration.ts`: bootstrap, pragmas y runner de migraciones.
- `src/db/migrations/0001_baseline.ts`: baseline consolidado.
- `src/db/migrations/0002_audit_timestamps.ts`: migración incremental de auditoría.
- `src/db/migrations/0003_timestamp_triggers.ts`: triggers de `created_at`/`updated_at`.
- `src/orm/index.ts`: ORM tipado; usa las relaciones generadas, filtros de soft
  delete, CRUD y transacciones.
- `src/orm/errors.ts`: errores tipados (`InvalidIdentifierError`,
  `InvalidDataError`, `QueryError`).
- `src/db/repositories/index.ts`: repositorios por agregado.
- `src/db/repositories/fuel.ts`: consultas tipadas de combustible y viajes.
- `src/db/utils/sql-dump.ts`: generación/validación del dump SQL.
- `src/db/utils/backup.ts`: metadatos versionados del backup.
- `src/validation/entities.ts`: esquemas zod para entradas de repositorio.
- `src/db/index.ts`: barrel público; expone `useRecords`, `useGroups`, etc.
- `.github/workflows/ci.yml`: typecheck, tests, artefactos de esquema y lint no
  bloqueante.
- `src/interfaces/schema.ts`: entidades generadas + relaciones/vistas.
- `src/utils/index.ts`: helpers de dinero (`parseMoneyToCents`, `centsToInput`,
  `formatMoney`, `formatMoneyWithSymbol`).

## Convenciones obligatorias

- Dinero: **integer cents** en SQLite. La UI convierte con los helpers; nunca
  guardar dólares en columnas monetarias.
- Fechas: **Unix milliseconds** para `date`, `change_date`, `applied_at` y
  `deleted_at`.
- Borrado: soft delete con `deleted_at`; el ORM y los repositorios excluyen
  filas borradas por defecto.
- Tablas: nombre lógico PascalCase, nombre físico snake_case.
- No volver a introducir handlers raw-SQL ni un segundo `useRecords`.
- Los componentes y stores deben usar repositorios; no SQL directo ni `useORM` en UI.
- Las entradas de repositorio se validan con zod y el ORM rechaza columnas
  inexistentes con errores tipados.
- `created_at` y `updated_at` se llenan con triggers; no asignarlos manualmente
  salvo que se requiera un valor histórico explícito.
- UI: los componentes nuevos van en `src/ui`; las pantallas no deben usar
  `TextInput`, `Modal`, `Alert` ni `ToastAndroid` directos. Mantener adaptadores
  legacy solo durante la migración.
- Export/import: usar validación, backup previo y transacción. No dropear tablas
  fuera de una transacción.
- Migraciones: no capturar errores internamente; deben propagarse al runner.
  Registrar la migración solo después del commit.

## Comandos de verificación

```bash
npm run typecheck
npm run test:db
npm test
npm run db:generate
npm run vendor:mermaid
npm run ci
```

`npm run db:generate` debe ejecutarse después de editar
`src/db/schema/tables.ts`. Los archivos de `src/db/schema/generated/` y
`docs/schema.md` se sobrescriben.

- `test:db`: suite de migraciones/ORM/backup con `node:sqlite`.
- `test`: Jest.
- `ci`: typecheck + tests de base de datos + Jest.
- `lint`: ESLint (`npm run lint`); forma parte de CI y debe pasar.

## Documentación

- [`docs/README.md`](docs/README.md): índice de documentación.
- [`docs/phases.md`](docs/phases.md): estado actual y fases activas.
- [`docs/budget-plan.md`](docs/budget-plan.md): plan de mejora de Presupuestos
  (Fase 7): esquema, plantillas, comparación plan/real, fijos y Mermaid.
- [`docs/schema.md`](docs/schema.md): esquema generado.
- [`docs/database.md`](docs/database.md): documentación de la base de datos.
- [`docs/legacy/phase-history.md`](docs/legacy/phase-history.md): historial de
  fases 0–3.
- [`docs/legacy/ui-history.md`](docs/legacy/ui-history.md): historial de la
  Fase 4.
- [`docs/legacy/ui-plan.md`](docs/legacy/ui-plan.md): plan de UI archivado.
- [`docs/legacy/i18n-help-plan.md`](docs/legacy/i18n-help-plan.md): plan de
  traducciones tipadas y centro de ayuda archivado.
- [`README.md`](README.md): descripción general y ejecución del proyecto.
