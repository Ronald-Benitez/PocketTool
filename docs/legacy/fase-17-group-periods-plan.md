# Fase 17 — Grupos automáticos y periodos unificados

**Resumen:** creación automática del grupo del periodo actual y unificación del
periodo de grupos y cierres. Los registros conservan su lógica actual con una
sugerencia cuando la fecha cae fuera del periodo. El presupuesto queda como deuda
futura.
**Estado:** ✅ Finalizada.
**Fecha:** 2026-11-19.
**Leer solo si:** necesitas el detalle histórico de la Fase 17.
**Secciones:** [Decisiones](#decisiones) (16) · [Modelo](#modelo) (29) ·
[Dominio](#dominio) (42) · [Cierre](#cierre) (52) · [UI](#ui) (62) ·
[Registros](#registros) (73) · [Pruebas](#pruebas) (79) · [Riesgos](#riesgos) (90) ·
[Resultado](#resultado) (101) · [Commits](#commits) (112) · [Verificación](#verificación) (117) ·
[Pendientes](#pendientes) (130) · [Checklist](#checklist) (138)

## Decisiones

| Punto | Decisión |
| --- | --- |
| Automatización | Crear solo el periodo actual si ningún grupo lo cubre |
| Modos | Mes calendario y día de inicio; `cutoff_day` se migra a `start_day = corte + 1` |
| Periodo y cierre | Una sola configuración de periodo compartida |
| Cierre a mitad de periodo | No bloquear; solo mensaje informativo |
| Registros fuera de periodo | Mantener asignación manual y mostrar sugerencia |
| Nombre y meta automáticos | Generar y permitir editar; la meta se hereda del último grupo |
| Entrada de creación | La existente en Finanzas → Registros (`folder-add`) |
| Presupuesto | Fuera de esta fase; registrado en `plans/futuro-borrador.md` |

## Modelo

`Groups` gana `period_start`, `period_end` (timestamps locales, nullable) y
`period_mode` (`calendar_month`, `start_day`, `cutoff_day`, `custom_range`).
`year`/`month` quedan como mes ancla y `month` es 0-based.

Migración `0025_group_periods` (`SCHEMA_VERSION = 25`):

1. Añade las columnas si faltan.
2. Normaliza el mes del grupo de ejemplo y el valor imposible `month = 12`.
3. Crea `idx_groups_period`.
4. Los grupos sin periodo resuelven por fallback a mes calendario.

## Dominio

- `src/domain/periods/`: motor compartido `resolvePeriod`, `periodForDate`,
  `periodContains`, `isCalendarMonthPeriod`, `resolveDayInPeriod`, `nextPeriod`.
- Los periodos son contiguos: un periodo `start_day` termina el día anterior al
  siguiente inicio, incluso con clamp en meses cortos.
- `src/domain/groups/`: `resolveGroupPeriod`, `groupPeriodFromRow`,
  `resolveGroupPeriodForDate`, `nextGroupPeriod` y `planCurrentGroup`.
- `closing/period.ts` reutiliza el motor y conserva `resolveClosingPeriod`.

## Cierre

- Cierre nuevo: usa `period_start/period_end` del grupo.
- Cierre existente: conserva su periodo guardado.
- `closingGraceDays` y `closingAllowPeriodOverride` siguen siendo propios del
  cierre.
- Si el periodo no ha terminado, se muestra una sugerencia; no se bloquea.
- La configuración legacy `closingPeriodMode/startDay/cutoffDay` se migra a la
  configuración de grupos al cargar las configuraciones.

## UI

- Ajustes → Grupos: switch de automatización, modo de periodo, día de inicio,
  ejemplo calculado y botón “Crear el grupo actual ahora”.
- Ajustes → Cierre: solo gracia y override.
- `add-group.tsx`: props explícitas `mode`, vista previa del periodo, nombre y
  meta editables, aviso al cambiar el periodo de un grupo con datos.
- `group-selector.tsx`: etiqueta con rango cuando no es mes calendario.
- `add-record.tsx`: aviso informativo si la fecha pertenece a otro grupo.
- `useAutoGroup`: crea el periodo actual al arrancar y al volver a primer plano.

## Registros

Crear un grupo no crea, vincula ni omite `Records`. La sugerencia de fecha no
mueve dinero. Vehículo sigue creando por defecto; Financiamientos no vincula por
defecto.

## Pruebas

- Periodos: mes calendario, día 31 en meses cortos, contigüidad, límites
  inclusivos, cruce de año, `periodForDate`, `resolveDayInPeriod`.
- Cierre: periodo del grupo, override, cierre a mitad de periodo.
- Repositorio: `ensureCurrentGroup` idempotente, respeta borrados, no crea en
  modo manual, hereda meta, ancla correcta.
- Fijos/tarjeta: día dentro del periodo y deduplicación por periodo.
- Vehículo: grupo por periodo.
- Migración 25 y backup viejo.

## Riesgos

- Migrar la configuración de cierre sin cambiar el comportamiento de usuarios
  existentes: copiar la intención a la config de grupos y conservar los cierres
  guardados.
- Recrear grupos borrados: comprobar también los borrados.
- Desfase de `month`: normalizar el valor 12 y el grupo de ejemplo, y corregir
  seed/vehículo.
- Un día de diferencia en periodos `start_day`: el nuevo cálculo contiguo
  corrige el solapamiento previo; textos y tests actualizados.

## Resultado

- Periodo explícito por grupo y motor compartido con cierres.
- Creación automática del periodo actual, idempotente y respetuosa con borrados.
- Selector, cierre, fijos, tarjeta, vehículo y registros alineados al periodo.
- Ayuda bilingüe actualizada y deuda de presupuesto registrada.
- Archivos principales: `src/domain/periods/`, `src/domain/groups/`,
  `src/db/migrations/0025_group_periods.ts`, `src/hooks/useAutoGroup.ts`,
  `src/hooks/useCreateCurrentGroup.ts`, `app/(settings)/index.tsx`,
  `src/components/groups/add-group.tsx`, `ClosingScreen` y `ClosingEditor`.

## Commits

- `635945a` — `feat(db): add configurable group periods and migration 25`.
- `af2337a` — `feat(groups): automate current period and unify closing periods`.

## Verificación

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | ✅ |
| `npm run test:db` | ✅ |
| `npm test` | ✅ 38 suites, 265 tests |
| `npm run lint` | ✅ 0 errores; warnings preexistentes |
| `npm run doctor` | ✅ 20/20 |
| `npm run docs:audit` | ✅ |
| `npx expo export --platform android` | ✅ |
| `npm run ci` | ✅ |

## Pendientes

- Notas de Google Play y novedades in-app: se generarán después con
  `/notas-version <versión>`.
- Presupuesto con días del periodo: ver `plans/futuro-borrador.md`.
- QA manual en Android/iOS de los flujos de creación automática, borrado,
  cambio de modo, cierre y sugerencia de fecha.

## Checklist

- [x] Motor de periodos y tests
- [x] Esquema, migración 25 y artefactos generados
- [x] Validación zod
- [x] Repositorio `ensureCurrentGroup` y vehículo por periodo
- [x] Configs y migración de la config de cierre
- [x] Hook de automatización en el arranque y primer plano
- [x] Ajustes, modal de grupo y selector
- [x] Cierre con periodo del grupo y sugerencia
- [x] Sugerencia de fecha en Registros
- [x] Fijos y pagos de tarjeta por periodo
- [x] Ayuda y textos
- [x] Documentación y plan futuro de presupuesto
- [ ] Notas de Play y novedades in-app (pendiente de versión)
- [x] Verificación completa
