import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ msg: '', show: false, error: false });
  const timerRef = useRef(null);

  const showToast = useCallback((msg, isError = false) => {
    setToast({ msg, show: true, error: !!isError });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        className="toast"
        style={{
          borderColor: toast.error ? 'var(--bad)' : 'var(--good)',
          opacity: toast.show ? 1 : 0,
          transform: toast.show ? 'translateY(0)' : 'translateY(10px)',
        }}
      >
        {toast.msg}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
