import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { BookOpen, Lock, Mail, ArrowRight, Eye, EyeOff, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please enter both email and password.', 'error');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      toast(`Welcome back, ${user.name}`, 'success');

      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'EDITOR') navigate('/editor');
      else navigate('/login');
    } catch (err: any) {
      toast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-orange-50 to-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow and subtle accent elements */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top Left Floating Brand (matching the reference layout) */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20 flex items-center gap-2">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-600 text-white shadow-md">
          <BookOpen className="w-5 h-5 fill-current" />
        </div>
        <span className="font-serif text-xl font-bold text-slate-900 tracking-tight">
          Hopenix<span className="text-orange-600">.</span>
        </span>
      </div>

      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-md bg-white/85 backdrop-blur-xl border border-orange-100 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(249,115,22,0.08)] relative z-10 space-y-6">
        
        {/* Header Icon & Titles */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-50 shadow-sm border border-orange-100/60 mb-1 text-orange-600">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">
            Sign in with email
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Access the editorial portal to bring your words, data, and teams together securely.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="sr-only">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-11 pr-4 py-3 bg-orange-50/30 border border-slate-200/80 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="sr-only">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-11 pr-11 py-3 bg-orange-50/30 border border-slate-200/80 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3.5 rounded-2xl shadow-lg shadow-orange-600/20 transition-all duration-200 active:scale-[0.99]"
              loading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </div>
        </form>

        {/* Footer info text */}
        <p className="text-center text-[11px] text-slate-400 pt-2">
          Protected editorial portal. Authorized staff only.
        </p>
      </div>
    </div>
  );
};