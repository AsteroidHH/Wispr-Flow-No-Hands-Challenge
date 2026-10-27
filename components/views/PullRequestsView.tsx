'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  GitPullRequest,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  GitBranch,
} from 'lucide-react';
import { Deliverables } from '@/lib/types';
import { useTheme } from '@/lib/ThemeContext';
import {
  sanitizeRepoSlug,
  buildGitHubCompareUrl,
  safeClipboardCopy,
} from '@/lib/githubUrl';

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
  const { isLight } = useTheme();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [repoPath, setRepoPath] = useState('AsteroidHH/Wispr-Flow-No-Hands-Challenge');

  const copiedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load active repo path from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('shipspeak_repo_path');
        if (saved && typeof saved === 'string') {
          const sanitized = sanitizeRepoSlug(saved);
          if (sanitized) setRepoPath(sanitized);
        }
      }
    } catch {
      // ignore storage access exception
    }

    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const handleCopy = async (id: string, text: string) => {
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    await safeClipboardCopy(text);
    setCopiedId(id);
    copiedTimeoutRef.current = setTimeout(() => setCopiedId(null), 2000);
  };

  const currentPr = deliverables?.pullRequest;
  const currentTitle =
    currentPr?.title || 'feat(engine): intelligent vector-based agent tool routing & backoff retries';
  const currentSummary =
    currentPr?.summary ||
    'Refactored autonomous agent routing with vector score matching and exponential backoff retry.';

  const cleanRepo = sanitizeRepoSlug(repoPath) || 'AsteroidHH/Wispr-Flow-No-Hands-Challenge';

  const pr143Url = buildGitHubCompareUrl({
    repo: cleanRepo,
    compare: 'main...feat/agent-router-v2',
    title: currentTitle,
    body: currentSummary,
  }).url;

  const pr142Url = buildGitHubCompareUrl({
    repo: cleanRepo,
    compare: 'main...security/token-blacklist',
    title: 'refactor(auth): RS256 token verification & Redis blacklist',
    body: 'Hardened Auth0 token refresh mechanism with asymmetric RS256 signature verification in middleware/auth.ts. Added Redis token revocation blacklist with 15min TTL.',
  }).url;

  const prList = [
    {
      id: 'pr-143',
      title: currentTitle,
      branch: 'feat/agent-router-v2',
      base: 'main',
      status: 'Ready to Merge',
      statusColor: isLight
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      tag: 'Edge Verified',
      summary: currentSummary,
      changes:
        Array.isArray(currentPr?.keyChanges) && currentPr.keyChanges.length > 0
          ? currentPr.keyChanges
          : [
              'Vector tool score matcher in tools/registry.ts',
              'Mitigates sub-agent token saturation concurrency lock',
              'Anthropic & Gemini API 429 exponential backoff strategy',
            ],
      deepLink: pr143Url,
    },
    {
      id: 'pr-142',
      title: 'refactor(auth): RS256 token verification & Redis blacklist',
      branch: 'security/token-blacklist',
      base: 'main',
      status: 'Staging Verified',
      statusColor: isLight
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : 'bg-indigo-500/10 text-[#bdc2ff] border-indigo-500/30',
      tag: 'CI Passed',
      summary:
        'Hardened Auth0 token refresh mechanism with asymmetric RS256 signature verification in middleware/auth.ts. Added Redis token revocation blacklist with 15min TTL.',
      changes: [
        'Added RS256 JWKS verification cache with 1hr rotation',
        'Redis session blacklist middleware check on every request',
        'Eliminated zombie session token vulnerability',
      ],
      deepLink: pr142Url,
    },
    {
      id: 'pr-141',
      title: 'perf(cache): Edge middleware cookie session optimization',
      branch: 'perf/edge-cache-ttl',
      base: 'main',
      status: 'Merged #141',
      statusColor: isLight
        ? 'bg-zinc-100 text-zinc-700 border-[#E6E6E4]'
        : 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      tag: '0ms Invalidation',
      summary:
        'Replaced stale local cookies with Redis TTLs of 300 seconds and edge middleware session caching.',
      changes: [
        'Cached auth validation results at edge location for 5 minutes',
        'Sub-millisecond header authorization checks for static routes',
      ],
      deepLink: `https://github.com/${cleanRepo}/pulls`,
    },
    {
      id: 'pr-140',
      title: 'feat(voice): Wispr Flow Web Audio HUD and frequency spectrum',
      branch: 'feat/audio-visualizer',
      base: 'main',
      status: 'Merged #140',
      statusColor: isLight
        ? 'bg-zinc-100 text-zinc-700 border-[#E6E6E4]'
        : 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      tag: '48kHz Stereo',
      summary:
        'Integrated Web Audio AnalyserNode with 256-band FFT HUD and dynamic ambient aura responding to voice volume.',
      changes: [
        'Clean lifecycle management disconnecting AudioContext on unmount',
        'Real-time sound level calculation with zero memory leak',
      ],
      deepLink: `https://github.com/${cleanRepo}/pulls`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
          isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              isLight
                ? 'border-[#E6E6E4] bg-white text-zinc-700 hover:bg-zinc-50 shadow-xs'
                : 'border-[#292a2b] bg-[#1b1c1d] text-[#e3e2e3] hover:bg-[#292a2b]'
            }`}
          >
            <ArrowLeft className={`h-3.5 w-3.5 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
            <span>Back to Cockpit Overview</span>
          </button>
          <div className={`h-4 w-[1px] ${isLight ? 'bg-[#E6E6E4]' : 'bg-[#292a2b]'}`} />
          <div>
            <h1
              className={`text-sm sm:text-base font-semibold tracking-tight flex items-center gap-2 ${
                isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'
              }`}
            >
              <GitPullRequest className={`h-4 w-4 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
              Pull Request Release Pipeline
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`font-mono text-xs ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
            4 Artifacts Active
          </span>
          {onExportBundle && (
            <button
              type="button"
              onClick={onExportBundle}
              className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer shadow-xs ${
                isLight
                  ? 'border-[#E6E6E4] bg-white text-zinc-700 hover:bg-zinc-50'
                  : 'bg-[#1f2021] border-[#292a2b] text-[#bdc2ff] hover:bg-[#292a2b]'
              }`}
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
            className={`rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between gap-4 ${
              isLight
                ? 'bg-white border-[#E6E6E4] hover:border-zinc-300'
                : 'bg-[#1b1c1d] border-[#292a2b] hover:border-[#343536]'
            }`}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                      isLight
                        ? 'bg-[#18181B] text-white border-[#18181B]'
                        : 'bg-[#0d0e0f] text-[#5e6ad2] border border-[#292a2b]'
                    }`}
                  >
                    <GitPullRequest className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold tracking-tight ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>
                      {pr.title}
                    </h3>
                    <div className={`flex items-center gap-2 mt-0.5 font-mono text-[11px] ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3 text-amber-600" />
                        <span>{pr.base}</span>
                        <span>←</span>
                        <span className={isLight ? 'text-zinc-800 font-medium' : 'text-[#bdc2ff]'}>{pr.branch}</span>
                      </span>
                      <span>•</span>
                      <span>{pr.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${pr.statusColor}`}>
                    {pr.status}
                  </span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                      isLight
                        ? 'bg-[#F4F4F5] text-zinc-600 border-[#E6E6E4]'
                        : 'bg-[#0d0e0f] text-[#bdc2ff] border-[#292a2b]'
                    }`}
                  >
                    {pr.tag}
                  </span>
                </div>
              </div>

              {/* Summary Description Box */}
              <div
                className={`rounded-lg p-3 border text-xs leading-relaxed ${
                  isLight
                    ? 'bg-[#FAFAFA] border-[#E6E6E4] text-zinc-700'
                    : 'bg-[#0d0e0f] border border-[#292a2b] text-[#c6c5d5]'
                }`}
              >
                {pr.summary}
              </div>

              {/* Key Changes Checklist */}
              <div>
                <span className={`text-[11px] font-mono uppercase tracking-wider block mb-1.5 ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
                  Key Artifact Enhancements
                </span>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {pr.changes.map((change, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center gap-2 text-xs rounded-md p-2 border ${
                        isLight
                          ? 'bg-white border-[#E6E6E4] text-zinc-700'
                          : 'bg-[#0d0e0f]/60 border border-[#292a2b] text-[#e3e2e3]'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{String(change)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions Footer */}
            <div className={`flex flex-wrap items-center justify-between gap-2 pt-3 border-t ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(pr.id, `${pr.title}\n\n${pr.summary}`)}
                  className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                    isLight
                      ? 'border-[#E6E6E4] bg-white text-zinc-700 hover:bg-zinc-50'
                      : 'border-[#292a2b] bg-[#1f2021] text-[#908f9e] hover:text-[#e3e2e3]'
                  }`}
                >
                  {copiedId === pr.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedId === pr.id ? 'Copied' : 'Copy Spec'}</span>
                </button>
              </div>

              <a
                href={pr.deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors shadow-xs ${
                  isLight
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-[#5e6ad2] hover:bg-[#4f5abf]'
                }`}
              >
                <span>Open on GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
