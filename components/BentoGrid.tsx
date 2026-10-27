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
  if (isGenerating) {
    return (
      <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-xl border border-[#292a2b] bg-[#1b1c1d] p-8 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0d0e0f] border border-[#292a2b] text-[#5e6ad2]">
          <Sparkles className="h-5 w-5 animate-spin" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-[#e3e2e3] tracking-tight">Synthesizing deliverables</h3>
        <p className="mt-1 max-w-sm text-xs text-[#908f9e]">
          Converting unstructured voice brain dump and git context into 4 developer-grade assets...
        </p>
        <div className="mt-5 flex items-center gap-3 font-mono text-[11px] text-[#908f9e]">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5e6ad2]"></span>
            PR Spec
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#bdc2ff]"></span>
            Mermaid Diagram
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ffb867]"></span>
            Demo Script
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e2e2e2]"></span>
            Social Post
          </span>
        </div>
      </div>
    );
  }

  if (!deliverables) {
    return (
      <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-xl border border-[#292a2b] bg-[#1b1c1d] p-8 text-center shadow-sm">
        <p className="text-xs text-[#908f9e]">
          Select a judge preset or hit <span className="font-mono text-[#e3e2e3]">Generate Ship Artifacts</span> to view output.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bento Grid Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5e6ad2] animate-pulse"></span>
          <span className="text-xs font-medium text-[#e3e2e3]">
            Generated Deliverables
          </span>
        </div>
        <span className="font-mono text-[11px] bg-[#1f2021] text-[#bdc2ff] px-2 py-0.5 rounded border border-[#292a2b]">
          4 Artifacts • Voice-Tweakable
        </span>
      </div>

      {/* 4-Card Responsive 2x2 Bento Grid with Strict Height Equalization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-fr">
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
