import React, { useState } from 'react';
import { ChecklistTemplate, ChecklistQuestion, QuestionType, Severity } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  ClipboardList,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Layers,
  ArrowUp,
  ArrowDown,
  Copy,
  Star,
  Eye,
  FileText,
  Truck,
  Sparkles,
  Download,
  Upload,
  Search,
  Check,
  X,
  HelpCircle,
  Smartphone,
  Sliders,
  RotateCcw
} from 'lucide-react';

export const TemplateEditor: React.FC = () => {
  const {
    templates,
    template: activeContextTemplate,
    activeTemplateId,
    setActiveTemplateId,
    saveTemplate,
    deleteTemplate,
    duplicateTemplate,
    setDefaultTemplate
  } = useApp();

  // Mode: 'list' (template gallery) | 'edit' (form builder) | 'preview' (live interactive simulator)
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'preview'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Form Builder state for the template currently being edited
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate>(() => {
    return activeContextTemplate || templates[0];
  });

  // Question being added or edited
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qText, setQText] = useState('');
  const [qHelpText, setQHelpText] = useState('');
  const [qCategory, setQCategory] = useState('Frenos');
  const [customCategory, setCustomCategory] = useState('');
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [qType, setQType] = useState<QuestionType>('sino');
  const [qRequirePhoto, setQRequirePhoto] = useState(false);
  const [qFailSeverity, setQFailSeverity] = useState<Severity>('media');
  const [qNumericUnit, setQNumericUnit] = useState('');
  const [qMinNumber, setQMinNumber] = useState<string>('');
  const [qMaxNumber, setQMaxNumber] = useState<string>('');
  const [qOptions, setQOptions] = useState<string>('Lleno, 3/4, 1/2, Bajo, Vacío');

  // Simulator test answers
  const [simAnswers, setSimAnswers] = useState<Record<string, { pass: boolean; value?: any; note?: string }>>({});

  const defaultCategories = [
    'Frenos',
    'Luces',
    'Neumáticos',
    'Carrocería',
    'Niveles',
    'Seguridad',
    'Motor',
    'Documentación',
    'Cabina'
  ];

  const triggerNotify = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3000);
  };

  const handleStartCreateNewTemplate = () => {
    const newTpl: ChecklistTemplate = {
      id: `tpl-${Date.now()}`,
      name: 'Nuevo Formulario de Inspección',
      description: 'Formulario personalizado de control vehicular pre-operacional.',
      targetVehicleType: 'Todos',
      frequency: 'Diario Pre-Operacional',
      isDefault: false,
      isActive: true,
      questions: [
        {
          id: `q-${Date.now()}-1`,
          category: 'Frenos',
          question: '¿Los frenos operan en óptimas condiciones sin fugas de presión?',
          type: 'sino',
          requirePhotoIfFail: true,
          failSeverity: 'critica'
        }
      ],
      updatedAt: new Date().toISOString()
    };
    setEditingTemplate(newTpl);
    setViewMode('edit');
  };

  const handleEditTemplate = (tpl: ChecklistTemplate) => {
    setEditingTemplate({ ...tpl, questions: [...tpl.questions] });
    setViewMode('edit');
  };

  const handlePreviewTemplate = (tpl: ChecklistTemplate) => {
    setEditingTemplate(tpl);
    setSimAnswers({});
    setViewMode('preview');
  };

  const handleSaveWholeTemplate = () => {
    if (!editingTemplate.name.trim()) {
      alert('Por favor introduce un nombre para el formulario.');
      return;
    }
    if (editingTemplate.questions.length === 0) {
      alert('El formulario debe contener al menos 1 pregunta.');
      return;
    }
    saveTemplate(editingTemplate);
    triggerNotify(`¡Formulario "${editingTemplate.name}" guardado exitosamente!`);
    setViewMode('list');
  };

  const handleDuplicate = (tpl: ChecklistTemplate) => {
    const dup = duplicateTemplate(tpl.id);
    triggerNotify(`Formulario duplicado como "${dup.name}"`);
  };

  const handleDelete = (tpl: ChecklistTemplate) => {
    if (templates.length <= 1) {
      alert('No puedes eliminar el único formulario del sistema.');
      return;
    }
    if (confirm(`¿Estás seguro de eliminar el formulario "${tpl.name}"?`)) {
      deleteTemplate(tpl.id);
      triggerNotify(`Formulario eliminado correctamente.`);
    }
  };

  const handleSetDefault = (tplId: string) => {
    setDefaultTemplate(tplId);
    triggerNotify('Formulario establecido como predeterminado para la flota.');
  };

  // Question editing handlers
  const handleSaveQuestion = () => {
    if (!qText.trim()) return;

    const finalCategory = isAddingCustomCategory && customCategory.trim()
      ? customCategory.trim()
      : qCategory;

    const parsedOptions = qType === 'opciones'
      ? qOptions.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    if (editingQuestionId) {
      setEditingTemplate((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === editingQuestionId
            ? {
                ...q,
                question: qText.trim(),
                helpText: qHelpText.trim() || undefined,
                category: finalCategory,
                type: qType,
                options: parsedOptions,
                numericUnit: qType === 'numero' ? qNumericUnit || undefined : undefined,
                minNumber: qType === 'numero' && qMinNumber ? parseFloat(qMinNumber) : undefined,
                maxNumber: qType === 'numero' && qMaxNumber ? parseFloat(qMaxNumber) : undefined,
                requirePhotoIfFail: qRequirePhoto,
                failSeverity: qFailSeverity
              }
            : q
        )
      }));
      setEditingQuestionId(null);
    } else {
      const newQ: ChecklistQuestion = {
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        question: qText.trim(),
        helpText: qHelpText.trim() || undefined,
        category: finalCategory,
        type: qType,
        options: parsedOptions,
        numericUnit: qType === 'numero' ? qNumericUnit || undefined : undefined,
        minNumber: qType === 'numero' && qMinNumber ? parseFloat(qMinNumber) : undefined,
        maxNumber: qType === 'numero' && qMaxNumber ? parseFloat(qMaxNumber) : undefined,
        requirePhotoIfFail: qRequirePhoto,
        failSeverity: qFailSeverity
      };
      setEditingTemplate((prev) => ({
        ...prev,
        questions: [...prev.questions, newQ]
      }));
    }

    // Reset question builder fields
    setQText('');
    setQHelpText('');
    setQRequirePhoto(false);
    setQNumericUnit('');
    setQMinNumber('');
    setQMaxNumber('');
    setIsAddingCustomCategory(false);
    setCustomCategory('');
  };

  const handleEditQuestionClick = (q: ChecklistQuestion) => {
    setEditingQuestionId(q.id);
    setQText(q.question);
    setQHelpText(q.helpText || '');
    setQCategory(defaultCategories.includes(q.category) ? q.category : 'Frenos');
    if (!defaultCategories.includes(q.category)) {
      setIsAddingCustomCategory(true);
      setCustomCategory(q.category);
    } else {
      setIsAddingCustomCategory(false);
      setCustomCategory('');
    }
    setQType(q.type);
    setQRequirePhoto(q.requirePhotoIfFail);
    setQFailSeverity(q.failSeverity);
    setQNumericUnit(q.numericUnit || '');
    setQMinNumber(q.minNumber !== undefined ? q.minNumber.toString() : '');
    setQMaxNumber(q.maxNumber !== undefined ? q.maxNumber.toString() : '');
    setQOptions(q.options ? q.options.join(', ') : 'Lleno, 3/4, 1/2, Bajo, Vacío');
  };

  const handleDeleteQuestion = (id: string) => {
    setEditingTemplate((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id)
    }));
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...editingTemplate.questions];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx >= 0 && targetIdx < newQuestions.length) {
      const temp = newQuestions[index];
      newQuestions[index] = newQuestions[targetIdx];
      newQuestions[targetIdx] = temp;
      setEditingTemplate((prev) => ({ ...prev, questions: newQuestions }));
    }
  };

  // Export / Import JSON
  const handleExportJSON = (tpl: ChecklistTemplate) => {
    const jsonStr = JSON.stringify(tpl, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `formulario-${tpl.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    triggerNotify('Archivo JSON del formulario descargado');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.name && Array.isArray(parsed.questions)) {
          const imported: ChecklistTemplate = {
            ...parsed,
            id: `tpl-${Date.now()}`,
            name: `${parsed.name} (Importado)`,
            isDefault: false,
            updatedAt: new Date().toISOString()
          };
          saveTemplate(imported);
          triggerNotify(`Formulario "${imported.name}" importado exitosamente`);
        } else {
          alert('El archivo JSON no tiene una estructura válida de formulario FlotaCheck.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.targetVehicleType && t.targetVehicleType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 p-3.5 bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center gap-2.5 shadow-lg border border-emerald-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{showNotification}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Centro de Formularios y Plantillas
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 font-mono">
              {templates.length} Plantillas
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-slate-800" />
            <span>Creación y Gestión de Formularios</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Crea, personaliza, duplica y configura checklists pre-operacionales para diferentes tipos de camiones, camionetas o protocolos de patio.
          </p>
        </div>

        {/* View Switcher / Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {viewMode !== 'list' && (
            <button
              onClick={() => setViewMode('list')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ver Catálogo</span>
            </button>
          )}

          {viewMode === 'list' && (
            <>
              <label className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 shadow-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Importar JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleStartCreateNewTemplate}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Crear Nuevo Formulario</span>
              </button>
            </>
          )}

          {viewMode === 'edit' && (
            <>
              <button
                onClick={() => handlePreviewTemplate(editingTemplate)}
                className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Simular en Celular</span>
              </button>
              <button
                onClick={handleSaveWholeTemplate}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Guardar Formulario</span>
              </button>
            </>
          )}

          {viewMode === 'preview' && (
            <button
              onClick={() => setViewMode('edit')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              <span>Regresar al Editor</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. GALLERY / LIST VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar formularios por nombre, tipo de camión o frecuencia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none shadow-xs"
            />
          </div>

          {/* Grid of Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tpl) => {
              const isDefault = tpl.isDefault;
              const criticalPoints = tpl.questions.filter((q) => q.failSeverity === 'critica').length;

              return (
                <div
                  key={tpl.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                    isDefault ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {isDefault && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-600 text-white flex items-center gap-1 font-mono">
                              <Star className="w-3 h-3 fill-current" /> Predeterminado
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                            {tpl.targetVehicleType || 'Flotilla General'}
                          </span>
                          {tpl.frequency && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                              {tpl.frequency}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {tpl.name}
                        </h3>
                      </div>

                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 font-mono text-xs font-bold">
                        {tpl.questions.length} <span className="text-[9px] text-slate-400 block ml-0.5">pts</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {tpl.description || 'Sin descripción detallada.'}
                    </p>

                    {/* Question Summary Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {Array.from(new Set(tpl.questions.map((q) => q.category))).slice(0, 4).map((cat) => (
                        <span key={cat} className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
                          {cat}
                        </span>
                      ))}
                      {criticalPoints > 0 && (
                        <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-mono font-bold">
                          {criticalPoints} Puntos Críticos
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 gap-2">
                    <div className="flex items-center gap-1">
                      {!isDefault && (
                        <button
                          onClick={() => handleSetDefault(tpl.id)}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 text-xs font-semibold"
                          title="Hacer formulario por defecto"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleExportJSON(tpl)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold"
                        title="Exportar JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(tpl)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold"
                        title="Duplicar formulario"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tpl)}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold"
                        title="Eliminar formulario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreviewTemplate(tpl)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Simular</span>
                      </button>
                      <button
                        onClick={() => handleEditTemplate(tpl)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FORM BUILDER / EDIT VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'edit' && (
        <div className="space-y-5">
          {/* Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-700" />
              <span>Configuración General del Formulario</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Formulario / Checklist
                </label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  placeholder="Ej. Inspección Diaria Camiones Pesados"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo de Unidad Destino
                </label>
                <select
                  value={editingTemplate.targetVehicleType || 'Todos'}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, targetVehicleType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-400"
                >
                  <option value="Todos">Todos los vehículos</option>
                  <option value="Camión Pesado">Camión Pesado / Tracto</option>
                  <option value="Camión Mediano">Camión Mediano / Rabón</option>
                  <option value="Camioneta">Camioneta / Van Ligera</option>
                  <option value="Montacargas">Montacargas / Patio</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instrucciones u Objetivo del Checklist
                </label>
                <input
                  type="text"
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  placeholder="Instrucciones breves para el operador antes de encender la unidad..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Frecuencia de Evaluación
                </label>
                <select
                  value={editingTemplate.frequency || 'Diario Pre-Operacional'}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, frequency: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-400"
                >
                  <option value="Diario Pre-Operacional">Diario Pre-Operacional</option>
                  <option value="Por Turno">Por Turno / Cambio de Guardia</option>
                  <option value="Semanal">Semanal / Mantenimiento</option>
                  <option value="Auditoría Mensual">Auditoría Mensual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add / Edit Question Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>{editingQuestionId ? 'Modificar Pregunta / Punto' : 'Agregar Nuevo Punto de Evaluación'}</span>
              </h2>
              {editingQuestionId && (
                <span className="text-[11px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Modo Edición
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Categoría
                </label>
                {!isAddingCustomCategory ? (
                  <div className="flex gap-1.5">
                    <select
                      value={qCategory}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsAddingCustomCategory(true);
                        } else {
                          setQCategory(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      {defaultCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="__custom__">+ Otra Categoría Personalizada...</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Ej. Sistema Hidráulico, GPS..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomCategory(false)}
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Question Input Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo de Respuesta
                </label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value as QuestionType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  <option value="sino">Sí / No (Con Generación de Falla)</option>
                  <option value="numero">Valor Numérico (Presión PSI, Litros, etc.)</option>
                  <option value="opciones">Opciones Múltiples (Píldoras)</option>
                  <option value="texto">Texto Libre / Observación</option>
                  <option value="foto">Foto Únicamente</option>
                </select>
              </div>

              {/* Fail Severity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Severidad si Falla
                </label>
                <select
                  value={qFailSeverity}
                  onChange={(e) => setQFailSeverity(e.target.value as Severity)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  <option value="critica">Crítica (Bloquea camión para ruta)</option>
                  <option value="media">Media (Ticket preventivo de taller)</option>
                  <option value="baja">Baja (Mantenimiento menor)</option>
                </select>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Texto del Punto de Evaluación / Pregunta
              </label>
              <textarea
                rows={2}
                placeholder="Ej. ¿Los frenos responden firmemente sin pedal esponjoso ni ruidos de escape de aire?"
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* Guidance / Help Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Guía / Tip de Ayuda para el Chofer (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Revisar manómetro en cabina (> 90 PSI) con motor encendido."
                value={qHelpText}
                onChange={(e) => setQHelpText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* Options configuration if 'opciones' or 'numero' */}
            {qType === 'opciones' && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Opciones separadas por coma
                </label>
                <input
                  type="text"
                  value={qOptions}
                  onChange={(e) => setQOptions(e.target.value)}
                  placeholder="Lleno, 3/4, 1/2, 1/4, Vacío"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>
            )}

            {qType === 'numero' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unidad de Medida</label>
                  <input
                    type="text"
                    value={qNumericUnit}
                    onChange={(e) => setQNumericUnit(e.target.value)}
                    placeholder="PSI, Litros, mm, %"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mínimo Aceptable</label>
                  <input
                    type="number"
                    value={qMinNumber}
                    onChange={(e) => setQMinNumber(e.target.value)}
                    placeholder="ej. 90"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Máximo Aceptable</label>
                  <input
                    type="number"
                    value={qMaxNumber}
                    onChange={(e) => setQMaxNumber(e.target.value)}
                    placeholder="ej. 120"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Mandatory photo toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={qRequirePhoto}
                  onChange={(e) => setQRequirePhoto(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
                />
                <Camera className="w-3.5 h-3.5 text-slate-600" />
                <span>Foto OBLIGATORIA si el operador reporta falla</span>
              </label>

              <div className="flex items-center gap-2">
                {editingQuestionId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingQuestionId(null);
                      setQText('');
                      setQHelpText('');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveQuestion}
                  disabled={!qText.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {editingQuestionId ? 'Actualizar Punto' : 'Agregar Punto al Formulario'}
                </button>
              </div>
            </div>
          </div>

          {/* Configured Questions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                Puntos de Evaluación del Formulario ({editingTemplate.questions.length})
              </h2>
              <span className="text-[11px] text-slate-500">
                Usa las flechas para reordenar la secuencia del checklist
              </span>
            </div>

            <div className="space-y-2.5">
              {editingTemplate.questions.map((q, index) => (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs transition-all"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* Move controls */}
                    <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                      <button
                        onClick={() => handleMoveQuestion(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded bg-slate-100 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer border border-slate-200"
                        title="Subir posición"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveQuestion(index, 'down')}
                        disabled={index === editingTemplate.questions.length - 1}
                        className="p-1 rounded bg-slate-100 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer border border-slate-200"
                        title="Bajar posición"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Question Content */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          #{index + 1}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                          {q.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border font-mono ${
                            q.failSeverity === 'critica'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : q.failSeverity === 'media'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          Severidad: {q.failSeverity}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 bg-slate-50 rounded border border-slate-200">
                          Tipo: {q.type}
                        </span>
                        {q.requirePhotoIfFail && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                            <Camera className="w-3 h-3 text-slate-500" /> Foto Obligatoria
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm font-bold text-slate-900">{q.question}</p>
                      {q.helpText && (
                        <p className="text-[11px] text-slate-500 italic">💡 {q.helpText}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEditQuestionClick(q)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer border border-slate-200"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer border border-rose-200"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LIVE INTERACTIVE SIMULATOR VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'preview' && (
        <div className="max-w-xl mx-auto space-y-4 animate-fade-in">
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                  Simulador de Inspección en Celular
                </span>
                <span className="text-xs font-bold text-white block">{editingTemplate.name}</span>
              </div>
            </div>
            <button
              onClick={() => setSimAnswers({})}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700"
            >
              Reiniciar
            </button>
          </div>

          <div className="bg-white border-2 border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Puntos de Inspección ({editingTemplate.questions.length})
              </span>
              <p className="text-xs text-slate-500 mt-0.5">{editingTemplate.description}</p>
            </div>

            <div className="space-y-4">
              {editingTemplate.questions.map((q, idx) => {
                const currentAnswer = simAnswers[q.id];

                return (
                  <div
                    key={q.id}
                    className={`border rounded-2xl p-4 transition-all ${
                      currentAnswer?.pass === true
                        ? 'border-emerald-300 bg-emerald-50/40'
                        : currentAnswer?.pass === false
                        ? 'border-rose-300 bg-rose-50/40'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono">
                        {q.category} #{idx + 1}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                          q.failSeverity === 'critica'
                            ? 'bg-rose-100 text-rose-800'
                            : q.failSeverity === 'media'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {q.failSeverity}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 mb-1">{q.question}</p>
                    {q.helpText && <p className="text-[11px] text-slate-500 mb-3">💡 {q.helpText}</p>}

                    {/* Simulator Button Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSimAnswers((prev) => ({ ...prev, [q.id]: { pass: true } }))
                        }
                        className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          currentAnswer?.pass === true
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>En Buen Estado</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSimAnswers((prev) => ({ ...prev, [q.id]: { pass: false } }))
                        }
                        className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          currentAnswer?.pass === false
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-rose-50'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reportar Falla</span>
                      </button>
                    </div>

                    {currentAnswer?.pass === false && (
                      <div className="mt-3 p-3 rounded-xl bg-white border border-rose-200 text-xs space-y-2 animate-fade-in">
                        <span className="font-bold text-rose-700 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Generará Ticket de Mantenimiento ({q.failSeverity})
                        </span>
                        {q.requirePhotoIfFail && (
                          <div className="p-2 rounded-lg bg-slate-100 text-slate-600 flex items-center gap-1.5 text-[11px]">
                            <Camera className="w-3 h-3 text-slate-800" />
                            <span>Foto requerida por el supervisor</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  triggerNotify('Simulación finalizada. El formulario funciona correctamente.');
                  setViewMode('edit');
                }}
                className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs"
              >
                Aprobar y Regresar al Editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
