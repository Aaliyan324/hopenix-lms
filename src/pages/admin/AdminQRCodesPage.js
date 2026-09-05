import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { QrCode } from 'lucide-react';
export const AdminQRCodesPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState(null);
    useEffect(() => {
        fetchBooks();
    }, []);
    const fetchBooks = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/books');
            setBooks(data.books || []);
        }
        catch (err) {
            console.error('Failed to load books for QR studio:', err);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-8 max-w-7xl mx-auto pb-16", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-white flex items-center gap-2", children: [_jsx(QrCode, { className: "w-6 h-6 text-brand-400" }), "Digital Book QR Code Studio"] }), _jsx("p", { className: "text-sm text-slate-400", children: "Generate, preview, customize center logos, and download high-resolution PNG & SVG vector QR codes for offline and online book distribution." })] }), loading ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [...Array(6)].map((_, i) => (_jsx(Skeleton, { className: "h-44 rounded-2xl" }, i))) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: books.map((book) => (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("img", { src: book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80', alt: book.title, className: "w-16 h-20 rounded-xl object-cover border border-slate-800 shrink-0" }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-base text-white line-clamp-1", children: book.title }), _jsxs("p", { className: "text-xs text-slate-400", children: ["By ", book.author || 'Hopenix'] }), _jsxs("p", { className: "text-xs text-brand-400 font-mono mt-1", children: ["/books/", book.slug] })] })] }), _jsxs("div", { className: "pt-3 border-t border-slate-800 flex items-center justify-between", children: [_jsxs("span", { className: "text-xs text-slate-400 font-medium", children: [book._count?.lessons ?? book.totalLessons ?? 0, " Lessons"] }), _jsx(Button, { variant: "primary", size: "sm", onClick: () => setSelectedBook(book), icon: _jsx(QrCode, { className: "w-4 h-4" }), children: "Generate QR" })] })] }, book.id))) })), selectedBook && (_jsx(QRCodeModal, { isOpen: !!selectedBook, onClose: () => setSelectedBook(null), courseId: selectedBook.id, courseTitle: selectedBook.title }))] }));
};
