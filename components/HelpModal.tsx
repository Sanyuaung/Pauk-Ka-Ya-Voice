import React from 'react';
import { X, Mic, Square, Wand2, Wifi, Smartphone, Volume2, Ear, ShieldCheck, HelpCircle, AlertTriangle, Zap } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-orange-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 rounded-lg">
                <HelpCircle className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">User Guide</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* How to Use Section */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap className="h-3 w-3" /> Quick Start
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold mb-3 text-sm">1</div>
                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <Mic className="h-3.5 w-3.5" /> Record
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Tap the Mic button. Speak clearly. The app automatically reduces background noise.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold mb-3 text-sm">2</div>
                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <Square className="h-3.5 w-3.5" /> Stop
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Tap Stop when finished. The AI will instantly transcribe your Burmese speech into text.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mb-3 text-sm">3</div>
                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <Wand2 className="h-3.5 w-3.5" /> Refine
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Use "Smart Refine" to correct grammar errors or "Read Aloud" to listen to the result.
                </p>
              </div>
            </div>
          </section>

          {/* Noise Cancellation & Features */}
          <section className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-2xl border border-orange-100">
            <h3 className="text-xs font-bold text-orange-800 uppercase tracking-widest mb-3 flex items-center gap-2">
               <Volume2 className="h-3 w-3" /> Enhanced Audio System
            </h3>
            <div className="flex gap-4 items-start">
               <div className="bg-white p-2 rounded-xl shadow-sm">
                   <Zap className="h-5 w-5 text-orange-500" />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-slate-800">Noise Cancellation Active</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    This app uses advanced browser audio processing to actively suppress background noise (air conditioning, traffic, static) and cancel echoes. The AI is also trained to focus on the main speaker's voice.
                  </p>
               </div>
            </div>
          </section>

          {/* Troubleshooting Section */}
          <section>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" /> Troubleshooting
            </h3>
            <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className="text-xs font-bold text-slate-700 min-w-[120px]">Microphone Denied</span>
                    <span className="text-xs text-slate-500">
                        Check your browser address bar. Click the lock icon 🔒 and allow "Microphone" access.
                    </span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className="text-xs font-bold text-slate-700 min-w-[120px]">No Sound / Flat Waveform</span>
                    <span className="text-xs text-slate-500">
                        Your input volume might be too low. Check your system sound settings or try a headset.
                    </span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className="text-xs font-bold text-slate-700 min-w-[120px]">Transcription Error</span>
                    <span className="text-xs text-slate-500">
                        The AI relies on internet connection. Ensure you are online. Try shorter sentences (under 1 minute) for best accuracy.
                    </span>
                </div>
            </div>
          </section>

          {/* Privacy & Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <section>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" /> Privacy & Safety
                </h3>
                <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside">
                    <li>Audio is processed by Google AI securely.</li>
                    <li>Audio files are <span className="font-semibold text-slate-700">never stored</span> permanently.</li>
                    <li>History is saved only on your device (Local Storage).</li>
                    <li>You can clear your history at any time.</li>
                </ul>
            </section>
            
            <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Smartphone className="h-3 w-3" /> Supported Devices
                </h3>
                <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside">
                    <li><span className="font-semibold text-slate-700">Desktop:</span> Chrome, Edge, Safari (macOS).</li>
                    <li><span className="font-semibold text-slate-700">Android:</span> Chrome (Recommended).</li>
                    <li><span className="font-semibold text-slate-700">iOS:</span> Safari (iOS 14.5+).</li>
                    <li>Requires stable Internet connection.</li>
                </ul>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HelpModal;