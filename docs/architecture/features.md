# Experiencia, flags y presets

**Cuándo leer:** al tocar navegación, visibilidad de módulos, niveles de
experiencia, captura rápida o valores recordados.
**Resumen:** PocketTool puede mostrar todos sus módulos o solo los que el usuario
necesita. Los flags son visibilidad, no datos: ocultar un módulo no borra nada ni
cambia cálculos. El mapa detallado de pantallas, componentes y hooks vive en
[`dependencies.md`](dependencies.md).
**Secciones:** Catálogo · Presets · Storage · Normalización · Navegación ·
Pantallas · Escaneo de facturas · Captura · Agregar una feature · Pruebas.

## Catálogo

| ID | Grupo | Depende de | Esencial | Equilibrado | Completo |
| --- | --- | --- | :---: | :---: | :---: |
| `summaries` | modules | — | ✅ | ✅ | ✅ |
| `fixeds` | modules | — | — | ✅ | ✅ |
| `financings` | modules | `fixeds` | — | ✅ | ✅ |
| `credits` | modules | — | — | ✅ | ✅ |
| `budget` | modules | — | — | ✅ | ✅ |
| `savings` | modules | — | — | — | ✅ |
| `vehicle` | modules | — | — | — | ✅ |
| `shopping` | modules | — | — | ✅ | ✅ |
| `closing` | modules | — | — | — | ✅ |
| `people` | modules | — | — | — | ✅ |
| `shared` | modules | `people` | — | — | ✅ |
| `charts` | advanced | — | — | ✅ | ✅ |
| `filters` | advanced | — | — | ✅ | ✅ |
| `advancedCatalogs` | advanced | — | — | — | ✅ |
| `quickAdd` | capture | — | ✅ | ✅ | — |
| `smartDefaults` | capture | — | ✅ | ✅ | — |

Siempre visibles: Inicio, Registros, Grupos, Ajustes y Ayuda. Los flags viven en
`src/features/definitions.ts`; no dupliques esta tabla en componentes.

## Presets

- **Esencial:** día a día. Registros, resumen, alta rápida y valores recordados.
- **Equilibrado:** añade compromisos, financiamientos, créditos, presupuestos,
  compras, gráficos, filtros y catálogos avanzados.
- **Completo:** todos los módulos. `quickAdd` y `smartDefaults` quedan apagados
  para conservar el formulario histórico; se activan a mano.
- **Personalizado:** el conjunto no coincide con ningún preset.

`matchPreset` compara solo módulos y opciones avanzadas; las preferencias de
captura no cambian la etiqueta del preset.

## Storage

- `experienceSettings` (AsyncStorage): `{ version: 1, presetId, enabled }`.
- `experienceOnboardedVersion` (AsyncStorage): marca de onboarding.
- `recordDefaults` (AsyncStorage): último tipo, categoría, método de pago y
  método a pagar.
- El backup exporta todas las claves de AsyncStorage y las restaura con
  `applySettings`; después llama a `useFeatures.reload()` para actualizar el
  drawer sin reiniciar.
- Si el JSON es inválido o faltan claves, se cae a `complete` sin romper el
  arranque.

## Normalización

- `normalizeFeatures` activa dependencias faltantes.
- `disableFeature` apaga el módulo y sus dependientes.
- El store aplica la función correcta según el toggle; no re-actives una
  dependencia que el usuario acaba de apagar.
- Los ajustes se reportan como `FeatureAdjustment` y la UI muestra un toast.
- Nunca se borran datos al ocultar un módulo; los vínculos existentes se
  conservan y se muestran en lectura al editar.

## Navegación

- `app/_layout.tsx` oculta entradas del drawer con `drawerItemStyle`.
- Los layouts de sección ocultan tabs con `href: null`:
  - Finanzas: `PaymentTypesScreen` y `RecordTypesScreen` dependen de
    `advancedCatalogs`.
  - Compromisos: `FinancingsScreen` depende de `financings`.
