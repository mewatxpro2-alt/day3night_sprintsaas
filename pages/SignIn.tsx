import React, { useState } from 'react';
import { Github, Mail, ArrowRight, Lock } from 'lucide-react';
import Button from '../components/Button';
import { ViewState } from '../types';

interface SignInProps {
  onNavigate: (view: ViewState) => void;
}

const SignIn: React.FC<SignInProps> = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth
    setTimeout(() => {
      setIsLoading(false);
      onNavigate(ViewState.DASHBOARD);
    }, 1500);
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            {isLogin ? 'Welcome back' : 'Start shipping'}
          </h1>
          <p className="text-textMuted">
            {isLogin 
              ? 'Access your saved kits and seller dashboard.' 
              : 'Join 15,000+ founders building with WebCatalog Pro.'}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl">
          <div className="space-y-4 mb-8">
            <button className="w-full h-12 bg-white text-black font-medium rounded-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors">
              <Github size={20} />
              Continue with GitHub
            </button>
            <button className="w-full h-12 bg-[#1A1A1F] text-white border border-white/10 font-medium rounded-lg flex items-center justify-center gap-3 hover:bg-[#25252A] transition-colors">
              <Mail size={20} />
              Continue with Google
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-textMuted">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-textMuted mb-1.5 uppercase tracking-wide">Email</label>
              <input 
                type="email" 
                required
                placeholder="you@startup.com"
                className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-textMuted mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                />
                <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted opacity-50" />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-textMuted">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-white hover:text-accent font-medium transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-textMuted mt-8 opacity-60">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default SignIn;
