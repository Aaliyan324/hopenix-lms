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
    <div className="flex flex-col items-center justify-center p-10 md:p-14 text-center border border-dashed border-stone-300 rounded-2xl bg-white/70 my-6">
      <div className="p-4 rounded-2xl bg-orange-50 text-orange-600 mb-4 border border-orange-100">
        {icon || <BookOpen className="w-8 h-8 text-orange-600" />}
      </div>

      <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">{title}</h3>
      <p className="text-sm text-stone-500 max-w-md mb-6 leading-relaxed">{description}</p>
      
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};

