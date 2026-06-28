import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, XCircle, X, Info } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toastSuccess: (message: string) => void;
  toastError: (message: string) => void;
  toastInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider
      value={{
        toastSuccess: (m) => addToast('success', m),
        toastError: (m) => addToast('error', m),
        toastInfo: (m) => addToast('info', m),
      }}
    >
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 min-w-[280px] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all',
              'font-poppins text-sm',
              t.type === 'success' && 'border-green-200 bg-green-50 text-green-800',
              t.type === 'error' && 'border-red-200 bg-red-50 text-red-800',
              t.type === 'info' && 'border-blue-200 bg-blue-50 text-blue-800'
            )}
          >
            {t.type === 'success' && <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />}
            {t.type === 'error' && <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="h-4 w-4 shrink-0 mt-0.5" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
