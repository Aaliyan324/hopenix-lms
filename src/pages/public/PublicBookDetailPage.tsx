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
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [sparklesList, setSparklesList] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (slug) fetchBookDetail();
  }, [slug]);

  const fetchBookDetail = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ book: Book }>(`/books/${slug}`);
      setBook(data.book);
    } catch (err: any) {
      toast(err.message || 'Oopsie! Failed to open the magic book portal.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Interactive background magic generator on click
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newSparkle = { id: Date.now(), x, y };
    setSparklesList((prev) => [...prev.slice(-12), newSparkle]);
  };

  if (loading || !book) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 rounded-2xl bg-slate-800" />
        <Skeleton className="h-80 w-full rounded-[2.5rem] bg-slate-800" />
        <Skeleton className="h-96 w-full rounded-[2.5rem] bg-slate-800" />
      </div>
    );
  }

  const totalCount = book.lessons?.length || 0;
  const firstLesson = book.lessons?.[0];
  const companySlug = getCompanySlug(book.companyName);

  return (
    <div 
      className="space-y-12 max-w-5xl mx-auto pb-24 px-4 sm:px-6 relative overflow-hidden cursor-crosshair"
      onClick={handlePageClick}
    >
      {/* Dynamic Animated Floating Elements & Background Magic Kingdom */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Floating Icons with Custom Speeds and Drifts */}
        <div className="absolute top-10 left-12 text-yellow-300 animate-bounce duration-1000 opacity-70 text-3xl select-none">⭐</div>
        <div className="absolute top-28 right-20 text-pink-400 animate-pulse opacity-60 text-4xl select-none">💖</div>
        <div className="absolute top-72 left-8 text-cyan-400 animate-spin duration-3000 opacity-50 text-3xl select-none">✨</div>
        <div className="absolute top-[40%] right-10 text-purple-400 animate-bounce duration-700 opacity-70 text-4xl select-none">🚀</div>
        <div className="absolute top-[60%] left-16 text-emerald-400 animate-pulse opacity-60 text-3xl select-none">🎈</div>
        <div className="absolute bottom-32 right-16 text-amber-300 animate-bounce duration-1000 opacity-60 text-3xl select-none">🎨</div>
        <div className="absolute bottom-12 left-1/3 text-indigo-400 animate-pulse opacity-50 text-4xl select-none">🪐</div>
        <div className="absolute top-1/2 left-4 text-rose-400 animate-bounce duration-500 opacity-60 text-2xl select-none">🍩</div>

        {/* Floating Planets & Clouds */}
        <div className="absolute top-16 right-1/4 text-purple-500/25 animate-pulse duration-700 text-6xl select-none">🛸</div>
        <div className="absolute bottom-40 left-10 text-pink-500/20 animate-bounce duration-1000 text-5xl select-none">☁️</div>
        <div className="absolute top-96 right-1/3 text-cyan-500/20 animate-pulse duration-1000 text-6xl select-none">🪐</div>

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[100px]" />

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

      {/* Back Button */}
      <Link
        to={user ? (user.role === 'ADMIN' ? '/admin/books' : '/editor') : '/'}
        className="inline-flex items-center gap-2 text-xs font-black text-yellow-300 hover:text-white bg-slate-900/90 border-2 border-yellow-400/40 px-5 py-3 rounded-2xl transition-all shadow-md transform hover:-translate-x-1 backdrop-blur-md"
      >
        <ArrowLeft className="w-4 h-4" /> {user ? '🚀 Back to Clubhouse' : '🏠 Back to Library'}
      </Link>

      {/* Book Cover Header Banner Card with Authentic 3D Book Cover Style */}
      <div className="relative rounded-[3rem] bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 border-4 border-dashed border-pink-500/40 shadow-[0_0_60px_rgba(236,72,153,0.3)] p-6 sm:p-12 backdrop-blur-2xl overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Authentic 3D Book Cover Presentation */}
          <div className="md:col-span-5 flex justify-center perspective-[1200px]">
            <div 
              className={`relative w-64 sm:w-72 h-96 sm:h-[420px] rounded-r-2xl rounded-l-md bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-[20px_20px_50px_rgba(0,0,0,0.8),-5px_0_15px_rgba(168,85,247,0.4)] border-r-4 border-t-2 border-b-2 border-pink-500/45 transform transition-transform duration-700 hover:rotate-y-[-8deg] hover:scale-105 group cursor-pointer`}
              onClick={() => setIsBookOpen(!isBookOpen)}
            >
              {/* Spine Effect on the Left */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 border-r border-purple-500/30 rounded-l-md shadow-inner flex flex-col items-center justify-around py-6">
                <span className="text-[10px] font-black text-yellow-300 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180">
                  {book.category || 'Story'}
                </span>
                <span className="text-xs">📖</span>
                <span className="text-[10px] font-black text-pink-300 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180">
                  Chapter 1
                </span>
              </div>

              {/* Cover Artwork Wrapper */}
              <div className="absolute inset-y-2 right-2 left-7 rounded-r-xl overflow-hidden shadow-inner border border-purple-500/30 bg-slate-950">
                <img
                  src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                
                {/* Book Title Overlaid on Cover */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-4 flex flex-col justify-end text-left">
                  {book.category && (
                    <span className="self-start text-[10px] font-black text-slate-950 bg-yellow-300 px-3 py-1 rounded-full border border-white shadow-md mb-2">
                      ✨ {book.category}
                    </span>
                  )}
                  <h3 className="text-lg font-black text-white leading-tight line-clamp-2 drop-shadow-md">
                    {book.title}
                  </h3>
                  <p className="text-[11px] font-bold text-pink-300 mt-1">
                    {book.author || 'Magic Storyteller'}
                  </p>
                </div>
              </div>

              {/* Interactive Book Ribbon Bookmark */}
              <div className="absolute -top-2 right-8 w-6 h-12 bg-gradient-to-b from-pink-500 to-purple-700 shadow-lg rounded-b-md flex items-end justify-center pb-1 text-[10px] text-white font-black">
                🔖
              </div>
            </div>
          </div>

          {/* Book Metadata & Actions */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="bg-pink-500/20 text-pink-300 border border-pink-500/40 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                    {book.category || 'General Story'}
                  </span>
                  {book.readingLevel && (
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                      Level: {book.readingLevel} 🚀
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 border-2 border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-400 text-xs font-black transition-all shadow-md cursor-pointer transform active:scale-95"
                    title="QR Code & Share"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Share QR Code</span>
                  </button>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 tracking-wide leading-tight drop-shadow-md">
                {book.title}
              </h1>
              <p className="text-sm font-black text-pink-400">Written by {book.author || 'Magic Storyteller'}</p>
              <p className="text-sm text-slate-300 leading-relaxed font-bold">
                {book.description || 'Embark on this super fun interactive reading adventure filled with exciting lessons and surprises!'}
              </p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y-2 border-pink-500/20 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-purple-500/20 shadow-inner">
                <span className="text-slate-400 block font-bold">Total Chapters</span>
                <span className="font-black text-yellow-300 flex items-center gap-1.5 mt-1 text-sm">
                  <Layers className="w-4 h-4 text-pink-400" />
                  {totalCount} Chapters
                </span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-purple-500/20 shadow-inner">
                <span className="text-slate-400 block font-bold">Language</span>
                <span className="font-black text-cyan-300 flex items-center gap-1.5 mt-1 text-sm">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  {book.language || 'English'}
                </span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-purple-500/20 shadow-inner">
                <span className="text-slate-400 block font-bold">Difficulty</span>
                <span className="font-black text-pink-300 flex items-center gap-1.5 mt-1 text-sm">
                  <Award className="w-4 h-4 text-amber-400" />
                  {book.readingLevel || 'Beginner'}
                </span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-purple-500/20 shadow-inner">
                <span className="text-slate-400 block font-bold">Published</span>
                <span className="font-black text-purple-300 flex items-center gap-1.5 mt-1 text-sm">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  {book.publicationYear || '2026'}
                </span>
              </div>
            </div>

            {/* Reading Actions */}
            <div className="space-y-4 pt-2">
              {firstLesson && (
                <Link
                  to={`/${companySlug}/books/${book.slug}/lessons/${firstLesson.lessonNumber || firstLesson.order}`}
                  className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-300 hover:to-purple-500 text-slate-950 sm:text-white text-base font-black rounded-2xl transition-all shadow-[0_8px_0_rgb(157,23,77)] hover:shadow-[0_4px_0_rgb(157,23,77)] active:shadow-none active:translate-y-2 border-2 border-yellow-300 tracking-wider uppercase"
                >
                  <span>Start Chapter 1 Adventure! 📖</span>
                  <Play className="w-5 h-5 fill-current" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reading Journey Timeline / Table of Contents */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🗺️</span>
          <div>
            <span className="text-yellow-300 text-xs font-black uppercase tracking-widest bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/25">Roadmap</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide mt-1">Your Super Fun Story Chapters!</h2>
          </div>
        </div>

        <div className="space-y-4">
          {book.lessons?.map((lesson, idx) => {
            const lessonNum = lesson.lessonNumber || idx + 1;

            return (
              <Link
                key={lesson.id}
                to={`/${companySlug}/books/${book.slug}/lessons/${lessonNum}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 rounded-[2rem] border-2 transition-all duration-300 group bg-slate-900/80 border-purple-500/30 hover:border-yellow-300 shadow-xl hover:scale-[1.01] backdrop-blur-md"
              >
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base shrink-0 border-2 shadow-inner transition-transform group-hover:scale-110 bg-gradient-to-br from-purple-800 to-pink-900 text-yellow-300 border-yellow-400/50">
                    {`#${lessonNum}`}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-pink-400 uppercase tracking-wider bg-pink-500/10 px-2.5 py-0.5 rounded-full">Chapter {lessonNum}</span>
                    </div>
                    <h3 className="text-lg font-black text-white group-hover:text-yellow-300 transition-colors">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-xs text-slate-300 font-bold line-clamp-1">{lesson.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-purple-500/20">
                  {lesson.media && lesson.media.length > 0 && (
                    <span className="text-xs font-black text-cyan-300 bg-cyan-950/80 px-3 py-1.5 rounded-xl border border-cyan-500/40 shadow-inner">
                      📎 {lesson.media.length} Surprises
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 text-xs font-black text-yellow-300 bg-yellow-400/10 px-4 py-2 rounded-xl border border-yellow-400/30 group-hover:bg-yellow-400 group-hover:text-slate-950 transition-all shadow-sm">
                    <span>Read Now</span>
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
        title="✨ Magic Door Locked!"
        message="Sign in as an Admin or Editor to access clubhouse controls."
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