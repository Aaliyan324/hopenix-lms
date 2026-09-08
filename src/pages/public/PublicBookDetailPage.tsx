import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Book } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { AuthPromptModal } from '../../components/auth/AuthPromptModal';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { getCompanySlug } from '../../lib/slug';
import {
  ArrowLeft,
  BookOpen,
  Layers,
  Globe,
  Award,
  Calendar,
  QrCode,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const PublicBookDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

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
      toast(err.message || 'Failed to load publication details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !book) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-36 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const totalCount = book.lessons?.length || 0;
  const firstLesson = book.lessons?.[0];
  const companySlug = getCompanySlug(book.companyName);

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-24 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link
        to={user ? (user.role === 'ADMIN' ? '/admin/books' : '/editor') : '/'}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600 bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" /> {user ? 'Back to Workspace' : 'Back to Library'}
      </Link>

      {/* Hero Section: Editorial Book Presentation */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-editorial">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-start">
          {/* Authentic Book Cover Presentation */}
          <div className="md:col-span-4 flex justify-center">
            <div className="relative w-56 sm:w-64 h-80 sm:h-96 rounded-xl shadow-editorial overflow-hidden group">
              {/* Cover Artwork */}
              <img
                src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                alt={book.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent p-5 flex flex-col justify-end text-left">
                {book.category && (
                  <span className="self-start text-[10px] font-semibold text-slate-900 bg-white/90 px-2.5 py-1 rounded-lg shadow-xs mb-2">
                    {book.category}
                  </span>
                )}
                <h3 className="font-serif text-lg font-bold text-white leading-tight line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-xs font-medium text-slate-300 mt-1">
                  {book.author || 'Editorial Author'}
                </p>
              </div>
              {/* Corner badge */}
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-orange-500/25">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </span>
              </div>
            </div>
          </div>

          {/* Book Metadata & Actions */}
          <div className="md:col-span-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {book.category && (
                    <Badge variant="brand" size="sm" className="bg-orange-50 text-orange-700 border-orange-200">
                      {book.category}
                    </Badge>
                  )}
                  {book.readingLevel && (
                    <Badge variant="slate" size="sm" className="bg-slate-50 text-slate-700 border-slate-200">
                      Level: {book.readingLevel}
                    </Badge>
                  )}
                </div>

                <button
                  onClick={() => setQrModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-300 text-xs font-semibold transition-all shadow-xs"
                  title="Share Publication QR Code"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Share QR Code</span>
                </button>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                {book.title}
              </h1>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                By {book.author || 'Editorial Author'}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed font-sans max-w-2xl">
                {book.description || 'An engaging educational publication designed for comprehensive reading and instruction.'}
              </p>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-200 text-sm">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 hover:border-orange-300 transition-colors">
                <span className="text-slate-500 block font-medium text-xs">Chapters</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Layers className="w-4 h-4 text-orange-500" />
                  {totalCount} Total
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 hover:border-orange-300 transition-colors">
                <span className="text-slate-500 block font-medium text-xs">Language</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Globe className="w-4 h-4 text-orange-500" />
                  {book.language || 'English'}
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 hover:border-orange-300 transition-colors">
                <span className="text-slate-500 block font-medium text-xs">Reading Level</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Award className="w-4 h-4 text-orange-500" />
                  {book.readingLevel || 'Standard'}
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 hover:border-orange-300 transition-colors">
                <span className="text-slate-500 block font-medium text-xs">Published</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  {book.publicationYear || '2026'}
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              {firstLesson && (
                <Link
                  to={`/${companySlug}/books/${book.slug}/lessons/${firstLesson.lessonNumber || firstLesson.order}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-2xl transition-all shadow-lg shadow-orange-500/25 active:scale-[0.99]"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Start Reading Chapter 1</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table of Contents / Chapter List */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <div className="p-2 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-slate-900">Table of Contents</h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Explore the chapters included in this publication</p>
          </div>
          <span className="ml-auto text-sm font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
            {totalCount} chapters
          </span>
        </div>

        <div className="space-y-3">
          {book.lessons?.map((lesson, idx) => {
            const lessonNum = lesson.lessonNumber || idx + 1;

            return (
              <Link
                key={lesson.id}
                to={`/${companySlug}/books/${book.slug}/lessons/${lessonNum}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-orange-300 hover:shadow-editorial transition-all group"
              >
                <div className="flex items-center gap-4 mb-2 sm:mb-0">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center font-serif font-bold text-sm text-orange-700 shrink-0 group-hover:bg-orange-100 group-hover:border-orange-300 transition-colors">
                    {lessonNum}
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-orange-600 transition-colors">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-xs text-slate-600 line-clamp-1 font-sans">{lesson.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {lesson.media && lesson.media.length > 0 && (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {lesson.media.length} Attachments
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 group-hover:text-orange-700 transition-colors">
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
        title="Authentication Required"
        message="Sign in as an Admin or Editor to access portal management."
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