import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Footer: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <footer className="border-t border-[#e2ded6] bg-[#f3efea] py-12 text-xs text-[#66645e] font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#191817] text-white font-mono text-xs font-bold">
                IC
              </div>
              <span className="text-base font-bold text-[#191817] tracking-tight font-headline">Invisible City</span>
            </div>
            <p className="text-[#66645e] text-xs leading-relaxed max-w-sm">
              Connecting community reports to uncover root infrastructure patterns before small issues become major failures.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#191817] text-[11px] uppercase tracking-wider font-mono">Explore</h4>
            <ul className="space-y-2 text-[#66645e]">
              <li>
                <Link to="/" className="hover:text-[#d9531e] transition-colors">Overview</Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-[#d9531e] transition-colors">Explore Map</Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-[#d9531e] transition-colors">Report an Issue</Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#191817] text-[11px] uppercase tracking-wider font-mono">Account</h4>
            <ul className="space-y-2 text-[#66645e]">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/my-reports" className="hover:text-[#d9531e] transition-colors">My Reports</Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link to="/admin" className="hover:text-[#d9531e] transition-colors">Review Queue</Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="hover:text-[#d9531e] transition-colors">Sign In</Link>
                  </li>
                  <li>
                    <Link to="/register" className="hover:text-[#d9531e] transition-colors">Register Account</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright Footer Bar */}
        <div className="border-t border-[#e2ded6] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#66645e] text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} Invisible City. Civic Information Infrastructure.
          </div>
          <div>
            Small problems can reveal bigger problems.
          </div>
        </div>
      </div>
    </footer>
  );
};
