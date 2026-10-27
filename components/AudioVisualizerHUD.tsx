'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Activity, Mic, MicOff, AlertCircle, Info } from 'lucide-react';

interface AudioVisualizerHUDProps {
  isActive: boolean;
  onVolumeChange?: (volume: number) => void;
  className?: string;
}

export function AudioVisualizerHUD({
  isActive,
  onVolumeChange,
  className = '',
}: AudioVisualizerHUDProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(0);

  const onVolumeChangeRef = useRef(onVolumeChange);
  useEffect(() => {
    onVolumeChangeRef.current = onVolumeChange;
  }, [onVolumeChange]);

  // Stop & Clean up audio stream and context
  const cleanupAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }

    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch {
        // ignore
      }
      sourceRef.current = null;
    }

    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {
        // ignore
      }
      analyserRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }

    setCurrentLevel(0);
    if (onVolumeChangeRef.current) onVolumeChangeRef.current(0);

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      cleanupAudio();
      setPermissionError(null);
      return;
    }

    let isMounted = true;

    async function initAudio() {
      try {
        setPermissionError(null);

        // Check mediaDevices support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Browser mediaDevices API not supported');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64; // 32 frequency bins for responsive UI
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        function draw() {
          if (!analyserRef.current || !canvas || !ctx) return;

          analyserRef.current.getByteFrequencyData(dataArray);

          // Calculate average volume level (0 to 1)
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avg = sum / bufferLength;
          const normalizedVol = Math.min(1, avg / 128); // 0 to ~1

          setCurrentLevel(normalizedVol);
          if (onVolumeChangeRef.current) onVolumeChangeRef.current(normalizedVol);

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const barCount = 24;
          const barWidth = Math.floor((canvas.width - barCount * 2) / barCount);
          let x = 2;

          for (let i = 0; i < barCount; i++) {
            // Map bar index to frequency bin
            const binIdx = Math.floor((i / barCount) * bufferLength);
            const rawVal = dataArray[binIdx] || 0;
            const barHeight = Math.max(3, Math.floor((rawVal / 255) * canvas.height));

            // Restrained Indigo to Cyan gradient
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, '#5e6ad2');
            gradient.addColorStop(1, '#38bdf8');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, [2, 2, 0, 0]);
            ctx.fill();

            x += barWidth + 2;
          }

          animationFrameRef.current = requestAnimationFrame(draw);
        }

        draw();
      } catch (err: unknown) {
        console.warn('Microphone stream access error:', err);
        if (isMounted) {
          const msg =
            err instanceof Error && err.name === 'NotAllowedError'
              ? 'Microphone permission denied. Allow mic access in browser settings.'
              : 'Could not connect to microphone.';
          setPermissionError(msg);
          cleanupAudio();
        }
      }
    }

    initAudio();

    return () => {
      isMounted = false;
      cleanupAudio();
    };
  }, [isActive, cleanupAudio]);

  if (!isActive) return null;

  return (
    <div className={`rounded-lg border border-[#292a2b] bg-[#0d0e0f] p-2.5 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-medium text-[#e3e2e3] flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-[#5e6ad2]" />
            Live audio visualizer
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#908f9e]">
            Signal: <span className="text-[#bdc2ff]">{Math.round(currentLevel * 100)}%</span>
          </span>
          <div
            className="flex items-center gap-1 text-[10px] text-[#908f9e] cursor-help"
            title="ambient visualizer for your Wispr Flow voice stream."
          >
            <Info className="h-3 w-3 text-[#908f9e]" />
            <span className="hidden sm:inline">Wispr Voice HUD</span>
          </div>
        </div>
      </div>

      {permissionError ? (
        <div className="flex items-center gap-1.5 rounded bg-rose-950/30 p-2 text-[11px] text-rose-300 border border-rose-500/20">
          <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
          <span>{permissionError}</span>
        </div>
      ) : (
        <div className="relative w-full h-8 flex items-center justify-center bg-[#121315] rounded border border-[#292a2b] overflow-hidden">
          <canvas
            ref={canvasRef}
            width={380}
            height={32}
            className="w-full h-full block"
          />
        </div>
      )}
    </div>
  );
}
