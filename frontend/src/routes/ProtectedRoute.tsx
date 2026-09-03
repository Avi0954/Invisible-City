import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center space-x-2 text-slate-400">
        <div className="h-5 w-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <span className="text-xs">Authenticating session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-8 text-center space-y-4 my-10 max-w-lg mx-auto">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-900/40 text-red-400">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Admin Authorization Required</h3>
        <p className="text-xs text-red-300/80">
          Your account is registered with the <code className="text-red-200">CITIZEN</code> role. Only administrative municipal personnel can access this area.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
