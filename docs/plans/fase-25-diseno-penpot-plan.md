# Fase 25 — Diseño en Penpot desde cero

**Cuándo leer:** al preparar el entorno Linux, levantar Penpot con Podman o
construir el nuevo diseño navegable de PocketTool.
**Resumen:** plan para crear un archivo Penpot limpio desde cero, con una
estética sólida sin glass, todas las funciones y colores conservados, y
navegación real de drawer/tabs en el modo de visualización.
**Secciones:** Estado · Decisión · Alcance · Prerrequisitos · Lecciones ·
Pipeline · Hitos · Datos · Navegación · Criterios · Verificación · Riesgos.

**Estado:** 📝 Planificado · **Inicio:** 2026-11-28
**Fase:** 25 · **Plataforma:** Linux + Podman + Android Studio; Penpot limpio
**Avance:** sin archivo de diseño creado. Nada de Penpot se da por hecho.

## Decisión

- Se parte de un **archivo Penpot nuevo**, sin páginas, tableros ni tokens.
- El código sigue siendo la fuente de verdad; Penpot es un espejo navegable y
  editable para revisar botones, modales, catálogos y pantallas.
- La dirección visual es más limpia: **se elimina el glassmorphism**, se usan
  superficies sólidas, fondo `surfaceMuted` y borde de 1 px.
- **No se elimina ninguna función, botón, modal ni color representativo.** El
  rediseño cambia la superficie, no el producto.
- Los catálogos usan solo columnas que ya existen. No se agregan campos ni
  migraciones para que el diseño “quepa”.
- La navegación se construye en **una página por modo** porque las interacciones
  de Penpot no cruzan páginas en el modo de visualización.
- Entorno objetivo: Linux con **Podman**, **Android Studio** para emulador y
  builds, y teléfono Android por `adb` cuando aporte.

## Alcance

- Fundamentos: color, tipografía, espaciado, radios y superficies.
- Kit de componentes de `src/ui`.
- 13 secciones del drawer en bright/dark.
- Catálogos internos de **Registros**: métodos, categorías, tipos de pago y
  tipos de registro.
- Drawer, tabs y flujos clave.
- Objetivo orientativo: 18 tableros por modo (13 secciones + 4 catálogos +
  drawer), 36 en total, más los 4 flujos.

Fuera de alcance: pantallas de resumen de Resumen/Compromisos, Plantillas de
Presupuesto, sub-tabs de Vehículo y cualquier campo que requiera migración.

## Prerrequisitos

- Linux con Podman y `podman compose`; Docker no es requisito.
- Penpot limpio: self-hosted con Podman o Penpot SaaS con MCP remoto.
- MCP local (`npx @penpot/mcp@stable`) o remoto; plugin abierto durante la sesión.
- Node 22, JDK 17/21, Android Studio, SDK, KVM y `adb`.
- 16 GB de RAM como mínimo; 32 GB dan margen para emulador + Penpot + navegador.
- Capturas locales de la app, fuera del repositorio; no se versionan.

## Lecciones de la prueba anterior

Se conservan como restricciones, no como trabajo hecho:

- Las interacciones de Penpot son por página; el drawer y las tabs deben vivir
  en la misma página que sus destinos.
- Scripts grandes congelan la pestaña; construir por lotes y exportar PNG tras
  cada tablero.
- Aplicar cientos de tokens a cada forma es lento; usar valores resueltos y
  reservar la aplicación de tokens para la librería.
- El glass en modo claro se veía gris y con sombras duras; se elimina.
- Categorías solo tiene `category_name`; tipos de pago, nombre y color; tipos de
  registro, nombre, `effect` y color; métodos, nombre, tipo y datos de crédito.
- Las tabs de Resumen/Compromisos son vistas de resumen, no catálogos; no se
  enlazan a las pantallas de Registros.

## Pipeline

