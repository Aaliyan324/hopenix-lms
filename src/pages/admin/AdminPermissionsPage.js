import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { Key, Check, X, BookOpen } from 'lucide-react';
export const AdminPermissionsPage = () => {
    const { toast } = useToast();
    const [editors, setEditors] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, booksData] = await Promise.all([
                apiFetch('/users?role=EDITOR&limit=100'),
                apiFetch('/books'),
            ]);
            setEditors(usersData.users);
            // Fetch full lesson list for each book
            const booksWithLessons = await Promise.all(booksData.books.map(async (b) => {
                const detail = await apiFetch(`/books/${b.id}`);
                return detail.book;
            }));
            setBooks(booksWithLessons);
        }
        catch (err) {
            toast('Failed to load permission matrix.', 'error');
        }
        finally {
            setLoading(false);
        }
    };
    const togglePermission = async (lessonId, editorId, currentlyAssigned) => {
        try {
            const res = await apiFetch(`/lessons/${lessonId}/editors`);
            let currentIds = res.editors.map((e) => e.id);
            if (currentlyAssigned) {
                currentIds = currentIds.filter((id) => id !== editorId);
            }
            else {
                currentIds.push(editorId);
            }
            await apiFetch(`/lessons/${lessonId}/editors`, {
                method: 'POST',
                body: JSON.stringify({ editorIds: currentIds }),
            });
            toast('Editor lesson permission updated.', 'success');
            fetchData();
        }
        catch (err) {
            toast(err.message || 'Failed to update permission.', 'error');
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "space-y-6 max-w-7xl mx-auto", children: [_jsx(Skeleton, { className: "h-8 w-64" }), _jsx(Skeleton, { className: "h-96 w-full rounded-2xl" })] }));
    }
    return (_jsxs("div", { className: "space-y-8 max-w-7xl mx-auto pb-16", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-white flex items-center gap-2", children: [_jsx(Key, { className: "w-6 h-6 text-brand-400" }), "Editor Lesson Permissions Matrix"] }), _jsx("p", { className: "text-sm text-slate-400", children: "Granularly assign specific editors edit privileges for specific book lessons. Editors can ONLY edit assigned lessons." })] }), _jsx("div", { className: "space-y-6", children: books.map((book) => (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl", children: [_jsxs("div", { className: "px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-4 h-4 text-brand-400" }), book.title] }), _jsxs("p", { className: "text-xs text-slate-400", children: [book.lessons?.length || 0, " Lessons in this book"] })] }), _jsx(Badge, { variant: book.published ? 'success' : 'slate', size: "sm", children: book.published ? 'Published' : 'Draft' })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-slate-900/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider", children: [_jsx("th", { className: "px-6 py-3", children: "Lesson Title" }), editors.map((editor) => (_jsx("th", { className: "px-6 py-3 text-center", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("img", { src: editor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editor.name}`, alt: editor.name, className: "w-6 h-6 rounded-full bg-slate-800 object-cover mb-1" }), _jsx("span", { className: "text-white text-xs", children: editor.name })] }) }, editor.id)))] }) }), _jsx("tbody", { className: "divide-y divide-slate-800/60 text-xs", children: book.lessons?.map((lesson) => (_jsxs("tr", { className: "hover:bg-slate-800/30 transition-colors", children: [_jsxs("td", { className: "px-6 py-3.5 font-medium text-slate-200", children: [_jsxs("span", { className: "font-mono text-brand-400 mr-2", children: ["L", lesson.lessonNumber || lesson.order] }), lesson.title] }), editors.map((editor) => {
                                                    const isAssigned = lesson.permissions?.some((p) => p.userId === editor.id) || false;
                                                    return (_jsx("td", { className: "px-6 py-3.5 text-center", children: _jsx("button", { onClick: () => togglePermission(lesson.id, editor.id, isAssigned), className: `inline-flex items-center justify-center w-7 h-7 rounded-lg border transition-all cursor-pointer ${isAssigned
                                                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30'
                                                                : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400 hover:border-slate-700'}`, title: isAssigned ? 'Revoke Edit Permission' : 'Grant Edit Permission', children: isAssigned ? _jsx(Check, { className: "w-4 h-4" }) : _jsx(X, { className: "w-3.5 h-3.5" }) }) }, editor.id));
                                                })] }, lesson.id))) })] }) })] }, book.id))) })] }));
};
