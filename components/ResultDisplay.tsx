import React, { useState } from 'react';
import { Copy, Check, AlertCircle, Volume2, Loader, MessageSquare, Wand2, Share2, Sparkles } from 'lucide-react';
import { AppState } from '../types';
import { generateSpeech, refineBurmeseText } from '../services/geminiService';
import { decodeBase64, pcmToAudioBuffer } from '../utils/audioHelper';

interface ResultDisplayProps {
  appState: AppState;
  transcription: string;
  error: string | null;
  onRefined: (newText: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ appState, transcription, error, onRefined, showToast }) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const handleCopy = async () => {
    if (!transcription) return;
    try {
      await navigator.clipboard.writeText(transcription);
      setCopied(true);
      showToast("Copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showToast("Failed to copy", "error");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pauk-Ka-Ya Voice Note',
          text: transcription,
        });
        showToast("Shared successfully", "success");
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      handleCopy(); // Fallback
    }
  };

  const handleRefine = async () => {
    if (!transcription || isRefining) return;
    setIsRefining(true);
    showToast("Refining text with AI...", "info");
    
    try {
      const refined = await refineBurmeseText(transcription);
      onRefined(refined);
      showToast("Text refined successfully!", "success");
    } catch (err) {
      showToast("Could not refine text", "error");
    } finally {
      setIsRefining(false);
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
      showToast("Could not generate speech", "error");
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
        <div className="w-full max-w-sm space-y-6 opacity-60">
            <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded-full w-full animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded-full w-11/12 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded-full w-4/5 animate-pulse"></div>
            </div>
            <div className="flex justify-center">
              <Loader className="h-6 w-6 animate-spin text-orange-400" />
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
    <div className="flex-1 flex flex-col w-full h-full animate-in fade-in zoom-in-95 duration-500 ease-out">
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-white flex flex-col h-full min-h-[400px] relative overflow-hidden group">
        
        {/* Decorative Header */}
        <div className="h-1.5 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 w-full"></div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-slate-50/30">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Captured Text</h2>
          </div>
          
          <div className="flex gap-1.5">
            {/* Action Toolbar */}
            <button
              onClick={handleSpeak}
              disabled={isLoadingAudio || isPlaying}
              title="Read Aloud"
              className={`p-2 rounded-xl transition-all ${
                isPlaying ? "bg-orange-100 text-orange-600" : "hover:bg-slate-100 text-slate-500"
              }`}
            >
              {isLoadingAudio ? <Loader className="h-4 w-4 animate-spin" /> : <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />}
            </button>

            <button
              onClick={handleRefine}
              disabled={isRefining}
              title="Smart Refine"
              className={`p-2 rounded-xl transition-all ${
                isRefining ? "bg-purple-100 text-purple-600" : "hover:bg-purple-50 text-slate-500 hover:text-purple-600"
              }`}
            >
               {isRefining ? <Loader className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            </button>
            
            <div className="w-px h-6 bg-slate-200 mx-1 my-auto"></div>

             <button
              onClick={handleShare}
              title="Share"
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-all"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <button
              onClick={handleCopy}
              title="Copy"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                copied
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-800 text-white hover:bg-slate-700 shadow-md shadow-slate-200"
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <p className="burmese-font text-[14px] md:text-[15px] text-slate-700 whitespace-pre-wrap text-justify leading-loose tracking-wide">
            {transcription}
          </p>
        </div>
        
        <div className="px-6 py-3 bg-slate-50/50 flex justify-center items-center gap-2">
            <Sparkles className="h-3 w-3 text-orange-300" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                AI Powered
            </span>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;