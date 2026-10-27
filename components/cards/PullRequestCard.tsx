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
    const title = data.title || 'Feature Implementation';
    const commitMsg = data.commitMessage || 'feat: update implementation';
    const summary = data.summary || 'Summary of changes';
    const keyChangesList = (data.keyChanges || []).map((change) => `- ${change}`).join('\n');
    const breakingChangesList = (data.breakingChanges || []).map((b) => `- ${b}`).join('\n');

    return `## ${title}

### Commit Message
\`\`\`
${commitMsg}
\`\`\`

### Summary
${summary}

### Key Changes
${keyChangesList || '- General code refactor'}

### ⚠️ Breaking Changes
${breakingChangesList || '- None'}`;
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

    const titleParam = encodeURIComponent(data.title || 'ShipSpeak: Deliverables PR');
    const fullMarkdown = getFullMarkdown();

    // Guard URL length against browser and GitHub server query limits (~4500 chars)
    const MAX_PARAM_LENGTH = 4000;
    let safeMarkdown = fullMarkdown;
    let wasTruncated = false;

    if (encodeURIComponent(safeMarkdown).length > MAX_PARAM_LENGTH) {
      wasTruncated = true;
      safeMarkdown = fullMarkdown.slice(0, 1800) + '\n\n... *(Full PR spec copied to clipboard — paste directly into description)*';
      try {
        navigator.clipboard.writeText(fullMarkdown);
      } catch {
        // ignore
      }
    }

    const bodyParam = encodeURIComponent(safeMarkdown);
    const compare = encodeURIComponent(compareBranch.trim() || 'main...feature');

    const githubPrUrl = `https://github.com/${cleanRepo}/compare/${compare}?quick_pull=1&title=${titleParam}&body=${bodyParam}`;

    window.open(githubPrUrl, '_blank', 'noopener,noreferrer');
    setIsRepoModalOpen(false);
    showToast(wasTruncated ? 'PR URL launched! Full spec copied to clipboard' : `Opened PR compare on GitHub for ${cleanRepo}`);
  };

  return (
    <>
      <div
        className={`flex flex-col h-full justify-between bg-[#111215] border rounded-xl p-5 transition-all shadow-sm overflow-hidden ${
          isRefining
            ? 'border-indigo-500/70 ring-1 ring-indigo-500/40 shadow-indigo-500/10'
            : 'border-white/[0.08] hover:border-white/[0.14]'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-indigo-400 border border-white/[0.08]">
                {isRefining ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                ) : (
                  <GitPullRequest className="h-3.5 w-3.5 text-indigo-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
                    GitHub PR & commit
                  </h3>
                  {/* Target Branch Tag Pill */}
                  <span className="font-mono text-[11px] bg-white/[0.05] text-zinc-300 px-2 py-0.5 rounded border border-white/[0.08] hidden sm:inline-block">
                    Target: {compareBranch.replace('...', ' → ')}
                  </span>
                  {isRefining && (
                    <span className="text-[10px] font-mono text-indigo-300">
                      Refining...
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">Structured release specification</p>
              </div>
            </div>

            {/* Ghost Toolbar & Actions */}
            <div className="flex items-center gap-1.5">
              {/* View Tab Toggle */}
              <div className="flex rounded-md bg-[#0a0b0d] p-0.5 border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setViewTab('structured')}
                  className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                    viewTab === 'structured'
                      ? 'bg-[#1c1d22] text-white shadow-xs border border-white/[0.1]'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Layers className="h-3 w-3" />
                  <span>Spec</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab('markdown')}
                  className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                    viewTab === 'markdown'
                      ? 'bg-[#1c1d22] text-white shadow-xs border border-white/[0.1]'
                      : 'text-zinc-400 hover:text-zinc-200'
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
                title="Copy markdown spec"
                className="flex items-center p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors text-xs"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Export Bundle Button */}
              {onExportBundle && (
                <button
                  type="button"
                  onClick={onExportBundle}
                  disabled={isExportingBundle}
                  title="Export complete deliverables bundle (.zip)"
                  className="flex items-center p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors text-xs disabled:opacity-40"
                >
                  {isExportingBundle ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                  ) : (
                    <Archive className="h-3.5 w-3.5" />
                  )}
                </button>
              )}

              {/* Authoritative "Create PR on GitHub" Button in Indigo */}
              <button
                type="button"
                onClick={() => setIsRepoModalOpen(true)}
                title="Open directly on GitHub with prefilled PR description (Zero OAuth)"
                className="flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 text-xs font-medium transition-colors shadow-sm"
              >
                <GithubIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Create PR</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-80" />
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="mt-2.5 flex items-center gap-1.5 rounded-md bg-[#0a0b0d] px-2.5 py-1 text-[11px] font-mono text-indigo-300 border border-white/[0.08] animate-fadeIn">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Tab Content */}
          {viewTab === 'structured' ? (
            <div className="mt-3.5 flex-1 max-h-[340px] overflow-y-auto pr-1 space-y-3">
              <div className="rounded-lg bg-[#0a0b0d] p-3 border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-300">
                  <GitCommit className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>Commit message</span>
                </div>
                <p className="mt-1 font-mono text-xs text-zinc-200 select-all break-all">
                  {data.commitMessage}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-zinc-400">
                  PR title
                </span>
                <p className="text-sm font-medium text-zinc-100 mt-0.5">{data.title}</p>
              </div>

              <div>
                <span className="text-xs font-medium text-zinc-400">
                  Executive summary
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed mt-0.5">{data.summary}</p>
              </div>

              {/* Stitch Checkmark Change List */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
                  <Layers className="h-3 w-3" />
                  <span>Key changes ({(data.keyChanges || []).length})</span>
                </div>
                <ul className="space-y-1.5">
                  {(data.keyChanges || []).map((change, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-200">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                        <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                      </span>
                      <span className="leading-snug">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Breaking Changes */}
              {data.breakingChanges && data.breakingChanges.length > 0 && (
                <div className="rounded-lg border border-red-500/30 bg-[#0a0b0d] p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-red-400">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>Breaking changes detected</span>
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {data.breakingChanges.map((bChange, idx) => (
                      <li key={idx} className="text-xs text-red-200/90 flex items-start gap-1.5">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{bChange}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3.5 flex-1 flex flex-col min-h-0 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                <span className="flex items-center gap-1 text-zinc-200">
                  <CheckSquare className="h-3 w-3 text-indigo-400" />
                  Overview • Changes • Checklist
                </span>
                <span className="font-mono text-[10px] text-zinc-500">Markdown</span>
              </div>
              <pre className="flex-1 max-h-[340px] overflow-y-auto rounded-lg bg-[#0a0b0d] p-3.5 font-mono text-xs text-zinc-200 border border-white/[0.06] whitespace-pre-wrap leading-relaxed">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#111215] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-100 border border-white/[0.08]">
                  <GithubIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">Open PR on GitHub</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">Zero-OAuth instant pull request</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRepoModalOpen(false)}
                className="rounded-md p-1 text-zinc-400 hover:bg-white/[0.08] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleLaunchGitHubPR} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-200 mb-1">
                  Target repository (`owner/repo`)
                </label>
                <input
                  type="text"
                  required
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  placeholder="e.g. AsteroidHH/Wispr-Flow-No-Hands-Challenge"
                  className="w-full rounded-md border border-white/[0.08] bg-[#0a0b0d] px-3 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-200 mb-1">
                  Compare branch path
                </label>
                <input
                  type="text"
                  value={compareBranch}
                  onChange={(e) => setCompareBranch(e.target.value)}
                  placeholder="main...feature"
                  className="w-full rounded-md border border-white/[0.08] bg-[#0a0b0d] px-3 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
                />
              </div>

              <div className="rounded-lg bg-[#0a0b0d] p-2.5 border border-white/[0.06] text-xs text-zinc-400 leading-relaxed font-sans">
                <p>
                  🚀 <strong>Zero OAuth required:</strong> Pre-populates GitHub’s native PR review interface with your generated title, commit message, and Markdown spec.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsRepoModalOpen(false)}
                  className="rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-sm"
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
