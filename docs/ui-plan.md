# Plan de mejora de UI — Sistema de componentes reutilizables

**Estado:** 📝 Planificación
**Fecha:** 2026-10-28
**Objetivo:** unificar inputs, selects, modales, botones, feedback y estilos en un
sistema de componentes con variantes, labels, errores, accesibilidad y una sola
API de toast.

---

## 1. Diagnóstico actual

Existen buenos componentes base, pero están duplicados o se usan de forma
inconsistente:

- `InputLabel` usa `placeholder` como label, no tiene `error`/`hint` y no asocia
  el label al input para accesibilidad.
- `Input` es un `TextInput` con estilos mínimos; no tiene variantes, estados de
  error, iconos ni tamaños.
- `BaseSelect` recibe opciones como `string[]` y devuelve un índice, no un valor;
  no soporta errores, disabled, loading, búsqueda ni multi-select tipado.
- `ModalContainer`, `base-modal`, `confirm`, `confirm-modal`, `HelpModal` y
  `RecordsFilterModal` resuelven overlay/acciones de formas distintas.
- `useToast` monta un `Modal` por componente y `useAndroidToast` solo funciona en
  Android; también se usan `Alert.alert` y `console.error` como feedback.
- `IconButton`, `ModalButton`, `PressableSwitch` y `SwipeItem` cubren acciones
  parcialmente; no hay un `Button` estándar con variantes y loading.
- Hay estilos hardcodeados y valores de color/espaciado repetidos; no existe una
  capa de tokens semánticos.
- El modo oscuro no está resuelto de forma integral: hay colores claros fijos y
  componentes que no respetan una paleta oscura.
- La personalización de colores actual cubre pocos tokens y no permite restaurar
  paletas base bright/dark ni editar todos los colores de la app.
- `color-picker` y `color-picker-2`, `Input`/`InputLabel`, `confirm`/
  `confirm-modal` son parejas que deberían consolidarse.
- Varias pantallas usan `TextInput`, `Modal`, `Alert` o `ToastAndroid` directo.
- Hay componentes de plantilla en `components/` (`ThemedText`, `ThemedView`,
  `ParallaxScrollView`, etc.) que no forman parte del sistema de UI de negocio.

---

## 2. Principios

1. **Un componente, una responsabilidad.** El control no decide layout de
   pantalla; la pantalla no reimplementa estados.
2. **Variantes, no estilos ad-hoc.** `variant`, `size`, `tone`, `state` en lugar
   de pasar colores y paddings desde cada pantalla.
3. **Labels y errores en el contrato.** Todo campo declara `label`, `required`,
   `hint`, `error` y `disabled`.
4. **Accesibilidad por defecto.** Label asociado, roles, estados, foco, área
   táctil mínima y anuncio de errores.
5. **Una sola fuente de feedback.** Un `ToastProvider` global y mensajes inline
   para errores de campo.
6. **Migración incremental.** Mantener adaptadores de compatibilidad para no
   romper pantallas mientras se migran.
7. **Tokens semánticos.** Los componentes usan `theme`, no colores literales.

---

## 3. Arquitectura propuesta

```text
src/ui/
  theme/
    tokens.ts          # spacing, radii, typography, sizes, shadows
    ThemeProvider.tsx  # tokens + colores personalizados del usuario
    useTheme.ts
  primitives/
    Text.tsx
    Surface.tsx
    Stack.tsx
    Divider.tsx
    Icon.tsx
  forms/
    FormField.tsx
    TextField.tsx
    MoneyField.tsx
    SelectField.tsx
    DateField.tsx
    MonthField.tsx
    SwitchField.tsx
    ColorField.tsx
  actions/
    Button.tsx
    IconButton.tsx
    LinkButton.tsx
  feedback/
    ToastProvider.tsx
    InlineMessage.tsx
    EmptyState.tsx
    LoadingState.tsx
    ConfirmDialog.tsx
  overlays/
    Modal.tsx
    Dialog.tsx
    BottomSheet.tsx
  data-display/
    Card.tsx
    ListItem.tsx
    Badge.tsx
    FinanceValue.tsx
  index.ts
```

