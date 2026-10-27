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
        boxShadow: `0 0 ${16 + audioLevel * 36}px rgba(99, 102, 241, ${0.35 + audioLevel * 0.5}), 0 0 ${28 + audioLevel * 50}px rgba(6, 182, 212, ${0.25 + audioLevel * 0.45})`,
        borderColor: '#06b6d4',
        transition: 'box-shadow 0.08s ease-out, border-color 0.15s ease-out',
      }
    : {
        transition: 'box-shadow 0.25s ease-out, border-color 0.25s ease-out',
      };

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 shadow-xl backdrop-blur-md">
      {/* Header & Judge Presets Bar */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-300">
              Input Control Center
            </h2>
          </div>
          <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-[10px] font-mono text-neutral-400 border border-neutral-700/60">
            Wispr Hotkey Ready
          </span>
        </div>

        {/* Quick Load 3 Judge Preset Buttons */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium text-neutral-400 flex items-center justify-between">
            <span>Judge Evaluation Presets:</span>
            <span className="text-[10px] text-neutral-500 font-mono">1-Click Load</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {JUDGE_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset.id)}
                  className={`flex flex-col items-start rounded-xl p-2.5 text-left transition-all border ${
                    isSelected
                      ? 'border-indigo-500/80 bg-indigo-950/40 text-white shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <span
                      className={`${
                        isSelected ? 'text-indigo-400' : 'text-neutral-400'
                      }`}
                    >
                      {getPresetIcon(preset.id)}
                    </span>
                    <span className="text-xs font-semibold truncate">{preset.name}</span>
                  </div>
                  <span className="mt-1 text-[10px] text-neutral-400 line-clamp-1">
                    {preset.tagline}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Voice Transcript Area */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isRecording || isSoundActive ? 'animate-ping bg-cyan-400' : 'bg-emerald-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  isRecording || isSoundActive ? 'bg-cyan-500' : 'bg-emerald-500'
                }`}
              ></span>
            </span>
            <label
              htmlFor="voice-transcript"
              className="text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5"
            >
              Voice Transcript Brain Dump
            </label>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio-Reactive HUD Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsAudioReactive(prev => !prev)}
              title="ambient visualizer for your Wispr Flow voice stream."
              className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-mono transition-all border ${
                isAudioReactive
                  ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <Activity className={`h-3 w-3 ${isAudioReactive ? 'animate-pulse text-cyan-400' : 'text-neutral-400'}`} />
              <span>Audio HUD</span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isAudioReactive ? 'bg-cyan-400 animate-ping' : 'bg-neutral-600'
                }`}
              />
            </button>

            {voiceTranscript && (
              <button
                type="button"
                onClick={() => setVoiceTranscript('')}
                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-rose-400 transition-colors"
                title="Clear transcript"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}
            <span className="text-[11px] font-mono text-neutral-400">
              {wordCount} words
            </span>
          </div>
        </div>

        {/* Live Audio Visualizer HUD (When Enabled) */}
        {isAudioReactive && (
          <AudioVisualizerHUD
            isActive={isAudioReactive}
            onVolumeChange={setAudioLevel}
            className="animate-fadeIn"
          />
        )}

        {/* Persistent Indicator Banner */}
        <div className="flex items-center justify-between rounded-lg border border-purple-500/20 bg-purple-950/20 px-3 py-2 text-xs text-purple-300">
          <div className="flex items-center gap-2">
            <Volume2 className="h-3.5 w-3.5 text-purple-400 shrink-0 animate-pulse" />
            <span className="font-mono text-[11px] tracking-tight">
              Press your <kbd className="rounded bg-purple-900/60 px-1.5 py-0.5 font-mono text-purple-200 border border-purple-500/30">Wispr Flow</kbd> hotkey and ramble here.
            </span>
          </div>
          <button
            type="button"
            onClick={handleSimulateWisprVoice}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
            }`}
          >
            <Mic className="h-3 w-3" />
            <span>{isRecording ? 'Listening...' : 'Simulate Voice'}</span>
          </button>
        </div>

        {/* Textarea with Ambient Aura */}
        <div className="relative rounded-xl overflow-hidden" style={ambientAuraStyle}>
          <textarea
            id="voice-transcript"
            rows={7}
            value={voiceTranscript}
            onChange={(e) => setVoiceTranscript(e.target.value)}
            placeholder="Talk about what you built, what was refactored, breaking changes, architecture decisions, and demo highlights..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 p-3.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:border-indigo-500 focus:bg-neutral-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed transition-all"
          />
        </div>
      </div>

      {/* Git Diff Context Drawer (Collapsible) */}
      <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/50 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsDiffDrawerOpen(prev => !prev)}
          className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-neutral-900/60"
        >
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-300">
              Git Diff / File Tree Drawer
            </span>
            {diffLines > 0 && (
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                {diffLines} lines
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
              {isDiffDrawerOpen ? 'Collapse' : 'Expand context'}
            </span>
            {isDiffDrawerOpen ? (
              <ChevronUp className="h-4 w-4 text-neutral-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            )}
          </div>
        </button>

        {isDiffDrawerOpen && (
          <div className="border-t border-neutral-800/80 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1 font-mono">
                <FileCode className="h-3 w-3 text-neutral-500" />
                Paste `git diff` or repo structure for maximum grounding:
              </span>
              {gitDiff && (
                <button
                  type="button"
                  onClick={() => setGitDiff('')}
                  className="text-neutral-500 hover:text-rose-400 transition-colors"
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
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 font-mono text-[11px] text-emerald-200/90 placeholder:text-neutral-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
            />
          </div>
        )}
      </div>

      {/* Prominent Generate Trigger Button */}
      <div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || (!voiceTranscript.trim() && !gitDiff.trim())}
          className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 p-3.5 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
          <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span className="tracking-wide text-sm font-sans">
            {isGenerating ? 'Synthesizing Deliverables...' : 'Generate Deliverables'}
          </span>
          <span className="hidden sm:inline font-mono text-[11px] text-white/70 ml-2 rounded bg-black/20 px-1.5 py-0.5">
            ⌘ Enter
          </span>
        </button>
        <p className="mt-2 text-center text-[10px] text-neutral-500 font-mono">
          Transforms messy raw voice rational into PR, Architecture, Script & Social update
        </p>
      </div>
    </div>
  );
}
