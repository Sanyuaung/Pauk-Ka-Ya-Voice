import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AppState, HistoryItem, ToastMessage } from './types';
import { transcribeAudio } from './services/geminiService';
import ControlPanel from './components/ControlPanel';
import ResultDisplay from './components/ResultDisplay';
import Waveform from './components/Waveform';
import ToastContainer from './components/ToastContainer';
import HistoryModal from './components/HistoryModal';
import { MessageCircleHeart, Sparkles, History } from 'lucide-react';

const RECORDING_LIMIT_SECONDS = 120;

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMicEnabled, setIsMicEnabled] = useState<boolean>(true);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  
  // New State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('voice_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  // Save history helper
  const saveToHistory = (text: string) => {
    if (!text) return;
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now(),
    };
    const newHistory = [newItem, ...history].slice(0, 50); // Keep last 50
    setHistory(newHistory);
    localStorage.setItem('voice_history', JSON.stringify(newHistory));
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleMic = () => {
    setIsMicEnabled(prev => !prev);
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setAppState(AppState.PROCESSING);
    }
  }, []);

  useEffect(() => {
    if (appState === AppState.RECORDING && recordingDuration >= RECORDING_LIMIT_SECONDS) {
      stopRecording();
      showToast("Time limit reached", "info");
    }
  }, [recordingDuration, appState, stopRecording]);

  const startRecording = useCallback(async () => {
    if (!isMicEnabled) {
      showToast("Please enable microphone access", "error");
      return;
    }

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      
      const mediaRecorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecordingDuration(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        audioStream.getTracks().forEach(track => track.stop());
        setStream(null);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleTranscription(audioBlob);
      };

      mediaRecorder.start();
      setAppState(AppState.RECORDING);
      setError(null);

      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied.");
      setAppState(AppState.ERROR);
      showToast("Microphone access denied", "error");
    }
  }, [isMicEnabled]);

  const handleTranscription = async (blob: Blob) => {
    try {
      const result = await transcribeAudio(blob);
      setTranscription(result);
      setAppState(AppState.COMPLETED);
      saveToHistory(result);
      showToast("Transcription complete", "success");
    } catch (err: any) {
      setError(err.message || "Failed to process audio.");
      setAppState(AppState.ERROR);
      showToast("Failed to process", "error");
    }
  };

  const handleRefinedText = (newText: string) => {
    setTranscription(newText);
    saveToHistory(newText); // Save the refined version too
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setTranscription('');
    setError(null);
    setRecordingDuration(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col font-sans text-slate-900">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <HistoryModal 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={(item) => {
          setTranscription(item.text);
          setAppState(AppState.COMPLETED);
          setIsHistoryOpen(false);
        }}
        onClear={() => {
          setHistory([]);
          localStorage.removeItem('voice_history');
        }}
      />

      {/* Header */}
      <header className="py-5 px-6 sticky top-0 z-30 bg-[#FFF8F0]/90 backdrop-blur-md border-b border-orange-50/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-tr from-orange-500 to-amber-500 text-white p-2 rounded-2xl shadow-lg shadow-orange-200 rotate-3 transition-transform hover:rotate-6">
                <MessageCircleHeart className="h-5 w-5" />
             </div>
             <div>
                <h1 className="text-xl font-black tracking-tight text-slate-800 font-['Padauk']">
                    Pauk-Ka-Ya Voice
                </h1>
             </div>
          </div>
          
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="p-2.5 rounded-full bg-white text-slate-500 hover:text-orange-500 hover:bg-orange-50 transition-all shadow-sm border border-slate-100"
            title="History"
          >
            <History className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center max-w-2xl mx-auto w-full p-4 pb-0">
        
        {/* Visualizer Area */}
        <div className="w-full mb-6 transform transition-all duration-500 hover:scale-[1.01]">
          <Waveform isRecording={appState === AppState.RECORDING} stream={stream} />
        </div>

        {/* Results */}
        <div className="w-full flex-1 flex flex-col min-h-0 relative">
          <ResultDisplay 
            appState={appState} 
            transcription={transcription}
            error={error}
            onRefined={handleRefinedText}
            showToast={showToast}
          />
        </div>

      </main>

      {/* Sticky Bottom Controls */}
      <footer className="sticky bottom-0 bg-white/60 backdrop-blur-xl border-t border-white/50 py-4 px-4 z-40">
        <ControlPanel 
          appState={appState}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onReset={resetApp}
          isMicEnabled={isMicEnabled}
          onToggleMic={toggleMic}
          recordingDuration={recordingDuration}
        />
      </footer>
    </div>
  );
};

export default App;