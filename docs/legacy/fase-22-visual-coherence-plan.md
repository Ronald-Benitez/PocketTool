# Fase 22 — Coherencia visual restante

**Leer solo si:** necesitas el detalle de la migración visual de Presupuesto,
Créditos, Ahorros, Vehículo, Personas, Cierre, Ayuda, catálogos y tablas
internas.
**Resumen:** completar la identidad visual de PocketTool en Presupuesto,
Créditos, Ahorros, Vehículo, Personas, Cierre, Ayuda, catálogos y tablas
internas, sin cambiar lógica de dinero, esquema ni flujos de Registros.
**Secciones:** Objetivo · Criterios · Alcance · Reglas · Pasos · Archivos ·
Registros · Pruebas · Ayuda · Documentación · Riesgos · Verificación.
**Estado:** Finalizada y archivada (2026-11-22).
**Fecha:** 2026-11-21

**Verificación:** `npm run ci`, lint sin errores, doctor 20/20, `docs:audit` y
export Android; QA visual validado por el usuario.

## Objetivo

Terminar la coherencia visual iniciada en la Fase 21:

- Aplicar `SectionCard`, glass, jerarquía y tooltips a todas las pantallas
  restantes.
- Eliminar `useThemedStyles`, `ColorsStore` y `Text` nativo donde sea viable.
- Reducir texto explicativo inline sin ocultar errores, advertencias ni datos
  necesarios.
- Mantener intactas las reglas de negocio, los cálculos y la integración con
  `Records`.

## Criterios de aceptación

1. Cada pantalla usa `Screen`, `SectionCard` y como máximo un hero.
2. No quedan `useThemedStyles` ni `Text` nativo en las pantallas migradas.
3. Los colores salen de `useTheme()`; no se agregan hex en componentes.
4. Las tablas usan `AppText`/`FinanceValue` y no `formatMoney` manual.
5. Los hints largos de formularios y secciones usan `InfoHint`/`tooltip`.
6. Errores, advertencias y validaciones siguen inline.
7. No hay migración de esquema ni cambios en `Records`.
8. La ayuda bilingüe se actualiza si cambia un flujo visible.
9. `typecheck`, `test:db`, Jest, lint, doctor y `docs:audit` en verde.
10. QA visual Android/iOS en bright/dark y fuente grande.

## Alcance

| Grupo | Vistas / componentes |
| --- | --- |
| Presupuesto | `app/(budget)/index.tsx`, `templates.tsx`, `BudgetDraggableLines` si aplica |
| Créditos | `app/(credits)/index.tsx` y formularios de créditos |
| Ahorros | `app/(savings)/index.tsx`, formularios y detalles |
| Vehículo | `index`, `fuel`, `maintenance`, `reminders` |
| Personas | `app/(people)/index.tsx`, estado de cuenta y liquidación |
| Cierre | `src/components/closing/ClosingScreen.tsx` y editor |
| Ayuda | `app/(help)/index.tsx` y `HelpTopicView` (solo legibilidad) |
| Catálogos Resúmenes | `CategoriesScreen`, `PaymentMethodsScreen`, `PaymentTypesScreen` |
| Catálogos Compromisos | `RecordTypeScreen`, `PaymentMethodsScreen`, `CategoriesScreen`, `PaymentTypesScreen` |
| Catálogos Finanzas | `RecordsScreen` tabs, `CategoriesScreen`, `PaymentMethodsScreen`, `PaymentTypesScreen`, `RecordTypesScreen` |
| Tablas | `records-table`, `FixedsTable`, `FinanceTableBlock`, `FinanceTableChart` |
| Formularios | Hints largos en créditos, ahorros, vehículo, personas, cierre y presupuesto |

## Reglas

- Las reglas visuales viven en
  [`../architecture/visual-identity.md`](../architecture/visual-identity.md).
- No dupliques lógica de dominio ni de Registros: solo presentación.
- Mantén `SectionCard` con una idea por bloque; no anides más de dos superficies.
- Usa `Surface glass` solo en agrupadores/hero, no sobre visuales de tarjeta.
- Mueve a tooltip la explicación opcional; conserva inline lo accionable.
- Las tablas conservan su lógica de filtros, orden y swipe.

## Pasos

1. **Catálogos pequeños**: migrar los wrappers de Resúmenes y Compromisos a
   `Screen` + `SectionCard`; unificar los catálogos de Finanzas.
2. **Tablas**: reemplazar `Text`/`formatMoney` por `AppText`/`FinanceValue`,
   eliminar acoplamiento a `ColorsStore` y agrupar con `SectionCard`.
3. **Presupuesto y Cierre**: agrupadores, tooltips y jerarquía; no tocar los
   cálculos de saldo, obligaciones ni cobertura.
4. **Créditos**: migrar la pantalla legacy, sus formularios y el detalle de
   tarjetas.
5. **Ahorros**: agrupar resumen, metas, movimientos y formularios.
6. **Vehículo**: migrar las cuatro vistas y sus formularios.
7. **Personas y Ayuda**: agrupar ledger/saldos; mejorar legibilidad de Ayuda sin
   convertirla en tarjetas innecesarias.
8. **QA y cierre**: revisar bright/dark, fuente grande, flags, estados vacíos,
   errores y ayuda.

