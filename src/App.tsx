import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';

// Role Login Landing
import { RoleSelector } from './components/Login/RoleSelector';

// Operator Module
import { VehicleList } from './components/Operator/VehicleList';

// Admin / Mechanic Module
import { DashboardOverview } from './components/Admin/DashboardOverview';
import { TicketsList } from './components/Admin/TicketsList';
import { TemplateEditor } from './components/Admin/TemplateEditor';
import { FleetManagement } from './components/Admin/FleetManagement';
import { ReportsAnalytics } from './components/Admin/ReportsAnalytics';
import { HostingerSetup } from './components/Admin/HostingerSetup';

import {
  Truck,
  Wrench,
  ClipboardList,
  BarChart2,
  LayoutDashboard,
  Server,
  LogOut,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, vehicles, tickets, templates } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const isOperator = currentUser.role === 'operador';
  const isAdmin = currentUser.role === 'administrador';
  const isMechanic = currentUser.role === 'mecanico';

  const openTicketsCount = tickets.filter((t) => t.status === 'pendiente' || t.status === 'en_progreso').length;
  const criticalCount = tickets.filter((t) => t.severity === 'critica' && t.status !== 'resuelto').length;

  // Unauthenticated -> Realistic Enterprise Login Portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <OfflineBanner />
        <RoleSelector onLoginSuccess={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    critical?: boolean;
    badge?: string;
    roleAccess: string[];
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      title: 'OPERACIONES',
      items: [
        { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard, roleAccess: ['administrador', 'mecanico'] },
        { id: 'fleet', label: 'Rutas y Camiones', icon: Truck, roleAccess: ['administrador', 'mecanico'] },
      ]
    },
    {
      title: 'MANTENIMIENTO',
      items: [
        { id: 'tickets', label: 'Tickets y Taller', icon: Wrench, count: openTicketsCount, critical: criticalCount > 0, roleAccess: ['administrador', 'mecanico'] },
        { id: 'reports', label: 'Reportes y Analíticas', icon: BarChart2, roleAccess: ['administrador', 'mecanico'] },
      ]
    },
    {
      title: 'CONFIGURACIÓN',
      items: [
        { id: 'template', label: 'Creador de Formularios', icon: ClipboardList, badge: `${templates.length} Activos`, roleAccess: ['administrador'] },
        { id: 'hostinger', label: 'Servidor Hostinger MySQL', icon: Server, badge: 'MySQL', roleAccess: ['administrador'] }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header Navbar */}
      <Navbar onSwitchRole={() => setIsAuthenticated(false)} />

      {/* Offline Banner */}
      <OfflineBanner />

      {/* OPERATOR MOBILE VIEW */}
      {isOperator ? (
        <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Operador Conectado
                </span>
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
              </div>
            </div>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cambiar Perfil</span>
            </button>
          </div>

          <VehicleList />
        </main>
      ) : (
        /* DESKTOP SIDEBAR + MAIN CONTENT LAYOUT */
        <div className="flex-1 w-full flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:px-8">
          {/* DESKTOP SIDEBAR */}
          <aside className="w-full lg:w-60 shrink-0 space-y-4">
            {/* User Session Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isAdmin ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                    {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block leading-none">
                      {isAdmin ? 'Administrador' : 'Jefe de Taller'}
                    </span>
                    <span className="text-xs font-bold text-slate-900 block mt-0.5">{currentUser.name}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span>Flotilla: <strong className="text-slate-900 font-mono">{vehicles.length}</strong></span>
                <span>Pendientes: <strong className="text-amber-600 font-mono">{openTicketsCount}</strong></span>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="bg-white border border-slate-200 rounded-xl p-2 shadow-xs space-y-4">
              {navSections.map((sec) => {
                const availableItems = sec.items.filter((item) => item.roleAccess.includes(currentUser.role));
                if (availableItems.length === 0) return null;

                return (
                  <div key={sec.title} className="space-y-1">
                    <div className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {sec.title}
                    </div>

                    {availableItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isActive
                              ? 'bg-slate-900 text-white font-bold shadow-xs'
                              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                            <span>{item.label}</span>
                          </div>

                          {item.count !== undefined && item.count > 0 && (
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                              item.critical
                                ? 'bg-rose-500 text-white'
                                : isActive
                                ? 'bg-slate-800 text-slate-200'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {item.count}
                            </span>
                          )}

                          {item.badge && (
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold ${
                              isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* DESKTOP MAIN VIEW */}
          <main className="flex-1 min-w-0">
            {activeTab === 'dashboard' && (
              <DashboardOverview onNavigateTab={(tab) => setActiveTab(tab)} />
            )}

            {activeTab === 'tickets' && <TicketsList />}

            {activeTab === 'template' && <TemplateEditor />}

            {activeTab === 'fleet' && <FleetManagement />}

            {activeTab === 'reports' && <ReportsAnalytics />}

            {activeTab === 'hostinger' && <HostingerSetup />}
          </main>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 px-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FlotaCheck Enterprise • Sistema de Inspección Pre-Operacional</span>
          <span className="text-slate-500 font-mono text-[11px]">
            Hostinger MySQL Ready • PWA Offline First
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
