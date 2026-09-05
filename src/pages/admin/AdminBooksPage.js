import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { BookOpen, Plus, Edit, Trash2, QrCode, Search, Layers, } from 'lucide-react';
import { Link } from 'react-router-dom';
export const AdminBooksPage = () => {
    const { toast } = useToast();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    // Selected QR Code Modal
    const [qrModalBook, setQrModalBook] = useState(null);
    // Form inputs
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [category, setCategory] = useState('Computer Science');
    const [readingLevel, setReadingLevel] = useState('Beginner');
    const [language, setLanguage] = useState('English');
    const [publicationYear, setPublicationYear] = useState('2026');
    const [isbn, setIsbn] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [published, setPublished] = useState(true);
    useEffect(() => {
        fetchBooks();
    }, []);
    const fetchBooks = async (searchQuery = search) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchQuery)
                params.set('search', searchQuery);
            const data = await apiFetch(`/books?${params.toString()}`);
            setBooks(data.books || []);
        }
        catch (err) {
            toast('Failed to fetch books list.', 'error');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateBook = async (e) => {
        e.preventDefault();
        if (!title || !description) {
            toast('Title and description are required.', 'error');
            return;
        }
        try {
            setSaving(true);
            await apiFetch('/books', {
                method: 'POST',
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
            toast('New digital book created successfully!', 'success');
            setIsCreateModalOpen(false);
            resetForm();
            fetchBooks();
        }
        catch (err) {
            toast(err.message || 'Failed to create book.', 'error');
        }
        finally {
            setSaving(false);
        }
    };
    const handleDeleteBook = async (bookId, bookTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${bookTitle}"? This will remove all associated lessons and bookmarks.`)) {
            return;
        }
        try {
            await apiFetch(`/books/${bookId}`, { method: 'DELETE' });
            toast('Book deleted successfully.', 'success');
            setBooks((prev) => prev.filter((b) => b.id !== bookId));
        }
        catch (err) {
            toast('Failed to delete book.', 'error');
        }
    };
    const resetForm = () => {
        setTitle('');
        setAuthor('');
        setDescription('');
        setShortDescription('');
        setCategory('Computer Science');
        setReadingLevel('Beginner');
        setLanguage('English');
        setPublicationYear('2026');
        setIsbn('');
        setCoverImage('');
        setPublished(true);
    };
    return (_jsxs("div", { className: "space-y-8 max-w-7xl mx-auto pb-16", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-white flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-6 h-6 text-brand-400" }), "Digital Books Catalog Management"] }), _jsx("p", { className: "text-sm text-slate-400", children: "Publish, manage lessons, and generate QR codes for e-books." })] }), _jsx(Button, { variant: "primary", onClick: () => setIsCreateModalOpen(true), icon: _jsx(Plus, { className: "w-4 h-4" }), className: "shadow-lg shadow-brand-500/20", children: "Create New Book" })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsxs("form", { onSubmit: (e) => {
                            e.preventDefault();
                            fetchBooks(search);
                        }, className: "relative w-full sm:w-80", children: [_jsx(Search, { className: "w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "text", placeholder: "Search books...", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none" })] }), _jsxs("span", { className: "text-xs text-slate-400", children: ["Total Books: ", _jsx("strong", { className: "text-white", children: books.length })] })] }), loading ? (_jsx("div", { className: "space-y-3", children: [...Array(5)].map((_, i) => (_jsx(Skeleton, { className: "h-20 w-full rounded-2xl" }, i))) })) : books.length === 0 ? (_jsx(EmptyState, { title: "No books found", description: "Click 'Create New Book' to add your first digital book to the e-book portal.", actionText: "Create Book", onAction: () => setIsCreateModalOpen(true) })) : (_jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs text-slate-300", children: [_jsx("thead", { className: "bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-4", children: "Book Details" }), _jsx("th", { className: "px-4 py-4", children: "Category / Level" }), _jsx("th", { className: "px-4 py-4", children: "Lessons" }), _jsx("th", { className: "px-4 py-4", children: "Status" }), _jsx("th", { className: "px-6 py-4 text-right", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800/80", children: books.map((book) => (_jsxs("tr", { className: "hover:bg-slate-950/50 transition-colors", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80', alt: book.title, className: "w-10 h-12 object-cover rounded-lg border border-slate-800 shrink-0" }), _jsxs("div", { children: [_jsx(Link, { to: `/admin/books/${book.id}/edit`, className: "font-semibold text-white text-sm hover:text-brand-400 transition-colors line-clamp-1", children: book.title }), _jsxs("p", { className: "text-[11px] text-slate-400", children: ["By ", book.author || 'Hopenix'] })] })] }) }), _jsx("td", { className: "px-4 py-4", children: _jsxs("div", { className: "space-y-1", children: [_jsx(Badge, { variant: "brand", size: "sm", children: book.category || 'General' }), _jsx("p", { className: "text-[11px] text-slate-400", children: book.readingLevel || 'Beginner' })] }) }), _jsx("td", { className: "px-4 py-4 font-semibold text-white", children: _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(Layers, { className: "w-3.5 h-3.5 text-brand-400" }), book._count?.lessons ?? book.totalLessons ?? 0, " Lessons"] }) }), _jsx("td", { className: "px-4 py-4", children: _jsx(Badge, { variant: book.published ? 'success' : 'warning', size: "sm", children: book.published ? 'Published' : 'Draft' }) }), _jsxs("td", { className: "px-6 py-4 text-right space-x-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setQrModalBook({ id: book.id, title: book.title }), icon: _jsx(QrCode, { className: "w-3.5 h-3.5 text-brand-400" }), title: "Generate QR Code" }), _jsx(Link, { to: `/admin/books/${book.id}/edit`, children: _jsx(Button, { variant: "outline", size: "sm", icon: _jsx(Edit, { className: "w-3.5 h-3.5" }), children: "Edit" }) }), _jsx(Button, { variant: "ghost", size: "sm", className: "text-rose-400 hover:bg-rose-500/10", onClick: () => handleDeleteBook(book.id, book.title), icon: _jsx(Trash2, { className: "w-3.5 h-3.5" }), title: "Delete Book" })] })] }, book.id))) })] }) }) })), _jsx(Modal, { isOpen: isCreateModalOpen, onClose: () => setIsCreateModalOpen(false), title: "Create New Digital Book", maxWidth: "lg", children: _jsxs("form", { onSubmit: handleCreateBook, className: "space-y-4 text-xs", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { label: "Book Title *", placeholder: "e.g. Introduction to Web Development", value: title, onChange: (e) => setTitle(e.target.value), required: true }), _jsx(Input, { label: "Author Name", placeholder: "e.g. Hopenix Editorial", value: author, onChange: (e) => setAuthor(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block font-semibold text-slate-300 mb-1", children: "Book Description / Overview *" }), _jsx("textarea", { rows: 3, placeholder: "Detailed description of the e-book...", value: description, onChange: (e) => setDescription(e.target.value), className: "w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none", required: true })] }), _jsx("div", { children: _jsx(Input, { label: "Short Summary", placeholder: "1-2 sentences for book card preview...", value: shortDescription, onChange: (e) => setShortDescription(e.target.value) }) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block font-semibold text-slate-300 mb-1", children: "Category" }), _jsxs("select", { value: category, onChange: (e) => setCategory(e.target.value), className: "w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none", children: [_jsx("option", { value: "Computer Science", children: "Computer Science" }), _jsx("option", { value: "Programming", children: "Programming" }), _jsx("option", { value: "Design", children: "Design" }), _jsx("option", { value: "Mathematics", children: "Mathematics" }), _jsx("option", { value: "Science", children: "Science" }), _jsx("option", { value: "General", children: "General" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block font-semibold text-slate-300 mb-1", children: "Reading Level" }), _jsxs("select", { value: readingLevel, onChange: (e) => setReadingLevel(e.target.value), className: "w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none", children: [_jsx("option", { value: "Beginner", children: "Beginner" }), _jsx("option", { value: "Intermediate", children: "Intermediate" }), _jsx("option", { value: "Advanced", children: "Advanced" })] })] }), _jsx(Input, { label: "Language", value: language, onChange: (e) => setLanguage(e.target.value) })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { label: "Cover Image URL", placeholder: "https://...", value: coverImage, onChange: (e) => setCoverImage(e.target.value) }), _jsx(Input, { label: "ISBN (Optional)", placeholder: "978-3-16-148410-0", value: isbn, onChange: (e) => setIsbn(e.target.value) })] }), _jsxs("div", { className: "flex items-center gap-2 pt-2", children: [_jsx("input", { type: "checkbox", id: "published-toggle", checked: published, onChange: (e) => setPublished(e.target.checked), className: "w-4 h-4 rounded border-slate-800 text-brand-600 focus:ring-brand-500 bg-slate-950" }), _jsx("label", { htmlFor: "published-toggle", className: "text-xs text-slate-300 font-semibold cursor-pointer", children: "Publish immediately (visible in public library)" })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-slate-800", children: [_jsx(Button, { variant: "outline", type: "button", onClick: () => setIsCreateModalOpen(false), children: "Cancel" }), _jsx(Button, { variant: "primary", type: "submit", loading: saving, children: "Create E-Book" })] })] }) }), qrModalBook && (_jsx(QRCodeModal, { isOpen: Boolean(qrModalBook), onClose: () => setQrModalBook(null), courseId: qrModalBook.id, courseTitle: qrModalBook.title }))] }));
};
