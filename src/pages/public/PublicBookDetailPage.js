import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { AuthPromptModal } from '../../components/auth/AuthPromptModal';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { ArrowLeft, CheckCircle, Play, Layers, Bookmark, QrCode, Globe, Award, Calendar, } from 'lucide-react';
export const PublicBookDetailPage = () => {
    const { slug } = useParams();
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    useEffect(() => {
        if (slug)
            fetchBookDetail();
    }, [slug]);
    const fetchBookDetail = async () => {
        try {
            setLoading(true);
            const data = await apiFetch(`/books/${slug}`);
            setBook(data.book);
        }
        catch (err) {
            toast(err.message || 'Failed to load book details.', 'error');
        }
        finally {
            setLoading(false);
        }
    };
    const handleToggleBookmark = async () => {
        if (!user) {
            setAuthModalOpen(true);
            return;
        }
        if (!book)
            return;
        try {
            const data = await apiFetch(`/bookmarks/books/${book.id}`, {
                method: 'POST',
            });
            setBook({ ...book, isBookmarked: data.isBookmarked });
            toast(data.message, 'success');
        }
        catch (err) {
            toast('Unable to save bookmark.', 'error');
        }
    };
    if (loading || !book) {
        return (_jsxs("div", { className: "space-y-6 max-w-5xl mx-auto", children: [_jsx(Skeleton, { className: "h-8 w-48" }), _jsx(Skeleton, { className: "h-80 w-full rounded-3xl" }), _jsx(Skeleton, { className: "h-96 w-full rounded-3xl" })] }));
    }
    const completedCount = book.lessons?.filter((l) => l.completed).length || 0;
    const totalCount = book.lessons?.length || 0;
    const progressPercent = book.progressPercent || (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);
    const firstLesson = book.lessons?.[0];
    const nextLesson = book.lessons?.find((l) => !l.completed) || firstLesson;
    return (_jsxs("div", { className: "space-y-8 max-w-5xl mx-auto pb-16", children: [_jsxs(Link, { to: "/books", className: "inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), " Back to Digital Library"] }), _jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8", children: [_jsx("div", { className: "relative h-72 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden shadow-xl shrink-0", children: _jsx("img", { src: book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', alt: book.title, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "md:col-span-2 flex flex-col justify-between space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "brand", children: book.category || 'General' }), book.readingLevel && _jsx(Badge, { variant: "slate", children: book.readingLevel })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: handleToggleBookmark, className: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${book.isBookmarked
                                                                ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                                                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'}`, children: [_jsx(Bookmark, { className: `w-4 h-4 ${book.isBookmarked ? 'fill-white' : ''}` }), book.isBookmarked ? '♥ Saved' : '♡ Save Book'] }), _jsx("button", { onClick: () => setQrModalOpen(true), className: "p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors", title: "QR Code & Share", children: _jsx(QrCode, { className: "w-4 h-4" }) })] })] }), _jsx("h1", { className: "text-2xl sm:text-4xl font-extrabold text-white tracking-tight", children: book.title }), _jsxs("p", { className: "text-sm text-brand-400 font-semibold", children: ["By ", book.author || 'Hopenix Editorial'] }), _jsx("p", { className: "text-sm text-slate-300 leading-relaxed", children: book.description })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-800/80 text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "text-slate-500 block font-medium", children: "Total Lessons" }), _jsxs("span", { className: "font-semibold text-white flex items-center gap-1 mt-0.5", children: [_jsx(Layers, { className: "w-3.5 h-3.5 text-brand-400" }), totalCount, " Lessons"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 block font-medium", children: "Language" }), _jsxs("span", { className: "font-semibold text-white flex items-center gap-1 mt-0.5", children: [_jsx(Globe, { className: "w-3.5 h-3.5 text-brand-400" }), book.language || 'English'] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 block font-medium", children: "Reading Level" }), _jsxs("span", { className: "font-semibold text-white flex items-center gap-1 mt-0.5", children: [_jsx(Award, { className: "w-3.5 h-3.5 text-brand-400" }), book.readingLevel || 'Beginner'] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 block font-medium", children: "Published Year" }), _jsxs("span", { className: "font-semibold text-white flex items-center gap-1 mt-0.5", children: [_jsx(Calendar, { className: "w-3.5 h-3.5 text-brand-400" }), book.publicationYear || '2026'] })] })] }), _jsxs("div", { className: "space-y-3 pt-2", children: [user && (_jsxs("div", { className: "bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1.5", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "font-medium text-slate-300", children: "Your Reading Progress" }), _jsxs("span", { className: "font-bold text-brand-400", children: [progressPercent, "%"] })] }), _jsx("div", { className: "w-full bg-slate-900 rounded-full h-2 overflow-hidden", children: _jsx("div", { className: "bg-brand-500 h-full rounded-full transition-all duration-500", style: { width: `${progressPercent}%` } }) })] })), nextLesson && (_jsxs(Link, { to: `/books/${book.slug}/lessons/${nextLesson.lessonNumber || nextLesson.order}`, className: "inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-2xl transition-all shadow-xl shadow-brand-500/25 w-full sm:w-auto", children: [_jsx("span", { children: user && completedCount > 0 ? 'Continue Reading' : 'Start Reading Lesson 1' }), _jsx(Play, { className: "w-4 h-4 fill-white" })] }))] })] })] }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("h2", { className: "text-xl font-bold text-white flex items-center gap-2", children: [_jsx(Layers, { className: "w-5 h-5 text-brand-400" }), "Book Lessons & Table of Contents (", totalCount, ")"] }), _jsx("span", { className: "text-xs text-slate-400", children: "Publicly readable" })] }), _jsx("div", { className: "space-y-3", children: book.lessons?.map((lesson, idx) => {
                            const lessonNum = lesson.lessonNumber || idx + 1;
                            return (_jsxs(Link, { to: `/books/${book.slug}/lessons/${lessonNum}`, className: "flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:border-brand-500/50 rounded-2xl transition-all duration-200 group", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: `w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${lesson.completed
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-slate-800 text-slate-300 border border-slate-700'}`, children: lesson.completed ? _jsx(CheckCircle, { className: "w-5 h-5" }) : `L${lessonNum}` }), _jsxs("div", { children: [_jsxs("h3", { className: "text-base font-semibold text-white group-hover:text-brand-400 transition-colors", children: ["Lesson ", lessonNum, ": ", lesson.title] }), lesson.description && (_jsx("p", { className: "text-xs text-slate-400 line-clamp-1", children: lesson.description }))] })] }), _jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [lesson.media && lesson.media.length > 0 && (_jsxs("span", { className: "hidden sm:inline-block text-[11px] font-medium text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800", children: [lesson.media.length, " Attachments"] })), _jsx(Button, { variant: "ghost", size: "sm", className: "group-hover:text-brand-400", children: "Read \u2192" })] })] }, lesson.id));
                        }) })] }), _jsx(AuthPromptModal, { isOpen: authModalOpen, onClose: () => setAuthModalOpen(false), title: "Sign In to Save Book", message: "Create a free student account to save books to your bookmarks and sync your reading progress across devices." }), qrModalOpen && (_jsx(QRCodeModal, { isOpen: qrModalOpen, onClose: () => setQrModalOpen(false), courseId: book.id, courseTitle: book.title }))] }));
};
