import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Book, Lesson } from '../../types';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { QrCode, ChevronDown, ChevronUp, Layers, BookOpen } from 'lucide-react';

interface BookWithLessons extends Book {
  lessons?: Lesson[];
}

export const AdminQRCodesPage: React.FC = () => {
  const [books, setBooks] = useState<BookWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set());

  // QR Modal state
  const [qrOpen, setQrOpen] = useState(false);
  const [qrCourseId, setQrCourseId] = useState('');
  const [qrCourseTitle, setQrCourseTitle] = useState('');
  const [qrLessonId, setQrLessonId] = useState<string | undefined>(undefined);
  const [qrLessonTitle, setQrLessonTitle] = useState<string | undefined>(undefined);
  const [qrLessonNumber, setQrLessonNumber] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      // Fetch each book's detail (with lessons) for lesson-level QR support
      const listData = await apiFetch<{ books: BookWithLessons[] }>('/books');
      const bookList = listData.books || [];

      // For each book fetch its full detail (includes lessons)
      const booksWithLessons = await Promise.all(
        bookList.map(async (book) => {
          try {
            const detail = await apiFetch<{ book: BookWithLessons }>(`/books/${book.id}`);
            return detail.book;
          } catch {
            return book;
          }
        })
      );

      setBooks(booksWithLessons);
    } catch (err) {
      console.error('Failed to load books for QR studio:', err);
    } finally {
      setLoading(false);
    }
  };

  const openBookQR = (book: BookWithLessons) => {
    setQrCourseId(book.id);
    setQrCourseTitle(book.title);
    setQrLessonId(undefined);
    setQrLessonTitle(undefined);
    setQrLessonNumber(undefined);
    setQrOpen(true);
  };

  const openLessonQR = (book: BookWithLessons, lesson: Lesson, idx: number) => {
    setQrCourseId(book.id);
    setQrCourseTitle(book.title);
    setQrLessonId(lesson.id);
    setQrLessonTitle(lesson.title);
    setQrLessonNumber(lesson.lessonNumber || idx + 1);
    setQrOpen(true);
  };

  const toggleExpand = (bookId: string) => {
    setExpandedBooks((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) {
        next.delete(bookId);
      } else {
        next.add(bookId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <QrCode className="w-6 h-6 text-brand-400" />
          Digital Book QR Code Studio
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Generate, preview, customize, and download high-resolution QR codes for books and individual lessons.
          Expand a book to see per-lesson QR codes.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {books.map((book) => {
            const isExpanded = expandedBooks.has(book.id);
            const lessonCount = book.lessons?.length ?? book._count?.lessons ?? 0;

            return (
              <div
                key={book.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition-all"
              >
                {/* Book Row */}
                <div className="flex items-center justify-between p-5 gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <img
                      src={
                        book.coverImage ||
                        book.thumbnail ||
                        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={book.title}
                      className="w-14 h-18 rounded-xl object-cover border border-slate-800 shrink-0"
                      style={{ height: '4.5rem' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <BookOpen className="w-4 h-4 text-brand-400 shrink-0" />
                        <h3 className="font-bold text-base text-white truncate">{book.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400">By {book.author || 'Hopenix'}</p>
                      <p className="text-xs text-brand-400 font-mono mt-0.5">/books/{book.slug}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{lessonCount} lesson{lessonCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openBookQR(book)}
                      icon={<QrCode className="w-4 h-4" />}
                    >
                      Book QR
                    </Button>

                    {lessonCount > 0 && (
                      <button
                        onClick={() => toggleExpand(book.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 font-semibold transition-colors"
                        title={isExpanded ? 'Collapse lessons' : 'Show lesson QR codes'}
                      >
                        <Layers className="w-3.5 h-3.5 text-brand-400" />
                        Lessons
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Lesson Rows (expandable) */}
                {isExpanded && book.lessons && book.lessons.length > 0 && (
                  <div className="border-t border-slate-800 divide-y divide-slate-800/60">
                    {book.lessons.map((lesson, idx) => {
                      const num = lesson.lessonNumber || idx + 1;
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between px-5 py-3 bg-slate-950/60 hover:bg-slate-950 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-brand-400 shrink-0">
                              L{num}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">
                                Lesson {num}: {lesson.title}
                              </p>
                              <p className="text-xs text-brand-400 font-mono">
                                /books/{book.slug}/lessons/{num}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openLessonQR(book, lesson, idx)}
                            icon={<QrCode className="w-3.5 h-3.5 text-brand-400" />}
                          >
                            Lesson QR
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Shared QR Modal */}
      {qrOpen && (
        <QRCodeModal
          isOpen={qrOpen}
          onClose={() => {
            setQrOpen(false);
            setQrLessonId(undefined);
            setQrLessonTitle(undefined);
            setQrLessonNumber(undefined);
          }}
          courseId={qrCourseId}
          courseTitle={qrCourseTitle}
          lessonId={qrLessonId}
          lessonTitle={qrLessonTitle}
          lessonNumber={qrLessonNumber}
        />
      )}
    </div>
  );
};
