# Fase 21 — Identidad visual y dashboard de Inicio

**Leer solo si:** necesitas el detalle de la identidad visual, el sistema de
superficies de cristal, los agrupadores, los tooltips, el dashboard de Inicio,
el editor de bloques o las acciones rápidas.
**Resumen:** plan para definir un contrato visual explícito, ampliar `src/ui` con
glassmorphism simulado, agrupadores y tooltips, y convertir Inicio en un
dashboard configurable con datos consolidados, enlaces directos y hotadd.
**Secciones:** Objetivo · Criterios · Decisiones · Diagnóstico · Identidad ·
Glass · Primitivas · Dashboard · Editor · Hotadd · Tooltips · Modelo · Dominio ·
Registros · Pruebas · i18n · Documentación · Riesgos · Verificación · Archivos ·
Estado.
**Estado:** Finalizada y archivada (2026-11-21).
**Fecha:** 2026-11-21
**Verificación:** typecheck, `test:db`, 375 tests, lint sin errores, doctor 20/20,
`docs:audit` y export Android.

## Objetivo

Convertir PocketTool en una app con identidad visual propia y coherente:

1. Contrato visual explícito de composición, jerarquía, agrupadores, glass,
   color, acciones, tooltips y accesibilidad.
2. Sistema de UI ampliado en `src/ui` con superficies glass, `SectionCard`,
   tooltips accesibles, métricas, progreso, acciones rápidas y FAB.
3. Inicio como dashboard real: saldo de consumo y caja, meta, pendientes,
   presupuesto, ahorros, personas, créditos, vehículo, cierre y últimos
   movimientos, con enlace a cada módulo.
4. Home personalizable: bloques arrastrables, visibilidad, restablecimiento y
   acciones rápidas configurables.
5. Menos texto inline: la explicación opcional vive en tooltips; solo errores,
   advertencias y validaciones quedan visibles.
6. Coherencia progresiva en las pantallas migradas.

**Fuera de alcance:** rebrand de logo/splash, web, blur real en Android, gráficos
en el Home v1 y migración simultánea de las 14 secciones.

## Criterios de aceptación

1. Existe `docs/architecture/visual-identity.md` con reglas, receta glass,
   agrupadores, política de tooltips y checklist; está enlazado desde
   `docs/README.md`, `docs/architecture/ui.md`, `src/ui/AGENTS.md` y la skill
   `pockettool-ui`.
2. `SectionCard`, `InfoHint`, `StatTile`, `ProgressBar`, `QuickAction`,
   `FloatingActions`, `SortableList` y `Surface variant='glass'` están en el
   barrel y en la galería.
3. Las pantallas migradas usan como máximo un hero, entre 2 y 5 secciones y
   ningún texto explicativo de más de ~80 caracteres inline, salvo error,
   advertencia o validación.
4. El glass usa tokens y `withAlpha`; cero colores hardcodeados en código nuevo;
   contraste AA en bright/dark y en paletas personalizadas.
5. El Home muestra al menos 6 dimensiones según flags: saldo, pendientes,
   presupuesto, ahorros, personas, créditos, vehículo, cierre y recientes.
6. Cada bloque y acción rápida enlaza a su módulo; no se navega a un módulo
   apagado; no hace falta usar drawer/tabs para las tareas principales.
7. El editor permite reordenar por drag, ocultar/mostrar, restablecer y
   configurar acciones rápidas; persiste tras reinicio e importación de backup;
   incluye subir/bajar accesible y estado vacío con restablecer.
8. El FAB tiene “Agregar registro” y hasta tres acciones opcionales; abre
   formularios existentes; no agrega lógica de dinero; no tapa contenido ni tab
   bar.
9. El texto opcional educativo se mueve a `InfoHint`; errores y advertencias
   siguen inline; trigger táctil de 44×44 y modal accesible.
10. Un solo refresco al enfocar Inicio; cada bloque consulta solo si está visible
    y su módulo está activo; sin hooks condicionales; bloques memoizados; sin
    gráficos si `charts` está apagado.
11. Pruebas de layout, registro, color, urgencia, componentes y ayuda; suites
    existentes en verde.
12. Ayuda bilingüe, documentación actualizada y `docs:audit` sin errores.

## Decisiones tomadas

