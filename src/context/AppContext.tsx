import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Vehicle,
  Route,
  Ticket,
  TicketStatus,
  TicketSparePart,
  ChecklistTemplate,
  ChecklistQuestion,
  InspectionRecord,
  OfflineQueueItem,
  Severity,
  Answer,
  RouteAssignmentHistory,
  PreventivePlan,
  FleetDocument
} from '../types';
import {
  initialUsers,
  initialVehicles,
  initialRoutes,
  initialTickets,
  initialTemplates,
  initialChecklistTemplate,
  initialInspectionHistory,
  initialPreventivePlans,
  initialDocuments
} from '../data/mockData';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  
  vehicles: Vehicle[];
  routes: Route[];
  tickets: Ticket[];
  templates: ChecklistTemplate[];
  template: ChecklistTemplate;
  activeTemplateId: string;
  setActiveTemplateId: (id: string) => void;
  inspections: InspectionRecord[];
  preventivePlans: PreventivePlan[];
  documents: FleetDocument[];
  
  isOnline: boolean;
  offlineQueue: OfflineQueueItem[];
  
  // Users Actions
  saveUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  assignUserRouteAndVehicle: (userId: string, routeId?: string, vehicleId?: string) => void;
  assignOperatorToRoute: (routeId: string, operatorId?: string) => void;
  assignOperatorToVehicle: (vehicleId: string, operatorId?: string) => void;

  // Tickets Actions
  saveTicket: (ticket: Ticket) => void;
  deleteTicket: (ticketId: string) => void;

  // Actions
  switchRole: (role: User['role']) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus, notes?: string) => void;
  updateTicketCostsAndParts: (
    ticketId: string,
    data: {
      spareParts?: TicketSparePart[];
      laborCost?: number;
      totalCost?: number;
      invoiceFolio?: string;
      invoiceUrl?: string;
    }
  ) => void;
  assignTicket: (ticketId: string, mechanicName: string) => void;
  reconfirmTicket: (
    ticketId: string,
    stillPresent: boolean,
    photo?: string,
    note?: string
  ) => void;
  
  submitInspection: (
    unitId: string,
    answers: Answer[],
    generatedTicketsData: {
      questionId: string;
      title: string;
      description: string;
      severity: Severity;
      category: string;
      photo?: string;
    }[],
    reconfirmedTicketIds: string[],
    notes?: string,
    routeId?: string,
    signatureData?: {
      signatureUrl?: string;
      signedByRole?: 'operador' | 'supervisor';
      signedByName?: string;
    },
    customTemplateId?: string
  ) => { inspectionId: string; generatedTicketFolios: string[] };
  
  adminUnblockVehicle: (vehicleId: string, reason: string) => void;
  updateTemplate: (newTemplate: ChecklistTemplate) => void;
  saveTemplate: (newTemplate: ChecklistTemplate) => void;
  deleteTemplate: (templateId: string) => void;
  duplicateTemplate: (templateId: string) => ChecklistTemplate;
  setDefaultTemplate: (templateId: string) => void;
  
  // Fleet & Route Actions
  saveVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (vehicleId: string) => void;
  saveRoute: (route: Route) => void;
  deleteRoute: (routeId: string) => void;
  assignVehicleToRoute: (routeId: string, vehicleId: string, reason?: string) => void;
  reassignVehicleDueToBreakdown: (routeId: string, replacementVehicleId: string, reason: string) => void;
  
  // Preventive Maintenance Actions
  savePreventivePlan: (plan: PreventivePlan) => void;
  completePreventiveService: (planId: string, currentKm: number, cost?: number, notes?: string) => void;
  deletePreventivePlan: (planId: string) => void;

  // Documents Actions
  saveDocument: (doc: FleetDocument) => void;
  deleteDocument: (docId: string) => void;

  syncOfflineQueue: () => void;
  clearAllData: () => void;
  
  // Helpers
  getOpenTicketsForUnit: (unitId: string) => Ticket[];
  getCriticalUnresolvedTicketForUnit: (unitId: string) => Ticket | undefined;
  getVehicleForRoute: (routeId: string) => Vehicle | undefined;
  getRouteForVehicle: (vehicleId: string) => Route | undefined;
  getNextTicketFolio: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'flotacheck_state_v3';

