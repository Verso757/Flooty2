import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Wrench,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  Building2,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
  MapPin
} from 'lucide-react';

interface Props {
  onLoginSuccess?: () => void;
}

export const RoleSelector: React.FC<Props> = ({ onLoginSuccess }) => {
  const { switchRole, currentUser } = useApp();

  const [emailOrUser, setEmailOrUser] = useState('ruta125@empresa.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('operador');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Production user profiles
  const demoUsers: Record<UserRole, { id: string; name: string; email: string; roleName: string; icon: any; color: string; desc: string }> = {
    operador: {
      id: 'op1',
      name: 'Chofer de Ruta',
      email: 'ruta125@empresa.com',
      roleName: 'Chofer de Ruta (Ruta 125 - Camión 507)',
      icon: MapPin,
      color: 'blue',
      desc: 'Selecciona tu Ruta de trabajo, revisa el Camión titular asignado y realiza la inspección diaria.'
    },
    mecanico: {
      id: 'mec1',
      name: 'Roberto Sánchez (Taller)',
      email: 'taller.mecanico@empresa.com',
      roleName: 'Jefe de Taller / Mecánico',
      icon: Wrench,
      color: 'amber',
      desc: 'Recepción de tickets, diagnósticos técnicos, cambio de estatus de unidades y refacciones.'
    },
    administrador: {
      id: 'admin1',
      name: 'Carlos Mendoza (Gerencia)',
      email: 'gerencia.flota@empresa.com',
      roleName: 'Gerente de Operaciones / Admin',
      icon: ShieldCheck,
      color: 'slate',
      desc: 'Asignación y alta de rutas, catálogo de camiones económicos, reasignaciones e integración MySQL.'
    }
  };

  const handleQuickFill = (role: UserRole) => {
    setSelectedRole(role);
    setEmailOrUser(demoUsers[role].email);
    setPassword('demo2026');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUser.trim()) {
      setErrorMsg('Por favor ingresa tu correo corporativo o ID de empleado.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);
      switchRole(selectedRole);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }, 300);
  };

  const handleDirectRoleLogin = (role: UserRole) => {
    switchRole(role);
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight flex items-center gap-1.5">
                FlotaCheck <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">Enterprise</span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium">Sistema de Inspección por Rutas y Asignación de Camiones</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Servidor Operativo
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-slate-500">
              <Building2 className="w-3.5 h-3.5" /> Portal Corporativo
            </span>
          </div>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 animate-fade-in">
          
          {/* Left / Top Form Area (7 Cols) */}
          <div className="p-6 sm:p-10 md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Acceso al Sistema
                </span>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Iniciar Sesión
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Ingresa con tu estación de trabajo o selecciona tu perfil operativo.
                </p>
              </div>

              {/* Role Selection Tabs */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Tipo de Perfil de Trabajo
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('operador')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                      selectedRole === 'operador'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Chofer / Ruta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('mecanico')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                      selectedRole === 'mecanico'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>Taller</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('administrador')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                      selectedRole === 'administrador'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo electrónico o ID de Empleado
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={emailOrUser}
                      onChange={(e) => setEmailOrUser(e.target.value)}
                      placeholder="usuario@empresa.com"
                      className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 focus:border-slate-900 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Contraseña de Acceso
                    </label>
                    <span className="text-[11px] font-medium text-slate-500">
                      (Modo demostración)
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 focus:border-slate-900 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 font-medium">Recordar en este equipo</span>
                  </label>
                  <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    256-bit SSL
                  </span>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Entrando al sistema...
                    </span>
                  ) : (
                    <>
                      <span>Entrar como {demoUsers[selectedRole].roleName.split('(')[0]}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Quick Direct Access Buttons */}
            <div className="mt-8 pt-5 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Acceso Directo de 1 Clic
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Perfiles Rápidos</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDirectRoleLogin('operador')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors border border-slate-200 cursor-pointer flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span>Chofer de Ruta</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectRoleLogin('mecanico')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors border border-slate-200 cursor-pointer flex items-center gap-1"
                >
                  <Wrench className="w-3 h-3 text-amber-600" />
                  <span>Roberto (Taller)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectRoleLogin('administrador')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors border border-slate-200 cursor-pointer flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3 text-slate-900" />
                  <span>Carlos (Admin)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right / Sidebar Information Area (5 Cols) */}
          <div className="bg-slate-900 p-6 sm:p-10 md:col-span-5 text-white flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Perfil Seleccionado</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0">
                    {React.createElement(demoUsers[selectedRole].icon, { className: 'w-5 h-5' })}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{demoUsers[selectedRole].name}</h3>
                    <p className="text-xs text-slate-300 font-mono">{demoUsers[selectedRole].roleName}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-700/80 pt-2.5 mt-2">
                  {demoUsers[selectedRole].desc}
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Funcionalidades del Sistema
                </span>
                
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Asignación de Camiones únicos por Número Económico (#507, #101, #304, #12).</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Reasignación rápida de camión a ruta si la unidad titular está inservible o en taller.</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Bloqueo automático de camiones con fallas críticas en inspección diaria.</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Esquema SQL listo para MySQL en Hostinger y funcionamiento Offline.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-mono">FlotaCheck Enterprise • v2.5.0</p>
              <p>© 2026 Todos los derechos reservados.</p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sistema de Inspección Pre-Operacional de Flotillas y Rutas de Transporte.</span>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#terminos" className="hover:text-slate-900">Términos</a>
            <a href="#privacidad" className="hover:text-slate-900">Privacidad</a>
            <a href="#soporte" className="hover:text-slate-900">Soporte Técnico</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
