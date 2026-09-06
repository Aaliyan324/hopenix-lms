import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Play,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  ExternalLink,
  X,
  Layers,
  Sparkles,
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

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sparklesList, setSparklesList] = useState<{ id: number; x: number; y: number }[]>([]);

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
        toast('Oopsie! Chapter not found in this rocket.', 'error');
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
      toast(err.message || 'Failed to blast off chapter content.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Interactive background magical click spark generator
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSparkle = { id: Date.now(), x, y };
    setSparklesList((prev) => [...prev.slice(-12), newSparkle]);
  };

  if (loading || !lesson || !book) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto px-4 py-12">
        <Skeleton className="h-12 w-64 rounded-2xl bg-purple-900/40 border-2 border-pink-500/20" />
        <Skeleton className="h-[600px] w-full rounded-[2.5rem] bg-purple-950/40 border-2 border-pink-500/25" />
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
    <div
      className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto pb-20 px-4 sm:px-6 relative overflow-hidden cursor-crosshair"
      onClick={handlePageClick}
    >
      {/* Floating Star Stickers & Fun Kid Universe Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-12 left-10 text-yellow-300 animate-bounce duration-1000 opacity-60 text-3xl select-none">⭐</div>
        <div className="absolute top-36 right-16 text-pink-400 animate-pulse opacity-50 text-4xl select-none">💖</div>
        <div className="absolute top-80 left-12 text-cyan-400 animate-spin duration-3000 opacity-40 text-3xl select-none">✨</div>
        <div className="absolute top-[45%] right-12 text-purple-400 animate-bounce duration-700 opacity-60 text-4xl select-none">🚀</div>
        <div className="absolute top-[65%] left-10 text-emerald-400 animate-pulse opacity-50 text-3xl select-none">🎈</div>
        <div className="absolute bottom-40 right-20 text-amber-300 animate-bounce duration-1000 opacity-60 text-3xl select-none">🎨</div>
        <div className="absolute bottom-16 left-1/4 text-indigo-400 animate-pulse opacity-40 text-4xl select-none">🪐</div>
        <div className="absolute top-1/2 left-4 text-rose-400 animate-bounce duration-500 opacity-50 text-2xl select-none">🍩</div>

        {/* Floating Magic UFOs & Clouds */}
        <div className="absolute top-20 right-1/4 text-purple-500/20 animate-pulse duration-700 text-6xl select-none">🛸</div>
        <div className="absolute bottom-32 left-10 text-pink-500/15 animate-bounce duration-1000 text-5xl select-none">☁️</div>

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-[120px]" />

        {/* Click Sparkles */}
        {sparklesList.map((sparkle) => (
          <span
            key={sparkle.id}
            className="absolute text-2xl animate-ping select-none pointer-events-none"
            style={{ left: sparkle.x, top: sparkle.y }}
          >
            ✨
          </span>
        ))}
      </div>

      {/* Main Reader Column */}
      <div className="flex-1 space-y-8 min-w-0">
        {/* Top Header & Breadcrumb */}
        <div className="flex items-center justify-between border-b-2 border-pink-500/20 pb-4">
          <Link
            to={`/${companySlug}/books/${slug}`}
            className="inline-flex items-center gap-2 text-xs font-black text-yellow-300 hover:text-white bg-slate-900/90 border-2 border-pink-500/30 px-5 py-2.5 rounded-2xl transition-all shadow-md transform hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-pink-400" /> Back to {book.title}
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 text-xs font-black text-white bg-gradient-to-r from-pink-500 to-purple-600 border-2 border-pink-300/40 px-4 py-2.5 rounded-2xl shadow-md active:scale-95"
          >
            <Layers className="w-4 h-4 text-yellow-300" /> Syllabus Drawer
          </button>
        </div>

        {/* Lesson Hero / Header Card with Playful Banner Style */}
        <div className="relative bg-gradient-to-r from-purple-900 via-indigo-950 to-pink-950 border-4 border-dashed border-pink-500/40 rounded-[2.5rem] p-6 sm:p-10 space-y-5 shadow-[0_0_40px_rgba(236,72,153,0.2)] overflow-hidden backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 bg-yellow-400 text-slate-950 font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-wider shadow-lg transform -rotate-1">
              <Sparkles className="w-4 h-4 text-purple-900" /> Chapter {currentLessonNum} of {totalLessons} 🚀
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 tracking-wide drop-shadow-sm">
            {lesson.title}
          </h1>

          {lesson.description && (
            <p className="text-sm sm:text-base text-slate-200 font-bold leading-relaxed border-t-2 border-pink-500/20 pt-4">
              {lesson.description}
            </p>
          )}

          {/* Fun Colorful Progress Bar */}
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-black text-yellow-300 uppercase tracking-widest">
              <span>Adventure Progress</span>
              <span>{readingPercent}% Completed 🌟</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden border-2 border-pink-500/30 p-0.5">
              <div
                className="bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(236,72,153,0.6)]"
                style={{ width: `${readingPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* YouTube Video Player (Fun Kids Style Frame) */}
        {lesson.youtubeVideoId && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2.5">
              <span className="text-2xl">📺</span> Interactive Video Adventure!
            </h3>
            <div className="bg-slate-950 border-3 border-pink-500/40 rounded-[2.5rem] overflow-hidden shadow-2xl relative w-full aspect-video p-2 bg-gradient-to-br from-purple-950/80 to-slate-950">
              <iframe
                src={`https://www.youtube.com/embed/${encodeURIComponent(lesson.youtubeVideoId)}`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute top-2 left-2 right-2 bottom-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] rounded-[2rem] border-0"
              />
            </div>
          </div>
        )}

        {/* Legacy Video Attachments */}
        {videoMedia.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2.5">
              <span className="text-2xl">🎬</span> Extra Video Clips
            </h3>
            {videoMedia.map((v) => (
              <div key={v.id} className="bg-slate-950 border-3 border-purple-500/40 rounded-[2.5rem] overflow-hidden shadow-2xl p-2">
                <video src={v.url} controls className="w-full max-h-[500px] object-contain rounded-[2rem] bg-black" />
                <div className="p-4 bg-slate-900/90 text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>🚀 {v.name}</span>
                  <a href={v.url} target="_blank" rel="noreferrer" className="text-yellow-300 hover:text-white font-black underline">
                    Download Video ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rich Lesson Article Content */}
        {lesson.content && (
          <div className="bg-slate-900/90 border-3 border-purple-500/35 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl backdrop-blur-md">
            <div
              className="prose prose-invert max-w-none prose-headings:font-black prose-headings:text-yellow-350 prose-p:text-slate-100 prose-p:font-bold prose-p:text-base prose-p:leading-relaxed prose-a:text-pink-400 prose-a:font-black prose-code:bg-slate-950 prose-code:text-yellow-300 prose-code:px-2.5 prose-code:py-1.5 prose-code:rounded-xl prose-code:border prose-code:border-pink-500/30 prose-pre:bg-slate-950 prose-pre:border-2 prose-pre:border-purple-500/40 prose-pre:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        )}

        {/* Lesson Diagrams & Visuals */}
        {imageMedia.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2.5">
              <span className="text-2xl">🎨</span> Magical Story Illustrations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {imageMedia.map((img) => (
                <div key={img.id} className="bg-slate-900 border-2 border-pink-500/30 rounded-3xl overflow-hidden shadow-xl p-3 transform hover:scale-[1.02] transition-transform">
                  <img src={img.url} alt={img.name} className="w-full h-52 object-cover rounded-2xl border border-purple-500/30" />
                  <p className="text-xs font-black text-yellow-300 p-3 truncate text-center">✨ {img.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Documents & Attachments */}
        {pdfMedia.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2.5">
              <span className="text-2xl">📜</span> Magic Scrolls & Worksheets
            </h3>
            <div className="space-y-3">
              {pdfMedia.map((pdf) => (
                <div
                  key={pdf.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-purple-950/80 to-slate-900/90 border-2 border-purple-500/40 rounded-3xl shadow-lg"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-pink-500/20 border-2 border-pink-500/40 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                      📄
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-white truncate" title={pdf.name}>{pdf.name}</p>
                      <p className="text-xs text-yellow-300 font-bold">PDF Printable Document</p>
                    </div>
                  </div>

                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_0_rgb(161,98,7)] active:shadow-none active:translate-y-1 shrink-0 uppercase tracking-wider"
                  >
                    <ExternalLink className="w-4 h-4" /> Open Scroll
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Fun Navigation Controls */}
        <div className="flex items-center justify-between pt-8 border-t-2 border-pink-500/20">
          {navigation.prevLesson ? (
            <Link
              to={`/${companySlug}/books/${slug}/lessons/${navigation.prevLesson.lessonNumber || navigation.prevLesson.order}`}
              className="inline-flex items-center gap-2 px-6 py-4 bg-slate-900 hover:bg-slate-800 border-2 border-purple-500/40 rounded-2xl text-xs font-black text-slate-200 transition-all hover:-translate-x-1 shadow-md uppercase tracking-wider"
            >
              <ChevronLeft className="w-4 h-4 text-pink-400" /> Previous Chapter
            </Link>
          ) : (
            <div />
          )}

          {navigation.nextLesson && (
            <Link
              to={`/${companySlug}/books/${slug}/lessons/${navigation.nextLesson.lessonNumber || navigation.nextLesson.order}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 rounded-2xl text-xs font-black text-white transition-all shadow-[0_6px_0_rgb(157,23,77)] active:shadow-none active:translate-y-1.5 border-2 border-pink-300/40 uppercase tracking-wider"
            >
              Next Chapter <ChevronRight className="w-4 h-4 text-yellow-300" />
            </Link>
          )}
        </div>
      </div>

      {/* Right Table of Contents Sidebar / Drawer */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-30 w-80 bg-slate-950/95 border-l-3 lg:border-3 border-purple-500/30 rounded-none lg:rounded-[2.5rem] p-6 overflow-y-auto space-y-6 transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } shrink-0 backdrop-blur-xl shadow-2xl`}
      >
        <div className="flex items-center justify-between pb-4 border-b-2 border-pink-500/20">
          <div>
            <h3 className="font-black text-sm text-white flex items-center gap-2 truncate">
              <BookOpen className="w-4 h-4 text-yellow-300 shrink-0" />
              {book.title}
            </h3>
            <p className="text-[11px] font-black text-pink-400 mt-1 uppercase tracking-wider">🌟 Mission Syllabus</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white p-1 bg-slate-900 rounded-xl border border-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {navigation.siblingLessons?.map((s) => {
            const num = s.lessonNumber || s.order;
            const isActive = s.id === lesson.id;
            return (
              <Link
                key={s.id}
                to={`/${companySlug}/books/${slug}/lessons/${num}`}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 text-xs font-black transition-all transform active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-yellow-300 shadow-[0_0_20px_rgba(236,72,153,0.4)] scale-105'
                    : 'bg-slate-900/80 border-purple-500/20 text-slate-300 hover:border-pink-500/40 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={`text-xs font-black shrink-0 px-2.5 py-1 rounded-xl ${isActive ? 'bg-yellow-400 text-slate-950' : 'bg-slate-950 text-yellow-300 border border-purple-500/30'}`}>
                    C{num}
                  </span>
                  <span className="truncate">{s.title}</span>
                </div>
                {isActive && <Play className="w-3.5 h-3.5 text-yellow-300 fill-current shrink-0 animate-bounce" />}
              </Link>
            );
          })}
        </div>
      </aside>
    </div>
  );
};