import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  subtitle,
  actionText,
  actionHref,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 ${className}`}>
      <div className="space-y-1.5 max-w-2xl">
        {badge && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-200 text-xs font-semibold tracking-wide uppercase">
            {badge}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-stone-500 font-sans leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actionText && (
        <div className="shrink-0">
          {actionHref ? (
            <Link
              to={actionHref}
              className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 hover:text-orange-700 bg-white hover:bg-orange-50 px-4 py-2.5 rounded-xl border border-stone-300 hover:border-orange-400 transition-all group shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : onAction ? (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 hover:text-orange-700 bg-white hover:bg-orange-50 px-4 py-2.5 rounded-xl border border-stone-300 hover:border-orange-400 transition-all group shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};
