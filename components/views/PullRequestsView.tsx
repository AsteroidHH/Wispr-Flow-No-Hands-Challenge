'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  GitPullRequest,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  GitBranch,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Deliverables } from '@/lib/types';

interface PullRequestsViewProps {
  deliverables: Deliverables | null;
  onBack: () => void;
  onExportBundle?: () => void;
}

export function PullRequestsView({
  deliverables,
  onBack,
  onExportBundle,
}: PullRequestsViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentPr = deliverables?.pullRequest;
  const currentTitle = currentPr?.title || 'feat(engine): intelligent vector-based agent tool routing & backoff retries';
  const currentSummary = currentPr?.summary || 'Refactored autonomous agent routing with vector score matching and exponential backoff retry.';

  const prList = [
    {
      id: 'pr-143',
      title: currentTitle,
      branch: 'feat/agent-router-v2',
      base: 'main',
      status: 'Ready to Merge',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      tag: 'Edge Verified',
      summary: currentSummary,
      changes: currentPr?.keyChanges?.length ? currentPr.keyChanges : [
        'Vector tool score matcher in tools/registry.ts',
        'Mitigates sub-agent token saturation concurrency lock',
        'Anthropic & Gemini API 429 exponential backoff strategy',
      ],
      deepLink: `https://github.com/AsteroidHH/Wispr-Flow-No-Hands-Challenge/compare/main...feat/agent-router-v2?expand=1&title=${encodeURIComponent(
        currentTitle
      )}&body=${encodeURIComponent(currentSummary)}`,
    },
    {
      id: 'pr-142',
      title: 'refactor(auth): RS256 token verification & Redis blacklist',
      branch: 'security/token-blacklist',
      base: 'main',
      status: 'Staging Verified',
      statusColor: 'bg-indigo-500/10 text-[#bdc2ff] border-indigo-500/30',
      tag: 'CI Passed',
      summary: 'Hardened Auth0 token refresh mechanism with asymmetric RS256 signature verification in middleware/auth.ts. Added Redis token revocation blacklist with 15min TTL.',
      changes: [
        'Added RS256 JWKS verification cache with 1hr rotation',
        'Redis session blacklist middleware check on every request',
        'Eliminated zombie session token vulnerability',
      ],
      deepLink: 'https://github.com/AsteroidHH/Wispr-Flow-No-Hands-Challenge/compare',
    },
    {
      id: 'pr-141',
      title: 'perf(cache): Edge middleware cookie session optimization',
      branch: 'perf/edge-cache-ttl',
      base: 'main',
      status: 'Merged #141',
      statusColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      tag: '0ms Invalidation',
      summary: 'Replaced stale local cookies with Redis TTLs of 300 seconds and edge middleware session caching.',
      changes: [
        'Cached auth validation results at edge location for 5 minutes',
        'Sub-millisecond header authorization checks for static routes',
      ],
      deepLink: 'https://github.com/AsteroidHH/Wispr-Flow-No-Hands-Challenge/pulls',
    },
    {
      id: 'pr-140',
      title: 'feat(voice): Wispr Flow Web Audio HUD and frequency spectrum',
      branch: 'feat/audio-visualizer',
      base: 'main',
      status: 'Merged #140',
      statusColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      tag: '48kHz Stereo',
      summary: 'Integrated Web Audio AnalyserNode with 256-band FFT HUD and dynamic ambient aura responding to voice volume.',
      changes: [
        'Clean lifecycle management disconnecting AudioContext on unmount',
        'Real-time sound level calculation with zero memory leak',
      ],
      deepLink: 'https://github.com/AsteroidHH/Wispr-Flow-No-Hands-Challenge/pulls',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#292a2b] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg border border-[#292a2b] bg-[#1b1c1d] px-3 py-1.5 text-xs font-medium text-[#e3e2e3] hover:bg-[#292a2b] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#5e6ad2]" />
            <span>Back to Cockpit Overview</span>
          </button>
          <div className="h-4 w-[1px] bg-[#292a2b]" />
          <div>
            <h1 className="text-sm sm:text-base font-semibold tracking-tight text-[#e3e2e3] flex items-center gap-2">
              <GitPullRequest className="h-4 w-4 text-[#5e6ad2]" />
              Pull Request Release Pipeline
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[#908f9e]">4 Artifacts Active</span>
          {onExportBundle && (
            <button
              type="button"
              onClick={onExportBundle}
              className="flex items-center gap-1.5 rounded bg-[#1f2021] border border-[#292a2b] px-2.5 py-1 text-xs text-[#bdc2ff] hover:bg-[#292a2b] font-mono transition-colors"
            >
              Export ZIP
            </button>
          )}
        </div>
      </div>

      {/* PR Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {prList.map((pr) => (
          <div
            key={pr.id}
            className="rounded-xl border border-[#292a2b] bg-[#1b1c1d] p-5 shadow-sm hover:border-[#343536] transition-all flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0d0e0f] text-[#5e6ad2] border border-[#292a2b]">
                    <GitPullRequest className="h-4 w-4 text-[#5e6ad2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#e3e2e3] tracking-tight">
                      {pr.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-[#908f9e]">
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3 text-[#bdc2ff]" />
                        <span className="text-[#e3e2e3]">{pr.branch}</span>
                      </span>
                      <span>→</span>
                      <span>{pr.base}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${pr.statusColor}`}>
                    {pr.status}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#0d0e0f] text-[#bdc2ff] border border-[#292a2b]">
                    {pr.tag}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#908f9e] leading-relaxed">
                {pr.summary}
              </p>

              {/* Key Changes Checklist */}
              <div className="rounded-lg bg-[#0d0e0f] border border-[#292a2b] p-3 space-y-1.5 font-mono text-xs text-[#e3e2e3]">
                {pr.changes.map((change, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#5e6ad2] shrink-0 mt-0.5" />
                    <span className="text-[11px] text-[#e3e2e3]">{change}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-[#292a2b]">
              <button
                type="button"
                onClick={() => handleCopy(pr.id, `${pr.title}\n\n${pr.summary}`)}
                className="flex items-center gap-1 text-xs text-[#908f9e] hover:text-[#e3e2e3] transition-colors"
              >
                {copiedId === pr.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Markdown Spec</span>
                  </>
                )}
              </button>

              <a
                href={pr.deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md bg-[#5e6ad2] hover:bg-[#4f5ac4] px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-sm"
              >
                <span>Open PR on GitHub</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
