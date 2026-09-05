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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/15 text-brand-300 rounded-full border border-brand-500/30 text-xs font-extrabold tracking-wide uppercase">
            {badge}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-300 font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actionText && (
        <div className="shrink-0">
          {actionHref ? (
            <Link
              to={actionHref}
              className="inline-flex items-center gap-2 text-xs font-extrabold text-brand-300 hover:text-white bg-brand-500/10 hover:bg-brand-500/20 px-4 py-2 rounded-xl border border-brand-500/20 hover:border-brand-500/40 transition-all group"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : onAction ? (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 text-xs font-extrabold text-brand-300 hover:text-white bg-brand-500/10 hover:bg-brand-500/20 px-4 py-2 rounded-xl border border-brand-500/20 hover:border-brand-500/40 transition-all group"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};
