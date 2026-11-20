# Fase 18 — Motor de gráficos nativo

**Resumen:** sustituir Mermaid/WebView por un motor de gráficos SVG declarativo,
con migración total, colapsables y preferencias persistidas en SQLite.
**Estado:** ✅ Finalizada.
**Fecha:** 2026-11-19.
**Leer solo si:** necesitas el detalle histórico de la Fase 18.
**Secciones:** [Decisiones](#decisiones) · [Arquitectura](#arquitectura) ·
[Persistencia](#persistencia) · [Migración](#migración) · [Pruebas](#pruebas) ·
[Riesgos](#riesgos) · [Resultado](#resultado) · [Commits](#commits) ·
[Verificación](#verificación) · [Checklist](#checklist)

## Decisiones

| Punto | Decisión |
| --- | --- |
| Motor | Propio, sobre `react-native-svg` |
| Migración | Total: Presupuesto, Vehículo, Combustible, Créditos y Ahorros |
| v1 | Tooltips, highlight, animaciones, ver datos, toggles, límite y zoom |
| Dependencias | Eliminar Mermaid, WebView y `gifted-charts` al terminar |
| Tema | Tokens existentes; tonos semánticos, sin colores nuevos |
| Persistencia | SQLite (`ChartPreferences`); no AsyncStorage para gráficos |
| Colapsables | `ChartCard` + `ChartSection`; Combustible colapsado por defecto |
| Gráficos propios | Fuera de esta fase |

## Arquitectura

- `src/domain/charts/types.ts`: `ChartSpec`, `ChartKind`, `ChartTone`,
  `ChartPoint`, `ChartSeries`.
- `src/domain/charts/scale.ts`: escalas, ticks, dominios y bandas puras.
- `src/domain/charts/validation.ts`: validación pura de specs.
- `src/ui/charts/Chart.tsx`: renderiza un spec, tooltip, tabla, límite y zoom.
- `src/ui/charts/ChartCard.tsx`: título, leyenda, colapso y preferencias.
- `src/ui/charts/ChartCard.tsx`: también exporta `ChartSection` con
  “expandir/colapsar todo”.
- `src/ui/charts/registry.ts`: `ChartKind` → renderer.
- `src/ui/charts/renderers/`: línea, barra, agrupada, apilada, pastel, dona y
  área.
- `src/ui/charts/legend.tsx`, `format.ts`, `theme.ts`, `ChartFrame.tsx`.

Los builders de dominio devuelven datos en centavos y timestamps, con etiquetas
y tonos semánticos; nunca formatean moneda/fechas ni devuelven colores.

## Persistencia

Tabla `ChartPreferences` (`chart_preferences`):

| Columna | Tipo | Uso |
| --- | --- | --- |
| `chart_key` | TEXT | Clave estable por gráfico |
| `collapsed` | INTEGER (boolean) | Estado colapsado |
| `mode` | TEXT | Último modo de gráfico (incluye índice/real) |
| `hidden_series` | TEXT | JSON con series ocultas |
| `data_limit` | INTEGER | Límite de datos |
| `limit_from_end` | INTEGER (boolean) | Límite desde el final |
| `zoom` | REAL | Zoom |
| `created_at`, `updated_at` | INTEGER | Triggers |
| `deleted_at` | INTEGER | Soft delete |

Índice único parcial en `chart_key` donde `deleted_at IS NULL`. Repositorio
`useChartPreferencesRepository` con `save` y `saveMany` (una transacción), y
contexto `ChartPreferencesProvider` con cola de guardado para evitar
transacciones concurrentes.

Claves: `budget.plan`, `vehicle.summary.*`, `vehicle.fuel.*`,
`credits.schedule.*`, `savings.balance`.

## Migración

- 18A: motor + Presupuesto.
- 18B: Vehículo y Combustible.
- 18C: Créditos.
- 18D: Ahorros.
- 18E: limpieza de Mermaid/WebView/`gifted-charts`.

## Pruebas

- Escalas, dominios, ticks y validación de specs.
- Builders de presupuesto, vehículo, créditos y ahorros.
- Preferencias: merge, defaults, persistencia y claves.
- Migración 26 y tabla `chart_preferences`.
- QA manual en `app/gallery.tsx`, Android e iOS: colapso, persistencia,
  tooltips, zoom, tabla y los cinco gráficos de Combustible.

## Riesgos

- Motor propio grande: fases y commits pequeños.
- Ejes/escalas: tests puros de borde.
- Rendimiento: `useMemo`, paths SVG y ventana de puntos.
- Gestos: tooltip por pulsación, sin pan global.
- Accesibilidad: resumen + tabla de datos.
- Eliminar Mermaid solo al final.

## Resultado

- Motor SVG con `ChartSpec`, escalas, validación y renderers.
- Tooltips multi-serie por x/categoría, con valor indexado y valor real.
- Modo índice/datos reales en Movilidad, persistido en SQLite.
- Colapsables con “expandir/colapsar todo”; Combustible abre colapsado.
- Migración total y eliminación de Mermaid/WebView/`gifted-charts`.
- Bundle Android reducido de 6.8 MB a 6.5 MB.

## Commits

- `b9a12bd` tabla y migración 26.
- `992663d` artefactos generados.
- `5b43e50` repositorio de preferencias.
- `9f9d9c5` tipos, escalas y validación.
- `157253b` specs de presupuesto.
- `aa84752` specs de vehículo.
- `2ce0d36` specs de créditos.
- `b0f8bb5` spec de ahorros.
- `6847454` textos y ayuda.
- `174f23f` tema, formato y frame.
- `3d2c8ec` renderers SVG.
- `2fc7c12` `Chart`, `ChartCard` y preferencias.
- `708988f` presupuesto migrado.
- `df11ea5` vehículo migrado.
- `1db8327` combustible y modo índice/real.
- `765d9b6` ahorros migrado.
- `df83777` créditos migrado.
- `f511ede` galería.
- `fbcf3c5` limpieza de dependencias.
- `28f6eb2` documentación del motor.

## Verificación

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | ✅ |
| `npm run test:db` | ✅ |
| `npm test` | ✅ 40 suites, 274 tests |
| `npm run lint` | ✅ 0 errores |
| `npm run doctor` | ✅ 20/20 |
| `npm run docs:audit` | ✅ |
| `npm run ci` | ✅ |
| `npx expo export --platform android` | ✅ bundle 6.5 MB |

## Checklist

- [x] Tabla, migración 26, validación y repositorio
- [x] Tipos, escalas y specs
- [x] `Chart`, `ChartCard`, `ChartSection` y renderers
- [x] Preferencias SQLite y contexto
- [x] Presupuesto migrado
- [x] Vehículo y combustible migrados
- [x] Créditos y ahorros migrados
- [x] Mermaid/WebView/`gifted-charts` eliminados
- [x] Ayuda, textos y documentación
- [x] Verificación completa
- [x] QA manual en Android/iOS
