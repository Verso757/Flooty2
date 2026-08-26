import React, { useState } from 'react';
import { Ticket, TicketStatus, Severity, TicketSparePart } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../Common/Modal';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  Filter,
  Search,
  DollarSign,
  Calendar,
  ChevronRight,
  UserCheck,
  ShieldAlert,
  FileText,
  Check,
  X,
  Camera,
  Paperclip,
  Printer,
  Columns,
  Table as TableIcon,
  Eye,
  Trash2,
  Edit2,
  ArrowRight,
  ExternalLink,
  Image as ImageIcon,
  Save,
  Tag,
  Receipt
} from 'lucide-react';

export const TicketsList: React.FC = () => {
  const {
    tickets,
    updateTicketStatus,
    updateTicketCostsAndParts,
    assignTicket,
    saveTicket,
    deleteTicket,
    getNextTicketFolio,
    users,
    vehicles,
    routes
  } = useApp();

  // Search, Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'KANBAN'>('TABLE');

  // Selected Ticket & Modal Active Tab
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalTab, setModalTab] = useState<'DETAILS' | 'MECHANIC' | 'PARTS' | 'PRINT'>('DETAILS');

  // Quick Photo Zoom Modal
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  // Resolution Notes & Mechanic Assignment inside Modal
  const [resolutionNoteInput, setResolutionNoteInput] = useState('');
  const [selectedMechanicInput, setSelectedMechanicInput] = useState('');

  // Workshop Parts & Cost Edit States (Full Modal)
  const [tempParts, setTempParts] = useState<TicketSparePart[]>([]);
  const [tempLaborCost, setTempLaborCost] = useState<number>(0);
  const [tempInvoiceFolio, setTempInvoiceFolio] = useState<string>('');
  const [tempInvoiceUrl, setTempInvoiceUrl] = useState<string>('');
  const [newPartDesc, setNewPartDesc] = useState('');
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartUnitCost, setNewPartUnitCost] = useState(0);
  const [costSavedAlert, setCostSavedAlert] = useState('');

  // Quick 1-Click Cost Edit Modal
  const [isQuickCostModalOpen, setIsQuickCostModalOpen] = useState(false);
  const [quickCostTicket, setQuickCostTicket] = useState<Ticket | null>(null);
  const [quickTotalCost, setQuickTotalCost] = useState<number>(0);
  const [quickLaborCost, setQuickLaborCost] = useState<number>(0);
  const [quickInvoiceFolio, setQuickInvoiceFolio] = useState<string>('');
  const [quickSaveAlert, setQuickSaveAlert] = useState('');

  // New Manual Ticket Modal State
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newUnitId, setNewUnitId] = useState(vehicles[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Frenos');
  const [newSeverity, setNewSeverity] = useState<Severity>('media');
  const [newAssignedMechanic, setNewAssignedMechanic] = useState('');
  const [newEstimatedLabor, setNewEstimatedLabor] = useState(0);

  const mechanics = users.filter((u) => u.role === 'mecanico' || u.role === 'administrador');

  // Filtered Tickets
  const filteredTickets = tickets.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.id.toLowerCase().includes(q) ||
      t.unitName.toLowerCase().includes(q) ||
      (t.economicNumber && t.economicNumber.toLowerCase().includes(q)) ||
      (t.routeCode && t.routeCode.toLowerCase().includes(q)) ||
      (t.invoiceFolio && t.invoiceFolio.toLowerCase().includes(q)) ||
      (t.assignedTo && t.assignedTo.toLowerCase().includes(q)) ||
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);

    const matchesSeverity = severityFilter === 'ALL' || t.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesVehicle = vehicleFilter === 'ALL' || t.unitId === vehicleFilter;

    return matchesSearch && matchesSeverity && matchesStatus && matchesVehicle;
  });

  // Summary Metrics
  const totalFlotaCost = tickets.reduce((acc, t) => acc + (t.totalCost || 0), 0);
  const pendingCount = tickets.filter((t) => t.status === 'pendiente').length;
  const inProgressCount = tickets.filter((t) => t.status === 'en_progreso').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resuelto').length;
  const criticalCount = tickets.filter((t) => t.severity === 'critica' && t.status !== 'resuelto').length;

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'critica':
        return {
          label: 'CRÍTICA',
          color: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20'
        };
      case 'media':
        return {
          label: 'MEDIA',
          color: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20'
        };
      case 'baja':
        return {
          label: 'BAJA',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20'
        };
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'pendiente':
        return { label: 'Pendiente', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'en_progreso':
        return { label: 'En Taller', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'resuelto':
        return { label: 'Resuelto', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'cancelado':
        return { label: 'Cancelado', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  // ----------------------------------------------------
  // FULL DETAILS MODAL HANDLERS
  // ----------------------------------------------------
  const handleOpenTicketDetails = (ticket: Ticket, defaultTab: 'DETAILS' | 'MECHANIC' | 'PARTS' | 'PRINT' = 'DETAILS') => {
    setSelectedTicket(ticket);
    setModalTab(defaultTab);
    setResolutionNoteInput(ticket.resolutionNotes || '');
    setSelectedMechanicInput(ticket.assignedTo || '');
    setTempParts(ticket.spareParts || []);
    setTempLaborCost(ticket.laborCost || 0);
    setTempInvoiceFolio(ticket.invoiceFolio || '');
    setTempInvoiceUrl(ticket.invoiceUrl || '');
    setCostSavedAlert('');
  };

  const handleAddPart = () => {
    if (!newPartDesc.trim() || newPartQty <= 0) return;
    const newPart: TicketSparePart = {
      id: `part-${Date.now()}`,
      description: newPartDesc.trim(),
      partNumber: newPartNumber.trim() || undefined,
      quantity: Number(newPartQty),
      unitCost: Number(newPartUnitCost)
    };
    setTempParts((prev) => [...prev, newPart]);
    setNewPartDesc('');
    setNewPartNumber('');
    setNewPartQty(1);
    setNewPartUnitCost(0);
  };

  const handleRemovePart = (partId: string) => {
    setTempParts((prev) => prev.filter((p) => p.id !== partId));
  };

  const handleSaveCostsAndInvoice = () => {
    if (!selectedTicket) return;
    const partsSum = tempParts.reduce((acc, p) => acc + p.quantity * p.unitCost, 0);
    const updatedTotal = Number(tempLaborCost) + partsSum;

    updateTicketCostsAndParts(selectedTicket.id, {
      spareParts: tempParts,
      laborCost: Number(tempLaborCost),
      totalCost: updatedTotal,
      invoiceFolio: tempInvoiceFolio.trim(),
      invoiceUrl: tempInvoiceUrl
    });

    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            spareParts: tempParts,
            laborCost: Number(tempLaborCost),
            invoiceFolio: tempInvoiceFolio.trim(),
            invoiceUrl: tempInvoiceUrl,
            totalCost: updatedTotal
          }
        : null
    );

    setCostSavedAlert('¡Costos y refacciones actualizados correctamente!');
    setTimeout(() => {
      setCostSavedAlert('');
    }, 3000);
  };

  const handleInvoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempInvoiceUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    updateTicketStatus(ticketId, newStatus, resolutionNoteInput.trim() || undefined);
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              resolutionNotes: resolutionNoteInput.trim() || prev.resolutionNotes
            }
          : null
      );
    }
  };

  const handleAssignMechanic = (ticketId: string, mechName: string) => {
    assignTicket(ticketId, mechName);
    setSelectedMechanicInput(mechName);
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, assignedTo: mechName } : null));
    }
  };

  // ----------------------------------------------------
  // QUICK 1-CLICK COST EDIT MODAL HANDLERS
  // ----------------------------------------------------
  const handleOpenQuickCostModal = (ticket: Ticket) => {
    setQuickCostTicket(ticket);
    setQuickTotalCost(ticket.totalCost || 0);
    setQuickLaborCost(ticket.laborCost || 0);
    setQuickInvoiceFolio(ticket.invoiceFolio || '');
    setQuickSaveAlert('');
    setIsQuickCostModalOpen(true);
  };

  const handleSaveQuickCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCostTicket) return;

    const partsSum = (quickCostTicket.spareParts || []).reduce((acc, p) => acc + p.quantity * p.unitCost, 0);
    const parsedTotal = Number(quickTotalCost) || 0;
    const parsedLabor = quickLaborCost !== undefined ? Number(quickLaborCost) : Math.max(0, parsedTotal - partsSum);

    updateTicketCostsAndParts(quickCostTicket.id, {
      totalCost: parsedTotal,
      laborCost: parsedLabor,
      invoiceFolio: quickInvoiceFolio.trim() || undefined
    });

    setQuickSaveAlert(`¡Costo de $${parsedTotal.toLocaleString()} MXN guardado exitosamente!`);

    setTimeout(() => {
      setQuickSaveAlert('');
      setIsQuickCostModalOpen(false);
    }, 1000);
  };

  // ----------------------------------------------------
  // MANUAL TICKET CREATION
  // ----------------------------------------------------
  const handleCreateManualTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const unit = vehicles.find((v) => v.id === newUnitId);
    if (!unit || !newTitle.trim()) return;

    const assignedRoute = routes.find((r) => r.id === unit.currentRouteId || r.assignedVehicleId === unit.id);
    const newFolio = getNextTicketFolio();

    const newTicketObj: Ticket = {
      id: newFolio,
      unitId: unit.id,
      unitName: unit.codeName,
      economicNumber: unit.economicNumber,
      routeCode: assignedRoute?.code,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Apertura de orden directa en taller mecánico.',
      severity: newSeverity,
      status: 'pendiente',
      category: newCategory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reportedBy: 'Taller / Administración',
      assignedTo: newAssignedMechanic || undefined,
      laborCost: Number(newEstimatedLabor) || 0,
      totalCost: Number(newEstimatedLabor) || 0,
      spareParts: []
    };

    saveTicket(newTicketObj);
    setIsNewTicketModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewEstimatedLabor(0);
    setNewAssignedMechanic('');
    handleOpenTicketDetails(newTicketObj);
  };

  const kanbanColumns: { title: string; status: TicketStatus; color: string; badgeColor: string }[] = [
    {
      title: 'Diagnóstico / Pendiente',
      status: 'pendiente',
      color: 'border-amber-200 bg-amber-50/30',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      title: 'En Reparación / Taller',
      status: 'en_progreso',
      color: 'border-blue-200 bg-blue-50/30',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Resueltos / Listos para Operación',
      status: 'resuelto',
      color: 'border-emerald-200 bg-emerald-50/30',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    }
  ];

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            <span>Módulo de Taller, Refacciones y Tickets</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de costos, refacciones, mano de obra, facturas y órdenes de servicio por camión.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Manual Ticket Button */}
          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Orden de Taller</span>
          </button>

          {/* View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs shrink-0">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Vista en Tabla"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabla</span>
            </button>
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'KANBAN'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tablero Kanban de Taller"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablero</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pendientes</span>
            <span className="text-base font-black text-slate-900 font-mono">{pendingCount}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">En Taller</span>
            <span className="text-base font-black text-blue-700 font-mono">{inProgressCount}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Críticas Bloqueantes</span>
            <span className="text-base font-black text-rose-700 font-mono">{criticalCount} unidades</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Gasto Total Flota</span>
            <span className="text-sm font-black text-emerald-700 font-mono">${totalFlotaCost.toLocaleString()} MXN</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar folio, camión (#507), refacción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer font-medium"
          >
            <option value="ALL">Todas las Severidades</option>
            <option value="critica">Crítica (Bloqueo de Unidad)</option>
            <option value="media">Media (Reparación Taller)</option>
            <option value="baja">Baja (Preventiva / Menor)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer font-medium"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En Progreso</option>
            <option value="resuelto">Resuelto</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer font-medium"
          >
            <option value="ALL">Todos los Camiones</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                Camión #{v.economicNumber} - {v.codeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW 1: DATA TABLE */}
      {viewMode === 'TABLE' && (
        <div className="space-y-3">
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4 w-28">Folio</th>
                  <th className="py-3.5 px-4 w-40">Camión & Ruta</th>
                  <th className="py-3.5 px-4">Falla Reportada</th>
                  <th className="py-3.5 px-3 w-28 text-center">Severidad</th>
                  <th className="py-3.5 px-3 w-36">Mecánico</th>
                  <th className="py-3.5 px-3 w-32 text-center">Estatus</th>
                  <th className="py-3.5 px-4 w-32 text-right">Costo Total</th>
                  <th className="py-3.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No se encontraron tickets con los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => {
                    const sevInfo = getSeverityBadge(ticket.severity);
                    const statusInfo = getStatusBadge(ticket.status);
                    const partsCount = ticket.spareParts?.length || 0;

                    return (
                      <tr
                        key={ticket.id}
                        onClick={() => handleOpenTicketDetails(ticket)}
                        className="hover:bg-amber-50/50 transition-colors cursor-pointer group"
                        title="Haz clic para abrir y gestionar esta orden de taller"
                      >
                        {/* 1. FOLIO */}
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-black text-amber-800 text-xs px-2 py-1 bg-amber-50 rounded-md border border-amber-200 group-hover:bg-amber-100 group-hover:border-amber-300 transition-colors">
                            {ticket.id}
                          </span>
                        </td>

                        {/* 2. CAMIÓN & RUTA */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 font-mono flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{ticket.economicNumber ? `Camión #${ticket.economicNumber}` : ticket.unitName}</span>
                          </div>
                          {ticket.routeCode ? (
                            <span className="text-[10px] text-blue-700 font-bold font-mono">
                              Ruta {ticket.routeCode}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Sin ruta</span>
                          )}
                        </td>

                        {/* 3. FALLA & CATEGORÍA */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 group-hover:text-amber-950 transition-colors line-clamp-1">
                            {ticket.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            <span className="font-medium text-slate-500">{ticket.category}</span>
                            {ticket.description && (
                              <span className="ml-1.5 text-slate-400">• {ticket.description}</span>
                            )}
                          </div>
                        </td>

                        {/* 4. SEVERIDAD */}
                        <td className="py-3.5 px-3 text-center">
                          <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${sevInfo.color}`}>
                            {sevInfo.label}
                          </span>
                        </td>

                        {/* 5. MECÁNICO */}
                        <td className="py-3.5 px-3">
                          {ticket.assignedTo ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-full">
                              <UserCheck className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{ticket.assignedTo}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-600 font-medium italic">
                              Sin asignar
                            </span>
                          )}
                        </td>

                        {/* 6. ESTATUS */}
                        <td className="py-3.5 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border capitalize ${statusInfo.color}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{statusInfo.label}</span>
                          </span>
                        </td>

                        {/* 7. COSTO (Clickable to quick-edit or full modal) */}
                        <td className="py-3.5 px-4 text-right font-mono">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenQuickCostModal(ticket);
                            }}
                            className="text-right hover:bg-amber-100 p-1 rounded-lg transition-colors cursor-pointer"
                            title="Haz clic para modificar costo rápido"
                          >
                            <span className="font-black text-slate-900 block text-xs">
                              ${(ticket.totalCost || 0).toLocaleString()} MXN
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {partsCount > 0 ? `${partsCount} refacc.` : 'Mano de obra'}
                            </span>
                          </button>
                        </td>

                        {/* 8. CHEVRON INDICATOR */}
                        <td className="py-3.5 px-2 text-center text-slate-300 group-hover:text-amber-700 transition-colors">
                          <ChevronRight className="w-4 h-4 inline-block" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Table Footer Summary Bar */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Mostrando <strong className="text-slate-800 font-mono">{filteredTickets.length}</strong> de <strong className="text-slate-800 font-mono">{tickets.length}</strong> órdenes</span>
                {filteredTickets.length < tickets.length && (
                  <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                    Filtro activo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span>Total Filtrado: <strong className="text-emerald-700 font-mono font-bold">${filteredTickets.reduce((acc, t) => acc + (t.totalCost || 0), 0).toLocaleString()} MXN</strong></span>
              </div>
            </div>
          </div>

          {/* MOBILE RESPONSIVE CARDS VIEW (Visible on mobile & tablets < md) */}
          <div className="block md:hidden space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-white border border-slate-200 rounded-xl text-xs">
                No se encontraron tickets con los filtros seleccionados
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const sevInfo = getSeverityBadge(ticket.severity);
                const statusInfo = getStatusBadge(ticket.status);
                const partsCount = ticket.spareParts?.length || 0;

                return (
                  <div
                    key={ticket.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-700 text-xs px-2 py-0.5 bg-amber-50 rounded-md border border-amber-200">
                          {ticket.id}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${sevInfo.color}`}>
                          {sevInfo.label}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${statusInfo.color}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>

                    {/* Unit & Title */}
                    <div>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 text-xs">
                        <Truck className="w-4 h-4 text-slate-500" />
                        <span>{ticket.economicNumber ? `Camión #${ticket.economicNumber}` : ticket.unitName}</span>
                        {ticket.routeCode && (
                          <span className="text-blue-700 font-bold ml-1">• Ruta {ticket.routeCode}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-xs mt-1 leading-snug">
                        {ticket.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{ticket.category}</p>
                    </div>

                    {/* Cost Box with Big Button for Mobile */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Costo Registrado</span>
                        <span className="font-mono font-black text-sm text-slate-900 block">
                          ${(ticket.totalCost || 0).toLocaleString()} MXN
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {partsCount > 0 ? `${partsCount} refacción(es)` : 'Mano de obra'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenQuickCostModal(ticket)}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Modificar Costo</span>
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenTicketDetails(ticket)}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer text-center shadow-xs"
                      >
                        Gestionar Orden Completa
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: KANBAN BOARD */}
      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kanbanColumns.map((col) => {
            const colTickets = filteredTickets.filter((t) => t.status === col.status);

            return (
              <div
                key={col.status}
                className={`bg-white border ${col.color} rounded-2xl p-4 space-y-3 min-h-[450px] flex flex-col shadow-xs`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{col.title}</h3>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${col.badgeColor}`}>
                    {colTickets.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                  {colTickets.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs italic border border-dashed border-slate-200 rounded-xl">
                      Sin órdenes en esta etapa
                    </div>
                  ) : (
                    colTickets.map((ticket) => {
                      const sev = getSeverityBadge(ticket.severity);
                      return (
                        <div
                          key={ticket.id}
                          onClick={() => handleOpenTicketDetails(ticket)}
                          className="bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-3.5 shadow-xs space-y-2.5 cursor-pointer transition-all hover:shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-amber-700 text-xs">{ticket.id}</span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${sev.color}`}>
                              {sev.label}
                            </span>
                          </div>

                          <div>
                            <div className="text-xs font-bold text-slate-900 line-clamp-1">{ticket.title}</div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                              <Truck className="w-3 h-3 text-slate-400" />
                              <span>{ticket.economicNumber ? `Camión #${ticket.economicNumber}` : ticket.unitName}</span>
                              {ticket.routeCode && <span className="text-blue-600 font-bold">• R{ticket.routeCode}</span>}
                            </div>
                          </div>

                          {/* KANBAN CARD COST + EDIT BUTTON */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenQuickCostModal(ticket);
                              }}
                              className="font-mono font-bold text-slate-900 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 px-2 py-1 rounded-lg border border-slate-200 text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                              title="Modificar costo"
                            >
                              <DollarSign className="w-3 h-3 text-emerald-600" />
                              <span>${(ticket.totalCost || 0).toLocaleString()} MXN</span>
                              <Edit2 className="w-3 h-3 text-amber-700" />
                            </button>

                            <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                              {ticket.assignedTo ? `🔧 ${ticket.assignedTo.split(' ')[0]}` : 'Sin mecánico'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: QUICK 1-CLICK COST & INVOICE EDITOR */}
      {/* ========================================================= */}
      {isQuickCostModalOpen && quickCostTicket && (
        <Modal
          isOpen
          onClose={() => setIsQuickCostModalOpen(false)}
          title={`Modificar Costo de Orden ${quickCostTicket.id}`}
          subtitle={quickCostTicket.economicNumber ? `Camión #${quickCostTicket.economicNumber}` : quickCostTicket.unitName}
        >

            {quickSaveAlert && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{quickSaveAlert}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuickCost} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Costo Total del Servicio ($ MXN) *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={quickTotalCost}
                    onChange={(e) => setQuickTotalCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border-2 border-amber-300 focus:border-amber-500 rounded-xl pl-8 pr-3 py-2 text-base font-mono font-black text-slate-900 outline-none transition-colors"
                    placeholder="0"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Ingresa el monto total directo a registrar para este ticket.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Mano de Obra ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quickLaborCost}
                    onChange={(e) => setQuickLaborCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Folio Factura / Ticket
                  </label>
                  <input
                    type="text"
                    placeholder="FAC-9021"
                    value={quickInvoiceFolio}
                    onChange={(e) => setQuickInvoiceFolio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 uppercase outline-none"
                  />
                </div>
              </div>

              {quickCostTicket.spareParts && quickCostTicket.spareParts.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1 max-h-32 overflow-y-auto">
                  <span className="font-bold text-slate-700 block">Refacciones vinculadas ({quickCostTicket.spareParts.length}):</span>
                  {quickCostTicket.spareParts.map((p) => (
                    <div key={p.id} className="flex justify-between text-slate-600">
                      <span>{p.quantity}x {p.description}</span>
                      <span className="font-mono">${(p.quantity * p.unitCost).toLocaleString()} MXN</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickCostModalOpen(false);
                    handleOpenTicketDetails(quickCostTicket, 'PARTS');
                  }}
                  className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer text-center"
                >
                  Desglose Avanzado
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Costo</span>
                </button>
              </div>
            </form>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: FULL TICKET DETAILS & WORKSHOP ORDER */}
      {/* ========================================================= */}
      {selectedTicket && (
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedTicket(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto"
        >
          <div className="bg-white sm:border border-slate-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 shadow-xs">
                  {selectedTicket.id}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight line-clamp-1">
                    {selectedTicket.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedTicket.economicNumber ? `Camión #${selectedTicket.economicNumber}` : selectedTicket.unitName}</span>
                    {selectedTicket.routeCode && (
                      <span className="text-blue-700 font-bold">• Ruta {selectedTicket.routeCode}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer shadow-xs transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-slate-200 bg-white px-3 sm:px-6 overflow-x-auto gap-2 sm:gap-4 shrink-0 no-scrollbar">
              <button
                type="button"
                onClick={() => setModalTab('DETAILS')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
                  modalTab === 'DETAILS'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Diagnóstico & Evidencia
              </button>
              <button
                type="button"
                onClick={() => setModalTab('PARTS')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  modalTab === 'PARTS'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>2. Refacciones & Costos</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                  ${(selectedTicket.totalCost || 0).toLocaleString()}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('MECHANIC')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
                  modalTab === 'MECHANIC'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                3. Dictamen & Cierre
              </button>
              <button
                type="button"
                onClick={() => setModalTab('PRINT')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                  modalTab === 'PRINT'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Hoja de Taller</span>
              </button>
            </div>

            {/* Modal Body with Scroll */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: DIAGNÓSTICO & EVIDENCIA */}
              {modalTab === 'DETAILS' && (
                <div className="space-y-4">
                  {/* 2-Column Desktop Grid for balanced layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Details & Fault */}
                    <div className="space-y-3">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                          Detalle de la Falla Reportada:
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{selectedTicket.title}</h4>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {selectedTicket.description || 'Sin descripción adicional.'}
                        </p>
                        <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Categoría:</span>
                            <span className="font-semibold text-slate-800">{selectedTicket.category}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Severidad:</span>
                            <span className="font-bold uppercase text-slate-800">{selectedTicket.severity}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Reportado por:</span>
                            <span className="font-semibold text-slate-800">{selectedTicket.reportedBy}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Fecha de Entrada:</span>
                            <span className="font-semibold text-slate-800">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Cost Banner + Evidence Photos */}
                    <div className="space-y-3">
                      {/* Cost Shortcut Banner */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-emerald-700 block">Costo Acumulado:</span>
                            <strong className="text-sm font-mono text-emerald-900">
                              ${(selectedTicket.totalCost || 0).toLocaleString()} MXN
                            </strong>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setModalTab('PARTS')}
                          className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 shadow-xs transition-all"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Ver Refacciones</span>
                        </button>
                      </div>

                      {/* Photos Grid */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-slate-500" />
                          <span>Fotografías de Evidencia ({selectedTicket.photos?.length || 0})</span>
                        </h4>
                        {selectedTicket.photos && selectedTicket.photos.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {selectedTicket.photos.map((photo, i) => (
                              <div
                                key={i}
                                onClick={() => setActivePhotoModal(photo)}
                                className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video cursor-pointer"
                              >
                                <img src={photo} alt={`Evidencia ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Eye className="w-4 h-4" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs bg-white">
                            Sin fotos de evidencia adjuntas.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reconfirmation History */}
                  {selectedTicket.reconfirmationHistory && selectedTicket.reconfirmationHistory.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <h4 className="text-xs font-bold text-slate-900">Historial de Reconfirmaciones Diarias</h4>
                      <div className="space-y-1.5">
                        {selectedTicket.reconfirmationHistory.map((rec, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-800">{new Date(rec.date).toLocaleDateString()}</span>
                              <span className="text-slate-500 ml-2">por {rec.confirmedBy}</span>
                              {rec.note && <p className="text-[11px] text-slate-600 italic mt-0.5">{rec.note}</p>}
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${rec.stillPresent ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {rec.stillPresent ? 'Sigue Presente' : 'Corregida'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: REFACCIONES & COSTOS */}
              {modalTab === 'PARTS' && (
                <div className="space-y-4">
                  {costSavedAlert && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{costSavedAlert}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Spare Parts List & Total Summary */}
                    <div className="space-y-3">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-xs font-bold text-slate-800 uppercase font-mono">
                            Refacciones Cambiadas ({tempParts.length})
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 font-mono">
                            ${tempParts.reduce((acc, p) => acc + p.quantity * p.unitCost, 0).toLocaleString()} MXN
                          </span>
                        </div>

                        {tempParts.length === 0 ? (
                          <div className="p-4 text-center border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs bg-white">
                            No hay refacciones agregadas aún. Registra las piezas cambiadas a la derecha.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {tempParts.map((part) => (
                              <div key={part.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs">
                                <div className="min-w-0 pr-2">
                                  <span className="font-bold text-slate-800 block truncate">{part.description}</span>
                                  {part.partNumber && (
                                    <span className="text-[10px] text-slate-500 font-mono">N° {part.partNumber}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono text-xs font-bold text-slate-900">
                                    ${(part.quantity * part.unitCost).toLocaleString()}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePart(part.id)}
                                    className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                                    title="Eliminar refacción"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Mano de Obra y Total General */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Mano de Obra / Cargo Directo ($ MXN):
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold text-xs">$</span>
                            <input
                              type="number"
                              min="0"
                              value={tempLaborCost}
                              onChange={(e) => setTempLaborCost(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-lg pl-6 pr-3 py-1.5 text-xs font-mono font-bold text-slate-900 outline-none"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="font-black text-slate-700 uppercase block text-[10px]">TOTAL ACUMULADO:</span>
                            <strong className="text-base font-black text-emerald-700 font-mono">
                              ${(Number(tempLaborCost) + tempParts.reduce((acc, p) => acc + p.quantity * p.unitCost, 0)).toLocaleString()} MXN
                            </strong>
                          </div>

                          <button
                            type="button"
                            onClick={handleSaveCostsAndInvoice}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Guardar Costos</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Add Part Form + Invoice */}
                    <div className="space-y-3">
                      {/* Form to Add Spare Part */}
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                        <span className="text-[11px] font-bold text-slate-800 block flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5 text-slate-500" />
                          <span>+ Agregar Refacción al Ticket:</span>
                        </span>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Descripción (ej. Balatas, Filtro aceite)"
                            value={newPartDesc}
                            onChange={(e) => setNewPartDesc(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="N° de Parte / Código (opcional)"
                            value={newPartNumber}
                            onChange={(e) => setNewPartNumber(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono outline-none"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Cantidad:</span>
                              <input
                                type="number"
                                min="1"
                                value={newPartQty}
                                onChange={(e) => setNewPartQty(Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Costo Unitario ($):</span>
                              <input
                                type="number"
                                min="0"
                                value={newPartUnitCost}
                                onChange={(e) => setNewPartUnitCost(Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddPart}
                            className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs"
                          >
                            + Añadir Pieza a la Lista
                          </button>
                        </div>
                      </div>

                      {/* Factura / Comprobante */}
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Folio de Factura Fiscal:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. FAC-2026-901"
                          value={tempInvoiceFolio}
                          onChange={(e) => setTempInvoiceFolio(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-1.5 text-xs font-mono font-bold uppercase text-slate-900 outline-none"
                        />

                        {tempInvoiceUrl ? (
                          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 mt-1">
                            <span className="text-[11px] text-slate-700 font-mono truncate">Factura adjunta</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setActivePhotoModal(tempInvoiceUrl)}
                                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                              >
                                Ver
                              </button>
                              <button
                                type="button"
                                onClick={() => setTempInvoiceUrl('')}
                                className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                              >
                                Quitar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white border border-dashed border-slate-300 text-slate-600 text-xs font-medium cursor-pointer hover:bg-slate-100 transition-colors">
                            <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                            <span>Adjuntar Foto de Factura</span>
                            <input type="file" accept="image/*" onChange={handleInvoiceUpload} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MECÁNICO & DICTAMEN TÉCNICO */}
              {modalTab === 'MECHANIC' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Mechanic Assignment & Status */}
                    <div className="space-y-3">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <label className="block text-xs font-bold text-slate-900">
                          Asignar Mecánico Responsable:
                        </label>
                        <select
                          value={selectedMechanicInput}
                          onChange={(e) => handleAssignMechanic(selectedTicket.id, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 outline-none cursor-pointer"
                        >
                          <option value="">-- Selecciona Mecánico del Taller --</option>
                          {mechanics.map((m) => (
                            <option key={m.id} value={m.name}>
                              {m.name} ({m.role.toUpperCase()})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <label className="block text-xs font-bold text-slate-900">
                          Actualizar Estatus de la Orden:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(selectedTicket.id, 'en_progreso')}
                            className={`py-2 px-2 rounded-lg font-bold text-xs cursor-pointer border transition-colors ${
                              selectedTicket.status === 'en_progreso'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            En Taller
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(selectedTicket.id, 'resuelto')}
                            className={`py-2 px-2 rounded-lg font-bold text-xs cursor-pointer border transition-colors ${
                              selectedTicket.status === 'resuelto'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                            }`}
                          >
                            ✓ Liberado
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(selectedTicket.id, 'cancelado')}
                            className={`py-2 px-2 rounded-lg font-bold text-xs cursor-pointer border transition-colors ${
                              selectedTicket.status === 'cancelado'
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Resolution Notes */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                      <label className="block text-xs font-bold text-slate-900">
                        Dictamen Técnico de Trabajo Realizado:
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Escribe la bitácora técnica de reparación, piezas sustituidas, ajustes mecánicos y pruebas de patio realizadas..."
                        value={resolutionNoteInput}
                        onChange={(e) => setResolutionNoteInput(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-slate-400 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ORDEN DE SERVICIO IMPRIMIBLE */}
              {modalTab === 'PRINT' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir Hoja de Taller</span>
                    </button>
                  </div>

                  <div className="border border-slate-300 rounded-xl p-6 bg-white space-y-4 text-xs font-mono text-slate-800">
                    <div className="flex justify-between border-b pb-4">
                      <div>
                        <h2 className="font-bold text-sm text-slate-900">ORDEN DE SERVICIO Y TALLER</h2>
                        <p className="text-[11px] text-slate-500">FlotaCheck Logistics Fleet Management</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-amber-700">{selectedTicket.id}</span>
                        <p className="text-[10px] text-slate-400">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-b pb-4">
                      <div>
                        <span className="font-bold block text-slate-500 text-[10px]">UNIDAD / CAMIÓN:</span>
                        <p className="font-bold text-slate-900">
                          {selectedTicket.economicNumber ? `Camión #${selectedTicket.economicNumber}` : selectedTicket.unitName}
                        </p>
                        <p className="text-slate-600 text-[11px]">Ruta: {selectedTicket.routeCode || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-bold block text-slate-500 text-[10px]">MECÁNICO RESPONSABLE:</span>
                        <p className="font-bold text-slate-900">{selectedTicket.assignedTo || 'Sin asignar'}</p>
                        <p className="text-slate-600 text-[11px]">Severidad: {selectedTicket.severity.toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="border-b pb-4 space-y-1">
                      <span className="font-bold block text-slate-500 text-[10px]">DESCRIPCIÓN DE LA FALLA:</span>
                      <p className="font-sans text-xs text-slate-800">{selectedTicket.title} - {selectedTicket.description}</p>
                    </div>

                    <div className="border-b pb-4 space-y-2">
                      <span className="font-bold block text-slate-500 text-[10px]">REFACCIONES Y MATERIALES:</span>
                      {selectedTicket.spareParts && selectedTicket.spareParts.length > 0 ? (
                        <table className="w-full text-[11px]">
                          <thead>
                            <tr className="border-b text-slate-500 text-left">
                              <th>Cant.</th>
                              <th>Descripción</th>
                              <th className="text-right">Unitario</th>
                              <th className="text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedTicket.spareParts.map((p) => (
                              <tr key={p.id}>
                                <td>{p.quantity}</td>
                                <td>{p.description}</td>
                                <td className="text-right">${p.unitCost.toLocaleString()}</td>
                                <td className="text-right">${(p.quantity * p.unitCost).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="italic text-slate-400 text-[11px]">Sin refacciones adicionales registradas.</p>
                      )}
                    </div>

                    <div className="flex justify-between font-bold text-sm pt-2">
                      <span>TOTAL GENERAL:</span>
                      <span className="text-emerald-700">${(selectedTicket.totalCost || 0).toLocaleString()} MXN</span>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-8 text-center text-[10px] text-slate-500">
                      <div className="border-t pt-2">
                        Firma de Mecánico Responsable
                      </div>
                      <div className="border-t pt-2">
                        Firma de Conformidad / Supervisor
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-mono">
                Folio: <strong>{selectedTicket.id}</strong>
              </span>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ALTA DE NUEVA ORDEN DIRECTA DE TALLER */}
      {/* ========================================================= */}
      <Modal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        title="Nueva Orden Directa de Taller"
        size="lg"
      >

            <form onSubmit={handleCreateManualTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Camión / Unidad *</label>
                <select
                  required
                  value={newUnitId}
                  onChange={(e) => setNewUnitId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-900 outline-none"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      Camión #{v.economicNumber} - {v.codeName} ({v.plate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Categoría del Sistema</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-900 outline-none"
                  >
                    <option value="Frenos">Frenos Neumáticos / Balatas</option>
                    <option value="Motor">Motor & Inyección Diésel</option>
                    <option value="Transmisión">Transmisión & Embrague</option>
                    <option value="Neumáticos">Llantas & Neumáticos</option>
                    <option value="Eléctrico">Sistema Eléctrico / Luces</option>
                    <option value="Suspensión">Suspensión & Dirección</option>
                    <option value="Carrocería">Carrocería & Cabina</option>
                    <option value="Preventivo">Mantenimiento Preventivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Severidad de la Falla</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as Severity)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-900 outline-none"
                  >
                    <option value="media">Media (Reparación en Taller)</option>
                    <option value="critica">Crítica (Bloquea la Unidad)</option>
                    <option value="baja">Baja (Mantenimiento Menor)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Título de la Falla / Servicio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cambio de balatas traseras y purga de aire"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Detalle del Diagnóstico</label>
                <textarea
                  rows={2}
                  placeholder="Instrucciones para el mecánico o detalle del problema..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mecánico Asignado</label>
                  <select
                    value={newAssignedMechanic}
                    onChange={(e) => setNewAssignedMechanic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-900 outline-none"
                  >
                    <option value="">-- Sin asignar --</option>
                    {mechanics.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mano de Obra / Costo Estimado ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newEstimatedLabor}
                    onChange={(e) => setNewEstimatedLabor(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs cursor-pointer"
                >
                  Crear Orden de Taller
                </button>
              </div>
            </form>
      </Modal>

      {/* FULL PHOTO ZOOM MODAL */}
      {activePhotoModal && (
        <div
          onClick={() => setActivePhotoModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xs cursor-pointer animate-fade-in"
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-black">
            <img src={activePhotoModal} alt="Evidencia ampliada" className="max-w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
