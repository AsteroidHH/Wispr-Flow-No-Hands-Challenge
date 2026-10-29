'use client';

import React from 'react';
import { Deliverables } from '@/lib/types';
import { PullRequestCard } from './cards/PullRequestCard';
import { ArchitectureCard } from './cards/ArchitectureCard';
import { VideoScriptCard } from './cards/VideoScriptCard';
import { SocialPostCard } from './cards/SocialPostCard';
import {
  Sparkles,
  Layers,
  GitPullRequest,
  Workflow,
  Video,
  Share2,
  ArrowRight,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

interface BentoGridProps {
  deliverables: Deliverables | null;
  isGenerating: boolean;
  onTweakCard: (cardKey: keyof Deliverables, instruction: string) => void;
  refiningCard?: keyof Deliverables | null;
  onExportBundle?: () => void;
  isExportingBundle?: boolean;
  onSelectPreset?: (presetId: string) => void;
  onGenerate?: () => void;
}

export function BentoGrid({
  deliverables,
  isGenerating,
  onTweakCard,
  refiningCard = null,
  onExportBundle,
  isExportingBundle = false,
  onSelectPreset,
  onGenerate,
}: BentoGridProps) {
  const { isLight } = useTheme();

  // Skeleton Loading State: 4 structured cards matching the real layout with staggered pulsing
  if (isGenerating) {
    return (
      <div className="flex flex-col gap-2.5 max-h-full animate-view-transition">
        {/* Synthesis Status Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className={`h-3.5 w-3.5 animate-spin ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
            <span className={`text-xs font-semibold tracking-tight ${isLight ? 'text-zinc-900' : 'text-[#e3e2e3]'}`}>
              Synthesizing 4 Shipping Artifacts...
            </span>
          </div>
          <span
            className={`font-mono text-[10.5px] px-2 py-0.5 rounded border animate-pulse ${
              isLight
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-[#1b1c1d] text-[#bdc2ff] border-[#292a2b]'
            }`}
          >
            Gemini 2.5 Flash • Multi-Agent Pipeline
          </span>
        </div>

        {/* 2x2 Bento Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 auto-rows-fr">
          {/* Skeleton 1: Pull Request Spec */}
          <div
            className={`flex flex-col h-[340px] xl:h-[360px] rounded-xl p-3.5 justify-between shadow-xs overflow-hidden border animate-pulse ${
              isLight ? 'bg-white border-[#E6E6E4]' : 'bg-[#1b1c1d] border-[#292a2b]'
            }`}
          >
            <div className={`flex items-center justify-between pb-2 border-b shrink-0 ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
              <div className="flex items-center gap-2">
                <div className={`h-6.5 w-6.5 rounded-lg ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
                <div className={`h-3.5 w-28 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
              </div>
              <div className={`h-4 w-16 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
            </div>
            <div className="flex-1 my-2 space-y-2">
              <div className={`h-8 w-full rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-[#141516]'}`} />
              <div className={`h-2.5 w-3/4 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
              <div className={`h-2.5 w-5/6 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
              <div className={`h-2.5 w-2/3 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
              <div className={`h-12 w-full rounded-lg ${isLight ? 'bg-amber-50/50' : 'bg-red-500/5'}`} />
            </div>
            <div className={`pt-2 border-t mt-auto flex flex-col gap-1.5 ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
              <div className="flex items-center justify-between">
                <div className={`h-6 w-24 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
                <div className={`h-6 w-32 rounded ${isLight ? 'bg-amber-200/60' : 'bg-[#5e6ad2]/30'}`} />
              </div>
              <div className={`h-7 w-full rounded ${isLight ? 'bg-zinc-100' : 'bg-[#141516]'}`} />
            </div>
          </div>

          {/* Skeleton 2: Architecture Topology */}
          <div
            style={{ animationDelay: '100ms' }}
            className={`flex flex-col h-[340px] xl:h-[360px] rounded-xl p-3.5 justify-between shadow-xs overflow-hidden border animate-pulse ${
              isLight ? 'bg-white border-[#E6E6E4]' : 'bg-[#1b1c1d] border-[#292a2b]'
            }`}
          >
            <div className={`flex items-center justify-between pb-2 border-b shrink-0 ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
              <div className="flex items-center gap-2">
                <div className={`h-6.5 w-6.5 rounded-lg ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
                <div className={`h-3.5 w-36 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
              </div>
              <div className={`h-4 w-14 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
            </div>
            <div className="flex-1 my-2 flex flex-col justify-center items-center gap-2.5">
              <div className={`h-6 w-28 rounded-md border ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#141516] border-[#292a2b]'}`} />
              <div className={`h-4 w-0.5 ${isLight ? 'bg-zinc-300' : 'bg-[#292a2b]'}`} />
              <div className="flex items-center gap-3">
                <div className={`h-6 w-20 rounded-md border ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#141516] border-[#292a2b]'}`} />
                <div className={`h-6 w-20 rounded-md border ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#141516] border-[#292a2b]'}`} />
              </div>
              <div className={`h-4 w-0.5 ${isLight ? 'bg-zinc-300' : 'bg-[#292a2b]'}`} />
              <div className={`h-6 w-32 rounded-md border ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#141516] border-[#292a2b]'}`} />
            </div>
            <div className={`pt-2 border-t mt-auto flex flex-col gap-1.5 ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
              <div className="flex items-center justify-between">
                <div className={`h-6 w-24 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
                <div className={`h-6 w-28 rounded ${isLight ? 'bg-amber-200/60' : 'bg-[#5e6ad2]/30'}`} />
              </div>
              <div className={`h-7 w-full rounded ${isLight ? 'bg-zinc-100' : 'bg-[#141516]'}`} />
            </div>
          </div>

          {/* Skeleton 3: Demo Video Script */}
          <div
            style={{ animationDelay: '200ms' }}
            className={`flex flex-col h-[340px] xl:h-[360px] rounded-xl p-3.5 justify-between shadow-xs overflow-hidden border animate-pulse ${
              isLight ? 'bg-white border-[#E6E6E4]' : 'bg-[#1b1c1d] border-[#292a2b]'
            }`}
          >
            <div className={`flex items-center justify-between pb-2 border-b shrink-0 ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
              <div className="flex items-center gap-2">
                <div className={`h-6.5 w-6.5 rounded-lg ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
                <div className={`h-3.5 w-32 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
              </div>
              <div className={`h-4 w-12 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
            </div>
            <div className="flex-1 my-2 space-y-2">
              <div className={`h-11 w-full rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-[#141516]'}`} />
              <div className={`h-11 w-full rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-[#141516]'}`} />
              <div className={`h-11 w-full rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-[#141516]'}`} />
            </div>
            <div className={`pt-2 border-t mt-auto flex flex-col gap-1.5 ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
              <div className="flex items-center justify-between">
                <div className={`h-6 w-20 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
                <div className={`h-6 w-36 rounded ${isLight ? 'bg-amber-200/60' : 'bg-[#5e6ad2]/30'}`} />
              </div>
              <div className={`h-7 w-full rounded ${isLight ? 'bg-zinc-100' : 'bg-[#141516]'}`} />
            </div>
          </div>

          {/* Skeleton 4: Social Post Draft */}
          <div
            style={{ animationDelay: '300ms' }}
            className={`flex flex-col h-[340px] xl:h-[360px] rounded-xl p-3.5 justify-between shadow-xs overflow-hidden border animate-pulse ${
              isLight ? 'bg-white border-[#E6E6E4]' : 'bg-[#1b1c1d] border-[#292a2b]'
            }`}
          >
            <div className={`flex items-center justify-between pb-2 border-b shrink-0 ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
              <div className="flex items-center gap-2">
                <div className={`h-6.5 w-6.5 rounded-lg ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
                <div className={`h-3.5 w-28 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
              </div>
              <div className={`h-4 w-16 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
            </div>
            <div className="flex-1 my-2 space-y-2">
              <div className={`h-6 w-full rounded ${isLight ? 'bg-zinc-100' : 'bg-[#141516]'}`} />
              <div className={`h-2.5 w-full rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
              <div className={`h-2.5 w-5/6 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
              <div className={`h-2.5 w-4/6 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
              <div className={`h-5 w-2/3 rounded-full ${isLight ? 'bg-amber-100/50' : 'bg-[#5e6ad2]/20'}`} />
            </div>
            <div className={`pt-2 border-t mt-auto flex flex-col gap-1.5 ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
              <div className="flex items-center justify-between">
                <div className={`h-6 w-24 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
                <div className={`h-6 w-32 rounded ${isLight ? 'bg-zinc-200' : 'bg-[#292a2b]'}`} />
              </div>
              <div className={`h-7 w-full rounded ${isLight ? 'bg-zinc-100' : 'bg-[#141516]'}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Null or Partially Populated State: Rich Interactive Launchpad
  const hasAllDeliverables = Boolean(
    deliverables &&
    deliverables.pullRequest &&
    deliverables.architecture &&
    deliverables.videoScript &&
    deliverables.socialPost
  );

  if (!hasAllDeliverables || !deliverables) {
    return (
      <div
        className={`flex flex-col gap-3 rounded-xl p-5 shadow-xs border transition-colors ${
          isLight ? 'bg-white border-[#E6E6E4]' : 'border-[#292a2b] bg-[#121315]'
        }`}
      >
        {/* Launchpad Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E6E4] dark:border-[#292a2b]">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                isLight ? 'bg-[#18181B] text-amber-500 border-[#18181B]' : 'bg-[#1f2021] text-[#5e6ad2] border-[#292a2b]'
              }`}
            >
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className={`text-xs font-semibold tracking-tight ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>
                Awaiting Shipping Context
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
                Select a preset scenario or provide voice thoughts to synthesize all 4 artifacts
              </p>
            </div>
          </div>

          <span
            className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
              isLight ? 'bg-[#F4F4F5] border-[#E6E6E4] text-zinc-600' : 'bg-[#1b1c1d] border-[#292a2b] text-[#bdc2ff]'
            }`}
          >
            4 Artifacts Ready
          </span>
        </div>

        {/* 4 Blueprint Preview Wireframes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Blueprint 1 */}
          <div
            className={`rounded-lg p-3 border flex flex-col gap-1.5 transition-all ${
              isLight ? 'bg-[#FAFAFA] border-[#E6E6E4] hover:border-zinc-300' : 'bg-[#17181a] border-[#292a2b] hover:border-[#38393b]'
            }`}
          >
            <div className="flex items-center gap-2">
              <GitPullRequest className={`h-3.5 w-3.5 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
              <span className={`text-xs font-semibold ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>
                1. Pull Request Spec
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
              Generates complete Markdown PR body, commit message, breaking changes audit, and direct GitHub compare link.
            </p>
          </div>

          {/* Blueprint 2 */}
          <div
            className={`rounded-lg p-3 border flex flex-col gap-1.5 transition-all ${
              isLight ? 'bg-[#FAFAFA] border-[#E6E6E4] hover:border-zinc-300' : 'bg-[#17181a] border-[#292a2b] hover:border-[#38393b]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Workflow className={`h-3.5 w-3.5 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
              <span className={`text-xs font-semibold ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>
                2. Architecture Topology
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
              Live Mermaid.js diagram with zoom/pan controls, dark/light themes, raw code editing, and PNG export.
            </p>
          </div>

          {/* Blueprint 3 */}
          <div
            className={`rounded-lg p-3 border flex flex-col gap-1.5 transition-all ${
              isLight ? 'bg-[#FAFAFA] border-[#E6E6E4] hover:border-zinc-300' : 'bg-[#17181a] border-[#292a2b] hover:border-[#38393b]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Video className={`h-3.5 w-3.5 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
              <span className={`text-xs font-semibold ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>
                3. Demo Video Script
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
              Timed demo breakdown with visual cues, spoken dialogue, 1.0x/1.2x pacing, and fullscreen studio teleprompter.
            </p>
          </div>

          {/* Blueprint 4 */}
          <div
            className={`rounded-lg p-3 border flex flex-col gap-1.5 transition-all ${
              isLight ? 'bg-[#FAFAFA] border-[#E6E6E4] hover:border-zinc-300' : 'bg-[#17181a] border-[#292a2b] hover:border-[#38393b]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Share2 className={`h-3.5 w-3.5 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
              <span className={`text-xs font-semibold ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>
                4. Multi-Channel Social Post
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
              Pre-formatted announcements for X/Twitter, LinkedIn, and Threads with char countdown and engagement preview.
            </p>
          </div>
        </div>

        {/* Quick Launch Preset Actions */}
        <div
          className={`p-3 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isLight ? 'bg-[#F4F4F5] border-[#E6E6E4]' : 'bg-[#1b1c1d] border-[#292a2b]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className={`h-4 w-4 ${isLight ? 'text-amber-600' : 'text-[#ffb867]'}`} />
            <span className={`font-medium ${isLight ? 'text-zinc-700' : 'text-[#e3e2e3]'}`}>
              Quick-load test scenario:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSelectPreset?.('auth-refactor')}
              className={`px-2.5 py-1 rounded border text-xs font-mono transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-zinc-50 text-zinc-700 border-[#E6E6E4]'
                  : 'bg-[#121315] hover:bg-[#1f2021] text-[#e3e2e3] border-[#292a2b]'
              }`}
            >
              ⌥1 Auth Refactor
            </button>
            <button
              type="button"
              onClick={() => onSelectPreset?.('ai-agent-pipeline')}
              className={`px-2.5 py-1 rounded border text-xs font-mono transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-zinc-50 text-zinc-700 border-[#E6E6E4]'
                  : 'bg-[#121315] hover:bg-[#1f2021] text-[#e3e2e3] border-[#292a2b]'
              }`}
            >
              ⌥2 AI Pipeline
            </button>
            <button
              type="button"
              onClick={() => onSelectPreset?.('hackathon-project')}
              className={`px-2.5 py-1 rounded border text-xs font-mono transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-zinc-50 text-zinc-700 border-[#E6E6E4]'
                  : 'bg-[#121315] hover:bg-[#1f2021] text-[#e3e2e3] border-[#292a2b]'
              }`}
            >
              ⌥3 ShipSpeak
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 max-h-full animate-view-transition">
      {/* Bento Grid Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isLight ? 'bg-amber-600' : 'bg-[#5e6ad2]'}`} />
          <span className={`text-xs font-semibold ${isLight ? 'text-zinc-900' : 'text-[#e3e2e3]'}`}>
            Generated Deliverables
          </span>
        </div>
        <span
          className={`font-mono text-[11px] px-2 py-0.5 rounded border ${
            isLight
              ? 'bg-[#F4F4F5] border-[#E6E6E4] text-zinc-600'
              : 'bg-[#1f2021] text-[#bdc2ff] border-[#292a2b]'
          }`}
        >
          4 Artifacts • Voice-Tweakable
        </span>
      </div>

      {/* 4-Card Responsive 2x2 Bento Grid with Strict Height Equalization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 auto-rows-fr">
        <PullRequestCard
          data={deliverables.pullRequest}
          onTweak={(inst) => onTweakCard('pullRequest', inst)}
          isRefining={refiningCard === 'pullRequest'}
          onExportBundle={onExportBundle}
          isExportingBundle={isExportingBundle}
        />
        <ArchitectureCard
          data={deliverables.architecture}
          onTweak={(inst) => onTweakCard('architecture', inst)}
          isRefining={refiningCard === 'architecture'}
        />
        <VideoScriptCard
          data={deliverables.videoScript}
          onTweak={(inst) => onTweakCard('videoScript', inst)}
          isRefining={refiningCard === 'videoScript'}
        />
        <SocialPostCard
          data={deliverables.socialPost}
          onTweak={(inst) => onTweakCard('socialPost', inst)}
          isRefining={refiningCard === 'socialPost'}
        />
      </div>
    </div>
  );
}