## Archivos

- `app/(budget)/*`, `app/(credits)/*`, `app/(savings)/*`, `app/(vehicle)/*`,
  `app/(people)/*`, `app/(help)/*`.
- `src/components/closing/*`, `src/components/credits/*`,
  `src/components/savings/*`, `src/components/vehicle/*`,
  `src/components/people/*`, `src/components/summaries/*`,
  `src/components/records/records-table.tsx`,
  `src/components/fixed/FixedsTable.tsx`.
- `src/ui` solo si aparece una primitiva reutilizable que falte.
- `src/lang/messages/*` para copy nuevo de tooltips.
- `docs/architecture/*` y `docs/README.md` si cambia el mapa.

## Registros

- La fase es de presentación: no crea, vincula ni omite `Records`.
- Cualquier formulario que ya mueve dinero conserva su repositorio y su
  transacción actuales.
- No se cambian montos, fechas, participantes ni vínculos.

## Pruebas

- `npm run typecheck`, `npm run test:db`, `npm test`, `npm run lint`,
  `npm run doctor`, `npm run docs:audit` y export Android.
- Pruebas nuevas solo para lógica pura extraída; las pantallas se validan con QA
  visual y de accesibilidad.
- Revisar `src/help/__tests__/registry.test.ts` si se agregan temas.

## Ayuda

- Actualizar los temas existentes si cambia el texto visible o el flujo.
- No crear temas nuevos salvo que aparezca una pantalla o regla nueva.
- Mantener paridad inglés/español y tres pasos por tema.

## Documentación

- `docs/architecture/visual-identity.md`: checklist y anti-patrones si se
  aprende una regla nueva.
- `docs/architecture/dependencies.md`: solo si cambian componentes por flag.
- `docs/phases.md`: estado de la fase y cierre.
- Archivar el plan en `docs/legacy/` al cerrar.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Regresión en tablas con filtros/orden | Migración visual sin tocar handlers ni dominio |
| Formularios largos con teclado | Mantener `Modal` y `scrollable`; QA en Android/iOS |
| Texto crítico escondido en tooltip | Revisar errores, advertencias y validaciones una por una |
| Pantallas grandes con muchas consultas | No cambiar hooks ni repositorios en esta fase |
| Glass sobre visuales de tarjeta | Usar `Surface` opaco en esos casos |

## Verificación

```bash
npm run typecheck
npm run test:db
npm test
npm run lint
npm run doctor
npm run docs:audit
npx expo export --platform android
```

QA manual: bright/dark, fuente grande, lector de pantalla, flags de experiencia,
estados vacíos y errores de base de datos.

## Extras aplicados

- `FormErrorSummary` unifica el error dentro de la modal (arriba) y los campos
  afectados se marcan con `error={t('required')}`.
- Aplicado a `AddItem`, `AddFixed`, `AddSaving` y `AddGroup`.

## Estado

- [x] Paso 1 — Catálogos pequeños: `CatalogSummaryScreen`, tabs de Resúmenes y
  Compromisos, catálogos de Finanzas y `RecordTypeScreen` agrupados. Completado
  2026-11-21; typecheck, 375 tests, lint sin errores y `docs:audit` en verde.
- [x] Paso 2 — Tablas internas: `RecordRow`, grupos de registros, fijos, créditos
  y financiamientos migrados; `records-table` sin `useThemedStyles` ni
  `ColorsStore`. Completado 2026-11-21; typecheck, 375 tests, lint sin errores y
  `docs:audit` en verde.
- [x] Paso 3 — Presupuesto y Cierre: plan, resumen, saldos, plantillas e
  historial de cierre agrupados; comparación esperado vs actual, selección de
  ahorros en el Home, filtros de Registros con `Button`, tabla de fijos con
  `RecordRow` y corrección del cierre de modales de alta. Completado 2026-11-21;
  typecheck, 375 tests, lint sin errores y `docs:audit` en verde.
- [x] Paso 4 — Créditos: pantalla migrada a `Screen` + `SectionCard`, resumen con
  `StatTile`, detalle por tarjeta en tooltip, `PaymentMethodVisual` conservado y
  sin `useThemedStyles` ni `Text` nativo. Completado 2026-11-21; typecheck, 375
  tests, lint sin errores y `docs:audit` en verde.
- [x] Paso 5 — Ahorros: resumen, aporte, meta e historial migrados a
  `SectionCard`; progreso con `ProgressBar`, detalles explicativos en tooltip y
  movimientos con `ListItem`. Completado 2026-11-21; typecheck, 375 tests, lint
  sin errores y `docs:audit` en verde.
- [x] Paso 6 — Vehículo: resumen, historial, combustible, mantenimiento y
  recordatorios agrupados; subtítulos a tooltip y listas con `SectionCard`.
  Completado 2026-11-21; typecheck, 375 tests, lint sin errores y `docs:audit` en
  verde.
- [x] Paso 7 — Personas y Ayuda: personas con `SectionCard` por registro, saldos
  y acciones agrupadas; validación de persona dentro de la modal. Ayuda se
  mantiene como contenido de lectura. Completado 2026-11-21; typecheck, 375
  tests, lint sin errores y `docs:audit` en verde.
- [x] Paso 8 — QA y cierre. Completado 2026-11-22.
