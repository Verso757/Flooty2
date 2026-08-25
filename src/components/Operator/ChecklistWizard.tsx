import React, { useState } from 'react';
import { Vehicle, Route, ChecklistTemplate, ChecklistQuestion, Answer, Severity } from '../../types';
import { SignaturePad } from '../Common/SignaturePad';
import {
  CheckCircle2,
  XCircle,
  Camera,
  ArrowLeft,
  ArrowRight,
  AlertOctagon,
  FileText,
  Hash,
  Send,
  Trash2,
  Tag,
  Truck,
  MapPin,
  PenTool
} from 'lucide-react';

interface Props {
  vehicle: Vehicle;
  route?: Route;
  template: ChecklistTemplate;
  onComplete: (
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
  ) => void;
  onCancel: () => void;
}

export const ChecklistWizard: React.FC<Props> = ({
  vehicle,
  route,
  template,
  onComplete,
  onCancel
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  // Active question temporary state
  const [passState, setPassState] = useState<boolean | null>(null);
  const [textValue, setTextValue] = useState('');
  const [numberValue, setNumberValue] = useState<number | undefined>(undefined);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [failNotes, setFailNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Signature step state
  const [isSigning, setIsSigning] = useState(false);
  const [pendingAnswers, setPendingAnswers] = useState<Record<string, Answer> | null>(null);

  const questions = template.questions;
  const currentQuestion: ChecklistQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  // Suggested quick fail chips
  const quickFailNotes: Record<string, string[]> = {
    'Frenos': ['Pedal suave o esponjoso', 'Fuga de aire en línea neumática', 'Ruido de rechinar al frenar', 'Freno de mano flojo'],
    'Luces': ['Faro delantero fundido', 'Luz de freno trasera apagada', 'Direccional rota', 'Mica quebrada'],
    'Neumáticos': ['Presión muy baja de aire', 'Llantas lisas / desgastadas', 'Clavo o ponchadura visible', 'Birlo faltante'],
    'Motor y Niveles': ['Nivel bajo de aceite de motor', 'Fuga de anticongelante', 'Humo inusual en escape', 'Batería sulfatada'],
    'Carrocería': ['Golpe o abolladura reciente', 'Espejo retrovisor roto', 'Limpiaparabrisas desgastado', 'Cristal estrellado'],
    'Seguridad': ['Extintor caducado o sin presión', 'Faltan triángulos de emergencia', 'Botiquín incompleto', 'Cinturón de seguridad trabado']
  };

  // Load state if previously answered
  React.useEffect(() => {
    const existing = answers[currentQuestion.id];
    if (existing) {
      setPassState(existing.pass);
      setTextValue(existing.valueText || '');
      setNumberValue(existing.valueNumber);
      setPhotoUrl(existing.photoUrl || null);
      setFailNotes(existing.notes || '');
    } else {
      setPassState(null);
      setTextValue('');
      setNumberValue(undefined);
      setPhotoUrl(null);
      setFailNotes('');
    }
    setErrorMessage('');
  }, [currentIndex, currentQuestion.id]);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePassSelect = (pass: boolean) => {
    setPassState(pass);
    setErrorMessage('');
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const validateCurrentQuestion = (): boolean => {
    if (passState === null) {
      setErrorMessage('Por favor selecciona si la revisión está En Orden (SÍ) o presenta Falla (NO).');
      return false;
    }

    if (!passState) {
      if (currentQuestion.requirePhotoIfFail && !photoUrl) {
        setErrorMessage('📷 Esta revisión requiere adjuntar una FOTO obligatoria al reportar falla.');
        return false;
      }
      if (!failNotes.trim()) {
        setErrorMessage('✍️ Por favor describe el detalle de la falla detectada.');
        return false;
      }
    }

    if (currentQuestion.type === 'texto' && !textValue.trim()) {
      setErrorMessage('Por favor ingresa la respuesta de texto requerida.');
      return false;
    }

    if (currentQuestion.type === 'numero' && (numberValue === undefined || isNaN(numberValue))) {
      setErrorMessage('Por favor ingresa un número de medición válido.');
      return false;
    }

    if (currentQuestion.type === 'foto' && !photoUrl) {
      setErrorMessage('Por favor adjunta la fotografía requerida.');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) return;

    const currentAnswer: Answer = {
      questionId: currentQuestion.id,
      pass: passState!,
      valueText: textValue || undefined,
      valueNumber: numberValue,
      photoUrl: photoUrl || undefined,
      notes: failNotes || undefined
    };

    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: currentAnswer
    };
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Step into digital signature
      setPendingAnswers(updatedAnswers);
      setIsSigning(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      onCancel();
    }
  };

  const finishChecklistWithSignature = (signatureData: {
    signatureUrl: string;
    signedByRole: 'operador' | 'supervisor';
    signedByName: string;
  }) => {
    const finalAnswers = pendingAnswers || answers;
    const generatedTickets: {
      questionId: string;
      title: string;
      description: string;
      severity: Severity;
      category: string;
      photo?: string;
    }[] = [];

    (Object.values(finalAnswers) as Answer[]).forEach((ans) => {
      if (!ans.pass) {
        const q = questions.find((item) => item.id === ans.questionId);
        if (q) {
          generatedTickets.push({
            questionId: q.id,
            title: `Falla en ${q.category}: ${q.question.slice(0, 45)}...`,
            description: ans.notes || `Revisión de ${q.category} no superada.`,
            severity: q.failSeverity,
            category: q.category,
            photo: ans.photoUrl
          });
        }
      }
    });

    onComplete(Object.values(finalAnswers) as Answer[], generatedTickets, signatureData);
  };

  if (isSigning) {
    return (
      <div className="max-w-xl mx-auto space-y-4 animate-fade-in pb-16">
        <SignaturePad
          initialSignerName={route ? `Chofer Ruta ${route.code}` : 'Chofer de Patio'}
          initialRole="operador"
          onSave={finishChecklistWithSignature}
          onCancel={() => setIsSigning(false)}
        />
      </div>
    );
  }

  const currentCategoryChips = quickFailNotes[currentQuestion.category] || [
    'Falla por desgaste', 'Fuga o goteo', 'Luz encendida en tablero', 'Mal funcionamiento'
  ];

  return (
    <div className="max-w-xl mx-auto space-y-4 animate-fade-in pb-16">
      {/* Route & Unit Info Sticky Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {route && (
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 font-mono">
              <span className="text-[8px] uppercase text-slate-400">Ruta</span>
              <span className="text-sm font-black leading-none">{route.code}</span>
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
              <Truck className="w-3.5 h-3.5 text-slate-600" />
              <span>{vehicle.codeName} (#{vehicle.economicNumber})</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Placa: {vehicle.plate} • {vehicle.model}
            </p>
          </div>
        </div>

        <button
          onClick={handlePrev}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer"
        >
          {currentIndex === 0 ? 'Salir' : 'Anterior'}
        </button>
      </div>

      {/* Progress Counter & Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600 px-1">
          <span>Progreso de Inspección</span>
          <span>Pregunta {currentIndex + 1} de {totalQuestions} ({progressPercent}%)</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-slate-900 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono">
            {currentQuestion.category}
          </span>

          <span className={`text-[11px] font-bold uppercase font-mono px-2 py-0.5 rounded border ${
            currentQuestion.failSeverity === 'critica'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : currentQuestion.failSeverity === 'media'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            Alerta: {currentQuestion.failSeverity}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
          {currentQuestion.question}
        </h2>

        {/* Driver Guidance / Help Text */}
        {currentQuestion.helpText && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-600">
            <span className="text-base leading-none">💡</span>
            <span className="font-medium">{currentQuestion.helpText}</span>
          </div>
        )}

        {/* Tactile Large Pass / Fail Buttons */}
        <div className="grid grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => handlePassSelect(true)}
            className={`py-4 px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-2 transition-all cursor-pointer border ${
              passState === true
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className={`w-7 h-7 ${passState === true ? 'text-white' : 'text-emerald-600'}`} />
            <span>SÍ / En Orden</span>
          </button>

          <button
            type="button"
            onClick={() => handlePassSelect(false)}
            className={`py-4 px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-2 transition-all cursor-pointer border ${
              passState === false
                ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <XCircle className={`w-7 h-7 ${passState === false ? 'text-white' : 'text-rose-600'}`} />
            <span>NO / Con Falla</span>
          </button>
        </div>

        {/* Inputs on Fail */}
        {passState === false && (
          <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-3.5 animate-fade-in">
            <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
              <AlertOctagon className="w-4 h-4" />
              <span>Se registrará un ticket de mantenimiento para este camión</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-600 font-semibold block mb-1">
                Anotación rápida de falla:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentCategoryChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setFailNotes((prev) => (prev ? `${prev}, ${chip}` : chip))}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detalle de la falla detectada *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Describe la anomalía observada..."
                value={failNotes}
                onChange={(e) => setFailNotes(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fotografía de Evidencia {currentQuestion.requirePhotoIfFail && <span className="text-rose-600">*</span>}
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white hover:bg-slate-50 border border-dashed border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer transition-colors">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>{photoUrl ? 'Cambiar Foto' : 'Tomar / Adjuntar Foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                </label>

                {photoUrl && (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-rose-400 shrink-0">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(null)}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 text-white rounded-full"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Text / Number / Options Extra fields */}
        {currentQuestion.type === 'opciones' && currentQuestion.options && passState !== null && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Selecciona una opción:
            </label>
            <div className="flex flex-wrap gap-2">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTextValue(opt)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    textValue === opt
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentQuestion.type === 'texto' && passState !== null && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observación de texto:
            </label>
            <input
              type="text"
              placeholder="Ingresa observación..."
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
            />
          </div>
        )}

        {currentQuestion.type === 'numero' && passState !== null && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Medición numérica {currentQuestion.numericUnit && `(${currentQuestion.numericUnit})`}:
              </label>
              {currentQuestion.minNumber !== undefined && currentQuestion.maxNumber !== undefined && (
                <span className="text-[11px] font-mono text-slate-500">
                  Rango normal: {currentQuestion.minNumber} - {currentQuestion.maxNumber} {currentQuestion.numericUnit}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="0.0"
                value={numberValue !== undefined ? numberValue : ''}
                onChange={(e) => setNumberValue(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-400"
              />
              {currentQuestion.numericUnit && (
                <span className="absolute right-3 top-2 text-xs font-mono font-bold text-slate-400">
                  {currentQuestion.numericUnit}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Error alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Bottom Action Button */}
      <button
        type="button"
        onClick={handleNext}
        className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
      >
        <span>{currentIndex + 1 === totalQuestions ? 'Proceder a Firma Digital' : 'Siguiente Pregunta'}</span>
        {currentIndex + 1 === totalQuestions ? (
          <PenTool className="w-4 h-4" />
        ) : (
          <ArrowRight className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};
