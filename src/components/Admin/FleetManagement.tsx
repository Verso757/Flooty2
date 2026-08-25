import React, { useState } from 'react';
import { Vehicle, Route, RouteAssignmentHistory, User } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  MapPin,
  Plus,
  Lock,
  Edit2,
  Trash2,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  History,
  Building2,
  LayoutGrid,
  Table as TableIcon,
  Check,
  ArrowRight,
  UserCheck,
  Users,
  Phone,
  ShieldCheck,
  QrCode,
  Calendar,
  Link,
  HelpCircle
} from 'lucide-react';

export const FleetManagement: React.FC = () => {
  const {
    vehicles,
    routes,
    users,
    saveVehicle,
    deleteVehicle,
    saveRoute,
    deleteRoute,
    saveUser,
    deleteUser,
    assignVehicleToRoute,
    assignOperatorToRoute,
    assignOperatorToVehicle,
    assignUserRouteAndVehicle,
    reassignVehicleDueToBreakdown,
    tickets
  } = useApp();

  // Sub-tabs: 'ROUTES', 'TRUCKS', 'OPERATORS', 'MATRIX'
  const [activeSubTab, setActiveSubTab] = useState<'ROUTES' | 'TRUCKS' | 'OPERATORS' | 'MATRIX'>('ROUTES');

  // Search and view modes
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');

  // Route Modal
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routeCode, setRouteCode] = useState('');
  const [routeName, setRouteName] = useState('');
  const [routeZone, setRouteZone] = useState('');
  const [routeAssignedVehicleId, setRouteAssignedVehicleId] = useState('');
  const [routeAssignedOperatorId, setRouteAssignedOperatorId] = useState('');
  const [routeStatus, setRouteStatus] = useState<'activa' | 'sin_unidad' | 'suspendida'>('activa');
  const [routeNotes, setRouteNotes] = useState('');

  // Truck Modal
  const [isTruckModalOpen, setIsTruckModalOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<Vehicle | null>(null);
  const [economicNumber, setEconomicNumber] = useState('');
  const [codeName, setCodeName] = useState('');
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('Camión Pesado');
  const [truckStatus, setTruckStatus] = useState<'activa' | 'bloqueada' | 'mantenimiento'>('activa');
  const [odometerKm, setOdometerKm] = useState(100000);
  const [truckAssignedRouteId, setTruckAssignedRouteId] = useState('');
  const [truckAssignedOperatorId, setTruckAssignedOperatorId] = useState('');

  // Driver / User Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<'operador' | 'mecanico' | 'administrador'>('operador');
  const [userPhone, setUserPhone] = useState('');
  const [userDefaultRouteId, setUserDefaultRouteId] = useState('');
  const [userDefaultVehicleId, setUserDefaultVehicleId] = useState('');
  const [userLicenseNum, setUserLicenseNum] = useState('');
  const [userLicenseCategory, setUserLicenseCategory] = useState('Tipo B - Carga Pesada');
  const [userLicenseExpires, setUserLicenseExpires] = useState('2027-12-31');

  // Quick Truck Swap Modal
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapRoute, setSwapRoute] = useState<Route | null>(null);
  const [swapReplacementTruckId, setSwapReplacementTruckId] = useState('');
  const [swapReason, setSwapReason] = useState('Unidad inservible / cambio operativo');
  const [swapSuccessAlert, setSwapSuccessAlert] = useState('');

  // Route History Modal
  const [viewingHistoryRoute, setViewingHistoryRoute] = useState<Route | null>(null);

  // Filtered Operators
  const operators = users.filter((u) => u.role === 'operador');

  // ----------------------------------------------------
  // ROUTE HANDLERS
  // ----------------------------------------------------
  const handleOpenRouteModal = (route?: Route) => {
    if (route) {
      setSelectedRoute(route);
      setRouteCode(route.code);
      setRouteName(route.name);
      setRouteZone(route.zone || '');
      setRouteAssignedVehicleId(route.assignedVehicleId || '');
      setRouteAssignedOperatorId(route.assignedOperatorId || '');
      setRouteStatus(route.status);
      setRouteNotes(route.notes || '');
    } else {
      setSelectedRoute(null);
      setRouteCode('');
      setRouteName('');
      setRouteZone('');
      setRouteAssignedVehicleId('');
      setRouteAssignedOperatorId('');
      setRouteStatus('activa');
      setRouteNotes('');
    }
    setIsRouteModalOpen(true);
  };

  const handleSaveRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedOp = users.find((u) => u.id === routeAssignedOperatorId);

    const newRoute: Route = {
      id: selectedRoute ? selectedRoute.id : `r-${routeCode || Date.now()}`,
      code: routeCode.trim(),
      name: routeName.trim() || `Ruta ${routeCode.trim()}`,
      zone: routeZone.trim(),
      assignedVehicleId: routeAssignedVehicleId || undefined,
      assignedOperatorId: routeAssignedOperatorId || undefined,
      assignedOperatorName: assignedOp?.name,
      status: routeAssignedVehicleId ? 'activa' : 'sin_unidad',
      notes: routeNotes,
      history: selectedRoute?.history || []
    };

    saveRoute(newRoute);

    // Sync vehicle
    if (routeAssignedVehicleId) {
      assignVehicleToRoute(newRoute.id, routeAssignedVehicleId, 'Asignación desde catálogo de rutas');
    }

    // Sync operator
    if (routeAssignedOperatorId) {
      assignOperatorToRoute(newRoute.id, routeAssignedOperatorId);
    }

    setIsRouteModalOpen(false);
  };

  // ----------------------------------------------------
  // TRUCK HANDLERS
  // ----------------------------------------------------
  const handleOpenTruckModal = (truck?: Vehicle) => {
    if (truck) {
      setSelectedTruck(truck);
      setEconomicNumber(truck.economicNumber || '');
      setCodeName(truck.codeName);
      setPlate(truck.plate);
      setModel(truck.model);
      setType(truck.type);
      setTruckStatus(truck.status);
      setOdometerKm(truck.odometerKm || 100000);
      setTruckAssignedRouteId(truck.currentRouteId || '');
      setTruckAssignedOperatorId(truck.assignedOperatorId || '');
    } else {
      setSelectedTruck(null);
      setEconomicNumber('');
      setCodeName('');
      setPlate('');
      setModel('');
      setType('Camión Pesado');
      setTruckStatus('activa');
      setOdometerKm(120000);
      setTruckAssignedRouteId('');
      setTruckAssignedOperatorId('');
    }
    setIsTruckModalOpen(true);
  };

  const handleSaveTruck = (e: React.FormEvent) => {
    e.preventDefault();
    const eco = economicNumber.trim();
    const assignedOp = users.find((u) => u.id === truckAssignedOperatorId);

    const newTruck: Vehicle = {
      id: selectedTruck ? selectedTruck.id : `v-${eco || Date.now()}`,
      economicNumber: eco,
      codeName: codeName.trim() || `Camión ${eco}`,
      plate: plate.toUpperCase().trim(),
      model: model.trim(),
      type,
      status: truckStatus,
      currentRouteId: truckAssignedRouteId || undefined,
      assignedOperatorId: truckAssignedOperatorId || undefined,
      assignedOperatorName: assignedOp?.name,
      odometerKm: Number(odometerKm) || 100000,
      qrCodeValue: `FLOTACHECK:UNIT:${selectedTruck ? selectedTruck.id : `v-${eco || Date.now()}`}`
    };

    saveVehicle(newTruck);

    // Sync Route if assigned
    if (truckAssignedRouteId) {
      assignVehicleToRoute(truckAssignedRouteId, newTruck.id, 'Asignación desde catálogo de camiones');
    }

    // Sync Driver if assigned
    if (truckAssignedOperatorId) {
      assignOperatorToVehicle(newTruck.id, truckAssignedOperatorId);
    }

    setIsTruckModalOpen(false);
  };

  // ----------------------------------------------------
  // DRIVER / USER HANDLERS
  // ----------------------------------------------------
  const handleOpenUserModal = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setUserName(user.name);
      setUserRole(user.role);
      setUserPhone(user.phone || '');
      setUserDefaultRouteId(user.defaultRouteId || '');
      setUserDefaultVehicleId(user.defaultVehicleId || '');
      setUserLicenseNum(user.driverLicense?.licenseNumber || '');
      setUserLicenseCategory(user.driverLicense?.category || 'Tipo B - Carga Pesada');
      setUserLicenseExpires(user.driverLicense?.expiresAt || '2027-12-31');
    } else {
      setSelectedUser(null);
      setUserName('');
      setUserRole('operador');
      setUserPhone('');
      setUserDefaultRouteId('');
      setUserDefaultVehicleId('');
      setUserLicenseNum('');
      setUserLicenseCategory('Tipo B - Carga Pesada');
      setUserLicenseExpires('2027-12-31');
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const userId = selectedUser ? selectedUser.id : `usr-${Date.now()}`;

    const updatedUser: User = {
      id: userId,
      name: userName.trim(),
      role: userRole,
      phone: userPhone.trim(),
      defaultRouteId: userDefaultRouteId || undefined,
      defaultVehicleId: userDefaultVehicleId || undefined,
      avatar: selectedUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      driverLicense: userLicenseNum
        ? {
            licenseNumber: userLicenseNum.trim(),
            category: userLicenseCategory,
            expiresAt: userLicenseExpires
          }
        : undefined
    };

    saveUser(updatedUser);

    // Sync with Route & Vehicle
    if (userDefaultRouteId || userDefaultVehicleId) {
      assignUserRouteAndVehicle(userId, userDefaultRouteId, userDefaultVehicleId);
    }

    setIsUserModalOpen(false);
  };

  // ----------------------------------------------------
  // QUICK TRUCK SWAP HANDLER
  // ----------------------------------------------------
  const handleOpenSwapModal = (route: Route) => {
    setSwapRoute(route);
    const curV = vehicles.find((v) => v.id === route.assignedVehicleId);
    const firstAvailable = vehicles.find(
      (v) => v.status === 'activa' && v.id !== curV?.id
    );
    setSwapReplacementTruckId(firstAvailable?.id || '');
    setSwapReason(
      curV?.status === 'bloqueada'
        ? `Camión #${curV.economicNumber} inservible en taller`
        : 'Reasignación de camión a ruta'
    );
    setIsSwapModalOpen(true);
  };

  const handleConfirmSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapRoute || !swapReplacementTruckId) return;

    reassignVehicleDueToBreakdown(swapRoute.id, swapReplacementTruckId, swapReason);
    const newTruck = vehicles.find((v) => v.id === swapReplacementTruckId);
    setSwapSuccessAlert(`¡Camión #${newTruck?.economicNumber} asignado exitosamente a la ${swapRoute.name}!`);

    setTimeout(() => {
      setSwapSuccessAlert('');
      setIsSwapModalOpen(false);
    }, 1200);
  };

  // ----------------------------------------------------
  // FILTERED DATA
  // ----------------------------------------------------
  const filteredRoutes = routes.filter((r) => {
    const assignedV = vehicles.find((v) => v.id === r.assignedVehicleId);
    const assignedO = users.find((u) => u.id === r.assignedOperatorId);
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      (r.zone && r.zone.toLowerCase().includes(q)) ||
      (assignedV && (
        assignedV.economicNumber.toLowerCase().includes(q) ||
        assignedV.plate.toLowerCase().includes(q) ||
        assignedV.codeName.toLowerCase().includes(q)
      )) ||
      (assignedO && assignedO.name.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'activa' && r.assignedVehicleId && assignedV?.status === 'activa') ||
      (statusFilter === 'bloqueada' && assignedV?.status === 'bloqueada') ||
      (statusFilter === 'sin_unidad' && !r.assignedVehicleId);

    return matchesSearch && matchesStatus;
  });

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    const assignedRoute = routes.find((r) => r.assignedVehicleId === v.id || r.id === v.currentRouteId);
    const assignedOp = users.find((u) => u.id === v.assignedOperatorId);

    const matchesSearch =
      v.economicNumber.toLowerCase().includes(q) ||
      v.codeName.toLowerCase().includes(q) ||
      v.plate.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      (assignedRoute && (assignedRoute.code.toLowerCase().includes(q) || assignedRoute.name.toLowerCase().includes(q))) ||
      (assignedOp && assignedOp.name.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const assignedRoute = routes.find((r) => r.id === u.defaultRouteId || r.assignedOperatorId === u.id);
    const assignedTruck = vehicles.find((v) => v.id === u.defaultVehicleId || v.assignedOperatorId === u.id);

    return (
      u.name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.driverLicense?.licenseNumber && u.driverLicense.licenseNumber.toLowerCase().includes(q)) ||
      (assignedRoute && assignedRoute.name.toLowerCase().includes(q)) ||
      (assignedTruck && assignedTruck.codeName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-slate-700" />
            <span>Asignación de Operadores, Camiones y Rutas</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Vinculación completa entre Chofer ↔ Camión ↔ Ruta, reemplazo de unidades de patio y catálogo de flota.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Action Button depending on sub-tab */}
          {activeSubTab === 'ROUTES' && (
            <button
              onClick={() => handleOpenRouteModal()}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Alta de Ruta</span>
            </button>
          )}

          {activeSubTab === 'TRUCKS' && (
            <button
              onClick={() => handleOpenTruckModal()}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Alta de Camión</span>
            </button>
          )}

          {activeSubTab === 'OPERATORS' && (
            <button
              onClick={() => handleOpenUserModal()}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Alta de Chofer / Usuario</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Sub-Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => {
            setActiveSubTab('ROUTES');
            setStatusFilter('ALL');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'ROUTES'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Rutas y Asignaciones ({routes.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('TRUCKS');
            setStatusFilter('ALL');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'TRUCKS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Catálogo de Camiones ({vehicles.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('OPERATORS');
            setStatusFilter('ALL');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'OPERATORS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Operadores & Choferes ({operators.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('MATRIX');
            setStatusFilter('ALL');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'MATRIX'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Link className="w-4 h-4 text-amber-500" />
          <span>Asignador Rápido 1-Clic</span>
        </button>
      </div>

      {/* Filter and Search Bar (except matrix) */}
      {activeSubTab !== 'MATRIX' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={
                  activeSubTab === 'ROUTES'
                    ? 'Buscar por ruta (#125), zona, camión o chofer...'
                    : activeSubTab === 'TRUCKS'
                    ? 'Buscar por número económico (#507), placa, modelo o chofer...'
                    : 'Buscar por nombre de chofer, teléfono, licencia...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors"
              />
            </div>

            {activeSubTab !== 'OPERATORS' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer font-medium"
              >
                <option value="ALL">Todos los Estatus</option>
                <option value="activa">Operativo / Activo</option>
                <option value="bloqueada">Bloqueado / Inservible</option>
                {activeSubTab === 'ROUTES' && <option value="sin_unidad">Rutas Sin Unidad</option>}
                {activeSubTab === 'TRUCKS' && <option value="mantenimiento">En Mantenimiento</option>}
              </select>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 1: RUTAS & ASIGNACIONES */}
      {/* ==================================================== */}
      {activeSubTab === 'ROUTES' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">Ruta / Código</th>
                  <th className="py-3 px-4">Zona / Sector</th>
                  <th className="py-3 px-4">Camión Asignado</th>
                  <th className="py-3 px-4">Chofer / Operador Titular</th>
                  <th className="py-3 px-4">Estatus del Camión</th>
                  <th className="py-3 px-4">Historial de Cambios</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoutes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No se encontraron rutas con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  filteredRoutes.map((route) => {
                    const truck = vehicles.find((v) => v.id === route.assignedVehicleId);
                    const operator = users.find((u) => u.id === route.assignedOperatorId);
                    const isTruckBlocked = truck?.status === 'bloqueada';
                    const historyCount = route.history?.length || 0;

                    return (
                      <tr key={route.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-slate-900 text-white">
                              Ruta {route.code}
                            </span>
                            <span className="font-bold text-slate-900">{route.name}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-medium text-slate-700">
                          {route.zone || 'Zona General'}
                        </td>

                        <td className="py-3 px-4">
                          {truck ? (
                            <div>
                              <div className="font-bold text-slate-900 font-mono flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-slate-600" />
                                <span>{truck.codeName} (#{truck.economicNumber})</span>
                              </div>
                              <div className="font-mono text-[10px] text-slate-500">
                                Placas: {truck.plate} • {truck.model}
                              </div>
                            </div>
                          ) : (
                            <span className="text-amber-600 font-bold text-xs">
                              ⚠️ Sin Camión Asignado
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {operator ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                <img src={operator.avatar} alt={operator.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{operator.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{operator.phone}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Sin chofer asignado</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {truck ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${
                                truck.status === 'activa'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : truck.status === 'bloqueada'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  truck.status === 'activa'
                                    ? 'bg-emerald-500'
                                    : truck.status === 'bloqueada'
                                    ? 'bg-rose-500'
                                    : 'bg-amber-500'
                                }`}
                              />
                              <span>{truck.status}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">N/A</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => setViewingHistoryRoute(route)}
                            className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold cursor-pointer underline"
                          >
                            <History className="w-3 h-3 text-slate-400" />
                            <span>{historyCount} registro(s)</span>
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenSwapModal(route)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold cursor-pointer transition-colors border border-amber-200 flex items-center gap-1"
                              title="Reasignar o cambiar camión si está inservible"
                            >
                              <RefreshCw className="w-3 h-3 text-amber-600" />
                              <span>Cambiar Camión</span>
                            </button>

                            <button
                              onClick={() => handleOpenRouteModal(route)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors border border-slate-200"
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 2: CATÁLOGO DE CAMIONES */}
      {/* ==================================================== */}
      {activeSubTab === 'TRUCKS' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">N° Económico</th>
                  <th className="py-3 px-4">Unidad / Placa</th>
                  <th className="py-3 px-4">Modelo & Tipo</th>
                  <th className="py-3 px-4">Ruta Asignada</th>
                  <th className="py-3 px-4">Chofer / Operador</th>
                  <th className="py-3 px-4">Estatus</th>
                  <th className="py-3 px-4">Odómetro</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      No se encontraron camiones con los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle) => {
                    const assignedRoute = routes.find((r) => r.assignedVehicleId === vehicle.id || r.id === vehicle.currentRouteId);
                    const assignedOp = users.find((u) => u.id === vehicle.assignedOperatorId);

                    return (
                      <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono font-black text-xs">
                            #{vehicle.economicNumber}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{vehicle.codeName}</div>
                          <div className="font-mono text-[10px] text-slate-500">{vehicle.plate}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-800 font-medium">{vehicle.model}</div>
                          <div className="text-[10px] text-slate-400">{vehicle.type}</div>
                        </td>

                        <td className="py-3 px-4">
                          {assignedRoute ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <MapPin className="w-3 h-3 text-blue-600" />
                              <span>{assignedRoute.name} (Ruta {assignedRoute.code})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              <span>Disponible en Patio</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {assignedOp ? (
                            <div className="flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                              <span className="font-bold text-slate-900">{assignedOp.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Sin operador titular</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${
                              vehicle.status === 'activa'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : vehicle.status === 'bloqueada'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                vehicle.status === 'activa'
                                  ? 'bg-emerald-500'
                                  : vehicle.status === 'bloqueada'
                                  ? 'bg-rose-500'
                                  : 'bg-amber-500'
                              }`}
                            />
                            <span>{vehicle.status}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                          {vehicle.odometerKm?.toLocaleString() || '100,000'} km
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenTruckModal(vehicle)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors border border-slate-200"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 3: OPERADORES & CHOFERES */}
      {/* ==================================================== */}
      {activeSubTab === 'OPERATORS' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">Operador / Nombre</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Ruta Asignada</th>
                  <th className="py-3 px-4">Camión Habitual</th>
                  <th className="py-3 px-4">Licencia de Conducir</th>
                  <th className="py-3 px-4">Vigencia Licencia</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No se encontraron operadores registrados
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const assignedRoute = routes.find((r) => r.id === user.defaultRouteId || r.assignedOperatorId === user.id);
                    const assignedTruck = vehicles.find((v) => v.id === user.defaultVehicleId || v.assignedOperatorId === user.id);

                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0">
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{user.name}</span>
                              <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-700">
                          {user.phone || 'Sin registrar'}
                        </td>

                        <td className="py-3 px-4">
                          {assignedRoute ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[11px]">
                              <MapPin className="w-3 h-3 text-blue-600" />
                              <span>{assignedRoute.name} (Ruta {assignedRoute.code})</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Chofer Volante / Libre</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {assignedTruck ? (
                            <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-slate-500" />
                              <span>{assignedTruck.codeName} (#{assignedTruck.economicNumber})</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Rotativo de Patio</span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-700">
                          {user.driverLicense?.licenseNumber || 'Sin licencia registrada'}
                        </td>

                        <td className="py-3 px-4">
                          {user.driverLicense?.expiresAt ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>{user.driverLicense.expiresAt}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">N/A</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenUserModal(user)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors border border-slate-200"
                          >
                            Editar / Asignar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 4: ASIGNADOR RÁPIDO 1-CLIC (MATRIZ OPERATIVA) */}
      {/* ==================================================== */}
      {activeSubTab === 'MATRIX' && (
        <div className="space-y-4">
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Link className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-amber-900">
                Matriz de Asignación Rápida de Flotilla
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Selecciona directamente el <strong>Camión</strong> y el <strong>Operador Titular</strong> de cada ruta. Los cambios se guardan instantáneamente y quedan sincronizados en toda la plataforma.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                RUTAS ACTIVAS ({routes.length})
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Auto-guardado activo
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {routes.map((route) => {
                const currentTruck = vehicles.find((v) => v.id === route.assignedVehicleId);
                const currentOp = users.find((u) => u.id === route.assignedOperatorId);

                return (
                  <div key={route.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="lg:w-1/4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono font-black text-xs">
                          Ruta {route.code}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{route.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{route.zone || 'Sin zona asignada'}</p>
                    </div>

                    {/* Truck Selector */}
                    <div className="lg:w-1/3 space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-500" />
                        <span>Camión Asignado:</span>
                      </label>
                      <select
                        value={route.assignedVehicleId || ''}
                        onChange={(e) => {
                          const newTruckId = e.target.value;
                          if (newTruckId) {
                            assignVehicleToRoute(route.id, newTruckId, 'Asignación rápida desde Matriz');
                          }
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none cursor-pointer focus:border-slate-400"
                      >
                        <option value="">-- Sin Camión Asignado --</option>
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            Camión #{v.economicNumber} - {v.codeName} [{v.status.toUpperCase()}]
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Operator Selector */}
                    <div className="lg:w-1/3 space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                        <span>Chofer / Operador:</span>
                      </label>
                      <select
                        value={route.assignedOperatorId || ''}
                        onChange={(e) => {
                          const newOpId = e.target.value;
                          assignOperatorToRoute(route.id, newOpId || undefined);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none cursor-pointer focus:border-slate-400"
                      >
                        <option value="">-- Sin Chofer Asignado --</option>
                        {operators.map((op) => (
                          <option key={op.id} value={op.id}>
                            {op.name} ({op.phone || 'Sin tel.'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ALTA / EDICIÓN DE RUTA */}
      {/* ==================================================== */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-700" />
                <span>{selectedRoute ? 'Editar Ruta' : 'Dar de Alta Nueva Ruta'}</span>
              </h3>
              <button
                onClick={() => setIsRouteModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoute} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Número / Código de Ruta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 125, 101, 402"
                    value={routeCode}
                    onChange={(e) => setRouteCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nombre Descriptivo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Ruta 125"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Zona / Sector Operativo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Sector Industrial - Norte"
                  value={routeZone}
                  onChange={(e) => setRouteZone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Camión / Unidad Asignada
                </label>
                <select
                  value={routeAssignedVehicleId}
                  onChange={(e) => setRouteAssignedVehicleId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 cursor-pointer outline-none font-medium"
                >
                  <option value="">-- Sin Camión Asignado (Pendiente) --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      Camión #{v.economicNumber} - {v.codeName} ({v.plate}) [{v.status.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Chofer / Operador Titular
                </label>
                <select
                  value={routeAssignedOperatorId}
                  onChange={(e) => setRouteAssignedOperatorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 cursor-pointer outline-none font-medium"
                >
                  <option value="">-- Sin Chofer Asignado --</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name} ({op.phone || 'Sin tel.'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Notas de la Ruta
                </label>
                <textarea
                  rows={2}
                  placeholder="Observaciones de la ruta o especificaciones de carga..."
                  value={routeNotes}
                  onChange={(e) => setRouteNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRouteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs cursor-pointer"
                >
                  Guardar Ruta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ALTA / EDICIÓN DE CAMIÓN */}
      {/* ==================================================== */}
      {isTruckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-700" />
                <span>{selectedTruck ? 'Editar Camión' : 'Dar de Alta Nuevo Camión'}</span>
              </h3>
              <button
                onClick={() => setIsTruckModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTruck} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    N° Económico *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 507, 101, 12"
                    value={economicNumber}
                    onChange={(e) => setEconomicNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Placas *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. MX-507-A"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono font-bold uppercase text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nombre Descriptivo / Código
                </label>
                <input
                  type="text"
                  placeholder="Ej. Camión 507 (Kenworth T680)"
                  value={codeName}
                  onChange={(e) => setCodeName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Modelo / Año
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Freightliner M2 (2022)"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tipo de Unidad
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none"
                  >
                    <option value="Camión Pesado">Camión Pesado</option>
                    <option value="Camión Mediano">Camión Mediano</option>
                    <option value="Tractocamión">Tractocamión / Quinta</option>
                    <option value="Camioneta Reparto">Camioneta de Reparto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Ruta Asignada
                  </label>
                  <select
                    value={truckAssignedRouteId}
                    onChange={(e) => setTruckAssignedRouteId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none font-medium"
                  >
                    <option value="">-- Sin Ruta (Patio) --</option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Ruta {r.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Chofer Asignado
                  </label>
                  <select
                    value={truckAssignedOperatorId}
                    onChange={(e) => setTruckAssignedOperatorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none font-medium"
                  >
                    <option value="">-- Sin Chofer --</option>
                    {operators.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Odómetro Inicial (km)
                  </label>
                  <input
                    type="number"
                    value={odometerKm}
                    onChange={(e) => setOdometerKm(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Estatus
                  </label>
                  <select
                    value={truckStatus}
                    onChange={(e) => setTruckStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none font-semibold capitalize"
                  >
                    <option value="activa">Operativo / Activa</option>
                    <option value="bloqueada">Bloqueada (Taller)</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTruckModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs cursor-pointer"
                >
                  Guardar Camión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ALTA / EDICIÓN DE CHOFER / OPERADOR */}
      {/* ==================================================== */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-700" />
                <span>{selectedUser ? 'Editar Chofer / Usuario' : 'Dar de Alta Chofer'}</span>
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nombre Completo del Operador *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez González"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Rol en el Sistema
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none font-medium"
                  >
                    <option value="operador">Operador / Chofer</option>
                    <option value="mecanico">Mecánico de Taller</option>
                    <option value="administrador">Supervisor / Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Teléfono Celular
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. +52 55 1234 5678"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Ruta Predeterminada
                  </label>
                  <select
                    value={userDefaultRouteId}
                    onChange={(e) => setUserDefaultRouteId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none font-medium"
                  >
                    <option value="">-- Sin ruta fija (Volante) --</option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Ruta {r.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Camión Asignado
                  </label>
                  <select
                    value={userDefaultVehicleId}
                    onChange={(e) => setUserDefaultVehicleId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none font-medium"
                  >
                    <option value="">-- Sin camión fijo --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        Camión #{v.economicNumber} - {v.codeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Driver License Section */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">Licencia de Conducir:</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="N° Folio (LIC-FED-8849)"
                    value={userLicenseNum}
                    onChange={(e) => setUserLicenseNum(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 text-xs outline-none"
                  />
                  <input
                    type="date"
                    value={userLicenseExpires}
                    onChange={(e) => setUserLicenseExpires(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs cursor-pointer"
                >
                  Guardar Operador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: CAMBIO RÁPIDO DE CAMIÓN POR DESCOMPOSTURA */}
      {/* ==================================================== */}
      {isSwapModalOpen && swapRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <span>Cambiar Camión para {swapRoute.name}</span>
              </h3>
              <button
                onClick={() => setIsSwapModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {swapSuccessAlert ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold text-center">
                {swapSuccessAlert}
              </div>
            ) : (
              <form onSubmit={handleConfirmSwap} className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Ruta a Despachar:</span>
                  <span className="text-sm font-bold text-slate-900">{swapRoute.name} (Ruta {swapRoute.code})</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{swapRoute.zone}</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Selecciona Camión de Reemplazo (Patio):
                  </label>
                  <select
                    required
                    value={swapReplacementTruckId}
                    onChange={(e) => setSwapReplacementTruckId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono font-bold text-slate-900 outline-none"
                  >
                    <option value="">-- Selecciona Unidad Activa --</option>
                    {vehicles
                      .filter((v) => v.status === 'activa')
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          Camión #{v.economicNumber} - {v.codeName} ({v.plate})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Motivo del Cambio Operativo:
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={swapReason}
                    onChange={(e) => setSwapReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSwapModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs cursor-pointer"
                  >
                    Confirmar Reasignación
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: HISTORIAL DE ASIGNACIONES DE LA RUTA */}
      {/* ==================================================== */}
      {viewingHistoryRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-700" />
                <span>Historial de Asignaciones: {viewingHistoryRoute.name}</span>
              </h3>
              <button
                onClick={() => setViewingHistoryRoute(null)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3">
              {viewingHistoryRoute.history && viewingHistoryRoute.history.length > 0 ? (
                viewingHistoryRoute.history.map((hist) => (
                  <div key={hist.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{hist.newVehicleName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(hist.date).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600">{hist.reason}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">Autorizado por: {hist.assignedBy}</span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No hay movimientos previos registrados para esta ruta.
                </div>
              )}
            </div>

            <button
              onClick={() => setViewingHistoryRoute(null)}
              className="w-full py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
