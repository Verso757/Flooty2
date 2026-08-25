import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  AlertTriangle,
  Lock,
  Wrench,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  TrendingUp,
  Activity,
  ShieldCheck,
  Search,
  Building2,
  Clock,
  MapPin,
  RefreshCw,
  ClipboardList,
  FolderLock,
  CalendarClock
} from 'lucide-react';

interface Props {
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<Props> = ({ onNavigateTab }) => {
  const { vehicles, routes, tickets, inspections, templates } = useApp();

  const totalVehicles = vehicles.length;
  const blockedVehicles = vehicles.filter((v) => v.status === 'bloqueada').length;
  const activeVehicles = vehicles.filter((v) => v.status === 'activa').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'mantenimiento').length;

  const totalRoutes = routes.length;
  const routesWithTruck = routes.filter((r) => r.assignedVehicleId).length;

  const openTickets = tickets.filter((t) => t.status === 'pendiente' || t.status === 'en_progreso');
  const criticalTickets = openTickets.filter((t) => t.severity === 'critica');
  const resolvedTickets = tickets.filter((t) => t.status === 'resuelto');

  // Operational Readiness Score
  const fleetReadinessPercent = totalVehicles > 0
    ? Math.round((activeVehicles / totalVehicles) * 100)
    : 100;

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Overview Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Consola de Rutas y Flotilla
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Panel de Control Operativo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-xl">
            Control de asignación de camiones a rutas, inspecciones pre-operacionales y estado de mantenimiento.
          </p>
        </div>

        {/* Readiness Meter */}
        <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shrink-0">
          <div className="text-right">
            <span className="block text-xl font-bold text-slate-900 font-mono">{fleetReadinessPercent}%</span>
            <span className="block text-[10px] text-slate-500 uppercase font-semibold">Disponibilidad Técnica</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Routes & Assignment Card */}
        <div
          onClick={() => onNavigateTab('fleet')}
          className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs rounded-xl p-4 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Rutas Activas</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalRoutes}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-emerald-700 font-semibold">{routesWithTruck} con camión</span>
            <span className="text-amber-700 font-semibold">{totalRoutes - routesWithTruck} sin unidad</span>
          </div>
        </div>

        {/* Total Trucks Card */}
        <div
          onClick={() => onNavigateTab('fleet')}
          className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs rounded-xl p-4 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Camiones en Flota</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalVehicles}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-emerald-600 font-semibold">{activeVehicles} Operativos</span>
            <span className="text-rose-600 font-semibold">{blockedVehicles} Inservibles</span>
          </div>
        </div>

        {/* Critical Failures Card */}
        <div
          onClick={() => onNavigateTab('tickets')}
          className={`border rounded-xl p-4 transition-all cursor-pointer ${
            criticalTickets.length > 0
              ? 'border-rose-300 bg-rose-50/50 hover:bg-rose-50'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Fallas Críticas</span>
            <div className={`p-1.5 rounded-lg border ${criticalTickets.length > 0 ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 font-mono">{criticalTickets.length}</div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            {criticalTickets.length > 0 ? '⚠️ Bloqueo de salida a ruta' : 'Sin alertas críticas'}
          </p>
        </div>

        {/* Open Tickets Card */}
        <div
          onClick={() => onNavigateTab('tickets')}
          className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs rounded-xl p-4 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Tickets de Taller</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono">{openTickets.length}</div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            {openTickets.length > 0 ? 'Reparaciones en seguimiento' : 'Sin pendientes de taller'}
          </p>
        </div>
      </div>

      {/* Critical Alert Warning Bar */}
      {criticalTickets.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-rose-900">
                {criticalTickets.length} Camión(es) Inservible(s) / Bloqueado(s) por Inspección
              </h3>
              <p className="text-[11px] sm:text-xs text-rose-700 mt-0.5">
                Se detectaron fallas críticas en los camiones asignados. Puedes realizar un cambio de camión a la ruta desde Gestión de Rutas.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('fleet')}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            Reasignar Camiones a Rutas
          </button>
        </div>
      )}

      {/* Quick Access Operational Modules Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div
          onClick={() => onNavigateTab('template')}
          className="bg-white hover:bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 group-hover:scale-105 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Creador de Formularios
              </h4>
              <p className="text-[11px] text-slate-500 font-mono">
                {templates.length} Plantillas activas
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>

        <div
          onClick={() => onNavigateTab('fleet')}
          className="bg-white hover:bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200 group-hover:scale-105 transition-transform">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                Billetera de Documentos
              </h4>
              <p className="text-[11px] text-slate-500">
                Pólizas, Tarjetas y Verificaciones
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>

        <div
          onClick={() => onNavigateTab('fleet')}
          className="bg-white hover:bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 group-hover:scale-105 transition-transform">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Mantenimiento Preventivo
              </h4>
              <p className="text-[11px] text-slate-500">
                Servicios por km / días
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Desktop Multi-Column Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Priority Tickets Data Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tickets Prioritarios de Taller</h2>
              <p className="text-[11px] text-slate-500">Fallas registradas por ruta en chequeos de salida</p>
            </div>
            <button
              onClick={() => onNavigateTab('tickets')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos ({tickets.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {openTickets.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-7 h-7 mx-auto mb-1 text-emerald-500 opacity-80" />
                <p className="text-xs font-bold text-slate-800">¡Flotilla sin fallas pendientes!</p>
                <p className="text-[11px] text-slate-500">Todas las rutas y camiones pasaron la inspección pre-operacional.</p>
              </div>
            ) : (
              openTickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => onNavigateTab('tickets')}
                  className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                        ticket.severity === 'critica'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : ticket.severity === 'media'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {ticket.id}
                    </span>

                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 truncate">{ticket.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate font-mono">
                        Camión: <span className="text-slate-900 font-bold">{ticket.economicNumber ? `#${ticket.economicNumber}` : ticket.unitName}</span>
                        {ticket.routeCode ? ` (Ruta ${ticket.routeCode})` : ''} • {ticket.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 capitalize">
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Routes & Assigned Truck Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Rutas y Camiones Asignados</h2>
              <p className="text-[11px] text-slate-500">Relación operativa de unidades</p>
            </div>
            <button
              onClick={() => onNavigateTab('fleet')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              Gestionar
            </button>
          </div>

          <div className="space-y-2">
            {routes.map((r) => {
              const assignedV = vehicles.find((v) => v.id === r.assignedVehicleId);

              return (
                <div
                  key={r.id}
                  onClick={() => onNavigateTab('fleet')}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono text-xs px-1.5 py-0.2 rounded bg-slate-900 text-white">
                        Ruta {r.code}
                      </span>
                      <span className="font-semibold text-slate-800">{r.name}</span>
                    </div>
                    {assignedV ? (
                      <span className="text-[11px] text-slate-600 font-mono block mt-1">
                        🚚 Camión <strong className="text-slate-900 font-bold">#{assignedV.economicNumber}</strong> ({assignedV.plate})
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-700 font-bold block mt-1">
                        ⚠️ Sin camión asignado
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {assignedV ? (
                      <span
                        className={`w-2 h-2 rounded-full ${
                          assignedV.status === 'activa'
                            ? 'bg-emerald-500'
                            : assignedV.status === 'bloqueada'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
