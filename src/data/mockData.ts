import { User, Vehicle, Route, Ticket, ChecklistTemplate, InspectionRecord, PreventivePlan, FleetDocument } from '../types';

export const initialUsers: User[] = [
  {
    id: 'usr-operador-1',
    name: 'Juan Pérez (Chofer Ruta 125)',
    role: 'operador',
    email: 'ruta125@flotacheck.com',
    phone: '+52 55 1234 5678',
    defaultRouteId: 'r-125',
    defaultVehicleId: 'v-507',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    driverLicense: {
      licenseNumber: 'LIC-FED-884920',
      category: 'Tipo B - Transporte Federal de Carga',
      expiresAt: '2026-11-30'
    }
  },
  {
    id: 'usr-operador-2',
    name: 'Miguel Torres (Chofer Ruta 101)',
    role: 'operador',
    phone: '+52 55 2345 6789',
    defaultRouteId: 'r-101',
    defaultVehicleId: 'v-101',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    driverLicense: {
      licenseNumber: 'LIC-FED-773104',
      category: 'Tipo B - Carga Pesada',
      expiresAt: '2027-04-15'
    }
  },
  {
    id: 'usr-operador-3',
    name: 'Esteban Rivas (Chofer Comodín / Volante)',
    role: 'operador',
    phone: '+52 55 3456 7890',
    defaultRouteId: 'r-402',
    defaultVehicleId: 'v-304',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    driverLicense: {
      licenseNumber: 'LIC-FED-991203',
      category: 'Tipo E - Doble Articulado y Carga General',
      expiresAt: '2026-09-20'
    }
  },
  {
    id: 'usr-mecanico-1',
    name: 'Roberto Gómez (Jefe de Taller)',
    role: 'mecanico',
    email: 'taller@flotacheck.com',
    phone: '+52 55 9876 5432',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'usr-mecanico-2',
    name: 'Andrés Morales (Mecánico Diésel)',
    role: 'mecanico',
    phone: '+52 55 8765 4321',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'usr-admin-1',
    name: 'Carlos Mendoza (Supervisor de Flotilla)',
    role: 'administrador',
    email: 'gerencia@flotacheck.com',
    phone: '+52 55 5555 1234',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
  }
];

export const initialVehicles: Vehicle[] = [
  {
    id: 'v-507',
    economicNumber: '507',
    codeName: 'Camión 507',
    plate: 'MX-507-A',
    model: 'Freightliner M2 106 (2022)',
    type: 'Camión Pesado Carga',
    status: 'activa',
    currentRouteId: 'r-125',
    assignedOperatorId: 'usr-operador-1',
    assignedOperatorName: 'Juan Pérez',
    odometerKm: 148500,
    qrCodeValue: 'FLOTACHECK:UNIT:v-507'
  },
  {
    id: 'v-101',
    economicNumber: '101',
    codeName: 'Camión 101',
    plate: 'MX-101-B',
    model: 'International Durastar (2021)',
    type: 'Camión Mediano',
    status: 'activa',
    currentRouteId: 'r-101',
    assignedOperatorId: 'usr-operador-2',
    assignedOperatorName: 'Miguel Torres',
    odometerKm: 98400,
    qrCodeValue: 'FLOTACHECK:UNIT:v-101'
  },
  {
    id: 'v-304',
    economicNumber: '304',
    codeName: 'Camión 304',
    plate: 'MX-304-C',
    model: 'Kenworth T370 (2023)',
    type: 'Camión Pesado',
    status: 'activa',
    currentRouteId: 'r-402',
    assignedOperatorId: 'usr-operador-3',
    assignedOperatorName: 'Esteban Rivas',
    odometerKm: 62100,
    qrCodeValue: 'FLOTACHECK:UNIT:v-304'
  },
  {
    id: 'v-12',
    economicNumber: '12',
    codeName: 'Camión 12',
    plate: 'MX-012-D',
    model: 'Freightliner M2 (2020)',
    type: 'Camión Pesado',
    status: 'bloqueada',
    currentRouteId: 'r-88',
    blockedReason: 'Falla crítica detectada en sistema de frenos neumático',
    criticalTicketId: 'TK-2501',
    odometerKm: 182300,
    qrCodeValue: 'FLOTACHECK:UNIT:v-12'
  },
  {
    id: 'v-07',
    economicNumber: '07',
    codeName: 'Camión 07 (Respaldo)',
    plate: 'MX-007-E',
    model: 'Isuzu Forward 800 (2022)',
    type: 'Camión Mediano',
    status: 'activa',
    currentRouteId: undefined, // Disponible en patio para reemplazo
    odometerKm: 45200,
    qrCodeValue: 'FLOTACHECK:UNIT:v-07'
  },
  {
    id: 'v-89',
    economicNumber: '89',
    codeName: 'Camión 89 (Respaldo)',
    plate: 'MX-089-F',
    model: 'Hino Serie 500 (2021)',
    type: 'Camión Mediano',
    status: 'activa',
    currentRouteId: undefined, // Disponible en patio para reemplazo
    odometerKm: 78900,
    qrCodeValue: 'FLOTACHECK:UNIT:v-89'
  }
];

