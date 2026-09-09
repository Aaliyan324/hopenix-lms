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
  Shield,
  Download,
  RefreshCw,
  Grid,
  List,
  Search,
  Filter,
  TrendingUp,
  Award,
  Users,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface BookWithLessons extends Book {
  lessons?: Lesson[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }
  },
};

export const AdminQRCodesPage: React.FC = () => {
  const { toast } = useToast();
  const [books, setBooks] = useState<BookWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

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

  // Filter books based on search
  const filteredBooks = books.filter(book => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return book.title.toLowerCase().includes(query) ||
           (book.author || '').toLowerCase().includes(query) ||
           (book.lessons || []).some(l => l.title.toLowerCase().includes(query));
  });

  // Calculate stats
  const totalBooks = books.length;
  const totalLessons = books.reduce((acc, book) => acc + (book.lessons?.length || 0), 0);
  const booksWithQR = books.filter(b => b.qrCodeUrl).length;
  const lessonsWithQR = books.reduce((acc, book) => {
    return acc + (book.lessons?.filter(l => l.qrCodeUrl).length || 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-4 sm:p-6 lg:p-8 font-['Inter',sans-serif]">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-8 sm:pb-16"
      >
        {/* Header Banner */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 text-white p-6 sm:p-8 lg:p-10 shadow-2xl"
        >
          <div className="absolute -right-20 -bottom-20 w-72 sm:w-96 h-72 sm:h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden md:block">
            <QrCode className="w-48 h-48 text-white" />
          </div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold uppercase tracking-wider font-['Poppins',sans-serif]">
                  <QrCode className="w-3.5 h-3.5" />
                  QR Studio
                </div>
                <h1 className="font-['Poppins',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  QR Code Studio
                </h1>
                <p className="text-sm sm:text-base text-orange-100 max-w-2xl leading-relaxed">
                  Generate, preview, customize, and download persistent QR codes for books and lessons.
                </p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-semibold text-white">{totalBooks}</span>
                    <span>Books</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <Layers className="w-4 h-4" />
                    <span className="font-semibold text-white">{totalLessons}</span>
                    <span>Lessons</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold text-white">{booksWithQR}</span>
                    <span>Books with QR</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <QrCode className="w-4 h-4" />
                    <span className="font-semibold text-white">{lessonsWithQR}</span>
                    <span>Lessons with QR</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <button
                  onClick={handleGenerateMissingQRs}
                  disabled={bulkLoading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-orange-600 hover:bg-orange-50 text-sm font-semibold rounded-2xl transition-all shadow-lg shadow-orange-700/30 active:scale-[0.98] font-['Poppins',sans-serif] disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {bulkLoading ? 'Generating...' : 'Generate Missing QR'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl p-4 shadow-[0_8px_30px_rgba(249,115,22,0.08)]"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books or lessons..."
                className="w-full bg-orange-50/30 border border-stone-200/80 focus:border-orange-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition-colors font-['Inter',sans-serif]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => fetchBooks()}
                className="p-2.5 text-stone-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors border border-stone-200/80"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Books List */}
        <motion.div 
          variants={containerVariants}
          className="space-y-4"
        >
          {filteredBooks.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgba(249,115,22,0.08)] text-center"
            >
              <QrCode className="w-12 h-12 text-orange-300 mx-auto mb-4" />
              <p className="text-lg font-['Poppins',sans-serif] font-semibold text-stone-900">No books found</p>
              <p className="text-sm text-stone-500 mt-1 font-['Inter',sans-serif]">
                {searchQuery ? 'Try adjusting your search query.' : 'Create your first book to generate QR codes.'}
              </p>
            </motion.div>
          ) : (
            filteredBooks.map((book) => {
              const isExpanded = expandedBooks.has(book.id);
              const lessonCount = book.lessons?.length ?? book._count?.lessons ?? 0;
              const hasBookQR = Boolean(book.qrCodeUrl);

              return (
                <motion.div
                  key={book.id}
                  variants={itemVariants}
                  className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(249,115,22,0.08)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.12)] transition-all duration-300"
                >
                  {/* Book Row */}
                  <div className="flex items-center justify-between p-4 sm:p-5 gap-3 sm:gap-4 hover:bg-orange-50/30 transition-colors">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <img
                        src={
                          book.coverImage ||
                          book.thumbnail ||
                          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={book.title}
                        className="w-12 h-16 sm:w-14 sm:h-18 rounded-xl object-contain border border-orange-200 bg-stone-50 p-0.5 shrink-0 shadow-sm"
                        style={{ height: '4.5rem' }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <BookOpen className="w-4 h-4 text-orange-600 shrink-0" />
                          <h3 className="font-['Poppins',sans-serif] font-semibold text-sm text-stone-900 truncate">
                            {book.title}
                          </h3>
                          {hasBookQR ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-['Inter',sans-serif]">
                              <CheckCircle2 className="w-3 h-3" /> QR Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-['Inter',sans-serif]">
                              <Clock className="w-3 h-3" /> No QR
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 font-medium flex items-center gap-1 font-['Inter',sans-serif]">
                          <Layers className="w-3 h-3 text-stone-400" />
                          {lessonCount} lessons
                          {book.author && (
                            <>
                              <span className="text-stone-300">·</span>
                              <span>By {book.author}</span>
                            </>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant={book.published ? 'success' : 'slate'} size="sm" className={`font-['Inter',sans-serif] text-[10px] ${
                            book.published 
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                              : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                            {book.published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <button
                        onClick={() => openBookQR(book)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold rounded-xl border border-orange-200 hover:border-orange-300 transition-all shadow-sm font-['Inter',sans-serif]"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Book QR</span>
                        <span className="sm:hidden">QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExpand(book.id)}
                        className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-stone-200 bg-white hover:bg-orange-50 hover:border-orange-300 text-stone-500 hover:text-orange-600 transition-all shadow-sm"
                        title={isExpanded ? 'Collapse lessons' : 'Expand lessons'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Lessons Body */}
                  {isExpanded && (
                    <div className="border-t border-orange-100 divide-y divide-orange-50 bg-orange-50/20">
                      <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-xl bg-orange-50 border border-orange-100 text-orange-600">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-900 font-['Poppins',sans-serif]">Book Lessons</p>
                            <p className="text-[10px] text-stone-500 leading-tight font-['Inter',sans-serif]">
                              Manage individual lesson QR codes
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-stone-500 bg-white px-3 py-1 rounded-xl border border-stone-200 font-['Inter',sans-serif]">
                          {lessonCount} total
                        </span>
                      </div>

                      {(book.lessons?.length || 0) > 0 ? (
                        <div className="px-4 sm:px-5 py-2 space-y-0.5">
                          {book.lessons!.map((lesson, idx) => {
                            const hasLessonQR = Boolean(lesson.qrCodeUrl);
                            const isLast = idx === book.lessons!.length - 1;

                            return (
                              <div
                                key={lesson.id}
                                className={`flex items-center justify-between py-2 ${!isLast ? 'border-b border-orange-50' : ''} hover:bg-white/60 rounded-lg px-2 transition-colors`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[10px] font-mono font-bold text-orange-600 shrink-0 w-8 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100 text-center font-['Inter',sans-serif]">
                                    L{lesson.lessonNumber || idx + 1}
                                  </span>
                                  <span className="text-xs sm:text-sm text-stone-800 truncate font-medium font-['Inter',sans-serif]">{lesson.title}</span>
                                  {!lesson.published && (
                                    <span className="text-[9px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 shrink-0 font-['Inter',sans-serif]">
                                      Draft
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                                  {hasLessonQR ? (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 hidden sm:inline-block font-['Inter',sans-serif]">
                                      <CheckCircle2 className="w-3 h-3 inline mr-0.5" />
                                      QR Ready
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 hidden sm:inline-block font-['Inter',sans-serif]">
                                      <Clock className="w-3 h-3 inline mr-0.5" />
                                      No QR
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => openLessonQR(book, lesson, idx)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-orange-50 hover:border-orange-300 text-stone-700 hover:text-orange-700 text-xs font-semibold transition-all shadow-sm font-['Inter',sans-serif]"
                                  >
                                    <QrCode className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">View QR</span>
                                    <span className="sm:hidden">QR</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="px-5 py-8 text-center text-sm text-stone-500 font-medium bg-white/50 font-['Inter',sans-serif]">
                          No lessons available for this book yet.
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>
      </motion.div>

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