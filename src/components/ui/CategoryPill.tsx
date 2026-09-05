import React from 'react';

interface CategoryPillProps {
  label: string;
  emoji?: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  label,
  emoji,
  active,
  onClick,
  count,
}) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 select-none ${
        active
          ? 'bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-brand-500/25 scale-105 border border-pink-400/30'
          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
      }`}
    >
      {emoji && <span className="text-sm">{emoji}</span>}
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
            active
              ? 'bg-white/20 text-white'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
