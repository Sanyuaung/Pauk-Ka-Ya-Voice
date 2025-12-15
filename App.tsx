import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AppState } from './types';
import { transcribeAudio } from './services/geminiService';
import ControlPanel from './components/ControlPanel';
import ResultDisplay from './components/ResultDisplay';
import Waveform from './components/Waveform';
import { MessageCircleHeart, Sparkles } from 'lucide-react';

const RECORDING_LIMIT_SECONDS = 120; // 2 minutes limit

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMicEnabled, setIsMicEnabled] = useState<boolean>(true);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

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

  // Watch for duration limit
  useEffect(() => {
    if (appState === AppState.RECORDING && recordingDuration >= RECORDING_LIMIT_SECONDS) {
      stopRecording();
    }
  }, [recordingDuration, appState, stopRecording]);

  const startRecording = useCallback(async () => {
    if (!isMicEnabled) return;

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      
      const mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecordingDuration(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
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
      setError("Microphone access denied. Please enable permissions.");
      setAppState(AppState.ERROR);
    }
  }, [isMicEnabled]);

  const handleTranscription = async (blob: Blob) => {
    try {
      const result = await transcribeAudio(blob);
      setTranscription(result);
      setAppState(AppState.COMPLETED);
    } catch (err: any) {
      setError(err.message || "Failed to process audio.");
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setTranscription('');
    setError(null);
    setRecordingDuration(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleMic = () => {
    setIsMicEnabled(!isMicEnabled);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col font-sans text-slate-900">
      {/* Playful Header */}
      <header className="py-6 px-6 sticky top-0 z-30 bg-[#FFF8F0]/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-center relative">
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-3 mb-1">
                <div className="bg-orange-500 text-white p-2 rounded-2xl shadow-lg shadow-orange-200 rotate-3">
                    <MessageCircleHeart className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-800 font-['Padauk']">
                    Pauk-Ka-Ya Voice
                </h1>
                <Sparkles className="h-5 w-5 text-yellow-400 fill-current animate-pulse" />
             </div>
             <p className="text-xs font-medium text-orange-400 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">
                Fun & Easy Burmese Scribe
             </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center max-w-2xl mx-auto w-full p-4 pb-0">
        
        {recordingDuration >= RECORDING_LIMIT_SECONDS && appState === AppState.PROCESSING && (
           <div className="mb-6 px-6 py-3 bg-red-50 text-red-500 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-2 shadow-sm">
             <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
             Limit reached! Wrapping up...
           </div>
        )}

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