'use client';

import React from 'react';
import { Deliverables } from '@/lib/types';
import { PullRequestCard } from './cards/PullRequestCard';
import { ArchitectureCard } from './cards/ArchitectureCard';
import { VideoScriptCard } from './cards/VideoScriptCard';
import { SocialPostCard } from './cards/SocialPostCard';
import { Sparkles } from 'lucide-react';

interface BentoGridProps {
  deliverables: Deliverables | null;
  isGenerating: boolean;
  onTweakCard: (cardKey: keyof Deliverables, instruction: string) => void;
  refiningCard?: keyof Deliverables | null;
}

export function BentoGrid({
  deliverables,
  isGenerating,
  onTweakCard,
  refiningCard = null,
}: BentoGridProps) {
  if (isGenerating) {
    return (
      <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-8 text-center backdrop-blur-md">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
          <div className="absolute inset-0 rounded-2xl animate-ping bg-indigo-500/20" />
          <Sparkles className="h-8 w-8 text-indigo-400 animate-spin" />
        </div>
        <h3 className="mt-5 text-base font-semibold text-white">Synthesizing Deliverables</h3>
        <p className="mt-1.5 max-w-sm text-xs text-neutral-400">
          Converting unstructured voice brain dump and git context into 4 developer-grade assets...
        </p>
        <div className="mt-6 flex items-center gap-3 font-mono text-[11px] text-neutral-500">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            PR Spec
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            Mermaid Diagram
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-pulse"></span>
            Demo Script
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse"></span>
            Social Post
          </span>
        </div>
      </div>
    );
  }

  if (!deliverables) {
    return (
      <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-8 text-center">
        <p className="text-sm text-neutral-400">
          Select a judge preset or hit <span className="font-mono text-indigo-400">Generate Deliverables</span> to view output.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bento Grid Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-300">
            Real-Time Deliverables Bento
          </h2>
        </div>
        <span className="text-[11px] font-mono text-neutral-500">
          4 Artifacts Generated • Voice-Tweakable
        </span>
      </div>

      {/* 4-Card Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <PullRequestCard
          data={deliverables.pullRequest}
          onTweak={(inst) => onTweakCard('pullRequest', inst)}
          isRefining={refiningCard === 'pullRequest'}
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
