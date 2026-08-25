import React, { useState } from 'react';
import { Vehicle, Route, Ticket, Answer, Severity } from '../../types';
import { useApp } from '../../context/AppContext';
import { BlockedUnitModal } from './BlockedUnitModal';
import { TicketConfirmationModal } from './TicketConfirmationModal';
import { ChecklistWizard } from './ChecklistWizard';
import { InspectionSummary } from './InspectionSummary';
import { QrScannerModal } from '../Common/QrScannerModal';
import {
  MapPin,
  Truck,
  AlertTriangle,
  Lock,
  CheckCircle2,
  ClipboardList,
  ArrowRight,
  RefreshCw,
  Search,
  Check,
  HelpCircle,
  ShieldAlert,
  QrCode,
  Camera,
  PenTool
} from 'lucide-react';

export const VehicleList: React.FC = () => {
  const {
    routes,
    vehicles,
    currentUser,
    getOpenTicketsForUnit,
    getCriticalUnresolvedTicketForUnit,
    templates,
    template,
    submitInspection,
    isOnline,
    reassignVehicleDueToBreakdown,
    assignVehicleToRoute
  } = useApp();

  // Search & Filter
  const [routeSearch, setRouteSearch] = useState('');

  // QR Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Selected Route & Truck State
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [chosenTemplateId, setChosenTemplateId] = useState<string>('');

  // Flow Sub-view Step
  const [flowStep, setFlowStep] = useState<
    'NONE' | 'BLOCKED' | 'RECONFIRM' | 'CHECKLIST' | 'SUMMARY'
  >('NONE');

  // Quick Truck Swap Modal on Broken / Blocked Unit
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [targetSwapRoute, setTargetSwapRoute] = useState<Route | null>(null);
  const [replacementVehicleId, setReplacementVehicleId] = useState('');
  const [swapReason, setSwapReason] = useState('Unidad titular inservible / en reparación de taller');
  const [swapSuccessMsg, setSwapSuccessMsg] = useState('');

  const [activeOpenTickets, setActiveOpenTickets] = useState<Ticket[]>([]);
  const [activeCriticalTicket, setActiveCriticalTicket] = useState<Ticket | undefined>(
    undefined
  );

  // Summary result state
  const [lastSubmissionData, setLastSubmissionData] = useState<{
    inspectionId: string;
    generatedTicketFolios: string[];
    answers: Answer[];
    signatureData?: {
      signatureUrl?: string;
      signedByRole?: 'operador' | 'supervisor';
      signedByName?: string;
    };
  } | null>(null);

  // Filter routes by search query
  const filteredRoutes = routes.filter((r) => {
    const assignedV = vehicles.find((v) => v.id === r.assignedVehicleId);
    const search = routeSearch.toLowerCase();
    return (
      r.code.toLowerCase().includes(search) ||
      r.name.toLowerCase().includes(search) ||
      (r.zone && r.zone.toLowerCase().includes(search)) ||
      (assignedV && (
        assignedV.economicNumber.toLowerCase().includes(search) ||
        assignedV.codeName.toLowerCase().includes(search) ||
        assignedV.plate.toLowerCase().includes(search)
      ))
    );
  });

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
    const vehicle = vehicles.find((v) => v.id === route.assignedVehicleId);

    if (!vehicle) {
      // Route has no truck assigned
      setTargetSwapRoute(route);
      setReplacementVehicleId(vehicles.find((v) => v.status === 'activa' && !v.currentRouteId)?.id || '');
      setIsSwapModalOpen(true);
      return;
    }

    setSelectedVehicle(vehicle);

    const criticalTicket = getCriticalUnresolvedTicketForUnit(vehicle.id);
    const openTickets = getOpenTicketsForUnit(vehicle.id);

    // Step 1: Check if truck is blocked / out of service
    if (vehicle.status === 'bloqueada' || criticalTicket) {
      setActiveCriticalTicket(criticalTicket);
      setFlowStep('BLOCKED');
      return;
    }

    // Step 2: Check for unresolved tickets from previous days
    if (openTickets.length > 0) {
      setActiveOpenTickets(openTickets);
      setFlowStep('RECONFIRM');
      return;
    }

    // Step 3: Direct to checklist
    setFlowStep('CHECKLIST');
  };

  const handleQrSelectUnit = (vehicle: Vehicle, route?: Route) => {
    setSelectedVehicle(vehicle);
    if (route) {
      setSelectedRoute(route);
    } else {
      const foundRoute = routes.find((r) => r.assignedVehicleId === vehicle.id);
      setSelectedRoute(foundRoute || null);
    }

    const criticalTicket = getCriticalUnresolvedTicketForUnit(vehicle.id);
    const openTickets = getOpenTicketsForUnit(vehicle.id);

    if (vehicle.status === 'bloqueada' || criticalTicket) {
      setActiveCriticalTicket(criticalTicket);
      setFlowStep('BLOCKED');
      return;
    }

    if (openTickets.length > 0) {
      setActiveOpenTickets(openTickets);
      setFlowStep('RECONFIRM');
      return;
    }

    setFlowStep('CHECKLIST');
  };

  const handleOpenSwapModal = (route: Route, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetSwapRoute(route);
    const currentV = vehicles.find((v) => v.id === route.assignedVehicleId);
    const firstAvailable = vehicles.find(
      (v) => v.status === 'activa' && v.id !== currentV?.id
    );
    setReplacementVehicleId(firstAvailable?.id || '');
    setSwapReason(
      currentV?.status === 'bloqueada'
        ? `Camión #${currentV.economicNumber} inservible por reporte de falla en taller`
        : 'Cambio de camión asignado a la ruta'
    );
    setIsSwapModalOpen(true);
  };

  const handleConfirmTruckSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSwapRoute || !replacementVehicleId) return;

    reassignVehicleDueToBreakdown(targetSwapRoute.id, replacementVehicleId, swapReason);

    const newVehicle = vehicles.find((v) => v.id === replacementVehicleId);
    setSwapSuccessMsg(`¡Camión #${newVehicle?.economicNumber || ''} asignado exitosamente a la ${targetSwapRoute.name}!`);

    setTimeout(() => {
      setSwapSuccessMsg('');
      setIsSwapModalOpen(false);
      // If we were in blocked step, return to routes or continue
      if (flowStep === 'BLOCKED') {
        resetFlow();
      }
    }, 1200);
  };

  const handleReconfirmFinished = () => {
    setFlowStep('CHECKLIST');
  };

  const handleChecklistComplete = (
    answers: Answer[],
    generatedTickets: {
      questionId: string;
      title: string;
      description: string;
      severity: Severity;
      category: string;
      photo?: string;
    }[],
    signatureData?: {
      signatureUrl?: string;
      signedByRole?: 'operador' | 'supervisor';
      signedByName?: string;
    }
  ) => {
    if (!selectedVehicle) return;

    const reconfirmedIds = activeOpenTickets.map((t) => t.id);

    const matchingTemplate = chosenTemplateId
      ? templates.find((t) => t.id === chosenTemplateId)
      : templates.find((t) => t.targetVehicleType === selectedVehicle.type) ||
        templates.find((t) => t.isDefault) ||
        template;

    const result = submitInspection(
      selectedVehicle.id,
      answers,
      generatedTickets,
      reconfirmedIds,
      undefined,
      selectedRoute?.id,
      signatureData,
      matchingTemplate.id
    );

    setLastSubmissionData({
      inspectionId: result.inspectionId,
      generatedTicketFolios: result.generatedTicketFolios,
      answers,
      signatureData
    });

    setFlowStep('SUMMARY');
  };

  const resetFlow = () => {
    setSelectedRoute(null);
    setSelectedVehicle(null);
    setFlowStep('NONE');
    setActiveOpenTickets([]);
    setActiveCriticalTicket(undefined);
    setLastSubmissionData(null);
  };

  // Sub-views rendering
  if (flowStep === 'BLOCKED' && selectedVehicle) {
    return (
      <BlockedUnitModal
        vehicle={selectedVehicle}
        criticalTicket={activeCriticalTicket}
        route={selectedRoute || undefined}
        onSwapTruck={() => selectedRoute && handleOpenSwapModal(selectedRoute)}
        onBack={resetFlow}
      />
    );
  }

  if (flowStep === 'RECONFIRM' && selectedVehicle) {
    return (
      <TicketConfirmationModal
        vehicle={selectedVehicle}
        openTickets={activeOpenTickets}
        onComplete={handleReconfirmFinished}
        onBack={resetFlow}
      />
    );
  }

  if (flowStep === 'CHECKLIST' && selectedVehicle) {
    const activeInspectionTemplate = chosenTemplateId
      ? templates.find((t) => t.id === chosenTemplateId)
      : templates.find((t) => t.targetVehicleType === selectedVehicle.type) ||
        templates.find((t) => t.isDefault) ||
        template;

    return (
      <ChecklistWizard
        vehicle={selectedVehicle}
        route={selectedRoute || undefined}
        template={activeInspectionTemplate}
        onComplete={handleChecklistComplete}
        onCancel={resetFlow}
      />
    );
  }

  if (flowStep === 'SUMMARY' && selectedVehicle && lastSubmissionData) {
    return (
      <InspectionSummary
        vehicle={selectedVehicle}
        route={selectedRoute || undefined}
        inspectionId={lastSubmissionData.inspectionId}
        generatedTicketFolios={lastSubmissionData.generatedTicketFolios}
        answers={lastSubmissionData.answers}
        signatureData={lastSubmissionData.signatureData}
        isOnline={isOnline}
        onFinish={resetFlow}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in pb-16">
      {/* Top Route Selection Banner with QR Action */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
              Inspección Pre-Operacional Diaria
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              Selecciona tu Ruta o Escanea QR
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Apunta la cámara al sticker QR del camión o selecciona tu ruta para iniciar la revisión.
            </p>
          </div>

          {/* Quick QR Scanner Button */}
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0 transition-transform active:scale-98"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Escanear QR de Camión</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar por número de ruta (ej. 125), zona o camión (#507)..."
            value={routeSearch}
            onChange={(e) => setRouteSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
          />
        </div>
      </div>

      {/* Routes List */}
      <div className="space-y-3">
        {filteredRoutes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
            <p className="text-xs font-bold text-slate-800">No se encontraron rutas con esa búsqueda</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Prueba buscando por número de ruta (ej. 125, 101, 402) o camión.</p>
          </div>
        ) : (
          filteredRoutes.map((route) => {
            const assignedVehicle = vehicles.find((v) => v.id === route.assignedVehicleId);
            const openTickets = assignedVehicle ? getOpenTicketsForUnit(assignedVehicle.id) : [];
            const criticalTicket = assignedVehicle ? getCriticalUnresolvedTicketForUnit(assignedVehicle.id) : undefined;
            const isBlocked = assignedVehicle?.status === 'bloqueada' || !!criticalTicket;

            return (
              <div
                key={route.id}
                onClick={() => handleSelectRoute(route)}
                className={`rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer bg-white shadow-xs hover:shadow-md ${
                  !assignedVehicle
                    ? 'border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-50'
                    : isBlocked
                    ? 'border-rose-300 bg-rose-50/30 hover:bg-rose-50/60'
                    : openTickets.length > 0
                    ? 'border-amber-300 bg-amber-50/30 hover:bg-amber-50/60'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    {/* Route Code Badge */}
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 shadow-xs border border-slate-800">
                      <span className="text-[9px] font-mono uppercase text-slate-400 leading-none">Ruta</span>
                      <span className="text-base font-black font-mono leading-tight">{route.code}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">{route.name}</h3>
                        {route.zone && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            • {route.zone}
                          </span>
                        )}
                      </div>

                      {/* Assigned Truck Info Box */}
                      {assignedVehicle ? (
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 text-xs font-bold font-mono">
                            <Truck className="w-3.5 h-3.5 text-slate-600" />
                            <span>Camión #{assignedVehicle.economicNumber}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Placa: <strong className="text-slate-800">{assignedVehicle.plate}</strong> ({assignedVehicle.model})
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-amber-700 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Sin camión asignado a esta ruta</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {!assignedVehicle ? (
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 border border-slate-300 font-mono">
                        Sin Unidad
                      </span>
                    ) : isBlocked ? (
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 font-mono">
                        <Lock className="w-3 h-3" /> Camión Bloqueado
                      </span>
                    ) : openTickets.length > 0 ? (
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5" /> {openTickets.length} Pendiente
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Camión Listo
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Bar */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* Left: Quick Truck Reassignment Button */}
                  <button
                    type="button"
                    onClick={(e) => handleOpenSwapModal(route, e)}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Cambiar de camión asignado a esta ruta si está inservible"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                    <span>Cambiar Camión</span>
                  </button>

                  {/* Right: Inspect Action */}
                  <div className="flex items-center gap-1 font-bold text-slate-900 hover:text-blue-600 transition-colors">
                    <span>{assignedVehicle ? 'Revisar Camión Asignado' : 'Asignar Camión'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QR Scanner Modal (With Camera and Manual Number fallback) */}
      <QrScannerModal
        vehicles={vehicles}
        routes={routes}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onSelectUnitOrRoute={handleQrSelectUnit}
      />

      {/* SWAP TRUCK MODAL (Cambio de Camión a Ruta por descompostura o inservible) */}
      {isSwapModalOpen && targetSwapRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Cambiar Camión Asignado a {targetSwapRoute.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sustituir unidad titular si está inservible o en taller.
                  </p>
                </div>
              </div>
            </div>

            {swapSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{swapSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleConfirmTruckSwap} className="space-y-3.5">
                {/* Current Truck Status */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">
                    Camión Actual de la Ruta
                  </span>
                  {(() => {
                    const cur = vehicles.find((v) => v.id === targetSwapRoute.assignedVehicleId);
                    if (!cur) return <span className="font-bold text-slate-700">Sin camión asignado</span>;
                    return (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 font-mono">
                          {cur.codeName} (#{cur.economicNumber})
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          cur.status === 'bloqueada' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}>
                          {cur.status}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Replacement Truck Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selecciona el Nuevo Camión / Unidad de Reemplazo *
                  </label>
                  <select
                    required
                    value={replacementVehicleId}
                    onChange={(e) => setReplacementVehicleId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 cursor-pointer"
                  >
                    <option value="">-- Seleccionar Camión Disponible --</option>
                    {vehicles
                      .filter((v) => v.id !== targetSwapRoute.assignedVehicleId)
                      .map((truck) => (
                        <option key={truck.id} value={truck.id}>
                          Camión #{truck.economicNumber} - {truck.plate} ({truck.model}) - [{truck.status.toUpperCase()}]
                          {truck.currentRouteId ? ` (Ruta ${routes.find(r => r.id === truck.currentRouteId)?.code})` : ' (En Patio / Respaldo)'}
                        </option>
                      ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Se recomienda seleccionar una unidad activa disponible en patio (ej. Camión 07 o Camión 89).
                  </p>
                </div>

                {/* Reason for swap */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Motivo del Cambio de Camión *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Camión titular inservible por falla en frenos / cambio por mantenimiento"
                    value={swapReason}
                    onChange={(e) => setSwapReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSwapModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Confirmar Cambio
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
