import React, { useState, useEffect } from 'react';
import { Vehicle, Route } from '../../types';
import {
  QrCode,
  Camera,
  X,
  AlertCircle,
  Truck,
  MapPin,
  Check,
  Search,
  Zap,
  ArrowRight
} from 'lucide-react';

interface Props {
  vehicles: Vehicle[];
  routes: Route[];
  isOpen: boolean;
  onClose: () => void;
  onSelectUnitOrRoute: (unit: Vehicle, route?: Route) => void;
}

export const QrScannerModal: React.FC<Props> = ({
  vehicles,
  routes,
  isOpen,
  onClose,
  onSelectUnitOrRoute
}) => {
  const [mode, setMode] = useState<'SCANNER' | 'MANUAL'>('SCANNER');
  const [manualSearch, setManualSearch] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [scanMessage, setScanMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSimulateScan = (vehicle: Vehicle) => {
    setScanMessage(`¡QR detectado! Camión #${vehicle.economicNumber} (${vehicle.codeName})`);
    if ('vibrate' in navigator) navigator.vibrate([40, 60, 40]);

    setTimeout(() => {
      const assignedRoute = routes.find((r) => r.assignedVehicleId === vehicle.id);
      onSelectUnitOrRoute(vehicle, assignedRoute);
      onClose();
    }, 600);
  };

  const filteredVehicles = vehicles.filter((v) => {
    const s = manualSearch.toLowerCase();
    const assignedRoute = routes.find((r) => r.assignedVehicleId === v.id);
    return (
      v.economicNumber.toLowerCase().includes(s) ||
      v.codeName.toLowerCase().includes(s) ||
      v.plate.toLowerCase().includes(s) ||
      v.model.toLowerCase().includes(s) ||
      (assignedRoute && assignedRoute.code.toLowerCase().includes(s))
    );
  });

  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {mode === 'SCANNER' ? 'Escáner QR de Unidad' : 'Selección Manual de Camión'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {mode === 'SCANNER'
                  ? 'Apunta la cámara al código QR de la unidad'
                  : 'Ingresa el número económico si el QR está ilegible'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {mode === 'SCANNER' ? (
            <div className="space-y-4 text-center">
              {/* Camera Scanner Viewfinder */}
              <div className="relative w-full aspect-square max-w-[280px] mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 flex flex-col items-center justify-center shadow-inner">
                {/* Laser animation */}
                <div className="absolute inset-x-4 top-8 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce duration-1000" />

                {/* Viewfinder Target corners */}
                <div className="w-48 h-48 border-2 border-dashed border-emerald-400/70 rounded-xl flex flex-col items-center justify-center p-3 relative">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-emerald-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-emerald-400" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-emerald-400" />

                  <Camera className="w-8 h-8 text-emerald-400/80 mb-2 animate-pulse" />
                  <span className="text-[10px] text-slate-300 font-mono">
                    Enfocando sticker QR del camión...
                  </span>
                </div>

                <div className="absolute bottom-3 inset-x-3 bg-slate-900/80 backdrop-blur-xs py-1 px-2 rounded-lg text-[10px] text-slate-300 font-mono">
                  Cam 1080p Activa • Auto-enfoque
                </div>
              </div>

              {scanMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 animate-fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{scanMessage}</span>
                </div>
              )}

              {/* Quick test buttons (Simular escaneo de camión en patio) */}
              <div className="space-y-1.5 text-left bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] font-bold uppercase text-slate-500 block font-mono">
                  O prueba rápida de detección QR:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {vehicles.slice(0, 6).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSimulateScan(v)}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold font-mono text-center transition-all cursor-pointer truncate shadow-2xs hover:border-slate-400"
                    >
                      QR #{v.economicNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fallback button: QR DAÑADO O NO TIENE QR */}
              <button
                type="button"
                onClick={() => setMode('MANUAL')}
                className="w-full py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>¿QR Dañado, sucio o no tiene? Escribir N° Económico Manual</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Escribe N° Económico (ej. 507, 101, 12) o Placa..."
                  value={manualSearch}
                  onChange={(e) => setManualSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-400"
                />
              </div>

              {/* List of matching vehicles */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredVehicles.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No se encontró ningún camión con ese número o placa.
                  </div>
                ) : (
                  filteredVehicles.map((v) => {
                    const assignedRoute = routes.find((r) => r.assignedVehicleId === v.id);
                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          onSelectUnitOrRoute(v, assignedRoute);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            #{v.economicNumber}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs font-mono">
                                {v.codeName}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                • {v.plate}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block">
                              {assignedRoute ? `Asignado a: ${assignedRoute.name}` : 'En Patio / Disponible'}
                            </span>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    );
                  })
                )}
              </div>

              <button
                type="button"
                onClick={() => setMode('SCANNER')}
                className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer"
              >
                ← Volver al Escáner con Cámara
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
