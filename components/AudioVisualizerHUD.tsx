'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Activity, AlertCircle, Info } from 'lucide-react';

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

  // Stop & Clean up audio stream, nodes, and context
  const cleanupAudio = useCallback(() => {
    if (animationFrameRef.current !== null) {
      if (typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(animationFrameRef.current);
      }
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

    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close().catch(() => {});
        } catch {
          // ignore
        }
      }
      audioContextRef.current = null;
    }

    setCurrentLevel(0);
    if (onVolumeChangeRef.current) {
      try {
        onVolumeChangeRef.current(0);
      } catch {
        // ignore
      }
    }

    // Clear canvas safely
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        const ctx = canvas.getContext('2d');
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch {
        // ignore
      }
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

        // SSR / Browser environment guard
        if (typeof window === 'undefined') {
          return;
        }

        // Check mediaDevices support
        if (
          typeof navigator === 'undefined' ||
          !navigator.mediaDevices ||
          typeof navigator.mediaDevices.getUserMedia !== 'function'
        ) {
          throw new Error('Browser mediaDevices API not supported');
        }

        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

        if (!AudioContextClass) {
          throw new Error('Web Audio API not supported in this browser');
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
          stream.getTracks().forEach((t) => {
            try {
              t.stop();
            } catch {
              // ignore
            }
          });
          return;
        }

        streamRef.current = stream;

        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        if (audioCtx.state === 'suspended') {
          await audioCtx.resume().catch(() => {});
        }

        if (!isMounted) {
          cleanupAudio();
          return;
        }

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64; // 32 frequency bins for responsive UI
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Track last dispatched levels to throttle redundant React state updates
        let lastUiPercentage = -1;
        let lastCallbackVol = -1;
        let lastUiUpdateMs = 0;
        let lastCallbackUpdateMs = 0;

        function draw() {
          if (!isMounted || !analyserRef.current) return;

          const canvas = canvasRef.current;
          if (!canvas) {
            animationFrameRef.current = requestAnimationFrame(draw);
            return;
          }

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            animationFrameRef.current = requestAnimationFrame(draw);
            return;
          }

          try {
            analyserRef.current.getByteFrequencyData(dataArray);
          } catch {
            // Analyser closed or inaccessible
            return;
          }

          // Calculate average volume level (0 to 1) safely
          let sum = 0;
          let validSamples = 0;
          for (let i = 0; i < bufferLength; i++) {
            const val = dataArray[i];
            if (Number.isFinite(val)) {
              sum += val;
              validSamples++;
            }
          }

          const avg = validSamples > 0 ? sum / validSamples : 0;
          const normalizedVol = Number.isFinite(avg)
            ? Math.min(1, Math.max(0, avg / 128))
            : 0;

          const now = Date.now();
          const currentPercentage = Math.round(normalizedVol * 100);

          // Update HUD percentage text only if changed and throttled (~60ms) or dropped to 0
          if (
            (currentPercentage !== lastUiPercentage && now - lastUiUpdateMs > 60) ||
            (normalizedVol === 0 && lastUiPercentage !== 0)
          ) {
            lastUiPercentage = currentPercentage;
            lastUiUpdateMs = now;
            setCurrentLevel(normalizedVol);
          }

          // Trigger onVolumeChange callback throttled (~30ms) or on significant change / silence
          if (
            onVolumeChangeRef.current &&
            ((Math.abs(normalizedVol - lastCallbackVol) > 0.01 && now - lastCallbackUpdateMs > 30) ||
              (normalizedVol === 0 && lastCallbackVol !== 0))
          ) {
            lastCallbackVol = normalizedVol;
            lastCallbackUpdateMs = now;
            try {
              onVolumeChangeRef.current(normalizedVol);
            } catch {
              // ignore callback errors
            }
          }

          // Clear canvas (guard against width=0, height=0)
          if (canvas.width <= 0 || canvas.height <= 0) {
            animationFrameRef.current = requestAnimationFrame(draw);
            return;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const barCount = 24;
          const gap = 2;
          const totalGaps = (barCount + 1) * gap;
          const availableWidth = canvas.width - totalGaps;

          // If canvas width is too narrow to fit all bars, compute safe bar width
          if (availableWidth > 0 && canvas.height > 0) {
            const barWidth = Math.max(1, Math.floor(availableWidth / barCount));
            let x = gap;

            // Restrained Indigo to Cyan gradient - created once per frame
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, '#5e6ad2');
            gradient.addColorStop(1, '#38bdf8');
            ctx.fillStyle = gradient;

            for (let i = 0; i < barCount; i++) {
              // Map bar index to frequency bin safely
              const binIdx = bufferLength > 0 ? Math.floor((i / barCount) * bufferLength) : 0;
              const rawVal = Number.isFinite(dataArray[binIdx]) ? dataArray[binIdx] : 0;
              const barHeight = Math.max(
                2,
                Math.min(canvas.height, Math.floor((rawVal / 255) * canvas.height))
              );
              const y = Math.max(0, canvas.height - barHeight);

              ctx.beginPath();
              const radius = Math.min(2, Math.floor(barWidth / 2), Math.floor(barHeight / 2));
              if (radius > 0 && typeof ctx.roundRect === 'function') {
                try {
                  ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
                } catch {
                  ctx.rect(x, y, barWidth, barHeight);
                }
              } else {
                ctx.rect(x, y, barWidth, barHeight);
              }
              ctx.fill();

              x += barWidth + gap;
            }
          }

          animationFrameRef.current = requestAnimationFrame(draw);
        }

        draw();
      } catch (err: unknown) {
        console.warn('Microphone stream access error:', err);
        if (isMounted) {
          let msg = 'Could not connect to microphone.';
          if (err instanceof Error) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              msg = 'Microphone permission denied. Allow mic access in browser settings.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
              msg = 'No microphone device found. Please connect a microphone.';
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
              msg = 'Microphone is already in use by another application.';
            } else if (err.name === 'SecurityError') {
              msg = 'Microphone access is restricted by security policy.';
            } else if (err.message) {
              msg = err.message;
            }
          }
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
