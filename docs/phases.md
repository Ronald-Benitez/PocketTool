# Plan de fases

**Última actualización:** 2026-10-30

## Estado

| Fase | Estado | Fecha |
| --- | --- | --- |
| Fase 0 — Correcciones críticas | ✅ Finalizada | 2026-10-28 |
| Fase 1 — Fuente única de verdad del esquema | ✅ Finalizada | 2026-10-28 |
| Fase 2 — Repositorios y ORM robusto | ✅ Finalizada | 2026-10-28 |
| Fase 3 — Calidad, pruebas y operación | ✅ Finalizada | 2026-10-28 |
| Fase 4 — Sistema de UI reutilizable | ✅ Finalizada | 2026-10-29 |
| Fase 5 — Traducciones tipadas | ✅ Finalizada | 2026-10-29 |
| Fase 6 — Centro de ayuda | ✅ Finalizada | 2026-10-29 |
| Fase 7 — Presupuestos | ✅ Finalizada | 2026-10-29 |
| Fase 8 — Vehículo | 🚧 En implementación | 2026-10-30 |

El detalle histórico de las fases 0–3 vive en
[`legacy/phase-history.md`](legacy/phase-history.md). El detalle de la Fase 4
vive en [`legacy/ui-history.md`](legacy/ui-history.md) y su plan original en
[`legacy/ui-plan.md`](legacy/ui-plan.md). Queda pendiente únicamente el checklist
visual de la Fase 4 en iOS/Android/web.

## Arquitectura actual (resumen)

- **Esquema:** `src/db/schema/tables.ts` es la fuente única; los artefactos de
  `src/db/schema/generated/` y `docs/schema.md` se generan con
  `npm run db:generate`.
- **Dinero/fechas:** centavos enteros y timestamps Unix en milisegundos.
- **Auditoría:** `created_at`/`updated_at` se llenan con triggers; soft delete
  con `deleted_at`.
- **Migraciones:** `0001_baseline`, `0002_audit_timestamps`,
  `0003_timestamp_triggers`, `0004_budget_plans`,
  `0005_drop_budget_legacy`, `0006_drop_budget_plan_status`,
  `0007_vehicle_module`; `SCHEMA_VERSION = 7`.
- **Presupuestos:** `BudgetPlans` (un plan por grupo), `BudgetLines` (categoría
  o fijo) y plantillas reutilizables. El real se deriva de `Records`; no se
  guarda. `budgets_legacy` se elimina en `0005`.
- **Gráficos:** `src/ui/charts/MermaidChart.tsx` renderiza Mermaid vendorizado
  en WebView, sin CDN, con tema y fallback a tabla.
- **Acceso a datos:** ORM tipado + repositorios. La UI no usa `useORM` ni SQL.
- **Backups:** dump SQL con cabecera de metadatos y compatibilidad legacy.
- **Calidad:** `test:db` con `node:sqlite`, Jest, typecheck, lint bloqueante y
  CI en `.github/workflows/ci.yml`.
- **UI:** `src/ui/` contiene el sistema de componentes, tema y filtros.
  `src/components/ui` fue retirado; los resúmenes viven en
  `src/components/summaries` y los estilos legacy se adaptan con
  `src/styles/useThemedStyles.ts`.
- **Idiomas:** `src/lang/messages/` es la fuente de verdad, con inglés y español
  co-localizados por dominio. `t()` se tipa con `TranslationKey` y permite
  autocompletado. No quedan JSON de traducciones.
- **Ayuda:** `src/help/registry.ts` define los temas y
  `src/lang/messages/help.ts` el contenido bilingüe. Ver `AGENTS.md` para el
  mantenimiento.

## Fase 4 — Sistema de UI reutilizable (✅ 2026-10-29)

Se implementó:

- Tokens, paletas bright/dark, `ThemeProvider`, modo `system`/`light`/`dark` y
  editor de colores.
- Primitivas, acciones, formularios, overlays, feedback, filtros y componentes
  de datos en `src/ui`.
- Migración de formularios, selects, modales, toasts y listas principales.
- Filtros tipados y reutilizables para Records y Summary.
- Limpieza de componentes legacy y regla de lint para primitivas nativas.

Pendiente de QA: checklist visual en iOS/Android/web. El detalle y los commits
están en [`legacy/ui-history.md`](legacy/ui-history.md).

## Fase 5 — Traducciones tipadas (✅ 2026-10-29)

