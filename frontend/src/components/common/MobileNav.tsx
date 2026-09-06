import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  MapPin,
  ShieldCheck
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { isAdmin } = useAuth();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/report', label: 'Report', icon: PlusCircle },
    { to: '/my-reports', label: 'My Reports', icon: FileText },
    { to: '/map', label: 'Explore', icon: MapPin },
    ...(isAdmin ? [{ to: '/admin', label: 'Review', icon: ShieldCheck }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c1813]/95 backdrop-blur-lg border-t border-[#2d3a33] md:hidden px-2 py-1.5 shadow-lg font-sans">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-medium transition-all ${
                  isActive ? 'text-[#fcf9f2] font-semibold bg-[#2f685f]/30' : 'text-[#a3b3aa] hover:text-[#fcf9f2]'
                }`
              }
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

