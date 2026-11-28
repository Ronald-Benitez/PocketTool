# Fase 24 — Escaneo de facturas para lista de compras

**Cuándo leer:** al implementar o revisar el escaneo de facturas de Compras.
**Resumen:** flujo Android para fotografiar una factura, extraer ítems con OCR
en el dispositivo, revisarlos y crear una lista cerrada que termina en el
formulario de compra existente para registrar el `Record`.
**Secciones:** Implementación · QA · Decisión · Flujo · Spike · Diseño técnico ·
Datos · Registros · Builds · Criterios · Verificación · Riesgos · Deuda.

**Estado:** ⏸️ En espera · **Inicio:** 2026-11-25
**Fase:** 24 · **Plataforma:** Android (iOS oculto y diferido)
**Avance:** MVP implementado y validado en emulador; en pausa hasta el QA con la
factura real en un teléfono.

## Implementación

- [x] Spike de OCR y decisión GO.
- [x] Migración `0028`: `quantity` y `unit` opcionales.
- [x] Parser de filas y tests con la factura de ejemplo.
- [x] Repositorio `createListWithItems` transaccional.
- [x] Acción Android-only, captura y revisión editable.
- [x] Lista cerrada + formulario de compra precargado.
- [x] i18n, ayuda y política de builds documentada.
- [x] R8 con reglas ProGuard de ML Kit validadas en release.
- [ ] QA manual con cámara/gallery en teléfono.
- [ ] Cierre de fase y notas de versión.

Verificación local: `typecheck`, 389 tests, `test:db`, lint (0 errores),
`doctor` 20/20 y `docs:audit` en verde. Los APK locales incluyen el OCR; el
tamaño sube a ~50 MB por ABI.

Artefactos generados:

- `dist/apk-local/PocketTool-4.0.7-vc43-x86_64.apk` (emulador).
- `dist/apk-local/PocketTool-4.0.7-vc43-arm64-v8a.apk` (teléfono).

En el emulador se validó el OCR de release con R8 activo, la revisión editable,
la creación de la lista cerrada y la apertura del formulario de compra
precargado. La selección automatizada eligió una captura en vez de la factura,
así que la validación con la imagen real queda para el teléfono.

### QA pendiente en teléfono

1. Instalar el APK arm64; si hay una versión de Play/EAS con otra firma, respaldar
   y desinstalar antes (el APK local usa la firma debug de Expo).
2. Compras → Escanear factura → Tomar foto de la factura completa y con buena luz.
3. Revisar nombres, precios, cantidades y el aviso de total; corregir lo que falle.
4. Crear la lista, confirmar que abre el formulario con total y fecha, y guardar
   el `Record` (crear, vincular u omitir).
5. Repetir desde galería con la misma imagen y con una foto rotada o con poca luz.


## Decisión

- OCR **en el dispositivo** (sin nube ni API keys) con Google ML Kit.
- Captura con cámara del sistema o galería (`expo-image-picker`).
- La lista escaneada siempre es **nueva**.
- La previsualización es editable: nombre de lista, ítems, precios,
  cantidades/unidades, incluir/excluir, agregar y eliminar.
- Al confirmar se crea la lista cerrada y se abre `ShoppingPurchaseForm`
  precargado con total y fecha; el usuario confirma crear, vincular u omitir el
  `Record`.
- El total de la factura solo se valida de forma suave: nota visible si no
  coincide con la suma o si no se detectó.

## Flujo

1. Compras → “Escanear factura” (solo Android).
2. Elegir “Tomar foto” o “Elegir de galería”.
3. OCR local; estado de carga y errores claros.
4. Revisión:
   - Nombre sugerido: `Walmart Escalón · 25/11/2026`.
   - Cada ítem con nombre, precio total de línea, cantidad y unidad opcionales.
   - Suma de ítems y total de factura detectado.
   - Nota no bloqueante si los totales no coinciden o falta el total.
5. Confirmar:
   - Insertar lista + ítems en una transacción, con estado cerrado y todos los
     ítems incluidos marcados como comprados.
   - Abrir el formulario de compra con importe y fecha precargados.
