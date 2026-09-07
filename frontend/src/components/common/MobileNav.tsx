import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  PlusCircle,
  FileText,
  Home,
  ShieldCheck
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { isAdmin } = useAuth();

  const navItems = [
    { to: '/', label: 'Overview', icon: Home },
    { to: '/map', label: 'Explore', icon: Compass },
    { to: '/report', label: 'Report', icon: PlusCircle },
    { to: '/my-reports', label: 'My Reports', icon: FileText },
    ...(isAdmin ? [{ to: '/admin', label: 'Review', icon: ShieldCheck }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#fcf9f2]/95 backdrop-blur-lg border-t border-[#e5e2da] md:hidden px-2 py-1.5 shadow-lg font-sans">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-all ${
                  isActive
                    ? 'text-[#06291b] bg-[#e1f3ee] border border-[#a2d8cb]'
                    : 'text-[#787770] hover:text-[#1c1c18]'
                }`
              }
            >
              <Icon className="h-4 w-4 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
