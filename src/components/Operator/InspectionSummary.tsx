import React from 'react';
import { Vehicle, Route, Answer, Severity } from '../../types';
import { CheckCircle2, AlertOctagon, ShieldCheck, Ticket, WifiOff, ArrowRight, PenTool } from 'lucide-react';

interface Props {
  vehicle: Vehicle;
  route?: Route;
  inspectionId: string;
  generatedTicketFolios: string[];
  answers: Answer[];
  signatureData?: {
    signatureUrl?: string;
    signedByRole?: 'operador' | 'supervisor';
    signedByName?: string;
  };
  isOnline: boolean;
  onFinish: () => void;
}

export const InspectionSummary: React.FC<Props> = ({
  vehicle,
  route,
  inspectionId,
  generatedTicketFolios,
  answers,
  signatureData,
  isOnline,
  onFinish
}) => {
  const passedCount = answers.filter((a) => a.pass).length;
  const failedCount = answers.filter((a) => !a.pass).length;

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-lg mx-auto p-4 animate-fade-in pb-12">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xl text-center relative overflow-hidden">
        {/* Status Icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 border ${
          failedCount > 0
            ? 'bg-amber-50 border-amber-200 text-amber-600'
            : 'bg-emerald-50 border-emerald-200 text-emerald-600'
        }`}>
          {failedCount > 0 ? (
            <AlertOctagon className="w-8 h-8 stroke-[2.2]" />
          ) : (
            <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
          )}
        </div>

        <span className="text-xs font-mono font-bold text-slate-500 block mb-1">
          Folio de Registro: {inspectionId}
        </span>

        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
          {failedCount > 0 ? 'Inspección Finalizada con Fallas' : 'Inspección Concluida Exitosamente'}
        </h2>

        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5">
          {route ? (
            <span>
              <strong className="text-slate-900 font-bold">{route.name}</strong> • Camión <strong className="text-slate-900">#{vehicle.economicNumber}</strong> ({vehicle.plate}). Se han registrado los resultados del recorrido.
            </span>
          ) : (
            <span>
              Unidad <strong className="text-slate-900">{vehicle.codeName}</strong> ({vehicle.plate}). Se han registrado los resultados del recorrido.
            </span>
          )}
        </p>

        {/* Offline Warning Notice if queued */}
        {!isOnline && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5 flex items-center gap-2.5 text-left text-xs text-amber-800">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <strong className="block text-slate-900 font-bold">Guardado en Modo Sin Conexión</strong>
              <span className="text-slate-600">Los datos están almacenados en tu teléfono y se sincronizarán al recuperar señal.</span>
            </div>
          </div>
        )}

        {/* Inspection Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
            <span className="text-2xl font-bold text-emerald-600 font-mono">{passedCount}</span>
            <span className="block text-[11px] font-bold text-slate-600 mt-0.5">Puntos en Orden</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
            <span className={`text-2xl font-bold font-mono ${failedCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
              {failedCount}
            </span>
            <span className="block text-[11px] font-bold text-slate-600 mt-0.5">Fallas Reportadas</span>
          </div>
        </div>

        {/* Digital Signature Confirmation Badge */}
        {signatureData && signatureData.signatureUrl && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 text-left space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <PenTool className="w-3.5 h-3.5 text-blue-600" />
                <span>Firma Digital de Conformidad</span>
              </div>
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                {signatureData.signedByRole === 'supervisor' ? 'Supervisor de Patio' : 'Operador / Chofer'}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
              <img
                src={signatureData.signatureUrl}
                alt="Firma"
                className="h-10 w-24 object-contain border border-dashed border-slate-300 rounded bg-slate-50/50"
              />
              <div className="text-xs">
                <span className="block font-bold text-slate-800">{signatureData.signedByName || 'Firma Registrada'}</span>
                <span className="text-[11px] text-slate-500 font-mono">Certificado con sello de tiempo</span>
              </div>
            </div>
          </div>
        )}

        {/* Generated Tickets List */}
        {generatedTicketFolios.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-1">
              <Ticket className="w-4 h-4 text-amber-600" />
              <span>Tickets Generados Automáticamente ({generatedTicketFolios.length}):</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {generatedTicketFolios.map((folio) => (
                <span
                  key={folio}
                  className="px-2.5 py-1 bg-white text-amber-800 font-mono font-bold text-xs rounded-md border border-amber-300 shadow-2xs"
                >
                  {folio}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Los mecánicos del taller han sido notificados para su atención y seguimiento.
            </p>
          </div>
        )}

        {/* Finish Action Button */}
        <button
          onClick={onFinish}
          className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <span>Volver al Catálogo de Rutas</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
