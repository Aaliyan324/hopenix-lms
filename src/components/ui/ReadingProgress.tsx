import React from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';

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

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-stone-700 flex items-center gap-1.5 font-sans">
          <BookOpen className="w-3.5 h-3.5 text-stone-600" />
          Reading Progress
        </span>
        <span className="text-stone-900 font-semibold">{clampPercent}%</span>
      </div>

      <div className="relative">
        <div className={`w-full bg-stone-100 rounded-full ${heights[size]} overflow-hidden border border-stone-200 p-0.5`}>
          <div
            className="h-full rounded-full bg-stone-900 transition-all duration-500"
            style={{ width: `${clampPercent}%` }}
          />
        </div>
      </div>

      {typeof completedLessons === 'number' && typeof totalLessons === 'number' && (
        <p className="text-[11px] font-medium text-stone-500 text-right font-sans">
          {completedLessons} of {totalLessons} chapters read
        </p>
      )}
    </div>
  );
};