| Tema | Decisión |
| --- | --- |
| Alcance | Fundaciones + Home + editor + Ajustes, Resúmenes, Registros y Compromisos/Financiamientos |
| Persistencia | AsyncStorage global, clave `dashboardLayout`, versionada |
| Glass | Cristal simulado con tokens y `LinearGradient`; sin blur real |
| Editor | Edición en Inicio con bloques compactos, drag, visibilidad y reset |
| Hotadd | FAB configurable en Inicio; registro + hasta 3 acciones |
| Bloques por defecto | Balance, Pendientes, Últimos movimientos, Presupuesto y Ahorros |
| Paleta | Se mantiene la identidad actual |
| Migración | Ninguna; no se toca `tables.ts` ni `test:db` |

Presupuesto y Ahorros se muestran por defecto solo si su flag está activo. En el
editor, un bloque de módulo apagado aparece con badge y acceso a Ajustes →
Experiencia.

## Diagnóstico

- `src/ui` tiene tokens, cuatro variantes de `Surface` y datos, pero no tiene
  glass, agrupadores, tooltips, métricas, progreso, acciones rápidas ni FAB.
- `app/index.tsx` apila cuatro `Surface` con variantes y paddings distintos; no
  enlaza a módulos y duplica el alta local.
- Texto explicativo inline: `SettingsSection.description` en más de diez
  secciones, `FormField.hint`, `InlineMessage` educativo en `add-record.tsx` y
  captions de desglose compartido en Inicio y Resúmenes.
- El guard de features redirige a Inicio si un módulo está apagado; el dashboard
  debe comprobar el flag antes de navegar.
- El backup ya exporta e importa todas las claves de AsyncStorage.
- `BudgetDraggableLines` ya implementa drag con Reanimated y GestureHandler, sin
  auto-scroll.
- Seis pantallas siguen con `useThemedStyles`.

## Identidad visual

Reglas del contrato:

1. Datos primero; decoración solo si comunica jerarquía.
2. Base 4; pantalla 16; sección 24; tarjeta 16; fila 12/8.
3. Header → hero (máx. 1) → secciones (2–5) → FAB; máximo dos niveles de
   superficie anidada.
4. Glass solo para agrupadores y hero; nunca para filas, inputs, imágenes o
   visuales de tarjeta.
5. Máximo tres niveles tipográficos por tarjeta; valor > etiqueta > metadato.
6. Solo tokens; acento como punto o barra de 3–8 px.
7. `SectionCard` con título, icono, acción, tooltip, colapso opcional y vacío.
8. Tooltips para explicación opcional, ejemplos y textos de más de una línea;
   nunca errores, advertencias, validaciones ni confirmaciones.
9. Una acción primaria por vista; captura en FAB; destructivas con confirmación.
10. Todo resumen enlaza a su detalle; sin callejones sin salida.
11. Feedback de press de 150–200 ms; sin animaciones continuas no funcionales.
12. 44×44, labels, contraste, texto escalable, alternativa a drag y reduced
    motion.
13. Anti-patrones: tarjeta dentro de tarjeta dentro de tarjeta, caption bajo cada
    valor, botón primario repetido y color hex en componentes.
14. Checklist de pantalla nueva al final del documento.

## Glass

`expo-glass-effect` existe como dependencia transitiva, pero el efecto real es
iOS 26. Para coherencia multiplataforma se usa cristal simulado:

- `withAlpha(color, alpha)` en `src/ui/theme/color.ts`, con soporte `#RGB`,
  `#RRGGBB`, `#RRGGBBAA` y fallback seguro.
- `Surface variant='glass'`: fondo `withAlpha(colors.surface, 0.68–0.78)` según
  modo, borde `withAlpha(colors.borderStrong, 0.35)`, highlight con
  `LinearGradient` sobre `withAlpha(colors.textInverse, 0.55/0.10)` y sombra
  `shadows.glass`.
- Sin tokens de color nuevos: se derivan de `surface`, `borderStrong`,
  `textInverse` y `shadow`; no se agregan entradas a Ajustes → Colores.
- No se usa glass sobre `PaymentMethodVisual` ni imágenes; en esos casos,
  superficie opaca.

## Primitivas

