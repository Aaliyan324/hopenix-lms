import React from 'react';

interface AchievementBadgeProps {
  icon?: string;
  title: string;
  description: string;
  unlocked?: boolean;
  progressText?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  icon = '🏆',
  title,
  description,
  unlocked = false,
  progressText,
}) => {
  return (
    <div
      className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
        unlocked
          ? 'bg-white border-stone-300 shadow-xs'
          : 'bg-stone-50 border-stone-200 opacity-75'
      }`}
    >
      <div
        className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0 border ${
          unlocked
            ? 'bg-stone-900 text-stone-50 border-stone-800'
            : 'bg-stone-100 text-stone-400 border-stone-200'
        }`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={`text-sm font-serif font-bold truncate ${unlocked ? 'text-stone-900' : 'text-stone-500'}`}>
            {title}
          </h4>
          {unlocked && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Completed
            </span>
          )}
        </div>
        <p className="text-xs text-stone-600 truncate mt-0.5 font-sans">{description}</p>
        {progressText && !unlocked && (
          <p className="text-[11px] font-medium text-stone-500 mt-1">{progressText}</p>
        )}
      </div>
    </div>
  );
};