6. Guardar el `Record` con el flujo existente. Si se cancela, la lista queda
   cerrada y puede registrarse después.

## Spike

**Estado:** ✅ Validado (2026-11-25). Decisión: **GO**.

Objetivo: validar OCR/ML Kit antes de integrar dependencias nativas en
PocketTool.

- App Expo mínima temporal, SDK 58 / RN 0.88, fuera del repositorio.
- Dependencias: `expo-image-picker`, `expo-mlkit-ocr`, `expo-asset`.
- Probar `extras/ejemplo-factura.jpeg` (495×1600) y una foto de alta resolución.
- Medir calidad, tiempo, ABIs del emulador x86_64 y tamaño agregado.
- Entregable: texto OCR, ítems detectados, decisión go/no-go y recomendación
  entre `expo-mlkit-ocr` y un módulo Expo local solo Android.
- No modificar PocketTool durante el spike.

### Resultado del spike

- ML Kit corre en el emulador Android **x86_64**, sin red ni API keys.
- La imagen original de 495×1600 no basta para la columna de precios. Con la
  misma imagen ampliada 3× (1485×4800) el OCR leyó **todos los precios y
  códigos** de los ítems, con errores normales (`CHOC0ZUCA`, `HELIDS`).
- Agrupar líneas por `boundingBox` reconstruyó filas coherentes:
  `YOGURT 6P 78700300140 1.65 G`, `CALCETIN ...` + `3 UN. X $1.25 3.75 G`,
  `MUSL PIER ...` + `3.139 lb A 1.80/lb 5.65 G` + `Equivalente 1.424 kg`, etc.
- La suma de los 11 ítems da `$24.90`, igual al `TOTAL` de la factura.
- Tiempo: ~4.6 s para 1485×4800 en el emulador; aceptable con estado de carga.
- R8 elimina los registradores de ML Kit y rompe el OCR
  (`NoSuchMethodException`). Se corrigió con:
  `-keep class com.google.mlkit.** { *; }` y los paquetes
  `com.google.android.gms.internal.mlkit_vision_*`; **validado con
  `minifyReleaseWithR8` activo**.
- `expo-mlkit-ocr` necesita una URI de archivo real. Un asset del bundle
  (`assets_...`) falla; escribir la imagen a caché funciona. En producción,
  normalizar la captura a un archivo (picker/manipulator) antes de OCR.
- `expo-file-system` en SDK 58: usar la API nueva (`File`/`Directory`) o
  importar `expo-file-system/legacy`; la API legacy desde el barrel principal
  lanza aviso/error.
- El heurístico simple sobre filas detectó los 11 ítems con precio y sumó
  `$24.90`. El parser MVP debe asociar las líneas de cantidad/peso al ítem
  anterior y limpiar códigos (`CHOC0ZUCA` → `CHOCOZUCA`, `ESCAROLA 7303` →
  `ESCAROLA`).
- Decisión MVP: usar `expo-mlkit-ocr` (validado) con la opción oculta en iOS;
  reglas ProGuard vía `expo-build-properties` y captura en alta resolución.
- No se modificó PocketTool.


## Diseño técnico

### OCR

- Interfaz: `recognizeText(uri)` → texto, bloques, líneas y cajas.
- Importación perezosa para que Expo Go y el resto de módulos sigan funcionando;
  si el módulo nativo no está disponible, mostrar que se requiere un build de
  desarrollo.
- Si `expo-mlkit-ocr` no convence, módulo Expo local Android-only envolviendo
  ML Kit. Evita pods y deployment target de iOS.

### Parser

- `src/domain/shopping/receipt.ts`, puro y testeable.
- Usar coordenadas: nombre a la izquierda, código al centro, precio a la
  derecha; zona entre `NOMBRE` y `SUBTOTAL`.
- Soportar línea simple, cantidad (`3 UN. X $1.25`) y peso
  (`0.690 lb A 2.10/lb` + `Equivalente 0.313 kg`).
