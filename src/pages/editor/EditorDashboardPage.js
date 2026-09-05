import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { CheckSquare, Edit, Clock, Layers } from 'lucide-react';
export const EditorDashboardPage = () => {
    const [assignedLessons, setAssignedLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchEditorLessons();
    }, []);
    const fetchEditorLessons = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/lessons/editor/assigned');
            setAssignedLessons(data.lessons);
        }
        catch (err) {
            console.error('Failed to load assigned lessons:', err);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-white flex items-center gap-2", children: [_jsx(CheckSquare, { className: "w-6 h-6 text-amber-400" }), "My Assigned Lessons"] }), _jsx("p", { className: "text-sm text-slate-400", children: "Lessons explicitly assigned to your editor account. You can modify rich text content, images, videos, and PDFs for these lessons." })] }), loading ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [...Array(6)].map((_, i) => (_jsx(Skeleton, { className: "h-44 rounded-2xl" }, i))) })) : assignedLessons.length === 0 ? (_jsx(EmptyState, { title: "No lessons assigned", description: "You currently don't have any lessons assigned to you by an administrator.", icon: _jsx(CheckSquare, { className: "w-8 h-8 text-amber-400" }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: assignedLessons.map((lesson) => (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("span", { className: "text-xs font-semibold text-brand-400 flex items-center gap-1", children: [_jsx(Layers, { className: "w-3.5 h-3.5" }), lesson.course?.title || lesson.book?.title || 'Book'] }), _jsx(Badge, { variant: lesson.published ? 'success' : 'slate', size: "sm", children: lesson.published ? 'Published' : 'Draft' })] }), _jsxs("h3", { className: "font-bold text-lg text-white mb-1", children: ["Lesson #", lesson.lessonNumber || lesson.order, ": ", lesson.title] }), lesson.description && (_jsx("p", { className: "text-xs text-slate-400 line-clamp-2", children: lesson.description }))] }), _jsxs("div", { className: "pt-3 border-t border-slate-800 flex items-center justify-between", children: [_jsxs("span", { className: "text-[11px] text-slate-500 flex items-center gap-1", children: [_jsx(Clock, { className: "w-3.5 h-3.5" }), new Date(lesson.updatedAt).toLocaleDateString()] }), _jsxs(Link, { to: `/editor/lessons/${lesson.id}/edit`, className: "inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm", children: [_jsx(Edit, { className: "w-3.5 h-3.5" }), "Edit Content"] })] })] }, lesson.id))) }))] }));
};
