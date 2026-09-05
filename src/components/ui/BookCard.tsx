import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Bookmark, Heart, Clock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Book } from '../../types';

interface BookCardProps {
  book: Book;
  onSaveToggle?: (bookId: string) => void;
  isSaved?: boolean;
  progressPercent?: number;
  completedLessons?: number;
  totalLessonsCount?: number;
  featured?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onSaveToggle,
  isSaved = false,
  progressPercent,
  completedLessons,
  totalLessonsCount,
  featured = false,
}) => {
  const defaultCover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
  const coverUrl = book.coverImage || book.thumbnail || defaultCover;
  const lessonsNum = totalLessonsCount ?? book.totalLessons ?? (book.lessons?.length || 0);

  return (
    <div
      className={`group relative bg-slate-900/90 border border-slate-800/80 hover:border-brand-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 ${
        featured ? 'md:col-span-2 md:flex-row' : ''
      }`}
    >
      {/* Save / Bookmark Button top right */}
      {onSaveToggle && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSaveToggle(book.id);
          }}
          className={`absolute top-3 right-3 z-20 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 shadow-md ${
            isSaved
              ? 'bg-rose-500 text-white border border-rose-400 scale-105'
              : 'bg-slate-950/70 text-slate-300 hover:text-rose-400 border border-slate-700/60 hover:bg-slate-900'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save book'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Cover Image Container */}
      <div className={`relative bg-slate-950 overflow-hidden shrink-0 ${featured ? 'md:w-1/2 h-56 md:h-auto' : 'h-52'}`}>
        <img
          src={coverUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-80" />

        {/* Category Pill */}
        {book.category && (
          <span className="absolute top-3 left-3 text-[11px] font-extrabold tracking-wide text-white bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-full border border-purple-500/30 shadow-md">
            ✨ {book.category}
          </span>
        )}

        {/* Level / Status Pill */}
        {book.readingLevel && (
          <span className="absolute bottom-3 left-3 text-[10px] font-bold text-amber-300 bg-amber-950/80 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-amber-500/30">
            {book.readingLevel}
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5 text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-brand-400" />
              {lessonsNum} {lessonsNum === 1 ? 'Lesson' : 'Lessons'}
            </span>
            {book.author && (
              <span className="text-slate-400 truncate max-w-[140px]">
                by {book.author}
              </span>
            )}
          </div>

          <h3 className="font-extrabold text-lg text-white group-hover:text-brand-300 transition-colors line-clamp-1 leading-snug">
            {book.title}
          </h3>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {book.shortDescription || book.description || 'Explore this engaging educational adventure filled with lessons and practice.'}
          </p>
        </div>

        {/* Reading Progress Indicator if logged in / progress exists */}
        {typeof progressPercent === 'number' && (
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 flex items-center gap-1">
                {progressPercent === 100 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-brand-400" />
                )}
                {progressPercent === 100 ? 'Completed' : 'Reading Progress'}
              </span>
              <span className={progressPercent === 100 ? 'text-emerald-400' : 'text-brand-300'}>
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercent === 100
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Link */}
        <div className="pt-2">
          <Link
            to={`/books/${book.slug}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-brand-600 text-slate-200 hover:text-white border border-slate-800 hover:border-brand-500 text-xs font-bold rounded-xl transition-all duration-200 shadow-md group/btn"
          >
            <span>{progressPercent && progressPercent > 0 ? 'Continue Reading' : 'Start Adventure'}</span>
            <ArrowRight className="w-4 h-4 text-brand-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
};
