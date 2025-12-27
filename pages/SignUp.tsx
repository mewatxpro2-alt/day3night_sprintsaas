import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';

const SignUp: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        const { error } = await signUp(email, password, fullName);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            // New users default to browse marketplace
            setTimeout(() => navigate('/mvp-kits'), 2000);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] flex items-center justify-center p-6">
                <div className="text-center animate-fade-in">
                    <div className="w-20 h-20 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-black" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Welcome aboard!</h2>
                    <p className="text-textMuted mb-4">Your account has been created successfully.</p>
                    <p className="text-textMuted text-sm">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -right-48 w-96 h-96 bg-accent-primary/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-accent-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Main card */}
            <div className="w-full max-w-md relative z-10">
                {/* Logo/Brand */}
                <div className="text-center mb-8 animate-slide-up">
                    <div className="flex justify-center mb-4">
                        <Logo variant="primary" size="lg" />
                    </div>
                    <p className="text-textMuted text-sm font-medium">
                        Join the premium design marketplace
                    </p>
                </div>

                {/* Sign-up card */}
                <div className="bg-surface/90 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-textMain mb-2">Create account</h2>
                        <p className="text-textMuted text-sm">Start building your next project today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-bold text-textMain mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    className="w-full h-12 pl-12 pr-4 bg-surfaceHighlight border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all font-medium"
                                />
                            </div>
                        </div>

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
                                    placeholder="Create a password"
                                    required
                                    minLength={6}
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

                        {/* Sign up button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-accent-primary hover:bg-accent-primary-dim text-accentFg-primary font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-border text-center">
                        <p className="text-sm text-textMuted">
                            Already have an account?{' '}
                            <Link to="/signin" className="text-accent-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Bottom text */}
                <p className="text-center text-xs text-textMuted/60 mt-6">
                    By creating an account, you agree to our{' '}
                    <Link to="/terms" className="text-accent-primary hover:underline">
                        Terms
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

export default SignUp;
