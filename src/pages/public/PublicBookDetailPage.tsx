import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Book } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { AuthPromptModal } from '../../components/auth/AuthPromptModal';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Play,
  Layers,
  Clock,
  Bookmark,
  QrCode,
  Share2,
  Globe,
  Award,
  Calendar,
  FileText,
} from 'lucide-react';

export const PublicBookDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    if (slug) fetchBookDetail();
  }, [slug]);

  const fetchBookDetail = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ book: Book }>(`/books/${slug}`);
      setBook(data.book);
    } catch (err: any) {
      toast(err.message || 'Failed to load book details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!book) return;

    try {
      const data = await apiFetch<{ isBookmarked: boolean; message: string }>(`/bookmarks/books/${book.id}`, {
        method: 'POST',
      });
      setBook({ ...book, isBookmarked: data.isBookmarked });
      toast(data.message, 'success');
    } catch (err: any) {
      toast('Unable to save bookmark.', 'error');
    }
  };

  if (loading || !book) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  const completedCount = book.lessons?.filter((l) => l.completed).length || 0;
  const totalCount = book.lessons?.length || 0;
  const progressPercent = book.progressPercent || (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

  const firstLesson = book.lessons?.[0];
  const nextLesson = book.lessons?.find((l) => !l.completed) || firstLesson;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Back Link */}
      <Link
        to="/books"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Digital Library
      </Link>

      {/* Book Cover Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8">
          {/* Cover Image */}
          <div className="relative h-72 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden shadow-xl shrink-0">
            <img
              src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Book Metadata & Intro */}
          <div className="md:col-span-2 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="brand">{book.category || 'General'}</Badge>
                  {book.readingLevel && <Badge variant="slate">{book.readingLevel}</Badge>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleBookmark}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      book.isBookmarked
                        ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${book.isBookmarked ? 'fill-white' : ''}`} />
                    {book.isBookmarked ? '♥ Saved' : '♡ Save Book'}
                  </button>

                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="QR Code & Share"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">{book.title}</h1>
              <p className="text-sm text-brand-400 font-semibold">By {book.author || 'Hopenix Editorial'}</p>
              <p className="text-sm text-slate-300 leading-relaxed">{book.description}</p>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Total Lessons</span>
                <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                  <Layers className="w-3.5 h-3.5 text-brand-400" />
                  {totalCount} Lessons
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Language</span>
                <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                  <Globe className="w-3.5 h-3.5 text-brand-400" />
                  {book.language || 'English'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Reading Level</span>
                <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-brand-400" />
                  {book.readingLevel || 'Beginner'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Published Year</span>
                <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-400" />
                  {book.publicationYear || '2026'}
                </span>
              </div>
            </div>

            {/* Reading Actions */}
            <div className="space-y-3 pt-2">
              {user && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">Your Reading Progress</span>
                    <span className="font-bold text-brand-400">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div className="bg-brand-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              )}

              {nextLesson && (
                <Link
                  to={`/books/${book.slug}/lessons/${nextLesson.lessonNumber || nextLesson.order}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-2xl transition-all shadow-xl shadow-brand-500/25 w-full sm:w-auto"
                >
                  <span>{user && completedCount > 0 ? 'Continue Reading' : 'Start Reading Lesson 1'}</span>
                  <Play className="w-4 h-4 fill-white" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Syllabus Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-400" />
            Book Lessons & Table of Contents ({totalCount})
          </h2>
          <span className="text-xs text-slate-400">Publicly readable</span>
        </div>

        <div className="space-y-3">
          {book.lessons?.map((lesson, idx) => {
            const lessonNum = lesson.lessonNumber || idx + 1;
            return (
              <Link
                key={lesson.id}
                to={`/books/${book.slug}/lessons/${lessonNum}`}
                className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:border-brand-500/50 rounded-2xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      lesson.completed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {lesson.completed ? <CheckCircle className="w-5 h-5" /> : `L${lessonNum}`}
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-brand-400 transition-colors">
                      Lesson {lessonNum}: {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">{lesson.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {lesson.media && lesson.media.length > 0 && (
                    <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {lesson.media.length} Attachments
                    </span>
                  )}
                  <Button variant="ghost" size="sm" className="group-hover:text-brand-400">
                    Read →
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign In to Save Book"
        message="Create a free student account to save books to your bookmarks and sync your reading progress across devices."
      />

      {qrModalOpen && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          courseId={book.id}
          courseTitle={book.title}
        />
      )}
    </div>
  );
};
