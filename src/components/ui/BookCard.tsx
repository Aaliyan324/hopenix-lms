import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
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
  const isComplete = progressPercent === 100;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.04),0_10px_26px_-14px_rgba(28,25,23,0.16)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_20px_46px_-20px_rgba(234,88,12,0.30),0_8px_18px_-8px_rgba(28,25,23,0.10)] ${
        featured ? 'md:col-span-2 md:flex-row' : ''
      }`}
    >
      {/* Save / Bookmark Button top right */}
      {onSaveToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSaveToggle(book.id);
          }}
          aria-label={isSaved ? 'Remove from saved' : 'Save book'}
          aria-pressed={isSaved}
          title={isSaved ? 'Remove from saved' : 'Save book'}
          className={`absolute top-3 right-3 z-20 grid h-9 w-9 place-items-center rounded-full border shadow-sm backdrop-blur transition-all duration-200 active:scale-95 ${
            isSaved
              ? 'border-orange-600 bg-orange-600 text-white'
              : 'border-stone-200 bg-white/85 text-stone-500 hover:border-orange-300 hover:text-orange-600'
          }`}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Cover Image Container — full, uncropped (object-contain) on a warm stage */}
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-stone-100 via-orange-50/50 to-stone-100 p-5 ${
          featured ? 'h-60 md:h-auto md:w-2/5' : 'h-64'
        }`}
      >
        <img
          src={coverUrl}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          className="h-full w-full object-contain drop-shadow-[0_12px_20px_rgba(28,25,23,0.20)] transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />

        {/* Category Pill */}
        {book.category && (
          <span className="absolute top-3 left-3 rounded-full border border-orange-200/70 bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-orange-700 shadow-sm backdrop-blur">
            {book.category}
          </span>
        )}

        {/* Level / Status Pill */}
        {book.readingLevel && (
          <span className="absolute bottom-3 left-3 rounded-full bg-stone-900/85 px-2.5 py-1 text-[11px] font-medium text-stone-50 backdrop-blur">
            Level · {book.readingLevel}
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-stone-500">
            <span className="inline-flex items-center gap-1.5 text-stone-600">
              <BookOpen className="h-3.5 w-3.5 text-orange-500" />
              {lessonsNum} {lessonsNum === 1 ? 'Chapter' : 'Chapters'}
            </span>
            {book.author && (
              <span className="max-w-[45%] truncate text-stone-400 italic">
                by {book.author}
              </span>
            )}
          </div>

          <h3 className="font-serif text-lg font-bold leading-snug text-stone-900 transition-colors line-clamp-2 group-hover:text-orange-700 sm:text-xl">
            {book.title}
          </h3>

          <p className="text-xs leading-relaxed text-stone-500 line-clamp-2">
            {book.shortDescription || book.description || 'Explore this engaging educational publication filled with interactive lessons and practice.'}
          </p>
        </div>

        {/* Reading Progress Indicator */}
        {typeof progressPercent === 'number' && (
          <div className="space-y-1.5 border-t border-stone-100 pt-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 text-stone-600">
                {isComplete ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-orange-500" />
                )}
                {isComplete ? 'Completed' : 'Reading Progress'}
              </span>
              <span className={isComplete ? 'font-semibold text-emerald-700' : 'font-semibold text-stone-700'}>
                {progressPercent}%
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Reading progress for ${book.title}`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-500 to-orange-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Link */}
        <div className="pt-1">
          <Link
            to={`/books/${book.slug}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-orange-600/20 transition-all duration-200 hover:bg-orange-700 hover:shadow-md hover:shadow-orange-600/25 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 active:scale-[0.99] group/btn"
          >
            <span>{progressPercent && progressPercent > 0 ? 'Continue Reading' : 'Read Publication'}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};
