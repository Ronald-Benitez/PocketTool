# Plan de traducciones tipadas y centro de ayuda

> **Archivado 2026-10-29.** Este plan se implementó en las fases 5 y 6 y se
> conserva como registro histórico. La documentación vigente vive en
> [`../phases.md`](../phases.md) y [`../../AGENTS.md`](../../AGENTS.md).

**Estado:** ✅ Implementado (archivado)
**Fecha:** 2026-10-29
**Fases:** Fase 5 (i18n) y Fase 6 (ayuda)

Este documento define dos mejoras relacionadas:

1. Un sistema de traducciones tipado, con autocompletado y mensajes
   co-localizados.
2. Un centro de ayuda que explique la lógica de la app y muestre ejemplos de uso.

No se implementará código hasta validar este plan.

---

## Parte A — Traducciones tipadas

### Problema actual

- `en.json` y `es.json` son dos archivos globales que hay que mantener en
  paralelo.
- `records-filters.en.json` y `records-filters.es.json` añaden otra pareja.
- `t(key: string)` no ofrece autocompletado; cualquier string compila.
- `LanguageContent` está incompleto y no representa los mensajes reales.
- `LanguageContext` usa `any`, por lo que se pierden tipos en toda la app.
- Las claves dinámicas (`t('months.' + i)`, `t(\`theme.mode.${mode}\`)`) no
  están validadas.
- Un error de escritura o una traducción faltante no se detecta hasta runtime.

### Objetivos

- Una única fuente de verdad por dominio, con inglés y español en el mismo
  archivo.
- `t()` con autocompletado de claves en el editor.
- Validación de paridad de claves entre idiomas.
- Fallback seguro a inglés.
- Interpolación de parámetros.
- Tests de claves, lookup y mensajes dinámicos.
- Mantener `useLanguage()` y `getMonths()` sin romper las pantallas actuales.

### Estructura propuesta

```text
src/lang/
  messages/
    common.ts
    headers.ts
    groups.ts
    records.ts
    recordFilters.ts
    settings.ts
    theme.ts
    help.ts
    index.ts
  messages/types.ts
  LanguageContext.tsx
```

Cada archivo de dominio contiene ambos idiomas:

```ts
// src/lang/messages/records.ts
export const recordsEn = {
  header: 'Manage Records',
  amount: 'Amount',
  date: 'Date',
  add: 'Add record',
  error: 'You must complete all fields',
} as const;

export const recordsEs: MessageShape<typeof recordsEn> = {
  header: 'Gestionar registros',
  amount: 'Monto',
  date: 'Fecha',
  add: 'Agregar registro',
  error: 'Debes completar todos los campos',
};
```

- `MessageShape<T>` reemplaza las hojas por `string` y exige la misma forma.
- `messages/index.ts` compone todos los dominios:

```ts
export const en = {
  ...commonEn,
  ...recordsEn,
  // ...
};

export const es: MessageShape<typeof en> = {
  ...commonEs,
  ...recordsEs,
  // ...
};

export type TranslationKey = Leaves<typeof en>;
```

- `Leaves<T>` genera uniones de rutas con punto:

```ts
type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];
```

### API propuesta

```ts
type Language = 'en' | 'es';

type TranslationParams = Record<string, string | number>;

type TFunction = (key: TranslationKey, params?: TranslationParams) => string;

type LanguageContextValue = {
  language: Language;
  changeLanguage: (language: Language) => Promise<void>;
  t: TFunction;
  getMonths: () => string[];
};
```

- `t('records.header')` autocompleta.
- Claves inválidas son error de TypeScript.
- Interpolación:

```ts
t('records.deleteConfirm', { name: 'Coffee' });
// "Delete {name}?"
```

- Fallback: si falta una traducción en runtime, se usa inglés y se registra un
  warning en desarrollo.
- Las claves dinámicas se resuelven con helpers tipados:

```ts
export const monthKey = (month: number): TranslationKey =>
  `months.${month}` as TranslationKey;
```