Durante la transición, `src/components/ui/*` puede reexportar o adaptar los
componentes nuevos con una marca `@deprecated`. No se eliminan hasta terminar la
migración.

---

## 4. Tema, color y modo oscuro

### 4.1 Tokens estáticos

- `spacing`: 2, 4, 8, 12, 16, 24, 32, 48.
- `radii`: sm, md, lg, pill.
- `controlHeight`: sm (40), md (48), lg (56).
- `typography`: display, title, subtitle, body, label, caption, helper.
- `shadows`: none, card, floating.
- `zIndex`: base, dropdown, modal, toast.

### 4.2 Paletas base bright/dark

El tema parte de dos paletas base versionadas:

```text
src/ui/theme/palettes/
  bright.base.json
  dark.base.json
```

- `bright.base.json` y `dark.base.json` son los valores por defecto.
- El usuario puede editar una copia personalizada de **bright** y otra de
  **dark**.
- Cada paleta personalizada puede volver a su base con “Restaurar bright base” o
  “Restaurar dark base”, sin afectar a la otra.
- También existe “Restaurar todo” y “Usar base” por paleta.
- La app conserva la personalización del usuario entre actualizaciones; los
  tokens nuevos se agregan con su valor base si faltan.

### 4.3 Tokens semánticos de color

`ColorScheme` se amplía para cubrir todos los colores de la app. Cada token
existe en bright y dark y es editable en ajustes.

| Grupo | Tokens |
| --- | --- |
| Base | `background`, `surface`, `surfaceMuted`, `surfaceElevated`, `overlay`, `shadow` |
| Texto | `text`, `textMuted`, `textDisabled`, `textInverse`, `link` |
| Bordes/inputs | `border`, `borderStrong`, `inputStroke`, `inputBackground`, `placeholder`, `focusRing` |
| Acciones | `primary`, `primaryPressed`, `onPrimary`, `secondary`, `onSecondary`, `danger`, `onDanger`, `success`, `onSuccess`, `warning`, `onWarning`, `info`, `onInfo` |
| Finanzas | `income`, `expense`, `transfer`, `goal`, `balancePositive`, `balanceNegative`, `credit`, `saving`, `neutral` |
| Componentes | `buttonPrimaryBg/Text`, `buttonSecondaryBg/Text`, `buttonGhostText`, `modalHeaderBg/Text`, `toastSuccessBg/Text`, `toastErrorBg/Text`, `toastWarningBg/Text`, `toastInfoBg/Text`, `switchOn/Off`, `chipBg/Text`, `tableHeaderBg`, `rowAltBg`, `badgeBg/Text`, `skeleton` |

Reglas:

- Los componentes **nunca** leen `useColorStore` directo; usan `useTheme()`.
- Los estados derivados (pressed, disabled) usan opacidad o tokens calculados,
  salvo que el usuario defina un override.
- Los colores de datos financieros se usan por semántica (`income`, `expense`,
  `transfer`), no por nombre de componente.
- `InputStroke`, `BGSimple`, `IncomeColor`, `ExpenseColor`, `TransferColor` y
  `GoalColor` se migran a los nuevos tokens con fallback.

### 4.4 Modo claro/oscuro/sistema

- `ThemeProvider` expone:
  ```ts
  type ThemeMode = 'system' | 'light' | 'dark';
  const { mode, resolvedMode, colors, setMode } = useTheme();
  ```
- `mode = 'system'` usa `useColorScheme()`; `light`/`dark` fuerzan la paleta.
- El modo elegido se persiste en AsyncStorage.
- `StatusBar` y `SystemUI` se actualizan según `resolvedMode`.
- Modales, toasts, inputs, sombras, iconos y estados de error usan la paleta
  resuelta; no hay blancos/negros hardcodeados.
