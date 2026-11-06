# AGENTS.md — app

Reglas locales de navegación y pantallas.

- Cada sección del drawer vive en un grupo `app/(...)/` con un `_layout.tsx`
  basado en `StackBase`.
- Declara cada pantalla con `<Tabs.Screen name='...'>`; `StackBase` aporta
  header, botón de menú, tema y tab bar.
- **No** crees un `Stack` interno dentro de una sección del drawer: reemplaza el
  header de `StackBase` y puede dejar al usuario sin acceso al menú. Usa estado,
  modales o una ruta del mismo grupo declarada como tab.
- Para editores de una entidad, prefiere estado local y un componente editor, no
  una ruta dinámica oculta dentro de `Tabs`.
- Referencia vigente: `app/(budget)/_layout.tsx` declara `index` y `templates`;
  el editor de plantillas es un componente dentro de `templates.tsx`.
- Usa `Screen`, `Surface` y el resto de `src/ui`; no uses primitivas nativas
  prohibidas.
- Todo texto visible usa `t()`; toda pantalla o flujo nuevo se refleja en la
  ayuda con `pockettool-help`.
- Si la pantalla mueve dinero, revisa `pockettool-records` antes de implementar.
- La galería de desarrollo `app/gallery.tsx` está oculta del drawer.