| Componente | Archivo | Responsabilidad |
| --- | --- | --- |
| `Surface variant='glass'` | `src/ui/primitives/Surface.tsx` | Superficie translúcida con highlight |
| `SectionCard` | `src/ui/data-display/SectionCard.tsx` | Agrupador con header, acción, tooltip y colapso |
| `InfoHint` | `src/ui/overlays/InfoHint.tsx` | Icono info y modal/bottom sheet accesible |
| `StatTile` | `src/ui/data-display/StatTile.tsx` | KPI compacto |
| `ProgressBar` | `src/ui/data-display/ProgressBar.tsx` | Progreso de meta o presupuesto |
| `QuickAction` | `src/ui/actions/QuickAction.tsx` | Acción tipo pill/tile |
| `FloatingActions` | `src/ui/actions/FloatingActions.tsx` | FAB y acciones expandibles |
| `SortableList` | `src/ui/lists/SortableList.tsx` | Drag genérico extraído de presupuestos |

`SortableList` conserva la API de `BudgetDraggableLines` y agrega botones
subir/bajar para accesibilidad.

## Dashboard de Inicio

Modelo:

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

Registro: id, labels, icono, feature, visibilidad y orden por defecto.

| Bloque | Fuente existente | Enlace | Flag |
| --- | --- | --- | --- |
| Resumen | `useResumesStore` + meta + `computeGoalProgress` | `/(summaries)` | summaries |
| Pendientes | `usePendingFixeds`, financiamientos, créditos, recordatorios | módulo de cada fila | fixeds/financings/credits/vehicle |
| Presupuesto | `useBudgetProjection` | `/(budget)` | budget |
| Ahorros | `useSavings` + `computeGoalProgress` | `/(savings)/index` | savings |
| Personas | `useSharedLedgerRepository` | `/(people)` | people/shared |
| Recientes | `useRecordsStore().records` | `/(financials)/RecordsScreen` | — |
| Créditos | `useCreditStore` + `resolvePendingPaymentDate` | `/(credits)/index` | credits |
| Vehículo | repositorios + `forecastVehicleRemindersInPeriod` | `/(vehicle)` | vehicle |
| Cierre | `useClosings` | `/(closing)` | closing |

- Cada bloque se monta solo si es visible y su feature está activa.
- `DashboardView` refresca al enfocar y comparte un `refreshKey` para recargar
  tras guardar.
- Estados por bloque: carga breve, vacío con acción y error con
  `mapDatabaseError` + toast.
- Si todos los bloques están ocultos, estado vacío con restablecer.
- Sin gráficos en v1.

## Editor

- Activación desde el header de Inicio con icono `tune`.
- Banner de edición con “Listo” y “Restablecer”.
- Bloques compactos con drag handle, ojo, subir y bajar.
- Sección “Ocultos” para volver a mostrar.
- Configuración de acciones rápidas con selección múltiple de 1–4; `record`
  siempre disponible.
- Guardado optimista al soltar o alternar; error con toast y reversión.
- `ConfirmDialog` para restablecer; FAB oculto durante edición.

## Hotadd

- FAB principal “Agregar registro”; al expandir muestra las acciones
  configuradas.
- Acciones v1: `record` → `AddItem`; `fixed` → `AddFixed`; `saving` →
  `AddSaving`; `group` → `AddGroup`.
- Ninguna acción nueva escribe dinero; se reutilizan flujos existentes.
- Posición con safe area y `bottomOffset` para futuras secciones.
- Se elimina el “+” local de la tarjeta “Hoy”.

## Tooltips

- API `InfoHint({ title, body, label })`; `FormField`, `SwitchField` y
  `SettingsSection` aceptan `tooltip`.
- Trigger de 44×44; tap abre modal bottom con título, cuerpo y cerrar.
- Se queda inline: errores, advertencias, validaciones, sugerencias accionables,
  vacíos y confirmaciones.
- Pasa a tooltip: descripciones de Ajustes, conceptos, ejemplos largos, desgloses
  compartidos opcionales y ayudas que no bloquean el guardado.
- Se reutilizan las claves existentes de descripción; el buscador de Ajustes
  sigue indexando el texto aunque no se muestre.

## Modelo y persistencia

- AsyncStorage global, clave `dashboardLayout`, JSON versionado.
- Normalización pura: ids desconocidos fuera, duplicados deduplicados, ids nuevos
  con su visibilidad por defecto, `quickActions` filtrado y `record` garantizado.
- `applySettings` en `src/db/utils/export-db.ts` recarga el store tras importar.
- No se toca `tables.ts`, `SCHEMA_VERSION`, zod, `test:db` ni `docs/schema.md`.

## Dominio

