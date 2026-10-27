'use client';

import React from 'react';
import { Deliverables } from '@/lib/types';
import { PullRequestCard } from './cards/PullRequestCard';
import { ArchitectureCard } from './cards/ArchitectureCard';
import { VideoScriptCard } from './cards/VideoScriptCard';
import { SocialPostCard } from './cards/SocialPostCard';
import { Sparkles, Layers, Sliders } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

interface BentoGridProps {
  deliverables: Deliverables | null;
  isGenerating: boolean;
  onTweakCard: (cardKey: keyof Deliverables, instruction: string) => void;
  refiningCard?: keyof Deliverables | null;
  onExportBundle?: () => void;
  isExportingBundle?: boolean;
}

export function BentoGrid({
  deliverables,
  isGenerating,
  onTweakCard,
  refiningCard = null,
  onExportBundle,
  isExportingBundle = false,
}: BentoGridProps) {
  const { isLight } = useTheme();

  // Loading State
  if (isGenerating) {
    return (
      <div
        className={`flex h-full min-h-[500px] flex-col items-center justify-center rounded-xl p-8 text-center shadow-xs border transition-colors ${
          isLight
            ? 'bg-white border-[#E6E6E4]'
            : 'border-[#292a2b] bg-[#1b1c1d]'
        }`}
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border shadow-xs ${
            isLight
              ? 'bg-[#FAFAFA] border-[#E6E6E4] text-amber-600'
              : 'bg-[#0d0e0f] border border-[#292a2b] text-[#5e6ad2]'
          }`}
        >
          <Sparkles className="h-5 w-5 animate-spin" />
        </div>
        <h3 className={`mt-4 text-sm font-semibold tracking-tight ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>
          Synthesizing deliverables
        </h3>
        <p className={`mt-1 max-w-sm text-xs ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
          Converting unstructured voice brain dump and git context into 4 developer-grade assets...
        </p>
        <div className={`mt-5 flex items-center gap-3 font-mono text-[11px] ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${isLight ? 'bg-amber-600' : 'bg-[#5e6ad2]'}`} />
            PR Spec
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${isLight ? 'bg-amber-500' : 'bg-[#bdc2ff]'}`} />
            Mermaid Diagram
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${isLight ? 'bg-amber-700' : 'bg-[#ffb867]'}`} />
            Demo Script
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Social Post
          </span>
        </div>
      </div>
    );
  }

  // Null or Partially Populated State Guard
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
        className={`flex h-full min-h-[500px] flex-col items-center justify-center rounded-xl p-8 text-center shadow-xs border transition-colors ${
          isLight
            ? 'bg-white border-[#E6E6E4]'
            : 'border-[#292a2b] bg-[#1b1c1d]'
        }`}
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border shadow-xs ${
            isLight
              ? 'bg-[#FAFAFA] border-[#E6E6E4] text-zinc-500'
              : 'bg-[#0d0e0f] border border-[#292a2b] text-[#908f9e]'
          }`}
        >
          <Layers className="h-5 w-5" />
        </div>
        <h3 className={`mt-4 text-sm font-semibold tracking-tight ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>
          Awaiting Shipping Context
        </h3>
        <p className={`mt-1 max-w-sm text-xs ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
          Select a judge scenario preset or record voice input to synthesize PR, Mermaid diagram, demo script, and social launch draft.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
          <span
            className={`px-2 py-1 rounded border text-[11px] ${
              isLight
                ? 'bg-[#F4F4F5] border-[#E6E6E4] text-zinc-700'
                : 'bg-[#0d0e0f] border-[#292a2b] text-[#bdc2ff]'
            }`}
          >
            ⌥1-3 Load Presets
          </span>
          <span
            className={`px-2 py-1 rounded border text-[11px] ${
              isLight
                ? 'bg-[#F4F4F5] border-[#E6E6E4] text-zinc-700'
                : 'bg-[#0d0e0f] border-[#292a2b] text-[#bdc2ff]'
            }`}
          >
            ⌘↵ Generate
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bento Grid Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isLight ? 'bg-amber-600' : 'bg-[#5e6ad2]'}`} />
          <span className={`text-xs font-medium ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
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
