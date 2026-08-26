import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Modal } from './Common/Modal';
import {
  Truck,
  ShieldCheck,
  Wrench,
  Smartphone,
  ChevronDown,
  Download,
  LogOut,
  UserCheck,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  critical?: boolean;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavbarProps {
  onSwitchRole?: () => void;
  title?: string;
  subtitle?: string;
  navSections?: NavSection[];
  activeTab?: string;
  onNavigateTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSwitchRole, title, subtitle, navSections, activeTab, onNavigateTab }) => {
  const { currentUser, switchRole, isOnline } = useApp();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Cerrar menús desplegables al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'administrador':
        return 'Administrador General';
      case 'mecanico':
        return 'Jefe de Taller / Mecánico';
      case 'operador':
        return 'Operador de Ruta';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 shadow-xs" ref={navRef}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 py-2.5">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-navy-950 flex items-center justify-center text-white font-black shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="font-extrabold tracking-tight text-[15px] text-slate-900">FlotaCheck</div>
              <div className="text-[10px] text-navy-500 uppercase tracking-widest">Gestión de Flotilla</div>
            </div>
          </div>

          {/* Desktop Navigation Dropdowns */}
          {navSections && navSections.length > 0 && (
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {navSections.map((sec) => {
                const isOpen = openMenu === sec.title;
                const hasActive = sec.items.some((it) => it.id === activeTab);
                return (
                  <div key={sec.title} className="relative">
                    <button
                      onClick={() => setOpenMenu(isOpen ? null : sec.title)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        hasActive
                          ? 'text-blue-700 bg-blue-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span>{sec.title}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 animate-fade-in z-50">
                        {sec.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                onNavigateTab?.(item.id);
                                setOpenMenu(null);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                isActive
                                  ? 'bg-navy-950 text-white'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                              <span>{item.label}</span>

                              {item.count !== undefined && item.count > 0 && (
                                <span className={`ml-auto px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                                  item.critical
                                    ? 'bg-rose-500 text-white'
                                    : isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {item.count}
                                </span>
                              )}

                              {item.badge && (
                                <span className={`ml-auto px-1.5 py-0.2 rounded-md text-[9px] font-mono font-semibold ${
                                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                  {item.badge}
                                </span>
                              )}

                              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          )}

          {/* Right Action Tools & Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Network Status Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span className="font-mono text-[11px]">
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            {/* Install PWA Button */}
            {deferredPrompt && !isInstalled && (
              <button
                onClick={handleInstallClick}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Instalar App</span>
              </button>
            )}

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setOpenMenu(null);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer text-left"
              >
                <div className="w-6 h-6 rounded-md bg-navy-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <span className="block text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-medium leading-none mt-0.5">
                    {currentUser.email ?? getRoleLabel(currentUser.role)}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 animate-fade-in z-50">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${currentUser.role === 'administrador' ? 'bg-blue-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
                        {currentUser.role === 'administrador' ? <ShieldCheck className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block leading-none">
                          {getRoleLabel(currentUser.role)}
                        </span>
                        <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate">{currentUser.name}</span>
                        {currentUser.email && (
                          <span className="text-[10px] text-slate-500 block truncate">{currentUser.email}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onSwitchRole) {
                        onSwitchRole();
                      } else {
                        setShowRoleModal(true);
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-slate-500" />
                    <span>Cambiar Perfil / Rol</span>
                  </button>

                  {onSwitchRole && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onSwitchRole();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Cerrar Sesión</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            {navSections && navSections.length > 0 && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                aria-label="Abrir menú"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {showMobileMenu ? (
                    <path d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <path d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {showMobileMenu && navSections && navSections.length > 0 && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-3 animate-fade-in">
            {navSections.map((sec) => (
              <div key={sec.title} className="space-y-1">
                <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {sec.title}
                </div>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigateTab?.(item.id);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-navy-950 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>

                      {item.count !== undefined && item.count > 0 && (
                        <span className={`ml-auto px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                          item.critical
                            ? 'bg-rose-500 text-white'
                            : isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.count}
                        </span>
                      )}

                      {item.badge && (
                        <span className="ml-auto px-1.5 py-0.2 rounded-md text-[9px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Role Switcher Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Cambiar Perfil de Usuario"
        subtitle="Selecciona la función requerida para validar los permisos de la estación."
        size="sm"
      >

            <div className="space-y-2">
              <button
                onClick={() => {
                  switchRole('operador');
                  setShowRoleModal(false);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-colors cursor-pointer ${
                  currentUser.role === 'operador'
                    ? 'bg-blue-50 border-blue-200 text-blue-900 ring-1 ring-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold">Operador de Ruta</span>
                    <span className="block text-[11px] text-slate-500">Inspecciones pre-operacionales en campo</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  switchRole('mecanico');
                  setShowRoleModal(false);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-colors cursor-pointer ${
                  currentUser.role === 'mecanico'
                    ? 'bg-amber-50 border-amber-200 text-amber-900 ring-1 ring-amber-500/20'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold">Jefe de Taller / Mecánico</span>
                    <span className="block text-[11px] text-slate-500">Atención de fallas y folios de servicio</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  switchRole('administrador');
                  setShowRoleModal(false);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-colors cursor-pointer ${
                  currentUser.role === 'administrador'
                    ? 'bg-slate-100 border-slate-300 text-slate-900 ring-1 ring-slate-400/20'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-900">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold">Administrador General</span>
                    <span className="block text-[11px] text-slate-500">Control de flota, analíticas y Hostinger MySQL</span>
                  </div>
                </div>
              </button>
            </div>

          <button
            onClick={() => setShowRoleModal(false)}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
          >
            Cerrar
          </button>
      </Modal>
    </>
  );
};
