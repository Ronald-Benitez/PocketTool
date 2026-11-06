---
name: pockettool-help
description: Actualiza las traducciones tipadas y el centro de ayuda de PocketTool. Úsala automáticamente tras cualquier cambio visible al usuario (pantalla, flujo, regla, texto, botón o sección) y antes de cerrar una fase; no esperes a que el usuario la pida.
---

# PocketTool Help

Todo cambio visible al usuario actualiza la ayuda **en el mismo cambio**. No
esperes a que lo pidan. Si el cambio no es visible, documenta por qué no aplica.

## En modo plan

1. Decide si el cambio necesita un tema nuevo, actualizar uno existente o solo
   ajustar textos.
2. Elige categoría (`start`, `records`, `planning`, `money`, `tools`) e icono.
3. Define relaciones con temas existentes.
4. Enumera las claves nuevas en inglés y español.
5. Valida el ejemplo con los stores reales: `useResumesStore` para balances,
   `useCreditStore` para créditos, `useBudgetPlan` para presupuestos y
   `useSavingsStore` para ahorros.
6. No edites archivos; entrega el tema, las claves y el ejemplo.

## En modo build

1. Agrega el ID a `HelpTopicId` en `src/help/types.ts`.
2. Agrega el seed en `src/help/registry.ts` con `id`, `icon`, `category` y
   `related` (solo IDs existentes).
3. Agrega el contenido en `src/lang/messages/help.ts` dentro de
   `helpEn.topics.<id>` y `helpEs.topics.<id>` con exactamente las mismas
   claves:
   - `title`, `summary`;
   - `what.{title,body}`;
   - `how.{title,body}`;
   - `steps.{title,step1,step2,step3}`;
   - `example.{title,body}`;
   - `tips.{title,body}`;
   - `warning.{title,body}`.
4. Si es una categoría nueva: agrega el valor a `HelpCategory`, a
   `HELP_CATEGORIES` y las etiquetas en `helpEn.categories` y
   `helpEs.categories`.
5. Usa datos ficticios; nunca datos reales del usuario.
6. Explica la lógica, no solo los botones. Si cambió una regla, actualiza el
   ejemplo.
7. No escribas texto directamente en `app/(help)` ni en componentes; usa
   `titleKey`/`bodyKey` y `t()`.
8. Mantén la búsqueda funcionando: el hub indexa título, resumen, secciones y
   pasos.
9. Verifica con `npm run typecheck` y `npm test`. El test
   `src/help/__tests__/registry.test.ts` valida IDs, categorías, relaciones,
   claves bilingües y tres pasos.

## Reglas

- `src/lang/messages/` es la fuente de verdad; no agregues JSON.
- Mantén paridad exacta entre inglés y español (`MessageShape`).
- Todo tema debe tener tres pasos.
- Los `related` deben existir.
- Usa `Screen`, `Surface`, `ListItem` e `InlineMessage` para mantener dark mode
  y accesibilidad.

## Referencias

- `src/lang/AGENTS.md`
- `src/help/types.ts`
- `src/help/registry.ts`
- `src/lang/messages/help.ts`
- `src/help/__tests__/registry.test.ts`