const loadStored = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const computeNextTicketBase = (tickets: Ticket[]): number => {
  let max = 0;
  tickets.forEach((t) => {
    const match = t.id.match(/^TK-(\d+)$/);
    if (match) {
      max = Math.max(max, parseInt(match[1], 10));
    }
  });
  return max + 1;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() =>
    loadStored<User[]>(`${LOCAL_STORAGE_KEY}_users`, initialUsers)
  );

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = loadStored<User | null>(`${LOCAL_STORAGE_KEY}_currentUser`, null);
    if (saved) return saved;
    return users[0] || initialUsers[0];
  });

  // Persistent States
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    loadStored<Vehicle[]>(`${LOCAL_STORAGE_KEY}_vehicles`, initialVehicles)
  );

  const [routes, setRoutes] = useState<Route[]>(() =>
    loadStored<Route[]>(`${LOCAL_STORAGE_KEY}_routes`, initialRoutes)
  );

  const [tickets, setTickets] = useState<Ticket[]>(() =>
    loadStored<Ticket[]>(`${LOCAL_STORAGE_KEY}_tickets`, initialTickets)
  );

  const [templates, setTemplates] = useState<ChecklistTemplate[]>(() =>
    loadStored<ChecklistTemplate[]>(`${LOCAL_STORAGE_KEY}_templates`, initialTemplates)
  );

  const [activeTemplateId, setActiveTemplateId] = useState<string>(() => {
    const defaultTpl = templates.find((t) => t.isDefault) || templates[0] || initialChecklistTemplate;
    return defaultTpl.id;
  });

  // Keep `template` pointing to active or default template
  const template = templates.find((t) => t.id === activeTemplateId) || templates[0] || initialChecklistTemplate;

  const [inspections, setInspections] = useState<InspectionRecord[]>(() =>
    loadStored<InspectionRecord[]>(`${LOCAL_STORAGE_KEY}_inspections`, initialInspectionHistory)
  );

  const [preventivePlans, setPreventivePlans] = useState<PreventivePlan[]>(() =>
    loadStored<PreventivePlan[]>(`${LOCAL_STORAGE_KEY}_preventive`, initialPreventivePlans)
  );

  const [documents, setDocuments] = useState<FleetDocument[]>(() =>
    loadStored<FleetDocument[]>(`${LOCAL_STORAGE_KEY}_documents`, initialDocuments)
  );

  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>(() =>
    loadStored<OfflineQueueItem[]>(`${LOCAL_STORAGE_KEY}_offlineQueue`, [])
  );

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => {
        syncOfflineQueue();
      }, 1000);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_vehicles`, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_routes`, JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_tickets`, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_templates`, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_inspections`, JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_preventive`, JSON.stringify(preventivePlans));
  }, [preventivePlans]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_documents`, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_offlineQueue`, JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Actions
  const switchRole = (role: User['role']) => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
    }
  };

  const getVehicleForRoute = (routeId: string): Vehicle | undefined => {
    const route = routes.find((r) => r.id === routeId);
    if (!route || !route.assignedVehicleId) return undefined;
    return vehicles.find((v) => v.id === route.assignedVehicleId);
  };

  const getRouteForVehicle = (vehicleId: string): Route | undefined => {
    return routes.find((r) => r.assignedVehicleId === vehicleId);
  };

  const getOpenTicketsForUnit = (unitId: string): Ticket[] => {
    return tickets.filter(
      (t) => t.unitId === unitId && (t.status === 'pendiente' || t.status === 'en_progreso')
    );
  };

  const getCriticalUnresolvedTicketForUnit = (unitId: string): Ticket | undefined => {
    return tickets.find(
      (t) =>
        t.unitId === unitId &&
        t.severity === 'critica' &&
        (t.status === 'pendiente' || t.status === 'en_progreso')
    );
  };

  const getNextTicketFolio = (): string => {
    return `TK-${String(computeNextTicketBase(tickets)).padStart(4, '0')}`;
  };

  const assignVehicleToRoute = (routeId: string, vehicleId: string, reason?: string) => {
    const targetRoute = routes.find((r) => r.id === routeId);
    const targetVehicle = vehicles.find((v) => v.id === vehicleId);
    if (!targetRoute || !targetVehicle) return;

    const previousVehicle = targetRoute.assignedVehicleId
      ? vehicles.find((v) => v.id === targetRoute.assignedVehicleId)
      : undefined;

    const now = new Date().toISOString();
    const historyItem: RouteAssignmentHistory = {
      id: `hist-${Date.now()}`,
      date: now,
      previousVehicleId: previousVehicle?.id,
      previousVehicleName: previousVehicle ? `${previousVehicle.codeName} (#${previousVehicle.economicNumber})` : 'Sin unidad previa',
      newVehicleId: targetVehicle.id,
      newVehicleName: `${targetVehicle.codeName} (#${targetVehicle.economicNumber})`,
      reason: reason || 'Reasignación de unidad a ruta',
      assignedBy: currentUser.name
    };

    // Update Route
    setRoutes((prevRoutes) =>
      prevRoutes.map((r) => {
        if (r.id === routeId) {
          return {
            ...r,
            assignedVehicleId: vehicleId,
            status: 'activa',
            history: [historyItem, ...(r.history || [])]
          };
        }
        // If another route had this vehicle, free it
        if (r.id !== routeId && r.assignedVehicleId === vehicleId) {
          return {
            ...r,
            assignedVehicleId: undefined,
            status: 'sin_unidad'
          };
        }
        return r;
      })
    );

    // Update Vehicles
    setVehicles((prevVehicles) =>
      prevVehicles.map((v) => {
        if (v.id === vehicleId) {
          return { ...v, currentRouteId: routeId };
        }
        if (previousVehicle && v.id === previousVehicle.id) {
          return { ...v, currentRouteId: undefined };
        }
        return v;
      })
    );
  };

  const reassignVehicleDueToBreakdown = (
    routeId: string,
    replacementVehicleId: string,
    reason: string
  ) => {
    assignVehicleToRoute(
      routeId,
      replacementVehicleId,
      `CAMBIO POR DESCOMPOSTURA / UNIDAD INSERVIBLE: ${reason}`
    );
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus, notes?: string) => {
    const target = tickets.find((t) => t.id === ticketId);

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status,
              resolutionNotes: notes ? notes : t.resolutionNotes,
              updatedAt: new Date().toISOString()
            }
          : t
      )
    );

    // If a critical ticket is marked resolved/cancelled, automatically unblock its unit.
    if (target && target.severity === 'critica' && (status === 'resuelto' || status === 'cancelado')) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === target.unitId && v.criticalTicketId === target.id
            ? { ...v, status: 'activa', blockedReason: undefined, criticalTicketId: undefined, blockedAt: undefined }
            : v
        )
      );
    }
  };

  const updateTicketCostsAndParts = (
    ticketId: string,
    data: {
      spareParts?: TicketSparePart[];
      laborCost?: number;
      totalCost?: number;
      invoiceFolio?: string;
      invoiceUrl?: string;
    }
  ) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const parts = data.spareParts !== undefined ? data.spareParts : (t.spareParts || []);
          const partsSum = parts.reduce((acc, p) => acc + p.quantity * p.unitCost, 0);
          
          let labor = data.laborCost !== undefined ? data.laborCost : (t.laborCost || 0);
          let finalTotal: number;

          if (data.totalCost !== undefined && data.spareParts === undefined && data.laborCost === undefined) {
            // Direct manual override of total cost
            finalTotal = Number(data.totalCost) || 0;
            labor = Math.max(0, finalTotal - partsSum);
          } else {
            finalTotal = (data.totalCost !== undefined) ? Number(data.totalCost) : (labor + partsSum);
          }

          return {
            ...t,
            spareParts: parts,
            laborCost: labor,
            invoiceFolio: data.invoiceFolio !== undefined ? data.invoiceFolio : t.invoiceFolio,
            invoiceUrl: data.invoiceUrl !== undefined ? data.invoiceUrl : t.invoiceUrl,
            totalCost: finalTotal,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      })
    );
  };

  const assignTicket = (ticketId: string, mechanicName: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, assignedTo: mechanicName, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const reconfirmTicket = (
    ticketId: string,
    stillPresent: boolean,
    photo?: string,
    note?: string
  ) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const history = t.reconfirmationHistory || [];
          const newHistoryItem = {
            date: now,
            stillPresent,
            photo,
            note,
            confirmedBy: currentUser.name
          };

          const newPhotos = photo ? [...(t.photos || []), photo] : t.photos;

          let newStatus = t.status;
          if (!stillPresent) {
            newStatus = 'resuelto';
          }

          const updatedTicket = {
            ...t,
            status: newStatus,
            lastConfirmedAt: now,
            updatedAt: now,
            photos: newPhotos,
            resolutionNotes: !stillPresent
              ? `Resuelto por chofer de ruta en reconfirmación diaria: ${note || 'El problema ya no persiste.'}`
              : t.resolutionNotes,
            reconfirmationHistory: [...history, newHistoryItem]
          };

          if (t.severity === 'critica' && !stillPresent) {
            setVehicles((vPrev) =>
              vPrev.map((v) => {
                if (v.id === t.unitId && v.criticalTicketId === t.id) {
                  return { ...v, status: 'activa', blockedReason: undefined, criticalTicketId: undefined };
                }
                return v;
              })
            );
          }

          return updatedTicket;
        }
        return t;
      })
    );
  };

  const submitInspection = (
    unitId: string,
    answers: Answer[],
    generatedTicketsData: {
      questionId: string;
      title: string;
      description: string;
      severity: Severity;
      category: string;
      photo?: string;
    }[],
    reconfirmedTicketIds: string[],
    notes?: string,
    routeId?: string,
    signatureData?: {
      signatureUrl?: string;
      signedByRole?: 'operador' | 'supervisor';
      signedByName?: string;
    },
    customTemplateId?: string
  ) => {
    const unit = vehicles.find((v) => v.id === unitId);
    const unitName = unit ? unit.codeName : 'Unidad';
    const economicNum = unit?.economicNumber;
    const assignedRoute = routeId ? routes.find((r) => r.id === routeId) : routes.find((r) => r.assignedVehicleId === unitId);
    const routeCode = assignedRoute?.code;

    const now = new Date().toISOString();

    // Generate ticket IDs
    const createdTickets: Ticket[] = [];
    const generatedTicketFolios: string[] = [];

    // Calculate next Ticket Folio number from existing folios
    const nextFolioBase = computeNextTicketBase(tickets);

    let hasCriticalGenerated = false;
    let mainCriticalTicketId = '';

    generatedTicketsData.forEach((gt, idx) => {
      const folio = `TK-${String(nextFolioBase + idx).padStart(4, '0')}`;
      generatedTicketFolios.push(folio);

      if (gt.severity === 'critica') {
        hasCriticalGenerated = true;
        mainCriticalTicketId = folio;
      }

      createdTickets.push({
        id: folio,
        unitId,
        unitName,
        economicNumber: economicNum,
        routeCode: routeCode,
        title: gt.title,
        description: gt.description,
        severity: gt.severity,
        status: 'pendiente',
        category: gt.category,
        createdAt: now,
        updatedAt: now,
        reportedBy: routeCode ? `Chofer de Ruta ${routeCode}` : currentUser.name,
        assignedTo: 'Roberto Gómez (Taller)',
        photos: gt.photo ? [gt.photo] : [],
        spareParts: [],
        laborCost: 0,
        totalCost: 0
      });
    });

    const inspId = `INSP-${Date.now().toString().slice(-4)}`;

    const templateUsedId = customTemplateId || activeTemplateId || template.id;
    const newInspectionRecord: InspectionRecord = {
      id: inspId,
      unitId,
      unitName,
      economicNumber: economicNum,
      routeId: assignedRoute?.id,
      routeCode: routeCode,
      operatorId: currentUser.id,
      operatorName: routeCode ? `Chofer de Ruta ${routeCode}` : currentUser.name,
      createdAt: now,
      templateId: templateUsedId,
      answers,
      generatedTicketIds: generatedTicketFolios,
      reconfirmedTicketIds,
      isSyncedOffline: !isOnline,
      notes,
      signatureUrl: signatureData?.signatureUrl,
      signedByRole: signatureData?.signedByRole || 'operador',
      signedByName: signatureData?.signedByName || currentUser.name
    };

    if (!isOnline) {
      const queueItem: OfflineQueueItem = {
        id: `QUEUE-${Date.now()}`,
        type: 'INSPECTION_SUBMIT',
        timestamp: now,
        payload: {
          inspection: newInspectionRecord,
          newTickets: createdTickets,
          unitId,
          hasCriticalGenerated,
          mainCriticalTicketId
        }
      };
      setOfflineQueue((prev) => [...prev, queueItem]);
    }

    if (createdTickets.length > 0) {
      setTickets((prev) => [...createdTickets, ...prev]);
    }

    setInspections((prev) => [newInspectionRecord, ...prev]);

    // If critical ticket generated during inspection, block unit immediately
    if (hasCriticalGenerated) {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === unitId) {
            return {
              ...v,
              status: 'bloqueada',
              blockedReason: `Bloqueada por ticket crítico ${mainCriticalTicketId} generado en inspección ${inspId}`,
              criticalTicketId: mainCriticalTicketId,
              blockedAt: now
            };
          }
          return v;
        })
      );
    }

    return { inspectionId: inspId, generatedTicketFolios };
  };

  const adminUnblockVehicle = (vehicleId: string, reason: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            status: 'activa',
            blockedReason: `Excepción autorizada (${currentUser.name}): ${reason}`,
            criticalTicketId: undefined,
            blockedAt: undefined
          };
        }
        return v;
      })
    );
  };

  const updateTemplate = (newTemplate: ChecklistTemplate) => {
    saveTemplate(newTemplate);
  };

  const saveTemplate = (newTemplate: ChecklistTemplate) => {
    const updatedWithDate: ChecklistTemplate = {
      ...newTemplate,
      updatedAt: new Date().toISOString()
    };
    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.id === newTemplate.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedWithDate;
        return copy;
      }
      return [updatedWithDate, ...prev];
    });
    setActiveTemplateId(newTemplate.id);
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates((prev) => {
      const remaining = prev.filter((t) => t.id !== templateId);
      if (remaining.length === 0) {
        return initialTemplates;
      }
      return remaining;
    });
    if (activeTemplateId === templateId) {
      const remaining = templates.filter((t) => t.id !== templateId);
      if (remaining.length > 0) {
        setActiveTemplateId(remaining[0].id);
      }
    }
  };

  const duplicateTemplate = (templateId: string): ChecklistTemplate => {
    const target = templates.find((t) => t.id === templateId) || template;
    const duplicated: ChecklistTemplate = {
      ...target,
      id: `tpl-${Date.now()}`,
      name: `${target.name} (Copia)`,
      isDefault: false,
      questions: target.questions.map((q) => ({ ...q, id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })),
      updatedAt: new Date().toISOString()
    };
    setTemplates((prev) => [duplicated, ...prev]);
    setActiveTemplateId(duplicated.id);
    return duplicated;
  };

  const setDefaultTemplate = (templateId: string) => {
    setTemplates((prev) =>
      prev.map((t) => ({
        ...t,
        isDefault: t.id === templateId
      }))
    );
  };

  const saveVehicle = (vehicle: Vehicle) => {
    setVehicles((prev) => {
      const idx = prev.findIndex((v) => v.id === vehicle.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = vehicle;
        return copy;
      }
      return [...prev, vehicle];
    });
  };

  const deleteVehicle = (vehicleId: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    // Remove assignment from any route
    setRoutes((prev) =>
      prev.map((r) => (r.assignedVehicleId === vehicleId ? { ...r, assignedVehicleId: undefined, status: 'sin_unidad' } : r))
    );
  };

  const saveRoute = (route: Route) => {
    setRoutes((prev) => {
      const idx = prev.findIndex((r) => r.id === route.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = route;
        return copy;
      }
      return [...prev, route];
    });

    if (route.assignedVehicleId) {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === route.assignedVehicleId) {
            return { ...v, currentRouteId: route.id };
          }
          return v;
        })
      );
    }
  };

  const deleteRoute = (routeId: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== routeId));
    setVehicles((prev) =>
      prev.map((v) => (v.currentRouteId === routeId ? { ...v, currentRouteId: undefined } : v))
    );
  };

  // Preventive Plan Actions
  const savePreventivePlan = (plan: PreventivePlan) => {
    setPreventivePlans((prev) => {
      const idx = prev.findIndex((p) => p.id === plan.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = plan;
        return copy;
      }
      return [plan, ...prev];
    });
  };

  const completePreventiveService = (planId: string, currentKm: number, cost?: number, notes?: string) => {
    setPreventivePlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          const now = new Date();
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + p.intervalDays);

          return {
            ...p,
            lastServiceKm: currentKm,
            lastServiceDate: now.toISOString().split('T')[0],
            nextDueKm: currentKm + p.intervalKm,
            nextDueDate: nextDate.toISOString().split('T')[0],
            estimatedCost: cost !== undefined ? cost : p.estimatedCost,
            notes: notes || p.notes
          };
        }
        return p;
      })
    );

    // Also update vehicle odometer
    const targetPlan = preventivePlans.find((p) => p.id === planId);
    if (targetPlan) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === targetPlan.vehicleId ? { ...v, odometerKm: currentKm } : v))
      );
    }
  };

  const deletePreventivePlan = (planId: string) => {
    setPreventivePlans((prev) => prev.filter((p) => p.id !== planId));
  };

  // Document Wallet Actions
  const saveDocument = (doc: FleetDocument) => {
    setDocuments((prev) => {
      const idx = prev.findIndex((d) => d.id === doc.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = doc;
        return copy;
      }
      return [doc, ...prev];
    });
  };

  const deleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  // User Management Actions
  const saveUser = (user: User) => {
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = user;
        return copy;
      }
      return [user, ...prev];
    });

    if (currentUser.id === user.id) {
      setCurrentUser(user);
    }
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    // Clean assignments in routes and vehicles
    setRoutes((prev) =>
      prev.map((r) =>
        r.assignedOperatorId === userId
          ? { ...r, assignedOperatorId: undefined, assignedOperatorName: undefined }
          : r
      )
    );
    setVehicles((prev) =>
      prev.map((v) =>
        v.assignedOperatorId === userId
          ? { ...v, assignedOperatorId: undefined, assignedOperatorName: undefined }
          : v
      )
    );
  };

  const assignOperatorToRoute = (routeId: string, operatorId?: string) => {
    const operator = operatorId ? users.find((u) => u.id === operatorId) : undefined;
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id === routeId) {
          return {
            ...r,
            assignedOperatorId: operator?.id,
            assignedOperatorName: operator?.name
          };
        }
        return r;
      })
    );

    if (operator) {
      setUsers((prev) =>
        prev.map((u) => (u.id === operator.id ? { ...u, defaultRouteId: routeId } : u))
      );
    }
  };

  const assignOperatorToVehicle = (vehicleId: string, operatorId?: string) => {
    const operator = operatorId ? users.find((u) => u.id === operatorId) : undefined;
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            assignedOperatorId: operator?.id,
            assignedOperatorName: operator?.name
          };
        }
        return v;
      })
    );

    if (operator) {
      setUsers((prev) =>
        prev.map((u) => (u.id === operator.id ? { ...u, defaultVehicleId: vehicleId } : u))
      );
    }
  };

  const assignUserRouteAndVehicle = (
    userId: string,
    routeId?: string,
    vehicleId?: string
  ) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    // 1. Update user
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              defaultRouteId: routeId || undefined,
              defaultVehicleId: vehicleId || undefined
            }
          : u
      )
    );

    // 2. Update route if specified
    if (routeId) {
      setRoutes((prev) =>
        prev.map((r) => {
          if (r.id === routeId) {
            return {
              ...r,
              assignedOperatorId: userId,
              assignedOperatorName: targetUser.name,
              assignedVehicleId: vehicleId || r.assignedVehicleId,
              status: (vehicleId || r.assignedVehicleId) ? 'activa' : 'sin_unidad'
            };
          }
          // Remove this operator from other routes
          if (r.id !== routeId && r.assignedOperatorId === userId) {
            return {
              ...r,
              assignedOperatorId: undefined,
              assignedOperatorName: undefined
            };
          }
          return r;
        })
      );
    }

    // 3. Update vehicle if specified
    if (vehicleId) {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === vehicleId) {
            return {
              ...v,
              assignedOperatorId: userId,
              assignedOperatorName: targetUser.name,
              currentRouteId: routeId || v.currentRouteId
            };
          }
          // Remove this operator from other vehicles
          if (v.id !== vehicleId && v.assignedOperatorId === userId) {
            return {
              ...v,
              assignedOperatorId: undefined,
              assignedOperatorName: undefined
            };
          }
          return v;
        })
      );
    }
  };

  // Ticket Manual Creation / Deletion
  const saveTicket = (ticket: Ticket) => {
    setTickets((prev) => {
      const idx = prev.findIndex((t) => t.id === ticket.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...ticket, updatedAt: new Date().toISOString() };
        return copy;
      }
      return [{ ...ticket, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...prev];
    });

    // If critical ticket and not resolved, block vehicle
    if (ticket.severity === 'critica' && ticket.status !== 'resuelto' && ticket.status !== 'cancelado') {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === ticket.unitId) {
            return {
              ...v,
              status: 'bloqueada',
              blockedReason: ticket.title,
              criticalTicketId: ticket.id,
              blockedAt: new Date().toISOString()
            };
          }
          return v;
        })
      );
    }
  };

  const deleteTicket = (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
  };

  const syncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;

    // Mark every queued offline inspection as synced, then clear the queue.
    const inspectionIds = new Set<string>();
    offlineQueue.forEach((item) => {
      if (item.type === 'INSPECTION_SUBMIT' && 'inspection' in item.payload) {
        inspectionIds.add(item.payload.inspection.id);
      }
    });

    setInspections((prev) =>
      prev.map((insp) =>
        inspectionIds.has(insp.id) ? { ...insp, isSyncedOffline: false } : insp
      )
    );

    setOfflineQueue([]);
  };

  const clearAllData = () => {
    // Remove only this app's persisted keys, preserving any unrelated storage.
    Object.keys(localStorage)
      .filter((key) => key.startsWith(LOCAL_STORAGE_KEY))
      .forEach((key) => localStorage.removeItem(key));

    setVehicles(initialVehicles);
    setRoutes(initialRoutes);
    setTickets(initialTickets);
    setTemplates(initialTemplates);
    setActiveTemplateId(initialTemplates[0].id);
    setInspections(initialInspectionHistory);
    setPreventivePlans(initialPreventivePlans);
    setDocuments(initialDocuments);
    setOfflineQueue([]);
    setCurrentUser(initialUsers[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        vehicles,
        routes,
        tickets,
        templates,
        template,
        activeTemplateId,
        setActiveTemplateId,
        inspections,
        preventivePlans,
        documents,
        isOnline,
        offlineQueue,
        switchRole,
        saveUser,
        deleteUser,
        assignUserRouteAndVehicle,
        assignOperatorToRoute,
        assignOperatorToVehicle,
        saveTicket,
        deleteTicket,
        updateTicketStatus,
        updateTicketCostsAndParts,
        assignTicket,
        reconfirmTicket,
        submitInspection,
        adminUnblockVehicle,
        updateTemplate,
        saveTemplate,
        deleteTemplate,
        duplicateTemplate,
        setDefaultTemplate,
        saveVehicle,
        deleteVehicle,
        saveRoute,
        deleteRoute,
        assignVehicleToRoute,
        reassignVehicleDueToBreakdown,
        savePreventivePlan,
        completePreventiveService,
        deletePreventivePlan,
        saveDocument,
        deleteDocument,
        syncOfflineQueue,
        clearAllData,
        getOpenTicketsForUnit,
        getCriticalUnresolvedTicketForUnit,
        getVehicleForRoute,
        getRouteForVehicle,
        getNextTicketFolio
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
