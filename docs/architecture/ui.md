# Arquitectura de UI

**Cuándo leer:** al crear o modificar pantallas, componentes, tema, formularios,
modales, filtros o gráficos.
**Resumen:** PocketTool usa un sistema propio en `src/ui`, con tokens, tema
claro/oscuro, primitivas, acciones, formularios, overlays, feedback y filtros.
**Skill:** `pockettool-ui`.

## Tema y tokens

- `src/ui/theme/tokens.ts`: espaciado, radios, alturas, tipografía, sombras y
  z-index.
- `src/ui/theme/palettes/bright.base.json` y `dark.base.json`: paletas base
  versionadas. No edites valores base sin actualizar las pruebas de contraste.
- `src/ui/theme/ThemeProvider.tsx`: fuente del tema. Expone `colors`,
  `palettes`, `mode`, `resolvedMode`, setters y resets.
- `src/ui/theme/settings.ts`: normalización, migración legacy, resolución de
  modo/paleta y merge; funciones puras testeables.
- `src/ui/theme/contrast.ts`: contraste WCAG AA.
- Persistencia del tema: clave `themeSettings`; migra desde `colors` y elimina
  la clave legacy al migrar.
- Los componentes nuevos usan `useTheme()`; no leen `useColorStore` ni claves
  legacy. `src/stores/ColorsStore.ts` es solo un adaptador de compatibilidad.

### Colores nuevos

Un color semántico nuevo que no elige el usuario se agrega a:

1. `ThemeColorTokens` en `src/interfaces/colors.ts`.
2. `bright.base.json` y `dark.base.json`.
3. `COLOR_GROUPS` y `COLOR_LABELS_ES` en `src/ui/theme/colors.ts`.

Con eso aparece en Settings → Colors, porque el editor recorre `COLOR_GROUPS`.
No hardcodees colores en componentes, gráficos, Mermaid ni estilos. Si un
gráfico necesita una serie nueva, crea un token (`chartPlanned`, `chartActual`,
`chartProjected`) y pásalo desde `useTheme()`.

## Primitivas

`src/ui/primitives/`: `AppText`, `Surface`, `Divider`, `Screen`, `Stack`, `Row`,
`Column`.

## Acciones

`src/ui/actions/`: `Button`, `IconButton`, `LinkButton` y `SwipeAction` con
variantes y estados.

## Formularios

`src/ui/forms/`: `FormField`, `TextField`, `MoneyField`, `SelectField`,
`MultiSelectField`, `DateField`, `MonthField`, `SwitchField`, `ColorField` y
`ColorPicker`, con label, required, hint y error.

`SelectField` y `MultiSelectField` aceptan `searchable` para buscar opciones.

## Overlays

`src/ui/overlays/`: `Modal` (center/bottom), `BottomSheet`, `Dialog` y
`ConfirmDialog`. `Modal` maneja el teclado con `KeyboardAvoidingView`, insets y
auto-scroll al `TextField` enfocado.

### Footers de modales

El contenedor interno del `footer` debe tener `flex: 1` cuando los botones usan
`flex: 1`. Sin ese `flex`, el contenedor queda con ancho automático, los botones
colapsan y el texto desaparece.

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

Si usas `Row` como footer, pásale `style={{ flex: 1 }}`.

## Feedback

`src/ui/feedback/`: `ToastProvider` único, `InlineMessage`, `EmptyState`,
`LoadingState` y `ToastViewport` para modales. No crees toasts o modales locales;
usa `ToastProvider` y `src/ui`.

## Datos y resúmenes

`src/ui/data-display/`: `Card`, `ListItem`, `Badge`, `FinanceValue`,
`SummaryBlock`, `SummaryGroup` y `AccentRow`. `FinanceValue` recibe centavos y
usa el tema.

`src/components/summaries/`: `FinanceTableBlock` y `FinanceTableChart` con
`SummaryGroup`.

## Filtros

`src/ui/filters/`: `FilterModal`, `FilterRow`, `OrderRow` y
`FilterValueInput`; `RecordsFilterModal` es el wrapper de Records.

`src/domain/filters/types.ts` y `src/domain/records/filtering.ts`: tipos de
filtro, matcher y orden compartidos.
`src/domain/records/filterFields.ts`: campos curados de Records, opciones de
relaciones y columnas avanzadas.

## Gráficos

- `src/ui/charts/MermaidChart.tsx`: WebView offline con Mermaid vendorizado,
  tema y fallback accesible.
- `assets/vendor/mermaid/`: bundle offline generado con
  `npm run vendor:mermaid`. No uses CDN.
- Cada gráfico debe incluir una leyenda visible que relacione color y serie.

## Estilos legacy

`src/styles/useThemedStyles.ts` adapta los estilos legacy al tema activo.
Mantén los adaptadores solo durante la migración.

## Barrel y lint

- `src/ui/index.ts`: barrel público del sistema de UI; exporta ahí los
  componentes nuevos.
- `eslint.config.js` bloquea `TextInput`, `Modal`, `Alert` y `ToastAndroid` de
  `react-native` fuera de `src/ui`.

## Referencias

- `app/gallery.tsx`: galería de desarrollo, oculta del drawer.
- `app/AGENTS.md`: reglas de navegación.
- `src/ui/AGENTS.md`: reglas locales resumidas.
