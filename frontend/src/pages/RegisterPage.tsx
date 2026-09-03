import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import { UserPlus, User, Mail, Lock, Building2, ShieldCheck, AlertTriangle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CITIZEN');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({ name, email, password, role });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 pt-6">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
          <Building2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Create an Account</h1>
        <p className="text-xs text-slate-400">Join citizens & municipal personnel improving city infrastructure</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm">
        {error && (
          <div className="mb-4 rounded-xl border border-red-800/80 bg-red-950/60 p-3.5 flex items-start space-x-2.5 text-xs text-red-300">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Citizen"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min 8 characters)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                minLength={8}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Account Role</label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setRole('CITIZEN')}
                className={`flex items-center justify-center space-x-2 rounded-xl p-3 text-xs font-semibold border transition-all ${
                  role === 'CITIZEN'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Citizen</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`flex items-center justify-center space-x-2 rounded-xl p-3 text-xs font-semibold border transition-all ${
                  role === 'ADMIN'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-950/80 transition-all"
          >
            {loading ? (
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-cyan-400 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
