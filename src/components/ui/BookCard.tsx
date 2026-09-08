import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Bookmark, Heart, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
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
      className={`group relative bg-white border border-stone-200/80 hover:border-stone-400 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between ${
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
          className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-sm transition-all duration-200 shadow-sm ${
            isSaved
              ? 'bg-red-700 text-white border border-red-800 scale-105'
              : 'bg-white/80 text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-white'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save book'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Cover Image Container */}
      <div className={`relative bg-stone-100 overflow-hidden shrink-0 ${featured ? 'md:w-1/2 h-60 md:h-auto' : 'h-56'}`}>
        <img
          src={coverUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-60" />

        {/* Category Pill */}
        {book.category && (
          <span className="absolute top-3 left-3 text-[11px] font-semibold tracking-wide text-stone-900 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded border border-stone-200 shadow-xs">
            {book.category}
          </span>
        )}

        {/* Level / Status Pill */}
        {book.readingLevel && (
          <span className="absolute bottom-3 left-3 text-[11px] font-medium text-stone-100 bg-stone-900/80 backdrop-blur-xs px-2 py-0.5 rounded">
            Level: {book.readingLevel}
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs text-stone-500 font-medium">
            <span className="flex items-center gap-1.5 text-stone-600">
              <BookOpen className="w-3.5 h-3.5 text-stone-500" />
              {lessonsNum} {lessonsNum === 1 ? 'Chapter' : 'Chapters'}
            </span>
            {book.author && (
              <span className="text-stone-500 italic truncate max-w-[140px]">
                by {book.author}
              </span>
            )}
          </div>

          <h3 className="font-serif font-bold text-xl text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-2 leading-snug">
            {book.title}
          </h3>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-sans">
            {book.shortDescription || book.description || 'Explore this engaging educational publication filled with interactive lessons and practice.'}
          </p>
        </div>

        {/* Reading Progress Indicator */}
        {typeof progressPercent === 'number' && (
          <div className="space-y-1.5 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-stone-600 flex items-center gap-1">
                {progressPercent === 100 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                )}
                {progressPercent === 100 ? 'Completed' : 'Reading Progress'}
              </span>
              <span className={progressPercent === 100 ? 'text-emerald-700 font-semibold' : 'text-stone-700'}>
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden border border-stone-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercent === 100
                    ? 'bg-emerald-600'
                    : 'bg-stone-900'
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
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg transition-all duration-200 shadow-xs group/btn"
          >
            <span>{progressPercent && progressPercent > 0 ? 'Continue Reading' : 'Read Publication'}</span>
            <ArrowRight className="w-4 h-4 text-stone-300 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

