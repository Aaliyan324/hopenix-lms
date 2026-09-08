import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Book, Lesson } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { 
  CheckSquare, 
  Edit, 
  Clock, 
  Layers, 
  BookOpen, 
  QrCode,
  Sparkles,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

export const EditorDashboardPage: React.FC = () => {
  const [assignedBooks, setAssignedBooks] = useState<Book[]>([]);
  const [assignedLessons, setAssignedLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // QR Modal state
  const [qrOpen, setQrOpen] = useState(false);
  const [qrBookId, setQrBookId] = useState('');
  const [qrBookTitle, setQrBookTitle] = useState('');
  const [qrLessonId, setQrLessonId] = useState<string | undefined>(undefined);
  const [qrLessonTitle, setQrLessonTitle] = useState<string | undefined>(undefined);
  const [qrLessonNumber, setQrLessonNumber] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchEditorData();
  }, []);

  const fetchEditorData = async () => {
    try {
      setLoading(true);
      const [booksData, lessonsData] = await Promise.all([
        apiFetch<{ books: Book[] }>('/books'),
        apiFetch<{ lessons: Lesson[] }>('/lessons/editor/assigned'),
      ]);
      setAssignedBooks(booksData.books || []);
      setAssignedLessons(lessonsData.lessons || []);
    } catch (err) {
      console.error('Failed to load assigned editor content:', err);
    } finally {
      setLoading(false);
    }
  };

  const openBookQR = (book: Book) => {
    setQrBookId(book.id);
    setQrBookTitle(book.title);
    setQrLessonId(undefined);
    setQrLessonTitle(undefined);
    setQrLessonNumber(undefined);
    setQrOpen(true);
  };

  const openLessonQR = (lesson: Lesson) => {
    setQrBookId(lesson.courseId || lesson.course?.id || '');
    setQrBookTitle(lesson.course?.title || lesson.book?.title || 'Book');
    setQrLessonId(lesson.id);
    setQrLessonTitle(lesson.title);
    setQrLessonNumber(lesson.lessonNumber || lesson.order);
    setQrOpen(true);
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
              <Shield className="w-3.5 h-3.5" />
              Editor Workspace
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Editor Dashboard
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-light">
              Books and lessons explicitly assigned to your editor account. You can edit rich text, 
              media, and chapter content for your assigned items.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <CheckSquare className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-white">
                {assignedBooks.length + assignedLessons.length} Assigned
              </span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Assigned Books Section */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                Assigned Books ({assignedBooks.length})
              </h2>
            </div>

            {assignedBooks.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-editorial">
                <EmptyState
                  title="No assigned books"
                  description="You currently don't have entire books assigned to you by an administrator."
                  icon={<BookOpen className="w-10 h-10 text-slate-400" />}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {assignedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-editorial hover:shadow-editorial hover:border-orange-300 transition-all duration-200 flex flex-col justify-between space-y-4 group"
                  >
                    <div className="flex gap-4">
                      <img
                        src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                        alt={book.title}
                        className="w-16 h-20 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <Badge variant={book.published ? 'success' : 'slate'} size="sm" className={book.published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'}>
                          {book.published ? 'Published' : 'Draft'}
                        </Badge>
                        <h3 className="font-serif font-bold text-base text-slate-900 truncate mt-1">{book.title}</h3>
                        <p className="text-xs text-slate-500 truncate">By {book.author || 'Editorial'}</p>
                        <p className="text-xs text-slate-600 font-semibold mt-1 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-orange-500" />
                          {book.totalLessons || 0} Lessons
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openBookQR(book)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-xs font-semibold rounded-xl border border-slate-200 hover:border-orange-300 transition-all"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View QR
                      </button>

                      <Link
                        to={`/admin/books/${book.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-orange-500/25"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit Book
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Lessons Section */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600">
                  <Layers className="w-5 h-5" />
                </div>
                Assigned Lessons ({assignedLessons.length})
              </h2>
            </div>

            {assignedLessons.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-editorial">
                <EmptyState
                  title="No assigned lessons"
                  description="You currently don't have individual lessons assigned to you by an administrator."
                  icon={<CheckSquare className="w-10 h-10 text-slate-400" />}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {assignedLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-editorial hover:shadow-editorial hover:border-orange-300 transition-all duration-200 flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 truncate">
                          <BookOpen className="w-3.5 h-3.5 shrink-0 text-orange-500" />
                          {lesson.course?.title || lesson.book?.title || 'Book'}
                        </span>
                        <Badge variant={lesson.published ? 'success' : 'slate'} size="sm" className={lesson.published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'}>
                          {lesson.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>

                      <h3 className="font-serif font-bold text-base text-slate-900 mb-1">
                        Lesson #{lesson.lessonNumber || lesson.order}: {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 font-sans">{lesson.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openLessonQR(lesson)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-xs font-semibold rounded-xl border border-slate-200 hover:border-orange-300 transition-all"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View QR
                      </button>

                      <Link
                        to={`/editor/lessons/${lesson.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-orange-500/25"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit Content
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Read-Only QR Modal for Editors */}
      {qrOpen && (
        <QRCodeModal
          isOpen={qrOpen}
          onClose={() => setQrOpen(false)}
          courseId={qrBookId}
          courseTitle={qrBookTitle}
          lessonId={qrLessonId}
          lessonTitle={qrLessonTitle}
          lessonNumber={qrLessonNumber}
        />
      )}
    </div>
  );
};