- Las pantallas de ajustes permiten:
  - seleccionar `Sistema`, `Claro`, `Oscuro`;
  - previsualizar la paleta bright/dark;
  - editar colores por grupo;
  - restaurar un color, una paleta completa o todas;
  - volver a la base bright/dark.

### 4.5 Persistencia y migración de colores

Se propone una versión de configuración de tema:

```ts
type ThemeSettings = {
  version: 2;
  mode: ThemeMode;
  useBase: { bright: boolean; dark: boolean };
  bright: Partial<ColorScheme>;
  dark: Partial<ColorScheme>;
};
```

- Clave AsyncStorage nueva: `themeSettings`.
- Migración desde la clave legacy `colors`:
  - los colores existentes pasan a `bright` personalizado;
  - `dark` parte de `dark.base.json`;
  - `mode` inicia en `system`.
- Los tokens faltantes se completan con la base correspondiente.
- “Restaurar todo” borra los overrides y deja `useBase` en true para ambas.
- Tests: migración legacy, merge de tokens nuevos, reset por paleta/total.

### 4.6 Accesibilidad y contraste

- Validación de contraste WCAG AA:
  - texto normal ≥ 4.5:1;
  - texto grande ≥ 3:1;
  - controles/íconos ≥ 3:1.
- Ajustes muestra advertencias de contraste, sin bloquear necesariamente.
- Los estados de error/success no dependen solo del color: incluyen icono y
  texto.
- Las paletas personalizadas se prueban en `system`, `light` y `dark`.

### 4.7 Galería de tema

La galería de componentes incluye un selector de paleta bright/dark y modo
claro/oscuro para revisar todos los estados: normal, focus, error, disabled,
loading, toast, modal y tablas.

---

## 5. Catálogo de componentes

### 5.1 Formularios

| Componente | Variantes / props clave | Estados |
| --- | --- | --- |
| `FormField` | `label`, `required`, `hint`, `error`, `disabled`, `children` | normal, error, disabled |
| `TextField` | `size`, `variant`, `leftIcon`, `rightIcon`, `multiline`, `secure`, `maxLength`, `inputMode` | normal, focus, error, disabled |
| `MoneyField` | `cents`, `onChangeCents`, `currencySymbol`, `allowNegative` | normal, focus, error, disabled |
| `SelectField` | `options: {label,value,disabled}[]`, `value`, `onChange`, `multiple`, `searchable`, `clearable` | normal, open, error, disabled |
| `DateField` | `value: TimestampMs`, `min`, `max`, `displayFormat` | normal, open, error, disabled |
| `MonthField` | `value`, `min`, `max` | normal, open, error, disabled |
| `SwitchField` | `label`, `description`, `value`, `onChange` | on/off, error, disabled |
| `ColorField` | `value`, `onChange`, `presets` | normal, open, error, disabled |

Todos los campos incluyen `testID`, `accessibilityLabel` y `onBlur` para
validación.

### 5.2 Acciones

| Componente | Variantes | Props |
| --- | --- | --- |
| `Button` | `primary`, `secondary`, `outline`, `ghost`, `danger`, `success`; `sm/md/lg` | `loading`, `disabled`, `fullWidth`, `leftIcon`, `rightIcon` |
| `IconButton` | `solid`, `ghost`, `outline`; `sm/md/lg` | `label`, `badge`, `loading`, `disabled` |
| `LinkButton` | `default`, `danger` | `onPress`, `disabled` |

Reglas:

- Un botón con acción destructiva usa `danger` + `ConfirmDialog`.
- `loading` deshabilita la acción y muestra spinner.
- El área táctil mínima es 44×44.
- Todo `IconButton` debe tener `accessibilityLabel`/`label`.

### 5.3 Feedback

- `ToastProvider` + `useToast`:
  ```ts
  const toast = useToast();
  toast.success(t('toast.added'));
  toast.error(t('toast.error'), { description });
  toast.info(message, { action: { label, onPress } });
  ```
  - Cola con máximo de toasts visibles.
  - Variantes `success`, `error`, `warning`, `info`.
  - Auto-dismiss configurable; `dismiss()` manual.
  - `accessibilityLiveRegion="polite"`/`assertive` según variante.
  - Host único en el root layout.
