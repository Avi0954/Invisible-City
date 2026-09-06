import React from 'react';
import { useHealth } from '../../hooks/useHealth';
import { Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

export const HealthBadge: React.FC = () => {
  const { data, isLoading, isError } = useHealth();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#f1eee7] border border-[#e5e2da] text-xs text-[#787770] animate-pulse">
        <Activity className="w-3.5 h-3.5 animate-spin text-[#2f685f]" />
        <span>Connecting...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs text-red-800">
        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
        <span>Service Unavailable</span>
      </div>
    );
  }

  const isHealthy = data.status === 'healthy' && data.database_connected;

  return (
    <div
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        isHealthy
          ? 'bg-[#e1f3ee] border-[#a2d8cb] text-[#06291b]'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isHealthy ? 'bg-[#06291b]' : 'bg-red-500'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isHealthy ? 'bg-[#06291b]' : 'bg-red-600'
          }`}
        />
      </span>
      <ShieldCheck className="w-3.5 h-3.5 text-[#06291b]" />
      <span>{isHealthy ? 'System Active' : 'Service Interrupted'}</span>
    </div>
  );
};


