'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  Activity,
  RefreshCw,
  Sparkles,
  GitBranch,
  ShieldCheck,
  Cpu,
  Trophy,
  Check,
  Volume2,
} from 'lucide-react';
import { JUDGE_PRESETS } from '@/lib/presets';
import { AudioVisualizerHUD } from '@/components/AudioVisualizerHUD';
import { useTheme } from '@/lib/ThemeContext';

interface InputControlCenterProps {
  activePresetId: string | null;
  onSelectPreset: (presetId: string) => void;
  voiceTranscript: string;
  setVoiceTranscript: (text: string) => void;
  gitDiff: string;
  setGitDiff: (text: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

// Lightweight Web Audio API synthesizer for tactile acoustic feedback (zero dependencies)
function playAudioChime(type: 'start' | 'stop') {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.16);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Non-blocking for autoplay policies or headless test runners
  }
}

export function InputControlCenter({
  activePresetId,
  onSelectPreset,
  voiceTranscript = '',
  setVoiceTranscript,
  gitDiff = '',
  setGitDiff,
  onGenerate,
  isGenerating = false,
}: InputControlCenterProps) {
  const { isLight } = useTheme();

  // Active diff tab: dynamic per preset
  const [activeDiffFile, setActiveDiffFile] = useState<string>('file1');

  // Simulation & Voice Stream State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [streamElapsed, setStreamElapsed] = useState<number>(0);
  const [simulatedLevel, setSimulatedLevel] = useState<number>(0);
  const [justCompletedSimulation, setJustCompletedSimulation] = useState<boolean>(false);

  // Live Audio HUD state
  const [isAudioReactive, setIsAudioReactive] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Animation and streaming interval references
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const waveAnimRef = useRef<number | null>(null);
  const successBadgeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep stable refs to avoid stale closure in listeners
  const onSelectPresetRef = useRef(onSelectPreset);
  useEffect(() => {
    onSelectPresetRef.current = onSelectPreset;
  }, [onSelectPreset]);

  const setVoiceTranscriptRef = useRef(setVoiceTranscript);
  useEffect(() => {
    setVoiceTranscriptRef.current = setVoiceTranscript;
  }, [setVoiceTranscript]);

  // Clean up all timers and animation frames on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (waveAnimRef.current !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(waveAnimRef.current);
      }
      if (successBadgeTimerRef.current) clearTimeout(successBadgeTimerRef.current);
    };
  }, []);

  // Sync active diff file default when preset changes
  useEffect(() => {
    setActiveDiffFile('file1');
  }, [activePresetId]);

  // Icon mapping for presets
  const getPresetIcon = (id: string) => {
    switch (id) {
      case 'auth-refactor':
        return <ShieldCheck className="h-3.5 w-3.5" />;
      case 'ai-agent-pipeline':
        return <Cpu className="h-3.5 w-3.5" />;
      case 'hackathon-project':
        return <Trophy className="h-3.5 w-3.5" />;
      default:
        return <Sparkles className="h-3.5 w-3.5" />;
    }
  };

  // Terminate stream cleanly
  const stopVoiceStream = useCallback(
    (completedTranscript?: string) => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
        elapsedTimerRef.current = null;
      }
      if (waveAnimRef.current !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(waveAnimRef.current);
        waveAnimRef.current = null;
      }

      if (completedTranscript !== undefined) {
        setVoiceTranscriptRef.current(completedTranscript);
      }

      setIsRecording(false);
      setSimulatedLevel(0);
      playAudioChime('stop');

      setJustCompletedSimulation(true);
      if (successBadgeTimerRef.current) clearTimeout(successBadgeTimerRef.current);
      successBadgeTimerRef.current = setTimeout(() => {
        setJustCompletedSimulation(false);
      }, 3500);
    },
    []
  );

  // Realistic Wispr Flow Word-by-Word Voice Stream Simulation
  const handleSimulateWisprVoice = useCallback(() => {
    // If currently simulating, stop and finalize immediately
    if (isRecording) {
      // Find full transcript to populate instantly on early stop
      const targetPreset =
        JUDGE_PRESETS.find((p) => p.id === activePresetId) ||
        JUDGE_PRESETS[1] ||
        JUDGE_PRESETS[0];
      const fullText = targetPreset?.voiceTranscript || '';
      stopVoiceStream(fullText);
      return;
    }

    // Determine target transcript based on currently active preset
    const targetPreset =
      JUDGE_PRESETS.find((p) => p.id === activePresetId) ||
      JUDGE_PRESETS[1] ||
      JUDGE_PRESETS[0];

    const fullTranscript =
      targetPreset?.voiceTranscript ||
      'Shipped autonomous multi-agent tool routing with cosine similarity fallback and token retry bounds. PR ready for merge.';

    const words = fullTranscript.split(/\s+/);
    if (words.length === 0) return;

    // Start simulation
    playAudioChime('start');
    setIsRecording(true);
    setStreamElapsed(0);
    setJustCompletedSimulation(false);
    setVoiceTranscriptRef.current('');

    // Start elapsed second ticker
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    elapsedTimerRef.current = setInterval(() => {
      setStreamElapsed((prev) => prev + 1);
    }, 1000);

    // Dynamic wave animation loop
    let waveTick = 0;
    const animateWave = () => {
      waveTick += 0.18;
      // Synthesize realistic speech amplitude modulation
      const energy = 0.35 + Math.sin(waveTick * 1.5) * 0.25 + Math.cos(waveTick * 3.1) * 0.2;
      setSimulatedLevel(Math.max(0.1, Math.min(1, energy)));
      waveAnimRef.current = requestAnimationFrame(animateWave);
    };
    waveAnimRef.current = requestAnimationFrame(animateWave);

    // Stream words into textarea with natural cadence (~55ms per word)
    let wordIndex = 0;
    let accumulatedText = '';

    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    streamIntervalRef.current = setInterval(() => {
      if (wordIndex < words.length) {
        // Append 1 to 2 words per tick for realistic speech burst rhythm
        const count = wordIndex % 5 === 0 ? 2 : 1;
        const nextWords = words.slice(wordIndex, wordIndex + count).join(' ');
        accumulatedText = accumulatedText ? `${accumulatedText} ${nextWords}` : nextWords;
        wordIndex += count;
        setVoiceTranscriptRef.current(accumulatedText);
      } else {
        // Finished all words
        stopVoiceStream(fullTranscript);
      }
    }, 55);
  }, [activePresetId, isRecording, stopVoiceStream]);

  // Spacebar push/tap to talk (when outside input fields)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        handleSimulateWisprVoice();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSimulateWisprVoice]);

  const handleSyncPr142 = () => {
    const pr142Preset =
      JUDGE_PRESETS.find((p) => p.id === 'ai-agent-pipeline') ??
      JUDGE_PRESETS[1] ??
      JUDGE_PRESETS[0];

    if (pr142Preset?.id) {
      onSelectPreset(pr142Preset.id);
    }
  };

  // Sanitize audio level (either from live mic or from simulation)
  const activeLevel = isRecording ? simulatedLevel : audioLevel;
  const safeAudioLevel =
    typeof activeLevel === 'number' && Number.isFinite(activeLevel)
      ? Math.max(0, Math.min(1, activeLevel))
      : 0;

  const isSoundActive = (isAudioReactive || isRecording) && safeAudioLevel > 0.05;

  // Visual aura glow
  const blurRadius = Math.round(12 + safeAudioLevel * (isLight ? 20 : 26));
  const glowAlpha = Math.min(1, Math.max(0, 0.25 + safeAudioLevel * (isLight ? 0.35 : 0.4))).toFixed(3);

  const ambientAuraStyle = isSoundActive
    ? {
        boxShadow: isLight
          ? `0 0 ${blurRadius}px rgba(217, 119, 6, ${glowAlpha})`
          : `0 0 ${blurRadius}px rgba(94, 106, 210, ${glowAlpha})`,
        borderColor: isLight ? 'rgba(217, 119, 6, 0.5)' : 'rgba(94, 106, 210, 0.5)',
        transition: 'box-shadow 0.08s ease-out, border-color 0.12s ease-out',
      }
    : {
        transition: 'box-shadow 0.25s ease-out, border-color 0.25s ease-out',
      };

  // Waveform heights
  const waveformHeights = [8, 14, 20, 10, 16, 12, 6, 18, 20, 12, 8, 16, 20, 10, 4, 8, 4, 8, 4, 4, 4, 4, 4];

  // Dynamic word count and speech estimation
  const trimmedTranscript = (voiceTranscript || '').trim();
  const wordCount = trimmedTranscript ? trimmedTranscript.split(/\s+/).length : 0;
  const estSeconds = Math.max(0, Math.round(wordCount / 2.2));
  const estMinutesFormatted = String(Math.floor(estSeconds / 60)).padStart(2, '0');
  const estSecondsFormatted = String(estSeconds % 60).padStart(2, '0');
  const durationDisplay =
    wordCount > 0 ? `${estMinutesFormatted}:${estSecondsFormatted}` : '01:24';

  const streamDurationDisplay = `00:${String(streamElapsed).padStart(2, '0')}`;

  // Master CTA disabled check
  const hasContent = Boolean(voiceTranscript?.trim() || gitDiff?.trim());
  const canGenerate = !isGenerating && hasContent;

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canGenerate) return;
    onGenerate();
  };

  // Dynamic Git Diff Metadata per Preset
  const diffMeta = {
    'auth-refactor': {
      branch: 'feat/oauth2-pkce-edge',
      stats: '+30 -6 (2 files)',
      file1Name: 'middleware.ts',
      file2Name: 'lib/auth/redis.ts',
    },
    'hackathon-project': {
      branch: 'feat/whispr-flow-v1',
      stats: '+142 -12 (3 files)',
      file1Name: 'app/page.tsx',
      file2Name: 'components/BentoGrid.tsx',
    },
    'ai-agent-pipeline': {
      branch: 'feat/agent-router-v2',
      stats: '+84 -29 (2 files)',
      file1Name: 'tools/registry.ts',
      file2Name: 'services/agent_runner.py',
    },
  }[activePresetId || 'ai-agent-pipeline'] || {
    branch: 'feat/agent-router-v2',
    stats: '+84 -29 (2 files)',
    file1Name: 'tools/registry.ts',
    file2Name: 'services/agent_runner.py',
  };

  return (
    <div
      className={`flex flex-col gap-4 rounded-xl p-5 shadow-xs transition-colors overflow-hidden ${
        isLight
          ? 'bg-white border border-[#E6E6E4]'
          : 'bg-[#121315] border border-[#292a2b]'
      }`}
    >
      {/* 1. Header & Status Bar */}
      <div>
        <div
          className={`flex items-center justify-between pb-2 mb-3 border-b ${
            isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isRecording ? 'bg-rose-400 opacity-90' : 'bg-emerald-400 opacity-75'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isRecording ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              ></span>
            </span>
            <h2
              className={`text-xs font-semibold tracking-tight ${
                isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'
              }`}
            >
              Input Control Center
            </h2>
            <span className={isLight ? 'text-zinc-400 text-xs' : 'text-zinc-600 text-xs'}>•</span>
            <span
              className={`text-[11px] font-mono flex items-center gap-1 ${
                isRecording
                  ? 'text-rose-500 font-semibold animate-pulse'
                  : isLight
                  ? 'text-zinc-500'
                  : 'text-[#908f9e]'
              }`}
            >
              {isRecording ? 'Wispr Flow Streaming...' : 'Voice Engine Ready'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio-Reactive HUD Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsAudioReactive((prev) => !prev)}
              title="Ambient visualizer for your Wispr Flow voice stream"
              className={`flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-mono transition-colors cursor-pointer border ${
                isAudioReactive
                  ? isLight
                    ? 'border-amber-500/50 bg-[#FEF3C7] text-[#92400E]'
                    : 'border-[#5e6ad2]/50 bg-[#5e6ad2]/15 text-[#bdc2ff]'
                  : isLight
                  ? 'border-[#E6E6E4] bg-[#F4F4F5] text-zinc-600 hover:text-[#18181B]'
                  : 'border-[#292a2b] bg-[#1f2021] text-[#908f9e] hover:text-[#e3e2e3]'
              }`}
            >
              <Activity
                className={`h-3 w-3 ${
                  isAudioReactive ? (isLight ? 'text-amber-700' : 'text-[#bdc2ff]') : 'text-zinc-400'
                }`}
              />
              <span className="text-[11px]">HUD</span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isAudioReactive ? 'bg-emerald-500' : 'bg-neutral-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. Segmented Presets Track */}
        <div
          className={`p-1 rounded-lg grid grid-cols-3 gap-1 border ${
            isLight
              ? 'bg-[#F4F4F5] border-[#E6E6E4]'
              : 'bg-[#0d0e0f] border-[#292a2b]'
          }`}
        >
          {JUDGE_PRESETS.map((preset, index) => {
            const isSelected = activePresetId === preset.id;
            const shortcut = `⌥${index + 1}`;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                title={`${preset.name} (${shortcut}) — ${preset.tagline}`}
                className={`py-1 px-2 rounded-md text-xs transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
                  isSelected
                    ? isLight
                      ? 'bg-white border border-[#E6E6E4] shadow-xs font-medium text-[#18181B]'
                      : 'bg-[#1f2021] text-[#e3e2e3] font-medium border border-[#343536] shadow-sm'
                    : isLight
                    ? 'font-normal text-zinc-600 hover:text-[#18181B] hover:bg-white/60'
                    : 'text-[#908f9e] hover:text-[#e3e2e3] hover:bg-[#1f2021]/50'
                }`}
              >
                <span
                  className={`shrink-0 ${
                    isSelected ? (isLight ? 'text-amber-600' : 'text-[#bdc2ff]') : 'text-zinc-400'
                  }`}
                >
                  {getPresetIcon(preset.id)}
                </span>
                <span className="truncate">{preset.name}</span>
                <span
                  className={`font-mono text-[10px] ${
                    isLight ? 'text-zinc-400' : 'text-[#908f9e]'
                  }`}
                >
                  {shortcut}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Primary Voice Transcript Box */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span
            className={`font-mono text-[11px] font-medium flex items-center gap-1.5 ${
              isRecording
                ? 'text-rose-500 font-semibold'
                : isLight
                ? 'text-zinc-600'
                : 'text-[#908f9e]'
            }`}
          >
            <Mic
              className={`h-3.5 w-3.5 ${
                isRecording
                  ? 'text-rose-500 animate-pulse'
                  : isLight
                  ? 'text-amber-600'
                  : 'text-[#5e6ad2]'
              }`}
            />
            {isRecording ? 'Wispr Flow Speech Stream (Active)' : 'Speech-to-Artifact Stream'}
          </span>

          <div className="flex items-center gap-2">
            {justCompletedSimulation && (
              <span className="font-mono text-[10px] text-emerald-500 flex items-center gap-1 animate-fadeIn">
                <Check className="h-3 w-3" />
                Synced via Wispr
              </span>
            )}
            <span
              className={`font-mono text-[10px] ${
                isLight ? 'text-zinc-400' : 'text-[#908f9e]'
              }`}
            >
              Raw Transcript ({wordCount} {wordCount === 1 ? 'word' : 'words'}, {durationDisplay})
            </span>
          </div>
        </div>

        {/* Live Audio Visualizer HUD (When Enabled) */}
        {isAudioReactive && (
          <AudioVisualizerHUD isActive={isAudioReactive} onVolumeChange={setAudioLevel} />
        )}

        {/* Textarea */}
        <div className="relative rounded-lg" style={ambientAuraStyle}>
          <textarea
            id="voice-transcript"
            rows={3}
            value={voiceTranscript}
            onChange={(e) => setVoiceTranscript(e.target.value)}
            placeholder="Speak or paste technical thoughts, commit notes, architectural adjustments... (Or tap Space to dictate)"
            className={`w-full max-h-28 overflow-y-auto [scrollbar-width:thin] rounded-lg p-3 text-xs leading-relaxed transition-all resize-none focus:outline-none font-sans ${
              isRecording
                ? isLight
                  ? 'bg-amber-50/40 border-amber-500/80 text-zinc-800'
                  : 'bg-[#5e6ad2]/10 border-[#5e6ad2]/80 text-white'
                : isLight
                ? 'bg-[#FAFAFA] border border-[#E6E6E4] text-zinc-700 placeholder:text-zinc-400 focus:border-amber-600'
                : 'bg-[#0d0e0f] border border-[#292a2b] text-[#e3e2e3] placeholder:text-[#908f9e] focus:border-[#5e6ad2]'
            }`}
          />

          {/* Subtle live transcription typing indicator inside textarea */}
          {isRecording && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/60 text-emerald-400 backdrop-blur-xs">
              <span className="animate-ping h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block"></span>
              <span>listening...</span>
            </div>
          )}
        </div>

        {/* Audio Waveform Scrubber HUD matching Stitch */}
        <div
          className={`p-2.5 rounded-lg border flex flex-col gap-1.5 shadow-xs transition-colors ${
            isLight ? 'bg-white border-[#E6E6E4]' : 'bg-[#1b1c1d] border-[#292a2b]'
          }`}
        >
          <div
            className={`flex items-center justify-between font-mono text-[10px] ${
              isLight ? 'text-zinc-500' : 'text-[#908f9e]'
            }`}
          >
            <span
              className={
                isRecording
                  ? 'text-rose-500 font-semibold font-mono animate-pulse'
                  : isLight
                  ? 'text-amber-700 font-semibold'
                  : 'text-[#bdc2ff] font-semibold'
              }
            >
              {isRecording ? streamDurationDisplay : '00:48'}
            </span>
            <span
              className={`text-[9px] uppercase tracking-wider flex items-center gap-1.5 ${
                isRecording
                  ? 'text-emerald-500 font-semibold animate-pulse'
                  : isLight
                  ? 'text-zinc-400'
                  : 'text-[#908f9e]'
              }`}
            >
              {isRecording ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  STREAMING AUDIO VIA WISPR FLOW
                </>
              ) : (
                'VECTOR ROUTING PINPOINTED'
              )}
            </span>
            <span>{durationDisplay}</span>
          </div>

          {/* Waveform Bars */}
          <div
            className={`w-full h-7 flex items-center justify-between gap-[3px] px-1 rounded border overflow-hidden ${
              isLight ? 'bg-[#FAFAFA] border-[#E6E6E4]' : 'bg-[#0d0e0f] border-[#292a2b]'
            }`}
          >
            {waveformHeights.map((h, i) => {
              // Bound dynamic height strictly between 4px and 24px
              const dynamicHeight = isSoundActive
                ? Math.max(
                    4,
                    Math.min(
                      24,
                      Math.round(h * (1 + safeAudioLevel * (0.8 + Math.sin(i * 0.7) * 0.5)))
                    )
                  )
                : Math.max(4, Math.min(24, h));
              const isHighlight = i < 18;
              return (
                <div
                  key={i}
                  style={{ height: `${dynamicHeight}px` }}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    isRecording
                      ? i % 2 === 0
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                      : isHighlight
                      ? isLight
                        ? i % 4 === 0
                          ? 'bg-amber-600'
                          : 'bg-amber-600/70'
                        : i % 3 === 0
                        ? 'bg-[#5e6ad2]'
                        : 'bg-[#bdc2ff]'
                      : isLight
                      ? 'bg-zinc-300'
                      : 'bg-[#292a2b]'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Voice Trigger Row Micro-Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={handleSimulateWisprVoice}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
              isRecording
                ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse'
                : isLight
                ? 'bg-[#18181B] hover:bg-black text-white'
                : 'bg-[#1f2021] hover:bg-[#292a2b] text-[#e3e2e3] border border-[#292a2b]'
            }`}
          >
            <Mic
              className={`h-3.5 w-3.5 ${
                isRecording
                  ? 'text-white animate-spin'
                  : isLight
                  ? 'text-amber-500'
                  : 'text-[#ffb867]'
              }`}
            />
            <span className="font-medium">
              {isRecording ? 'Stop Streaming (Space / Click)' : 'Simulate Wispr Voice'}
            </span>
            {!isRecording && (
              <kbd
                className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono border ${
                  isLight
                    ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    : 'bg-[#121315] text-[#908f9e] border-[#292a2b]'
                }`}
              >
                Space
              </kbd>
            )}
          </button>

          <button
            type="button"
            onClick={() => setVoiceTranscript('')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-xs cursor-pointer ${
              isLight
                ? 'border-[#E6E6E4] bg-white hover:bg-zinc-50 text-zinc-600'
                : 'border-[#292a2b] bg-[#1b1c1d] hover:bg-[#1f2021] text-[#908f9e]'
            }`}
          >
            Clear
          </button>

          <button
            type="button"
            onClick={handleSyncPr142}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors shadow-xs flex items-center gap-1 cursor-pointer ${
              isLight
                ? 'border-[#E6E6E4] bg-white hover:bg-zinc-50 text-zinc-700'
                : 'border-[#292a2b] bg-[#1b1c1d] hover:bg-[#1f2021] text-[#e3e2e3]'
            }`}
            title="Sync PR #142 preset (AI Agent Pipeline)"
          >
            <RefreshCw className={`h-3 w-3 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
            <span>Sync PR #142</span>
          </button>
        </div>
      </div>

      {/* 4. Always-Visible Git Diff Code Block */}
      <div
        className={`h-36 overflow-y-auto [scrollbar-width:thin] rounded-lg p-3 font-mono text-[11px] flex flex-col gap-2 shadow-xs border transition-colors ${
          isLight ? 'bg-[#F4F4F5] border-[#E6E6E4]' : 'bg-[#0d0e0f] border-[#292a2b]'
        }`}
      >
        <div
          className={`sticky top-0 z-10 flex items-center justify-between pb-1 border-b ${
            isLight ? 'border-[#E6E6E4] bg-[#F4F4F5]' : 'border-[#292a2b] bg-[#0d0e0f]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <GitBranch className={`h-3.5 w-3.5 ${isLight ? 'text-zinc-600' : 'text-[#5e6ad2]'}`} />
            <span className={`font-semibold ${isLight ? 'text-zinc-800' : 'text-[#e3e2e3]'}`}>
              {diffMeta.branch}
            </span>
            <span className={isLight ? 'text-zinc-500 text-[10px]' : 'text-[#908f9e] text-[10px]'}>
              {diffMeta.stats}
            </span>
          </div>

          {/* Dynamic File Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveDiffFile('file1')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                activeDiffFile === 'file1'
                  ? isLight
                    ? 'bg-white border border-[#E6E6E4] text-zinc-800'
                    : 'bg-[#1f2021] border border-[#292a2b] text-[#e3e2e3]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {diffMeta.file1Name}
            </button>
            <button
              type="button"
              onClick={() => setActiveDiffFile('file2')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                activeDiffFile === 'file2'
                  ? isLight
                    ? 'bg-white border border-[#E6E6E4] text-zinc-800'
                    : 'bg-[#1f2021] border border-[#292a2b] text-[#e3e2e3]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {diffMeta.file2Name}
            </button>
            <button
              type="button"
              onClick={() => setActiveDiffFile('raw')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                activeDiffFile === 'raw'
                  ? isLight
                    ? 'bg-white border border-[#E6E6E4] text-zinc-800'
                    : 'bg-[#1f2021] border border-[#292a2b] text-[#e3e2e3]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              raw diff
            </button>
          </div>
        </div>

        {/* Dynamic Syntax Lines based on Active Preset & File */}
        {activeDiffFile === 'raw' ? (
          <div className="flex flex-col gap-0.5 font-mono text-[10px] leading-tight max-h-36 overflow-y-auto">
            {gitDiff ? (
              gitDiff.split('\n').map((line, idx) => {
                const isAdd = line.startsWith('+') && !line.startsWith('+++');
                const isDel = line.startsWith('-') && !line.startsWith('---');
                const isHunk = line.startsWith('@@');
                return (
                  <div
                    key={idx}
                    className={`px-1 py-0.5 font-mono truncate ${
                      isAdd
                        ? isLight
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : 'bg-emerald-500/10 text-emerald-400'
                        : isDel
                        ? isLight
                          ? 'bg-[#FEE2E2] text-[#991B1B]'
                          : 'bg-red-500/10 text-red-400'
                        : isHunk
                        ? isLight
                          ? 'text-zinc-400'
                          : 'text-[#908f9e]'
                        : isLight
                        ? 'text-zinc-600'
                        : 'text-zinc-400'
                    }`}
                  >
                    {line}
                  </div>
                );
              })
            ) : (
              <div className="text-zinc-500 italic py-1">// No git diff provided</div>
            )}
          </div>
        ) : activePresetId === 'auth-refactor' ? (
          activeDiffFile === 'file1' ? (
            <div className="flex flex-col gap-1 font-mono text-[10.5px] leading-tight">
              <div className={isLight ? 'text-zinc-400' : 'text-[#908f9e]'}>
                @@ -12,8 +12,12 @@ export async function middleware(req: NextRequest) &#123;
              </div>
              <div
                className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                  isLight
                    ? 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]'
                    : 'bg-red-500/10 text-red-400 border-red-500'
                }`}
              >
                - const session = await getCookieSession(req);
              </div>
              <div
                className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                  isLight
                    ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
                }`}
              >
                + const token = req.headers.get(&apos;authorization&apos;)?.replace(&apos;Bearer &apos;, &apos;&apos;);
              </div>
              <div
                className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                  isLight
                    ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
                }`}
              >
                + const verification = await verifyEdgeJwt(token);
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 font-mono text-[10.5px] leading-tight">
              <div className={isLight ? 'text-zinc-400' : 'text-[#908f9e]'}>
                @@ -0,0 +1,18 @@ export async function isTokenRevoked(jti: string)
              </div>
              <div
                className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                  isLight
                    ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
                }`}
              >
                + import &#123; Redis &#125; from &apos;@upstash/redis&apos;;
              </div>
              <div
                className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                  isLight
                    ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
                }`}
              >
                + const revoked = await redis.get(`revoked:$&#123;jti&#125;`);
              </div>
            </div>
          )
        ) : activePresetId === 'hackathon-project' ? (
          activeDiffFile === 'file1' ? (
            <div className="flex flex-col gap-1 font-mono text-[10.5px] leading-tight">
              <div className={isLight ? 'text-zinc-400' : 'text-[#908f9e]'}>
                @@ -0,0 +1,28 @@ export default function ShipSpeakApp()
              </div>
              <div
                className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                  isLight
                    ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
                }`}
              >
                + import &#123; VoiceInputCenter &#125; from &apos;@/components/InputControlCenter&apos;;
              </div>
              <div
                className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                  isLight
                    ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
                }`}
              >
                + &lt;Navbar badge=&quot;Built for Wispr No Hand Challenge&quot; /&gt;
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 font-mono text-[10.5px] leading-tight">
              <div className={isLight ? 'text-zinc-400' : 'text-[#908f9e]'}>
                @@ -18,6 +18,14 @@ export function BentoGrid(&#123; deliverables &#125;)
              </div>
              <div
                className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                  isLight
                    ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
                }`}
              >
                + &lt;PullRequestCard data=&#123;pullRequest&#125; /&gt;
              </div>
              <div
                className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                  isLight
                    ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
                }`}
              >
                + &lt;ArchitectureCard data=&#123;architecture&#125; /&gt;
              </div>
            </div>
          )
        ) : activeDiffFile === 'file1' ? (
          <div className="flex flex-col gap-1 font-mono text-[10.5px] leading-tight">
            <div className={isLight ? 'text-zinc-400' : 'text-[#908f9e]'}>
              @@ -14,6 +14,8 @@ export class ToolRegistry &#123;
            </div>
            <div
              className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                isLight
                  ? 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]'
                  : 'bg-red-500/10 text-red-400 border-red-500'
              }`}
            >
              - if (tool.name === &apos;eval&apos;) &#123; runOldEval(task); &#125;
            </div>
            <div
              className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                isLight
                  ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
              }`}
            >
              + const toolScore = await computeEmbeddingSimilarity(task, tool.schema);
            </div>
            <div
              className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                isLight
                  ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
              }`}
            >
              + if (toolScore &gt; threshold) return this.dispatchVectorNode(tool);
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 font-mono text-[10.5px] leading-tight">
            <div className={isLight ? 'text-zinc-400' : 'text-[#908f9e]'}>
              @@ -58,6 +58,12 @@ def execute_agent_loop(context):
            </div>
            <div
              className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                isLight
                  ? 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]'
                  : 'bg-red-500/10 text-red-400 border-red-500'
              }`}
            >
              - result = legacy_single_eval(context.prompt)
            </div>
            <div
              className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                isLight
                  ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
              }`}
            >
              + result = await vector_route_dispatch(context.task_schema)
            </div>
            <div
              className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                isLight
                  ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
              }`}
            >
              + telemetry.record_latency(result.duration_ms)
            </div>
          </div>
        )}
      </div>

      {/* 5. Master Primary CTA matching Stitch */}
      <div className="flex flex-col gap-1.5 pt-1">
        <button
          type="button"
          onClick={handleGenerateClick}
          disabled={!canGenerate}
          className={`w-full font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-40 disabled:cursor-not-allowed ${
            isLight
              ? 'bg-[#18181B] hover:bg-black text-white'
              : 'bg-white text-[#0d0e0f] hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] font-bold'
          }`}
        >
          <span className={`font-bold ${isLight ? 'text-amber-500' : 'text-[#5e6ad2]'}`}>⚡</span>
          <span>{isGenerating ? 'Synthesizing Pipeline...' : 'Generate Ship Artifacts'}</span>
          <kbd
            className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-medium border ${
              isLight
                ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                : 'bg-[#0d0e0f]/15 border-[#0d0e0f]/15 text-[#0d0e0f]'
            }`}
          >
            ⌘↵
          </kbd>
        </button>

        <div
          className={`flex items-center justify-between text-[11px] font-mono px-1 ${
            isLight ? 'text-zinc-400' : 'text-[#908f9e]'
          }`}
        >
          <span>Auto-synced from daemon</span>
          <span>Estimated synthesis: ~1.2s</span>
        </div>
      </div>
    </div>
  );
}
