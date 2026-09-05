import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { BookOpen, Shield, Edit3, GraduationCap, Lock, Mail, ArrowRight } from 'lucide-react';
export const LoginPage = () => {
    const { login } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast('Please enter both email and password.', 'error');
            return;
        }
        try {
            setLoading(true);
            const user = await login(email, password);
            toast(`Welcome back, ${user.name}!`, 'success');
            if (user.role === 'ADMIN')
                navigate('/admin');
            else if (user.role === 'EDITOR')
                navigate('/editor');
            else
                navigate('/student');
        }
        catch (err) {
            toast(err.message || 'Login failed. Please check your credentials.', 'error');
        }
        finally {
            setLoading(false);
        }
    };
    const fillDemo = (demoEmail, demoPass) => {
        setEmail(demoEmail);
        setPassword(demoPass);
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden", children: [_jsx("div", { className: "absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" }), _jsx("div", { className: "absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "w-full max-w-md space-y-8 z-10", children: [_jsxs("div", { className: "text-center space-y-3", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-500 shadow-xl shadow-brand-500/30 mb-2", children: _jsx(BookOpen, { className: "w-8 h-8 text-white" }) }), _jsx("h1", { className: "text-3xl font-extrabold text-white tracking-tight", children: "Hopenix LMS Portal" }), _jsx("p", { className: "text-sm text-slate-400", children: "Enterprise Course & Lesson Management System" })] }), _jsxs("div", { className: "bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6", children: [_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2", children: "Email Address" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "name@example.com", className: "w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors", required: true })] })] }), _jsx(Button, { type: "submit", variant: "primary", size: "lg", className: "w-full mt-2", loading: loading, icon: _jsx(ArrowRight, { className: "w-5 h-5" }), children: "Sign In to Portal" })] }), _jsxs("div", { className: "pt-4 border-t border-slate-800 space-y-3", children: [_jsx("p", { className: "text-xs font-semibold text-slate-400 text-center uppercase tracking-wider", children: "Quick Test Personas" }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsxs("button", { type: "button", onClick: () => fillDemo('admin@example.com', 'admin123'), className: "flex flex-col items-center justify-center p-2.5 bg-slate-950 border border-slate-800 hover:border-brand-500/50 rounded-xl text-xs text-slate-300 hover:text-white transition-all group cursor-pointer", children: [_jsx(Shield, { className: "w-4 h-4 text-brand-400 mb-1 group-hover:scale-110 transition-transform" }), _jsx("span", { className: "font-semibold", children: "Admin" })] }), _jsxs("button", { type: "button", onClick: () => fillDemo('editor1@example.com', 'password123'), className: "flex flex-col items-center justify-center p-2.5 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl text-xs text-slate-300 hover:text-white transition-all group cursor-pointer", children: [_jsx(Edit3, { className: "w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" }), _jsx("span", { className: "font-semibold", children: "Editor" })] }), _jsxs("button", { type: "button", onClick: () => fillDemo('student1@example.com', 'password123'), className: "flex flex-col items-center justify-center p-2.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-xs text-slate-300 hover:text-white transition-all group cursor-pointer", children: [_jsx(GraduationCap, { className: "w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" }), _jsx("span", { className: "font-semibold", children: "Student" })] })] })] })] })] })] }));
};
