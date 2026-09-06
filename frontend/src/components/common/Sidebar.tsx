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
    { to: '/report', label: 'Report an Issue', icon: PlusCircle },
    { to: '/my-reports', label: 'My Reports', icon: FileText },
    { to: '/map', label: 'Explore Issues', icon: MapPin },
    ...(isAdmin ? [{ to: '/admin', label: 'Review Queue', icon: ShieldCheck }] : []),
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#e5e2da] bg-[#f1eee7] p-4 hidden md:block font-sans text-[#1c1c18]">
      <div className="space-y-6">
        <div>
          <h3 className="px-3 text-xs font-semibold text-[#787770] uppercase tracking-wider font-headline">
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
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#06291b] text-white shadow-sm'
                        : 'text-[#484742] hover:bg-[#e5e2da] hover:text-[#1c1c18]'
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
            <h3 className="px-3 text-xs font-semibold text-[#787770] uppercase tracking-wider font-headline">
              Account
            </h3>
            <nav className="mt-2 space-y-1">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#06291b] text-white shadow-sm'
                      : 'text-[#484742] hover:bg-[#e5e2da] hover:text-[#1c1c18]'
                  }`
                }
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#06291b] text-white shadow-sm'
                      : 'text-[#484742] hover:bg-[#e5e2da] hover:text-[#1c1c18]'
                  }`
                }
              >
                <UserPlus className="h-4 w-4" />
                <span>Register</span>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Product Context Card */}
        <div className="rounded-2xl border border-[#e5e2da] bg-[#fcf9f2] p-4 text-xs text-[#484742]">
          <div className="font-bold text-[#1c1c18] mb-1 font-headline">About Invisible City</div>
          <p className="text-[11px] text-[#787770] leading-relaxed">
            Making local civic issues easier to see, understand, and act on.
          </p>
        </div>

      </div>
    </aside>
  );
};

