import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Lock, Sparkles, UserCheck } from 'lucide-react';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  title = 'Sign In Required for Personalization',
  message = 'Sign in or create a student account to save your reading progress, bookmark books and lessons, and access your personal digital library across devices.',
}) => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onClose();
    navigate('/login');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="md">
      <div className="text-center space-y-5 p-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center mx-auto shadow-xl shadow-brand-500/25">
          <Bookmark className="w-7 h-7 text-white" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-white tracking-tight">{title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">{message}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <Sparkles className="w-4 h-4 text-brand-400" />
            With a free Hopenix Student Account:
          </div>
          <ul className="space-y-1.5 pl-6 list-disc text-slate-400">
            <li>Sync reading progress across all desktop & mobile devices</li>
            <li>Bookmark unlimited books & individual lessons</li>
            <li>Track completion percentages & view history</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Continue Reading as Guest
          </Button>
          <Button
            variant="primary"
            className="flex-1 shadow-lg shadow-brand-500/25"
            onClick={handleSignIn}
            icon={<UserCheck className="w-4 h-4" />}
          >
            Sign In / Register
          </Button>
        </div>
      </div>
    </Modal>
  );
};
