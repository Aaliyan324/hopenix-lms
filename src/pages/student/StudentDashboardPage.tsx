import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Book, Lesson } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import {
  GraduationCap,
  BookOpen,
  Bookmark,
  CheckCircle,
  Play,
  Clock,
  Layers,
  History,
  Sparkles,
} from 'lucide-react';

interface StudentDashboardData {
  continueReading: (Book & { currentLesson?: Lesson })[];
  completedBooks: Book[];
  savedBooks: Book[];
  bookmarkedLessons: Lesson[];
  recentReading: {
    lessonId: string;
    lessonTitle: string;
    lessonNumber: number;
    lessonSlug: string;
    bookTitle: string;
    bookSlug: string;
    lastReadAt: string;
    completed: boolean;
  }[];
}

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'continue' | 'saved' | 'completed' | 'bookmarks'>('continue');

  useEffect(() => {
    fetchStudentDashboard();
  }, []);

  const fetchStudentDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<StudentDashboardData>('/progress/dashboard');
      setData(res);
    } catch (err) {
      console.error('Failed to fetch student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Welcome Banner Card */}
      <div className="relative bg-gradient-to-r from-brand-950 via-slate-900 to-slate-950 border border-brand-500/20 rounded-3xl p-8 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full border border-brand-500/30 text-xs font-semibold">
            <GraduationCap className="w-4 h-4" /> Personal Student Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white">Welcome back, {user?.name}!</h1>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Manage your personal reading collection, resume reading where you left off, and track your completed digital books and lesson bookmarks across devices.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('continue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'continue'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          Continue Reading ({data?.continueReading?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'saved'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          My Saved Books ({data?.savedBooks?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'completed'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Completed Books ({data?.completedBooks?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'bookmarks'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4 text-amber-400" />
          Bookmarked Lessons ({data?.bookmarkedLessons?.length || 0})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div>
          {/* Continue Reading Tab */}
          {activeTab === 'continue' && (
            <div className="space-y-6">
              {!data?.continueReading || data.continueReading.length === 0 ? (
                <EmptyState
                  title="No active reading sessions"
                  description="Browse the digital library and open a book to start tracking your reading progress automatically."
                  actionText="Browse Digital Library"
                  onAction={() => window.location.href = '/books'}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.continueReading.map((book) => {
                    const currentLessonNum = book.currentLesson?.lessonNumber || book.currentLesson?.order || 1;
                    return (
                      <div
                        key={book.id}
                        className="group bg-slate-900 border border-slate-800 hover:border-brand-500/50 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-200"
                      >
                        <div>
                          <div className="relative h-44 bg-slate-950 overflow-hidden">
                            <img
                              src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                            {book.category && (
                              <span className="absolute top-3 left-3 text-[11px] font-semibold text-white bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700">
                                {book.category}
                              </span>
                            )}
                          </div>

                          <div className="p-5 space-y-4">
                            <div>
                              <h3 className="font-bold text-lg text-white group-hover:text-brand-400 transition-colors line-clamp-1">
                                {book.title}
                              </h3>
                              {book.currentLesson && (
                                <p className="text-xs text-brand-400 font-medium mt-1 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  Current: Lesson {currentLessonNum} — {book.currentLesson.title}
                                </p>
                              )}
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-800">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-300">Reading Progress</span>
                                <span className="font-bold text-brand-400">{book.progressPercent || 0}%</span>
                              </div>
                              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                                <div
                                  className="bg-gradient-to-r from-brand-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${book.progressPercent || 0}%` }}
                                />
                              </div>
                              <p className="text-[11px] text-slate-400">
                                {book.completedLessons || 0} of {book.totalLessons || 0} lessons completed
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 pt-0">
                          <Link
                            to={`/books/${book.slug}/lessons/${currentLessonNum}`}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20"
                          >
                            <span>Continue Lesson {currentLessonNum}</span>
                            <Play className="w-4 h-4 fill-white" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Saved Books Tab */}
          {activeTab === 'saved' && (
            <div className="space-y-6">
              {!data?.savedBooks || data.savedBooks.length === 0 ? (
                <EmptyState
                  title="No saved books"
                  description="Click the ♡ Save Book button on any book page to store it in your personal saved books list."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.savedBooks.map((book) => (
                    <Link
                      key={book.id}
                      to={`/books/${book.slug}`}
                      className="group bg-slate-900 border border-slate-800 hover:border-brand-500/50 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-200"
                    >
                      <div>
                        <div className="relative h-44 bg-slate-950 overflow-hidden">
                          <img
                            src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-3 right-3 p-1.5 rounded-xl bg-rose-500 text-white border border-rose-400 shadow-md text-xs font-semibold">
                            ♥ Saved
                          </span>
                        </div>

                        <div className="p-5 space-y-2">
                          <h3 className="font-bold text-lg text-white group-hover:text-brand-400 transition-colors line-clamp-1">
                            {book.title}
                          </h3>
                          <p className="text-xs text-slate-400">By {book.author || 'Hopenix Editorial'}</p>
                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {book.shortDescription || book.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-5 pt-0 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span className="font-medium">{book.totalLessons || 0} Lessons</span>
                        <span className="text-brand-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                          Read Book →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Completed Books Tab */}
          {activeTab === 'completed' && (
            <div className="space-y-6">
              {!data?.completedBooks || data.completedBooks.length === 0 ? (
                <EmptyState
                  title="No completed books yet"
                  description="When you finish 100% of the lessons in a digital book, it will appear here as completed!"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.completedBooks.map((book) => (
                    <div
                      key={book.id}
                      className="bg-slate-900 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-white">{book.title}</h3>
                          <p className="text-xs text-emerald-400 font-semibold">100% Completed</p>
                        </div>
                      </div>

                      <Link
                        to={`/books/${book.slug}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
                      >
                        Review Syllabus
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bookmarked Lessons Tab */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-4">
              {!data?.bookmarkedLessons || data.bookmarkedLessons.length === 0 ? (
                <EmptyState
                  title="No bookmarked lessons"
                  description="Bookmark individual lessons while reading to access key reference chapters quickly."
                />
              ) : (
                <div className="space-y-3">
                  {data.bookmarkedLessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      to={`/books/${lesson.course?.slug || 'book'}/lessons/${lesson.lessonNumber || lesson.order}`}
                      className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:border-brand-500/50 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors">
                            Lesson {lesson.lessonNumber || lesson.order}: {lesson.title}
                          </h4>
                          {lesson.course && (
                            <p className="text-xs text-slate-400">Book: {lesson.course.title}</p>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-brand-400 group-hover:translate-x-1 transition-transform">
                        Read Lesson →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
