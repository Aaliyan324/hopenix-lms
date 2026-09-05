import React from 'react';
import { Trophy, Star, Sparkles, BookOpen, Flame, Award } from 'lucide-react';

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
      className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
        unlocked
          ? 'bg-gradient-to-r from-brand-950/80 to-slate-900 border-brand-500/40 shadow-lg shadow-brand-500/10'
          : 'bg-slate-900/40 border-slate-800/60 opacity-65'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border shadow-inner ${
          unlocked
            ? 'bg-gradient-to-br from-brand-500 to-pink-500 text-white border-pink-400/40 animate-bounce-subtle'
            : 'bg-slate-800 text-slate-500 border-slate-700'
        }`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={`text-sm font-extrabold truncate ${unlocked ? 'text-white' : 'text-slate-400'}`}>
            {title}
          </h4>
          {unlocked && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Unlocked!
            </span>
          )}
        </div>
        <p className="text-xs text-slate-300 truncate mt-0.5">{description}</p>
        {progressText && !unlocked && (
          <p className="text-[11px] font-semibold text-brand-400 mt-1">{progressText}</p>
        )}
      </div>
    </div>
  );
};
