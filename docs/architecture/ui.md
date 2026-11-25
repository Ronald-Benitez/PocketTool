# Arquitectura de UI

**Cuándo leer:** al crear o modificar pantallas, componentes, tema, formularios,
modales, filtros o gráficos.
**Resumen:** PocketTool usa un sistema propio en `src/ui`, con tokens, tema
claro/oscuro, primitivas, acciones, formularios, overlays, feedback y filtros.
**Skill:** `pockettool-ui`.
**Secciones:** Identidad visual · Tema y tokens · Componentes · Footers ·
Filtros · Gráficos · Estilos legacy · Barrel y lint.

## Identidad visual

El contrato completo vive en
[`visual-identity.md`](visual-identity.md): principios, grid, jerarquía,
glassmorphism, agrupadores, tooltips, accesibilidad y checklist. Puntos
operativos:

- `Surface variant='glass'` usa `withAlpha` y `shadows.glass`; el efecto es
  simulado en Android e iOS, no blur nativo.
- El texto opcional educativo va en `InfoHint`; errores, advertencias y
  validaciones siguen inline.
- Máximo un hero, entre 2 y 5 secciones y dos niveles de superficie por pantalla.
- Todo resumen enlaza a su módulo y comprueba el flag de la feature.

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
No hardcodees colores en componentes, gráficos ni estilos. Si un
gráfico necesita una serie nueva, crea un token (`chartPlanned`, `chartActual`,
`chartProjected`) y pásalo desde `useTheme()`.

## Componentes

El catálogo y las reglas de uso viven en
[`../../src/ui/AGENTS.md`](../../src/ui/AGENTS.md) y en el barrel
`src/ui/index.ts`. Puntos de arquitectura:

- Primitivas: `AppText`, `Surface`, `Divider`, `Screen`, `Stack`, `Row`, `Column`.
- Datos: `SectionCard` agrupa una idea; `StatTile` muestra un KPI compacto y
  `ProgressBar` una meta o presupuesto.
- Overlays: `InfoHint` abre explicaciones opcionales en bottom sheet.
- Acciones: `QuickAction` para capturas compactas y `FloatingActions` para el
  FAB con acciones secundarias.
- Listas: `SortableList` comparte drag y helpers subir/bajar; `resolveDropIndex`
  es puro y testeable.
- Formularios: `SelectField` y `MultiSelectField` aceptan `searchable`.
- Overlays: `Modal` maneja teclado, insets y auto-scroll; `Dialog` y
  `ConfirmDialog` cubren confirmaciones.
- Feedback: un único `ToastProvider`; no crees toasts o modales locales.
- Datos: `FinanceValue` recibe centavos; `SummaryGroup` agrupa totales.

## Footers de modales

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

## Filtros

`src/ui/filters/`: `FilterModal`, `FilterRow`, `OrderRow` y
`FilterValueInput`; `RecordsFilterModal` es el wrapper de Records.

`src/domain/filters/types.ts` y `src/domain/records/filtering.ts`: tipos de
filtro, matcher y orden compartidos.
`src/domain/records/filterFields.ts`: campos curados de Records, opciones de
relaciones y columnas avanzadas.

## Gráficos

- `src/domain/charts/`: tipos (`ChartSpec`, `ChartKind`, `ChartTone`), escalas,
  ticks y validación pura. Los builders devuelven centavos, timestamps y tonos
  semánticos; nunca colores, formato de moneda ni fechas formateadas.
- `src/ui/charts/`: motor de renderizado.
  - `Chart`: renderiza un spec, tooltip, leyenda, “ver datos”, toggles, límite
    y zoom.
  - `ChartCard`: título, leyenda compacta y colapso persistente.
  - `ChartSection`: grupo de gráficos con “expandir/colapsar todo”.
  - `renderers/`: línea, barra, agrupada, apilada, pastel, dona y área sobre
    `react-native-svg`.
  - `ChartPreferencesProvider`: preferencias en SQLite (`chart_preferences`).
- `ChartTone` se resuelve con tokens existentes (`chartPlanned`, `chartActual`,
  `chartProjected`, `chartFuelCost`, `chartMaintenanceCost`,
  `chartConsumption`, `chartDistance`, `primary`, etc.). No hay colores nuevos.
- Todo gráfico incluye leyenda visible que relaciona color y serie.
- En Combustible los gráficos se abren colapsados; el usuario puede expandirlos
  y la elección se recuerda.
- Algunos gráficos ofrecen modos de datos (por ejemplo índice base 100 o datos
  reales). El modo se guarda en `chart_preferences` y el tooltip puede mostrar
  el valor real aunque la línea esté normalizada.
- No uses `MermaidChart`, WebView ni `gifted-charts`: fueron reemplazados por el
  motor.

## Estilos legacy

`src/styles/useThemedStyles.ts` adapta los estilos legacy al tema activo.
Mantén los adaptadores solo durante la migración.

## Barrel y lint

- `src/ui/index.ts`: barrel público del sistema de UI; exporta ahí los
  componentes nuevos.
- `eslint.config.js` bloquea `TextInput`, `Modal`, `Alert` y `ToastAndroid` de
  `react-native` fuera de `src/ui`.

## Referencias

- [`visual-identity.md`](visual-identity.md): contrato visual y checklist.
- [`dashboard.md`](dashboard.md): modelo y persistencia del Home.
- `app/gallery.tsx`: galería de desarrollo, oculta del drawer.
- `app/AGENTS.md`: reglas de navegación.
- `src/ui/AGENTS.md`: reglas locales resumidas.
