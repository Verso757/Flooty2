import React, { useState } from 'react';
import { PreventivePlan, Vehicle } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../Common/Modal';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Calendar,
  Gauge,
  DollarSign,
  Truck,
  Check,
  Search,
  Filter,
  Trash2,
  ArrowRight
} from 'lucide-react';

export const PreventiveMaintenance: React.FC = () => {
  const {
    vehicles,
    preventivePlans,
    savePreventivePlan,
    completePreventiveService,
    deletePreventivePlan,
    currentUser
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VENCIDO' | 'PROXIMO' | 'AL_DIA'>('ALL');

  // Modal States
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedPlanForComplete, setSelectedPlanForComplete] = useState<PreventivePlan | null>(null);

  // Form states for new plan
  const [newVehicleId, setNewVehicleId] = useState(vehicles[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newIntervalKm, setNewIntervalKm] = useState(15000);
  const [newIntervalDays, setNewIntervalDays] = useState(90);
  const [newEstimatedCost, setNewEstimatedCost] = useState(2500);
  const [newNotes, setNewNotes] = useState('');

  // Form states for completing service
  const [completionKm, setCompletionKm] = useState<number>(0);
  const [completionCost, setCompletionCost] = useState<number>(0);
  const [completionNotes, setCompletionNotes] = useState('');

  // Helper to calculate status
  const getPlanStatus = (plan: PreventivePlan) => {
    const vehicle = vehicles.find((v) => v.id === plan.vehicleId);
    const currentKm = vehicle?.odometerKm || plan.lastServiceKm;
    const kmRemaining = plan.nextDueKm - currentKm;

    const today = new Date();
    const dueDate = new Date(plan.nextDueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (kmRemaining <= 0 || daysRemaining <= 0) {
      return { status: 'VENCIDO', label: 'Vencido', color: 'rose', kmRemaining, daysRemaining, currentKm };
    }
    if (kmRemaining <= 1500 || daysRemaining <= 15) {
      return { status: 'PROXIMO', label: 'Próximo', color: 'amber', kmRemaining, daysRemaining, currentKm };
    }
    return { status: 'AL_DIA', label: 'Al Día', color: 'emerald', kmRemaining, daysRemaining, currentKm };
  };

  const plansWithStatus = preventivePlans.map((plan) => ({
    ...plan,
    calc: getPlanStatus(plan)
  }));

  const filteredPlans = plansWithStatus.filter((p) => {
    const s = searchTerm.toLowerCase();
    const vehicle = vehicles.find((v) => v.id === p.vehicleId);
    const matchesSearch =
      p.serviceTitle.toLowerCase().includes(s) ||
      p.economicNumber.toLowerCase().includes(s) ||
      (vehicle && (vehicle.model.toLowerCase().includes(s) || vehicle.plate.toLowerCase().includes(s)));

    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;
    return p.calc.status === filterStatus;
  });

  const totalVencidos = plansWithStatus.filter((p) => p.calc.status === 'VENCIDO').length;
  const totalProximos = plansWithStatus.filter((p) => p.calc.status === 'PROXIMO').length;
  const totalAlDia = plansWithStatus.filter((p) => p.calc.status === 'AL_DIA').length;

  const handleOpenCompleteModal = (plan: PreventivePlan) => {
    const vehicle = vehicles.find((v) => v.id === plan.vehicleId);
    setSelectedPlanForComplete(plan);
    setCompletionKm(vehicle?.odometerKm || plan.nextDueKm);
    setCompletionCost(plan.estimatedCost || 0);
    setCompletionNotes(`Servicio preventivo completado por ${currentUser.name}`);
    setIsCompleteModalOpen(true);
  };

  const handleSaveNewPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const v = vehicles.find((item) => item.id === newVehicleId);
    if (!v) return;

    const currentKm = v.odometerKm || 0;
    const now = new Date();
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + Number(newIntervalDays));

    const newPlan: PreventivePlan = {
      id: `prev-${Date.now()}`,
      vehicleId: v.id,
      economicNumber: v.economicNumber,
      serviceTitle: newTitle,
      intervalKm: Number(newIntervalKm),
      intervalDays: Number(newIntervalDays),
      lastServiceKm: currentKm,
      lastServiceDate: now.toISOString().split('T')[0],
      nextDueKm: currentKm + Number(newIntervalKm),
      nextDueDate: nextDate.toISOString().split('T')[0],
      estimatedCost: Number(newEstimatedCost),
      notes: newNotes
    };

    savePreventivePlan(newPlan);
    setIsNewPlanModalOpen(false);
    setNewTitle('');
  };

  const handleConfirmCompleteService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForComplete) return;

    completePreventiveService(
      selectedPlanForComplete.id,
      Number(completionKm),
      Number(completionCost),
      completionNotes
    );

    setIsCompleteModalOpen(false);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
            Mantenimiento Preventivo Programado
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Calendario y Odómetro de Servicios
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Programa rutinas preventivas por kilometraje y días para prevenir descomposturas en ruta.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewPlanModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Programar Nueva Rutina</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => setFilterStatus(filterStatus === 'VENCIDO' ? 'ALL' : 'VENCIDO')}
          className={`bg-white border rounded-2xl p-4 transition-all cursor-pointer shadow-xs ${
            filterStatus === 'VENCIDO' ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase font-mono">Vencidos / Urgentes</span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600 font-mono mt-1">{totalVencidos}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Requieren atención inmediata en taller</p>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === 'PROXIMO' ? 'ALL' : 'PROXIMO')}
          className={`bg-white border rounded-2xl p-4 transition-all cursor-pointer shadow-xs ${
            filterStatus === 'PROXIMO' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase font-mono">Próximos a Vencer</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600 font-mono mt-1">{totalProximos}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">&lt; 15 días o &lt; 1,500 km restantes</p>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === 'AL_DIA' ? 'ALL' : 'AL_DIA')}
          className={`bg-white border rounded-2xl p-4 transition-all cursor-pointer shadow-xs ${
            filterStatus === 'AL_DIA' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase font-mono">Servicios Al Día</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 font-mono mt-1">{totalAlDia}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Operando dentro de rango seguro</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por camión, servicio o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-500 font-mono mr-1">Filtrar:</span>
          {(['ALL', 'VENCIDO', 'PROXIMO', 'AL_DIA'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer shrink-0 ${
                filterStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Todos' : st === 'VENCIDO' ? 'Vencidos' : st === 'PROXIMO' ? 'Próximos' : 'Al Día'}
            </button>
          ))}
        </div>
      </div>

      {/* List of Plans */}
      <div className="space-y-3">
        {filteredPlans.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
            <Wrench className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
            <p className="text-xs font-bold text-slate-800">No se encontraron rutinas preventivas</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Prueba cambiando los filtros o programa una nueva rutina.</p>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const vehicle = vehicles.find((v) => v.id === plan.vehicleId);
            const isVencido = plan.calc.status === 'VENCIDO';
            const isProximo = plan.calc.status === 'PROXIMO';

            return (
              <div
                key={plan.id}
                className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
                  isVencido
                    ? 'border-rose-300 bg-rose-50/20'
                    : isProximo
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold font-mono">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Camión #{plan.economicNumber}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {plan.serviceTitle}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 font-mono">
                      {vehicle?.model} • Placa: <strong className="text-slate-800">{vehicle?.plate}</strong> • Odómetro Actual: <strong className="text-slate-900 font-bold">{plan.calc.currentKm.toLocaleString()} km</strong>
                    </p>

                    {plan.notes && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 inline-block">
                        💡 {plan.notes}
                      </p>
                    )}
                  </div>

                  {/* Right Status Badge */}
                  <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0">
                    <span
                      className={`text-xs font-bold uppercase font-mono px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
                        isVencido
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : isProximo
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {isVencido ? <AlertTriangle className="w-3.5 h-3.5" /> : isProximo ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{plan.calc.label}</span>
                    </span>

                    {plan.estimatedCost && (
                      <span className="text-xs text-slate-500 font-mono">
                        Est: <strong className="text-slate-900">${plan.estimatedCost.toLocaleString()} MXN</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress / Metas */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      Próximo Km
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {plan.nextDueKm.toLocaleString()} km
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      ({plan.calc.kmRemaining > 0 ? `${plan.calc.kmRemaining.toLocaleString()} km restantes` : `${Math.abs(plan.calc.kmRemaining).toLocaleString()} km excedidos`})
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      Fecha Límite
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {plan.nextDueDate}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      ({plan.calc.daysRemaining > 0 ? `${plan.calc.daysRemaining} días restantes` : `${Math.abs(plan.calc.daysRemaining)} días vencido`})
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      Frecuencia
                    </span>
                    <span className="font-bold text-slate-800 font-mono">
                      c/ {plan.intervalKm.toLocaleString()} km
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      o cada {plan.intervalDays} días
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      Último Servicio
                    </span>
                    <span className="font-bold text-slate-800 font-mono">
                      {plan.lastServiceKm.toLocaleString()} km
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {plan.lastServiceDate}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => deletePreventivePlan(plan.id)}
                    className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar plan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenCompleteModal(plan)}
                    className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Registrar Servicio Realizado</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Registrar Servicio Realizado */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title="Completar Servicio Preventivo"
        subtitle={`Camión #${selectedPlanForComplete?.economicNumber} • ${selectedPlanForComplete?.serviceTitle}`}
      >

            <form onSubmit={handleConfirmCompleteService} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kilometraje del odómetro al realizar servicio *
                </label>
                <input
                  type="number"
                  required
                  value={completionKm}
                  onChange={(e) => setCompletionKm(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Costo Total del Servicio ($ MXN)
                </label>
                <input
                  type="number"
                  value={completionCost}
                  onChange={(e) => setCompletionCost(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas de Taller / Refacciones Usadas
                </label>
                <textarea
                  rows={2}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Guardar y Recalcular
                </button>
              </div>
            </form>
      </Modal>

      {/* Modal: Programar Nueva Rutina */}
      <Modal
        isOpen={isNewPlanModalOpen}
        onClose={() => setIsNewPlanModalOpen(false)}
        title="Nueva Rutina Preventiva"
        subtitle="Configura frecuencia por odómetro y calendario"
      >

            <form onSubmit={handleSaveNewPlan} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selecciona el Camión / Unidad *
                </label>
                <select
                  required
                  value={newVehicleId}
                  onChange={(e) => setNewVehicleId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      Camión #{v.economicNumber} - {v.plate} ({v.model}) - {(v.odometerKm || 0).toLocaleString()} km
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título del Servicio Preventivo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cambio de Aceite y Filtros 15W40 / Calibración Frenos"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Intervalo en Km *
                  </label>
                  <input
                    type="number"
                    required
                    value={newIntervalKm}
                    onChange={(e) => setNewIntervalKm(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Intervalo en Días *
                  </label>
                  <input
                    type="number"
                    required
                    value={newIntervalDays}
                    onChange={(e) => setNewIntervalDays(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Costo Estimado ($ MXN)
                </label>
                <input
                  type="number"
                  value={newEstimatedCost}
                  onChange={(e) => setNewEstimatedCost(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas de Refacciones o Instrucciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Especificaciones de aceite, filtros requeridos..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Guardar Rutina
                </button>
              </div>
            </form>
      </Modal>
    </div>
  );
};
