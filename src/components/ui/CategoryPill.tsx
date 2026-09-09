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
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer shrink-0 select-none ${
        active
          ? 'bg-stone-900 text-stone-50 border border-stone-900 shadow-sm'
          : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
      }`}
    >
      {emoji && <span className="text-xs">{emoji}</span>}
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
            active
              ? 'bg-stone-800 text-stone-200'
              : 'bg-stone-100 text-stone-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};