- `InlineMessage`: error/hint/warning debajo de un campo o bloque.
- `EmptyState`: icono, título, descripción, acción opcional.
- `LoadingState`: spinner + texto accesible.
- `ConfirmDialog`: título, descripción, confirmar/cancelar, variante danger.

### 5.4 Overlays

- `Modal`: `visible`, `onRequestClose`, `title`, `description`, `children`,
  `footer`, `size`, `scrollable`, `dismissOnBackdrop`, `showClose`.
- `Dialog`: variante centrada para confirmaciones.
- `BottomSheet`: variante inferior para selects largos y filtros.
- `ModalHeader`, `ModalBody`, `ModalFooter` internos para consistencia.
- Manejo de teclado (`KeyboardAvoidingView`), safe area y foco inicial.

### 5.5 Datos y presentación

- `Card`, `ListItem`, `Badge`, `SwipeAction`, `FinanceValue`, `SummaryBlock`.
- `FinanceValue` centraliza `formatMoney`/`formatMoneyWithSymbol` y el color
  semántico (income/expense/transfer).
- `SwipeAction` reemplaza a `SwipeItem` con acciones configurables
  (editar/eliminar) y confirmación opcional.

---

## 6. Contrato de formularios y errores

Reglas para todos los formularios:

1. La validación de dominio vive en `src/validation` (zod).
2. Los errores se mapean a `FormField.error` por campo.
3. El error se muestra inline, no solo con toast.
4. El toast se reserva para éxito, error global o acciones asíncronas.
5. Validar en `onBlur` y en submit; limpiar el error al cambiar el valor.
6. Deshabilitar submit mientras `loading`.
7. Un campo requerido muestra `*` visual y `accessibilityLabel` con “requerido”.
8. Los mensajes usan `t()` desde la pantalla, no dentro del componente.

Ejemplo:

```tsx
<TextField
  label={t('item.value')}
  required
  value={value}
  onChangeText={setValue}
  onBlur={validateAmount}
  error={errors.amount}
  hint={t('item.valueHint')}
  keyboardType="numeric"
/>
```

---

## 7. Toast: diseño y migración

### Problema actual

- `useToast` crea un `Modal` por componente.
- `useAndroidToast` solo funciona en Android.
- Hay que montar `<ToastContainer />` en cada pantalla.
- `Alert.alert` y `console.error` se usan como fallback.

### Solución

- `ToastProvider` único en `app/_layout.tsx`.
- `useToast()` global, sin `ToastContainer` por pantalla.
- Adaptadores temporales:
  - `useToast` legacy: `showToast({ message, type })` delega al provider;
    `ToastContainer` devuelve `null`.
  - `useAndroidToast` legacy: cada método delega al provider.
- Migrar pantallas gradualmente y eliminar los adaptadores al final.

---

## 8. Accesibilidad

Checklist obligatorio por componente:

- `accessibilityLabel` en labels e inputs.
- `accessibilityRole` correcto (`button`, `link`, `header`, `switch`, etc.).
- `accessibilityState` para disabled/selected/checked/busy.
- Errores anunciados con `accessibilityLiveRegion`.
- Focus visible y orden lógico en modales.
- Cerrar modal con backdrop/Escape/back según plataforma.
- Área táctil mínima 44×44.
- Contraste de texto y estados de foco.
- Soporte de fuente dinámica y textos largos.

---

## 9. Fases de implementación

### UI-0 — Fundaciones y auditoría (1–2 días)

**Estado:** ✅ Completado (2026-10-28).

- Inventario y mapa de reemplazo legacy → nuevo. ✅
- Definir tokens y `ThemeProvider`. ✅
- Crear `src/ui/primitives` y `src/ui/index.ts`. ✅
- Crear pantalla de galería de componentes (ruta de desarrollo). ✅
- Agregar tests de render/variantes base. ✅

