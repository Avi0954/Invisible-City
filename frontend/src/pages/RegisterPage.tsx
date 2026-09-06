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
    <div className="mx-auto max-w-md space-y-6 pt-6 font-sans text-[#1c1c18]">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e1f3ee] text-[#06291b] border border-[#a2d8cb]">
          <Building2 className="h-6 w-6 text-[#2f685f]" />
        </div>
        <h1 className="text-2xl font-bold text-[#1c1c18] tracking-tight font-headline">Create an Account</h1>
        <p className="text-xs text-[#787770]">Join citizens & local personnel reporting and resolving issues</p>
      </div>

      <div className="rounded-2xl border border-[#e5e2da] bg-[#f1eee7] p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3.5 flex items-start space-x-2.5 text-xs text-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#484742] mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-[#787770]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Resident"
                className="w-full rounded-xl border border-[#d0cdc5] bg-[#fcf9f2] pl-10 pr-4 py-2.5 text-sm text-[#1c1c18] placeholder-[#a3a097] focus:border-[#06291b] focus:outline-none focus:ring-1 focus:ring-[#06291b]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#484742] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#787770]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full rounded-xl border border-[#d0cdc5] bg-[#fcf9f2] pl-10 pr-4 py-2.5 text-sm text-[#1c1c18] placeholder-[#a3a097] focus:border-[#06291b] focus:outline-none focus:ring-1 focus:ring-[#06291b]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#484742] mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#787770]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min 8 characters)"
                className="w-full rounded-xl border border-[#d0cdc5] bg-[#fcf9f2] pl-10 pr-4 py-2.5 text-sm text-[#1c1c18] placeholder-[#a3a097] focus:border-[#06291b] focus:outline-none focus:ring-1 focus:ring-[#06291b]"
                minLength={8}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#484742] mb-1">Account Role</label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setRole('CITIZEN')}
                className={`flex items-center justify-center space-x-2 rounded-xl p-3 text-xs font-semibold border transition-all ${
                  role === 'CITIZEN'
                    ? 'bg-[#06291b] text-white border-[#06291b]'
                    : 'bg-[#fcf9f2] border-[#d0cdc5] text-[#484742] hover:border-[#a3a097]'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Resident</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`flex items-center justify-center space-x-2 rounded-xl p-3 text-xs font-semibold border transition-all ${
                  role === 'ADMIN'
                    ? 'bg-[#06291b] text-white border-[#06291b]'
                    : 'bg-[#fcf9f2] border-[#d0cdc5] text-[#484742] hover:border-[#a3a097]'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Reviewer</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#06291b] hover:bg-[#0a3826] disabled:opacity-50 py-3 text-sm font-semibold text-white shadow-sm transition-all font-headline"
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

        <div className="mt-6 text-center text-xs text-[#787770]">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#06291b] hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

