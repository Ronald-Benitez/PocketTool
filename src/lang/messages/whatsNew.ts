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
    closing: {
      title: 'Closing',
      body: 'A new section calculates what you have and what you must pay for a period without changing records, debts or savings. Compare each card with your statement, autofill cards, fixed expenses and financings, attach registered data without duplicates, choose the balance to use and add your own lines. If money is short, choose where it comes from; if it is left over, choose where it goes.',
    },
    closingPeriod: {
      title: 'Configurable closing period',
      body: 'Use a calendar month, a cutoff day, a start day or a custom range, with grace days and its own deadline. Keep several drafts or a single final with history; expired closings are read-only.',
    },
    pendingCardDate: {
      title: 'Next card payment date',
      body: 'Pending card payments can use the next card payment day as their date, in addition to today or the payment day of the group month.',
    },
    pendingFixedDates: {
      title: 'Pending fixed expenses',
      body: 'Choose whether a pending fixed expense uses the fixed day of the group month or the next occurrence from today, and whether already-paid ones are detected only in the selected group or by period. Applies to Records and Home.',
    },
    cardSavingRule: {
      title: 'Card and savings',
      body: 'A new record can no longer combine a credit card with savings. Historical records keep their data and are only flagged in the closing.',
    },
    summaryEffects: {
      title: 'Summaries with correct effects',
      body: 'Summaries now apply the effect of each record type, including gross paid: income adds and expenses subtract. The general balance and the summaries use the same selected record types.',
    },
    stableGroup: {
      title: 'Stable selected group',
      body: 'Changing views no longer resets the selected group to the last registered group.',
    },
    backupSettings: {
      title: 'Settings in backups',
      body: 'Backups now include app settings such as selected record types, language, theme, balance modes and closing rules.',
    },
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
    groupPeriods: {
      title: 'Groups with their own period',
      body: 'Settings now define when each group starts and ends: a calendar month or a start day of the month. Groups and closings share that period, and existing groups keep the one they already have.',
    },
    autoGroup: {
      title: 'Current group, ready',
      body: 'Turn on automatic creation and PocketTool creates the group of the current period when you open the app, only if no group covers today. You can also create it from Settings, and new groups show their period before saving.',
    },
    periodSuggestion: {
      title: 'Records outside the period',
      body: "If a record's date falls outside the period of the selected group, PocketTool points to the group it belongs to so you can switch in the selector. Nothing moves on its own.",
    },
    nativeCharts: {
      title: 'New charts',
      body: "Budget, Vehicle, Fuel, Credits and Savings now use PocketTool's own charts: line, bar, grouped, stacked, pie, donut and area. Tap a point, bar or slice for details, hide series, limit points, zoom and open the data table for exact values.",
    },
    chartPreferences: {
      title: 'Charts as you left them',
      body: 'Expand or collapse charts and keep series, limit, zoom and comparison mode for each chart; PocketTool remembers it. Fuel charts start collapsed so your records stay in view, and some charts switch between indexed comparison and real data.',
    },
    androidAvailability: {
      title: 'More Android devices',
      body: 'PocketTool no longer requires portrait support on Android, so it can be installed on more devices such as tablets and foldables. The app still opens in portrait.',
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
    closing: {
      title: 'Cierre',
      body: 'Una sección nueva calcula lo que tienes y lo que debes pagar en un periodo sin modificar registros, deudas ni ahorros. Compara cada tarjeta con tu estado de cuenta, autocompleta tarjetas, gastos fijos y financiamientos, vincula datos registrados sin repetirlos, elige el balance a usar y agrega tus propias líneas. Si falta dinero, elige de dónde sale; si sobra, elige a dónde va.',
    },
    closingPeriod: {
      title: 'Periodo del cierre configurable',
      body: 'Usa mes calendario, día de corte, día de inicio o un rango personalizado, con días de gracia y su propia fecha límite. Guarda varios borradores o un solo final con historial; los cierres vencidos son de solo lectura.',
    },
    pendingCardDate: {
      title: 'Próxima fecha de pago de tarjeta',
      body: 'Los pagos pendientes de tarjeta pueden usar el próximo día de pago como fecha, además de hoy o el día de pago del mes del grupo.',
    },
    pendingFixedDates: {
      title: 'Gastos fijos pendientes',
      body: 'Elige si un gasto fijo pendiente usa el día del fijo en el mes del grupo o la próxima ocurrencia desde hoy, y si los ya pagados se detectan solo en el grupo seleccionado o por periodo. Aplica en Registros e Inicio.',
    },
    cardSavingRule: {
      title: 'Tarjeta y ahorros',
      body: 'Un registro nuevo ya no puede combinar una tarjeta de crédito con ahorros. Los registros históricos conservan sus datos y solo se advierten en el cierre.',
    },
    summaryEffects: {
      title: 'Resúmenes con efectos correctos',
      body: 'Los resúmenes ahora aplican el efecto de cada tipo de registro, incluido el propio bruto: los ingresos suman y los gastos restan. El balance general y los resúmenes usan los mismos tipos seleccionados.',
    },
    stableGroup: {
      title: 'Grupo seleccionado estable',
      body: 'Cambiar de vista ya no reinicia el grupo seleccionado al último grupo registrado.',
    },
    backupSettings: {
      title: 'Configuraciones en el respaldo',
      body: 'Los respaldos ahora incluyen configuraciones como tipos de registro seleccionados, idioma, tema, modos de balance y reglas de cierre.',
    },
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
    groupPeriods: {
      title: 'Grupos con su propio periodo',
      body: 'Ajustes ahora define cuándo empieza y termina cada grupo: mes calendario o un día de inicio del mes. Grupos y cierres comparten ese periodo, y los grupos existentes conservan el que ya tenían.',
    },
    autoGroup: {
      title: 'Grupo actual listo',
      body: 'Activa la creación automática y PocketTool crea el grupo del periodo actual al abrir la app, solo si ningún grupo cubre hoy. También puedes crearlo desde Ajustes, y los grupos nuevos muestran su periodo antes de guardar.',
    },
    periodSuggestion: {
      title: 'Registros fuera del periodo',
      body: 'Si la fecha de un registro cae fuera del periodo del grupo seleccionado, PocketTool señala el grupo al que pertenece para que cambies en el selector. Nada se mueve solo.',
    },
    nativeCharts: {
      title: 'Gráficos nuevos',
      body: 'Presupuesto, Vehículo, Combustible, Créditos y Ahorros usan ahora los gráficos propios de PocketTool: línea, barra, agrupada, apilada, pastel, dona y área. Toca un punto, barra o porción para ver el detalle, oculta series, limita puntos, haz zoom y abre la tabla de datos para valores exactos.',
    },
    chartPreferences: {
      title: 'Gráficos como los dejaste',
      body: 'Expande o colapsa gráficos y conserva series, límite, zoom y modo de comparación de cada uno; PocketTool lo recuerda. En Combustible empiezan colapsados para dejar los registros a la vista, y algunos gráficos alternan entre comparación indexada y datos reales.',
    },
    androidAvailability: {
      title: 'Más dispositivos Android',
      body: 'PocketTool ya no exige compatibilidad con pantalla vertical en Android, así que se puede instalar en más dispositivos, como tablets y plegables. La app sigue abriéndose en vertical.',
    },
  },
} as const;