`src/domain/dashboard/obligations.ts`:

- `classifyObligationDate(date, now, horizonDays)` →
  `overdue | today | soon | later`.
- `sortObligations(items)` por urgencia y fecha.
- Sin React, formato ni colores; pruebas de hoy, vencido, próximo y nulos.
- No se duplican cálculos de saldo, presupuesto, ahorro, crédito ni cierre.

## Registros

- El dashboard es de solo lectura.
- El hotadd reutiliza `AddItem`, `AddFixed` y `AddSaving`; los dos últimos no
  mueven dinero.
- Liquidaciones y movimientos de ahorro navegan a su pantalla para elegir la
  entidad; no se abre un formulario incompleto.
- No se cambia create/link/omit, `record_id` ni transaccionalidad.
- Tras guardar se refresca el grupo y el dashboard.

## Pruebas

| Tipo | Archivo | Casos |
| --- | --- | --- |
| Color | `src/ui/theme/__tests__/color.test.ts` | hex 3/6/8, alpha, inválidos |
| Layout | `src/dashboard/__tests__/layout.test.ts` | defaults, desconocidos, duplicados, mover, ocultar, reset, versión |
| Registro | `src/dashboard/__tests__/registry.test.ts` | ids, labels en/es, features y acciones |
| Urgencia | `src/domain/dashboard/__tests__/obligations.test.ts` | hoy, vencido, próximo, orden |
| UI | `src/ui/__tests__/section-card.test.tsx` | header, acción, tooltip, colapso |
| UI | `src/ui/__tests__/info-hint.test.tsx` | abrir/cerrar, label, body |
| UI | `src/ui/__tests__/floating-actions.test.tsx` | expandir, acción, disabled |
| UI | `src/ui/__tests__/sortable-list.test.tsx` | reordenar, botones accesibles |
| Ayuda | `src/help/__tests__/registry.test.ts` | tema, paridad, pasos y relaciones |
| Backup | `scripts/db-tests.js` o prueba dedicada | layout sobrevive export/import |

## i18n y ayuda

- `dashboard.*`: title, customize, done, reset, resetConfirm, hidden,
  visible, empty, emptyAction, quickActions, quickActionsHint, dragHint, moveUp,
  moveDown, hide, show, saveError.
- `dashboard.blocks.*` y `dashboard.actions.*`.
- `common.moreInfo`.
- Tema `dashboard`, categoría `start`, icono `dashboard-customize`, relacionados
  `gettingStarted`, `records`, `summaries`, `experience`.
- Actualizar `gettingStarted` y `experience` si mencionan Inicio.

## Documentación

- `docs/architecture/visual-identity.md` y `dashboard.md` nuevos.
- Actualizar `ui.md`, `features.md`, `dependencies.md`, `docs/README.md`,
  `src/ui/AGENTS.md`, `app/AGENTS.md`, `src/lang/AGENTS.md`.
- `docs/phases.md` al cierre y archivo en `docs/legacy/`.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Contraste con paletas personalizadas | `withAlpha` y glass solo sobre background/surface |
| Android sin blur real | Cristal simulado multiplataforma |
| Drag con alturas y scroll | Edición compacta, alturas medidas y botones subir/bajar |
| Consultas excesivas | Bloques montados solo si visible y activo; refresco único |
| Datos obsoletos | `refreshGroupData` + `refreshKey` |
| Enlaces a features apagadas | Navegación que comprueba flags |
| Layout perdido al importar | Normalización y recarga en `applySettings` |
| i18n duplicado | Reutilizar claves de descripción para tooltips |
| Regresión en presupuestos | Mantener API de `BudgetDraggableLines` y QA de orden |

## Verificación

```bash
npm run typecheck
npm run test:db
npm test
npm run lint
npm run doctor
npm run docs:audit
npm run ci
```

QA visual Android/iOS, bright/dark, texto grande, lector de pantalla,
persistencia tras reinicio e importación y presets de experiencia.

## Archivos

