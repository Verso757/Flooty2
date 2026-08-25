import React, { useState } from 'react';
import { Vehicle, Ticket, Route } from '../../types';
import { useApp } from '../../context/AppContext';
import { AlertOctagon, PhoneCall, ShieldAlert, ArrowLeft, CheckCircle, Lock, RefreshCw, Truck } from 'lucide-react';

interface Props {
  vehicle: Vehicle;
  criticalTicket?: Ticket;
  route?: Route;
  onSwapTruck?: () => void;
  onBack: () => void;
}

export const BlockedUnitModal: React.FC<Props> = ({ vehicle, criticalTicket, route, onSwapTruck, onBack }) => {
  const { adminUnblockVehicle, currentUser } = useApp();
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || currentUser.role === 'administrador') {
      adminUnblockVehicle(vehicle.id, overrideReason || 'Excepción autorizada en campo');
      setShowAdminPinModal(false);
      onBack();
    } else {
      setErrorMsg('PIN de administrador incorrecto. El PIN por defecto es 1234.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-lg mx-auto p-4 animate-fade-in">
      <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold mb-4 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo de Rutas</span>
        </button>

        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-rose-200 shadow-xs">
            <Lock className="w-8 h-8 stroke-[2.2]" />
          </div>
          <span className="inline-block px-3 py-0.5 rounded-md bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider border border-rose-200 mb-2 font-mono">
            Camión Inservible / Bloqueado
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {vehicle.codeName} (#{vehicle.economicNumber})
          </h2>
          {route && (
            <p className="text-xs text-rose-700 font-bold mt-0.5">
              Asignado a: {route.name} ({route.zone || 'Sector Operativo'})
            </p>
          )}
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Placa: {vehicle.plate} • {vehicle.model}
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 mb-5">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-rose-900">
                Camión fuera de servicio
              </h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                El <strong className="text-slate-900">Camión #{vehicle.economicNumber}</strong> asignado a esta ruta presenta una falla <strong className="text-rose-700">CRÍTICA</strong> sin resolver. Por seguridad vial no puede salir a ruta.
              </p>
              {onSwapTruck && (
                <p className="text-xs text-slate-600 mt-1.5">
                  👉 Puedes cambiar temporalmente de camión a esta ruta con una unidad disponible de patio.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        {criticalTicket && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {criticalTicket.id}
              </span>
              <span className="text-slate-500 text-[11px]">
                {new Date(criticalTicket.createdAt).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900">
                {criticalTicket.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {criticalTicket.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Reportó: <strong className="text-slate-800">{criticalTicket.reportedBy}</strong></span>
              <span>Asignado: <strong className="text-amber-700">{criticalTicket.assignedTo || 'Mecánico'}</strong></span>
            </div>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="space-y-2.5">
          {/* Quick Truck Swap Button */}
          {onSwapTruck && (
            <button
              onClick={onSwapTruck}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>Cambiar de Camión a la Ruta {route?.code}</span>
            </button>
          )}

          <a
            href="tel:+525598765432"
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Avisar a Taller / Mecánico</span>
          </a>

          <button
            onClick={() => setShowAdminPinModal(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-slate-500" />
            <span>Excepción de Administrador (Desbloquear Unidad)</span>
          </button>
        </div>
      </div>

      {/* Admin Override PIN Dialog */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center mx-auto mb-2 border border-slate-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Autorizar Excepción</h3>
              <p className="text-xs text-slate-500 mt-1">
                Ingresa el PIN de Administrador para liberar la unidad bajo responsabilidad del supervisor.
              </p>
            </div>

            <form onSubmit={handleAdminOverride} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo de Excepción
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Traslado controlado a taller central"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PIN de Administrador (Prueba: 1234)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="****"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center tracking-widest text-base text-slate-900 focus:outline-none focus:border-slate-400 font-mono font-bold"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 font-semibold text-center">{errorMsg}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminPinModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
