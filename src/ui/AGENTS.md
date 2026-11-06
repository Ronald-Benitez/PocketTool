# AGENTS.md — src/ui

Reglas locales del sistema de UI. El procedimiento completo está en la skill
`pockettool-ui` y la explicación en [`../../docs/architecture/ui.md`](../../docs/architecture/ui.md).

- Usa las primitivas de `src/ui`: `AppText`, `Surface`, `Divider`, `Screen`,
  `Stack`, `Row`, `Column`.
- Acciones: `Button`, `IconButton`, `LinkButton`, `SwipeAction`.
- Formularios: `FormField`, `TextField`, `MoneyField`, `SelectField`,
  `MultiSelectField`, `DateField`, `MonthField`, `SwitchField`, `ColorField`,
  `ColorPicker`. `SelectField` y `MultiSelectField` aceptan `searchable`.
- Overlays: `Modal` (center/bottom), `BottomSheet`, `Dialog`, `ConfirmDialog`.
  No uses `Modal` de React Native fuera de `src/ui`.
- Feedback: un único `ToastProvider`; usa `InlineMessage`, `EmptyState` y
  `LoadingState`. No crees toasts o modales locales.
- Datos: `Card`, `ListItem`, `Badge`, `FinanceValue`, `SummaryBlock`,
  `SummaryGroup`, `AccentRow`. `FinanceValue` recibe centavos.
- Filtros: `src/ui/filters/`; `RecordsFilterModal` es el wrapper de Records.
- Tema: usa `useTheme()` y tokens. No leas `useColorStore` ni claves legacy.
  `src/stores/ColorsStore.ts` es solo un adaptador de compatibilidad.
- No hardcodees colores en componentes, gráficos, Mermaid ni estilos. Un token
  nuevo se registra en `ThemeColorTokens`, `bright.base.json`, `dark.base.json`,
  `COLOR_GROUPS` y `COLOR_LABELS_ES`.
- Los gráficos deben incluir leyenda visible y tomar los colores de `useTheme()`.
- **Footer de modales:** el contenedor interno debe tener `flex: 1` cuando los
  botones usan `flex: 1`; si usas `Row`, pásale `style={{ flex: 1 }}`.
- `eslint.config.js` bloquea `TextInput`, `Modal`, `Alert` y `ToastAndroid` de
  `react-native` fuera de `src/ui`.
- El barrel público es `src/ui/index.ts`: exporta ahí todo componente nuevo.
- Todo texto visible pasa por `t()`; la ayuda se actualiza con
  `pockettool-help`.
