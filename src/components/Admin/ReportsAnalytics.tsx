import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart2, PieChart, ShieldAlert, Truck, AlertTriangle, FileSpreadsheet, Layers } from 'lucide-react';

export const ReportsAnalytics: React.FC = () => {
  const { tickets, vehicles, inspections } = useApp();

  // Calculate failures by category
  const categoryCounts: Record<string, number> = {};
  tickets.forEach((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  const categorySorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = categorySorted.length > 0 ? categorySorted[0][1] : 1;

  // Calculate failures by unit
  const unitCounts: Record<string, number> = {};
  tickets.forEach((t) => {
    unitCounts[t.unitName] = (unitCounts[t.unitName] || 0) + 1;
  });

  const unitSorted = Object.entries(unitCounts).sort((a, b) => b[1] - a[1]);
  const maxUnitCount = unitSorted.length > 0 ? unitSorted[0][1] : 1;

  // Total answers stats
  let totalAnswers = 0;
  let totalFailedAnswers = 0;
  inspections.forEach((insp) => {
    insp.answers.forEach((ans) => {
      totalAnswers++;
      if (!ans.pass) totalFailedAnswers++;
    });
  });

  const passRate = totalAnswers > 0 ? Math.round(((totalAnswers - totalFailedAnswers) / totalAnswers) * 100) : 100;

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-slate-700" />
            <span>Reportes de Fallas e Inspecciones</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Análisis estadístico de recurrencia de fallas por categoría y por vehículo de flotilla.
          </p>
        </div>
      </div>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-center">
          <span className="text-3xl font-bold text-slate-900 font-mono">{passRate}%</span>
          <span className="block text-xs font-bold text-slate-700 mt-1">Índice de Salud / Conformidad</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Puntos de inspección aprobados en primera instancia</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-center">
          <span className="text-3xl font-bold text-amber-600 font-mono">{tickets.length}</span>
          <span className="block text-xs font-bold text-slate-700 mt-1">Total de Tickets Generados</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Alertas automáticas en inspección</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-center">
          <span className="text-3xl font-bold text-emerald-600 font-mono">{inspections.length}</span>
          <span className="block text-xs font-bold text-slate-700 mt-1">Inspecciones Completadas</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Recorridos pre-operacionales realizados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Report 1: Fallas más frecuentes por Categoría */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Fallas Más Frecuentes por Categoría
              </h2>
              <p className="text-xs text-slate-500">Distribución de fallas por área técnica del vehículo</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {categorySorted.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No hay datos de fallas registrados.</p>
            ) : (
              categorySorted.map(([category, count]) => {
                const percentage = Math.round((count / maxCategoryCount) * 100);
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{category}</span>
                      <span className="text-amber-700 font-mono font-bold">{count} reporte(s)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Report 2: Fallas más frecuentes por Unidad */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-slate-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Fallas Más Frecuentes por Unidad
              </h2>
              <p className="text-xs text-slate-500">Vehículos con mayor número de incidencias acumuladas</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {unitSorted.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No hay fallas por unidad registradas.</p>
            ) : (
              unitSorted.map(([unitName, count]) => {
                const percentage = Math.round((count / maxUnitCount) * 100);
                return (
                  <div key={unitName} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{unitName}</span>
                      <span className="text-rose-600 font-mono font-bold">{count} falla(s)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
