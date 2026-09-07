import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { LogIn, Mail, Lock, Building2, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      toast.success('Signed in successfully.');
      navigate('/');
    } catch (err: any) {
      const errMsg = err.message || 'Failed to sign in. Please check your credentials.';
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
              Sign In to Invisible City
            </h1>
            <p className="text-sm text-[#484742] leading-relaxed">
              Access your reported civic issues, monitor community pattern updates, and follow resolution progress.
            </p>
          </div>

          <div className="space-y-3 pt-2 text-xs text-[#787770]">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-[#2f685f]" />
              <span>Track neighborhood submissions in real time</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-[#2f685f]" />
              <span>Privacy-first, community-verified civic platform</span>
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
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                required
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={loading}
                leftIcon={<LogIn className="h-4 w-4" />}
              >
                Sign In
              </Button>
            </form>

            <div className="text-center text-xs text-[#787770] pt-2 border-t border-[#e5e2da]">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-[#06291b] hover:underline">
                Register here
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
