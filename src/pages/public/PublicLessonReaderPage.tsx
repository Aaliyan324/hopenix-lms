import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Lesson, Book } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { getCompanySlug } from '../../lib/slug';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  Layers,
  BookOpen,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const PublicLessonReaderPage: React.FC = () => {
  const { slug, lessonNumber } = useParams<{ slug: string; lessonNumber: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [navigation, setNavigation] = useState<{
    prevLesson?: Lesson | null;
    nextLesson?: Lesson | null;
    siblingLessons?: Lesson[];
  }>({});

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (slug && lessonNumber) {
      fetchBookAndLesson();
    }
  }, [slug, lessonNumber]);

  const fetchBookAndLesson = async () => {
    try {
      setLoading(true);

      const bookData = await apiFetch<{ book: Book }>(`/books/${slug}`);
      setBook(bookData.book);

      const targetNum = parseInt(lessonNumber || '1', 10);
      const matchedLesson =
        bookData.book.lessons?.find((l) => l.lessonNumber === targetNum || l.order === targetNum) ||
        bookData.book.lessons?.[0];

      if (!matchedLesson) {
        toast('Chapter not found.', 'error');
        setLoading(false);
        return;
      }

      const lessonData = await apiFetch<{
        lesson: Lesson;
        navigation: { prevLesson?: Lesson; nextLesson?: Lesson; siblingLessons?: Lesson[] };
      }>(`/lessons/${matchedLesson.id}`);

      setLesson(lessonData.lesson);
      setNavigation(lessonData.navigation);
    } catch (err: any) {
      toast(err.message || 'Failed to load chapter content.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !lesson || !book) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-[500px] w-full rounded-3xl" />
      </div>
    );
  }

  const imageMedia = lesson.media?.filter((m) => m.type === 'IMAGE') || [];
  const videoMedia = lesson.media?.filter((m) => m.type === 'VIDEO') || [];
  const pdfMedia = lesson.media?.filter((m) => m.type === 'PDF') || [];

  const currentLessonNum = lesson.lessonNumber || lesson.order || 1;
  const totalLessons = navigation.siblingLessons?.length || 1;
  const readingPercent = Math.round((currentLessonNum / totalLessons) * 100);
  const companySlug = getCompanySlug(book.companyName);

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
      {/* Main Reader Column */}
      <div className="flex-1 space-y-8 min-w-0">
        {/* Top Header & Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <Link
            to={`/${companySlug}/books/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600 bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {book.title}
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:border-orange-300 hover:bg-orange-50 px-3.5 py-2 rounded-xl transition-all"
          >
            <Layers className="w-4 h-4" /> Chapter Index
          </button>
        </div>

        {/* Lesson Article Header */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 space-y-4 shadow-editorial">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-semibold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg border border-orange-200">
                <Sparkles className="w-3 h-3" />
                Chapter {currentLessonNum} of {totalLessons}
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              {readingPercent}% Complete
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 leading-tight">
            {lesson.title}
          </h1>

          {lesson.description && (
            <p className="text-base text-slate-600 font-sans leading-relaxed border-t border-slate-100 pt-4">
              {lesson.description}
            </p>
          )}

          {/* Minimalist Progress Line */}
          <div className="pt-2">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${readingPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* YouTube Video Player Embed */}
        {lesson.youtubeVideoId && (
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              Video Presentation
            </h3>
            <div className="bg-slate-900 border border-slate-200 rounded-2xl overflow-hidden shadow-editorial relative w-full aspect-video p-1">
              <iframe
                src={`https://www.youtube.com/embed/${encodeURIComponent(lesson.youtubeVideoId)}`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute top-1 left-1 right-1 bottom-1 w-[calc(100%-0.5rem)] h-[calc(100%-0.5rem)] rounded-xl border-0"
              />
            </div>
          </div>
        )}

        {/* Legacy Video Attachments */}
        {videoMedia.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              Video Clips
            </h3>
            {videoMedia.map((v) => (
              <div key={v.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-editorial p-2">
                <video src={v.url} controls className="w-full max-h-[500px] object-contain rounded-xl bg-slate-950" />
                <div className="p-3 text-sm font-medium text-slate-700 flex items-center justify-between">
                  <span>{v.name}</span>
                  <a href={v.url} target="_blank" rel="noreferrer" className="text-orange-600 font-semibold hover:text-orange-700 underline transition-colors">
                    Download Video ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rich Editorial Article Body Content */}
        {lesson.content && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-editorial">
            <div
              className="prose max-w-none font-serif text-slate-900 text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        )}

        {/* Lesson Diagrams & Visuals */}
        {imageMedia.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              Figures & Illustrations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {imageMedia.map((img) => (
                <div key={img.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden p-2 shadow-editorial">
                  <img src={img.url} alt={img.name} className="w-full h-56 object-cover rounded-xl" />
                  <p className="text-sm font-medium text-slate-600 p-2 truncate text-center font-sans">{img.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Documents & Attachments */}
        {pdfMedia.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Downloadable Documents
            </h3>
            <div className="space-y-2">
              {pdfMedia.map((pdf) => (
                <div
                  key={pdf.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-editorial hover:shadow-editorial transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center text-lg shrink-0">
                      <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate" title={pdf.name}>{pdf.name}</p>
                      <p className="text-xs text-slate-500 font-medium">PDF Document</p>
                    </div>
                  </div>

                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-500/25 shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" /> View PDF
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chapter Bottom Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
          {navigation.prevLesson ? (
            <Link
              to={`/${companySlug}/books/${slug}/lessons/${navigation.prevLesson.lessonNumber || navigation.prevLesson.order}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl text-sm font-semibold text-slate-700 hover:text-orange-600 transition-all shadow-xs w-full sm:w-auto justify-center"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Chapter
            </Link>
          ) : (
            <div />
          )}

          {navigation.nextLesson && (
            <Link
              to={`/${companySlug}/books/${slug}/lessons/${navigation.nextLesson.lessonNumber || navigation.nextLesson.order}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-orange-500/25 active:scale-[0.99] w-full sm:w-auto justify-center"
            >
              Next Chapter <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Table of Contents Index Drawer Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-30 w-80 bg-white border-l lg:border lg:border-slate-200/80 rounded-none lg:rounded-3xl p-5 overflow-y-auto space-y-4 transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } shrink-0 shadow-lg lg:shadow-editorial`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-serif font-bold text-sm text-slate-900 flex items-center gap-1.5 truncate">
              <div className="p-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-600">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              {book.title}
            </h3>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Chapter Syllabus</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-orange-600 p-1.5 bg-slate-100 rounded-xl border border-slate-200 transition-colors hover:bg-orange-50 hover:border-orange-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          {navigation.siblingLessons?.map((s) => {
            const num = s.lessonNumber || s.order;
            const isActive = s.id === lesson.id;
            return (
              <Link
                key={s.id}
                to={`/${companySlug}/books/${slug}/lessons/${num}`}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white border-orange-500 font-semibold shadow-md shadow-orange-500/25'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-300 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`text-[10px] font-mono shrink-0 px-2 py-0.5 rounded-lg ${isActive ? 'bg-orange-400/30 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    C{num}
                  </span>
                  <span className={`truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>{s.title}</span>
                </div>
                {isActive && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/90">
                    Reading
                    <CheckCircle2 className="w-3 h-3" />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </aside>
    </div>
  );
};