import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { BookOpen, FileText, Users, UserCheck, CheckCircle, Eye, Activity, Plus, ArrowUpRight, } from 'lucide-react';
import { Link } from 'react-router-dom';
export const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchDashboardData();
    }, []);
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/stats/dashboard');
            setStats(data.stats);
            setRecentLogs(data.recentLogs);
        }
        catch (err) {
            console.error('Failed to load admin dashboard:', err);
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx(Skeleton, { className: "h-8 w-64" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: [...Array(6)].map((_, i) => (_jsx(Skeleton, { className: "h-32 rounded-2xl" }, i))) })] }));
    }
    const statCards = [
        { label: 'Total Books', value: stats?.totalBooks || stats?.totalCourses || 0, icon: BookOpen, color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
        { label: 'Published Books', value: stats?.publishedBooks || stats?.publishedCourses || 0, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        { label: 'Total Lessons', value: stats?.totalLessons || 0, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
        { label: 'Published Lessons', value: stats?.publishedLessons || 0, icon: Eye, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
        { label: 'Students', value: stats?.totalStudents || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        { label: 'Editors', value: stats?.totalEditors || 0, icon: UserCheck, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    ];
    return (_jsxs("div", { className: "space-y-8 max-w-7xl mx-auto pb-16", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: "E-Book Portal Admin Console" }), _jsx("p", { className: "text-sm text-slate-400", children: "Overview of books catalog, lessons, student progress, and activity logs." })] }), _jsxs(Link, { to: "/admin/books", className: "inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 w-fit", children: [_jsx(Plus, { className: "w-4 h-4" }), "Create New Book"] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: statCards.map((item, idx) => {
                    const Icon = item.icon;
                    return (_jsx(Card, { className: "relative overflow-hidden group", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1", children: item.label }), _jsx("p", { className: "text-3xl font-extrabold text-white", children: item.value })] }), _jsx("div", { className: `p-3 rounded-2xl border ${item.bg} ${item.color} group-hover:scale-110 transition-transform`, children: _jsx(Icon, { className: "w-6 h-6" }) })] }) }, idx));
                }) }), _jsxs("div", { className: "bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "w-5 h-5 text-brand-400" }), _jsx("h3", { className: "text-lg font-semibold text-white", children: "Recent E-Book Activity & Audit Logs" })] }), _jsxs(Link, { to: "/admin/activity-logs", className: "text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1", children: ["View Full Activity Log ", _jsx(ArrowUpRight, { className: "w-3.5 h-3.5" })] })] }), recentLogs.length === 0 ? (_jsx("p", { className: "text-sm text-slate-500 italic p-6 text-center", children: "No activity recorded yet." })) : (_jsx("div", { className: "space-y-3", children: recentLogs.map((log) => (_jsxs("div", { className: "flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: log.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user?.name || 'System'}`, alt: log.user?.name || 'User', className: "w-8 h-8 rounded-full bg-slate-800 object-cover" }), _jsxs("div", { children: [_jsxs("p", { className: "text-xs font-semibold text-white", children: [log.user?.name || 'System', " ", _jsxs("span", { className: "font-normal text-slate-400", children: ["(", log.action, ")"] })] }), _jsxs("p", { className: "text-[11px] text-slate-500", children: ["Target: ", _jsx("span", { className: "text-slate-300", children: log.entityType }), " (", log.entityId || 'N/A', ")"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx(Badge, { variant: "brand", size: "sm", children: log.action }), _jsx("p", { className: "text-[10px] text-slate-500 mt-1", children: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] })] }, log.id))) }))] })] }));
};