**Documento de referencia:** [`legacy/i18n-help-plan.md`](legacy/i18n-help-plan.md)

Implementado:

- `src/lang/messages/` con dominios bilingües co-localizados.
- `MessageShape` para validar paridad entre `en` y `es`.
- `TranslationKey` tipado y `t()` con autocompletado, interpolación y fallback.
- Helpers para claves dinámicas (`monthKey`, `dayShortKey`, etc.).
- `LanguageContext` sin `any` y con `useLanguage()` tipado.
- Eliminados `en.json`, `es.json`, `records-filters.*.json` y
  `src/interfaces/lang.ts`.
- Tests en `src/lang/__tests__/messages.test.ts`.

## Fase 6 — Centro de ayuda (✅ 2026-10-29)

**Documento de referencia:** [`legacy/i18n-help-plan.md`](legacy/i18n-help-plan.md)

Implementado:

- Hub con búsqueda y detalle maestro-detalle en `app/(help)/index.tsx`.
- `HelpTopicView` con secciones: qué es, cómo funciona, pasos, ejemplo, consejos
  y error común.
- `src/help/registry.ts` con 10 temas y relaciones.
- Contenido bilingüe en `src/lang/messages/help.ts`.
- Búsqueda normalizada por título, resumen, secciones y pasos.
- Tests en `src/help/__tests__/registry.test.ts`.
- Instrucciones de mantenimiento en `AGENTS.md`.

## Fase 7 — Presupuestos (✅ 2026-10-29)

**Plan completo:** [`legacy/budget-plan.md`](legacy/budget-plan.md)

Objetivo: terminar y publicar la sección de Presupuestos con un plan mensual
comparado contra los registros reales, plantillas reutilizables, integración con
resúmenes y transacciones fijas, y gráficos Mermaid renderizados en WebView.

Implementado:

- **BUD-0/1:** `BudgetPlans`, `BudgetLines`, plantillas ampliadas, migraciones
  `0004`–`0006`, `SCHEMA_VERSION = 6`, zod y artefactos regenerados. Se eliminó
  el estado de plan y `budgets_legacy`.
- **BUD-2:** `src/domain/budgets` y `src/domain/summaries` con reglas
  compartidas de gasto, comparación, proyección, insights y builders Mermaid;
  `useBudgetPlansRepository` y `useBudgetTemplatesRepository`;
  `BudgetPlanView`.
- **BUD-3:** pantallas de plantillas, editor de líneas, aplicar
  `merge`/`replace`/`reset`, guardar plan como plantilla, copiar mes anterior,
  crear desde fijos, desde gastos actuales y desde la media de grupos
  seleccionables.
- **BUD-4:** pantalla principal de Presupuestos con `StackBase`, editor de plan,
  eliminación de plan para recrearlo, líneas con detalle de registros, sección
  de fijos (incluidos inactivos), sin planificar y estados; bloque “Plan vs.
  real” en Resúmenes.
- **BUD-5:** `react-native-webview` + Mermaid 11 vendorizado offline,
  `MermaidChart`, tema, accesibilidad, modos de gráfico (comparación, salud,
  distribución y proyección) y fallback a tabla.
- **BUD-6:** ruta publicada en el drawer, i18n `budget`, ayuda `budgets` +
  `budgetTemplates`, documentación y pruebas.

Estado: **Fase finalizada**. QA visual validado en dispositivo, Mermaid
funcional e import/export sin impacto porque la versión en producción usa el
esquema anterior a Presupuestos. Web queda fuera de alcance por decisión de
producto.

Criterios de aceptación principales:

- un plan por grupo y líneas sin duplicados;
- comparación plan/real consistente con resúmenes;
- plantillas aplicables y reutilizables;
- fijos pendientes/confirmados integrados;
- Mermaid offline con tema claro/oscuro y fallback;
- migración preservando datos;
- `npm run ci` y `npm run lint` en verde;
- ayuda y traducciones actualizadas.

## Fase 8 — Vehículo (🚧 En implementación, 2026-10-30)

**Plan completo:** [`vehicle-plan.md`](vehicle-plan.md)

Objetivo: publicar la sección Vehículo y convertirla en un módulo de combustible,
mantenimiento, estadísticas y recordatorios, con unidades configurables e
integración con Registros.

Implementado hasta ahora:

