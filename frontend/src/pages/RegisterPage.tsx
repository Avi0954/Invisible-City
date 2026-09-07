import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { UserPlus, User, Mail, Lock, Building2, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CITIZEN');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({ name, email, password, role });
      toast.success('Account created successfully.');
      navigate('/');
    } catch (err: any) {
      const errMsg = err.message || 'Registration failed. Please check your inputs.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 font-sans text-[#1c1c18]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Product Branding & Narrative */}
        <div className="md:col-span-6 space-y-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#06291b] text-[#8ac9be] shadow-xs">
            <Building2 className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-[#1c1c18] tracking-tight font-headline">
              Create an Account
            </h1>
            <p className="text-sm text-[#484742] leading-relaxed">
              Join residents and municipal personnel reporting and resolving infrastructure issues across your community.
            </p>
          </div>

          <div className="space-y-3 pt-2 text-xs text-[#787770]">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-[#2f685f]" />
              <span>Report issues in under a minute</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-[#2f685f]" />
              <span>Participate in transparent civic responses</span>
            </div>
          </div>
        </div>

        {/* Right Column: Form Card */}
        <div className="md:col-span-6">
          <Card variant="container" className="shadow-sm space-y-6">
            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-3.5 flex items-start space-x-2.5 text-xs text-red-800 font-semibold">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Resident"
                leftIcon={<User className="h-4 w-4" />}
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="resident@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min 8 characters)"
                leftIcon={<Lock className="h-4 w-4" />}
                minLength={8}
                required
              />

              {/* Human-facing Account Role Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#484742]">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('CITIZEN')}
                    className={`flex items-center justify-center space-x-2 rounded-xl p-3 text-xs font-semibold border transition-all ${
                      role === 'CITIZEN'
                        ? 'bg-[#06291b] text-white border-[#06291b] shadow-xs'
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
                        ? 'bg-[#06291b] text-white border-[#06291b] shadow-xs'
                        : 'bg-[#fcf9f2] border-[#d0cdc5] text-[#484742] hover:border-[#a3a097]'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Reviewer</span>
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={loading}
                leftIcon={<UserPlus className="h-4 w-4" />}
              >
                Create Account
              </Button>
            </form>

            <div className="text-center text-xs text-[#787770] pt-2 border-t border-[#e5e2da]">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-[#06291b] hover:underline">
                Sign In here
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
