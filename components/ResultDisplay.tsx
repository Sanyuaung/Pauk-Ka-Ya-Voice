import React, { useState } from 'react';
import { Copy, Check, AlertCircle, Volume2, Loader, MessageSquare } from 'lucide-react';
import { AppState } from '../types';
import { generateSpeech } from '../services/geminiService';
import { decodeBase64, pcmToAudioBuffer } from '../utils/audioHelper';

interface ResultDisplayProps {
  appState: AppState;
  transcription: string;
  error: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ appState, transcription, error }) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const handleCopy = async () => {
    if (!transcription) return;
    try {
      await navigator.clipboard.writeText(transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSpeak = async () => {
    if (!transcription || isPlaying || isLoadingAudio) return;
    
    setIsLoadingAudio(true);
    try {
      const base64Audio = await generateSpeech(transcription);
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      const audioBuffer = pcmToAudioBuffer(decodeBase64(base64Audio), audioContext, 24000, 1);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        audioContext.close();
      };
      
      setIsPlaying(true);
      source.start(0);
      
    } catch (err) {
      console.error("TTS Error", err);
      alert("Could not generate speech.");
      setIsPlaying(false);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  if (appState === AppState.IDLE || appState === AppState.RECORDING) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[300px]">
        <div className={`p-8 rounded-full bg-white shadow-lg mb-6 transition-all duration-500 ${appState === AppState.RECORDING ? 'scale-110 shadow-orange-200 ring-4 ring-orange-50' : ''}`}>
            <MessageSquare className={`h-10 w-10 text-orange-300 ${appState === AppState.RECORDING ? 'animate-bounce' : ''}`} />
        </div>
        <p className="text-lg text-center font-bold text-slate-700">
          {appState === AppState.RECORDING ? "Listening..." : "Ready to listen!"}
        </p>
        <p className="text-sm text-center text-slate-400 mt-2 font-medium">
          Hit the mic and say something funny.
        </p>
      </div>
    );
  }

  if (appState === AppState.PROCESSING) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-orange-400 min-h-[300px]">
        <div className="w-full max-w-sm space-y-4 opacity-50">
            <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded-full w-full animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded-full w-11/12 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded-full w-4/5 animate-pulse"></div>
            </div>
        </div>
      </div>
    );
  }

  if (appState === AppState.ERROR) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-rose-500 min-h-[300px]">
        <div className="bg-rose-100 p-4 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-rose-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Oops!</h3>
        <p className="text-sm text-center mt-2 text-slate-500 max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-white flex flex-col h-full min-h-[400px] relative overflow-hidden">
        
        {/* Decorative Header */}
        <div className="h-2 bg-gradient-to-r from-orange-400 to-amber-400 w-full"></div>

        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Captured Text</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSpeak}
              disabled={isLoadingAudio || isPlaying}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all active:scale-95 ${
                isPlaying
                  ? "bg-orange-100 text-orange-600"
                  : "bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              {isLoadingAudio ? <Loader className="h-4 w-4 animate-spin" /> : <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />}
            </button>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all active:scale-95 ${
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-800 text-white hover:bg-slate-700 shadow-lg shadow-slate-200"
              }`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <p className="burmese-font text-[13px] text-slate-700 whitespace-pre-wrap text-justify leading-loose tracking-wide">
            {transcription}
          </p>
        </div>
        
        <div className="px-8 py-4 bg-slate-50/50 flex justify-center">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                Generated by Pauk-Ka-Ya Engine
            </span>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;