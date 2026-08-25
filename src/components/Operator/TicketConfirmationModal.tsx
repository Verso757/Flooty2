import React, { useState, useEffect } from 'react';
import { Vehicle, Ticket } from '../../types';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, CheckCircle, XCircle, Camera, ArrowLeft, Send } from 'lucide-react';

interface Props {
  vehicle: Vehicle;
  openTickets: Ticket[];
  onComplete: () => void;
  onBack: () => void;
}

export const TicketConfirmationModal: React.FC<Props> = ({
  vehicle,
  openTickets,
  onComplete,
  onBack
}) => {
  const { reconfirmTicket } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [answeredCount, setAnsweredCount] = useState(0);

  const currentTicket = openTickets[currentIndex];

  useEffect(() => {
    if (openTickets.length === 0) {
      onComplete();
    }
  }, [openTickets.length, onComplete]);

  const handleResponse = (stillPresent: boolean) => {
    if (!currentTicket) return;

    reconfirmTicket(
      currentTicket.id,
      stillPresent,
      photo || undefined,
      notes || undefined
    );

    setPhoto(null);
    setNotes('');

    if (currentIndex + 1 < openTickets.length) {
      setCurrentIndex((prev) => prev + 1);
      setAnsweredCount((prev) => prev + 1);
    } else {
      // All open tickets confirmed! Move on to checklist
      onComplete();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!currentTicket) {
    return null;
  }

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-lg mx-auto p-4 animate-fade-in">
      <div className="bg-white border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Navigation & Counter */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
          <span className="text-xs font-bold font-mono px-3 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            Pendiente {currentIndex + 1} de {openTickets.length}
          </span>
        </div>

        {/* Header Alert */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-2 border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Confirmación de Fallas Anteriores
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Antes de iniciar el checklist, confirma el estado actual de los reportes abiertos de la unidad{' '}
            <strong className="text-slate-900">{vehicle.codeName}</strong>.
          </p>
        </div>

        {/* Ticket Details Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
              {currentTicket.id}
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border font-mono ${
              currentTicket.severity === 'critica'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : currentTicket.severity === 'media'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              Severidad: {currentTicket.severity}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Ayer reportaste:</span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              "{currentTicket.title}"
            </h3>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
              {currentTicket.description}
            </p>
          </div>

          <div className="text-xs text-slate-500 pt-1">
            Categoría: <strong className="text-slate-800">{currentTicket.category}</strong>
          </div>
        </div>

        {/* Optional Photo Attachment */}
        <div className="mb-4 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Foto actual (Opcional):
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer transition-colors">
              <Camera className="w-4 h-4 text-slate-500" />
              <span>{photo ? 'Cambiar Foto' : 'Tomar / Adjuntar Foto'}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
            {photo && (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-300 shrink-0">
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Optional Notes */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Observaciones adicionales (ej. ya fue reparado por taller)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>

        {/* Touch Friendly Action Buttons */}
        <div className="space-y-2">
          <p className="text-center text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 font-mono">
            ¿El problema sigue presente hoy?
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* SÍ, SIGUE PRESENTE */}
            <button
              onClick={() => handleResponse(true)}
              className="py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
            >
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              <span>SÍ, Persiste</span>
            </button>

            {/* NO, YA FUE REPARADO */}
            <button
              onClick={() => handleResponse(false)}
              className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
            >
              <CheckCircle className="w-5 h-5 stroke-[2.2]" />
              <span>NO, Reparado</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