- Ignorar totales, IVA, pago, autorización, QR y pie.
- Convertir a centavos; nota si `suma ≠ total` o falta el total.
- Devolver ítems con confianza y advertencias; nunca bloquear por el total.
- Fixtures de texto, no la imagen. `extras/` sigue ignorado.

### Datos

- Migración nueva (siguiente a `0027`):
  - `quantity` REAL nullable.
  - `unit` TEXT nullable (`unit`, `kg`, `lb`, `l`, `ml`, `g` como opciones de
    UI).
- Zod, tipos generados y `docs/schema.md` regenerados.
- `price_cents` sigue siendo el total de la línea; la cantidad no altera
  `calculateShoppingTotal`. El precio unitario queda para el futuro módulo de
  productos.

### Repositorio

- `createClosedListWithItems` / `createListWithItems` transaccional.
- Insertar lista e ítems con `sort_order`, `is_checked` y `status` en una sola
  transacción.
- No usar `addItem` en bucle para el escaneo.

### UI

- Acción Android-only en Compras.
- Componente de revisión con `Modal`/hoja de `src/ui`, evitando primitivas
  nativas.
- Formularios existentes: `TextField`/`MoneyField` para ítems; cantidad/unidad
  opcionales.
- Permisos de cámara con mensaje y acceso a ajustes si se deniegan.
- Errores de OCR, imagen o “no se detectaron ítems” con salida manual.

### Registros

- Reutilizar `ShoppingPurchaseForm`; añadir imports iniciales opcionales de
  importe y fecha.
- Mantener crear/vincular/omitir y la transacción de `registerPurchase`.
- Si el total de factura existe, precargarlo; si no, la suma calculada.
- Si no hay grupo para la fecha, el formulario existente lo indica y permite
  omitir el `Record`.

### i18n y ayuda

- Claves bilingües en `src/lang/messages/shopping.ts`.
- Tema de ayuda de escaneo actualizado en el mismo cambio.
- Sin textos sueltos.

### Builds

- Un único rebuild inicial al añadir el módulo nativo.
- Cambios JS/TS de Compras: Metro, sin rebuild.
- Cambios nativos, `app.json`, plugins o Gradle: prebuild + build.
- Pruebas automáticas: `npm test`, `npm run test:db`, sin build.
- La prueba manual del OCR se hace solo sobre un build de desarrollo/APK.
- Cambios en módulos que no tocan Compras ni configuración nativa no deben
  generar builds.
- Documentar esta matriz en `docs/architecture/features.md` o `README.md`.

## Criterios de aceptación

- OCR local funciona en Android sin subir la imagen.
- La revisión permite corregir todos los datos antes de crear la lista.
- La lista se crea cerrada y el formulario de compra abre con total/fecha.
- El `Record` se crea, vincula u omite con el flujo existente.
- Cantidades/unidades son opcionales y no alteran los totales actuales.
- iOS no muestra la opción y no se rompe por el módulo OCR.
- La documentación de builds y la ayuda quedan actualizadas.

## Verificación

- `npm run typecheck`
- `npm test`
- `npm run test:db`
- `npm run lint`
- `npm run db:generate` (tras el esquema)
- `npm run docs:audit`
- `npm run apk-local -- --abi arm64-v8a` y prueba en teléfono.
- Prueba OCR con galería y cámara; factura larga, poca luz y foto rotada.

## Riesgos

- **Calidad OCR variable:** revisión editable y nota de total; no prometer
  automatización total.
- **Dependencia nativa de terceros:** spike previo; fallback a módulo Expo local
  Android-only.
- **Impacto en builds:** documentar la matriz y mantener importación perezosa.

## Deuda y futuro

- iOS: mostrar la opción cuando se valide el módulo y el deployment target.
- Cámara propia con guía de encuadre y recorte.
- Guardar imagen/OCR y reprocesar.
- Agregar ítems a listas existentes.
- Precio unitario y cálculos por producto usando `quantity` y `unit`.
- QR/DTE de Hacienda como posible fuente estructurada, solo si es estable.
