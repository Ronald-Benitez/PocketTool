---
name: pockettool-ui
description: Crea o modifica pantallas, componentes, formularios, modales, filtros, tema y gráficos de PocketTool con el sistema src/ui. Úsala al tocar app/, src/ui/ o src/components/, o cuando haya que aplicar tokens, dark mode, accesibilidad o i18n visual.
---

# PocketTool UI

## En modo plan

1. Identifica la pantalla o flujo y los componentes existentes que se pueden
   reutilizar (`rg` en `src/ui`, `src/components` y la pantalla objetivo).
2. Define primitivas, variantes, estados (vacío, carga, error), navegación y
   comportamiento con teclado.
3. Decide tokens de tema; si hace falta un color semántico nuevo, indica los
   cuatro registros necesarios.
4. Enumera textos nuevos y su clave `t()`; incluye la ayuda con
   `pockettool-help`.
5. Revisa accesibilidad: labels, contraste, tamaños táctiles, foco y fallback.
6. No edites archivos; entrega el plan de componentes y archivos.

## En modo build

1. Revisa `src/ui/index.ts` y reutiliza lo existente antes de crear algo.
2. Usa primitivas: `AppText`, `Surface`, `Divider`, `Screen`, `Stack`, `Row`,
   `Column`.
3. Acciones: `Button`, `IconButton`, `LinkButton`, `SwipeAction`.
4. Formularios: `FormField`, `TextField`, `MoneyField`, `SelectField`,
   `MultiSelectField`, `DateField`, `MonthField`, `SwitchField`, `ColorField`,
   `ColorPicker`. Usa `searchable` cuando la lista sea larga.
5. Overlays: `Modal` (center/bottom), `BottomSheet`, `Dialog`,
   `ConfirmDialog`. Nunca uses `Modal`, `Alert` o `ToastAndroid` de React
   Native fuera de `src/ui`.
6. **Footer de modales:** contenedor interno con `flex: 1` si los botones usan
   `flex: 1`; `Row` como footer recibe `style={{ flex: 1 }}`.
7. Feedback: `ToastProvider` único, `InlineMessage`, `EmptyState`,
   `LoadingState`. No crees toasts o modales locales.
8. Datos: `Card`, `ListItem`, `Badge`, `FinanceValue`, `SummaryBlock`,
   `SummaryGroup`, `AccentRow`. `FinanceValue` recibe centavos.
9. Tema: `useTheme()` y tokens. No leas `useColorStore`. Si agregas un color,
   actualiza `ThemeColorTokens`, `bright.base.json`, `dark.base.json`,
   `COLOR_GROUPS` y `COLOR_LABELS_ES`.
10. Gráficos: `MermaidChart` o wrappers existentes; colores desde tokens y
    leyenda visible que relacione color y serie.
11. Navegación: `StackBase` + `Tabs.Screen`; no crees un `Stack` interno dentro
    de una sección del drawer. Para editores, usa estado local y componentes.
12. Textos: todo pasa por `t()` con `TranslationKey`; actualiza la ayuda con
    `pockettool-help`.
13. Verifica: `npm run typecheck`, `npm run lint`, `npm test` y prueba visual en
    Android/iOS.

## Referencias

- `src/ui/AGENTS.md`
- `docs/architecture/ui.md`
- `app/AGENTS.md`
- `app/gallery.tsx` (galería de desarrollo)
