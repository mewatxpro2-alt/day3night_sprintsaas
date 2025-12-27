import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserRole } from '../hooks/useUserRole';
import Logo from '../components/Logo';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, isAuthenticated } = useAuth();
  const { hasSellerActivity, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated with smart routing
  React.useEffect(() => {
    if (isAuthenticated && !roleLoading) {
      const from = (location.state as any)?.from;
      const destination = from || (hasSellerActivity ? '/seller' : '/mvp-kits');
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, roleLoading, hasSellerActivity, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Navigation will be handled by useEffect after auth state updates
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-accent-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-tertiary/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="flex justify-center mb-4">
            <Logo variant="primary" size="lg" />
          </div>
          <p className="text-textMuted text-sm font-medium">
            Access your curated design marketplace
          </p>
        </div>

        {/* Sign-in card */}
        <div className="bg-surface/90 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-textMain mb-2">Welcome back</h2>
            <p className="text-textMuted text-sm">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label className="block text-sm font-bold text-textMain mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-12 pl-12 pr-4 bg-surfaceHighlight border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-bold text-textMain mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-12 pl-12 pr-12 bg-surfaceHighlight border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-fade-in">
                <p className="text-red-500 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-accent-primary hover:bg-accent-primary-dim text-accentFg-primary font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <Link
                to="/signup"
                className="text-textMuted hover:text-accent-primary transition-colors font-medium"
              >
                Create account
              </Link>
              <Link
                to="/forgot-password"
                className="text-textMuted hover:text-accent-primary transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-xs text-textMuted/60 mt-6">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-accent-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-accent-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
