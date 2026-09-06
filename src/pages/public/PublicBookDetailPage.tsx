import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Book } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ReadingProgress } from '../../components/ui/ReadingProgress';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useToast } from '../../components/ui/Toast';
import { AuthPromptModal } from '../../components/auth/AuthPromptModal';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { getCompanySlug } from '../../lib/slug';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Play,
  Layers,
  Clock,
  Bookmark,
  QrCode,
  Globe,
  Award,
  Calendar,
  Sparkles,
  Heart,
  Lock,
  ArrowRight,
  Compass,
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

  if (loading || !book) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-80 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  const totalCount = book.lessons?.length || 0;
  const firstLesson = book.lessons?.[0];
  const companySlug = getCompanySlug(book.companyName);

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16">
      {/* Back Button */}
      <Link
        to={user ? (user.role === 'ADMIN' ? '/admin/books' : '/editor') : '/login'}
        className="inline-flex items-center gap-2 text-xs font-extrabold text-brand-300 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> {user ? 'Back to My Library' : 'Back to Login'}
      </Link>

      {/* Book Cover Header Banner Card */}
      <div className="relative bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-950 border border-purple-500/25 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cover Image */}
          <div className="relative h-72 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-purple-500/30 shrink-0 group">
            <img
              src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {book.category && (
              <span className="absolute top-3 left-3 text-[11px] font-black text-white bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-full border border-purple-500/30">
                ✨ {book.category}
              </span>
            )}
          </div>

          {/* Book Metadata & Actions */}
          <div className="md:col-span-2 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="purple">{book.category || 'General'}</Badge>
                  {book.readingLevel && <Badge variant="pink">Level: {book.readingLevel}</Badge>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-brand-300 hover:text-white hover:border-brand-500 text-xs font-extrabold transition-all cursor-pointer"
                    title="QR Code & Share"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Share QR</span>
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {book.title}
              </h1>
              <p className="text-sm font-bold text-brand-300">By {book.author || 'Hopenix Editorial'}</p>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {book.description || 'Embark on this interactive reading journey filled with rich lessons and knowledge.'}
              </p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-purple-500/20 text-xs">
              <div>
                <span className="text-slate-400 block font-bold">Total Lessons</span>
                <span className="font-extrabold text-white flex items-center gap-1 mt-0.5">
                  <Layers className="w-3.5 h-3.5 text-brand-400" />
                  {totalCount} Chapters
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Language</span>
                <span className="font-extrabold text-white flex items-center gap-1 mt-0.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  {book.language || 'English'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Reading Level</span>
                <span className="font-extrabold text-white flex items-center gap-1 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  {book.readingLevel || 'Beginner'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Published</span>
                <span className="font-extrabold text-white flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-pink-400" />
                  {book.publicationYear || '2026'}
                </span>
              </div>
            </div>

            {/* Reading Actions */}
            <div className="space-y-4 pt-1">
              {firstLesson && (
                <Link
                  to={`/${companySlug}/books/${book.slug}/lessons/${firstLesson.lessonNumber || firstLesson.order}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white text-sm font-extrabold rounded-2xl transition-all shadow-xl shadow-brand-500/25 border border-pink-400/30 hover:scale-[1.02] active:scale-95"
                >
                  <span>Start Reading Chapter 1 📖</span>
                  <Play className="w-4 h-4 fill-white" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reading Journey Timeline / Table of Contents */}
      <div className="space-y-6">
        <SectionHeader
          badge="Syllabus Timeline"
          title="🗺️ Your Reading Journey & Chapters"
          subtitle="Explore all structured lessons in order. Click any chapter to read directly."
        />

        <div className="space-y-3">
          {book.lessons?.map((lesson, idx) => {
            const lessonNum = lesson.lessonNumber || idx + 1;

            return (
              <Link
                key={lesson.id}
                to={`/${companySlug}/books/${book.slug}/lessons/${lessonNum}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-300 group bg-slate-900/60 border-slate-800/80 hover:border-purple-500/40"
              >
                <div className="flex items-center gap-4 mb-2 sm:mb-0">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border shadow-inner transition-transform group-hover:scale-105 bg-slate-950 text-slate-400 border-slate-800">
                    {`C${lessonNum}`}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-300">Chapter {lessonNum}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-brand-300 transition-colors">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-xs text-slate-300 line-clamp-1">{lesson.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  {lesson.media && lesson.media.length > 0 && (
                    <span className="text-[11px] font-bold text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-500/30">
                      📎 {lesson.media.length} Media
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-300 group-hover:text-white transition-colors">
                    <span>Read Chapter</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign In Required"
        message="Sign in as an Admin or Editor to access administrative and editorial features."
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
