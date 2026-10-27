'use client';

import React, { useState } from 'react';
import {
  Mic,
  ChevronDown,
  ChevronUp,
  Sparkles,
  GitBranch,
  Trash2,
  FileCode,
  ShieldCheck,
  Cpu,
  Trophy,
  SlidersHorizontal,
  Volume2,
  Radio,
  Activity
} from 'lucide-react';
import { JUDGE_PRESETS } from '@/lib/presets';
import { AudioVisualizerHUD } from '@/components/AudioVisualizerHUD';

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

export function InputControlCenter({
  activePresetId,
  onSelectPreset,
  voiceTranscript,
  setVoiceTranscript,
  gitDiff,
  setGitDiff,
  onGenerate,
  isGenerating
}: InputControlCenterProps) {
  const [isDiffDrawerOpen, setIsDiffDrawerOpen] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isAudioReactive, setIsAudioReactive] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Keyboard shortcut listener for ⌥1, ⌥2, ⌥3 / Alt+1, Alt+2, Alt+3
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if ((e.key === '1' || e.code === 'Digit1') && JUDGE_PRESETS[0]) {
          e.preventDefault();
          onSelectPreset(JUDGE_PRESETS[0].id);
        } else if ((e.key === '2' || e.code === 'Digit2') && JUDGE_PRESETS[1]) {
          e.preventDefault();
          onSelectPreset(JUDGE_PRESETS[1].id);
        } else if ((e.key === '3' || e.code === 'Digit3') && JUDGE_PRESETS[2]) {
          e.preventDefault();
          onSelectPreset(JUDGE_PRESETS[2].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectPreset]);

  // Icon mapping for presets
  const getPresetIcon = (id: string) => {
    switch (id) {
      case 'auth-refactor':
        return <ShieldCheck className="h-4 w-4" />;
      case 'ai-agent-pipeline':
        return <Cpu className="h-4 w-4" />;
      case 'hackathon-project':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const handleSimulateWisprVoice = () => {
    setIsRecording(prev => !prev);
    if (!isRecording && !voiceTranscript) {
      setTimeout(() => {
        setVoiceTranscript(
          "Hey Wispr! So on this PR, we basically refactored our caching layer. Added redis TTLs of 300 seconds, removed stale local cookies, and wrapped everything in an edge middleware. Breaking change: client auth headers must now include standard Bearer tokens instead of session cookies."
        );
        setIsRecording(false);
      }, 1500);
    }
  };

  const wordCount = voiceTranscript.trim() ? voiceTranscript.trim().split(/\s+/).length : 0;
  const diffLines = gitDiff.trim() ? gitDiff.trim().split('\n').length : 0;

  // Compute ambient aura dynamic styles when sound levels rise above silence (> 0.04)
  const isSoundActive = isAudioReactive && audioLevel > 0.04;
  const ambientAuraStyle = isSoundActive
    ? {
        boxShadow: `0 0 ${12 + audioLevel * 24}px rgba(94, 106, 210, ${0.25 + audioLevel * 0.35})`,
        borderColor: 'rgba(94, 106, 210, 0.4)',
        transition: 'box-shadow 0.08s ease-out, border-color 0.15s ease-out',
      }
    : {
        transition: 'box-shadow 0.25s ease-out, border-color 0.25s ease-out',
      };

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-white/[0.08] bg-[#111215] p-5 shadow-sm overflow-hidden">
      {/* Header & Judge Presets Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
              Input Workspace
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Dictate your rationale or select a scenario
            </p>
          </div>
          <span className="font-mono text-[11px] bg-white/[0.05] text-zinc-300 px-2 py-0.5 rounded border border-white/[0.08]">
            Wispr Hotkey Ready
          </span>
        </div>

        {/* Sleek Segmented Tab Control for Judge Presets with ⌥1, ⌥2, ⌥3 hints */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Evaluation Presets</span>
            <span className="text-[10px] text-zinc-500 font-mono">1-click load</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-[#0a0b0d] p-1 rounded-lg border border-white/[0.08] overflow-hidden">
            {JUDGE_PRESETS.map((preset, index) => {
              const isSelected = activePresetId === preset.id;
              const shortcut = `⌥${index + 1}`;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset.id)}
                  title={`${preset.name} (${shortcut}) — ${preset.tagline}`}
                  className={`w-full min-w-0 flex items-center justify-between gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#1c1d22] text-white font-medium shadow-inner border border-white/[0.12]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className={`shrink-0 ${isSelected ? 'text-indigo-300' : 'text-zinc-500'}`}>
                      {getPresetIcon(preset.id)}
                    </span>
                    <span className="truncate text-left text-[11px] sm:text-xs">{preset.name}</span>
                  </div>
                  <kbd className="shrink-0 font-mono text-[9px] opacity-70 rounded bg-[#0a0b0d] px-1 py-0.5 border border-white/[0.08] ml-0.5">
                    {shortcut}
                  </kbd>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Voice Transcript Area - Inner Crisp Card */}
      <div className="bg-[#0a0b0d] border border-white/[0.08] focus-within:border-indigo-500/60 rounded-xl p-4 space-y-3 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isRecording || isSoundActive ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'
              }`}
            />
            <label
              htmlFor="voice-transcript"
              className="text-xs font-medium text-zinc-200"
            >
              Voice brain dump
            </label>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio-Reactive HUD Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsAudioReactive(prev => !prev)}
              title="ambient visualizer for your Wispr Flow voice stream."
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors border ${
                isAudioReactive
                  ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300'
                  : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200'
              }`}
            >
              <Activity className={`h-3 w-3 ${isAudioReactive ? 'text-indigo-300' : 'text-zinc-400'}`} />
              <span>Audio HUD</span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isAudioReactive ? 'bg-emerald-400' : 'bg-neutral-600'
                }`}
              />
            </button>

            {voiceTranscript && (
              <button
                type="button"
                onClick={() => setVoiceTranscript('')}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-rose-400 transition-colors"
                title="Clear transcript"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}
            <span className="text-xs font-mono text-zinc-400">
              {wordCount} words
            </span>
          </div>
        </div>

        {/* Live Audio Visualizer HUD (When Enabled) */}
        {isAudioReactive && (
          <AudioVisualizerHUD
            isActive={isAudioReactive}
            onVolumeChange={setAudioLevel}
          />
        )}

        {/* Quiet Indicator Banner */}
        <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Volume2 className="h-3.5 w-3.5 text-indigo-300 shrink-0" />
            <span className="text-xs">
              Press your <kbd className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-zinc-200 border border-white/[0.08]">Wispr Flow</kbd> hotkey and ramble here.
            </span>
          </div>
          <button
            type="button"
            onClick={handleSimulateWisprVoice}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors border ${
              isRecording
                ? 'border-rose-500/40 bg-rose-950/40 text-rose-300'
                : 'border-white/[0.08] bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08]'
            }`}
          >
            <Mic className="h-3 w-3 text-indigo-300" />
            <span>{isRecording ? 'Listening...' : 'Simulate Voice'}</span>
          </button>
        </div>

        {/* Matte Studio Box Textarea with Ambient Aura */}
        <div className="relative rounded-lg" style={ambientAuraStyle}>
          <textarea
            id="voice-transcript"
            rows={7}
            value={voiceTranscript}
            onChange={(e) => setVoiceTranscript(e.target.value)}
            placeholder="Talk about what you built, what was refactored, breaking changes, architecture decisions, and demo highlights..."
            className="w-full rounded-lg bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none font-sans leading-relaxed transition-all"
          />
        </div>
      </div>

      {/* Git Diff Context Drawer (Collapsible) */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0a0b0d] overflow-hidden">
        <button
          type="button"
          onClick={() => setIsDiffDrawerOpen(prev => !prev)}
          className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-white/[0.03]"
        >
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-medium text-zinc-200">
              Git diff context
            </span>
            {diffLines > 0 && (
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                {diffLines} lines
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="text-xs text-zinc-400 hidden sm:inline">
              {isDiffDrawerOpen ? 'Collapse' : 'Expand context'}
            </span>
            {isDiffDrawerOpen ? (
              <ChevronUp className="h-4 w-4 text-zinc-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            )}
          </div>
        </button>

        {isDiffDrawerOpen && (
          <div className="border-t border-white/[0.06] p-3 space-y-2 bg-[#0a0b0d]">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <FileCode className="h-3 w-3 text-zinc-400" />
                Paste git diff or repo structure:
              </span>
              {gitDiff && (
                <button
                  type="button"
                  onClick={() => setGitDiff('')}
                  className="text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  Clear diff
                </button>
              )}
            </div>

            <textarea
              rows={6}
              value={gitDiff}
              onChange={(e) => setGitDiff(e.target.value)}
              placeholder="diff --git a/server.ts b/server.ts&#10;index 4b825dc..a713ef8 100644&#10;--- a/server.ts&#10;+++ b/server.ts..."
              className="w-full rounded-lg border border-white/[0.06] bg-[#0a0b0d] p-3 font-mono text-[11px] text-emerald-200/90 placeholder:text-zinc-600 focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
            />
          </div>
        )}
      </div>

      {/* Primary CTA Button: Upgraded Authoritative High-Contrast Button */}
      <div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || (!voiceTranscript.trim() && !gitDiff.trim())}
          className="w-full py-3 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          <Sparkles className={`h-4 w-4 text-indigo-600 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>
            {isGenerating ? 'Synthesizing Deliverables...' : 'Generate Deliverables'}
          </span>
          <span className="font-mono text-xs opacity-70 ml-1 rounded bg-zinc-900/10 px-1.5 py-0.5 border border-zinc-900/10">
            ⌘↵
          </span>
        </button>
        <p className="mt-2 text-center text-[11px] text-zinc-500">
          Transforms messy raw voice rational into PR, Architecture, Script & Social update
        </p>
      </div>
    </div>
  );
}
