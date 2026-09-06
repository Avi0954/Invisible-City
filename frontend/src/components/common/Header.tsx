import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, PlusCircle, LogOut, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#fcf9f2]/95 backdrop-blur-md border-b border-[#e5e2da] font-sans text-[#1c1c18]">
      <div className="h-16 sm:h-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* LEFT: Logo & Wordmark */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2.5 group focus:outline-none">
            <div className="h-9 w-9 rounded-xl bg-[#06291b] flex items-center justify-center text-white font-bold font-headline shadow-sm group-hover:bg-[#0a3826] transition-colors">
              <Building2 className="h-5 w-5 text-[#8ac9be]" />
            </div>
            <span className="font-bold text-lg text-[#1c1c18] tracking-tight font-headline">
              Invisible City
            </span>
          </Link>
        </div>

        {/* CENTER: Primary Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-xs font-semibold tracking-wide transition-colors ${
                isActive ? 'text-[#06291b] border-b-2 border-[#06291b] pb-1' : 'text-[#787770] hover:text-[#1c1c18]'
              }`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/map"
            className={({ isActive }) =>
              `text-xs font-semibold tracking-wide transition-colors ${
                isActive ? 'text-[#06291b] border-b-2 border-[#06291b] pb-1' : 'text-[#787770] hover:text-[#1c1c18]'
              }`
            }
          >
            Explore
          </NavLink>
          <NavLink
            to="/my-reports"
            className={({ isActive }) =>
              `text-xs font-semibold tracking-wide transition-colors ${
                isActive ? 'text-[#06291b] border-b-2 border-[#06291b] pb-1' : 'text-[#787770] hover:text-[#1c1c18]'
              }`
            }
          >
            My Reports
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-xs font-semibold tracking-wide transition-colors ${
                  isActive ? 'text-[#06291b] border-b-2 border-[#06291b] pb-1' : 'text-[#787770] hover:text-[#1c1c18]'
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
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#06291b] hover:bg-[#0a3826] text-white text-xs font-semibold transition-all shadow-sm font-headline"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Report an Issue</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-3 border-l border-[#e5e2da] pl-4">
              <span className="text-xs font-semibold text-[#1c1c18]">{user?.name}</span>
              <button
                onClick={logout}
                title="Sign Out"
                className="inline-flex items-center space-x-1 text-xs text-[#787770] hover:text-red-700 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-semibold text-[#1c1c18] hover:text-[#06291b] transition-colors border-l border-[#e5e2da] pl-4"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-2">
          <Link
            to="/report"
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#06291b] text-white text-xs font-semibold"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Report</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#1c1c18] hover:bg-[#f1eee7] focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e5e2da] bg-[#fcf9f2] px-4 pt-3 pb-6 space-y-3 font-sans shadow-lg">
          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive ? 'bg-[#e1f3ee] text-[#06291b]' : 'text-[#484742] hover:bg-[#f1eee7]'
              }`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/map"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive ? 'bg-[#e1f3ee] text-[#06291b]' : 'text-[#484742] hover:bg-[#f1eee7]'
              }`
            }
          >
            Explore Issues
          </NavLink>
          <NavLink
            to="/my-reports"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive ? 'bg-[#e1f3ee] text-[#06291b]' : 'text-[#484742] hover:bg-[#f1eee7]'
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
                `block px-3 py-2 rounded-xl text-sm font-semibold ${
                  isActive ? 'bg-[#e1f3ee] text-[#06291b]' : 'text-[#484742] hover:bg-[#f1eee7]'
                }`
              }
            >
              Review Queue
            </NavLink>
          )}

          <div className="pt-2 border-t border-[#e5e2da] space-y-2">
            <Link
              to="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-[#06291b] text-white text-xs font-semibold shadow-sm font-headline"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Report an Issue</span>
            </Link>

            {isAuthenticated ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center justify-center space-x-1 w-full py-2 rounded-xl border border-[#d0cdc5] text-[#1c1c18] text-xs font-semibold"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out ({user?.name})</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2 rounded-xl border border-[#d0cdc5] text-[#1c1c18] text-xs font-semibold"
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
