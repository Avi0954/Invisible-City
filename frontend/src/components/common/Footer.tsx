import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <footer className="border-t border-[#2d3a33] bg-[#0c1813] py-12 text-xs text-[#a3b3aa]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f685f] text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-[#fcf9f2] tracking-tight font-headline">Invisible City</span>
            </div>
            <p className="text-[#a3b3aa] text-xs leading-relaxed max-w-sm font-sans">
              Making local civic issues easier to see, understand, and act on.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#fcf9f2] text-xs uppercase tracking-wider font-headline">Explore</h4>
            <ul className="space-y-2 text-[#a3b3aa]">
              <li>
                <Link to="/" className="hover:text-[#8ac9be] transition-colors">Overview</Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-[#8ac9be] transition-colors">Explore Issues</Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-[#8ac9be] transition-colors">Report an Issue</Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#fcf9f2] text-xs uppercase tracking-wider font-headline">Account</h4>
            <ul className="space-y-2 text-[#a3b3aa]">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/my-reports" className="hover:text-[#8ac9be] transition-colors">My Reports</Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link to="/admin" className="hover:text-[#8ac9be] transition-colors">Review Queue</Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="hover:text-[#8ac9be] transition-colors">Sign In</Link>
                  </li>
                  <li>
                    <Link to="/register" className="hover:text-[#8ac9be] transition-colors">Register Account</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright Footer Bar */}
        <div className="border-t border-[#1d2a23] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#708278] text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} Invisible City. Community Civic Platform.
          </div>
          <div>
            Connecting neighborhood reports to support better civic responses.
          </div>
        </div>
      </div>
    </footer>
  );
};

