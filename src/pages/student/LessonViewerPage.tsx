import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Lesson, Media } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Play,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Download,
  ExternalLink,
  Menu,
  X,
  Layers,
} from 'lucide-react';

export const LessonViewerPage: React.FC = () => {
  const { courseSlug, lessonSlug } = useParams<{ courseSlug: string; lessonSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [navigation, setNavigation] = useState<{
    prevLesson?: Lesson | null;
    nextLesson?: Lesson | null;
    siblingLessons?: Lesson[];
  }>({});

  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (lessonSlug) fetchLessonContent();
  }, [lessonSlug]);

  const fetchLessonContent = async () => {
    try {
      setLoading(true);

      // Find course by slug first to get courseId
      const courseData = await apiFetch<{ course: { id: string; lessons: Lesson[] } }>(`/courses/${courseSlug}`);
      const matchedLesson = courseData.course.lessons.find((l) => l.slug === lessonSlug);

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
    } catch (err: any) {
      toast(err.message || 'Failed to load lesson content.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleCompleteStatus = async () => {
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

  if (loading || !lesson) {
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
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto pb-12">
      {/* Main Lesson Content Column */}
      <div className="flex-1 space-y-8 min-w-0">
        {/* Top Header & Sidebar Toggle */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link
            to={`/courses/${courseSlug}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Syllabus
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl"
          >
            <Layers className="w-4 h-4" /> Syllabus Sidebar
          </button>
        </div>

        {/* Lesson Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-brand-400">Lesson #{lesson.order}</span>
            <Button
              variant={completed ? 'secondary' : 'primary'}
              size="sm"
              onClick={toggleCompleteStatus}
              loading={savingProgress}
              icon={<CheckCircle className={`w-4 h-4 ${completed ? 'text-emerald-400' : ''}`} />}
            >
              {completed ? 'Completed ✓' : 'Mark as Completed'}
            </Button>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
              {lesson.description}
            </p>
          )}
        </div>

        {/* Video Player Section */}
        {videoMedia.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <VideoIcon className="w-5 h-5 text-brand-400" />
              Video Lecture
            </h3>
            {videoMedia.map((v) => (
              <div key={v.id} className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <video src={v.url} controls className="w-full max-h-[500px] object-contain bg-black" />
                <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>{v.name}</span>
                  <a href={v.url} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">
                    Download Video
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

        {/* Image Media Attachments */}
        {imageMedia.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-brand-400" />
              Lesson Diagrams & Visuals
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

        {/* PDF Documents Section */}
        {pdfMedia.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" />
              PDF Reference Materials
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

                  <div className="flex items-center gap-2">
                    <a
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Previous / Next Navigation Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          {navigation.prevLesson ? (
            <Link
              to={`/courses/${courseSlug}/lessons/${navigation.prevLesson.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-xs font-semibold text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous: {navigation.prevLesson.title}
            </Link>
          ) : (
            <div />
          )}

          {navigation.nextLesson && (
            <Link
              to={`/courses/${courseSlug}/lessons/${navigation.nextLesson.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-2xl text-xs font-semibold text-white transition-all shadow-lg shadow-brand-500/20"
            >
              Next: {navigation.nextLesson.title} <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Course Sidebar Component */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-30 w-80 bg-slate-900 border-l lg:border border-slate-800 rounded-none lg:rounded-3xl p-6 overflow-y-auto space-y-6 transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } shrink-0`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-400" />
            Course Syllabus
          </h3>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {navigation.siblingLessons?.map((s) => {
            const isActive = s.slug === lessonSlug;
            return (
              <Link
                key={s.id}
                to={`/courses/${courseSlug}/lessons/${s.slug}`}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/20 border-brand-500 text-white font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="font-mono text-brand-400 font-bold">#{s.order}</span>
                  <span className="truncate">{s.title}</span>
                </div>
                {isActive && <Play className="w-3.5 h-3.5 text-brand-400 fill-brand-400 shrink-0" />}
              </Link>
            );
          })}
        </div>
      </aside>
    </div>
  );
};
