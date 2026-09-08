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
      <div className="space-y-6 max-w-6xl mx-auto px-4 py-12">
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
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
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto pb-20 px-4 sm:px-6">
      {/* Main Reader Column */}
      <div className="flex-1 space-y-8 min-w-0">
        {/* Top Header & Navigation */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <Link
            to={`/${companySlug}/books/${slug}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-200 px-4 py-2 rounded-lg transition-all shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to {book.title}
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 text-xs font-semibold text-stone-900 bg-stone-100 border border-stone-200 px-3.5 py-2 rounded-lg"
          >
            <Layers className="w-3.5 h-3.5" /> Chapter Index
          </button>
        </div>

        {/* Lesson Article Header */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-10 space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-3 text-xs text-stone-500 font-semibold uppercase tracking-widest">
            <span>Chapter {currentLessonNum} of {totalLessons}</span>
            <span>{readingPercent}% Complete</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 leading-tight">
            {lesson.title}
          </h1>

          {lesson.description && (
            <p className="text-base text-stone-600 font-sans leading-relaxed border-t border-stone-100 pt-4">
              {lesson.description}
            </p>
          )}

          {/* Minimalist Progress Line */}
          <div className="pt-2">
            <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden border border-stone-200">
              <div
                className="bg-stone-900 h-full rounded-full transition-all duration-500"
                style={{ width: `${readingPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* YouTube Video Player Embed */}
        {lesson.youtubeVideoId && (
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Video Presentation
            </h3>
            <div className="bg-stone-900 border border-stone-200 rounded-xl overflow-hidden shadow-sm relative w-full aspect-video p-1">
              <iframe
                src={`https://www.youtube.com/embed/${encodeURIComponent(lesson.youtubeVideoId)}`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute top-1 left-1 right-1 bottom-1 w-[calc(100%-0.5rem)] h-[calc(100%-0.5rem)] rounded-lg border-0"
              />
            </div>
          </div>
        )}

        {/* Legacy Video Attachments */}
        {videoMedia.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Video Clips
            </h3>
            {videoMedia.map((v) => (
              <div key={v.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs p-2">
                <video src={v.url} controls className="w-full max-h-[500px] object-contain rounded-lg bg-stone-950" />
                <div className="p-3 text-xs font-medium text-stone-700 flex items-center justify-between">
                  <span>{v.name}</span>
                  <a href={v.url} target="_blank" rel="noreferrer" className="text-stone-900 font-semibold underline">
                    Download Video ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rich Editorial Article Body Content */}
        {lesson.content && (
          <div className="bg-white border border-stone-200/80 rounded-xl p-6 sm:p-10 shadow-xs">
            <div
              className="prose max-w-none font-serif text-stone-900 text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        )}

        {/* Lesson Diagrams & Visuals */}
        {imageMedia.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Figures & Illustrations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {imageMedia.map((img) => (
                <div key={img.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden p-2 shadow-xs">
                  <img src={img.url} alt={img.name} className="w-full h-56 object-cover rounded-lg" />
                  <p className="text-xs font-medium text-stone-600 p-2 truncate text-center font-sans">{img.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Documents & Attachments */}
        {pdfMedia.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Downloadable Documents
            </h3>
            <div className="space-y-2">
              {pdfMedia.map((pdf) => (
                <div
                  key={pdf.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-stone-200 rounded-xl shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-center text-lg shrink-0">
                      📄
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-stone-900 truncate" title={pdf.name}>{pdf.name}</p>
                      <p className="text-[11px] text-stone-500">PDF Document</p>
                    </div>
                  </div>

                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View PDF
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chapter Bottom Pagination Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-stone-200">
          {navigation.prevLesson ? (
            <Link
              to={`/${companySlug}/books/${slug}/lessons/${navigation.prevLesson.lessonNumber || navigation.prevLesson.order}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg text-xs font-semibold text-stone-800 transition-all shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Chapter
            </Link>
          ) : (
            <div />
          )}

          {navigation.nextLesson && (
            <Link
              to={`/${companySlug}/books/${slug}/lessons/${navigation.nextLesson.lessonNumber || navigation.nextLesson.order}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 rounded-lg text-xs font-semibold text-stone-50 transition-all shadow-xs"
            >
              Next Chapter <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Table of Contents Index Drawer Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-30 w-80 bg-white border-l lg:border border-stone-200 rounded-none lg:rounded-xl p-5 overflow-y-auto space-y-4 transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } shrink-0 shadow-lg lg:shadow-xs`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-1.5 truncate">
              <BookOpen className="w-4 h-4 text-stone-600 shrink-0" />
              {book.title}
            </h3>
            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest mt-0.5">Chapter Syllabus</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-stone-500 hover:text-stone-900 p-1 bg-stone-100 rounded-lg border border-stone-200">
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
                className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-all ${
                  isActive
                    ? 'bg-stone-900 text-stone-50 border-stone-900 font-semibold shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`text-[10px] font-mono shrink-0 px-2 py-0.5 rounded ${isActive ? 'bg-stone-800 text-stone-200' : 'bg-stone-100 text-stone-600'}`}>
                    C{num}
                  </span>
                  <span className="truncate">{s.title}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>
    </div>
  );
};