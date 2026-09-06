import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { BookOpen, Shield, Edit3, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      toast(`Welcome back, ${user.name}! ✨`, 'success');

      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'EDITOR') navigate('/editor');
      else navigate('/login');
    } catch (err: any) {
      toast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 via-purple-600 to-pink-500 shadow-2xl shadow-brand-500/40 mb-2 border border-pink-400/30 animate-float">
            <BookOpen className="w-8 h-8 text-white fill-current" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Hopenix<span className="text-pink-500">.</span>
          </h1>
          <p className="text-sm font-medium text-slate-300">
            Welcome to your magical reading adventure
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-900/90 border border-purple-500/25 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-brand-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950/80 border border-purple-500/20 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/20 rounded-2xl text-white placeholder-slate-500 text-sm font-medium focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-brand-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950/80 border border-purple-500/20 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/20 rounded-2xl text-white placeholder-slate-500 text-sm font-medium focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="playful"
              size="lg"
              className="w-full mt-2 rounded-2xl"
              loading={loading}
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Sign In to Adventure
            </Button>
          </form>

          {/* Quick Fill Demo Personas */}
          <div className="pt-5 border-t border-purple-500/20 space-y-3">
            <p className="text-xs font-extrabold text-slate-400 text-center uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Quick Demo Personas
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillDemo('admin@example.com', 'password123')}
                className="flex flex-col items-center p-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-2xl transition-all text-center group"
              >
                <Shield className="w-5 h-5 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white">Admin</span>
                <span className="text-[10px] text-slate-400">Full Access</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('editor1@example.com', 'password123')}
                className="flex flex-col items-center p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl transition-all text-center group"
              >
                <Edit3 className="w-5 h-5 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white">Editor</span>
                <span className="text-[10px] text-slate-400">Content Editor</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
