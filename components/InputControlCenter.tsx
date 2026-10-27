'use client';

import React, { useState, useEffect } from 'react';
import {
  Mic,
  Radio,
  Activity,
  Code2,
  RefreshCw,
  Sparkles,
  GitBranch,
  Trash2,
  ShieldCheck,
  Cpu,
  Trophy,
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

export function InputControlCenter({
  activePresetId,
  onSelectPreset,
  voiceTranscript,
  setVoiceTranscript,
  gitDiff,
  setGitDiff,
  onGenerate,
  isGenerating,
}: InputControlCenterProps) {
  const { isLight } = useTheme();
  const [activeDiffFile, setActiveDiffFile] = useState<'tools/registry.ts' | 'services/agent_runner.py' | 'raw'>('tools/registry.ts');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isAudioReactive, setIsAudioReactive] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Keyboard shortcut listener for ⌥1, ⌥2, ⌥3 / Alt+1, Alt+2, Alt+3
  useEffect(() => {
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
        return <ShieldCheck className="h-3.5 w-3.5" />;
      case 'ai-agent-pipeline':
        return <Cpu className="h-3.5 w-3.5" />;
      case 'hackathon-project':
        return <Trophy className="h-3.5 w-3.5" />;
      default:
        return <Sparkles className="h-3.5 w-3.5" />;
    }
  };

  const handleSimulateWisprVoice = () => {
    setIsRecording((prev) => !prev);
    if (!isRecording && !voiceTranscript) {
      setTimeout(() => {
        setVoiceTranscript(
          "Refactored our autonomous agent tool routing pipeline. Replaced brittle hardcoded switch statements with dynamic vector tool-match scoring in tools/registry.ts. Fixed the token exhaustion race condition when concurrent sub-agents spawn parallel research loops and added exponential jittered backoff on agent_runner.py. PR target is ready for main."
        );
        setIsRecording(false);
      }, 1500);
    }
  };

  const handleSyncPr142 = () => {
    if (JUDGE_PRESETS[1]) {
      onSelectPreset(JUDGE_PRESETS[1].id);
    }
  };

  const wordCount = voiceTranscript.trim() ? voiceTranscript.trim().split(/\s+/).length : 0;
  const isSoundActive = isAudioReactive && audioLevel > 0.04;

  const ambientAuraStyle = isSoundActive
    ? {
        boxShadow: isLight
          ? `0 0 ${12 + audioLevel * 20}px rgba(217, 119, 6, ${0.25 + audioLevel * 0.3})`
          : `0 0 ${12 + audioLevel * 24}px rgba(94, 106, 210, ${0.25 + audioLevel * 0.35})`,
        borderColor: isLight ? 'rgba(217, 119, 6, 0.4)' : 'rgba(94, 106, 210, 0.4)',
        transition: 'box-shadow 0.08s ease-out, border-color 0.15s ease-out',
      }
    : {
        transition: 'box-shadow 0.25s ease-out, border-color 0.25s ease-out',
      };

  // Static waveform baseline heights matching Stitch
  const waveformHeights = [8, 14, 20, 10, 16, 12, 6, 18, 20, 12, 8, 16, 20, 10, 4, 8, 4, 8, 4, 4, 4, 4, 4];

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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
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
              className={`text-[11px] font-mono ${
                isLight ? 'text-zinc-500' : 'text-[#908f9e]'
              }`}
            >
              Voice Engine Ready
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
              <Activity className={`h-3 w-3 ${isAudioReactive ? (isLight ? 'text-amber-700' : 'text-[#bdc2ff]') : 'text-zinc-400'}`} />
              <span className="text-[11px]">HUD</span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isAudioReactive ? 'bg-emerald-500' : 'bg-neutral-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. Segmented Presets Track matching Stitch */}
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
                <span className={`shrink-0 ${isSelected ? (isLight ? 'text-amber-600' : 'text-[#bdc2ff]') : 'text-zinc-400'}`}>
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

      {/* 3. Primary Voice Transcript Box matching Stitch */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span
            className={`font-mono text-[11px] font-medium flex items-center gap-1 ${
              isLight ? 'text-zinc-600' : 'text-[#908f9e]'
            }`}
          >
            <Mic className={`h-3.5 w-3.5 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
            Speech-to-Artifact Stream
          </span>
          <span className={`font-mono text-[10px] ${isLight ? 'text-zinc-400' : 'text-[#908f9e]'}`}>
            Raw Transcript ({wordCount} words, 01:24)
          </span>
        </div>

        {/* Live Audio Visualizer HUD (When Enabled) */}
        {isAudioReactive && (
          <AudioVisualizerHUD
            isActive={isAudioReactive}
            onVolumeChange={setAudioLevel}
          />
        )}

        {/* Textarea */}
        <div className="relative rounded-lg" style={ambientAuraStyle}>
          <textarea
            id="voice-transcript"
            rows={4}
            value={voiceTranscript}
            onChange={(e) => setVoiceTranscript(e.target.value)}
            placeholder="Speak or paste technical thoughts, commit notes, architectural adjustments..."
            className={`w-full rounded-lg p-3 text-xs leading-relaxed transition-all resize-none focus:outline-none font-sans ${
              isLight
                ? 'bg-[#FAFAFA] border border-[#E6E6E4] text-zinc-700 placeholder:text-zinc-400 focus:border-amber-600'
                : 'bg-[#0d0e0f] border border-[#292a2b] text-[#e3e2e3] placeholder:text-[#908f9e] focus:border-[#5e6ad2]'
            }`}
          />
        </div>

        {/* Audio Waveform Scrubber HUD matching Stitch */}
        <div
          className={`p-2.5 rounded-lg border flex flex-col gap-1.5 shadow-xs transition-colors ${
            isLight
              ? 'bg-white border-[#E6E6E4]'
              : 'bg-[#1b1c1d] border-[#292a2b]'
          }`}
        >
          <div
            className={`flex items-center justify-between font-mono text-[10px] ${
              isLight ? 'text-zinc-500' : 'text-[#908f9e]'
            }`}
          >
            <span className={isLight ? 'text-amber-700 font-semibold' : 'text-[#bdc2ff] font-semibold'}>
              00:48
            </span>
            <span
              className={`text-[9px] uppercase tracking-wider ${
                isLight ? 'text-zinc-400' : 'text-[#908f9e]'
              }`}
            >
              Vector Routing Pinpointed
            </span>
            <span>01:24</span>
          </div>

          {/* Waveform Bars */}
          <div
            className={`w-full h-7 flex items-center justify-between gap-[3px] px-1 rounded border overflow-hidden ${
              isLight
                ? 'bg-[#FAFAFA] border-[#E6E6E4]'
                : 'bg-[#0d0e0f] border-[#292a2b]'
            }`}
          >
            {waveformHeights.map((h, i) => {
              const dynamicHeight = isSoundActive ? Math.min(24, Math.round(h * (1 + audioLevel * 1.5))) : h;
              const isHighlight = i < 18;
              return (
                <div
                  key={i}
                  style={{ height: `${dynamicHeight}px` }}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    isHighlight
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
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
              isRecording
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : isLight
                ? 'bg-[#18181B] hover:bg-black text-white'
                : 'bg-[#1f2021] hover:bg-[#292a2b] text-[#e3e2e3] border border-[#292a2b]'
            }`}
          >
            <Mic className={`h-3.5 w-3.5 ${isRecording ? 'text-rose-400 animate-pulse' : (isLight ? 'text-amber-500' : 'text-[#ffb867]')}`} />
            <span>
              Tap or hold{' '}
              <kbd
                className={`font-mono text-[10px] px-1 py-0.5 rounded ml-0.5 ${
                  isLight
                    ? 'bg-zinc-800 text-zinc-300'
                    : 'bg-[#0d0e0f] text-[#bdc2ff] border border-[#292a2b]'
                }`}
              >
                Space
              </kbd>
            </span>
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
            title="Sync PR #142 preset"
          >
            <RefreshCw className={`h-3 w-3 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
            <span>Sync PR #142</span>
          </button>
        </div>
      </div>

      {/* 4. Always-Visible Git Diff Code Block matching Stitch */}
      <div
        className={`rounded-lg p-3 font-mono text-[11px] flex flex-col gap-2 shadow-xs border transition-colors ${
          isLight
            ? 'bg-[#F4F4F5] border-[#E6E6E4]'
            : 'bg-[#0d0e0f] border-[#292a2b]'
        }`}
      >
        <div
          className={`flex items-center justify-between pb-1 border-b ${
            isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <GitBranch className={`h-3.5 w-3.5 ${isLight ? 'text-zinc-600' : 'text-[#5e6ad2]'}`} />
            <span className={`font-semibold ${isLight ? 'text-zinc-800' : 'text-[#e3e2e3]'}`}>
              feat/agent-router-v2
            </span>
            <span className={isLight ? 'text-zinc-500 text-[10px]' : 'text-[#908f9e] text-[10px]'}>
              (+84 -29, 2 files)
            </span>
          </div>

          {/* File Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveDiffFile('tools/registry.ts')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                activeDiffFile === 'tools/registry.ts'
                  ? isLight
                    ? 'bg-white border border-[#E6E6E4] text-zinc-800'
                    : 'bg-[#1f2021] border border-[#292a2b] text-[#e3e2e3]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              tools/registry.ts
            </button>
            <button
              type="button"
              onClick={() => setActiveDiffFile('services/agent_runner.py')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                activeDiffFile === 'services/agent_runner.py'
                  ? isLight
                    ? 'bg-white border border-[#E6E6E4] text-zinc-800'
                    : 'bg-[#1f2021] border border-[#292a2b] text-[#e3e2e3]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              agent_runner.py
            </button>
          </div>
        </div>

        {/* Syntax Lines */}
        {activeDiffFile === 'tools/registry.ts' ? (
          <div className="flex flex-col gap-1 font-mono text-[10.5px] leading-tight">
            <div className={isLight ? 'text-zinc-400' : 'text-[#908f9e]'}>
              @@ -14,6 +14,8 @@ export class ToolRegistry &#123;
            </div>
            {/* Deletion in soft red */}
            <div
              className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                isLight
                  ? 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]'
                  : 'bg-red-500/10 text-red-400 border-red-500'
              }`}
            >
              -   if (tool.name === &apos;eval&apos;) &#123; runOldEval(task); &#125;
            </div>
            {/* Additions in soft green */}
            <div
              className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                isLight
                  ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
              }`}
            >
              +   const toolScore = await computeEmbeddingSimilarity(task, tool.schema);
            </div>
            <div
              className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                isLight
                  ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
              }`}
            >
              +   if (toolScore &gt; threshold) return this.dispatchVectorNode(tool);
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
              -   result = legacy_single_eval(context.prompt)
            </div>
            <div
              className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                isLight
                  ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
              }`}
            >
              +   result = await vector_route_dispatch(context.task_schema)
            </div>
            <div
              className={`px-1.5 py-0.5 rounded-r border-l-2 ${
                isLight
                  ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
              }`}
            >
              +   telemetry.record_latency(result.duration_ms)
            </div>
          </div>
        )}
      </div>

      {/* 5. Master Primary CTA matching Stitch */}
      <div className="flex flex-col gap-1.5 pt-1">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || (!voiceTranscript.trim() && !gitDiff.trim())}
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
