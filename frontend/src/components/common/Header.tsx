import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HealthBadge } from './HealthBadge';
import { Building2, PlusCircle, LogIn, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              Invisible City
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80">
              Build With Bharat 2.0
            </span>
          </div>
        </Link>

        {/* Center/Right Nav & Actions */}
        <div className="flex items-center space-x-4">
          <HealthBadge />

          {isAuthenticated ? (
            <>
              <Link
                to="/report"
                className="hidden sm:inline-flex items-center space-x-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-cyan-900/40 transition-all hover:shadow-cyan-600/30"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Report Problem</span>
              </Link>

              {/* User Profile Badge */}
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
                    {user?.role === 'ADMIN' ? <ShieldCheck className="h-4 w-4 text-cyan-300" /> : <UserIcon className="h-4 w-4" />}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-semibold text-white leading-tight">{user?.name}</div>
                    <div className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider">{user?.role}</div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-sm font-medium text-slate-200 transition-colors"
            >
              <LogIn className="h-4 w-4 text-slate-400" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
