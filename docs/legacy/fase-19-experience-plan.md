# Fase 19 — Experiencia configurable y simplificación

**Cuándo leer:** al implementar o revisar los niveles de experiencia, los flags
por módulo y la simplificación de captura.
**Resumen:** plan registrado para permitir que cada usuario elija cuánta
profundidad funcional ve, con presets, flags granulares, divulgación progresiva y
automatizaciones seguras. Aún no implementado, salvo el renombrado inicial de
las tabs analíticas.
**Secciones:** [Objetivo](#objetivo) · [Criterios](#criterios-de-aceptación) ·
[Decisiones](#decisiones-aprobadas) · [Features](#features-y-presets) ·
[Gating](#gating-por-sección) · [Persistencia](#persistencia-y-backup) ·
[UI](#ui-de-ajustes) · [Captura](#alta-rápida-y-valores-recordados) ·
[Registros](#registros-decisión) · [Archivos](#archivos) · [Pruebas](#pruebas) ·
[Ayuda](#ayuda-e-i18n) · [Documentación](#documentación) · [Riesgos](#riesgos) ·
[Verificación](#verificación) · [Fases](#fases-de-ejecución)
**Estado:** Finalizada y archivada (2026-11-20).
**Fecha:** 2026-11-20

## Objetivo

Permitir que cada usuario ajuste cuánta profundidad funcional ve en PocketTool
sin perder datos ni capacidades:

- Tres niveles de experiencia: Esencial, Equilibrado y Completo.
- Ajuste granular por módulo y por flujo.
- Divulgación progresiva dentro de formularios y pantallas.
- Automatizaciones seguras que reducen pasos sin mover dinero solo.
- Reversibilidad total: ocultar no borra, no cambia cálculos y no impide
  reactivar.

## Criterios de aceptación

1. Cambiar de preset actualiza drawer y tabs en la misma sesión.
2. La elección persiste tras reiniciar.
3. `Completo` reproduce la navegación y el formulario actuales; alta rápida y
   valores recordados quedan opt-in.
4. Los usuarios existentes ven el onboarding una vez con Completo preseleccionado.
5. Las dependencias se normalizan: Financiamientos ↔ Compromisos; Compartidos ↔
   Personas.
6. Un enlace profundo a un módulo oculto redirige y explica por qué.
7. Ocultar no borra ni muta datos; los vínculos existentes se muestran en lectura.
8. Esencial reduce el alta a cinco campos visibles y guarda el mismo payload.
9. Los valores recordados solo rellenan; nunca guardan sin confirmación.
10. El backup incluye `experienceSettings` y al importar se aplica sin reiniciar.
11. Las tabs analíticas de Resumen y Compromisos se conservan; solo cambian de
    nombre para distinguirlas de la gestión de catálogos.
12. Todo texto es bilingüe, la ayuda se actualiza y el hub respeta los módulos
    activos.
13. Pasan `typecheck`, `test`, `test:db`, `lint`, `docs:audit` y `ci`.

## Decisiones aprobadas

- Onboarding único con Completo preseleccionado; si se cierra, queda Completo.
- El ocultamiento cubre navegación y bloques avanzados dentro de pantallas, no
  cálculos ni datos.
- Alta rápida y valores recordados van en esta misma fase, como capa separada y
  desactivable.
- No se eliminan las tabs de catálogos de Resumen ni de Compromisos: son vistas
  analíticas prefiltradas, no gestión. Se renombran para evitar confusión.
- La configuración se guarda en AsyncStorage y viaja en el backup existente.

## Features y presets

| ID | Controla | Esencial | Equilibrado | Completo |
| --- | --- | :---: | :---: | :---: |
| `summaries` | Sección Resumen y sus tabs analíticas | ✅ | ✅ | ✅ |
| `fixeds` | Compromisos, fijos pendientes y sus tabs | — | ✅ | ✅ |
| `financings` | Financiamientos (depende de `fixeds`) | — | ✅ | ✅ |
| `credits` | Créditos, tarjetas y fechas pendientes | — | ✅ | ✅ |
| `budget` | Presupuestos y plantillas | — | ✅ | ✅ |
| `charts` | Gráficos y preferencias | — | ✅ | ✅ |
| `filters` | Filtros, columnas avanzadas y orden | — | ✅ | ✅ |
| `savings` | Ahorros y metas | — | — | ✅ |
| `vehicle` | Vehículo | — | — | ✅ |
| `closing` | Cierre de periodo | — | — | ✅ |
| `people` | Personas y estado de cuenta | — | — | ✅ |
| `shared` | Compras compartidas (depende de `people`) | — | — | ✅ |
| `advancedCatalogs` | Tipos de pago/registro en Finanzas y su configuración | — | — | ✅ |
| `quickAdd` | Alta rápida | ✅ | ✅ | — |
| `smartDefaults` | Recordar último tipo/categoría/pago | ✅ | ✅ | — |

Siempre visibles: Inicio, Registros, Grupos, Ajustes y Ayuda.

Dependencias:

- Activar `financings` activa `fixeds`.
- Desactivar `fixeds` desactiva `financings` y avisa.
- Activar `shared` activa `people`.
- Desactivar `people` desactiva `shared` y avisa.
- La normalización es una función pura e iterativa.

Detección de preset:

- Se compara por módulos y opciones avanzadas (`filters`, `charts`,
  `advancedCatalogs`).
- `quickAdd` y `smartDefaults` son preferencias de captura y no cambian la
  etiqueta.
- Si el conjunto no coincide, se muestra “Personalizado”.

## Gating por sección

| Ubicación | Regla |
| --- | --- |
| Drawer `(summaries)` | Visible si `summaries`. |
| Drawer `(fixeds)` | Visible si `fixeds`. |
| Drawer `(credits)` | Visible si `credits`. |
| Drawer `(savings)` | Visible si `savings`. |
| Drawer `(budget)` | Visible si `budget`. |
| Drawer `(vehicle)` | Visible si `vehicle`. |
| Drawer `(closing)` | Visible si `closing`. |
| Drawer `(people)` | Visible si `people`. |
| Drawer `(financials)` | Siempre visible. |
| Tab `FinancingsScreen` en Compromisos | Visible si `financings`. |
| Tabs analíticas de Resumen | Siempre dentro de Resumen. |
| Tabs analíticas de Compromisos | Siempre dentro de Compromisos. |
| `PaymentTypes` y `RecordTypes` en Finanzas | Visibles si `advancedCatalogs`. |
| `Categories` y `PaymentMethods` en Finanzas | Siempre visibles. |
| Settings → Records/tipos | Visible si `advancedCatalogs`. |
| Settings → Créditos (fechas) | Visible si `credits`. |
| Settings → Compromisos (fechas/dedupe) | Visible si `fixeds`. |
| Settings → Cierre | Visible si `closing`. |
| Settings → Ahorros | Visible si `savings`. |
| Settings → Vehículo | Visible si `vehicle`. |
| Settings → General, Experiencia, Grupos, Backup, Colores | Siempre visibles. |

Dentro de pantallas:

- Inicio: fijos pendientes si `fixeds`; financiamientos si `financings`.
- Resumen: presupuesto si `budget`; ahorros si `savings`; liquidaciones y modo
  “Compartido” si `shared`.
- Registros: filtros y orden si `filters`; opciones de créditos/fijos/
  financiamientos según su feature.
- Alta de registro: compartidos si `shared`; origen en ahorros si `savings`.
- Gráficos: `FeatureGate feature='charts'` en las tarjetas.

Renombrado inicial ya aplicado en layouts:

- Resumen: “Por método de pago”, “Por categoría”, “Por tipo de pago”.
- Compromisos: “Por tipo de registro”, “Por método de pago”, “Por categoría”,
  “Por tipo de pago”.
- Finanzas conserva “Métodos de pago”, “Categorías”, “Tipos de pago” y “Tipos de
  registro” para la gestión.

## Persistencia y backup

- Clave `experienceSettings`, JSON versionado:
  `{ version: 1, presetId, enabled }`.
- Clave `experienceOnboardedVersion` para el onboarding.
- `collectSettings()` ya exporta todas las claves de AsyncStorage; no requiere
  cambios.
- `applySettings()` en `src/db/utils/export-db.ts` debe llamar a
  `useFeatures.getState().reload()` después de `multiSet`.
- El store expone `reload()` idempotente y actualiza el drawer sin reiniciar.
- Fallback: JSON corrupto, clave ausente o IDs desconocidos → Completo.
- `scripts/db-tests.js` agrega `experienceSettings` al test de settings del
  backup.
- `docs/database.md` documenta que el backup incluye la experiencia.

Onboarding:

- Se muestra solo si faltan `experienceOnboardedVersion` y
  `experienceSettings`.
- Si hay novedades pendientes de “Qué hay de nuevo”, se pospone para evitar dos
  modales seguidos.
- Si el usuario elige un preset se guardan ambas claves; si cierra, se guarda
  Completo y la marca.

## UI de Ajustes

Nueva sección **Experiencia**, primera y abierta por defecto:

- Tres `ListItem` seleccionables: Esencial, Equilibrado y Completo.
- `InlineMessage`: “Ocultar un módulo nunca borra tus datos”.
- “Personalizar módulos” con `SwitchField` agrupados:
  - Día a día: Resumen, Compromisos, Créditos, Presupuestos.
  - Dinero: Ahorros, Personas, Compartidos.
  - Herramientas: Vehículo, Cierre, Filtros, Gráficos, Catálogos avanzados.
  - Captura: Alta rápida, Recordar últimos valores.
- “Restaurar Completo” con `ConfirmDialog`.
- `Toast` al ajustar dependencias automáticamente.
- `ListItem` recibe `accessibilityRole` y `accessibilityState` opcionales para
  anunciar los presets como radio.

## Alta rápida y valores recordados

Alta rápida:

- Campos visibles: Tipo, Monto, Categoría, Método de pago y Fecha.
- Bajo “Más opciones”: Nombre, pago de tarjeta, participantes/pagador, origen en
  ahorros y sugerencia de periodo.
- Si no hay método por defecto, se muestra siempre.
- Se extiende `AddItem` con modo compacto; el guardado sigue siendo `onSave`.

Valores recordados:

- Hook `useRecordDefaults` con AsyncStorage.
- Recuerda último tipo por efecto, última categoría por tipo, último método de
  pago y último método a pagar.
- Solo aplica a registros nuevos.
- Descarta IDs inexistentes y no adivina con opciones ambiguas.
- Se actualiza solo tras guardar correctamente.

## Registros: decisión

- Flags y presets no aplican: no crean, vinculan ni omiten `Records`.
- Alta rápida solo simplifica la UI; usa `saveRecord` y las mismas validaciones.
- Editar con módulos ocultos conserva `saving_id`, participantes y pagador.
- Borrado sin cambios.
- Pruebas: payload idéntico, edición sin pérdida de vínculos y sin registros
  adicionales.

## Archivos

Nuevos:

- `src/features/types.ts`
- `src/features/definitions.ts`
- `src/features/normalize.ts`
- `src/features/store.ts`
- `src/features/FeatureProvider.tsx`
- `src/features/FeatureGate.tsx`
- `src/features/useFeatureRouteGuard.ts`
- `src/features/help.ts`
- `src/features/index.ts`
- `src/features/__tests__/features.test.ts`
- `src/features/__tests__/store.test.ts`
- `src/features/__tests__/routes.test.ts`
- `src/hooks/useRecordDefaults.ts`
- `src/hooks/__tests__/recordDefaults.test.ts`
- `src/components/settings/ExperienceSettings.tsx`
- `src/components/features/ExperienceOnboardingModal.tsx`
- `src/lang/messages/features.ts`
- `docs/architecture/features.md`

Modificados: los descubre `git diff` al implementar. Los principales son
`app/_layout.tsx`, `app/(settings)/index.tsx`, los `_layout.tsx` de las secciones
afectadas, `add-record.tsx`, `records-table.tsx`, `export-db.ts`, los mensajes de
i18n/ayuda y la documentación de la fase.

## Pruebas

- Presets: membresía exacta y detección de `custom`.
- Normalización: dependencias directas y transitivas; ajustes reportados.
- Store: carga sin datos, persistencia, recarga tras backup, JSON corrupto e IDs
  desconocidos.
- Rutas: segmento → feature, redirección a Inicio o a la primera tab.
- Ayuda: todo `HelpTopicId` mapeado existe; temas núcleo siempre visibles.
- Defaults de captura: valor válido, eliminado, método ambiguo y edición intacta.
- Backup: `createBackupSql` conserva `experienceSettings`; el store lo relee.
- UI opcional: `ExperienceSettings` muestra presets y estados accesibles.
- `test:db` completo para confirmar que no hay regresión de esquema.

## Ayuda e i18n

- Nuevo tema `help.topics.experience` con tres pasos, ejemplo, tips y warning.
- Categoría `tools`, icono `tune`, relacionados `gettingStarted`, `records` y
  `theme`.
- Nuevas claves en `features.ts` para presets, módulos, dependencias, onboarding
  y avisos.
- El hub filtra por feature; los temas núcleo siempre se muestran.
- `HelpTopicView` filtra relacionados para no ofrecer enlaces ocultos.

## Documentación

- `docs/architecture/features.md`: IDs, presets, dependencias, storage, gating,
  backup, alta rápida y cómo agregar una feature.
- `docs/README.md`: índice del plan y de la arquitectura.
- `docs/phases.md`: fase 19 y decisiones vigentes al cerrar.
- `docs/database.md`: el backup incluye la experiencia y se recarga al importar.
- `AGENTS.md`: fila “Experiencia, flags y presets”.
- `docs/legacy/fase-19-experience-plan.md`: archivo histórico al cerrar.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El usuario cree que perdió datos | Default Completo, aviso, nunca borrar, lectura de vínculos. |
| Etiquetas nuevas confunden | Solo cambia el título de tabs analíticas; se anuncia en notas. |
| Importar backup no refresca el drawer | `reload()` en `applySettings` y prueba. |
| Dos modales seguidos | Onboarding se pospone si hay novedades pendientes. |
| Módulos ocultos inaccesibles | Panel Experiencia lista todos con switches. |
| Flags rompen edición de registros | Conservar valores y probar edición con módulos ocultos. |
| Defaults de captura eligen mal | Solo recordar uso explícito; no adivinar; permitir cambiar. |
| Ajustes sigue siendo largo | Split de secciones, búsqueda y colapsables. |
| Accesibilidad de presets | Rol radio, estado checked, 44 px y texto descriptivo. |
| Explosión de combinaciones en pruebas | Probar presets y normalización, no 2^N. |

## Verificación

```bash
npm run typecheck
npm test
npm run test:db
npm run lint
npm run docs:audit
npm run ci
```

Manual:

- Instalación nueva → onboarding → Esencial → drawer reducido → alta rápida →
  reinicio → persiste.
- Usuario con datos → Completo → Esencial → editar registro con ahorro o
  compartido → no se pierde el vínculo → volver a Completo.
- Exportar backup en Esencial → importar en otra instalación → drawer en Esencial
  sin reiniciar.
- Desactivar Personas → Compartidos se apaga; reactivar Compartidos → Personas
  se enciende.
- Enlace profundo a tab oculta → redirección.
- Claro/oscuro, inglés/español, fuente grande y pantalla pequeña.

## Fases de ejecución

| Fase | Contenido | Estado |
| --- | --- | --- |
| A — Núcleo | `src/features/*`, store, normalización, provider, guarda de rutas, backup reload y pruebas. | ✅ |
| B — Navegación y Ajustes | Drawer, tabs, Experiencia, onboarding, split de Ajustes, etiquetas y ayuda. | ✅ |
| C — Captura | Alta rápida, valores recordados y gating dentro de Inicio/Resumen/Registros. | ✅ |
| D — Cierre | i18n final, documentación, notas de versión, QA y verificación completa. | ✅ |

## Estado del renombrado

Aplicado en esta entrega:

- `src/lang/messages/headers.ts`: claves `byCategory`, `byPaymentMethod`,
  `byPaymentType` y `byRecordType` en inglés y español.
- `app/(summaries)/_layout.tsx`: tabs analíticas con los nuevos títulos.
- `app/(fixeds)/_layout.tsx`: tabs analíticas con los nuevos títulos y
  `RecordTypeScreen` deja de mostrar “Resumen”.
- La gestión de catálogos en `app/(financials)/_layout.tsx` conserva sus títulos.
- `src/lang/messages/summaries.ts`: corregido “Resumen por categorias” a
  “Resumen por categorías”.

## Resultado del cierre

- Fase 19 marcada como finalizada el 2026-11-20.
- Mapa de dependencias en [`../architecture/dependencies.md`](../architecture/dependencies.md)
  y guía de features en [`../architecture/features.md`](../architecture/features.md).
- Commits principales: `41b0902` (núcleo y captura), `612165c` (alineación de
  flags con dependencias), `62df1fb` (backup de `experienceSettings`).
- Verificación: `typecheck`, `test:db`, 300 tests, lint, `doctor` 20/20,
  `docs:audit`, `ci` y export Android.
- Las notas de versión de `4.0.8` se gestionan por separado con
  `/notas-version 4.0.8`.