O con tipos literales si el índice ya está restringido.

### Migración

1. Crear `messages/types.ts` con `MessageShape` y `Leaves`.
2. Crear los archivos de dominio y mover los mensajes de `en.json`/`es.json`.
3. Integrar `recordsFilters` en `messages/recordFilters.ts`.
4. Reescribir `LanguageContext` con estado tipado y `t` tipado.
5. Corregir las claves dinámicas en las pantallas.
6. Eliminar `en.json`, `es.json`, `records-filters.*.json` y la interfaz
   `LanguageContent` antigua.
7. Añadir lint para impedir imports de JSON de traducciones fuera de
   `src/lang/messages`.

### Tests

- Paridad de claves y estructura entre `en` y `es`.
- Lookup de claves anidadas.
- Fallback a inglés.
- Interpolación y parámetros faltantes.
- Helpers de claves dinámicas (`months`, `theme.mode`,
  `recordsFilters.operators`).
- Búsqueda de todas las claves usadas con `t()` en el código.

### Criterios de aceptación (i18n)

- [ ] `t()` autocompleta claves en el editor.
- [ ] Una clave inexistente falla en typecheck.
- [ ] Inglés y español viven juntos por dominio.
- [ ] No quedan JSON de traducciones duplicados.
- [ ] Los tests validan paridad y fallback.
- [ ] `useLanguage()` mantiene compatibilidad con pantallas actuales.

---

## Parte B — Centro de ayuda

### Problema actual

`app/(help)/index.tsx` muestra cinco tarjetas con descripciones planas. No
explica el flujo, no enseña la lógica, no da ejemplos, no tiene búsqueda ni
detalle por tema.

### Objetivo

Convertir Ayuda en un centro de aprendizaje que permita:

- entender qué hace cada sección;
- aprender el flujo correcto de uso;
- comprender las reglas de cálculo;
- ver ejemplos con datos ficticios;
- resolver errores comunes;
- encontrar un tema rápido con búsqueda.

### Estructura propuesta

```text
src/help/
  topics/
    gettingStarted.ts
    records.ts
    fixeds.ts
    summaries.ts
    budgets.ts
    credits.ts
    savings.ts
    filters.ts
    theme.ts
  registry.ts
  types.ts
```

```ts
type HelpSection =
  | { type: 'text'; titleKey: TranslationKey; bodyKey: TranslationKey }
  | { type: 'steps'; titleKey: TranslationKey; steps: TranslationKey[] }
  | { type: 'example'; titleKey: TranslationKey; items: HelpExampleItem[] }
  | { type: 'tip'; messageKey: TranslationKey }
  | { type: 'warning'; messageKey: TranslationKey };

type HelpTopic = {
  id: string;
  icon: string;
  titleKey: TranslationKey;
  summaryKey: TranslationKey;
  keywords: TranslationKey[];
  sections: HelpSection[];
  related?: string[];
  appRoute?: Href;
};
```

### Pantallas

#### Hub `app/(help)/index.tsx`

- Buscador por título, resumen y palabras clave.
- Tarjeta “Primeros pasos”.
- Temas agrupados por área:
  - Primeros pasos
  - Registros y grupos
  - Gastos fijos
  - Resúmenes
  - Presupuestos
  - Créditos
  - Ahorros
  - Filtros
  - Tema y accesibilidad
- Cada tema abre su detalle.
- Estado vacío para búsquedas sin resultados.

#### Detalle `app/(help)/[topic].tsx`

- Título, resumen y tiempo estimado de lectura.
- Secciones:
  - “Qué es”
  - “Cómo funciona”
  - “Paso a paso”
  - “Ejemplo”
  - “Consejos”
  - “Errores comunes”
  - “Temas relacionados”
- Botón “Ver en la app” cuando exista una ruta relacionada.
- Navegación accesible y scroll.

### Temas mínimos