export const initialRoutes: Route[] = [
  {
    id: 'r-125',
    code: '125',
    name: 'Ruta 125',
    zone: 'Sector Industrial - Norte',
    assignedVehicleId: 'v-507',
    assignedOperatorId: 'usr-operador-1',
    assignedOperatorName: 'Juan Pérez',
    status: 'activa',
    notes: 'Ruta con alto volumen de carga pesada',
    history: [
      {
        id: 'h-1',
        date: '2026-08-01T08:00:00.000Z',
        newVehicleId: 'v-507',
        newVehicleName: 'Camión 507',
        reason: 'Asignación titular de inicio de operación',
        assignedBy: 'Despacho Central'
      }
    ]
  },
  {
    id: 'r-101',
    code: '101',
    name: 'Ruta 101',
    zone: 'Centro - Corredor Poniente',
    assignedVehicleId: 'v-101',
    assignedOperatorId: 'usr-operador-2',
    assignedOperatorName: 'Miguel Torres',
    status: 'activa',
    notes: 'Entrega comercial y distribución urbana',
    history: [
      {
        id: 'h-2',
        date: '2026-08-01T08:00:00.000Z',
        newVehicleId: 'v-101',
        newVehicleName: 'Camión 101',
        reason: 'Asignación titular',
        assignedBy: 'Despacho Central'
      }
    ]
  },
  {
    id: 'r-402',
    code: '402',
    name: 'Ruta 402',
    zone: 'Zona Metropolitana Sur',
    assignedVehicleId: 'v-304',
    assignedOperatorId: 'usr-operador-3',
    assignedOperatorName: 'Esteban Rivas',
    status: 'activa',
    notes: 'Ruta de larga distancia',
    history: [
      {
        id: 'h-3',
        date: '2026-08-01T08:00:00.000Z',
        newVehicleId: 'v-304',
        newVehicleName: 'Camión 304',
        reason: 'Asignación titular',
        assignedBy: 'Despacho Central'
      }
    ]
  },
  {
    id: 'r-88',
    code: '88',
    name: 'Ruta 88',
    zone: 'Periférico / Aeropuerto',
    assignedVehicleId: 'v-12',
    status: 'activa',
    notes: 'Unidad asignada presenta reporte crítico',
    history: [
      {
        id: 'h-4',
        date: '2026-08-01T08:00:00.000Z',
        newVehicleId: 'v-12',
        newVehicleName: 'Camión 12',
        reason: 'Asignación titular',
        assignedBy: 'Despacho Central'
      }
    ]
  },
  {
    id: 'r-210',
    code: '210',
    name: 'Ruta 210',
    zone: 'Circuito Comercial Oriente',
    assignedVehicleId: undefined,
    status: 'sin_unidad',
    notes: 'En espera de asignación de unidad de patio',
    history: []
  }
];

