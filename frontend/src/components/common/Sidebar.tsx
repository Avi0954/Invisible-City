import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  MapPin,
  ShieldCheck,
  UserPlus,
  LogIn
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/report', label: 'Report Issue', icon: PlusCircle },
    { to: '/my-reports', label: 'My Reports', icon: FileText },
    { to: '/map', label: 'Spatial Map', icon: MapPin },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin Triage', icon: ShieldCheck }] : []),
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800/80 bg-slate-950/60 p-4 hidden md:block">
      <div className="space-y-6">
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Navigation
          </h3>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {!isAuthenticated && (
          <div>
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Account
            </h3>
            <nav className="mt-2 space-y-1">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`
                }
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`
                }
              >
                <UserPlus className="h-4 w-4" />
                <span>Register</span>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Hackathon Badge Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 text-xs text-slate-400">
          <div className="font-semibold text-slate-200 mb-1">Invisible City Monolith</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Connecting isolated urban complaints into actionable macro insights with AI & location intelligence.
          </p>
        </div>
      </div>
    </aside>
  );
};
