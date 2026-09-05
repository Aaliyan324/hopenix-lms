import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Book } from '../../types';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { QrCode, ExternalLink, Download, Layers } from 'lucide-react';

export const AdminQRCodesPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ books: Book[] }>('/books');
      setBooks(data.books || []);
    } catch (err) {
      console.error('Failed to load books for QR studio:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <QrCode className="w-6 h-6 text-brand-400" />
          Digital Book QR Code Studio
        </h1>
        <p className="text-sm text-slate-400">
          Generate, preview, customize center logos, and download high-resolution PNG & SVG vector QR codes for offline and online book distribution.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start gap-4">
                <img
                  src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                  alt={book.title}
                  className="w-16 h-20 rounded-xl object-cover border border-slate-800 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-base text-white line-clamp-1">{book.title}</h3>
                  <p className="text-xs text-slate-400">By {book.author || 'Hopenix'}</p>
                  <p className="text-xs text-brand-400 font-mono mt-1">/books/{book.slug}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {book._count?.lessons ?? book.totalLessons ?? 0} Lessons
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedBook(book)}
                  icon={<QrCode className="w-4 h-4" />}
                >
                  Generate QR
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBook && (
        <QRCodeModal
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
          courseId={selectedBook.id}
          courseTitle={selectedBook.title}
        />
      )}
    </div>
  );
};
