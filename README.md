# PocketTool

PocketTool es una aplicación móvil multiplataforma (desarrollada con Expo) para gestionar finanzas personales de forma simple y rápida. Permite crear presupuestos, registrar movimientos, administrar categorías y métodos de pago, y llevar control de ahorros y créditos.

## Qué hace
- **Presupuestos**: crear y gestionar plantillas de presupuesto.
- **Registros**: anotar ingresos y gastos con categorías y tipos de registro.
- **Categorías y métodos de pago**: administrar categorías, medios de pago y formas de cobro/pago.
- **Ahorros y créditos**: llevar seguimiento de cuentas de ahorro y créditos/tarjetas.
- **Resúmenes**: ver resúmenes y estadísticas por categoría, método de pago y periodo.

## Tecnologías
- Basado en **Expo** y **React Native**.
- Código en **TypeScript** y estructura de rutas basada en el router de Expo (file-based routing).
- Almacenamiento local y handlers propios para persistencia (SQLite/ORM según la configuración del proyecto).

## Plan de fases y contexto
- Estado, fase activa y decisiones: [`docs/phases.md`](docs/phases.md)
- Índice y contrato de documentación: [`docs/README.md`](docs/README.md)
- Sistema de UI: [`docs/architecture/ui.md`](docs/architecture/ui.md)
- Reglas de negocio: [`docs/architecture/domains.md`](docs/architecture/domains.md)
- Base de datos: [`docs/database.md`](docs/database.md)
- Instrucciones para agentes: [`AGENTS.md`](AGENTS.md)
- Planes históricos: [`docs/legacy/`](docs/legacy/)


## Ejecutar localmente
1. Instalar dependencias:

```bash
npm install
```

2. Iniciar la app (Expo):

```bash
npx expo start
```

En la salida podrás elegir correr en emulador Android, simulador iOS, una build de desarrollo o en Expo Go.

