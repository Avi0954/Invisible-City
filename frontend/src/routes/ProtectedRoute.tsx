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
      <div className="flex h-64 items-center justify-center space-x-2 text-[#787770] font-sans">
        <div className="h-5 w-5 rounded-full border-2 border-[#06291b] border-t-transparent animate-spin" />
        <span className="text-xs">Authenticating session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-4 my-10 max-w-lg mx-auto font-sans">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-800">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-[#1c1c18] font-headline">Reviewer Access Required</h3>
        <p className="text-xs text-red-900 leading-relaxed">
          Your account is registered with the resident role. Only municipal reviewers can access this area.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
