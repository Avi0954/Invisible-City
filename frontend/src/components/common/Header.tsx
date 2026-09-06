import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PlusCircle, LogOut, Menu, X, ArrowRight } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e2ded6] font-sans text-[#191817]">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* LEFT: Logo & Wordmark */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 group focus:outline-none">
            <div className="h-8 w-8 rounded-md bg-[#191817] flex items-center justify-center text-white font-bold font-mono text-xs tracking-wider shadow-xs group-hover:bg-[#d9531e] transition-colors">
              IC
            </div>
            <span className="font-bold text-base text-[#191817] tracking-tight font-headline">
              Invisible City
            </span>
          </Link>
        </div>

        {/* CENTER: Primary Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-medium tracking-wide">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `transition-colors relative py-1 ${
                isActive
                  ? 'text-[#191817] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#d9531e]'
                  : 'text-[#66645e] hover:text-[#191817]'
              }`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/map"
            className={({ isActive }) =>
              `transition-colors relative py-1 ${
                isActive
                  ? 'text-[#191817] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#d9531e]'
                  : 'text-[#66645e] hover:text-[#191817]'
              }`
            }
          >
            Explore
          </NavLink>
          <NavLink
            to="/my-reports"
            className={({ isActive }) =>
              `transition-colors relative py-1 ${
                isActive
                  ? 'text-[#191817] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#d9531e]'
                  : 'text-[#66645e] hover:text-[#191817]'
              }`
            }
          >
            My Reports
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `transition-colors relative py-1 ${
                  isActive
                    ? 'text-[#191817] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#d9531e]'
                    : 'text-[#66645e] hover:text-[#191817]'
                }`
              }
            >
              Review Queue
            </NavLink>
          )}
        </nav>

        {/* RIGHT: Actions & Authentication */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/report"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md bg-[#d9531e] hover:bg-[#c44715] text-white text-xs font-semibold transition-all shadow-xs"
          >
            <span>Report an Issue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-3 border-l border-[#e2ded6] pl-4">
              <span className="text-xs font-medium text-[#191817]">{user?.name}</span>
              <button
                onClick={logout}
                title="Sign Out"
                className="inline-flex items-center space-x-1 text-xs text-[#66645e] hover:text-red-700 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-medium text-[#191817] hover:text-[#d9531e] transition-colors border-l border-[#e2ded6] pl-4"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-2">
          <Link
            to="/report"
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md bg-[#d9531e] text-white text-xs font-semibold"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Report</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-[#191817] hover:bg-[#f3efea] focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e2ded6] bg-[#faf8f5] px-4 pt-3 pb-6 space-y-3 font-sans shadow-md">
          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-xs font-semibold ${
                isActive ? 'bg-[#f3efea] text-[#d9531e]' : 'text-[#474540] hover:bg-[#f3efea]'
              }`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/map"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-xs font-semibold ${
                isActive ? 'bg-[#f3efea] text-[#d9531e]' : 'text-[#474540] hover:bg-[#f3efea]'
              }`
            }
          >
            Explore
          </NavLink>
          <NavLink
            to="/my-reports"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-xs font-semibold ${
                isActive ? 'bg-[#f3efea] text-[#d9531e]' : 'text-[#474540] hover:bg-[#f3efea]'
              }`
            }
          >
            My Reports
          </NavLink>

          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-xs font-semibold ${
                  isActive ? 'bg-[#f3efea] text-[#d9531e]' : 'text-[#474540] hover:bg-[#f3efea]'
                }`
              }
            >
              Review Queue
            </NavLink>
          )}

          <div className="pt-2 border-t border-[#e2ded6] space-y-2">
            <Link
              to="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-md bg-[#d9531e] text-white text-xs font-semibold"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Report an Issue</span>
            </Link>

            {isAuthenticated ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center justify-center space-x-1 w-full py-2 rounded-md border border-[#d6d1c7] text-[#191817] text-xs font-semibold"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out ({user?.name})</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2 rounded-md border border-[#d6d1c7] text-[#191817] text-xs font-semibold"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
