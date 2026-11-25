# Identidad visual

**Cuándo leer:** al crear o modificar pantallas, agrupadores, superficies,
tooltips, acciones, densidades o cualquier decisión estética.
**Resumen:** contrato visual de PocketTool: principios, grid, jerarquía,
glassmorphism simulado, agrupadores, tooltips, color, tipografía, acciones,
navegación, movimiento, accesibilidad y checklist.
**Skill:** `pockettool-ui`.
**Secciones:** Principios · Grid · Jerarquía · Superficies · Agrupadores ·
Tooltips · Color · Tipografía · Acciones · Navegación · Movimiento ·
Accesibilidad · Anti-patrones · Checklist.

## Principios

1. **Datos primero.** La decoración solo existe si comunica jerarquía o
   profundidad.
2. **Una idea por bloque.** Si un bloque necesita dos títulos o dos acciones
   primarias, son dos bloques.
3. **Menos texto, mejor texto.** La explicación opcional va en un tooltip; la
   pantalla muestra lo que el usuario necesita para decidir.
4. **Densidad controlada.** Preferir 2–5 secciones por pantalla antes que una
   lista larga de tarjetas equivalentes.
5. **Consistencia antes que novedad.** Un patrón nuevo debe justificarse y
   registrarse en este documento.

## Grid y ritmo

- Base de 4 px.
- Pantalla: 16 px (`spacing.lg`).
- Separación entre secciones: 24 px (`spacing.xl`).
- Padding de tarjeta: 16 px (`spacing.lg`); compacto: 12 px.
- Filas internas: 12 px (`spacing.md`) entre grupos y 8 px (`spacing.sm`) entre
  label y valor.
- Radios: `lg` para filas, `xl` para secciones y hero, `pill` para acciones.
- No uses alturas fijas con texto; el contenido debe crecer con el tamaño de
  fuente del sistema.

## Jerarquía

- Máximo un **hero** por pantalla: el dato más importante y su acción.
- Máximo tres niveles tipográficos visibles por tarjeta: valor, etiqueta,
  metadato.
- El valor va primero; la etiqueta explica qué es; el metadato solo aporta
  contexto (fecha, cantidad, unidad).
- Prohibido apilar captions explicativos debajo de cada valor. Si el dato no se
  entiende, falta un tooltip o un nombre mejor.
- Los importes usan `FinanceValue` y quedan alineados a la derecha en listas.

## Superficies

- `flat`: fondo base, sin borde. Para filas y contenedores neutros.
- `outlined`: borde de 1 px. Para listas y formularios.
- `muted`: fondo alterno. Para subsecciones dentro de una tarjeta.
- `raised`: sombra de tarjeta. Solo para el hero o un elemento flotante.
- `glass`: agrupador translúcido. Solo para secciones y hero; nunca para filas,
  inputs, imágenes o visuales de tarjeta.
- Máximo dos niveles de superficie anidada. `glass` dentro de `glass` está
  prohibido.

### Receta de glass

El efecto es **simulado**: `expo-glass-effect` solo aplica en iOS 26 y Android no
tiene blur nativo. La coherencia entre plataformas se logra con tokens:

```ts
backgroundColor: withAlpha(colors.surface, isDark ? 0.78 : 0.68)
borderColor: withAlpha(colors.borderStrong, 0.35)
highlight: isDark
  ? withAlpha(colors.textInverse, 0.08)
  : withAlpha(colors.primary, 0.12)
shadow: shadows.glass + colors.shadow
```

- Sin tokens de color nuevos: se derivan de `surface`, `borderStrong`,
  `textInverse` y `shadow`.
- Sin colores hardcodeados en componentes; usa `withAlpha` de
  `src/ui/theme/color.ts`.
- No uses glass sobre `PaymentMethodVisual`, imágenes o fondos con gradiente.
- Si una paleta personalizada pierde contraste, el glass debe caer a `raised` o
  `flat`; nunca ocultar texto.

## Agrupadores

`SectionCard` es el contenedor estándar:

- Título corto y, si aporta, icono.
- Acción “ver todo” o “editar” como `LinkButton`, nunca un botón primario.
- `InfoHint` opcional para explicación.
- Contenido con estado vacío propio y, si aplica, colapso para secciones
  secundarias.
- Una sección no repite el título de la pantalla.
- Si una sección tiene una sola fila, evalúa si debe ser parte de otra sección.
- Datos compactos dentro de una sección: `StatTile` para KPIs y `ProgressBar`
  para metas o presupuesto.

## Tooltips