### UI-0b — Tema, paletas y modo oscuro (2 días)

**Estado:** ✅ Completado (2026-10-28). `ToastProvider` queda en UI-2.

- Crear `bright.base.json` y `dark.base.json`. ✅
- Ampliar `ColorScheme` con todos los tokens semánticos y de componentes. ✅
- Implementar `ThemeProvider` con `system`/`light`/`dark`, persistencia y
  migración desde la clave legacy `colors`. ✅
- Implementar el editor de tema en Ajustes: ✅
  - modo sistema/claro/oscuro;
  - pestañas bright/dark;
  - edición por grupos de color;
  - restaurar color individual, paleta y todo;
  - usar base bright/dark;
  - vista previa y advertencias de contraste.
- Actualizar `StatusBar`/`SystemUI` y revisar modales, toasts e inputs en dark. ✅
- Tests de migración, reset, merge de tokens y contraste. ✅

### UI-1 — Formularios y acciones (2–3 días)

**Estado:** ✅ Completado (2026-10-28) dentro del alcance actual.

- `FormField`, `TextField`, `MoneyField`, `SelectField`, `DateField`,
  `MonthField`, `SwitchField`, `ColorField`, `Button`, `IconButton`,
  `LinkButton`, `MultiSelectField`. ✅
- Adaptadores para `InputLabel`, `Input`, `BaseSelect`, `DatePicker`,
  `MonthSelector`, `PressableSwitch`, `ColorPicker2`. ✅ (los legacy se
  eliminaron)
- Migrar como piloto: `add-group`. ✅
- Migrar: `add-record`. ✅
- Migrar: `AddFixed`, `AddTemplateItem`, `add-budget`, `AddSaving`. ✅
- Migrar selects de Ajustes, métodos de pago, grupo y ahorros. ✅
- `RecordsFilterModal` migrado en UI-2b; `BaseSelect` eliminado. ✅

### UI-2 — Feedback y overlays (1–2 días)

**Estado:** ✅ Completado (2026-10-28), con adaptadores de toast pendientes de
retirar.

- `ToastProvider`, `InlineMessage`, `EmptyState`, `LoadingState`,
  `ConfirmDialog`. ✅
- `Modal`, `Dialog`, `BottomSheet`, `ModalHeader/Body/Footer`. ✅ (header/body/
  footer integrados en `Modal`)
- Reemplazar `useToast`/`useAndroidToast`/`Alert` en pantallas. ✅
- Migrar `confirm-modal`. ✅
- Migrar `ModalContainer`, `base-modal`, `confirm`, `HelpModal`. ✅
- `RecordsModal` migrado a `Modal`. ✅
- `SwipeItem` y ahorros usan `Dialog` para eliminar. ✅
- `ColorPicker2` migrado al `Modal` compartido. ✅
- `export-db` usa toasts en lugar de `Alert`. ✅
- Eliminados los overlays legacy y componentes sin consumidores. ✅
- Teclado: `Modal` usa `KeyboardAvoidingView` (padding iOS, height Android),
  auto-scroll al input enfocado y `softwareKeyboardLayoutMode: "resize"` en
  Android. ✅

### UI-2b — Filtros tipados y reutilizables (1 día)

**Estado:** ✅ Completado (2026-10-28).

- Metadatos de columnas en `src/db/schema/metadata.ts`.
- Tipos de filtro y operadores por tipo en `src/domain/filters/types.ts`.
- Matcher y orden compartidos en `src/domain/records/filtering.ts`.
- Campos curados de Records y columnas avanzadas en
  `src/domain/records/filterFields.ts`.
- `FilterModal`, `FilterRow`, `OrderRow` y `FilterValueInput` en
  `src/ui/filters`.
