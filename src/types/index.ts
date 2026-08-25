export type UserRole = 'operador' | 'mecanico' | 'administrador';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  defaultRouteId?: string;
  defaultVehicleId?: string;
  driverLicense?: {
    licenseNumber: string;
    category: string;
    expiresAt: string;
    documentUrl?: string;
  };
}

export type Severity = 'baja' | 'media' | 'critica';

export type TicketStatus = 'pendiente' | 'en_progreso' | 'resuelto' | 'cancelado';

export interface TicketSparePart {
  id: string;
  description: string;
  partNumber?: string;
  quantity: number;
  unitCost: number;
}

export interface Ticket {
  id: string; // e.g. TK-2501
  unitId: string;
  unitName: string;
  economicNumber?: string; // e.g. "507", "12"
  routeCode?: string;      // e.g. "125", "101"
  title: string;
  description: string;
  severity: Severity;
  status: TicketStatus;
  category: string;
  createdAt: string;
  updatedAt: string;
  reportedBy: string;
  assignedTo?: string;
  photos?: string[];
  resolutionNotes?: string;
  lastConfirmedAt?: string;
  reconfirmationHistory?: {
    date: string;
    stillPresent: boolean;
    photo?: string;
    note?: string;
    confirmedBy: string;
  }[];
  // Cost & Refacciones
  spareParts?: TicketSparePart[];
  laborCost?: number;
  invoiceFolio?: string;
  invoiceUrl?: string;
  totalCost?: number;
}

export type QuestionType = 'sino' | 'texto' | 'numero' | 'foto' | 'opciones';

export interface ChecklistQuestion {
  id: string;
  category: string; // e.g., Frenos, Luces, Neumáticos, Carrocería, Niveles, Seguridad, Motor, Documentación, Cabina
  question: string;
  type: QuestionType;
  options?: string[]; // for 'opciones' question type
  numericUnit?: string; // e.g. "PSI", "km", "Litros", "mm", "%"
  minNumber?: number;
  maxNumber?: number;
  helpText?: string;
  requirePhotoIfFail: boolean;
  failSeverity: Severity;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  targetVehicleType?: string; // e.g. 'Todos', 'Camión Pesado', 'Camioneta', 'Trailer', 'Reparto Ligero'
  frequency?: string;         // e.g. 'Diario Pre-Operacional', 'Semanal', 'Por Turno', 'Auditoría Mensual'
  isDefault?: boolean;
  isActive?: boolean;
  questions: ChecklistQuestion[];
  updatedAt: string;
}

export interface Answer {
  questionId: string;
  pass: boolean; // true = OK / No hay falla, false = Falla
  valueText?: string;
  valueNumber?: number;
  photoUrl?: string;
  notes?: string;
}

export interface InspectionRecord {
  id: string;
  unitId: string;
  unitName: string;
  economicNumber?: string; // e.g. "507"
  routeId?: string;
  routeCode?: string;      // e.g. "125"
  operatorId: string;
  operatorName: string;
  createdAt: string;
  templateId: string;
  answers: Answer[];
  generatedTicketIds: string[];
  reconfirmedTicketIds: string[];
  isSyncedOffline: boolean;
  notes?: string;
  signatureUrl?: string;
  signedByRole?: 'operador' | 'supervisor';
  signedByName?: string;
}

export interface RouteAssignmentHistory {
  id: string;
  date: string;
  previousVehicleId?: string;
  previousVehicleName?: string;
  newVehicleId: string;
  newVehicleName: string;
  reason: string;
  assignedBy: string;
}

export interface Route {
  id: string;
  code: string; // e.g. "125", "101", "402", "88"
  name: string; // e.g. "Ruta 125"
  zone?: string; // e.g. "Sector Industrial / Norte"
  assignedVehicleId?: string; // ID of the currently assigned vehicle
  assignedOperatorId?: string; // ID of the currently assigned driver
  assignedOperatorName?: string;
  status: 'activa' | 'sin_unidad' | 'suspendida';
  notes?: string;
  history?: RouteAssignmentHistory[];
}

export type DocumentType =
  | 'poliza_seguro'
  | 'tarjeta_circulacion'
  | 'verificacion_ambiental'
  | 'inspeccion_mecanica'
  | 'permiso_sct'
  | 'licencia_chofer';

export interface FleetDocument {
  id: string;
  vehicleId?: string;
  economicNumber?: string;
  driverName?: string;
  type: DocumentType;
  title: string;
  folioOrPolicy: string;
  issuer: string;
  expiresAt: string; // YYYY-MM-DD
  documentUrl?: string;
  notes?: string;
}

export type MaintenanceScheduleStatus = 'al_dia' | 'por_vencer' | 'vencido';

export interface PreventivePlan {
  id: string;
  vehicleId: string;
  economicNumber: string;
  serviceTitle: string; // e.g. "Cambio de Aceite y Filtros 15W40"
  intervalKm: number; // e.g. 15000
  intervalDays: number; // e.g. 90
  lastServiceKm: number;
  lastServiceDate: string;
  nextDueKm: number;
  nextDueDate: string;
  estimatedCost?: number;
  notes?: string;
}

export interface Vehicle {
  id: string;
  economicNumber: string; // Número Económico Único, e.g. "507", "101", "304", "12", "07"
  codeName: string;       // e.g. "Camión 507"
  plate: string;          // e.g. "MX-789-A"
  model: string;          // e.g. "Freightliner M2 106"
  type: string;           // e.g. "Camión Pesado", "Camioneta", "Trailer"
  status: 'activa' | 'bloqueada' | 'mantenimiento';
  currentRouteId?: string; // ID of assigned route (or undefined if spare / patio)
  assignedOperatorId?: string; // ID of primary designated operator
  assignedOperatorName?: string;
  blockedReason?: string;
  criticalTicketId?: string;
  odometerKm?: number;
  qrCodeValue?: string; // e.g. "FLOTACHECK:UNIT:v-507"
}

export interface OfflineQueueItem {
  id: string;
  type: 'INSPECTION_SUBMIT' | 'TICKET_UPDATE' | 'TICKET_RECONFIRM' | 'ROUTE_ASSIGNMENT';
  timestamp: string;
  payload: any;
}

