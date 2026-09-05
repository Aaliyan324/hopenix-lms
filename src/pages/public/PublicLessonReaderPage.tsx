import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Lesson, Book } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { AuthPromptModal } from '../../components/auth/AuthPromptModal';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Play,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Bookmark,
  ExternalLink,
  Menu,
  X,
  Layers,
  Clock,
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

      // Fetch parent book to find the lesson by lessonNumber or order
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

      // Fetch lesson details & sibling navigation
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
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      </div>
    );
  }

  const imageMedia = lesson.media?.filter((m) => m.type === 'IMAGE') || [];
  const videoMedia = lesson.media?.filter((m) => m.type === 'VIDEO') || [];
  const pdfMedia = lesson.media?.filter((m) => m.type === 'PDF') || [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto pb-16">
      {/* Main Reading Column */}
      <div className="flex-1 space-y-8 min-w-0">
        {/* Top Breadcrumb & Mobile Drawer Button */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link
            to={`/books/${slug}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {book.title}
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl"
          >
            <Layers className="w-4 h-4 text-brand-400" /> Syllabus Drawer
          </button>
        </div>

        {/* Lesson Header Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
              Lesson #{lesson.lessonNumber || lesson.order}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleLessonBookmark}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isBookmarked
                    ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
                title="Bookmark Lesson"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>

              <Button
                variant={completed ? 'secondary' : 'primary'}
                size="sm"
                onClick={handleToggleComplete}
                loading={savingProgress}
                icon={<CheckCircle className={`w-4 h-4 ${completed ? 'text-emerald-400' : ''}`} />}
              >
                {completed ? 'Completed ✓' : 'Mark Complete'}
              </Button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
              {lesson.description}
            </p>
          )}
        </div>

        {/* Video Lectures */}
        {videoMedia.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <VideoIcon className="w-5 h-5 text-brand-400" />
              Video Explanation
            </h3>
            {videoMedia.map((v) => (
              <div key={v.id} className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <video src={v.url} controls className="w-full max-h-[500px] object-contain bg-black" />
                <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>{v.name}</span>
                  <a href={v.url} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">
                    Download Video Resource
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rich Lesson Article Content */}
        {lesson.content && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div
              className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-brand-400 prose-code:bg-slate-950 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        )}

        {/* Lesson Diagrams & Visuals */}
        {imageMedia.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-brand-400" />
              Lesson Diagrams & Visual Resources
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {imageMedia.map((img) => (
                <div key={img.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-2">
                  <img src={img.url} alt={img.name} className="w-full h-48 object-cover rounded-xl" />
                  <p className="text-xs font-medium text-slate-300 p-2 truncate">{img.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Documents & Attachments */}
        {pdfMedia.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" />
              PDF Reference Attachments
            </h3>
            <div className="space-y-3">
              {pdfMedia.map((pdf) => (
                <div
                  key={pdf.id}
                  className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-rose-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white truncate max-w-sm">{pdf.name}</p>
                      <p className="text-xs text-slate-400">PDF Document</p>
                    </div>
                  </div>

                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Document
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          {navigation.prevLesson ? (
            <Link
              to={`/books/${slug}/lessons/${navigation.prevLesson.lessonNumber || navigation.prevLesson.order}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-xs font-semibold text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous: Lesson {navigation.prevLesson.lessonNumber || navigation.prevLesson.order}
            </Link>
          ) : (
            <div />
          )}

          {navigation.nextLesson && (
            <Link
              to={`/books/${slug}/lessons/${navigation.nextLesson.lessonNumber || navigation.nextLesson.order}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-2xl text-xs font-semibold text-white transition-all shadow-lg shadow-brand-500/20"
            >
              Next: Lesson {navigation.nextLesson.lessonNumber || navigation.nextLesson.order} <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Right Lesson Syllabus Sidebar / Drawer */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-30 w-80 bg-slate-900 border-l lg:border border-slate-800 rounded-none lg:rounded-3xl p-6 overflow-y-auto space-y-6 transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } shrink-0`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2 line-clamp-1">
              <BookOpen className="w-4 h-4 text-brand-400 shrink-0" />
              {book.title}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Lessons Table of Contents</p>
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
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/20 border-brand-500 text-white font-semibold shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="font-mono text-brand-400 font-bold shrink-0">L{num}</span>
                  <span className="truncate">{s.title}</span>
                </div>
                {isActive && <Play className="w-3.5 h-3.5 text-brand-400 fill-brand-400 shrink-0" />}
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
