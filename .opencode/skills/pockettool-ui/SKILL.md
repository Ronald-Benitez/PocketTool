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

1. Revisa `src/ui/index.ts` y reutiliza lo existente antes de crear algo. El
   catálogo y las reglas de componentes viven en `src/ui/AGENTS.md`; no los
   dupliques aquí.
2. **Footer de modales:** contenedor interno con `flex: 1` si los botones usan
   `flex: 1`; `Row` como footer recibe `style={{ flex: 1 }}`.
3. Feedback: `ToastProvider` único; no crees toasts o modales locales.
4. Tema: `useTheme()` y tokens. No leas `useColorStore`. Si agregas un color,
   actualiza los cuatro registros indicados en `src/ui/AGENTS.md`.
5. Gráficos: usa `Chart`/`ChartCard` de `src/ui/charts`; los builders devuelven
   `ChartSpec` y la UI decide tokens y leyenda.
6. Navegación: `StackBase` + `Tabs.Screen`; no crees un `Stack` interno dentro
   de una sección del drawer. Para editores, usa estado local y componentes.
7. Textos: todo pasa por `t()` con `TranslationKey`; actualiza la ayuda con
   `pockettool-help`.
8. Verifica: `npm run typecheck`, `npm run lint`, `npm test` y prueba visual en
   Android/iOS.

## Referencias

- `src/ui/AGENTS.md`
- `docs/architecture/ui.md`
- `app/AGENTS.md`
- `app/gallery.tsx` (galería de desarrollo)