export const initialTickets: Ticket[] = [
  {
    id: 'TK-2501',
    unitId: 'v-12',
    unitName: 'Camión 12',
    economicNumber: '12',
    routeCode: '88',
    title: 'Falla severa en sistema de frenos neumático',
    description: 'Pérdida acelerada de presión de aire en la línea principal del pedal de freno. Ruido de fuga al accionar.',
    severity: 'critica',
    status: 'en_progreso',
    category: 'Frenos',
    createdAt: '2026-08-23T16:30:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
    reportedBy: 'Chofer Ruta 88',
    assignedTo: 'Roberto Gómez (Taller)',
    photos: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600'
    ],
    laborCost: 1850,
    invoiceFolio: 'FAC-TALLER-9921',
    spareParts: [
      { id: 'p1', description: 'Válvula de Pedal de Freno Neumático Bendix', partNumber: 'BX-288231', quantity: 1, unitCost: 3200 },
      { id: 'p2', description: 'Manguera de Aire Alta Presión 1/2"', partNumber: 'HO-500-AIR', quantity: 2, unitCost: 450 }
    ],
    totalCost: 5950
  },
  {
    id: 'TK-2502',
    unitId: 'v-101',
    unitName: 'Camión 101',
    economicNumber: '101',
    routeCode: '101',
    title: 'Luz direccional trasera derecha rota',
    description: 'Mica posterior quebrada y foco de luz direccional no enciende.',
    severity: 'media',
    status: 'pendiente',
    category: 'Luces',
    createdAt: '2026-08-23T14:15:00.000Z',
    updatedAt: '2026-08-23T14:15:00.000Z',
    reportedBy: 'Chofer Ruta 101',
    assignedTo: 'Roberto Gómez (Taller)',
    photos: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600'
    ],
    laborCost: 350,
    spareParts: [
      { id: 'p3', description: 'Calavera Trasera LED International', partNumber: 'INT-LED-902', quantity: 1, unitCost: 850 }
    ],
    totalCost: 1200
  }
];

export const initialPreventivePlans: PreventivePlan[] = [
  {
    id: 'prev-1',
    vehicleId: 'v-507',
    economicNumber: '507',
    serviceTitle: 'Cambio de Aceite 15W40 y Filtros (Motor / Diésel)',
    intervalKm: 15000,
    intervalDays: 90,
    lastServiceKm: 135000,
    lastServiceDate: '2026-06-15',
    nextDueKm: 150000,
    nextDueDate: '2026-09-15',
    estimatedCost: 4800,
    notes: 'Requiere 38 litros de aceite Mobil Delvac y filtro de combustible primario/secundario'
  },
  {
    id: 'prev-2',
    vehicleId: 'v-507',
    economicNumber: '507',
    serviceTitle: 'Engrase Integral de Chasis, Cardán y Quinta Rueda',
    intervalKm: 10000,
    intervalDays: 60,
    lastServiceKm: 140000,
    lastServiceDate: '2026-07-20',
    nextDueKm: 150000,
    nextDueDate: '2026-09-20',
    estimatedCost: 1200
  },
  {
    id: 'prev-3',
    vehicleId: 'v-101',
    economicNumber: '101',
    serviceTitle: 'Rotación, Calibración de Presión y Alineación de Ejes',
    intervalKm: 20000,
    intervalDays: 120,
    lastServiceKm: 80000,
    lastServiceDate: '2026-05-10',
    nextDueKm: 100000,
    nextDueDate: '2026-09-10',
    estimatedCost: 2400
  },
  {
    id: 'prev-4',
    vehicleId: 'v-12',
    economicNumber: '12',
    serviceTitle: 'Servicio Mayor y Reemplazo de Balatas / Tambores de Freno',
    intervalKm: 40000,
    intervalDays: 180,
    lastServiceKm: 140000,
    lastServiceDate: '2026-02-15',
    nextDueKm: 180000,
    nextDueDate: '2026-08-15', // Vencido por kilometraje y fecha
    estimatedCost: 9500,
    notes: 'Unidad con kilometraje superado (182,300 km)'
  },
  {
    id: 'prev-5',
    vehicleId: 'v-304',
    economicNumber: '304',
    serviceTitle: 'Inspección de Sistema Eléctrico y Baterías',
    intervalKm: 25000,
    intervalDays: 180,
    lastServiceKm: 50000,
    lastServiceDate: '2026-05-01',
    nextDueKm: 75000,
    nextDueDate: '2026-11-01',
    estimatedCost: 1600
  }
];

