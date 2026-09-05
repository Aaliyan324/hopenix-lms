import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Book, Lesson } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { BookCard } from '../../components/ui/BookCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { PlayfulBanner } from '../../components/ui/PlayfulBanner';
import { AchievementBadge } from '../../components/ui/AchievementBadge';
import {
  GraduationCap,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Play,
  Clock,
  Sparkles,
  Trophy,
  Flame,
  Star,
  Compass,
  ArrowRight,
  Heart,
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

  const totalCompletedCount = data?.completedBooks?.length || 0;
  const totalSavedCount = data?.savedBooks?.length || 0;
  const totalBookmarksCount = data?.bookmarkedLessons?.length || 0;
  const totalContinueCount = data?.continueReading?.length || 0;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Gamified Welcome Banner */}
      <PlayfulBanner
        badgeText="Personal Student Reading Portal"
        badgeIcon={<GraduationCap className="w-4 h-4 text-brand-300" />}
        title={`👋 Welcome back, ${user?.name || 'Reader'}!`}
        subtitle="Resume your interactive reading quest, check saved adventures, and unlock reading achievements."
        variant="purple"
      >
        {/* Stats Snapshot Row inside Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 max-w-3xl">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
            <span className="text-2xl font-black text-white">{totalContinueCount}</span>
            <span className="text-[11px] font-extrabold text-brand-200 block">In Progress</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
            <span className="text-2xl font-black text-pink-300">{totalSavedCount}</span>
            <span className="text-[11px] font-extrabold text-pink-200 block">Saved Books</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
            <span className="text-2xl font-black text-emerald-300">{totalCompletedCount}</span>
            <span className="text-[11px] font-extrabold text-emerald-200 block">Completed</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
            <span className="text-2xl font-black text-amber-300">{totalBookmarksCount}</span>
            <span className="text-[11px] font-extrabold text-amber-200 block">Bookmarks</span>
          </div>
        </div>
      </PlayfulBanner>

      {/* Gamified Tabs Toolbar */}
      <div className="flex items-center gap-2 border-b border-purple-500/20 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('continue')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
            activeTab === 'continue'
              ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-lg shadow-brand-500/25 border border-pink-400/30 scale-105'
              : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          Continue Reading 🚀 ({totalContinueCount})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25 border border-rose-400/30 scale-105'
              : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Heart className="w-4 h-4 text-pink-300 fill-pink-300" />
          My Saved Books 💖 ({totalSavedCount})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 border border-teal-400/30 scale-105'
              : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          Completed Books 🏆 ({totalCompletedCount})
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
            activeTab === 'bookmarks'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/25 border border-amber-400/30 scale-105'
              : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4 text-amber-300 fill-amber-300" />
          Bookmarked Lessons ⭐ ({totalBookmarksCount})
        </button>
      </div>

      {/* Tab Content Display */}
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
                  title="No active reading quests yet!"
                  description="Browse our magical digital library and start reading your first book to track progress automatically."
                  actionText="Explore Digital Library 📚"
                  onAction={() => (window.location.href = '/books')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.continueReading.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      progressPercent={book.progressPercent}
                      completedLessons={book.completedLessons}
                      totalLessonsCount={book.totalLessons}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Books Tab */}
          {activeTab === 'saved' && (
            <div className="space-y-6">
              {!data?.savedBooks || data.savedBooks.length === 0 ? (
                <EmptyState
                  title="Your bookshelf is empty!"
                  description="Click the ♡ Save Book button on any book page to save it into your personal favorite collection."
                  actionText="Find Books to Save 💖"
                  onAction={() => (window.location.href = '/books')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.savedBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      isSaved={true}
                      progressPercent={book.progressPercent}
                    />
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
                  title="No completed trophies yet!"
                  description="When you finish 100% of the lessons in a digital book, it will appear here with your achievement crown."
                  actionText="Continue Reading Quest 🚀"
                  onAction={() => setActiveTab('continue')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.completedBooks.map((book) => (
                    <div
                      key={book.id}
                      className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/40 rounded-3xl overflow-hidden shadow-xl p-6 space-y-4 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-black text-xl shrink-0 shadow-inner">
                          🏆
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-white">{book.title}</h3>
                          <p className="text-xs text-emerald-400 font-bold mt-0.5">100% Mastered & Completed</p>
                        </div>
                      </div>

                      <Link
                        to={`/books/${book.slug}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        Review Syllabus →
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
                  title="No bookmarked chapters"
                  description="Bookmark individual lessons while reading to access key reference chapters quickly anytime."
                />
              ) : (
                <div className="space-y-3">
                  {data.bookmarkedLessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      to={`/books/${lesson.course?.slug || 'book'}/lessons/${lesson.lessonNumber || lesson.order}`}
                      className="flex items-center justify-between p-4 sm:p-5 bg-slate-900/90 border border-slate-800 hover:border-brand-500/50 rounded-2xl transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                          <Bookmark className="w-5 h-5 text-amber-300 fill-amber-300" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-white group-hover:text-brand-300 transition-colors">
                            Lesson {lesson.lessonNumber || lesson.order}: {lesson.title}
                          </h4>
                          {lesson.course && (
                            <p className="text-xs text-slate-400 font-medium">Book: {lesson.course.title}</p>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-extrabold text-brand-300 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Read Lesson <ArrowRight className="w-4 h-4" />
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Gamification Achievements Section */}
      <div className="space-y-5 pt-6 border-t border-purple-500/20">
        <SectionHeader
          badge="Gamification"
          title="🏆 Reading Quest Achievements"
          subtitle="Earn badges as you read books, complete chapters, and bookmark key knowledge."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AchievementBadge
            icon="🌟"
            title="First Reader"
            description="Start reading your first digital book."
            unlocked={totalContinueCount > 0 || totalCompletedCount > 0}
          />
          <AchievementBadge
            icon="📚"
            title="Book Collector"
            description="Save 3 or more books to collection."
            unlocked={totalSavedCount >= 3}
            progressText={`${totalSavedCount}/3 saved`}
          />
          <AchievementBadge
            icon="⭐"
            title="Knowledge Star"
            description="Bookmark 2 or more lesson chapters."
            unlocked={totalBookmarksCount >= 2}
            progressText={`${totalBookmarksCount}/2 bookmarked`}
          />
          <AchievementBadge
            icon="👑"
            title="Library Master"
            description="Complete 100% of any book."
            unlocked={totalCompletedCount > 0}
            progressText={`${totalCompletedCount}/1 completed`}
          />
        </div>
      </div>
    </div>
  );
};
