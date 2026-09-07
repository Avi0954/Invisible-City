import React, { useState, useEffect } from 'react';
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

  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      toast.success('Signed in successfully.');
    } catch (err: any) {
      const errMsg = typeof err === 'string' ? err : err.message || 'Failed to sign in. Please check your credentials.';
      setError(errMsg);
      toast.error(errMsg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 min-h-[calc(100vh-4.5rem)] flex items-center justify-center font-sans text-[#1c1c18]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-center w-full">
        {/* Left Column: Product Branding & Narrative */}
        <div className="md:col-span-6 space-y-6 lg:pr-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#06291b] text-[#8ac9be] shadow-xs">
            <Building2 className="h-7 w-7" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1c1c18] tracking-tight font-headline">
              Sign In to Invisible City
            </h1>
            <p className="text-sm text-[#484742] leading-relaxed">
              Access your reported civic issues, monitor community pattern updates, and follow resolution progress across your neighborhood.
            </p>
          </div>

          <div className="space-y-3 pt-2 text-xs text-[#787770]">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#2f685f] flex-shrink-0" />
              <span>Track neighborhood submissions and verified responses</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="h-4 w-4 text-[#2f685f] flex-shrink-0" />
              <span>Privacy-first, community-verified civic intelligence</span>
            </div>
          </div>
        </div>

        {/* Right Column: Form Card */}
        <div className="md:col-span-6">
          <Card variant="container" className="shadow-xs p-6 sm:p-8 space-y-6">
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