- `SelectField`/`MultiSelectField` con buscador de opciones.
- `records-table` usa el filtro compartido y muestra contador de filtros.
- `RecordsModal` de Summary usa el mismo filtro sobre su detalle.
- Fechas con `DateField`, dinero con `MoneyField`, BETWEEN con dos controles,
  relaciones por id con select buscable.
- Filtros de sesión; el orden de la tabla principal sigue persistiendo.
- Tests de matcher, metadatos y campos.

### UI-3 — Datos, tarjetas y tablas (2 días)

**Estado:** 🔄 Parcial avanzado — componentes de presentación y migración de
bloques financieros principales completados.

- `Card`, `ListItem`, `Badge`, `FinanceValue`, `SummaryBlock`, `SummaryGroup`. ✅
- `FinanceValue`/`SummaryBlock` con color override y tipografía mayor. ✅
- Migrar home, Summary, fixeds, créditos y presupuestos a
  `SummaryBlock`/`SummaryGroup`/`Surface`. ✅
- `FinanceSimpleBlock`, `FinanceSmallBlock`, `BalanceBlock`, `IndexBlock`
  eliminados. ✅
- `FinanceTableBlock`/`FinanceTableChart` agrupan con `SummaryGroup`. ✅
- `SwipeAction` (renombrar/mover `SwipeItem`). ⏳
- Migrar `BGSimpleBlock` y `BorderLeftButtonBlock`. ⏳

### UI-4 — Limpieza y calidad (1–2 días)

- Eliminar componentes legacy y adaptadores.
- Regla de lint/prohibición de imports directos:
  - `TextInput`, `Modal`, `Alert`, `ToastAndroid` solo dentro de `src/ui`.
- Tests de accesibilidad y variantes.
- Galería actualizada.
- Checklist visual en iOS/Android/web.
- Actualizar `AGENTS.md`, `docs/phases.md` y `docs/schema.md` si aplica.

---

## 10. Mapa de reemplazo

| Legacy | Nuevo |
| --- | --- |
| `Input`, `InputLabel` | `TextField` + `FormField` |
| `LabelBlock` | `FormField`/`Text` |
| `BaseSelect` | `SelectField` |
| `Picker` | `SelectField` |
| `DatePicker` | `DateField` |
| `MonthSelector` | `MonthField` |
| `PressableSwitch` | `SwitchField` |
| `ColorPicker`, `ColorPicker2` | `ColorField` |
| `ModalContainer` | `Modal`/`Dialog` |
| `base-modal` | `Modal`/`BottomSheet` |
| `confirm`, `confirm-modal` | `ConfirmDialog` |
| `modal-button` | `Button` |
| `IconButton` | `IconButton` nuevo |
| `useToast`, `useAndroidToast` | `ToastProvider`/`useToast` |
| `BGSimpleBlock`, `BorderLeftBlock` | `Card`/`Surface` |
| `FinanceSimpleBlock`, `FinanceSmallBlock` | `FinanceValue`/`SummaryBlock` |
| `SwipeItem` | `SwipeAction` |
| `Dropdown` | `SelectField`/`Menu` |
| `HelpModal` | `Modal` |
| `useColorStore` directo | `useTheme` |
| `colors.json`/`colorsDark.json` | paletas base bright/dark + `ThemeProvider` |
| `ColorSettings` | editor de tema/color bright/dark |

---

## 11. Testing y calidad

- Tests de render por variante y estado (normal/focus/error/disabled/loading).
- Tests de accesibilidad: labels, roles, estados y anuncios.
- Tests de formulario: error inline, submit deshabilitado, limpieza de error.
- Tests de toast: cola, auto-dismiss, variantes, action.
- Tests de modal: apertura/cierre, backdrop, teclado, foco.
- Galería visual para revisión manual.
- `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:db`.
- Regla de CI para impedir imports directos a primitivas RN en pantallas.

---

## 12. Criterios de aceptación

- [ ] No hay `TextInput`, `Modal`, `Alert` ni `ToastAndroid` en pantallas de
  negocio; solo dentro de `src/ui`.
