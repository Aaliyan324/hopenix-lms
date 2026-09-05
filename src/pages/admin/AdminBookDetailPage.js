import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { RichTextEditor } from '../../components/editor/RichTextEditor';
import { ArrowLeft, BookOpen, Plus, Edit, Trash2, QrCode, Layers, Save, Eye, } from 'lucide-react';
export const AdminBookDetailPage = () => {
    const { id } = useParams();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingBook, setSavingBook] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    // Book Edit Form state
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [category, setCategory] = useState('');
    const [readingLevel, setReadingLevel] = useState('');
    const [language, setLanguage] = useState('');
    const [publicationYear, setPublicationYear] = useState('');
    const [isbn, setIsbn] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [published, setPublished] = useState(false);
    // Lesson Create Modal
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [creatingLesson, setCreatingLesson] = useState(false);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonNumber, setLessonNumber] = useState('1');
    const [lessonDesc, setLessonDesc] = useState('');
    const [lessonContent, setLessonContent] = useState('');
    const [lessonReadingTime, setLessonReadingTime] = useState('');
    const [lessonPublished, setLessonPublished] = useState(true);
    useEffect(() => {
        if (id)
            fetchBook();
    }, [id]);
    const fetchBook = async () => {
        try {
            setLoading(true);
            const data = await apiFetch(`/books/${id}`);
            const b = data.book;
            setBook(b);
            // Populate form
            setTitle(b.title || '');
            setAuthor(b.author || '');
            setDescription(b.description || '');
            setShortDescription(b.shortDescription || '');
            setCategory(b.category || 'General');
            setReadingLevel(b.readingLevel || 'Beginner');
            setLanguage(b.language || 'English');
            setPublicationYear(b.publicationYear ? String(b.publicationYear) : '2026');
            setIsbn(b.isbn || '');
            setCoverImage(b.coverImage || b.thumbnail || '');
            setPublished(b.published || false);
        }
        catch (err) {
            toast('Failed to load book details.', 'error');
        }
        finally {
            setLoading(false);
        }
    };
    const handleUpdateBook = async (e) => {
        e.preventDefault();
        if (!id)
            return;
        try {
            setSavingBook(true);
            await apiFetch(`/books/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    title,
                    author,
                    description,
                    shortDescription,
                    category,
                    readingLevel,
                    language,
                    publicationYear,
                    isbn,
                    coverImage,
                    published,
                }),
            });
            toast('Book details updated successfully!', 'success');
            fetchBook();
        }
        catch (err) {
            toast('Failed to update book.', 'error');
        }
        finally {
            setSavingBook(false);
        }
    };
    const handleCreateLesson = async (e) => {
        e.preventDefault();
        if (!id || !lessonTitle) {
            toast('Lesson title is required.', 'error');
            return;
        }
        try {
            setCreatingLesson(true);
            await apiFetch('/lessons', {
                method: 'POST',
                body: JSON.stringify({
                    bookId: id,
                    courseId: id,
                    title: lessonTitle,
                    lessonNumber: parseInt(lessonNumber, 10),
                    description: lessonDesc,
                    content: lessonContent,
                    readingTime: lessonReadingTime,
                    published: lessonPublished,
                }),
            });
            toast('New lesson created successfully!', 'success');
            setIsLessonModalOpen(false);
            resetLessonForm();
            fetchBook();
        }
        catch (err) {
            toast('Failed to create lesson.', 'error');
        }
        finally {
            setCreatingLesson(false);
        }
    };
    const handleDeleteLesson = async (lessonId, lTitle) => {
        if (!window.confirm(`Delete lesson "${lTitle}"?`))
            return;
        try {
            await apiFetch(`/lessons/${lessonId}`, { method: 'DELETE' });
            toast('Lesson deleted.', 'success');
            fetchBook();
        }
        catch (err) {
            toast('Failed to delete lesson.', 'error');
        }
    };
    const resetLessonForm = () => {
        setLessonTitle('');
        setLessonNumber(String((book?.lessons?.length || 0) + 1));
        setLessonDesc('');
        setLessonContent('');
        setLessonReadingTime('');
        setLessonPublished(true);
    };
    if (loading || !book) {
        return (_jsxs("div", { className: "space-y-6 max-w-6xl mx-auto", children: [_jsx(Skeleton, { className: "h-8 w-48" }), _jsx(Skeleton, { className: "h-96 w-full rounded-3xl" })] }));
    }
    return (_jsxs("div", { className: "space-y-8 max-w-6xl mx-auto pb-16", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Link, { to: "/admin/books", className: "p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors", children: _jsx(ArrowLeft, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-white leading-tight", children: book.title }), _jsxs("p", { className: "text-xs text-slate-400", children: ["Book ID: ", book.id, " \u2022 Slug: /", book.slug] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setQrModalOpen(true), icon: _jsx(QrCode, { className: "w-4 h-4 text-brand-400" }), children: "QR Studio" }), _jsx("a", { href: `/books/${book.slug}`, target: "_blank", rel: "noreferrer", children: _jsx(Button, { variant: "secondary", icon: _jsx(Eye, { className: "w-4 h-4" }), children: "Preview Public Page" }) })] })] }), _jsxs("form", { onSubmit: handleUpdateBook, className: "bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-4", children: [_jsxs("h2", { className: "text-lg font-bold text-white flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-5 h-5 text-brand-400" }), "Book Information & Settings"] }), _jsx(Button, { variant: "primary", type: "submit", loading: savingBook, icon: _jsx(Save, { className: "w-4 h-4" }), children: "Save Book Changes" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs", children: [_jsx(Input, { label: "Book Title", value: title, onChange: (e) => setTitle(e.target.value), required: true }), _jsx(Input, { label: "Author", value: author, onChange: (e) => setAuthor(e.target.value) })] }), _jsxs("div", { className: "space-y-1 text-xs", children: [_jsx("label", { className: "font-semibold text-slate-300", children: "Book Overview / Description" }), _jsx("textarea", { rows: 4, value: description, onChange: (e) => setDescription(e.target.value), className: "w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl p-3 text-xs text-white outline-none" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "font-semibold text-slate-300 block mb-1", children: "Category" }), _jsxs("select", { value: category, onChange: (e) => setCategory(e.target.value), className: "w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none", children: [_jsx("option", { value: "Computer Science", children: "Computer Science" }), _jsx("option", { value: "Programming", children: "Programming" }), _jsx("option", { value: "Design", children: "Design" }), _jsx("option", { value: "Mathematics", children: "Mathematics" }), _jsx("option", { value: "Science", children: "Science" }), _jsx("option", { value: "General", children: "General" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "font-semibold text-slate-300 block mb-1", children: "Reading Level" }), _jsxs("select", { value: readingLevel, onChange: (e) => setReadingLevel(e.target.value), className: "w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none", children: [_jsx("option", { value: "Beginner", children: "Beginner" }), _jsx("option", { value: "Intermediate", children: "Intermediate" }), _jsx("option", { value: "Advanced", children: "Advanced" })] })] }), _jsx(Input, { label: "Language", value: language, onChange: (e) => setLanguage(e.target.value) }), _jsx(Input, { label: "Published Year", value: publicationYear, onChange: (e) => setPublicationYear(e.target.value) })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs", children: [_jsx(Input, { label: "Cover Image URL", value: coverImage, onChange: (e) => setCoverImage(e.target.value) }), _jsx(Input, { label: "ISBN", value: isbn, onChange: (e) => setIsbn(e.target.value) })] }), _jsxs("div", { className: "flex items-center gap-2 pt-2", children: [_jsx("input", { type: "checkbox", id: "pub-check", checked: published, onChange: (e) => setPublished(e.target.checked), className: "w-4 h-4 rounded border-slate-800 text-brand-600 focus:ring-brand-500 bg-slate-950" }), _jsx("label", { htmlFor: "pub-check", className: "text-xs font-semibold text-slate-300 cursor-pointer", children: "Published (Visible to public guests in digital library)" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("h2", { className: "text-xl font-bold text-white flex items-center gap-2", children: [_jsx(Layers, { className: "w-5 h-5 text-brand-400" }), "Book Lessons (", book.lessons?.length || 0, ")"] }), _jsx(Button, { variant: "primary", onClick: () => {
                                    resetLessonForm();
                                    setIsLessonModalOpen(true);
                                }, icon: _jsx(Plus, { className: "w-4 h-4" }), children: "Add New Lesson" })] }), _jsx("div", { className: "space-y-3", children: book.lessons?.map((lesson, idx) => {
                            const num = lesson.lessonNumber || idx + 1;
                            return (_jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("span", { className: "w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-sm text-brand-400", children: ["L", num] }), _jsxs("div", { children: [_jsxs("h3", { className: "text-sm font-semibold text-white", children: ["Lesson ", num, ": ", lesson.title] }), _jsxs("p", { className: "text-xs text-slate-400", children: ["Slug: /", lesson.slug, " \u2022 Media: ", lesson.media?.length || 0, " attachments"] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: lesson.published ? 'success' : 'warning', size: "sm", children: lesson.published ? 'Published' : 'Draft' }), _jsx(Link, { to: `/admin/lessons/${lesson.id}/edit`, children: _jsx(Button, { variant: "outline", size: "sm", icon: _jsx(Edit, { className: "w-3.5 h-3.5" }), children: "Edit Content" }) }), _jsx(Button, { variant: "ghost", size: "sm", className: "text-rose-400 hover:bg-rose-500/10", onClick: () => handleDeleteLesson(lesson.id, lesson.title), icon: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] })] }, lesson.id));
                        }) })] }), _jsx(Modal, { isOpen: isLessonModalOpen, onClose: () => setIsLessonModalOpen(false), title: "Add Lesson to Book", maxWidth: "lg", children: _jsxs("form", { onSubmit: handleCreateLesson, className: "space-y-4 text-xs", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsx(Input, { label: "Lesson Number", type: "number", value: lessonNumber, onChange: (e) => setLessonNumber(e.target.value), required: true }), _jsx("div", { className: "sm:col-span-2", children: _jsx(Input, { label: "Lesson Title *", placeholder: "e.g. Introduction to HTML Structure", value: lessonTitle, onChange: (e) => setLessonTitle(e.target.value), required: true }) })] }), _jsx(Input, { label: "Lesson Summary", placeholder: "Brief overview...", value: lessonDesc, onChange: (e) => setLessonDesc(e.target.value) }), _jsxs("div", { children: [_jsx("label", { className: "font-semibold text-slate-300 block mb-1", children: "Rich Text Content" }), _jsx(RichTextEditor, { content: lessonContent, onChange: setLessonContent, placeholder: "Write lesson article content..." })] }), _jsxs("div", { className: "flex items-center gap-2 pt-2", children: [_jsx("input", { type: "checkbox", id: "l-pub-check", checked: lessonPublished, onChange: (e) => setLessonPublished(e.target.checked), className: "w-4 h-4 rounded border-slate-800 text-brand-600 focus:ring-brand-500 bg-slate-950" }), _jsx("label", { htmlFor: "l-pub-check", className: "text-xs font-semibold text-slate-300 cursor-pointer", children: "Publish lesson immediately" })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-slate-800", children: [_jsx(Button, { variant: "outline", type: "button", onClick: () => setIsLessonModalOpen(false), children: "Cancel" }), _jsx(Button, { variant: "primary", type: "submit", loading: creatingLesson, children: "Create Lesson" })] })] }) }), qrModalOpen && (_jsx(QRCodeModal, { isOpen: qrModalOpen, onClose: () => setQrModalOpen(false), courseId: book.id, courseTitle: book.title }))] }));
};
export const AdminCourseDetailPage = AdminBookDetailPage;
