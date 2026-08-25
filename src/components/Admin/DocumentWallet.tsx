import React, { useState } from 'react';
import { FleetDocument, DocumentType, Vehicle } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  Truck,
  User,
  Trash2,
  Calendar,
  FileCheck,
  Upload,
  ExternalLink
} from 'lucide-react';

export const DocumentWallet: React.FC = () => {
  const { documents, vehicles, saveDocument, deleteDocument } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VENCIDO' | 'PROXIMO' | 'VIGENTE'>('ALL');

  // Modal State
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);

  // Form State
  const [docCategory, setDocCategory] = useState<'VEHICLE' | 'DRIVER'>('VEHICLE');
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [driverName, setDriverName] = useState('');
  const [type, setType] = useState<DocumentType>('poliza_seguro');
  const [title, setTitle] = useState('');
  const [folioOrPolicy, setFolioOrPolicy] = useState('');
  const [issuer, setIssuer] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');

  // Calculate status for each document
  const getDocStatus = (doc: FleetDocument) => {
    const today = new Date();
    const expDate = new Date(doc.expiresAt);
    const diffTime = expDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return { status: 'VENCIDO', label: 'Vencido', color: 'rose', daysRemaining };
    }
    if (daysRemaining <= 30) {
      return { status: 'PROXIMO', label: 'Por Vencer', color: 'amber', daysRemaining };
    }
    return { status: 'VIGENTE', label: 'Vigente', color: 'emerald', daysRemaining };
  };

  const docsWithStatus = documents.map((doc) => ({
    ...doc,
    calc: getDocStatus(doc)
  }));

  const filteredDocs = docsWithStatus.filter((d) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      d.title.toLowerCase().includes(s) ||
      d.folioOrPolicy.toLowerCase().includes(s) ||
      d.issuer.toLowerCase().includes(s) ||
      (d.economicNumber && d.economicNumber.toLowerCase().includes(s)) ||
      (d.driverName && d.driverName.toLowerCase().includes(s));

    if (!matchesSearch) return false;
    if (filterType !== 'ALL' && d.type !== filterType) return false;
    if (filterStatus !== 'ALL' && d.calc.status !== filterStatus) return false;
    return true;
  });

  const totalVencidos = docsWithStatus.filter((d) => d.calc.status === 'VENCIDO').length;
  const totalProximos = docsWithStatus.filter((d) => d.calc.status === 'PROXIMO').length;
  const totalVigentes = docsWithStatus.filter((d) => d.calc.status === 'VIGENTE').length;

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const v = docCategory === 'VEHICLE' ? vehicles.find((item) => item.id === vehicleId) : undefined;

    const newDoc: FleetDocument = {
      id: `doc-${Date.now()}`,
      vehicleId: v?.id,
      economicNumber: v?.economicNumber,
      driverName: docCategory === 'DRIVER' ? driverName : undefined,
      type,
      title: title || (type === 'poliza_seguro' ? 'Póliza de Seguro' : type === 'tarjeta_circulacion' ? 'Tarjeta de Circulación' : 'Documento Oficial'),
      folioOrPolicy,
      issuer,
      expiresAt,
      notes
    };

    saveDocument(newDoc);
    setIsNewDocModalOpen(false);
    // Reset form
    setTitle('');
    setFolioOrPolicy('');
    setIssuer('');
    setExpiresAt('');
    setNotes('');
  };

  const documentTypeLabels: Record<DocumentType, { label: string; icon: any }> = {
    poliza_seguro: { label: 'Póliza de Seguro', icon: Shield },
    tarjeta_circulacion: { label: 'Tarjeta de Circulación', icon: CreditCard },
    verificacion_ambiental: { label: 'Verificación Ambiental', icon: FileCheck },
    inspeccion_mecanica: { label: 'Físico-Mecánica SCT', icon: FileText },
    permiso_sct: { label: 'Permiso Federal SCT', icon: FileText },
    licencia_chofer: { label: 'Licencia de Conducir', icon: User }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
            Billetera Digital y Cumplimiento Legal
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Documentos y Alertas de Vencimiento
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitorea vigencia de seguros, verificaciones físico-mecánicas, tarjetas de circulación y licencias.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewDocModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar / Renovar Documento</span>
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
            <span className="text-xs font-bold text-rose-700 uppercase font-mono">Documentos Vencidos</span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600 font-mono mt-1">{totalVencidos}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Riesgo de multa o retención en carretera</p>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === 'PROXIMO' ? 'ALL' : 'PROXIMO')}
          className={`bg-white border rounded-2xl p-4 transition-all cursor-pointer shadow-xs ${
            filterStatus === 'PROXIMO' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase font-mono">Próximos a Vencer (&lt;30d)</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600 font-mono mt-1">{totalProximos}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Requieren iniciar trámite de renovación</p>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === 'VIGENTE' ? 'ALL' : 'VIGENTE')}
          className={`bg-white border rounded-2xl p-4 transition-all cursor-pointer shadow-xs ${
            filterStatus === 'VIGENTE' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase font-mono">Documentos Vigentes</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 font-mono mt-1">{totalVigentes}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Flotilla y operadores al día</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por póliza, camión, emisor o chofer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
          />
        </div>

        {/* Type pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer shrink-0 ${
              filterType === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('poliza_seguro')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer shrink-0 ${
              filterType === 'poliza_seguro' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Seguros
          </button>
          <button
            onClick={() => setFilterType('tarjeta_circulacion')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer shrink-0 ${
              filterType === 'tarjeta_circulacion' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Circulación
          </button>
          <button
            onClick={() => setFilterType('verificacion_ambiental')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer shrink-0 ${
              filterType === 'verificacion_ambiental' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Verificaciones
          </button>
          <button
            onClick={() => setFilterType('licencia_chofer')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer shrink-0 ${
              filterType === 'licencia_chofer' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Licencias
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredDocs.length === 0 ? (
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
            <p className="text-xs font-bold text-slate-800">No se encontraron documentos registrados</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Prueba registrando una póliza, tarjeta o verificación.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isVencido = doc.calc.status === 'VENCIDO';
            const isProximo = doc.calc.status === 'PROXIMO';
            const IconComponent = documentTypeLabels[doc.type]?.icon || FileText;

            return (
              <div
                key={doc.id}
                className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all ${
                  isVencido
                    ? 'border-rose-300 bg-rose-50/20'
                    : isProximo
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        {doc.economicNumber ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 font-mono">
                            <Truck className="w-3 h-3 text-slate-500" />
                            Camión #{doc.economicNumber}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 font-mono">
                            <User className="w-3 h-3 text-slate-500" />
                            Operador
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {doc.title}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase font-mono px-2.5 py-1 rounded-lg border shrink-0 ${
                        isVencido
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : isProximo
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {doc.calc.label}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Folio / Póliza:</span>
                      <strong className="text-slate-900 font-mono">{doc.folioOrPolicy}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Emisor / Entidad:</span>
                      <span className="text-slate-800 font-medium text-[11px]">{doc.issuer}</span>
                    </div>
                    {doc.driverName && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Titular:</span>
                        <span className="text-slate-800 font-medium text-[11px]">{doc.driverName}</span>
                      </div>
                    )}
                  </div>

                  {doc.notes && (
                    <p className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg border border-slate-200">
                      📝 {doc.notes}
                    </p>
                  )}
                </div>

                {/* Expiration Countdown Footer */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Vence:</span>
                    <strong className="text-slate-900">{doc.expiresAt}</strong>
                    <span className={`text-[10px] font-bold ${
                      isVencido ? 'text-rose-600' : isProximo ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      ({doc.calc.daysRemaining > 0 ? `${doc.calc.daysRemaining} días` : `${Math.abs(doc.calc.daysRemaining)} días vencido`})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Eliminar documento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Registrar / Renovar Documento */}
      {isNewDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Registrar / Renovar Documento
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Control de pólizas, verificaciones y licencias
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-3.5">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Documento asignado a:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDocCategory('VEHICLE')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      docCategory === 'VEHICLE'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Camión / Unidad
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocCategory('DRIVER')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      docCategory === 'DRIVER'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Operador / Chofer
                  </button>
                </div>
              </div>

              {docCategory === 'VEHICLE' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selecciona el Camión *
                  </label>
                  <select
                    required
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 cursor-pointer"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        Camión #{v.economicNumber} - {v.plate} ({v.model})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Operador / Chofer *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez González"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              )}

              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Documento *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as DocumentType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  <option value="poliza_seguro">Póliza de Seguro</option>
                  <option value="tarjeta_circulacion">Tarjeta de Circulación</option>
                  <option value="verificacion_ambiental">Verificación Ambiental</option>
                  <option value="inspeccion_mecanica">Inspección Físico-Mecánica (SCT)</option>
                  <option value="permiso_sct">Permiso Federal de Transporte</option>
                  <option value="licencia_chofer">Licencia Federal de Conducir</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título / Descripción del Documento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Póliza Cobertura Amplia GNP / Verificación 1er Semestre"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    N° de Folio / Póliza *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. POL-992182"
                    value={folioOrPolicy}
                    onChange={(e) => setFolioOrPolicy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Entidad Emisora / Aseguradora *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Quálitas / SICT / SEDEMA"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Vencimiento / Expiración *
                </label>
                <input
                  type="date"
                  required
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  rows={2}
                  placeholder="Número de endoso, cobertura, número de serie..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewDocModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Guardar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
