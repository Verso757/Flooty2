import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Truck,
  ShieldCheck,
  Wrench,
  Smartphone,
  ChevronDown,
  Download,
  Building2,
  LogOut,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  onSwitchRole?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSwitchRole }) => {
  const { currentUser, switchRole, isOnline } = useApp();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

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
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Company Brand & Context */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold shrink-0 shadow-xs">
              <Truck className="w-4 h-4 stroke-[2.2]" />
            </div>

            <div className="flex items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 tracking-tight">FlotaCheck</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                    PRO
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>Transportes y Logística MX • Sucursal Central</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Tools & Profile */}
          <div className="flex items-center gap-2.5">
            {/* Network Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
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
              <span className="hidden sm:inline font-mono text-[11px]">
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

            {/* User Profile & Role Switcher */}
            <button
              onClick={() => {
                if (onSwitchRole) {
                  onSwitchRole();
                } else {
                  setShowRoleModal(true);
                }
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer text-left"
              title="Cambiar sesión / rol de usuario"
            >
              <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden xs:block">
                <span className="block text-[10px] text-slate-500 font-medium leading-none">
                  {getRoleLabel(currentUser.role)}
                </span>
                <span className="block text-xs font-bold text-slate-900 leading-tight mt-0.5">
                  {currentUser.name}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Role Switcher Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Cambiar Perfil de Usuario</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Selecciona la función requerida para validar los permisos de la estación.
              </p>
            </div>

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
          </div>
        </div>
      )}
    </>
  );
};
