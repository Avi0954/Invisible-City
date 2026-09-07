import React from 'react';
import { useToast, Toast } from '../../context/ToastContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col space-y-2.5 max-w-sm w-[calc(100%-2.5rem)] pointer-events-none font-sans"
      aria-live="polite"
    >
      {toasts.map((toast: Toast) => {
        let bgClass = 'bg-[#fcf9f2] text-[#1c1c18] border-[#e5e2da]';
        let IconComponent = Info;
        let iconClass = 'text-[#2f685f]';

        if (toast.type === 'success') {
          bgClass = 'bg-[#e1f3ee] text-[#06291b] border-[#a2d8cb]';
          IconComponent = CheckCircle2;
          iconClass = 'text-[#06291b]';
        } else if (toast.type === 'error') {
          bgClass = 'bg-red-50 text-red-900 border-red-200';
          IconComponent = AlertTriangle;
          iconClass = 'text-red-700';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start space-x-3 rounded-xl border p-3.5 shadow-lg transition-all transform translate-y-0 text-xs font-semibold ${bgClass}`}
          >
            <IconComponent className={`h-4 w-4 flex-shrink-0 mt-0.5 ${iconClass}`} />
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#787770] hover:text-[#1c1c18] transition-colors p-0.5 rounded focus:outline-none"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
