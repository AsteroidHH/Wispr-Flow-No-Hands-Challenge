'use client';

import React, { useState, useEffect } from 'react';
import {
  GitPullRequest,
  GitCommit,
  Copy,
  Check,
  AlertTriangle,
  Layers,
  FileText,
  CheckSquare,
  Loader2,
  ExternalLink,
  Archive,
  Sparkles,
  X
} from 'lucide-react';
import { PullRequestDeliverable } from '@/lib/types';
import { VoiceTweakInput } from '@/components/VoiceTweakInput';

function GithubIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface PullRequestCardProps {
  data: PullRequestDeliverable;
  onTweak: (instruction: string) => void;
  isRefining?: boolean;
  onExportBundle?: () => void;
  isExportingBundle?: boolean;
}

export function PullRequestCard({
  data,
  onTweak,
  isRefining = false,
  onExportBundle,
  isExportingBundle = false,
}: PullRequestCardProps) {
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState<'structured' | 'markdown'>('structured');
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [repoPath, setRepoPath] = useState('AsteroidHH/Wispr-Flow-No-Hands-Challenge');
  const [compareBranch, setCompareBranch] = useState('main...feature');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved repo path from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shipspeak_repo_path');
      if (saved) setRepoPath(saved);
    } catch {
      // ignore
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getFullMarkdown = () => {
    if (data.prMarkdown) return data.prMarkdown;
    return `## ${data.title}

### Commit Message
\`\`\`
${data.commitMessage}
\`\`\`

### Summary
${data.summary}

### Key Changes
${data.keyChanges.map((change) => `- ${change}`).join('\n')}

### ⚠️ Breaking Changes
${data.breakingChanges.map((b) => `- ${b}`).join('\n')}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFullMarkdown());
      setCopied(true);
      showToast('PR spec copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Launch GitHub Compare PR with pre-filled title and body (zero OAuth!)
  const handleLaunchGitHubPR = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRepo = repoPath.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');

    if (!cleanRepo || !cleanRepo.includes('/')) {
      showToast('Please enter a valid owner/repo format');
      return;
    }

    try {
      localStorage.setItem('shipspeak_repo_path', cleanRepo);
    } catch {
      // ignore
    }

    const titleParam = encodeURIComponent(data.title);
    const bodyParam = encodeURIComponent(getFullMarkdown());
    const compare = compareBranch.trim() || 'main...feature';

    const githubPrUrl = `https://github.com/${cleanRepo}/compare/${compare}?quick_pull=1&title=${titleParam}&body=${bodyParam}`;

    window.open(githubPrUrl, '_blank', 'noopener,noreferrer');
    setIsRepoModalOpen(false);
    showToast(`Opened PR compare on GitHub for ${cleanRepo}`);
  };

  return (
    <>
      <div
        className={`flex flex-col justify-between rounded-xl border bg-neutral-900/60 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 ${
          isRefining
            ? 'border-indigo-500/80 shadow-[0_0_25px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/50'
            : 'border-neutral-800 hover:border-neutral-700/80'
        }`}
      >
        <div>
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {isRefining ? (
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                ) : (
                  <GitPullRequest className="h-4 w-4" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                  GitHub PR & Commit
                  {isRefining && (
                    <span className="text-[10px] font-mono text-indigo-400 animate-pulse">
                      Refining...
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-neutral-400">Structured release specification</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* View Tab Toggle */}
              <div className="flex rounded-lg bg-neutral-950 p-0.5 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setViewTab('structured')}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                    viewTab === 'structured'
                      ? 'bg-neutral-800 text-emerald-300 shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Layers className="h-3 w-3" />
                  <span>Spec</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab('markdown')}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                    viewTab === 'markdown'
                      ? 'bg-neutral-800 text-emerald-300 shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <FileText className="h-3 w-3" />
                  <span>Markdown</span>
                </button>
              </div>

              {/* Copy PR Button */}
              <button
                type="button"
                onClick={handleCopy}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-mono font-medium transition-all ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* Open on GitHub Button (Zero-OAuth PR launcher) */}
              <button
                type="button"
                onClick={() => setIsRepoModalOpen(true)}
                title="Open directly on GitHub with prefilled PR description (Zero OAuth)"
                className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs font-mono font-medium text-neutral-300 transition-all hover:border-emerald-500/50 hover:bg-neutral-700 hover:text-white"
              >
                <GithubIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Open on GitHub</span>
                <ExternalLink className="h-2.5 w-2.5 text-neutral-400" />
              </button>

              {/* Export Bundle Button */}
              {onExportBundle && (
                <button
                  type="button"
                  onClick={onExportBundle}
                  disabled={isExportingBundle}
                  title="Export complete deliverables bundle (.zip)"
                  className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs font-mono font-medium text-indigo-300 transition-all hover:bg-neutral-700 hover:text-white disabled:opacity-50"
                >
                  {isExportingBundle ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                  ) : (
                    <Archive className="h-3.5 w-3.5 text-indigo-400" />
                  )}
                  <span className="hidden md:inline">ZIP</span>
                </button>
              )}
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-emerald-950/40 px-2.5 py-1 text-[11px] font-mono text-emerald-300 border border-emerald-500/30 animate-fadeIn">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Tab Content */}
          {viewTab === 'structured' ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-neutral-950/80 p-3 border border-neutral-800/70">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-emerald-400">
                  <GitCommit className="h-3.5 w-3.5 shrink-0" />
                  <span>COMMIT MESSAGE</span>
                </div>
                <p className="mt-1 font-mono text-xs text-neutral-200 select-all break-all">
                  {data.commitMessage}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  PR Title
                </span>
                <p className="text-sm font-medium text-white">{data.title}</p>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Executive Summary
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed mt-0.5">{data.summary}</p>
              </div>

              {/* Key Changes */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                  <Layers className="h-3 w-3" />
                  <span>Key Changes ({data.keyChanges.length})</span>
                </div>
                <ul className="space-y-1.5">
                  {data.keyChanges.map((change, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                      <span className="leading-snug">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Breaking Changes */}
              {data.breakingChanges && data.breakingChanges.length > 0 && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>BREAKING CHANGES DETECTED</span>
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {data.breakingChanges.map((bChange, idx) => (
                      <li key={idx} className="text-xs text-amber-200/90 flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{bChange}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckSquare className="h-3 w-3" />
                  OVERVIEW • CHANGES • CHECKLIST
                </span>
                <span>Markdown</span>
              </div>
              <pre className="max-h-[380px] overflow-y-auto rounded-lg bg-neutral-950 p-3.5 font-mono text-xs text-neutral-200 border border-neutral-800/80 whitespace-pre-wrap leading-relaxed">
                {getFullMarkdown()}
              </pre>
            </div>
          )}
        </div>

        <VoiceTweakInput
          cardName="Pull Request"
          onTweak={onTweak}
          isRefining={isRefining}
          placeholder="Hold Wispr to refine this card."
        />
      </div>

      {/* Zero-OAuth "Open on GitHub" Modal Popover */}
      {isRepoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0d121f] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <GithubIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Open PR on GitHub</h3>
                  <p className="text-[11px] text-neutral-400 font-mono">Zero-OAuth instant pull request</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRepoModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleLaunchGitHubPR} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1">
                  Target Repository (`owner/repo`)
                </label>
                <input
                  type="text"
                  required
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  placeholder="e.g. AsteroidHH/Wispr-Flow-No-Hands-Challenge"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-mono text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1">
                  Compare Branch Path
                </label>
                <input
                  type="text"
                  value={compareBranch}
                  onChange={(e) => setCompareBranch(e.target.value)}
                  placeholder="main...feature"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-mono text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div className="rounded-lg bg-emerald-950/20 p-2.5 border border-emerald-500/20 text-[11px] text-emerald-300/90 leading-relaxed font-sans">
                <p>
                  🚀 <strong>Zero OAuth Required:</strong> This automatically pre-populates GitHub’s native PR review interface with your generated title, commit message, and full Markdown spec.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => setIsRepoModalOpen(false)}
                  className="rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition-colors"
                >
                  <span>Launch GitHub PR</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
