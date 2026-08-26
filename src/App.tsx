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
  UserCheck
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, tickets, templates } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const isOperator = currentUser.role === 'operador';

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
    shortLabel: string;
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
      title: 'Operaciones',
      items: [
        { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard, roleAccess: ['administrador', 'mecanico'] },
        { id: 'fleet', label: 'Vehículos', shortLabel: 'Vehículos', icon: Truck, roleAccess: ['administrador', 'mecanico'] },
      ]
    },
    {
      title: 'Mantenimiento',
      items: [
        { id: 'tickets', label: 'Tickets', shortLabel: 'Tickets', icon: Wrench, count: openTicketsCount, critical: criticalCount > 0, roleAccess: ['administrador', 'mecanico'] },
        { id: 'reports', label: 'Reportes', shortLabel: 'Reportes', icon: BarChart2, roleAccess: ['administrador', 'mecanico'] },
      ]
    },
    {
      title: 'Configuración',
      items: [
        { id: 'template', label: 'Formularios', shortLabel: 'Formularios', icon: ClipboardList, badge: `${templates.length}`, roleAccess: ['administrador'] },
        { id: 'hostinger', label: 'Servidor MySQL', shortLabel: 'Servidor', icon: Server, badge: 'MySQL', roleAccess: ['administrador'] }
      ]
    }
  ];

  // Navegación filtrada por rol, lista para el menú superior
  const availableNavSections = navSections
    .map((sec) => ({
      title: sec.title,
      items: sec.items.filter((item) => item.roleAccess.includes(currentUser.role))
    }))
    .filter((sec) => sec.items.length > 0);

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900 flex flex-col font-sans antialiased">
      {/* OPERATOR MOBILE VIEW */}
      {isOperator ? (
        <>
          <Navbar onSwitchRole={() => setIsAuthenticated(false)} />
          <OfflineBanner />
          <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-200 text-navy-800 flex items-center justify-center">
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
        </>
      ) : (
        /* TOP NAVBAR + MAIN CONTENT LAYOUT */
        <div className="flex-1 min-w-0 flex flex-col">
          <Navbar
            onSwitchRole={() => setIsAuthenticated(false)}
            navSections={availableNavSections}
            activeTab={activeTab}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
          <OfflineBanner />

          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
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