- Usa `InfoHint` para explicación opcional, conceptos, ejemplos y textos de más
  de una línea.
- No uses tooltip para errores, advertencias, validaciones, confirmaciones ni
  información necesaria para completar el formulario.
- El trigger es un icono info de 44×44; el contenido se abre en modal/bottom
  sheet y tiene cierre explícito.
- El título del tooltip nombra el concepto; el cuerpo explica en una o dos
  frases. Sin acciones dentro.
- El texto sigue pasando por `t()` y se reutiliza la clave existente cuando ya
  existe una descripción.

## Color

- Solo tokens de `useTheme()`. Prohibido hex en componentes, estilos y gráficos.
- El acento se usa como punto, barra o icono; no como fondo de bloques completos.
- Rojo/verde solo para semántica financiera (gasto/ingreso), no para decorar.
- Un color nuevo se registra en `ThemeColorTokens`, `bright.base.json`,
  `dark.base.json`, `COLOR_GROUPS` y `COLOR_LABELS_ES`, y debe pasar contraste.
- El glass y las sombras se derivan de tokens; no agregan ruido al editor de
  colores.

## Tipografía

- `display`/`title`: hero y títulos de pantalla.
- `subtitle`: títulos de sección y valores grandes.
- `body`: contenido y filas.
- `label`: etiquetas de campo y encabezados compactos.
- `caption`/`helper`: metadatos y ayudas breves. No los uses como párrafos.
- Sentence case. Sin mayúsculas sostenidas ni signos decorativos.
- Los números financieros usan el formato de `src/utils`; no formatees a mano.

## Acciones

- Una acción primaria por vista. La captura principal vive en el FAB.
- Acciones secundarias: `outline`, `ghost` o `LinkButton`.
- Destructivas: `danger` + confirmación.
- Iconos: 18 px en filas, 22 px en acciones, 26 px en FAB. No mezcles familias
  dentro del mismo contexto.
- Un botón deshabilitado debe explicar por qué mediante texto corto o tooltip,
  no solo con opacidad.
- Captura: `QuickAction` para acciones compactas y `FloatingActions` para el FAB
  principal con acciones secundarias.
- Reordenamiento: `SortableList` con drag y helpers subir/bajar; nunca solo drag.

## Navegación

- Todo resumen enlaza a su detalle o a su módulo.
- No hay callejones sin salida: si una pantalla muestra un dato, ofrece cómo
  actuar sobre él.
- Comprueba el flag de la feature antes de navegar; el guard redirige a Inicio.
- No dupliques la misma acción en el header, la tarjeta y el FAB.

## Movimiento

- Feedback de press: opacidad o escala sutil, 150–200 ms.
- Sin animaciones continuas salvo visuales funcionales (por ejemplo, Vehículo).
- Respeta reduced motion; el drag debe tener alternativa con botones.
- Carga: `LoadingState` solo si supera ~300 ms; evita parpadeos.

## Accesibilidad

- Área táctil mínima 44×44.
- Todo icono interactivo tiene `accessibilityLabel`; todo modal tiene cierre.
- Contraste AA en texto normal y en textos sobre glass.
- No comuniques estado solo con color; añade texto o icono.
- Orden de lectura coherente; el drag no es la única forma de reordenar.
- Prueba con fuente grande y lector de pantalla en Android e iOS.

## Anti-patrones

- Tarjeta dentro de tarjeta dentro de tarjeta.
- Caption explicativo debajo de cada valor.
- Más de una acción primaria en la misma vista.
- Glass sobre imágenes, visuales de tarjeta o fondos con gradiente.
- Tooltips con errores o información imprescindible.
- Colores hex en componentes.
- Secciones sin título o títulos que repiten el header.
- Listas largas de tarjetas equivalentes sin agrupador.

## Checklist de pantalla nueva

- [ ] ¿Cuál es el dato principal y dónde está el hero?
- [ ] ¿Cuántas secciones hay? ¿Pueden reducirse a 2–5?
- [ ] ¿Cada sección usa `SectionCard` y tiene una acción clara?
- [ ] ¿Hay texto explicativo inline que debería ser `InfoHint`?
- [ ] ¿Los errores y advertencias siguen visibles?
- [ ] ¿Todos los enlaces comprueban el flag de la feature?
- [ ] ¿Hay estados vacío, carga y error por sección?
- [ ] ¿Funciona en bright/dark y con paleta personalizada?
- [ ] ¿Se probó con fuente grande y lector de pantalla?
- [ ] ¿Se actualizó la ayuda bilingüe y la galería?
