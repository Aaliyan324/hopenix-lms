import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Book, Lesson } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { QrCode, ChevronDown, ChevronUp, Layers, BookOpen, Sparkles, CheckCircle2, Clock } from 'lucide-react';

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
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <QrCode className="w-6 h-6 text-stone-900" />
            Digital Book QR Code Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Generate, preview, customize, and download persistent QR codes for books and lessons.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          loading={bulkLoading}
          onClick={handleGenerateMissingQRs}
          className="bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-xl shadow-xs transition-all"
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
        <div className="space-y-3">
          {books.map((book) => {
            const isExpanded = expandedBooks.has(book.id);
            const lessonCount = book.lessons?.length ?? book._count?.lessons ?? 0;
            const hasBookQR = Boolean(book.qrCodeUrl);

            return (
              <div
                key={book.id}
                className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs transition-all"
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
                      className="w-14 h-18 rounded-xl object-cover border border-stone-200 shrink-0"
                      style={{ height: '4.5rem' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <BookOpen className="w-4 h-4 text-stone-900 shrink-0" />
                        <h3 className="font-semibold text-sm text-stone-900 truncate">{book.title}</h3>
                        {hasBookQR ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Persistent QR
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300">
                            <Clock className="w-3 h-3" /> Not Generated
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500">{lessonCount} lessons</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={book.published ? 'success' : 'slate'} size="sm">
                          {book.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openBookQR(book)}
                      className="border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl"
                      icon={<QrCode className="w-3.5 h-3.5" />}
                    >
                      Book QR
                    </Button>
                    <button
                      type="button"
                      onClick={() => toggleExpand(book.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-700 transition-colors"
                      title={isExpanded ? 'Collapse lessons' : 'Expand lessons'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Lessons Body */}
                {isExpanded && (
                  <div className="border-t border-stone-200 divide-y divide-stone-100 bg-stone-50/80">
                    <div className="px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-stone-900 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-stone-900">Book Lessons</p>
                          <p className="text-[10px] text-stone-500 leading-tight">
                            Manage individual lesson QR codes and downloads
                          </p>
                        </div>
                      </div>
                    </div>

                    {(book.lessons?.length || 0) > 0 ? (
                      <div className="px-5 py-2 space-y-0.5">
                        {book.lessons!.map((lesson, idx) => {
                          const hasLessonQR = Boolean(lesson.qrCodeUrl);
                          const isLast = idx === book.lessons!.length - 1;

                          return (
                            <div
                              key={lesson.id}
                              className={`flex items-center justify-between py-2.5 ${!isLast ? 'border-b border-stone-100' : ''}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-[10px] font-mono font-bold text-stone-700 shrink-0 w-8">
                                  L{lesson.lessonNumber || idx + 1}
                                </span>
                                <span className="text-xs text-stone-800 truncate">{lesson.title}</span>
                                {!lesson.published && (
                                  <span className="text-[9px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded shrink-0">
                                    Draft
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-3">
                                {hasLessonQR ? (
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                                    QR Ready
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                                    No QR
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => openLessonQR(book, lesson, idx)}
                                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-all shadow-xs gap-1.5"
                                >
                                  <QrCode className="w-3.5 h-3.5 text-stone-500" />
                                  <span>View QR</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-5 py-6 text-center text-xs text-stone-500 font-medium">
                        No lessons available for this book yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal Component */}
      <QRCodeModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        courseId={qrCourseId}
        courseTitle={qrCourseTitle}
        lessonId={qrLessonId}
        lessonTitle={qrLessonTitle}
        lessonNumber={qrLessonNumber}
      />
    </div>
  );
};