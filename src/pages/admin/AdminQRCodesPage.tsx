import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Book, Lesson } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { QrCode, ChevronDown, ChevronUp, Layers, BookOpen, Sparkles, CheckCircle2, Clock } from 'lucide-react';

import { getCompanySlug } from '../../lib/slug';

interface BookWithLessons extends Book {
  lessons?: Lesson[];
}

export const AdminQRCodesPage: React.FC = () => {
  const { toast } = useToast();
  const [books, setBooks] = useState<BookWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
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
      const listData = await apiFetch<{ books: BookWithLessons[] }>('/books');
      const bookList = listData.books || [];

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

  const handleGenerateMissingQRs = async () => {
    try {
      setBulkLoading(true);
      const [bookRes, lessonRes] = await Promise.all([
        apiFetch<{ message: string; generatedCount: number }>('/books/generate-missing-qr', { method: 'POST' }),
        apiFetch<{ message: string; generatedCount: number }>('/lessons/generate-missing-qr', { method: 'POST' }),
      ]);

      const totalGen = (bookRes.generatedCount || 0) + (lessonRes.generatedCount || 0);
      toast(
        totalGen > 0
          ? `Generated persistent QR codes for ${totalGen} missing item(s)!`
          : 'All books and lessons already have persistent QR codes!',
        'success'
      );
      fetchBooks();
    } catch (err: any) {
      toast(err.message || 'Failed to bulk generate missing QR codes.', 'error');
    } finally {
      setBulkLoading(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <QrCode className="w-6 h-6 text-brand-400" />
            Digital Book QR Code Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate, preview, customize, and download persistent QR codes for books and lessons.
          </p>
        </div>

        <Button
          variant="playful"
          size="md"
          loading={bulkLoading}
          onClick={handleGenerateMissingQRs}
          icon={<Sparkles className="w-4 h-4 text-amber-300" />}
        >
          Generate Missing QR Codes
        </Button>
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
            const hasBookQR = Boolean(book.qrCodeUrl);

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
                        {hasBookQR ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Persistent QR
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3" /> Not Generated
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">By {book.author || 'Hopenix'}</p>
                      <p className="text-xs text-brand-400 font-mono mt-0.5">/{getCompanySlug(book.companyName)}/books/{book.slug}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{lessonCount} lesson{lessonCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant={hasBookQR ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => openBookQR(book)}
                      icon={<QrCode className="w-4 h-4" />}
                    >
                      {hasBookQR ? 'View / Edit QR' : 'Generate QR'}
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
                      const hasLessonQR = Boolean(lesson.qrCodeUrl);

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
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-white truncate">
                                  Lesson {num}: {lesson.title}
                                </p>
                                {hasLessonQR ? (
                                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                                    QR Active
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-extrabold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-500/30">
                                    No QR
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-brand-400 font-mono">
                                /{getCompanySlug(book.companyName)}/books/{book.slug}/lessons/{num}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openLessonQR(book, lesson, idx)}
                            icon={<QrCode className="w-3.5 h-3.5 text-brand-400" />}
                          >
                            {hasLessonQR ? 'View QR' : 'Generate QR'}
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
            fetchBooks();
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
