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
  Shield,
  TrendingUp,
  Award,
  Calendar,
  ChevronRight,
  Eye,
  Star,
  Users,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
};

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

  // Calculate stats
  const totalAssigned = assignedBooks.length + assignedLessons.length;
  const publishedBooks = assignedBooks.filter(b => b.published).length;
  const publishedLessons = assignedLessons.filter(l => l.published).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-56 w-full rounded-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
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
            <Shield className="w-48 h-48 text-white" />
          </div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold uppercase tracking-wider font-['Poppins',sans-serif]">
                  <Shield className="w-3.5 h-3.5" />
                  Editor Workspace
                </div>
                <h1 className="font-['Poppins',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  Editor Dashboard
                </h1>
                <p className="text-sm sm:text-base text-orange-100 max-w-2xl leading-relaxed">
                  Books and lessons explicitly assigned to your editor account. You can edit rich text, 
                  media, and chapter content for your assigned items.
                </p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <CheckSquare className="w-4 h-4" />
                    <span className="font-semibold text-white">{totalAssigned}</span>
                    <span>Assigned</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-semibold text-white">{assignedBooks.length}</span>
                    <span>Books</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <Layers className="w-4 h-4" />
                    <span className="font-semibold text-white">{assignedLessons.length}</span>
                    <span>Lessons</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <Award className="w-4 h-4" />
                    <span className="font-semibold text-white">{publishedBooks + publishedLessons}</span>
                    <span>Published</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => fetchEditorData()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-orange-600 hover:bg-orange-50 text-sm font-semibold rounded-2xl transition-all shadow-lg shadow-orange-700/30 active:scale-[0.98] font-['Poppins',sans-serif]"
              >
                <Sparkles className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Cards */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5"
        >
          {[
            { label: 'Total Assigned', value: totalAssigned, icon: CheckSquare, color: 'orange' },
            { label: 'Books', value: assignedBooks.length, icon: BookOpen, color: 'blue' },
            { label: 'Lessons', value: assignedLessons.length, icon: Layers, color: 'purple' },
            { label: 'Published', value: publishedBooks + publishedLessons, icon: Award, color: 'emerald' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            const colors = {
              orange: 'bg-orange-50 text-orange-600 border-orange-200',
              blue: 'bg-blue-50 text-blue-600 border-blue-200',
              purple: 'bg-purple-50 text-purple-600 border-purple-200',
              emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
            };
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(249,115,22,0.08)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.12)] transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 font-['Inter',sans-serif]">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold font-['Poppins',sans-serif] text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${colors[stat.color as keyof typeof colors]}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Assigned Books Section */}
        <motion.div variants={itemVariants} className="space-y-5">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <h2 className="text-lg font-['Poppins',sans-serif] font-bold text-slate-900 flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600">
                <BookOpen className="w-5 h-5" />
              </div>
              Assigned Books ({assignedBooks.length})
            </h2>
          </div>

          {assignedBooks.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgba(249,115,22,0.08)]">
              <EmptyState
                title="No assigned books"
                description="You currently don't have entire books assigned to you by an administrator."
                icon={<BookOpen className="w-10 h-10 text-slate-400" />}
              />
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {assignedBooks.map((book) => (
                <motion.div
                  key={book.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl p-5 shadow-[0_8px_30px_rgba(249,115,22,0.08)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.15)] hover:border-orange-300 transition-all duration-300 flex flex-col justify-between space-y-4 group"
                >
                  <div className="flex gap-4">
                    <img
                      src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                      alt={book.title}
                      className="w-16 h-20 rounded-xl object-cover border border-orange-200 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <Badge variant={book.published ? 'success' : 'slate'} size="sm" className={`font-['Inter',sans-serif] text-[10px] ${
                        book.published 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {book.published ? 'Published' : 'Draft'}
                      </Badge>
                      <h3 className="font-['Poppins',sans-serif] font-bold text-base text-slate-900 truncate mt-1">{book.title}</h3>
                      <p className="text-xs text-slate-500 truncate font-['Inter',sans-serif]">By {book.author || 'Editorial'}</p>
                      <p className="text-xs text-slate-600 font-semibold mt-1 flex items-center gap-1 font-['Inter',sans-serif]">
                        <Layers className="w-3 h-3 text-orange-500" />
                        {book.totalLessons || 0} Lessons
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-orange-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openBookQR(book)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold rounded-xl border border-orange-200 hover:border-orange-300 transition-all font-['Inter',sans-serif]"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      View QR
                    </button>

                    <Link
                      to={`/admin/books/${book.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-orange-500/25 font-['Poppins',sans-serif]"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit Book
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Assigned Lessons Section */}
        <motion.div variants={itemVariants} className="space-y-5">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <h2 className="text-lg font-['Poppins',sans-serif] font-bold text-slate-900 flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600">
                <Layers className="w-5 h-5" />
              </div>
              Assigned Lessons ({assignedLessons.length})
            </h2>
          </div>

          {assignedLessons.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgba(249,115,22,0.08)]">
              <EmptyState
                title="No assigned lessons"
                description="You currently don't have individual lessons assigned to you by an administrator."
                icon={<CheckSquare className="w-10 h-10 text-slate-400" />}
              />
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {assignedLessons.map((lesson) => (
                <motion.div
                  key={lesson.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl p-5 shadow-[0_8px_30px_rgba(249,115,22,0.08)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.15)] hover:border-orange-300 transition-all duration-300 flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 truncate font-['Inter',sans-serif]">
                        <BookOpen className="w-3.5 h-3.5 shrink-0 text-orange-500" />
                        {lesson.course?.title || lesson.book?.title || 'Book'}
                      </span>
                      <Badge variant={lesson.published ? 'success' : 'slate'} size="sm" className={`font-['Inter',sans-serif] text-[10px] ${
                        lesson.published 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {lesson.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>

                    <h3 className="font-['Poppins',sans-serif] font-bold text-base text-slate-900 mb-1">
                      Lesson #{lesson.lessonNumber || lesson.order}: {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 font-['Inter',sans-serif]">{lesson.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-orange-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openLessonQR(lesson)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold rounded-xl border border-orange-200 hover:border-orange-300 transition-all font-['Inter',sans-serif]"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      View QR
                    </button>

                    <Link
                      to={`/editor/lessons/${lesson.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-orange-500/25 font-['Poppins',sans-serif]"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit Content
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Quick Tip */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-2xl p-4 sm:p-5"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-orange-500 text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 font-['Poppins',sans-serif]">Editor Tip</h4>
              <p className="text-xs text-slate-600 font-['Inter',sans-serif]">
                You can edit content for all assigned books and lessons. Changes will be reviewed by administrators before publishing.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

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