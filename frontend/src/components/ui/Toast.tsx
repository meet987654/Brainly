import {  useState } from 'react';

type ToastItem = { id: string; message: string; type?: 'info'|'success'|'error' };

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = (message: string, type: ToastItem['type'] = 'info', timeout = 3500) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    setToasts((t) => [...t, { id, message, type }]);
    if (timeout > 0) setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), timeout);
  };

  const clear = () => setToasts([]);

  const ToastContainer = () => (
    <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-3">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-2 rounded shadow-lg text-sm text-white ${t.type === 'success'? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-gray-800'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );

  return { show, clear, ToastContainer } as const;
}

export default function Toast() { return null }