export const initialDocuments: FleetDocument[] = [
  {
    id: 'doc-1',
    vehicleId: 'v-507',
    economicNumber: '507',
    type: 'poliza_seguro',
    title: 'Póliza de Seguro Cobertura Amplia Carga',
    folioOrPolicy: 'POL-GNP-8839210',
    issuer: 'GNP Seguros',
    expiresAt: '2026-12-31',
    notes: 'Suma asegurada de responsabilidad civil por $5,000,000 MXN'
  },
  {
    id: 'doc-2',
    vehicleId: 'v-507',
    economicNumber: '507',
    type: 'tarjeta_circulacion',
    title: 'Tarjeta de Circulación Federal de Carga',
    folioOrPolicy: 'TC-FED-2022-507',
    issuer: 'Secretaría de Infraestructura, Comunicaciones y Transportes (SICT)',
    expiresAt: '2027-08-15'
  },
  {
    id: 'doc-3',
    vehicleId: 'v-101',
    economicNumber: '101',
    type: 'verificacion_ambiental',
    title: 'Certificado de Verificación Emisiones Contaminantes (Doble Cero)',
    folioOrPolicy: 'VER-CDMX-448109',
    issuer: 'Secretaría del Medio Ambiente',
    expiresAt: '2026-09-10', // Próxima a vencer (< 20 días)
    notes: 'Programar cita en Verificentro Autorizado antes del 10 de Septiembre'
  },
  {
    id: 'doc-4',
    vehicleId: 'v-12',
    economicNumber: '12',
    type: 'inspeccion_mecanica',
    title: 'Dictamen de Verificación Físico-Mecánica NOM-068-SCT',
    folioOrPolicy: 'DICT-FM-2025-012',
    issuer: 'Unidad de Verificación Acreditada #UV-140',
    expiresAt: '2026-08-10', // Vencida
    notes: 'Documento vencido. Requiere inspección urgente tras salir del taller.'
  },
  {
    id: 'doc-5',
    vehicleId: 'v-304',
    economicNumber: '304',
    type: 'poliza_seguro',
    title: 'Póliza de Seguro Quálitas Pesados',
    folioOrPolicy: 'QUA-TRK-771239',
    issuer: 'Quálitas Compañía de Seguros',
    expiresAt: '2027-03-20'
  },
  {
    id: 'doc-6',
    driverName: 'Chofer / Inspector de Ruta (usr-operador-1)',
    type: 'licencia_chofer',
    title: 'Licencia Federal de Conductor Tipo B',
    folioOrPolicy: 'LIC-FED-884920',
    issuer: 'SICT / Dirección General de Autotransporte Federal',
    expiresAt: '2026-11-30',
    notes: 'Apta para camiones articulados y unitarios de carga general'
  }
];

