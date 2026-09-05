import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-10 text-xs text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-600 text-white font-bold">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">Invisible City</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Making civic issues visible through community reports and connected signals. Report what you see, understand what connects, and help your city act.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition-colors">Overview</Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-cyan-400 transition-colors">Spatial Map</Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-cyan-400 transition-colors">Report an Issue</Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link to="/my-reports" className="hover:text-cyan-400 transition-colors">My Reports</Link>
                </li>
              )}
            </ul>
          </div>

          {/* Account / Admin Links */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Account</h4>
            <ul className="space-y-2 text-slate-400">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <li>
                      <Link to="/admin" className="hover:text-cyan-400 transition-colors">Admin Dashboard</Link>
                    </li>
                  )}
                  <li>
                    <Link to="/my-reports" className="hover:text-cyan-400 transition-colors">Registered Profile</Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="hover:text-cyan-400 transition-colors">Sign In</Link>
                  </li>
                  <li>
                    <Link to="/register" className="hover:text-cyan-400 transition-colors">Register Account</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright Footer Bar */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} Invisible City. All rights reserved.
          </div>
          <div className="text-slate-500">
            Civic Intelligence & Urban Pattern Detection
          </div>
        </div>
      </div>
    </footer>
  );
};
