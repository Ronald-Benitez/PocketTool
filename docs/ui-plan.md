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

## 4. Design tokens

### Tokens estáticos

- `spacing`: 2, 4, 8, 12, 16, 24, 32, 48.
- `radii`: sm, md, lg, pill.
- `controlHeight`: sm (40), md (48), lg (56).
- `typography`: display, title, subtitle, body, label, caption, helper.
- `shadows`: none, card, floating.
- `zIndex`: base, dropdown, modal, toast.

### Tokens semánticos de color

Se construyen a partir de `useColorStore` y `ColorScheme`, agregando lo que
falte:

- `background`, `surface`, `surfaceMuted`
- `text`, `textMuted`, `textInverse`
- `border`, `focus`, `overlay`
- `primary`, `onPrimary`
- `success`, `danger`, `warning`, `info`
- `income`, `expense`, `transfer`, `goal`

`IncomeColor`, `ExpenseColor`, `TransferColor`, `GoalColor`, `InputStroke` y
`BGSimple` se mapean a tokens semánticos con fallback.

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

- Inventario y mapa de reemplazo legacy → nuevo.
- Definir tokens y `ThemeProvider`.
- Crear `src/ui/primitives` y `src/ui/index.ts`.
- Crear pantalla de galería de componentes (ruta de desarrollo).
- Agregar tests de render/variantes base.

### UI-1 — Formularios y acciones (2–3 días)

- `FormField`, `TextField`, `MoneyField`, `SelectField`, `DateField`,
  `MonthField`, `SwitchField`, `ColorField`, `Button`, `IconButton`,
  `LinkButton`.
- Adaptadores para `InputLabel`, `Input`, `BaseSelect`, `DatePicker`,
  `MonthSelector`, `PressableSwitch`, `ColorPicker2`.
- Migrar como piloto: `add-record`, `AddFixed`, `AddTemplateItem`, `add-budget`,
  `add-group`, `AddSaving`.

### UI-2 — Feedback y overlays (1–2 días)

- `ToastProvider`, `InlineMessage`, `EmptyState`, `LoadingState`,
  `ConfirmDialog`.
- `Modal`, `Dialog`, `BottomSheet`, `ModalHeader/Body/Footer`.
- Reemplazar `useToast`/`useAndroidToast`/`Alert` en pantallas.
- Migrar `ModalContainer`, `base-modal`, `confirm`, `confirm-modal`,
  `HelpModal`, `RecordsFilterModal`.

### UI-3 — Datos, tarjetas y tablas (2 días)

- `Card`, `ListItem`, `Badge`, `SwipeAction`, `FinanceValue`, `SummaryBlock`.
- Migrar `FinanceSimpleBlock`, `FinanceSmallBlock`, `FinanceTableBlock`,
  `FinanceTableChart`, `BalanceBlock`, `IndexBlock`, `BGSimpleBlock`,
  `BorderLeftBlock`, `BorderLeftButtonBlock`.
- Unificar estilos de listas, tablas y tarjetas.

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
- [ ] Todos los componentes tienen variantes documentadas y aparecen en la
  galería.
- [ ] Checklist de accesibilidad aprobado.
- [ ] Lint, typecheck y tests en verde.
- [ ] Documentación de UI actualizada.

---

## 13. Riesgos y decisiones pendientes

- **Select index-based vs value-based:** el nuevo `SelectField` será value-based;
  el adaptador legacy mantendrá el índice mientras se migra.
- **Colores personalizados:** los tokens semánticos deben respetar
  `useColorStore`; definir fallbacks y tokens nuevos en `ColorScheme`.
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

1. Aprobar catálogo y arquitectura.
2. Implementar UI-0: tokens, `ThemeProvider`, primitivas, galería.
3. Implementar UI-1 con `TextField`, `MoneyField`, `SelectField`, `Button` y
   migrar `add-record` como piloto.
4. Implementar `ToastProvider` y migrar feedback.
5. Medir resultados con checklist visual y tests antes de continuar con el resto.
