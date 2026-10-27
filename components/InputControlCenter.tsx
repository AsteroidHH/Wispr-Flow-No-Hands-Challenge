'use client';

import React, { useState, useEffect } from 'react';
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
  Activity,
  Code2,
  RefreshCw,
  Plus,
  Minus,
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
  isGenerating,
}: InputControlCenterProps) {
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
    setIsRecording((prev) => !prev);
    if (!isRecording && !voiceTranscript) {
      setTimeout(() => {
        setVoiceTranscript(
          "Refactored our autonomous agent tool routing pipeline. Replaced brittle hardcoded switch statements with dynamic vector tool-match scoring in tools/registry.ts. Fixed the token exhaustion race condition when concurrent sub-agents spawn parallel research loops. Added exponential backoff retry on Anthropic rate limits and streamed structured JSON delta outputs straight to client websockets."
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
        boxShadow: `0 0 ${12 + audioLevel * 24}px rgba(94, 106, 210, ${0.25 + audioLevel * 0.35})`,
        borderColor: 'rgba(94, 106, 210, 0.4)',
        transition: 'box-shadow 0.08s ease-out, border-color 0.15s ease-out',
      }
    : {
        transition: 'box-shadow 0.25s ease-out, border-color 0.25s ease-out',
      };

  // Static waveform baseline heights matching Stitch
  const waveformHeights = [8, 14, 20, 10, 16, 12, 6, 18, 20, 12, 8, 16, 20, 10, 4, 8, 4, 8, 4, 4, 4, 4, 4];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#292a2b] bg-[#1b1c1d] p-5 shadow-sm overflow-hidden">
      {/* Header & Judge Presets Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#5e6ad2]" />
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#e3e2e3]">
                Input Control Center
              </h2>
              <p className="text-xs text-[#908f9e] mt-0.5">
                Dictate your rationale or select a scenario
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1f2021] text-[#bdc2ff] font-mono text-[11px] border border-[#292a2b]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5e6ad2] animate-pulse"></span>
            <span>Voice Engine Ready</span>
          </div>
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
                  className={`w-full min-w-0 flex items-center justify-between gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1f2021] text-[#e3e2e3] font-medium shadow-inner border border-[#343536]'
                      : 'text-[#908f9e] hover:text-[#e3e2e3] hover:bg-[#1f2021]/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className={`shrink-0 ${isSelected ? 'text-[#bdc2ff]' : 'text-[#908f9e]'}`}>
                      {getPresetIcon(preset.id)}
                    </span>
                    <span className="truncate text-left text-[11px] sm:text-xs">{preset.name}</span>
                  </div>
                  <kbd className="shrink-0 font-mono text-[9px] opacity-70 rounded bg-[#0d0e0f] px-1 py-0.5 border border-[#292a2b] ml-0.5 text-[#908f9e]">
                    {shortcut}
                  </kbd>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Voice Transcript Area */}
      <div className="bg-[#0d0e0f] border border-[#292a2b] focus-within:border-[#5e6ad2] rounded-xl p-4 space-y-3 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#292a2b] pb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isRecording || isSoundActive ? 'bg-[#5e6ad2] animate-ping' : 'bg-[#5e6ad2]'
              }`}
            />
            <label
              htmlFor="voice-transcript"
              className="text-xs font-medium text-[#e3e2e3]"
            >
              Speech-to-Artifact Stream <span className="text-[#908f9e]">• Raw Transcript</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio-Reactive HUD Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsAudioReactive((prev) => !prev)}
              title="Ambient visualizer for your Wispr Flow voice stream"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors border cursor-pointer ${
                isAudioReactive
                  ? 'border-[#5e6ad2]/50 bg-[#5e6ad2]/15 text-[#bdc2ff]'
                  : 'border-[#292a2b] bg-[#1f2021] text-[#908f9e] hover:bg-[#292a2b] hover:text-[#e3e2e3]'
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
                className="flex items-center gap-1 text-xs text-[#908f9e] hover:text-rose-400 transition-colors cursor-pointer"
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

        {/* Studio Box Textarea with Ambient Aura */}
        <div className="relative rounded-lg" style={ambientAuraStyle}>
          <textarea
            id="voice-transcript"
            rows={5}
            value={voiceTranscript}
            onChange={(e) => setVoiceTranscript(e.target.value)}
            placeholder="Speak or paste technical thoughts, commit notes, architectural adjustments..."
            className="w-full rounded-lg bg-[#1b1c1d] border border-[#292a2b] focus:border-[#5e6ad2] p-3 text-xs sm:text-sm text-[#e3e2e3] placeholder:text-[#908f9e] focus:outline-none font-sans leading-relaxed transition-all resize-none"
          />
        </div>

        {/* STITCH RECORDING HUD: Waveform Scrubber Bar & Inline Micro-Controls */}
        <div className="pt-1 flex flex-col gap-2.5">
          {/* Waveform Scrubber Bar */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[#908f9e]">00:48</span>
            <div className="flex-1 h-6 bg-[#1b1c1d] rounded flex items-center px-2 gap-0.5 overflow-hidden border border-[#292a2b]">
              {waveformHeights.map((h, i) => {
                const dynamicHeight = isSoundActive ? Math.min(22, Math.round(h * (1 + audioLevel * 1.5))) : h;
                const isHighlight = i < 14;
                return (
                  <span
                    key={i}
                    style={{ height: `${dynamicHeight}px` }}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      isHighlight
                        ? i % 3 === 0
                          ? 'bg-[#5e6ad2]'
                          : 'bg-[#bdc2ff]'
                        : 'bg-[#292a2b]'
                    }`}
                  />
                );
              })}
            </div>
            <span className="font-mono text-[11px] text-[#908f9e]">01:24</span>
          </div>

          {/* Voice Trigger Row Micro-Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleSimulateWisprVoice}
              className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all text-xs font-sans cursor-pointer ${
                isRecording
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-[#1f2021] hover:bg-[#292a2b] text-[#e3e2e3] border border-[#292a2b]'
              }`}
            >
              <Mic className={`h-3.5 w-3.5 ${isRecording ? 'text-rose-400 animate-pulse' : 'text-[#ffb867]'}`} />
              <span className="font-medium text-[11px]">
                {isRecording ? 'Recording live... (Click to stop)' : 'Tap or hold Space to talk'}
              </span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setVoiceTranscript('')}
                className="px-2.5 py-1 rounded bg-[#1b1c1d] hover:bg-[#1f2021] text-[#908f9e] hover:text-[#e3e2e3] text-[11px] font-mono border border-[#292a2b] transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSyncPr142}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1b1c1d] hover:bg-[#1f2021] text-[#e3e2e3] text-[11px] font-mono border border-[#292a2b] transition-colors cursor-pointer"
                title="Sync demo scenario PR #142"
              >
                <RefreshCw className="h-3 w-3 text-[#5e6ad2]" />
                <span>Sync PR #142</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STITCH ALWAYS-VISIBLE GIT DIFF BOX */}
      <div className="rounded-xl border border-[#292a2b] bg-[#0d0e0f] p-3.5 space-y-2.5 overflow-hidden">
        {/* Header: Title + Branch Tag + Stats Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#292a2b] pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <GitBranch className="h-4 w-4 text-[#5e6ad2] shrink-0" />
            <span className="text-xs font-semibold text-[#e3e2e3]">
              Git Diff Context
            </span>
            <span className="font-mono text-[10px] bg-[#1f2021] text-[#bdc2ff] px-1.5 py-0.5 rounded border border-[#292a2b]">
              feat/agent-router-v2
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-[#5e6ad2] font-semibold">+84</span>
            <span className="text-rose-400 font-semibold">-29</span>
            <span className="text-[#908f9e]">2 files</span>
          </div>
        </div>

        {/* File Tabs Selector */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveDiffFile('tools/registry.ts')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                activeDiffFile === 'tools/registry.ts'
                  ? 'bg-[#1f2021] text-[#e3e2e3] border border-[#292a2b] font-medium'
                  : 'text-[#908f9e] hover:text-[#e3e2e3] bg-[#1b1c1d]'
              }`}
            >
              <Code2 className="h-3 w-3 text-[#ffb867]" />
              <span>tools/registry.ts</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDiffFile('services/agent_runner.py')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                activeDiffFile === 'services/agent_runner.py'
                  ? 'bg-[#1f2021] text-[#e3e2e3] border border-[#292a2b] font-medium'
                  : 'text-[#908f9e] hover:text-[#e3e2e3] bg-[#1b1c1d]'
              }`}
            >
              <Code2 className="h-3 w-3 text-[#908f9e]" />
              <span>services/agent_runner.py</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveDiffFile((prev) => (prev === 'raw' ? 'tools/registry.ts' : 'raw'))}
            className="text-[10px] font-mono text-[#908f9e] hover:text-[#bdc2ff] underline cursor-pointer"
          >
            {activeDiffFile === 'raw' ? 'View Rendered Diff' : 'Edit Raw Diff'}
          </button>
        </div>

        {/* Inset Code Diff Sandbox */}
        {activeDiffFile === 'raw' ? (
          <textarea
            rows={6}
            value={gitDiff}
            onChange={(e) => setGitDiff(e.target.value)}
            placeholder="diff --git a/server.ts b/server.ts&#10;index 4b825dc..a713ef8 100644&#10;--- a/server.ts&#10;+++ b/server.ts..."
            className="w-full rounded-lg border border-[#292a2b] bg-[#1b1c1d] p-3 font-mono text-[11px] text-[#bdc2ff] placeholder:text-[#908f9e] focus:border-[#5e6ad2] focus:outline-none"
          />
        ) : activeDiffFile === 'tools/registry.ts' ? (
          <div className="bg-[#090a0c] border border-[#292a2b] rounded-lg p-3 font-mono text-[11px] leading-relaxed overflow-x-auto flex flex-col gap-1 select-text">
            <div className="text-[#908f9e]">@@ -14,7 +14,14 @@ export class ToolRegistry &#123;</div>
            <div className="flex items-start text-[#908f9e]/70">
              <span className="w-5 select-none text-[#908f9e]">14</span>
              <span>  constructor(private readonly config: RuntimeConfig) &#123;&#125;</span>
            </div>
            {/* Red Deleted Lines */}
            <div className="flex items-start bg-red-500/10 text-red-400 border-l-2 border-red-500 px-2 py-0.5 rounded-xs">
              <span className="w-4 select-none opacity-70">-</span>
              <span>- if (tool.name === &apos;eval&apos;) &#123; runOldEval(task); &#125;</span>
            </div>
            <div className="flex items-start bg-red-500/10 text-red-400 border-l-2 border-red-500 px-2 py-0.5 rounded-xs">
              <span className="w-4 select-none opacity-70">-</span>
              <span>- return this.registry.get(task.toolType).invoke();</span>
            </div>
            {/* Green Added Lines */}
            <div className="flex items-start bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 px-2 py-0.5 rounded-xs">
              <span className="w-4 select-none text-emerald-400">+</span>
              <span>+ const toolScore = await computeEmbeddingSimilarity(task, tool.schema);</span>
            </div>
            <div className="flex items-start bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 px-2 py-0.5 rounded-xs">
              <span className="w-4 select-none text-emerald-400">+</span>
              <span>+ if (toolScore &gt; 0.84) return this.dispatchVectorTool(tool, task);</span>
            </div>
            <div className="flex items-start bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 px-2 py-0.5 rounded-xs">
              <span className="w-4 select-none text-emerald-400">+</span>
              <span>+ return this.fallbackBackoffRetry(task, &#123; maxAttempts: 5 &#125;);</span>
            </div>
            <div className="flex items-start text-[#908f9e]/70">
              <span className="w-5 select-none text-[#908f9e]">19</span>
              <span>  &#125;</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#090a0c] border border-[#292a2b] rounded-lg p-3 font-mono text-[11px] leading-relaxed overflow-x-auto flex flex-col gap-1 select-text">
            <div className="text-[#908f9e]">@@ -58,6 +58,12 @@ def execute_agent_loop(context: AgentContext):</div>
            <div className="flex items-start text-[#908f9e]/70">
              <span className="w-5 select-none text-[#908f9e]">58</span>
              <span>    context.state = ExecutionState.RUNNING</span>
            </div>
            {/* Red Deleted Line */}
            <div className="flex items-start bg-red-500/10 text-red-400 border-l-2 border-red-500 px-2 py-0.5 rounded-xs">
              <span className="w-4 select-none opacity-70">-</span>
              <span>-   result = legacy_single_eval(context.prompt)</span>
            </div>
            {/* Green Added Lines */}
            <div className="flex items-start bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 px-2 py-0.5 rounded-xs">
              <span className="w-4 select-none text-emerald-400">+</span>
              <span>+   result = await vector_route_dispatch(context.task_schema)</span>
            </div>
            <div className="flex items-start bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 px-2 py-0.5 rounded-xs">
              <span className="w-4 select-none text-emerald-400">+</span>
              <span>+   telemetry.record_latency(result.duration_ms)</span>
            </div>
            <div className="flex items-start text-[#908f9e]/70">
              <span className="w-5 select-none text-[#908f9e]">63</span>
              <span>    return result</span>
            </div>
          </div>
        )}
      </div>

      {/* STITCH MASTER SOLID HIGH-CONTRAST CTA BUTTON */}
      <div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || (!voiceTranscript.trim() && !gitDiff.trim())}
          className="w-full py-3 px-4 rounded-lg bg-white text-[#0d0e0f] font-bold text-sm hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className={`h-4 w-4 text-[#5e6ad2] ${isGenerating ? 'animate-spin' : ''}`} />
          <span>
            {isGenerating ? 'Synthesizing Pipeline...' : 'Generate Ship Artifacts'}
          </span>
          <span className="font-mono text-xs opacity-80 rounded bg-[#0d0e0f]/15 px-1.5 py-0.5 border border-[#0d0e0f]/15 text-[#0d0e0f]">
            ⌘↵
          </span>
        </button>
        <div className="mt-2 flex items-center justify-between px-1 text-[#908f9e] text-[11px] font-mono">
          <span>Last auto-sync: Realtime</span>
          <span>Estimated synthesis: ~1.2s</span>
        </div>
      </div>

      {/* Stitch Quick Tips Micro-Card */}
      <div className="p-2.5 rounded-lg bg-[#0d0e0f] border border-[#292a2b] flex items-center justify-between text-[#908f9e] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[#5e6ad2] font-semibold">⚡ Tip:</span>
          <span className="text-[#e3e2e3]">
            Press <strong className="text-white font-mono bg-[#1f2021] px-1 py-0.5 rounded border border-[#292a2b]">⌘↵</strong> to transform voice into PR, Diagram, Script & Posts instantly.
          </span>
        </div>
        <span className="text-[#908f9e] text-[10px] hidden sm:inline">v2.4.9</span>
      </div>
    </div>
  );
}
