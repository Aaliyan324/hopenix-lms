import React from 'react';
import { BookOpen } from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center p-10 md:p-14 text-center border border-dashed border-stone-300 rounded-xl bg-white my-6">
      <div className="p-4 rounded-full bg-stone-100 text-stone-700 mb-4 border border-stone-200">
        {icon || <BookOpen className="w-8 h-8 text-stone-700" />}
      </div>

      <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">{title}</h3>
      <p className="text-sm text-stone-600 max-w-md mb-6 leading-relaxed font-sans">{description}</p>
      
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};