- [ ] Todos los formularios usan `TextField`/`SelectField`/`DateField`/
  `MoneyField` con label, required, hint y error.
- [ ] Existe un único `ToastProvider` en el root; no hay `ToastContainer` por
  pantalla.
- [ ] Todas las acciones usan `Button` o `IconButton` con variantes.
- [ ] No hay colores/espaciados hardcodeados fuera de tokens y datos dinámicos.
- [ ] El tema soporta `system`, `light` y `dark` y se persiste entre sesiones.
- [ ] Existen paletas base bright/dark y el usuario puede personalizar ambas.
- [ ] El usuario puede restaurar un color, una paleta o todas las paletas.
- [ ] Todos los colores semánticos y de componentes son editables desde Ajustes.
- [ ] La migración desde la configuración de colores anterior conserva la
  personalización existente.
- [ ] Los componentes leen colores solo vía `useTheme()`, no `useColorStore`.
- [ ] Hay advertencias de contraste y checklist visual en claro/oscuro.
- [ ] Todos los componentes tienen variantes documentadas y aparecen en la
  galería.
- [ ] Checklist de accesibilidad aprobado.
- [ ] Lint, typecheck y tests en verde.
- [ ] Documentación de UI y base de datos actualizada.

---

## 13. Riesgos y decisiones pendientes

- **Select index-based vs value-based:** el nuevo `SelectField` será value-based;
  el adaptador legacy mantendrá el índice mientras se migra.
- **Colores personalizados:** la paleta nueva debe migrar la clave legacy
  `colors` y completar tokens faltantes sin perder overrides del usuario.
- **Contraste:** una paleta personalizada puede quedar ilegible; mostrar
  advertencias y ofrecer restaurar base.
- **Base bright/dark:** las paletas base son versionadas; al agregar tokens
  nuevos se completan con el valor base de la versión actual.
- **Modo oscuro:** revisar `StatusBar`/`SystemUI`, modales, toasts, inputs,
  sombras e iconos; no asumir fondos blancos.
- **Toast sobre modales:** el host debe quedar por encima de overlays; evaluar
  `Modal` transparente con `pointerEvents="box-none"` o portal.
- **Modales y teclado:** migrar a `KeyboardAvoidingView`/safe area para evitar
  campos tapados.
- **Alcance:** no reescribir todas las pantallas de una vez; usar pilotos y
  adaptadores.
- **Componentes de plantilla** (`components/ThemedText`, etc.): decidir si se
  eliminan o se integran al theme; no forman parte del sistema de negocio.
- **Warnings de ESLint:** quedan warnings no bloqueantes; limpiarlos durante la
  migración de cada componente.

---

## 14. Próximos pasos

1. Aprobar catálogo, arquitectura y sistema de tema/color.
2. Implementar UI-0: tokens, `ThemeProvider`, primitivas, galería.
3. Implementar UI-0b: paletas base bright/dark, modo oscuro, editor de colores y
   migración de la configuración legacy.
4. Implementar UI-1 con `TextField`, `MoneyField`, `SelectField`, `Button` y
   migrar `add-record` como piloto.
5. Implementar `ToastProvider` y migrar feedback.
6. Medir resultados con checklist visual y tests antes de continuar con el resto.

---

## 15. Trabajo paralelo — documentación de base de datos

- Mantener [`database.md`](database.md) como referencia actual y concisa:
  convenciones, tablas, relaciones, migraciones, triggers, backups y acceso a
  datos.
- Mantener [`schema.md`](schema.md) como referencia generada y no editarla a
  mano.
- Conservar [`legacy/db-summary.md`](legacy/db-summary.md) solo como archivo
  histórico.
- Mantener `db.md` como puntero a `database.md`.
- Actualizar `database.md` cuando cambie una migración, un trigger, el formato
  de backup o una relación.
- No duplicar el detalle de implementación en `phases.md`; moverlo a `legacy/`
  cuando una fase termine.
- Verificar en CI que `docs/schema.md` esté actualizado con
  `npm run db:generate`.
