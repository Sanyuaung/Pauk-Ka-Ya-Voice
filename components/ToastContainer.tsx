import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 w-full max-w-xs pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border animate-in slide-in-from-right-full duration-300 ${
            toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-800' :
            toast.type === 'error' ? 'bg-white border-rose-100 text-rose-800' :
            'bg-white border-blue-100 text-blue-800'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-500" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
          
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          
          <button 
            onClick={() => onRemove(toast.id)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;