import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  isRecording: boolean;
  stream: MediaStream | null;
}

const Waveform: React.FC<WaveformProps> = ({ isRecording, stream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!isRecording || !stream || !canvasRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 64; // Fewer bars for "chunkier" fun look
    source.connect(analyser);
    
    analyserRef.current = analyser;
    const bufferLength = analyser.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!isRecording) return;
      
      animationRef.current = requestAnimationFrame(draw);
      
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / (dataArrayRef.current?.length || 1)) * 0.8;
      const gap = (canvas.width - (barWidth * (dataArrayRef.current?.length || 1))) / (dataArrayRef.current?.length || 1);
      
      let x = 0;

      if (dataArrayRef.current) {
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          const value = dataArrayRef.current[i];
          const barHeight = (value / 255) * canvas.height * 0.8;
          
          // Rounded pill shape
          const radius = barWidth / 2;
          const y = (canvas.height - barHeight) / 2; // Center vertically

          // Warm gradient
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, '#f59e0b'); // Amber 500
          gradient.addColorStop(1, '#f97316'); // Orange 500

          ctx.fillStyle = gradient;
          
          // Draw rounded rect manually
          ctx.beginPath();
          ctx.roundRect(x + gap/2, y, barWidth, Math.max(barHeight, barWidth), radius);
          ctx.fill();

          x += barWidth + gap;
        }
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContext.state !== 'closed') audioContext.close();
    };
  }, [isRecording, stream]);

  if (!isRecording) return null;

  return (
    <div className="w-full h-24 flex items-center justify-center overflow-hidden rounded-[2rem] bg-white border-2 border-orange-100 shadow-sm mx-auto">
      <canvas ref={canvasRef} width={600} height={96} className="w-full h-full px-8 py-2" />
    </div>
  );
};

export default Waveform;