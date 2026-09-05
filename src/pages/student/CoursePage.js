import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { ArrowLeft, CheckCircle, Play, Layers } from 'lucide-react';
export const CoursePage = () => {
    const { slug } = useParams();
    const { toast } = useToast();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (slug)
            fetchCourse();
    }, [slug]);
    const fetchCourse = async () => {
        try {
            setLoading(true);
            const data = await apiFetch(`/courses/${slug}`);
            setCourse(data.course);
        }
        catch (err) {
            toast(err.message || 'Failed to load course details.', 'error');
        }
        finally {
            setLoading(false);
        }
    };
    if (loading || !course) {
        return (_jsxs("div", { className: "space-y-6 max-w-4xl mx-auto", children: [_jsx(Skeleton, { className: "h-8 w-48" }), _jsx(Skeleton, { className: "h-64 w-full rounded-3xl" }), _jsx(Skeleton, { className: "h-96 w-full rounded-3xl" })] }));
    }
    const completedCount = course.lessons?.filter((l) => l.completed).length || 0;
    const totalCount = course.lessons?.length || 0;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    // Find next lesson to study
    const firstUncompleted = course.lessons?.find((l) => !l.completed) || course.lessons?.[0];
    return (_jsxs("div", { className: "space-y-8 max-w-4xl mx-auto pb-12", children: [_jsxs(Link, { to: "/student", className: "inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), " Back to My Courses"] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl", children: [_jsxs("div", { className: "relative h-64 sm:h-80 bg-slate-950", children: [_jsx("img", { src: course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', alt: course.title, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex items-end p-6 sm:p-8", children: _jsxs("div", { className: "space-y-2 max-w-2xl", children: [_jsxs("span", { className: "text-xs font-semibold text-brand-400 bg-brand-500/20 px-3 py-1 rounded-full border border-brand-500/30", children: [totalCount, " Lessons Syllabus"] }), _jsx("h1", { className: "text-2xl sm:text-4xl font-extrabold text-white", children: course.title })] }) })] }), _jsxs("div", { className: "p-6 sm:p-8 space-y-6", children: [_jsx("p", { className: "text-sm sm:text-base text-slate-300 leading-relaxed", children: course.description }), _jsxs("div", { className: "bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "font-semibold text-slate-200", children: "Course Completion Progress" }), _jsxs("span", { className: "font-bold text-brand-400", children: [progressPercent, "%"] })] }), _jsx("div", { className: "w-full bg-slate-900 rounded-full h-2.5 overflow-hidden", children: _jsx("div", { className: "bg-gradient-to-r from-brand-500 to-blue-400 h-full rounded-full transition-all duration-500", style: { width: `${progressPercent}%` } }) })] }), firstUncompleted && (_jsxs(Link, { to: `/courses/${course.slug}/lessons/${firstUncompleted.slug}`, className: "inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold rounded-2xl transition-all shadow-xl shadow-brand-500/25 w-full sm:w-auto", children: [_jsx("span", { children: completedCount > 0 ? 'Continue Learning' : 'Start First Lesson' }), _jsx(Play, { className: "w-5 h-5 fill-white" })] }))] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-xl font-bold text-white flex items-center gap-2", children: [_jsx(Layers, { className: "w-5 h-5 text-brand-400" }), "Course Syllabus (", totalCount, " Lessons)"] }), _jsx("div", { className: "space-y-3", children: course.lessons?.map((lesson, idx) => (_jsxs(Link, { to: `/courses/${course.slug}/lessons/${lesson.slug}`, className: "flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:border-brand-500/50 rounded-2xl transition-all duration-200 group", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: `w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${lesson.completed
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-slate-800 text-slate-300 border border-slate-700'}`, children: lesson.completed ? _jsx(CheckCircle, { className: "w-5 h-5" }) : idx + 1 }), _jsxs("div", { children: [_jsx("h4", { className: "text-base font-semibold text-white group-hover:text-brand-400 transition-colors", children: lesson.title }), lesson.description && (_jsx("p", { className: "text-xs text-slate-400 line-clamp-1", children: lesson.description }))] })] }), _jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [lesson.media && lesson.media.length > 0 && (_jsxs("span", { className: "text-[11px] font-medium text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800", children: [lesson.media.length, " Attachments"] })), _jsx(Play, { className: "w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" })] })] }, lesson.id))) })] })] }));
};