export const initialTemplates: ChecklistTemplate[] = [
  {
    id: 'tpl-standard-1',
    name: 'Inspección Rutinaria Diaria de Flotilla y Rutas',
    description: 'Plantilla estándar de revisión operacional pre-salida para unidades pesadas y medianas asignadas a rutas de reparto.',
    targetVehicleType: 'Todos',
    frequency: 'Diario Pre-Operacional',
    isDefault: true,
    isActive: true,
    updatedAt: '2026-08-24T08:00:00.000Z',
    questions: [
      {
        id: 'q1',
        category: 'Frenos',
        question: '¿Los frenos responden correctamente, sin pedal esponjoso ni fugas de aire o líquido?',
        helpText: 'Verificar manómetro de aire (> 90 PSI) o pedal hidráulico firme.',
        type: 'sino',
        requirePhotoIfFail: true,
        failSeverity: 'critica'
      },
      {
        id: 'q2',
        category: 'Luces',
        question: '¿Todas las luces (faros, direccionales, intermitentes y luces de freno) funcionan correctamente?',
        helpText: 'Accionar luces de emergencia y revisar cuartos traseros.',
        type: 'sino',
        requirePhotoIfFail: false,
        failSeverity: 'media'
      },
      {
        id: 'q3',
        category: 'Neumáticos',
        question: '¿Las llantas tienen buena presión y la banda de rodamiento está libre de deformaciones o cortes?',
        helpText: 'Presión recomendada: 100 - 110 PSI en frío.',
        type: 'sino',
        requirePhotoIfFail: true,
        failSeverity: 'media'
      },
      {
        id: 'q4',
        category: 'Carrocería',
        question: '¿La carrocería, caja de carga y parabrisas están libres de nuevos golpes, abolladuras o fisuras?',
        type: 'sino',
        requirePhotoIfFail: true,
        failSeverity: 'baja'
      },
      {
        id: 'q5',
        category: 'Niveles',
        question: '¿Los niveles de aceite de motor, líquido de dirección y anticongelante son correctos?',
        helpText: 'Revisar varilla medidora con motor frío o reposado 5 minutos.',
        type: 'sino',
        requirePhotoIfFail: false,
        failSeverity: 'media'
      },
      {
        id: 'q6',
        category: 'Seguridad',
        question: '¿Los cinturones de seguridad abrochan firmemente y el extintor/reflejantes están vigentes?',
        type: 'sino',
        requirePhotoIfFail: false,
        failSeverity: 'critica'
      }
    ]
  },
  {
    id: 'tpl-ligeros-2',
    name: 'Checklist de Salida - Unidades de Reparto Ligero y Vans',
    description: 'Formulario simplificado y ágil optimizado para camionetas de reparto urbano, vans y vehículos utilitarios.',
    targetVehicleType: 'Camioneta',
    frequency: 'Diario Pre-Operacional',
    isDefault: false,
    isActive: true,
    updatedAt: '2026-08-20T10:00:00.000Z',
    questions: [
      {
        id: 'ql-1',
        category: 'Frenos',
        question: '¿El pedal de freno y freno de estacionamiento (mano) tienen tensión adecuada?',
        type: 'sino',
        requirePhotoIfFail: true,
        failSeverity: 'critica'
      },
      {
        id: 'ql-2',
        category: 'Luces',
        question: '¿Luces delanteras, traseras, reversa y tablero iluminan sin testigos de advertencia (Check Engine)?',
        type: 'sino',
        requirePhotoIfFail: false,
        failSeverity: 'media'
      },
      {
        id: 'ql-3',
        category: 'Neumáticos',
        question: '¿Presión de las 4 llantas y llanta de refacción en 35-40 PSI?',
        type: 'sino',
        requirePhotoIfFail: true,
        failSeverity: 'media'
      },
      {
        id: 'ql-4',
        category: 'Cabina',
        question: '¿Espejos laterales, limpiaparabrisas y aire acondicionado/desempañador operativos?',
        type: 'sino',
        requirePhotoIfFail: false,
        failSeverity: 'baja'
      },
      {
        id: 'ql-5',
        category: 'Documentación',
        question: '¿Tarjeta de circulación, póliza de seguro y verificación física a bordo?',
        type: 'sino',
        requirePhotoIfFail: false,
        failSeverity: 'media'
      }
    ]
  },
  {
    id: 'tpl-nom068-3',
    name: 'Auditoría Físico-Mecánica y Seguridad NOM-068-SCT',
    description: 'Inspección técnica detallada para transporte de carga pesada, tractocamiones y semirremolques conforme a norma oficial.',
    targetVehicleType: 'Camión Pesado',
    frequency: 'Semanal',
    isDefault: false,
    isActive: true,
    updatedAt: '2026-08-18T14:30:00.000Z',
    questions: [
      {
        id: 'qnom-1',
        category: 'Frenos',
        question: '¿Válvulas de desfogue, tanques de aire y matracas de ajuste sin fugas ni juego excesivo?',
        type: 'sino',
        requirePhotoIfFail: true,
        failSeverity: 'critica'
      },
      {
        id: 'qnom-2',
        category: 'Motor',
        question: '¿Sin fugas de combustible diésel, aceite de motor o mangueras de turbo agrietadas?',
        type: 'sino',
        requirePhotoIfFail: true,
        failSeverity: 'critica'
      },
      {
        id: 'qnom-3',
        category: 'Carrocería',
        question: '¿Quinta rueda, perno rey, cadenas de seguridad y mangueras manitas de aire en óptimo estado?',
        type: 'sino',
        requirePhotoIfFail: true,
        failSeverity: 'critica'
      },
      {
        id: 'qnom-4',
        category: 'Neumáticos',
        question: '¿Profundidad de dibujo superior a 3 mm en llantas de dirección y sin tuercas flojas/faltantes en rines?',
        type: 'sino',
        requirePhotoIfFail: true,
        failSeverity: 'critica'
      },
      {
        id: 'qnom-5',
        category: 'Seguridad',
        question: '¿Cintas reflejantes perimetrales, alarma de reversa y kit de primeros auxilios completos?',
        type: 'sino',
        requirePhotoIfFail: false,
        failSeverity: 'media'
      }
    ]
  },
  {
    id: 'tpl-entrega-4',
    name: 'Acta de Entrega y Recepción de Unidad (Cambio de Turno)',
    description: 'Protocolo de recepción de unidad entre operadores para deslindar responsabilidades de kilometraje, combustible y herramienta.',
    targetVehicleType: 'Todos',
    frequency: 'Por Turno',
    isDefault: false,
    isActive: true,
    updatedAt: '2026-08-15T09:00:00.000Z',
    questions: [
      {
        id: 'qe-1',
        category: 'Cabina',
        question: '¿Cabina limpia, libre de basura y sin olores anómalos?',
        type: 'sino',
        requirePhotoIfFail: false,
        failSeverity: 'baja'
      },
      {
        id: 'qe-2',
        category: 'Seguridad',
        question: '¿Gato hidráulico, llave de cruz, triángulos reflejantes y cables pasa-corriente presentes?',
        type: 'sino',
        requirePhotoIfFail: true,
        failSeverity: 'media'
      },
      {
        id: 'qe-3',
        category: 'Carrocería',
        question: '¿Sin raspones, roturas en defensas o vidrios estrellados respecto al turno previo?',
        type: 'sino',
        requirePhotoIfFail: true,
        failSeverity: 'baja'
      },
      {
        id: 'qe-4',
        category: 'Niveles',
        question: '¿Tanque de combustible entregado con el nivel acordado (mínimo 1/2 tanque)?',
        type: 'sino',
        requirePhotoIfFail: false,
        failSeverity: 'baja'
      }
    ]
  }
];

