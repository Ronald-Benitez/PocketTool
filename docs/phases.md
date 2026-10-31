# Plan de fases

**Última actualización:** 2026-10-31

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
| Fase 8 — Vehículo | ✅ Finalizada | 2026-10-31 |

El detalle histórico de las fases 0–3 vive en
[`legacy/phase-history.md`](legacy/phase-history.md). El detalle de la Fase 4
vive en [`legacy/ui-history.md`](legacy/ui-history.md) y su plan original en
[`legacy/ui-plan.md`](legacy/ui-plan.md). Queda pendiente únicamente el checklist
visual de la Fase 4 en iOS/Android/web. Los planes de Presupuestos y Vehículo
están archivados en [`legacy/budget-plan.md`](legacy/budget-plan.md) y
[`legacy/vehicle-plan.md`](legacy/vehicle-plan.md).

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
- **Vehículo:** `Vehicles`, `VehicleFuelEntries`, `VehicleMaintenance`,
  `VehicleMaintenanceItems`, `VehicleReminders`, `VehicleSettings` y
  `VehicleExpenseLinks`; dominio de unidades, segmentos de consumo, históricos y
  recordatorios. Los gastos se crean o vinculan con `Records`.
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

## Fase 8 — Vehículo (✅ 2026-10-31)

**Plan completo:** [`legacy/vehicle-plan.md`](legacy/vehicle-plan.md)

Objetivo: publicar la sección Vehículo y convertirla en un módulo de combustible,
mantenimiento, estadísticas y recordatorios, con unidades configurables e
integración con Registros.

Estado: **Fase finalizada y validada en dispositivo**. El plan original queda
archivado como referencia histórica.

Implementado:

- **VEH-1:** migración `0007_vehicle_module`, `SCHEMA_VERSION = 7`, tablas de
  vehículos, combustible, mantenimiento, piezas, recordatorios, settings y
  vínculos de gastos. Eliminación de `fuel_refills`/`trip_logs` con conservación
  legacy.
- **VEH-2:** dominio de unidades, consumo, promedios, segmentos de tanque lleno y
  recordatorios; repositorios y vínculos transaccionales con `Records`.
- **VEH-3:** varios vehículos con predeterminado, odómetro/distancia manual,
  unidades `mi`/`km` y `gal`/`L`, cálculo del tercer valor entre volumen, precio
  y total, y ocho formatos de consumo.
- **VEH-4:** mantenimiento, piezas flexibles, cambio de aceite, recordatorios,
  reutilización de mantenimientos y creación de recordatorios con detección de
  duplicados.
- **VEH-5:** resumen, estadísticas, históricos por mes real o grupo, mejor/peor
  segmento, distancia total, combustible total, precio medio, gráficos de gasto,
  progresión y comparación combustible vs mantenimiento.
- **VEH-6:** sección publicada en el drawer, i18n bilingüe, centro de ayuda, QA
  visual Android/iOS y cierre documental.

Ajustes finales validados:

- Crear, vincular o no vincular gastos desde combustible y mantenimiento.
- Grupo del mes desde el selector global de Registros.
- Segmentos de tanque lleno con cargas parciales agrupadas con el siguiente
  tanque lleno.
- Listas ordenadas por fecha descendente.
- Recordatorios inactivos etiquetados como “Inactivo”.
- Recordatorios próximos o vencidos visibles en el inicio.
- Historial por mes real o grupo, con totales de combustible, distancia, consumo
  y precio.
- Gráficos Mermaid responsivos con scroll, zoom, límite de datos y switches para
  activar/desactivar categorías.

Decisiones y límites vigentes:

- v1 solo gasolina; eléctrico, híbrido enchufable y propano quedan para futuro.
- Web fuera del alcance de soporte.
- Los gastos sin vínculo aparecen como “Sin grupo” en el historial agrupado.

Commits principales: `d1e7e13`, `1fbb2ec`, `8e51999`, `918bf45`, `e926413`,
`2d7280b`, `a8ee207`, `099c3b4`, `5158797`, `e6069af`, `8b30c42`, `e7de4de`,
`f54963d`, `70aa777`, `6a27346`, `0f61fb2`.

Verificaciones de cierre:

- `npm run typecheck`
- `npm test` (63 tests)
- `npm run test:db`
- `npm run lint` (0 errores)
- `npx expo export --platform android`

## Documentación

- [`README.md`](README.md): índice de documentación.
- [`legacy/budget-plan.md`](legacy/budget-plan.md): plan de Presupuestos
  archivado.
- [`legacy/vehicle-plan.md`](legacy/vehicle-plan.md): plan de Vehículo (Fase 8)
  implementado y archivado.
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