1. **Primeros pasos**: crear grupo, elegir mes/año, registrar primer movimiento.
2. **Grupos**: periodo mensual, meta, balance, cambio de grupo.
3. **Registros**: ingreso, gasto, transferencia, categoría, método de pago,
   efecto en el balance.
4. **Gastos fijos**: día del mes, recordatorio, confirmación, edición.
5. **Resúmenes**: balance, por tipo, categoría, método y tipo de pago; débito vs
   crédito; balance sin crédito.
6. **Presupuestos**: plantilla vs presupuesto del grupo, porcentaje consumido.
7. **Créditos**: fecha de corte, fecha de pago, total actual/anterior, pagos.
8. **Ahorros**: crear cuenta, historial, diferencia, fijar.
9. **Filtros**: fechas, dinero, `BETWEEN`, `IN`, relaciones y columnas
   avanzadas.
10. **Tema**: sistema/claro/oscuro, paletas base y personalizadas, contraste.

### Ejemplos de contenido

Cada tema de cálculo debe incluir un ejemplo con datos ficticios:

- Grupo “Octubre 2026”, meta 10,000.
- Ingreso 5,000, gasto 1,250, transferencia 500.
- Balance resultante y por qué.
- Qué pasa si el gasto es crédito y aún no se paga.
- Un filtro “fecha entre 1 y 31 de octubre” y otro “monto mayor a 1,000”.

Los ejemplos deben validarse contra la lógica real de `ResumesStore`,
`CreditsStore`, `BudgetStore` y `SavingsStore`.

### Búsqueda

- Normalizar minúsculas y acentos.
- Buscar en título, resumen, keywords y títulos de sección.
- Mostrar coincidencias resaltadas si es simple; si no, solo filtrar.

### Traducciones

- Todo el contenido de ayuda usa las claves tipadas de la Parte A.
- Los temas se definen una sola vez; el texto vive en `messages/help.ts`.
- Los ejemplos usan datos ficticios, no datos del usuario.

### Tests

- El registry no tiene IDs duplicados.
- Todos los temas tienen título, resumen y al menos una sección.
- Todas las claves usadas existen en inglés y español.
- Búsqueda por título, keyword y acento.
- Render del hub y de un tema.
- Navegación hub → detalle → relacionado.

### Fases de implementación

#### HELP-0 — Modelo, hub y navegación (1 día)

- Tipos, registry, hub, búsqueda y ruta dinámica.
- Tema “Primeros pasos” como piloto.

#### HELP-1 — Contenido principal (2 días)

- Registros, fijos, resúmenes, presupuestos, créditos y ahorros.
- Ejemplos y errores comunes.

#### HELP-2 — Filtros, tema y pulido (1 día)

- Filtros, tema/accesibilidad, relacionados y “Ver en la app”.
- Checklist visual y tests.

### Criterios de aceptación (ayuda)

- [ ] El hub permite buscar y abrir temas.
- [ ] Cada tema explica qué es, cómo funciona, pasos y ejemplo.
- [ ] Los ejemplos usan datos ficticios.
- [ ] Los temas se relacionan entre sí.
- [ ] Contenido bilingüe y tipado.
- [ ] Tests de registry, búsqueda y render.
- [ ] Navegación accesible y dark mode correcto.

---

## Decisiones para validar

1. **Idiomas co-localizados por dominio** en `src/lang/messages/` en lugar de
   dos JSON globales. Recomendado.
2. **`t()` tipado con `TranslationKey`** y helpers para claves dinámicas.
   Recomendado.
3. **Contenido de ayuda en `messages/help.ts`** y temas como estructura TS en
   `src/help/topics/`. Recomendado.
4. **Ruta dinámica `app/(help)/[topic].tsx`** y hub con búsqueda. Recomendado.
5. **Enlaces “Ver en la app”** desde cada tema. Recomendado, puede quedar para
   HELP-2.

Si se valida, el orden sería:

1. Completar Parte A (i18n) y migrar todas las pantallas.
2. Implementar HELP-0 con el nuevo sistema de mensajes.
3. Cargar el contenido de HELP-1 y HELP-2.
