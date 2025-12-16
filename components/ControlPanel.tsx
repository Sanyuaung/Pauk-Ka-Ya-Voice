import React from 'react';
import { Mic, MicOff, Square, Loader2, RotateCcw, Zap } from 'lucide-react';
import { AppState } from '../types';

interface ControlPanelProps {
  appState: AppState;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReset: () => void;
  isMicEnabled: boolean;
  onToggleMic: () => void;
  recordingDuration: number;
  isNoisyEnv: boolean;
  onToggleNoiseEnv: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  appState,
  onStartRecording,
  onStopRecording,
  onReset,
  isMicEnabled,
  onToggleMic,
  recordingDuration,
  isNoisyEnv,
  onToggleNoiseEnv
}) => {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      
      {/* Toggles (Visible when IDLE) */}
      {appState === AppState.IDLE && (
        <div className="flex flex-wrap justify-center gap-3 w-full">
          {/* Mic Access Toggle */}
          <div 
              onClick={onToggleMic}
              className="cursor-pointer flex items-center gap-3 bg-white/80 px-4 py-2 rounded-full shadow-sm border border-orange-100 hover:bg-white transition-colors select-none"
          >
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Mic Access</span>
            <div className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                isMicEnabled ? 'bg-green-400' : 'bg-slate-200'
              }`}
            >
              <span
                className={`${
                  isMicEnabled ? 'translate-x-3.5' : 'translate-x-0.5'
                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm`}
              />
            </div>
          </div>

          {/* Noisy Environment Toggle */}
          <div 
              onClick={onToggleNoiseEnv}
              className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border transition-all select-none ${
                isNoisyEnv ? 'bg-blue-50 border-blue-200' : 'bg-white/80 border-slate-200 hover:bg-white'
              }`}
          >
             <div className={`p-1 rounded-full ${isNoisyEnv ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                <Zap className="h-3 w-3 fill-current" />
             </div>
             <span className={`text-[10px] font-bold uppercase tracking-widest ${isNoisyEnv ? 'text-blue-600' : 'text-slate-400'}`}>
                Noisy Area
             </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-8 w-full mt-2">
        {appState === AppState.IDLE && (
          <button
            onClick={onStartRecording}
            disabled={!isMicEnabled}
            className={`group relative flex h-24 w-24 items-center justify-center rounded-[2rem] shadow-2xl shadow-orange-200 transition-all hover:-translate-y-1 hover:shadow-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-100 active:scale-95 ${
              isMicEnabled 
                ? "bg-gradient-to-br from-orange-400 to-amber-500 text-white" 
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
            aria-label="Start Recording"
          >
            {isMicEnabled ? <Mic className="h-10 w-10 drop-shadow-md" /> : <MicOff className="h-8 w-8" />}
          </button>
        )}

        {appState === AppState.RECORDING && (
          <div className="flex flex-row items-center gap-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
             <div className="text-4xl font-black text-slate-700 font-['Padauk'] tabular-nums tracking-tight">
               {formatTime(recordingDuration)}
             </div>
            <button
              onClick={onStopRecording}
              className="group relative flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-800 text-white shadow-xl shadow-slate-300 transition-all hover:bg-slate-900 hover:scale-105 focus:outline-none active:scale-95"
              aria-label="Stop Recording"
            >
              <Square className="h-8 w-8 fill-current" />
            </button>
          </div>
        )}

        {appState === AppState.PROCESSING && (
          <div className="flex flex-col items-center gap-3 w-full">
             <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-lg border border-orange-50 w-full max-w-xs justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                <span className="text-sm font-bold text-slate-600">Scribing your thoughts...</span>
             </div>
          </div>
        )}

        {(appState === AppState.COMPLETED || appState === AppState.ERROR) && (
          <button
            onClick={onReset}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-800 text-white hover:bg-slate-900 shadow-xl shadow-slate-200 transition-all transform hover:-translate-y-1 font-bold text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Start New
          </button>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;