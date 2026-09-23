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
import SmartImg from '@/components/SmartImg';

/* Deux formes de bulle :
   – texte simple (confirmations, erreurs…)
   – plat { img, title } : la photo domine la bulle, posée en grand à gauche */
export type ToastPayload =
  | string
  | { img: string; title: string; note?: string };

const ToastContext = createContext<(msg: ToastPayload) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; payload: ToastPayload } | null>(null);

  const showToast = useCallback((payload: ToastPayload) => {
    setToast({ id: Date.now(), payload });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const dish = typeof toast?.payload === 'object' ? toast.payload : null;

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* key={toast.id} : le remontage relance les animations d'entrée et de barre */}
      {toast && (
        <div
          key={toast.id}
          className={`toast visible${dish ? ' toast--dish' : ''}`}
          role="status"
          aria-live="polite"
        >
          {dish ? (
            <>
              <span className="toast-dish-img">
                <SmartImg src={dish.img} alt={dish.title} />
              </span>
              <span className="toast-dish-txt">
                <b className="toast-dish-title">{dish.title}</b>
                <span className="toast-dish-note">
                  <Icon name="check" size={12} strokeWidth={2.6} />
                  {dish.note || 'Ajouté au panier'}
                </span>
              </span>
            </>
          ) : (
            <>
              <span className="toast-ico" aria-hidden="true">
                <Icon name="check" size={13} strokeWidth={2.6} />
              </span>
              <span className="toast-msg">{toast.payload as string}</span>
            </>
          )}
          <span className="toast-bar" aria-hidden="true" />
        </div>
      )}
    </ToastContext.Provider>
  );
}