- `useFeatureRouteGuard` resuelve el segmento actual y redirige a Inicio si el
  módulo está apagado. La tabla de rutas vive en `src/features/routes.ts`.

## Pantallas

- Inicio: dashboard configurable con bloques de saldo, pendientes, presupuesto,
  ahorros, personas, recientes, créditos, vehículo y cierre; cada bloque y acción
  respeta su flag. El FAB ofrece alta de registro y acciones configuradas.
- Resumen: presupuesto, ahorros y compartidos/liquidaciones según flags; el modo
  “Compartido” se oculta si `shared` está apagado.
- Registros: filtros/orden, créditos, fijos y financiamientos según flags.
- Compras: listas globales; crear, vincular u omitir el registro de compra usa
  el grupo y los catálogos disponibles.
- Alta de registro: compartidos y origen en ahorros según flags; al editar un
  registro existente se conservan los vínculos aunque el módulo esté oculto.
- Ayuda: el hub filtra temas por feature; los temas núcleo siempre se muestran.

## Escaneo de facturas

- Solo Android; en iOS la acción se oculta y queda como deuda técnica.
- OCR en el dispositivo con `expo-mlkit-ocr`; la imagen no sale del teléfono.
- Requiere un build de desarrollo/APK; en Expo Go el import perezoso muestra un
  aviso y el resto de la app sigue funcionando.
- La revisión permite corregir nombres, precios y cantidades. La lista se crea
  cerrada, con los ítems marcados, y abre el formulario de compra con el total y
  la fecha de la factura.
- Reglas de build: cambios JS/TS de Compras usan Metro; solo los cambios de
  dependencias nativas, `app.json`, plugins o Gradle requieren prebuild + build.
  Las pruebas del parser y del repositorio no requieren build; el OCR manual se
  prueba únicamente sobre un build.
- `expo-build-properties` mantiene las reglas ProGuard de ML Kit; sin ellas R8
  elimina los registradores y el OCR falla en release.

## Captura

- `quickAdd`: muestra Tipo, Monto, Categoría, Método de pago y Fecha. “Más
  opciones” revela nombre, pago de tarjeta, compartidos, ahorro y sugerencia de
  periodo. El método de pago sigue siendo obligatorio.
- `smartDefaults`: al abrir un registro nuevo, precarga el último tipo,
  categoría, método de pago y método a pagar si siguen existiendo. Solo guarda
  valores después de un guardado correcto y nunca adivina con opciones ambiguas.
- Ninguno de los dos cambia el payload ni las validaciones de `saveRecord`.

## Agregar una feature

1. Agrega el ID a `FeatureId` y su definición en `definitions.ts` con grupo,
   dependencias y defaults por preset.
2. Agrega las claves bilingües en `src/lang/messages/features.ts`.
3. Protege la navegación en `app/_layout.tsx`, el layout de la sección o
   `useFeatureRouteGuard`.
4. Protege los bloques internos con `FeatureGate` o `useFeature`.
5. Mapea su tema de ayuda en `src/features/help.ts` si aplica.
6. Agrega pruebas de preset, dependencia y ruta.
7. Actualiza esta tabla y el plan de la fase.

## Pruebas

- `src/features/__tests__/features.test.ts`: presets, normalización y detección
  de `custom`.
- `src/features/__tests__/store.test.ts`: persistencia, recarga, dependencias y
  fallback.
- `src/features/__tests__/routes.test.ts`: segmento → feature.
- `src/features/__tests__/help.test.ts`: mapa de ayuda y temas núcleo.
- `src/hooks/__tests__/recordDefaults.test.ts`: valores válidos, inválidos y
  reset.

QA manual: instalar, elegir Esencial, reiniciar, abrir Registros, activar
Créditos, exportar/importar backup y comprobar que el drawer y la ayuda cambian
sin perder datos.
