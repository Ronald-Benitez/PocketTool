export const whatsNewEn = {
  badges: {
    feature: 'New',
    improvement: 'Improved',
    fix: 'Fixed',
  },
  modal: {
    title: "What's new",
    subtitle:
      'Everything that changed since your last update, gathered in a single summary.',
    range: 'Versions {from} to {to}',
    dismiss: 'Got it',
    manualSubtitle: 'Review the changes included in recent updates.',
  },
  items: {
    sharedPurchases: {
      title: 'Shared purchases',
      body: 'Split records and fixed expenses with one or more people and choose who paid. Each person keeps their own share and payment history.',
    },
    personStatement: {
      title: 'Balance per person',
      body: 'See purchases, payments and the outstanding balance for each person, and settle it totally or partially.',
    },
    balanceModes: {
      title: 'Consumption and cash balance',
      body: 'Summaries show a double balance and let you switch between Your share, Shared, Total and Gross own amounts.',
    },
    amountSharing: {
      title: 'Share by percentage or amount',
      body: 'Choose how to split a shared expense: by percentage or by fixed amount, always calculated over the total.',
    },
    autoRefresh: {
      title: 'Up-to-date data',
      body: 'Lists and summaries refresh after fuel, maintenance or savings movements, and savings can start at 0.',
    },
    centeredPickers: {
      title: 'Centered pickers',
      body: 'Selectors open in a centered window with a maximum height and scroll, so they work better on tall screens.',
    },
    cardPaymentDate: {
      title: 'Card payment date',
      body: "Choose whether pending card payments use today's date or the card payment day in the selected month.",
    },
    fuelSegments: {
      title: 'Fuel distances',
      body: 'Fuel entries measure total distance per segment and remember the "Use odometer" choice for each vehicle.',
    },
    whatsNewRelease: {
      title: 'This summary',
      body: 'After each update, PocketTool shows a single summary of everything new. You can also open it from Help.',
    },
  },
} as const;

export type WhatsNewItemId = keyof typeof whatsNewEn.items;

export const whatsNewEs = {
  badges: {
    feature: 'Nuevo',
    improvement: 'Mejora',
    fix: 'Corrección',
  },
  modal: {
    title: 'Qué hay de nuevo',
    subtitle:
      'Todo lo que cambió desde tu última actualización, reunido en un solo resumen.',
    range: 'Versiones {from} a {to}',
    dismiss: 'Entendido',
    manualSubtitle: 'Revisa los cambios incluidos en las actualizaciones recientes.',
  },
  items: {
    sharedPurchases: {
      title: 'Compras compartidas',
      body: 'Reparte registros y gastos fijos con una o varias personas y elige quién pagó. Cada persona conserva su parte y su historial de pagos.',
    },
    personStatement: {
      title: 'Saldo por persona',
      body: 'Consulta compras, pagos y saldo pendiente de cada persona, y liquídalo de forma total o parcial.',
    },
    balanceModes: {
      title: 'Balance de consumo y caja',
      body: 'Los resúmenes muestran un doble balance y permiten alternar entre Tu parte, Compartido, Total y Propio bruto.',
    },
    amountSharing: {
      title: 'Reparto por porcentaje o monto',
      body: 'Elige cómo dividir un gasto compartido: por porcentaje o por monto fijo, siempre calculado sobre el total.',
    },
    autoRefresh: {
      title: 'Datos al día',
      body: 'Las listas y resúmenes se actualizan tras movimientos de combustible, mantenimiento o ahorros, y los ahorros pueden iniciar en 0.',
    },
    centeredPickers: {
      title: 'Selectores centrados',
      body: 'Los selectores se abren en una ventana centrada con altura máxima y scroll, para que funcionen mejor en pantallas altas.',
    },
    cardPaymentDate: {
      title: 'Fecha de pagos de tarjeta',
      body: 'Elige si los pagos pendientes de tarjeta usan la fecha de hoy o el día de pago de la tarjeta en el mes seleccionado.',
    },
    fuelSegments: {
      title: 'Distancias de combustible',
      body: 'Los registros de combustible miden la distancia total por segmento y recuerdan la opción "Usar odómetro" para cada vehículo.',
    },
    whatsNewRelease: {
      title: 'Este resumen',
      body: 'Después de cada actualización, PocketTool muestra un solo resumen con todo lo nuevo. También puedes abrirlo desde Ayuda.',
    },
  },
} as const;
