import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User as UserIcon, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface-container-lowest border-b border-surface-container-highest">
      <div className="h-16 max-w-max-width-content mx-auto px-margin-mobile lg:px-margin-desktop flex items-center justify-between gap-space-lg">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-space-md">
          <Link to="/" className="flex items-center gap-space-sm group focus:outline-none">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-on-primary font-bold font-headline-sm">
              IC
            </div>
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-semibold">
              Invisible City
            </span>
          </Link>
          <span className="hidden sm:inline-flex items-center px-space-xs py-space-2xs bg-surface-container-high rounded-lg text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider font-semibold border border-outline-variant/40">
            Civic Intelligence
          </span>
        </div>

        {/* Center Nav Navigation */}
        <nav className="hidden md:flex items-center gap-space-lg h-full">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? 'inline-flex items-center h-full px-space-2xs text-primary font-semibold border-b-2 border-primary'
                : 'inline-flex items-center h-full px-space-2xs text-on-surface-variant font-title-md text-title-md transition-colors hover:text-on-surface'
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/map"
            className={({ isActive }) =>
              isActive
                ? 'inline-flex items-center h-full px-space-2xs text-primary font-semibold border-b-2 border-primary'
                : 'inline-flex items-center h-full px-space-2xs text-on-surface-variant font-title-md text-title-md transition-colors hover:text-on-surface'
            }
          >
            Explore
          </NavLink>
          <NavLink
            to="/report"
            className={({ isActive }) =>
              isActive
                ? 'inline-flex items-center h-full px-space-2xs text-primary font-semibold border-b-2 border-primary'
                : 'inline-flex items-center h-full px-space-2xs text-on-surface-variant font-title-md text-title-md transition-colors hover:text-on-surface'
            }
          >
            Report an Issue
          </NavLink>
          <NavLink
            to="/my-reports"
            className={({ isActive }) =>
              isActive
                ? 'inline-flex items-center h-full px-space-2xs text-primary font-semibold border-b-2 border-primary'
                : 'inline-flex items-center h-full px-space-2xs text-on-surface-variant font-title-md text-title-md transition-colors hover:text-on-surface'
            }
          >
            My Reports
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive
                  ? 'inline-flex items-center h-full px-space-2xs text-primary font-semibold border-b-2 border-primary'
                  : 'inline-flex items-center h-full px-space-2xs text-on-surface-variant font-title-md text-title-md transition-colors hover:text-on-surface'
              }
            >
              Admin Triage
            </NavLink>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-space-sm">
          <Link
            to="/report"
            className="hidden sm:inline-flex items-center justify-center h-10 px-space-md bg-primary-container text-on-primary rounded-lg font-title-md text-title-md transition-colors hover:bg-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
          >
            <span className="material-symbols-outlined text-[18px] mr-space-xs">add_circle</span>
            <span>Report an Issue</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-space-xs">
              <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-surface-container rounded-lg border border-surface-container-highest">
                <span className="text-xs font-semibold text-on-surface">{user?.name}</span>
                <span className="text-[10px] font-mono text-primary font-bold uppercase">{user?.role}</span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="inline-flex items-center justify-center h-10 px-space-sm text-on-surface-variant font-title-md text-title-md rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center h-10 px-space-sm text-on-surface font-title-md text-title-md rounded-lg hover:bg-surface-container transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

