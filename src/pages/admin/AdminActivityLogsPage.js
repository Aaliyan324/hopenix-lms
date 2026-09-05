import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { History, Search, ArrowLeft, ArrowRight } from 'lucide-react';
export const AdminActivityLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    useEffect(() => {
        fetchLogs();
    }, [page, search]);
    const fetchLogs = async () => {
        try {
            setLoading(true);
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                search,
            });
            const data = await apiFetch(`/stats/logs?${query.toString()}`);
            setLogs(data.logs);
            setTotalPages(data.pagination.totalPages || 1);
        }
        catch (err) {
            console.error('Failed to load audit logs:', err);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-white flex items-center gap-2", children: [_jsx(History, { className: "w-6 h-6 text-brand-400" }), "System Audit Logbook"] }), _jsx("p", { className: "text-sm text-slate-400", children: "Track important actions including course creation, lesson modifications, file uploads, and user permission changes." })] }), _jsxs("div", { className: "relative max-w-md", children: [_jsx(Search, { className: "w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "text", value: search, onChange: (e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }, placeholder: "Search logs by action or user name...", className: "w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500" })] }), _jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl", children: loading ? (_jsx("div", { className: "p-6 space-y-3", children: [...Array(6)].map((_, i) => (_jsx(Skeleton, { className: "h-12 w-full rounded-xl" }, i))) })) : logs.length === 0 ? (_jsx("p", { className: "text-sm text-slate-500 italic p-12 text-center", children: "No activity log entries found." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider", children: [_jsx("th", { className: "px-6 py-4", children: "User" }), _jsx("th", { className: "px-6 py-4", children: "Action" }), _jsx("th", { className: "px-6 py-4", children: "Entity" }), _jsx("th", { className: "px-6 py-4", children: "Metadata" }), _jsx("th", { className: "px-6 py-4", children: "Date & Time" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800/60 text-xs", children: logs.map((log) => (_jsxs("tr", { className: "hover:bg-slate-800/30 transition-colors", children: [_jsx("td", { className: "px-6 py-4 font-semibold text-white", children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("img", { src: log.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user?.name || 'System'}`, alt: log.user?.name || 'System', className: "w-7 h-7 rounded-full bg-slate-800 object-cover" }), _jsx("span", { children: log.user?.name || 'System' })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx(Badge, { variant: "brand", size: "sm", children: log.action }) }), _jsxs("td", { className: "px-6 py-4 text-slate-300 font-mono", children: [log.entityType, " (", log.entityId || 'N/A', ")"] }), _jsx("td", { className: "px-6 py-4 text-slate-400 max-w-xs truncate font-mono text-[11px]", children: log.metadata || '-' }), _jsx("td", { className: "px-6 py-4 text-slate-400 whitespace-nowrap", children: new Date(log.createdAt).toLocaleString() })] }, log.id))) })] }) })) }), _jsxs("div", { className: "flex items-center justify-between pt-2", children: [_jsxs("p", { className: "text-xs text-slate-400", children: ["Page ", page, " of ", totalPages] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page === 1, className: "p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: page >= totalPages, className: "p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed", children: _jsx(ArrowRight, { className: "w-4 h-4" }) })] })] })] }));
};