- Esquema `0007_vehicle_module` y `SCHEMA_VERSION = 7`.
- Tablas de vehículos, combustible, mantenimiento, piezas, recordatorios,
  settings y vínculos de gastos.
- Eliminación de `fuel_refills`/`trip_logs` con conservación legacy si tienen
  datos.
- Dominio de unidades, consumo, promedios y recordatorios.
- Repositorios de vehículo, combustible, mantenimiento, recordatorios, settings
  y vínculos con `Records`.
- UI inicial con tabs de resumen, combustible, mantenimiento y recordatorios.
- Crear gasto, vincular gasto existente o no vincular.
- Categorías de vehículo en Ajustes.

Pendiente:

- QA visual Android/iOS y claro/oscuro.
- Gráficos de vehículo y comparativas.
- Ajustes finos del formulario y textos largos.
- Documentación de cierre y pruebas manuales.

Alcance planificado:

- `Vehicles`, `VehicleFuelEntries`, `VehicleMaintenance`,
  `VehicleMaintenanceItems`, `VehicleReminders`, `VehicleSettings` y
  `VehicleExpenseLinks`.
- Eliminación de `FuelRefills` y `TripLogs` (sin datos de usuarios) y migración
  `0007_vehicle_module`.
- Varios vehículos con predeterminado; odómetro real, distancia alternativa e
  inferencia en ambos sentidos; unidades `mi`/`km` y `gal`/`L`.
- Cálculo automático del tercero entre volumen, precio por unidad y total.
- Consumo en `mi/gal`, `km/gal`, `mi/L`, `km/L`, `L/100 km`, `gal/100 km`,
  `L/60 mi` y `gal/60 mi`, costo por milla/km y promedios.
- Tanque lleno por defecto, cargas parciales acumuladas y modo estimado.
- Mantenimiento, piezas flexibles, cambio de aceite y recordatorios inferidos.
- Categorías configurables desde Ajustes; al guardar se puede crear un gasto,
  vincular un gasto existente o no vincular; si falta el grupo del mes se alerta
  y se permite guardar sin gasto.
- Integración transaccional con `Records` y vínculo único mediante
  `VehicleExpenseLinks`.
- Dashboard, históricos, comparativas y gráficos Mermaid con leyenda.
- v1 solo gasolina; eléctrico, híbrido enchufable y propano quedan para futuro.
- i18n, ayuda y QA.

Subfases:

- **VEH-0:** validación del plan y decisiones de alcance.
- **VEH-1:** esquema, migración, dominio de unidades/cálculos y tests.
- **VEH-2:** repositorios e integración con Registros.
- **VEH-3:** vehículos y combustible.
- **VEH-4:** mantenimiento, piezas y recordatorios.
- **VEH-5:** estadísticas, comparativas y gráficos.
- **VEH-6:** publicación en drawer, i18n, ayuda, docs y QA.

## Documentación

- [`README.md`](README.md): índice de documentación.
- [`vehicle-plan.md`](vehicle-plan.md): plan de Vehículo (Fase 8).
- [`legacy/budget-plan.md`](legacy/budget-plan.md): plan de Presupuestos
  archivado.
- [`database.md`](database.md): documentación actual de la base de datos.
- [`schema.md`](schema.md): esquema generado.
- [`legacy/i18n-help-plan.md`](legacy/i18n-help-plan.md): plan de traducciones y
  ayuda archivado.
- [`legacy/phase-history.md`](legacy/phase-history.md): historial de fases 0–3.
- [`legacy/ui-history.md`](legacy/ui-history.md): historial de la Fase 4.
- [`legacy/ui-plan.md`](legacy/ui-plan.md): plan original de UI archivado.
- [`legacy/db-summary.md`](legacy/db-summary.md): resumen anterior de base de
  datos.
- [`../AGENTS.md`](../AGENTS.md): instrucciones para agentes.

## Decisiones vigentes

- Tablas lógicas PascalCase, nombres físicos y columnas snake_case.
- Dinero en centavos; fechas en milisegundos.
- Soft delete por defecto; el ORM filtra borrados.
- Migraciones en transacción exclusiva y registro posterior al commit.
- Repositorios como única puerta de acceso desde stores/pantallas.
- Backups con metadatos versionados y compatibilidad con dumps SQL antiguos.
- Lint bloqueante; CI ejecuta typecheck, artefactos, tests y lint.
- La UI nueva usa `src/ui`; los estilos legacy se adaptan con
  `useThemedStyles`.
