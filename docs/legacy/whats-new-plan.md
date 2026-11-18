# Fase 14 — “Qué hay de nuevo” acumulado

**Cuándo leer:** solo para revisar el diseño histórico de la Fase 14; las reglas
vigentes están en
[`../../src/release-notes/AGENTS.md`](../../src/release-notes/AGENTS.md).
**Resumen:** resumen acumulado de novedades después de actualizar, con un solo
modal para todas las versiones pendientes, catálogo bilingüe manual y acceso
manual desde Ayuda.
**Estado:** ✅ Finalizada 2026-11-17.
**Fecha:** 2026-11-17.
**Leer solo si:** necesitas el contexto original, la excepción de lanzamiento
4.0.5 o el detalle de las decisiones.
**Secciones:** [Alcance](#alcance) · [Catálogo](#catálogo) ·
[Reglas de versiones](#reglas-de-versiones) · [UI](#ui) ·
[Integración](#integración) · [Ayuda](#ayuda) · [Pruebas](#pruebas) ·
[Riesgos](#riesgos) · [Verificación](#verificación) ·
[Implementación](#implementación) ·
[Decisiones confirmadas](#decisiones-confirmadas) ·
[Excepción de lanzamiento](#excepción-de-lanzamiento-confirmada)

## Alcance

Incluye:

- Detectar la versión instalada y compararla con la última versión vista.
- Si hay una o varias versiones nuevas, mostrar **un solo modal** con todas las
  novedades acumuladas.
- Guardar la versión vista al cerrar el modal.
- Reabrir el resumen manualmente desde la sección especial de Ayuda.
- Catálogo bilingüe de novedades por versión.
- Ayuda y textos.

No incluye:

- Noticias remotas ni backend.
- Analítica.
- Cambios en la base de datos.
- Movimientos de dinero.

## Catálogo

### Fuente de contenido

- `src/release-notes/catalog.ts`: catálogo tipado con:
  - `version` (semver);
  - `date`;
  - `items[]` con `kind` (`feature`, `improvement`, `fix`), `titleKey`, `bodyKey`.
- `src/lang/messages/whatsNew.ts`: textos EN/ES co-localizados con las claves
  usadas por el catálogo. Se registra en `src/lang/messages/index.ts` y en
  `TranslationKey`.
- Semilla inicial: solo **4.0.5**, la próxima versión.
  - Incluye los cambios acumulados de la Fase 12 (compras compartidas, estado de
    cuenta, liquidaciones, doble balance y modos de importe), la Fase 13
    (compartidos por monto, refresco, pickers centrados, fecha de pagos de
    tarjeta, gasolina y ahorros 0) y esta Fase 14 (resumen de novedades).
  - No se siembran versiones históricas.
  - Las versiones futuras se agregan al publicar.
- Actualizar `package.json`, `package-lock.json` y `app.json` de `4.0.4` a
  `4.0.5` en el mismo cambio de release.
- Mantener sincronizados `docs/release-notes/` y el catálogo. El catálogo es la
  fuente de la app; las notas de Play son la fuente pública.

### Reglas de versiones

- Comparación semver numérica por segmentos (`4.0.10 > 4.0.9`).
- Si no hay versión guardada:
  - regla general: marcar la versión actual como vista en silencio;
  - excepción de lanzamiento 4.0.5: si no hay clave, asumir que viene de una
    versión anterior y mostrar 4.0.5, para que los usuarios actuales vean lo
    acumulado. Después de 4.0.5, una instalación nueva se marca en silencio.
- Si la versión guardada es igual a la actual: no mostrar.
- Si es menor: mostrar todas las versiones del catálogo mayores a la guardada y
  menores o iguales a la actual.
- Si es mayor (downgrade): no mostrar y actualizar la versión guardada.
- Si la versión actual no existe en el catálogo: no mostrar y registrar la versión.
- Versiones del catálogo ordenadas y sin duplicados.

### Almacenamiento

- AsyncStorage: `whatsNewLastSeenVersion`.
- Se actualiza al cerrar el modal.
- Si la app se cierra sin cerrar el modal, se vuelve a mostrar en el siguiente
  arranque.
- No entra en backups de SQLite.

## UI

- `src/components/whats-new/WhatsNewGate.tsx`:
  - se monta en `app/_layout.tsx` dentro de `LanguageProvider`/`ToastProvider`;
  - lee la versión actual y la guardada;
  - abre el modal si hay novedades pendientes.
- `src/components/whats-new/WhatsNewModal.tsx`:
  - `Modal` centrado, `scrollable`, con `maxHeight` y un único botón
    “Entendido”;
  - título “Qué hay de nuevo”;
  - subtítulo con el rango de versiones acumuladas;
  - una `Surface` por versión con fecha y lista de items;
  - iconos/badges por tipo (`Nuevo`, `Mejora`, `Corrección`);
  - un solo scroll; no hay wizard ni pasos múltiples.
- `src/components/whats-new/WhatsNewItem.tsx` (opcional) para la fila.
- Ayuda: sección especial “Qué hay de nuevo” en el hub de Ayuda que abre el
  resumen completo sin cambiar la versión guardada.
- Sin colores nuevos: tokens de `useTheme()`; `Badge`, `Surface`, `AppText`,
  `FinanceValue` no aplica.

## Integración

- `app/_layout.tsx`: `<WhatsNewGate />` junto a `AppShell`.
- `app/(help)/index.tsx`: entrada especial “Qué hay de nuevo” que abre el modal.
- `src/hooks/useWhatsNew.ts`:
  - `pendingVersions`, `currentVersion`, `markSeen`, `openManual`;
  - lee `Constants.expoConfig?.version`;
  - no bloquea el arranque ni la migración de la base.
- Si no hay versión disponible, no muestra nada.
- Actualizaciones solo por tienda: no se usa `expo-updates`; la versión de la app
  es la fuente de verdad.
- No usa `useORM` ni repositorios.

## Ayuda

- Nuevo tema `whatsNew`:
  - categoría `start`;
  - relacionado con `gettingStarted`, `theme` y `filters`;
  - explica que al actualizar se muestra un resumen acumulado y que también se
    puede abrir desde Ayuda.
- Sección especial en el hub de Ayuda, antes de las categorías, con acceso
  directo al resumen completo.
- Actualizar `HelpTopicId`, `src/help/registry.ts` y
  `src/lang/messages/help.ts` EN/ES.

## Pruebas

- Dominio:
  - comparación semver;
  - selección con sin versión guardada, misma versión, una nueva, varias
    acumuladas, downgrade, versión actual ausente;
  - orden y unicidad del catálogo.
- Catálogo:
  - la versión de `package.json` existe en el catálogo (o se actualiza en el
    mismo cambio de release);
  - todas las claves de texto existen en EN/ES.
- Ayuda:
  - registro del tema y paridad bilingüe.
- Manual:
  - instalación limpia;
  - actualización desde una versión anterior;
  - varias versiones acumuladas;
  - cierre y reapertura;
  - Ayuda → “Qué hay de nuevo”;
  - dark mode, texto largo y scroll.

## Riesgos

- Catálogo y notas de Play desincronizados: checklist de release y test de la
  versión actual.
- Mostrar novedades en el primer arranque puede molestar: se marca visto, con la
  excepción de lanzamiento de 4.0.5.
- El modal no debe bloquear la migración de SQLite ni el splash.
- Textos duplicados entre ayuda y catálogo: mantener claves separadas.

## Verificación

```bash
npm run typecheck
npm test
npm run lint
npm run docs:audit
npm run ci
```

Además: QA manual de actualización simulada cambiando la versión guardada y
probando varias versiones acumuladas.

## Implementación

- Catálogo en `src/release-notes/catalog.ts`; comparación y selección en
  `src/release-notes/versions.ts`; pruebas en `src/release-notes/__tests__/`.
- `useWhatsNew` más `WhatsNewGate`/`WhatsNewModal`; montaje en
  `app/_layout.tsx`.
- Acceso manual desde la sección especial del hub de Ayuda y tema `whatsNew`.
- Versión 4.0.5 en `package.json`, `package-lock.json` y `app.json`.
- Mantenimiento vigente en `src/release-notes/AGENTS.md`; `/notas-version`
  genera notas de Play, catálogo in-app y bump de versión.
- Commits: `1eb2061`, `7b59c00`, `0dbc416`, `eedaaf1`, `ce01b8e`.

## Decisiones confirmadas

1. Instalación nueva: marcar la versión actual como vista en silencio.
2. Catálogo inicial: solo **4.0.5**, con los cambios de Fases 12, 13 y 14. No
   sembrar versiones históricas.
3. Acceso manual: sección especial en **Ayuda**.
4. Actualizaciones solo por tienda; sin `expo-updates`.

## Excepción de lanzamiento confirmada

- En 4.0.5, si no existe la clave de última versión vista, se muestra el resumen
  asumiendo una actualización desde 4.0.4. Esto también cubre instalaciones
  nuevas de 4.0.5 una única vez.
- Desde 4.0.6 en adelante, una instalación nueva marca la versión actual como
  vista en silencio.