| Área | Archivos |
| --- | --- |
| Tema | `src/ui/theme/color.ts`, `src/ui/theme/tokens.ts` |
| Primitivas | `src/ui/primitives/Surface.tsx`, `src/ui/data-display/SectionCard.tsx`, `src/ui/data-display/StatTile.tsx`, `src/ui/data-display/ProgressBar.tsx` |
| Overlays | `src/ui/overlays/InfoHint.tsx` |
| Acciones | `src/ui/actions/QuickAction.tsx`, `src/ui/actions/FloatingActions.tsx` |
| Listas | `src/ui/lists/SortableList.tsx`, `src/components/budgets/BudgetDraggableLines.tsx` |
| Dashboard | `src/dashboard/*`, `src/components/dashboard/*`, `app/index.tsx` |
| Dominio | `src/domain/dashboard/obligations.ts` |
| Pantallas | `app/(settings)/index.tsx`, `app/(summaries)/index.tsx`, `app/(financials)/RecordsScreen.tsx`, `app/(fixeds)/FinancingsScreen.tsx` |
| Formularios | `src/ui/forms/FormField.tsx`, `src/components/records/add-record.tsx`, formularios de ahorros, créditos y vehículo |
| Persistencia | `src/db/utils/export-db.ts` |
| i18n y ayuda | `src/lang/messages/home.ts`, `common.ts`, `help.ts`, `src/help/types.ts`, `src/help/registry.ts` |
| Galería | `app/gallery.tsx` |

## Estado

### Bitácora

- 2026-11-21 — Paso 1 completado: contrato visual, `withAlpha`, `Surface glass`,
  `shadows.glass`, galería y pruebas. Verificación: typecheck, 327 tests, lint sin
  errores y `docs:audit` en verde.
- 2026-11-21 — Paso 2 completado: `SectionCard`, `InfoHint`, `StatTile`,
  `ProgressBar`, `QuickAction`, `FloatingActions` y `SortableList`; barrel,
  galería, claves `moreInfo`/`expandActions`/`collapseActions` y refactor de
  `BudgetDraggableLines`. Verificación: typecheck, 340 tests, lint sin errores y
  `docs:audit` en verde.
- 2026-11-21 — Paso 3 completado: `src/dashboard` con tipos, registro, layout,
  navegación y store; dominio de urgencia; claves `dashboard.*`;
  `docs/architecture/dashboard.md` y recarga del layout tras importar backup.
  Verificación: typecheck, 373 tests, lint sin errores y `docs:audit` en verde.
- 2026-11-21 — Paso 4 completado: `DashboardScreen`, 9 bloques, navegación
  segura, FAB con acciones rápidas, tema de ayuda `dashboard`, callbacks de
  cierre/guardado en altas y mapa de dependencias actualizado. Verificación:
  typecheck, 374 tests, lint sin errores y `docs:audit` en verde.
- 2026-11-21 — Paso 5 completado: editor en Inicio con drag, ocultos,
  accesibilidad, reset confirmado, acciones rápidas y persistencia optimista con
  reversión. Verificación: typecheck, 375 tests, lint sin errores y `docs:audit`
  en verde.
- 2026-11-21 — Paso 6 completado: `SettingsSection` con `SectionCard` y tooltips,
  `FormField`/`SelectField`/`SwitchField` con tooltip, Resúmenes y
  Compromisos/Financiamientos agrupados, Registros con toolbar glass y tablas de
  fijos/registros con `AppText`/`FinanceValue`. Verificación: typecheck, 375 tests,
  lint sin errores y `docs:audit` en verde.
- 2026-11-21 — Paso 7 completado: auditoría de rutas y vistas, enlace faltante de
  Pendientes → Compromisos, ayuda bilingüe, archivo del plan, Fase 22 registrada
  para la coherencia visual restante. Verificación: `npm run ci`, lint, doctor
  20/20 y export Android.

### Pasos

- [x] Paso 1 — Contrato visual, `withAlpha`, `Surface glass`, galería y tokens de
  sombra. Completado 2026-11-21.
- [x] Paso 2 — `SectionCard`, `InfoHint`, `StatTile`, `ProgressBar`,
  `QuickAction`, `FloatingActions` y `SortableList`. Completado 2026-11-21.
- [x] Paso 3 — Registro, layout, store, dominio de urgencia y navegación.
  Completado 2026-11-21.
- [x] Paso 4 — Bloques del Home, `DashboardView` y FAB. Completado
  2026-11-21.
- [x] Paso 5 — Editor de bloques, persistencia y acciones rápidas. Completado
  2026-11-21.
- [x] Paso 6 — Migración de Ajustes, Resúmenes, Registros y Compromisos.
  Completado 2026-11-21.
- [x] Paso 7 — Ayuda, documentación, QA y verificación completa. Completado
  2026-11-21.