export const initialChecklistTemplate: ChecklistTemplate = initialTemplates[0];

export const initialInspectionHistory: InspectionRecord[] = [
  {
    id: 'INSP-101',
    unitId: 'v-12',
    unitName: 'Camión 12',
    economicNumber: '12',
    routeCode: '88',
    operatorId: 'usr-operador-1',
    operatorName: 'Chofer Ruta 88',
    createdAt: '2026-08-23T16:25:00.000Z',
    templateId: 'tpl-standard-1',
    isSyncedOffline: false,
    generatedTicketIds: ['TK-2501'],
    reconfirmedTicketIds: [],
    signedByRole: 'operador',
    signedByName: 'Juan Pérez (Chofer Ruta 88)',
    answers: [
      { questionId: 'q1', pass: false, notes: 'Fuga de aire neumático en pedal de freno' },
      { questionId: 'q2', pass: true },
      { questionId: 'q3', pass: true },
      { questionId: 'q4', pass: true },
      { questionId: 'q5', pass: true },
      { questionId: 'q6', pass: true }
    ]
  },
  {
    id: 'INSP-100',
    unitId: 'v-101',
    unitName: 'Camión 101',
    economicNumber: '101',
    routeCode: '101',
    operatorId: 'usr-operador-1',
    operatorName: 'Chofer Ruta 101',
    createdAt: '2026-08-23T14:10:00.000Z',
    templateId: 'tpl-standard-1',
    isSyncedOffline: false,
    generatedTicketIds: ['TK-2502'],
    reconfirmedTicketIds: [],
    signedByRole: 'operador',
    signedByName: 'Mario Díaz (Chofer Ruta 101)',
    answers: [
      { questionId: 'q1', pass: true },
      { questionId: 'q2', pass: false, notes: 'Mica direccional trasera rota' },
      { questionId: 'q3', pass: true },
      { questionId: 'q4', pass: true },
      { questionId: 'q5', pass: true },
      { questionId: 'q6', pass: true }
    ]
  }
];
