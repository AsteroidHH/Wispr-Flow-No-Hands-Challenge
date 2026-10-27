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
    <div className="flex flex-col gap-5 rounded-xl border border-[#292a2b] bg-[#1b1c1d] p-5 shadow-sm overflow-hidden">
      {/* Header & Judge Presets Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-[#e3e2e3]">
              Input Workspace
            </h2>
            <p className="text-xs text-[#908f9e] mt-0.5">
              Dictate your rationale or select a scenario
            </p>
          </div>
          <span className="rounded bg-[#0d0e0f] px-2 py-0.5 text-[10px] font-mono text-[#908f9e] border border-[#292a2b]">
            Wispr Hotkey Ready
          </span>
        </div>

        {/* Sleek Segmented Tab Control for Judge Presets with ⌥1, ⌥2, ⌥3 hints */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#908f9e] font-medium">
            <span>Evaluation Presets</span>
            <span className="text-[10px] text-[#908f9e] font-mono">1-click load</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-[#0d0e0f] p-1 rounded-lg border border-[#292a2b] overflow-hidden">
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
                      ? 'bg-[#1f2021] text-white shadow-sm border border-[#343536]'
                      : 'text-[#908f9e] hover:text-[#e3e2e3] hover:bg-[#1b1c1d]/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className={`shrink-0 ${isSelected ? 'text-[#bdc2ff]' : 'text-[#908f9e]'}`}>
                      {getPresetIcon(preset.id)}
                    </span>
                    <span className="truncate text-left text-[11px] sm:text-xs">{preset.name}</span>
                  </div>
                  <kbd className="shrink-0 font-mono text-[9px] opacity-60 rounded bg-[#0d0e0f] px-1 py-0.5 border border-[#292a2b] ml-0.5">
                    {shortcut}
                  </kbd>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Voice Transcript Area - Inner #0d0e0f Card */}
      <div className="rounded-xl border border-[#292a2b] bg-[#0d0e0f] p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#292a2b] pb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isRecording || isSoundActive ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'
              }`}
            />
            <label
              htmlFor="voice-transcript"
              className="text-xs font-medium text-[#e3e2e3]"
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
                  ? 'border-[#5e6ad2]/50 bg-[#5e6ad2]/15 text-[#bdc2ff]'
                  : 'border-[#292a2b] bg-[#1b1c1d] text-[#908f9e] hover:bg-[#292a2b] hover:text-[#e3e2e3]'
              }`}
            >
              <Activity className={`h-3 w-3 ${isAudioReactive ? 'text-[#bdc2ff]' : 'text-[#908f9e]'}`} />
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
                className="flex items-center gap-1 text-xs text-[#908f9e] hover:text-rose-400 transition-colors"
                title="Clear transcript"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}
            <span className="text-xs font-mono text-[#908f9e]">
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
        <div className="flex items-center justify-between rounded-lg border border-[#292a2b] bg-[#121315] px-3 py-2 text-xs text-[#908f9e]">
          <div className="flex items-center gap-2">
            <Volume2 className="h-3.5 w-3.5 text-[#bdc2ff] shrink-0" />
            <span className="text-xs">
              Press your <kbd className="rounded bg-[#1b1c1d] px-1.5 py-0.5 font-mono text-[#e3e2e3] border border-[#292a2b]">Wispr Flow</kbd> hotkey and ramble here.
            </span>
          </div>
          <button
            type="button"
            onClick={handleSimulateWisprVoice}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors border ${
              isRecording
                ? 'border-rose-500/40 bg-rose-950/40 text-rose-300'
                : 'border-[#292a2b] bg-[#1b1c1d] text-[#e3e2e3] hover:bg-[#292a2b]'
            }`}
          >
            <Mic className="h-3 w-3 text-[#bdc2ff]" />
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
            className="w-full rounded-lg border border-[#292a2b] bg-[#0d0e0f] p-3.5 text-sm text-[#e3e2e3] placeholder:text-[#908f9e]/50 focus:border-[#5e6ad2] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] font-sans leading-relaxed transition-all"
          />
        </div>
      </div>

      {/* Git Diff Context Drawer (Collapsible) */}
      <div className="rounded-xl border border-[#292a2b] bg-[#0d0e0f] overflow-hidden">
        <button
          type="button"
          onClick={() => setIsDiffDrawerOpen(prev => !prev)}
          className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-[#1b1c1d]"
        >
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-medium text-[#e3e2e3]">
              Git diff context
            </span>
            {diffLines > 0 && (
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                {diffLines} lines
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[#908f9e]">
            <span className="text-xs text-[#908f9e] hidden sm:inline">
              {isDiffDrawerOpen ? 'Collapse' : 'Expand context'}
            </span>
            {isDiffDrawerOpen ? (
              <ChevronUp className="h-4 w-4 text-[#908f9e]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[#908f9e]" />
            )}
          </div>
        </button>

        {isDiffDrawerOpen && (
          <div className="border-t border-[#292a2b] p-3 space-y-2 bg-[#0d0e0f]">
            <div className="flex items-center justify-between text-xs text-[#908f9e]">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <FileCode className="h-3 w-3 text-[#908f9e]" />
                Paste git diff or repo structure:
              </span>
              {gitDiff && (
                <button
                  type="button"
                  onClick={() => setGitDiff('')}
                  className="text-[#908f9e] hover:text-rose-400 transition-colors"
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
              className="w-full rounded-lg border border-[#292a2b] bg-[#0d0e0f] p-3 font-mono text-[11px] text-emerald-200/90 placeholder:text-[#908f9e]/40 focus:border-[#5e6ad2] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
            />
          </div>
        )}
      </div>

      {/* Primary CTA Button: High-Contrast Stitch White Button */}
      <div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || (!voiceTranscript.trim() && !gitDiff.trim())}
          className="w-full bg-white text-[#0d0e0f] font-semibold hover:bg-neutral-200 py-2.5 rounded shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className={`h-4 w-4 text-[#5e6ad2] ${isGenerating ? 'animate-spin' : ''}`} />
          <span>
            {isGenerating ? 'Synthesizing Deliverables...' : 'Generate Deliverables'}
          </span>
          <span className="font-mono text-xs opacity-70 ml-1 rounded bg-[#0d0e0f]/10 px-1.5 py-0.5">
            ⌘↵
          </span>
        </button>
        <p className="mt-2 text-center text-[11px] text-[#908f9e]">
          Transforms messy raw voice rational into PR, Architecture, Script & Social update
        </p>
      </div>
    </div>
  );
}
