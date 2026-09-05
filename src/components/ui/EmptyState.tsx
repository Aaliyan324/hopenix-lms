import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 md:p-14 text-center border-2 border-dashed border-brand-500/20 rounded-3xl bg-gradient-to-b from-slate-900/60 to-purple-950/20 my-6 backdrop-blur-xs relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative p-5 rounded-2xl bg-gradient-to-br from-brand-600/20 via-pink-500/20 to-purple-600/20 text-brand-300 mb-5 ring-1 ring-brand-400/30 shadow-lg shadow-brand-500/10 animate-float">
        {icon || <Sparkles className="w-9 h-9 text-brand-300" />}
      </div>

      <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">{description}</p>
      
      {actionText && onAction && (
        <Button onClick={onAction} variant="playful">
          {actionText}
        </Button>
      )}
    </div>
  );
};
