import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Lesson, Book } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ReadingProgress } from '../../components/ui/ReadingProgress';
import { useToast } from '../../components/ui/Toast';
import { AuthPromptModal } from '../../components/auth/AuthPromptModal';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Play,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Bookmark,
  ExternalLink,
  X,
  Layers,
  Sparkles,
  Heart,
  BookOpen,
} from 'lucide-react';

export const PublicLessonReaderPage: React.FC = () => {
  const { slug, lessonNumber } = useParams<{ slug: string; lessonNumber: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [navigation, setNavigation] = useState<{
    prevLesson?: Lesson | null;
    nextLesson?: Lesson | null;
    siblingLessons?: Lesson[];
  }>({});

  const [completed, setCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authActionTitle, setAuthActionTitle] = useState('Sign In Required');

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
        toast('Lesson not found.', 'error');
        setLoading(false);
        return;
      }

      const lessonData = await apiFetch<{
        lesson: Lesson;
        navigation: { prevLesson?: Lesson; nextLesson?: Lesson; siblingLessons?: Lesson[] };
      }>(`/lessons/${matchedLesson.id}`);

      setLesson(lessonData.lesson);
      setNavigation(lessonData.navigation);
      setCompleted(Boolean(lessonData.lesson.completed));
      setIsBookmarked(Boolean(lessonData.lesson.isBookmarked));
    } catch (err: any) {
      toast(err.message || 'Failed to load lesson content.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!user) {
      setAuthActionTitle('Sign In to Save Reading Progress');
      setAuthModalOpen(true);
      return;
    }

    if (!lesson) return;

    try {
      setSavingProgress(true);
      const newStatus = !completed;
      await apiFetch(`/progress/${lesson.id}`, {
        method: 'POST',
        body: JSON.stringify({ completed: newStatus }),
      });
      setCompleted(newStatus);
      toast(newStatus ? 'Lesson marked as completed! 🎉' : 'Lesson marked as uncompleted.', 'success');
    } catch (err: any) {
      toast('Failed to update progress.', 'error');
    } finally {
      setSavingProgress(false);
    }
  };

  const handleToggleLessonBookmark = async () => {
    if (!user) {
      setAuthActionTitle('Sign In to Bookmark Lessons');
      setAuthModalOpen(true);
      return;
    }

    if (!lesson) return;

    try {
      const data = await apiFetch<{ isBookmarked: boolean; message: string }>(`/bookmarks/lessons/${lesson.id}`, {
        method: 'POST',
      });
      setIsBookmarked(data.isBookmarked);
      toast(data.message, 'success');
    } catch (err: any) {
      toast('Unable to save lesson bookmark.', 'error');
    }
  };

  if (loading || !lesson || !book) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      </div>
    );
  }

  const imageMedia = lesson.media?.filter((m) => m.type === 'IMAGE') || [];
  const videoMedia = lesson.media?.filter((m) => m.type === 'VIDEO') || [];
  const pdfMedia = lesson.media?.filter((m) => m.type === 'PDF') || [];

  const currentLessonNum = lesson.lessonNumber || lesson.order || 1;
  const totalLessons = navigation.siblingLessons?.length || 1;
  const readingPercent = Math.round((currentLessonNum / totalLessons) * 100);

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto pb-16">
      {/* Main Reader Column */}
      <div className="flex-1 space-y-8 min-w-0">
        {/* Top Header & Breadcrumb */}
        <div className="flex items-center justify-between border-b border-purple-500/15 pb-4">
          <Link
            to={`/books/${slug}`}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-brand-300 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {book.title}
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 text-xs font-extrabold text-slate-200 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl"
          >
            <Layers className="w-4 h-4 text-brand-400" /> Syllabus Drawer
          </button>
        </div>

        {/* Lesson Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 via-purple-950/50 to-slate-950 border border-purple-500/25 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-black text-brand-300 bg-brand-500/20 px-3.5 py-1.5 rounded-full border border-brand-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Chapter {currentLessonNum} of {totalLessons}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleLessonBookmark}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-rose-500 text-white border-rose-400 shadow-md scale-105'
                    : 'bg-slate-950/80 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="Bookmark Lesson"
              >
                <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>

              <Button
                variant={completed ? 'secondary' : 'playful'}
                size="sm"
                onClick={handleToggleComplete}
                loading={savingProgress}
                icon={<CheckCircle2 className={`w-4 h-4 ${completed ? 'text-emerald-400' : ''}`} />}
              >
                {completed ? 'Completed ✓' : 'Mark Complete'}
              </Button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {lesson.title}
          </h1>

          {lesson.description && (
            <p className="text-sm text-slate-300 leading-relaxed border-t border-purple-500/20 pt-3 font-medium">
              {lesson.description}
            </p>
          )}

          {/* Thin Progress bar */}
          <div className="pt-2">
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-brand-500 to-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${readingPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Video Lectures Section */}
        {videoMedia.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <VideoIcon className="w-5 h-5 text-brand-400" />
              Interactive Video Lecture
            </h3>
            {videoMedia.map((v) => (
              <div key={v.id} className="bg-slate-950 border border-purple-500/25 rounded-3xl overflow-hidden shadow-2xl">
                <video src={v.url} controls className="w-full max-h-[500px] object-contain bg-black" />
                <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>{v.name}</span>
                  <a href={v.url} target="_blank" rel="noreferrer" className="text-brand-300 hover:text-white hover:underline">
                    Download Video Resource →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rich Lesson Article Content */}
        {lesson.content && (
          <div className="bg-slate-900/90 border border-purple-500/20 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
            <div
              className="prose prose-invert max-w-none prose-headings:font-extrabold prose-headings:text-white prose-p:text-slate-200 prose-p:leading-relaxed prose-a:text-brand-300 prose-a:font-bold prose-code:bg-slate-950 prose-code:text-brand-300 prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        )}

        {/* Lesson Diagrams & Visuals */}
        {imageMedia.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-pink-400" />
              Lesson Diagrams & Visual References
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {imageMedia.map((img) => (
                <div key={img.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-2.5">
                  <img src={img.url} alt={img.name} className="w-full h-48 object-cover rounded-xl" />
                  <p className="text-xs font-bold text-slate-300 p-2 truncate">{img.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Documents & Attachments */}
        {pdfMedia.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" />
              PDF Reference Documents
            </h3>
            <div className="space-y-3">
              {pdfMedia.map((pdf) => (
                <div
                  key={pdf.id}
                  className="flex items-center justify-between p-4 bg-slate-900/90 border border-slate-800 rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-rose-400 shrink-0" />
                    <div>
                      <p className="text-sm font-extrabold text-white truncate max-w-sm">{pdf.name}</p>
                      <p className="text-xs text-slate-400 font-medium">PDF Attachment</p>
                    </div>
                  </div>

                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-950 hover:bg-brand-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all border border-slate-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View PDF
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-purple-500/20">
          {navigation.prevLesson ? (
            <Link
              to={`/books/${slug}/lessons/${navigation.prevLesson.lessonNumber || navigation.prevLesson.order}`}
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-xs font-extrabold text-slate-200 transition-all hover:-translate-x-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Chapter
            </Link>
          ) : (
            <div />
          )}

          {navigation.nextLesson && (
            <Link
              to={`/books/${slug}/lessons/${navigation.nextLesson.lessonNumber || navigation.nextLesson.order}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 rounded-2xl text-xs font-extrabold text-white transition-all shadow-lg shadow-brand-500/25 border border-purple-400/30 hover:translate-x-1"
            >
              Next Chapter <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Right Table of Contents Sidebar / Drawer */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-30 w-80 bg-slate-950/95 border-l lg:border border-purple-500/20 rounded-none lg:rounded-3xl p-6 overflow-y-auto space-y-6 transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } shrink-0 backdrop-blur-xl`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2 truncate">
              <BookOpen className="w-4 h-4 text-brand-400 shrink-0" />
              {book.title}
            </h3>
            <p className="text-[11px] font-bold text-brand-400 mt-0.5">Syllabus Table of Contents</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {navigation.siblingLessons?.map((s) => {
            const num = s.lessonNumber || s.order;
            const isActive = s.id === lesson.id;
            return (
              <Link
                key={s.id}
                to={`/books/${slug}/lessons/${num}`}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-extrabold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white border-pink-400/40 shadow-lg shadow-brand-500/20 scale-[1.02]'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`text-xs font-black shrink-0 ${isActive ? 'text-white' : 'text-brand-400'}`}>
                    C{num}
                  </span>
                  <span className="truncate">{s.title}</span>
                </div>
                {isActive && <Play className="w-3.5 h-3.5 text-white fill-current shrink-0" />}
              </Link>
            );
          })}
        </div>
      </aside>

      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authActionTitle}
        message="Sign in or create a student account to bookmark lessons, mark reading milestones as complete, and sync across devices."
      />
    </div>
  );
};
