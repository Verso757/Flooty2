import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, PenTool, Check, ShieldCheck, UserCheck } from 'lucide-react';

interface Props {
  initialSignerName?: string;
  initialRole?: 'operador' | 'supervisor';
  onSave: (signatureData: {
    signatureUrl: string;
    signedByRole: 'operador' | 'supervisor';
    signedByName: string;
  }) => void;
  onCancel?: () => void;
}

export const SignaturePad: React.FC<Props> = ({
  initialSignerName = '',
  initialRole = 'operador',
  onSave,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState(initialSignerName);
  const [signerRole, setSignerRole] = useState<'operador' | 'supervisor'>(initialRole);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set display vs internal resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = '#0f172a'; // Slate-900 ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setErrorMsg('');
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = (e?: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    if (e) e.preventDefault();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasSignature(false);
    setErrorMsg('');
  };

  const handleConfirm = () => {
    if (!signerName.trim()) {
      setErrorMsg('Por favor ingresa el nombre de quien firma la entrega.');
      return;
    }

    if (!hasSignature) {
      setErrorMsg('Por favor dibuja tu firma táctil en el recuadro antes de finalizar.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    onSave({
      signatureUrl: dataUrl,
      signedByRole: signerRole,
      signedByName: signerName.trim()
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 max-w-md w-full mx-auto animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Firma Digital de Conformidad
            </h3>
            <p className="text-[11px] text-slate-500">
              Validación y cierre de la inspección pre-operacional
            </p>
          </div>
        </div>
      </div>

      {/* Role Switcher */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          ¿Quién realiza el levantamiento / validación?
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSignerRole('operador')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              signerRole === 'operador'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Operador / Chofer</span>
          </button>
          <button
            type="button"
            onClick={() => setSignerRole('supervisor')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              signerRole === 'supervisor'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Supervisor / Inspector</span>
          </button>
        </div>
      </div>

      {/* Signer Name input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Nombre completo del firmante *
        </label>
        <input
          type="text"
          required
          placeholder={signerRole === 'operador' ? 'Ej. Juan Pérez (Chofer)' : 'Ej. Ing. Carlos Mendoza (Inspector de Patio)'}
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400"
        />
      </div>

      {/* Canvas Area */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">
            Firma con el dedo o puntero en pantalla *
          </label>
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpiar trazo</span>
          </button>
        </div>

        <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 overflow-hidden touch-none h-44 flex flex-col justify-end">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair"
          />

          {!hasSignature && !isDrawing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400">
              <PenTool className="w-6 h-6 opacity-40 mb-1" />
              <span className="text-[11px] font-medium opacity-70">
                Dibuja tu firma digital aquí
              </span>
            </div>
          )}

          <div className="border-t border-slate-200/80 px-3 py-1 bg-white/70 backdrop-blur-2xs flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>X ____________________________</span>
            <span>Fecha: {new Date().toLocaleDateString('es-MX')}</span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
          {errorMsg}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
          >
            Atrás
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Confirmar y Guardar Inspección</span>
        </button>
      </div>
    </div>
  );
};
