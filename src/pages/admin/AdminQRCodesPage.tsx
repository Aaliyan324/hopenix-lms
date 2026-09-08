import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Book, Lesson } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { 
  QrCode, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Clock,
  Shield
} from 'lucide-react';

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
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Header Banner - Matches dashboard style */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-10 shadow-editorial border border-slate-800">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <Sparkles className="w-40 h-40 text-orange-400" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <QrCode className="w-3.5 h-3.5" />
              QR Studio
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Digital Book QR Code Studio
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-light">
              Generate, preview, customize, and download persistent QR codes for books and lessons.
            </p>
          </div>
          
          <button
            onClick={handleGenerateMissingQRs}
            disabled={bulkLoading}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-2xl transition-all shadow-lg shadow-orange-500/25 active:scale-[0.99] shrink-0 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {bulkLoading ? 'Generating...' : 'Generate Missing QR Codes'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
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
                className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-editorial hover:shadow-editorial transition-all"
              >
                {/* Book Row */}
                <div className="flex items-center justify-between p-5 gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <img
                      src={
                        book.coverImage ||
                        book.thumbnail ||
                        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={book.title}
                      className="w-14 h-18 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                      style={{ height: '4.5rem' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <BookOpen className="w-4 h-4 text-orange-600 shrink-0" />
                        <h3 className="font-serif font-bold text-sm text-slate-900 truncate">{book.title}</h3>
                        {hasBookQR ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> QR Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> No QR
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        {lessonCount} lessons
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={book.published ? 'success' : 'slate'} size="sm" className={book.published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'}>
                          {book.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openBookQR(book)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-xs font-semibold rounded-xl border border-slate-200 hover:border-orange-300 transition-all shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Book QR
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExpand(book.id)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-300 text-slate-500 hover:text-orange-600 transition-all shadow-xs"
                      title={isExpanded ? 'Collapse lessons' : 'Expand lessons'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Lessons Body */}
                {isExpanded && (
                  <div className="border-t border-slate-200 divide-y divide-slate-100 bg-slate-50/80">
                    <div className="px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-xl bg-orange-50 border border-orange-100 text-orange-600">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Book Lessons</p>
                          <p className="text-[10px] text-slate-500 leading-tight">
                            Manage individual lesson QR codes
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-xl border border-slate-200">
                        {lessonCount} total
                      </span>
                    </div>

                    {(book.lessons?.length || 0) > 0 ? (
                      <div className="px-5 py-2 space-y-0.5">
                        {book.lessons!.map((lesson, idx) => {
                          const hasLessonQR = Boolean(lesson.qrCodeUrl);
                          const isLast = idx === book.lessons!.length - 1;

                          return (
                            <div
                              key={lesson.id}
                              className={`flex items-center justify-between py-2.5 ${!isLast ? 'border-b border-slate-100' : ''} hover:bg-white/60 rounded-lg px-2 transition-colors`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-[10px] font-mono font-bold text-orange-600 shrink-0 w-8 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100 text-center">
                                  L{lesson.lessonNumber || idx + 1}
                                </span>
                                <span className="text-sm text-slate-800 truncate font-medium">{lesson.title}</span>
                                {!lesson.published && (
                                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                                    Draft
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-3">
                                {hasLessonQR ? (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 inline mr-0.5" />
                                    QR Ready
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    <Clock className="w-3 h-3 inline mr-0.5" />
                                    No QR
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => openLessonQR(book, lesson, idx)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-300 text-slate-700 hover:text-orange-700 text-xs font-semibold transition-all shadow-xs"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                  View QR
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-5 py-8 text-center text-sm text-slate-500 font-medium bg-white/50">
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