1. **Entorno:** Linux, Podman, Penpot, MCP, Android Studio, emulador y `adb`.
2. **Tokens:** `npm run penpot:tokens` genera `dist/penpot/tokens.json` desde
   `src/ui` (sin tocar la app).
3. **Referencias:** capturas locales de la app, fuera del repositorio; se usan
   solo para comparar y no se versionan.
4. **Construcción por lotes:** `execute_code` con `storage` para reutilizar
   helpers; `penpotUtils` para estructura; `export_shape` para revisar.
5. **Navegación:** una página bright y una dark; drawer, tabs y flows dentro de
   cada página.
6. **QA:** capturas del emulador/teléfono contra los tableros; registrar
   desviaciones.

## Hitos

| Hito | Entrega | Verificación |
| --- | --- | --- |
| M1 | Linux + Podman + Penpot + MCP + Android Studio + adb | Smoke test y build |
| M2 | Fundamentos y tokens bright/dark | Cambio de modo y export |
| M3 | Kit de componentes | Catálogo vs `app/gallery.tsx` |
| M4 | 13 pantallas bright/dark en una página por modo | Navegación y PNG |
| M5 | Catálogos de Registros con campos reales | Datos vs app |
| M6 | Drawer, tabs, flows y 4 modales | Interacciones en visualización |
| M7 | QA con emulador/teléfono y documentación | Capturas + `docs:audit` |

## Datos

- **Métodos:** `method_name`, `payment_type_name`, `closing_date`,
  `payment_date`, `credit_limit`. Sin cuentas ni bancos inventados.
- **Categorías:** solo `category_name`; sin color, uso ni monto.
- **Tipos de pago:** `payment_type_name` y `payment_color`.
- **Tipos de registro:** `type_name`, `effect` (`+`, `−`, `=`) y
  `record_color`.
- Los catálogos avanzados dependen de `advancedCatalogs`; el diseño los cubre,
  pero la app puede ocultarlos.

## Navegación

- Penpot no navega entre páginas en visualización; cada modo concentra sus
  destinos.
- Flows `PocketTool · Bright` y `PocketTool · Dark`, desde Inicio.
- Menú → drawer; filas del drawer → sección; tabs de Registros → catálogos.
- Resumen/Compromisos: tabs sin enlace hasta diseñar sus vistas de resumen.

## Criterios

1. Existe un archivo Penpot nuevo con fundamentos, kit y las 13 secciones en
   bright/dark.
2. No hay glass ni sombras duras; se conservan funciones, botones, modales y
   colores representativos.
3. Los catálogos usan solo campos existentes; no hay migraciones.
4. Drawer y tabs navegan dentro de cada página y hay flows funcionales.
5. Los cuatro catálogos de Registros coinciden con los datos reales.
6. La documentación queda actualizada y `docs:audit` pasa; no se tocó la app.

## Verificación

- `podman compose ps` / `podman ps` y smoke test del MCP.
- `npm run doctor`, `npm run typecheck`, `npm run test:db`, `npm test`.
- `npm run apk-local` con Android Studio/SDK en Linux.
- `adb devices`, instalación del APK y capturas del emulador/teléfono.
- `npm run penpot:tokens` y `npm run docs:audit`.

## Riesgos

- **Podman + Penpot:** compatibilidad de compose, puertos y volúmenes; validar
  antes de construir.
- **RAM:** 16 GB alcanzan con Linux y Podman, pero el emulador sigue siendo el
  mayor consumidor; usar teléfono cuando sea posible.
- **Pestaña de Penpot:** el navegador puede suspenderla; mantenerla activa y
  construir por lotes.
- **Deriva de esquema:** si un dato no existe, se propone en otra fase; no se
  dibuja como si existiera.

## No objetivos

- Cambiar código de la app en esta fase.
- Agregar migraciones, campos o funcionalidades.
- Rediseñar la identidad visual o quitar acciones existentes.
- Replicar cada estado o modal secundario.
