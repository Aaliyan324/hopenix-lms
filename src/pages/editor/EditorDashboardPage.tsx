import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Book, Lesson } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { CheckSquare, Edit, Clock, Layers, BookOpen, QrCode } from 'lucide-react';

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
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-amber-400" />
          Editor Dashboard & Assigned E-Books
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Books and lessons explicitly assigned to your editor account. You can edit rich text, media, and chapter content for your assigned items.
        </p>
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
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <BookOpen className="w-5 h-5 text-brand-400" />
              Assigned Books ({assignedBooks.length})
            </h2>

            {assignedBooks.length === 0 ? (
              <EmptyState
                title="No assigned books"
                description="You currently don't have entire books assigned to you by an administrator."
                icon={<BookOpen className="w-8 h-8 text-slate-500" />}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
                  >
                    <div className="flex gap-4">
                      <img
                        src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                        alt={book.title}
                        className="w-16 h-20 rounded-xl object-cover border border-slate-800 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <Badge variant={book.published ? 'success' : 'slate'} size="sm" className="mb-1">
                          {book.published ? 'Published' : 'Draft'}
                        </Badge>
                        <h3 className="font-bold text-base text-white truncate">{book.title}</h3>
                        <p className="text-xs text-slate-400 truncate">By {book.author || 'Editorial'}</p>
                        <p className="text-xs text-brand-400 font-mono mt-1">{book.totalLessons || 0} Lessons</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openBookQR(book)}
                        icon={<QrCode className="w-3.5 h-3.5 text-brand-400" />}
                      >
                        View QR
                      </Button>

                      <Link
                        to={`/admin/books/${book.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
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
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Assigned Lessons ({assignedLessons.length})
            </h2>

            {assignedLessons.length === 0 ? (
              <EmptyState
                title="No assigned lessons"
                description="You currently don't have individual lessons assigned to you by an administrator."
                icon={<CheckSquare className="w-8 h-8 text-amber-400" />}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-brand-400 flex items-center gap-1 truncate">
                          <Layers className="w-3.5 h-3.5 shrink-0" />
                          {lesson.course?.title || lesson.book?.title || 'Book'}
                        </span>
                        <Badge variant={lesson.published ? 'success' : 'slate'} size="sm">
                          {lesson.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-base text-white mb-1">
                        Lesson #{lesson.lessonNumber || lesson.order}: {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">{lesson.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openLessonQR(lesson)}
                        icon={<QrCode className="w-3.5 h-3.5 text-brand-400" />}
                      >
                        View QR
                      </Button>

                      <Link
                        to={`/editor/lessons/${lesson.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
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
