import React from 'react';
import { useApp } from '../context/AppContext';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline, offlineQueue, syncOfflineQueue } = useApp();

  if (isOnline && offlineQueue.length === 0) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong className="text-slate-900 font-bold">Modo Sin Conexión:</strong> Las inspecciones se almacenan en el dispositivo y se sincronizarán al recuperar señal.
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong className="text-slate-900 font-bold">Conexión Restablecida:</strong> Tienes {offlineQueue.length} registro(s) listos para sincronizar con Hostinger MySQL.
              </span>
            </>
          )}
        </div>

        {offlineQueue.length > 0 && isOnline && (
          <button
            onClick={syncOfflineQueue}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sincronizar Ahora ({offlineQueue.length})</span>
          </button>
        )}
      </div>
    </div>
  );
};
