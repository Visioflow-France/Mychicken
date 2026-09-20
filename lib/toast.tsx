'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import Icon from '@/components/Icon';

const ToastContext = createContext<(msg: string) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast({ id: Date.now(), msg });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* key={toast.id} : le remontage relance les animations d'entrée et de barre */}
      {toast && (
        <div key={toast.id} className="toast visible" role="status" aria-live="polite">
          <span className="toast-ico" aria-hidden="true"><Icon name="check" size={13} strokeWidth={2.6} /></span>
          <span className="toast-msg">{toast.msg}</span>
          <span className="toast-bar" aria-hidden="true" />
        </div>
      )}
    </ToastContext.Provider>
  );
}
