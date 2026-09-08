import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-lg border shadow-md transition-all duration-200 animate-in slide-in-from-bottom-3 ${
              item.type === 'success'
                ? 'bg-white border-emerald-300 text-emerald-950'
                : item.type === 'error'
                ? 'bg-white border-red-300 text-red-950'
                : 'bg-white border-stone-300 text-stone-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : item.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              ) : (
                <Info className="w-5 h-5 text-stone-600 shrink-0" />
              )}
              <span className="text-sm font-medium">{item.message}</span>
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

