# AGENTS.md — src/lang

Reglas locales de idiomas y centro de ayuda. El procedimiento está en la skill
`pockettool-help`.

- `src/lang/messages/` es la fuente de verdad. Cada dominio contiene inglés y
  español co-localizados.
- `t()` se tipa con `TranslationKey`; no uses strings sueltos ni JSON de
  traducciones.
- Mantén exactamente las mismas claves en `en` y `es`; `MessageShape` valida la
  paridad.
- Los helpers de claves dinámicas (`monthKey`, `dayShortKey`, etc.) viven en
  `src/lang/`; no dupliques lógica de fechas en pantallas.
- El contenido de ayuda va en `src/lang/messages/help.ts`; el registro de temas
  en `src/help/registry.ts` y los IDs en `src/help/types.ts`.
- Todo cambio visible al usuario actualiza la ayuda en el mismo cambio. No
  esperes a que el usuario lo pida.
- Los ejemplos de ayuda usan datos ficticios y deben validarse contra los
  stores reales.
- Después de cambiar ayuda o traducciones ejecuta `npm run typecheck` y
  `npm test`.
