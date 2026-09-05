import React from 'react';
import { useHealth } from '../../hooks/useHealth';
import { Activity, Database, AlertTriangle } from 'lucide-react';

export const HealthBadge: React.FC = () => {
  const { data, isLoading, isError } = useHealth();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-400 animate-pulse">
        <Activity className="w-3.5 h-3.5 animate-spin text-cyan-400" />
        <span>Connecting to API...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-950/60 border border-red-800/80 text-xs text-red-300">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
        <span>Backend Offline</span>
      </div>
    );
  }

  const isHealthy = data.status === 'healthy' && data.database_connected;

  return (
    <div
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all ${
        isHealthy
          ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
          : 'bg-amber-950/50 border-amber-800/60 text-amber-300'
      }`}
      title={data.database_message || `API: ${data.status}, DB: ${data.database_connected ? 'Connected' : 'Disconnected'}`}
    >
      <span className={`relative flex h-2 w-2`}>
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />
      </span>
      <span>
        {data.database_connected
          ? (data.database_message?.includes('SQLite') ? 'SQLite Active' : 'PostgreSQL Active')
          : 'API Ready (No DB)'}
      </span>
    </div>
  );
};
