import React from 'react';
import { HistoryItem } from '../types';
import { X, Clock, Trash2, ChevronRight } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onSelect, onClear }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-orange-50/50">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold text-slate-800">History</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>No history yet.</p>
              <p className="text-xs mt-1">Start recording to save thoughts.</p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-orange-50 border border-transparent hover:border-orange-100 transition-all group"
              >
                <p className="font-['Padauk'] text-slate-700 line-clamp-2 text-sm leading-relaxed mb-2">
                  {item.text}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  <span>{new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400" />
                </div>
              </button>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-slate-50 bg-slate-50/50">
            <button 
              onClick={onClear}
              className="w-full py-3 flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-sm font-medium"
            >
              <Trash2 className="h-4 w-4" />
              Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;