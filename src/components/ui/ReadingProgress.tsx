import React from 'react';
import { Sparkles, Trophy, Rocket, Crown, Star } from 'lucide-react';

interface ReadingProgressProps {
  percent: number;
  completedLessons?: number;
  totalLessons?: number;
  showMilestones?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ReadingProgress: React.FC<ReadingProgressProps> = ({
  percent,
  completedLessons,
  totalLessons,
  showMilestones = true,
  size = 'md',
  className = '',
}) => {
  const clampPercent = Math.min(100, Math.max(0, percent || 0));

  const milestones = [
    { at: 25, label: 'Starter', icon: Star, color: 'text-amber-400' },
    { at: 50, label: 'Halfway', icon: Rocket, color: 'text-sky-400' },
    { at: 75, label: 'Expert', icon: Trophy, color: 'text-purple-400' },
    { at: 100, label: 'Master', icon: Crown, color: 'text-pink-400' },
  ];

  const heights = {
    sm: 'h-2',
    md: 'h-3.5',
    lg: 'h-5',
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs font-extrabold">
        <span className="text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand-400" />
          Reading Quest Progress
        </span>
        <span className="text-brand-300 text-sm font-black">{clampPercent}%</span>
      </div>

      <div className="relative">
        <div className={`w-full bg-slate-950 rounded-full ${heights[size]} overflow-hidden border border-slate-800 shadow-inner p-0.5`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 via-purple-500 to-pink-500 transition-all duration-700 shadow-md shadow-brand-500/30"
            style={{ width: `${clampPercent}%` }}
          />
        </div>

        {showMilestones && size !== 'sm' && (
          <div className="flex justify-between items-center pt-2 px-1 text-[11px] font-bold text-slate-400">
            {milestones.map((m) => {
              const IconComponent = m.icon;
              const isReached = clampPercent >= m.at;
              return (
                <div
                  key={m.at}
                  className={`flex items-center gap-1 transition-all ${
                    isReached ? `${m.color} font-black scale-105` : 'text-slate-600 opacity-60'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{m.at}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {typeof completedLessons === 'number' && typeof totalLessons === 'number' && (
        <p className="text-[11px] font-semibold text-slate-400 text-right">
          {completedLessons} of {totalLessons} chapters completed
        </p>
      )}
    </div>
  );
};
