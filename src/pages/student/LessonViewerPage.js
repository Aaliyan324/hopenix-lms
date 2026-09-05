import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Play, Image as ImageIcon, Video as VideoIcon, FileText, ExternalLink, X, Layers, } from 'lucide-react';
export const LessonViewerPage = () => {
    const { courseSlug, lessonSlug } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [lesson, setLesson] = useState(null);
    const [navigation, setNavigation] = useState({});
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [savingProgress, setSavingProgress] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    useEffect(() => {
        if (lessonSlug)
            fetchLessonContent();
    }, [lessonSlug]);
    const fetchLessonContent = async () => {
        try {
            setLoading(true);
            // Find course by slug first to get courseId
            const courseData = await apiFetch(`/courses/${courseSlug}`);
            const matchedLesson = courseData.course.lessons.find((l) => l.slug === lessonSlug);
            if (!matchedLesson) {
                toast('Lesson not found.', 'error');
                setLoading(false);
                return;
            }
            const lessonData = await apiFetch(`/lessons/${matchedLesson.id}`);
            setLesson(lessonData.lesson);
            setNavigation(lessonData.navigation);
            setCompleted(Boolean(lessonData.lesson.completed));
        }
        catch (err) {
            toast(err.message || 'Failed to load lesson content.', 'error');
        }
        finally {
            setLoading(false);
        }
    };
    const toggleCompleteStatus = async () => {
        if (!lesson)
            return;
        try {
            setSavingProgress(true);
            const newStatus = !completed;
            await apiFetch(`/progress/${lesson.id}`, {
                method: 'POST',
                body: JSON.stringify({ completed: newStatus }),
            });
            setCompleted(newStatus);
            toast(newStatus ? 'Lesson marked as completed! 🎉' : 'Lesson marked as uncompleted.', 'success');
        }
        catch (err) {
            toast('Failed to update progress.', 'error');
        }
        finally {
            setSavingProgress(false);
        }
    };
    if (loading || !lesson) {
        return (_jsxs("div", { className: "space-y-6 max-w-6xl mx-auto", children: [_jsx(Skeleton, { className: "h-8 w-64" }), _jsx(Skeleton, { className: "h-[600px] w-full rounded-3xl" })] }));
    }
    const imageMedia = lesson.media?.filter((m) => m.type === 'IMAGE') || [];
    const videoMedia = lesson.media?.filter((m) => m.type === 'VIDEO') || [];
    const pdfMedia = lesson.media?.filter((m) => m.type === 'PDF') || [];
    return (_jsxs("div", { className: "flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto pb-12", children: [_jsxs("div", { className: "flex-1 space-y-8 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-4", children: [_jsxs(Link, { to: `/courses/${courseSlug}`, className: "inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), " Back to Syllabus"] }), _jsxs("button", { onClick: () => setSidebarOpen(!sidebarOpen), className: "lg:hidden flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl", children: [_jsx(Layers, { className: "w-4 h-4" }), " Syllabus Sidebar"] })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs font-mono font-semibold text-brand-400", children: ["Lesson #", lesson.order] }), _jsx(Button, { variant: completed ? 'secondary' : 'primary', size: "sm", onClick: toggleCompleteStatus, loading: savingProgress, icon: _jsx(CheckCircle, { className: `w-4 h-4 ${completed ? 'text-emerald-400' : ''}` }), children: completed ? 'Completed ✓' : 'Mark as Completed' })] }), _jsx("h1", { className: "text-2xl sm:text-4xl font-extrabold text-white", children: lesson.title }), lesson.description && (_jsx("p", { className: "text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3", children: lesson.description }))] }), videoMedia.length > 0 && (_jsxs("div", { className: "space-y-3", children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(VideoIcon, { className: "w-5 h-5 text-brand-400" }), "Video Lecture"] }), videoMedia.map((v) => (_jsxs("div", { className: "bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl", children: [_jsx("video", { src: v.url, controls: true, className: "w-full max-h-[500px] object-contain bg-black" }), _jsxs("div", { className: "p-3 bg-slate-900 border-t border-slate-800 text-xs font-medium text-slate-300 flex items-center justify-between", children: [_jsx("span", { children: v.name }), _jsx("a", { href: v.url, target: "_blank", rel: "noreferrer", className: "text-brand-400 hover:underline", children: "Download Video" })] })] }, v.id)))] })), lesson.content && (_jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl", children: _jsx("div", { className: "prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-brand-400 prose-code:bg-slate-950 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800", dangerouslySetInnerHTML: { __html: lesson.content } }) })), imageMedia.length > 0 && (_jsxs("div", { className: "space-y-3", children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(ImageIcon, { className: "w-5 h-5 text-brand-400" }), "Lesson Diagrams & Visuals"] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: imageMedia.map((img) => (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-2", children: [_jsx("img", { src: img.url, alt: img.name, className: "w-full h-48 object-cover rounded-xl" }), _jsx("p", { className: "text-xs font-medium text-slate-300 p-2 truncate", children: img.name })] }, img.id))) })] })), pdfMedia.length > 0 && (_jsxs("div", { className: "space-y-3", children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5 text-rose-400" }), "PDF Reference Materials"] }), _jsx("div", { className: "space-y-3", children: pdfMedia.map((pdf) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(FileText, { className: "w-8 h-8 text-rose-400 shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-white truncate max-w-sm", children: pdf.name }), _jsx("p", { className: "text-xs text-slate-400", children: "PDF Document" })] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("a", { href: pdf.url, target: "_blank", rel: "noopener noreferrer", className: "px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors", children: [_jsx(ExternalLink, { className: "w-3.5 h-3.5" }), " Open PDF"] }) })] }, pdf.id))) })] })), _jsxs("div", { className: "flex items-center justify-between pt-6 border-t border-slate-800", children: [navigation.prevLesson ? (_jsxs(Link, { to: `/courses/${courseSlug}/lessons/${navigation.prevLesson.slug}`, className: "inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-xs font-semibold text-slate-200 transition-colors", children: [_jsx(ChevronLeft, { className: "w-4 h-4" }), " Previous: ", navigation.prevLesson.title] })) : (_jsx("div", {})), navigation.nextLesson && (_jsxs(Link, { to: `/courses/${courseSlug}/lessons/${navigation.nextLesson.slug}`, className: "inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-2xl text-xs font-semibold text-white transition-all shadow-lg shadow-brand-500/20", children: ["Next: ", navigation.nextLesson.title, " ", _jsx(ChevronRight, { className: "w-4 h-4" })] }))] })] }), _jsxs("aside", { className: `fixed lg:static inset-y-0 right-0 z-30 w-80 bg-slate-900 border-l lg:border border-slate-800 rounded-none lg:rounded-3xl p-6 overflow-y-auto space-y-6 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} shrink-0`, children: [_jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-slate-800", children: [_jsxs("h3", { className: "font-bold text-base text-white flex items-center gap-2", children: [_jsx(Layers, { className: "w-4 h-4 text-brand-400" }), "Course Syllabus"] }), _jsx("button", { onClick: () => setSidebarOpen(false), className: "lg:hidden text-slate-400 hover:text-white", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "space-y-2", children: navigation.siblingLessons?.map((s) => {
                            const isActive = s.slug === lessonSlug;
                            return (_jsxs(Link, { to: `/courses/${courseSlug}/lessons/${s.slug}`, onClick: () => setSidebarOpen(false), className: `flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${isActive
                                    ? 'bg-brand-600/20 border-brand-500 text-white font-semibold'
                                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'}`, children: [_jsxs("div", { className: "flex items-center gap-2.5 truncate", children: [_jsxs("span", { className: "font-mono text-brand-400 font-bold", children: ["#", s.order] }), _jsx("span", { className: "truncate", children: s.title })] }), isActive && _jsx(Play, { className: "w-3.5 h-3.5 text-brand-400 fill-brand-400 shrink-0" })] }, s.id));
                        }) })] })] }));
};
