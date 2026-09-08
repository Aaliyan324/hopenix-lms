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
      <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-36 rounded-md" />
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const totalCount = book.lessons?.length || 0;
  const firstLesson = book.lessons?.[0];
  const companySlug = getCompanySlug(book.companyName);

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-24 px-4 sm:px-6">
      {/* Back Button */}
      <Link
        to={user ? (user.role === 'ADMIN' ? '/admin/books' : '/editor') : '/'}
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-200 px-4 py-2 rounded-lg transition-all shadow-xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> {user ? 'Back to Workspace' : 'Back to Library'}
      </Link>

      {/* Hero Section: Editorial Book Presentation */}
      <div className="bg-white border border-stone-200/80 rounded-xl p-6 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-start">
          {/* Authentic Book Cover Presentation */}
          <div className="md:col-span-4 flex justify-center">
            <div className="relative w-56 sm:w-64 h-80 sm:h-96 rounded-r-lg rounded-l-xs bg-stone-900 shadow-book border-r-2 border-t border-b border-stone-200 overflow-hidden group">
              {/* Cover Artwork */}
              <img
                src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                alt={book.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent p-4 flex flex-col justify-end text-left">
                {book.category && (
                  <span className="self-start text-[10px] font-semibold text-stone-900 bg-white/90 px-2 py-0.5 rounded shadow-xs mb-2">
                    {book.category}
                  </span>
                )}
                <h3 className="font-serif text-lg font-bold text-stone-50 leading-tight line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-[11px] font-medium text-stone-300 mt-1">
                  {book.author || 'Editorial Author'}
                </p>
              </div>
            </div>
          </div>

          {/* Book Metadata & Actions */}
          <div className="md:col-span-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {book.category && (
                    <Badge variant="brand" size="sm">
                      {book.category}
                    </Badge>
                  )}
                  {book.readingLevel && (
                    <Badge variant="slate" size="sm">
                      Level: {book.readingLevel}
                    </Badge>
                  )}
                </div>

                <button
                  onClick={() => setQrModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 hover:bg-stone-200/70 text-xs font-semibold transition-colors cursor-pointer"
                  title="Share Publication QR Code"
                >
                  <QrCode className="w-3.5 h-3.5 text-stone-600" />
                  <span>Share QR Code</span>
                </button>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
                {book.title}
              </h1>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
                By {book.author || 'Editorial Author'}
              </p>
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                {book.description || 'An engaging educational publication designed for comprehensive reading and instruction.'}
              </p>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-stone-200 text-xs">
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/60">
                <span className="text-stone-500 block font-medium">Chapters</span>
                <span className="font-bold text-stone-900 flex items-center gap-1.5 mt-0.5 text-sm font-sans">
                  <Layers className="w-3.5 h-3.5 text-stone-600" />
                  {totalCount} Total
                </span>
              </div>
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/60">
                <span className="text-stone-500 block font-medium">Language</span>
                <span className="font-bold text-stone-900 flex items-center gap-1.5 mt-0.5 text-sm font-sans">
                  <Globe className="w-3.5 h-3.5 text-stone-600" />
                  {book.language || 'English'}
                </span>
              </div>
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/60">
                <span className="text-stone-500 block font-medium">Reading Level</span>
                <span className="font-bold text-stone-900 flex items-center gap-1.5 mt-0.5 text-sm font-sans">
                  <Award className="w-3.5 h-3.5 text-stone-600" />
                  {book.readingLevel || 'Standard'}
                </span>
              </div>
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/60">
                <span className="text-stone-500 block font-medium">Published</span>
                <span className="font-bold text-stone-900 flex items-center gap-1.5 mt-0.5 text-sm font-sans">
                  <Calendar className="w-3.5 h-3.5 text-stone-600" />
                  {book.publicationYear || '2026'}
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              {firstLesson && (
                <Link
                  to={`/${companySlug}/books/${book.slug}/lessons/${firstLesson.lessonNumber || firstLesson.order}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-semibold rounded-lg transition-all shadow-xs"
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
      <div className="space-y-4">
        <div className="border-b border-stone-200 pb-3">
          <h2 className="font-serif text-2xl font-bold text-stone-900">Table of Contents</h2>
          <p className="text-xs text-stone-500 font-sans mt-0.5">Explore the chapters included in this publication</p>
        </div>

        <div className="space-y-3">
          {book.lessons?.map((lesson, idx) => {
            const lessonNum = lesson.lessonNumber || idx + 1;

            return (
              <Link
                key={lesson.id}
                to={`/${companySlug}/books/${book.slug}/lessons/${lessonNum}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-lg border border-stone-200 bg-white hover:border-stone-400 hover:shadow-xs transition-all group"
              >
                <div className="flex items-center gap-4 mb-2 sm:mb-0">
                  <div className="w-10 h-10 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center font-serif font-bold text-sm text-stone-900 shrink-0">
                    {lessonNum}
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-stone-700 transition-colors">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-xs text-stone-600 line-clamp-1 font-sans">{lesson.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  {lesson.media && lesson.media.length > 0 && (
                    <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded">
                      {lesson.media.length} Attachments
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 group-hover:text-stone-700 transition-colors">
                    <span>Read Chapter</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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