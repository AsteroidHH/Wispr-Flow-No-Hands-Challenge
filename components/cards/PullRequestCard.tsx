'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  X,
} from 'lucide-react';
import { PullRequestDeliverable } from '@/lib/types';
import { VoiceTweakInput } from '@/components/VoiceTweakInput';
import { useTheme } from '@/lib/ThemeContext';
import {
  formatPrMarkdown,
  sanitizeRepoSlug,
  buildGitHubCompareUrl,
  safeClipboardCopy,
} from '@/lib/githubUrl';

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
  const { isLight } = useTheme();
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState<'structured' | 'markdown'>('structured');
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [repoPath, setRepoPath] = useState('AsteroidHH/Wispr-Flow-No-Hands-Challenge');
  const [compareBranch, setCompareBranch] = useState('main...feature');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const copiedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved repo path safely from localStorage if present
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
      // ignore security or private browsing storage exceptions
    }

    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  // Keyboard shortcut listener for modal (Escape to close)
  useEffect(() => {
    if (!isRepoModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsRepoModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRepoModalOpen]);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

  const getFullMarkdown = () => {
    return formatPrMarkdown(data);
  };

  const handleCopy = async () => {
    try {
      const fullText = getFullMarkdown();
      await safeClipboardCopy(fullText);
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      setCopied(true);
      showToast('PR spec copied to clipboard');
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Launch GitHub Compare PR with pre-filled title and body (zero OAuth!)
  const handleLaunchGitHubPR = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRepo = sanitizeRepoSlug(repoPath);

    if (!cleanRepo) {
      showToast('Please enter a valid owner/repo format (e.g. owner/repo)');
      return;
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('shipspeak_repo_path', cleanRepo);
      }
    } catch {
      // ignore storage write errors
    }

    const fullMarkdown = getFullMarkdown();
    const { url: githubPrUrl, wasTruncated } = buildGitHubCompareUrl({
      repo: cleanRepo,
      compare: compareBranch,
      title: data?.title,
      body: fullMarkdown,
    });

    if (wasTruncated) {
      // Automatically copy complete PR spec to clipboard when URL is truncated
      safeClipboardCopy(fullMarkdown);
    }

    if (typeof window !== 'undefined') {
      window.open(githubPrUrl, '_blank', 'noopener,noreferrer');
    }

    setIsRepoModalOpen(false);
    showToast(
      wasTruncated
        ? 'PR URL launched! Full spec copied to clipboard'
        : `Opened PR compare on GitHub for ${cleanRepo}`
    );
  };

  const safeCommitMessage = data?.commitMessage || 'feat: update implementation';
  const safeTitle = data?.title || 'Feature Implementation';
  const safeSummary = data?.summary || 'Summary of changes';
  const keyChanges = Array.isArray(data?.keyChanges) ? data.keyChanges : [];
  const breakingChanges = Array.isArray(data?.breakingChanges) ? data.breakingChanges : [];

  return (
    <>
      <div
        className={`flex flex-col h-[340px] xl:h-[360px] rounded-xl p-3.5 justify-between shadow-xs overflow-hidden border transition-all ${
          isLight
            ? isRefining
              ? 'bg-white border-amber-500/70 ring-1 ring-amber-500/40'
              : 'bg-white border-[#E6E6E4] hover:border-zinc-300'
            : isRefining
            ? 'bg-[#1b1c1d] border-[#5e6ad2]/70 ring-1 ring-[#5e6ad2]/40 shadow-[#5e6ad2]/10'
            : 'bg-[#1b1c1d] border-[#292a2b] hover:border-[#343536]'
        }`}
      >
        {/* Card Header matching Stitch */}
        <div
          className={`flex items-center justify-between gap-2 pb-2 border-b shrink-0 ${
            isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`flex h-6.5 w-6.5 items-center justify-center rounded-lg border shrink-0 ${
                isLight
                  ? 'bg-[#18181B] text-amber-500 border-[#18181B]'
                  : 'bg-[#1f2021] text-[#5e6ad2] border border-[#292a2b]'
              }`}
            >
              {isRefining ? (
                <Loader2 className={`h-3 w-3 animate-spin ${isLight ? 'text-amber-500' : 'text-[#5e6ad2]'}`} />
              ) : (
                <GitPullRequest className="h-3 w-3" />
              )}
            </div>
            <div className="min-w-0 truncate">
              <div className="flex items-center gap-1.5 truncate">
                <h3
                  className={`text-xs font-semibold tracking-tight truncate ${
                    isLight ? 'text-zinc-900' : 'text-[#e3e2e3]'
                  }`}
                >
                  GitHub Pull Request
                </h3>
                <span
                  className={`font-mono text-[9px] px-1.5 py-0.2 rounded border shrink-0 hidden sm:inline-block ${
                    isLight
                      ? 'bg-[#F4F4F5] text-zinc-600 border-[#E6E6E4]'
                      : 'bg-[#0d0e0f] text-[#bdc2ff] border-[#292a2b]'
                  }`}
                >
                  {(compareBranch || 'main...feature').replace('...', ' → ')}
                </span>
                {isRefining && (
                  <span className={`text-[9px] font-mono shrink-0 ${isLight ? 'text-amber-600' : 'text-[#bdc2ff]'}`}>
                    Refining...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ghost Toolbar & Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* View Tab Toggle */}
            <div
              role="tablist"
              aria-label="PR view options"
              className={`flex rounded p-0.5 border ${
                isLight
                  ? 'bg-[#F4F4F5] border-[#E6E6E4]'
                  : 'bg-[#0d0e0f] border border-[#292a2b]'
              }`}
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewTab === 'structured'}
                onClick={() => setViewTab('structured')}
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                  viewTab === 'structured'
                    ? isLight
                      ? 'bg-white text-[#18181B] shadow-xs border border-[#E6E6E4]'
                      : 'bg-[#1f2021] text-white shadow-xs border border-[#343536]'
                    : isLight
                    ? 'text-zinc-600 hover:text-[#18181B]'
                    : 'text-[#908f9e] hover:text-[#e3e2e3]'
                }`}
              >
                <Layers className="h-2.5 w-2.5" />
                <span>Spec</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewTab === 'markdown'}
                onClick={() => setViewTab('markdown')}
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                  viewTab === 'markdown'
                    ? isLight
                      ? 'bg-white text-[#18181B] shadow-xs border border-[#E6E6E4]'
                      : 'bg-[#1f2021] text-white shadow-xs border border-[#343536]'
                    : isLight
                    ? 'text-zinc-600 hover:text-[#18181B]'
                    : 'text-[#908f9e] hover:text-[#e3e2e3]'
                }`}
              >
                <FileText className="h-2.5 w-2.5" />
                <span>MD</span>
              </button>
            </div>

            {/* Copy PR Button */}
            <button
              type="button"
              onClick={handleCopy}
              title="Copy markdown spec"
              className={`flex items-center p-1 rounded border transition-colors text-xs cursor-pointer ${
                isLight
                  ? 'border-[#E6E6E4] bg-white hover:bg-zinc-50 text-zinc-600'
                  : 'border-[#292a2b] bg-[#1f2021] hover:bg-[#292a2b] text-[#908f9e]'
              }`}
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>

            {/* Export Bundle Button */}
            {onExportBundle && (
              <button
                type="button"
                onClick={onExportBundle}
                disabled={isExportingBundle}
                title="Export complete deliverables bundle (.zip)"
                className={`flex items-center p-1 rounded border transition-colors text-xs disabled:opacity-40 cursor-pointer ${
                  isLight
                    ? 'border-[#E6E6E4] bg-white hover:bg-zinc-50 text-zinc-600'
                    : 'border-[#292a2b] bg-[#1f2021] hover:bg-[#292a2b] text-[#908f9e]'
                }`}
              >
                {isExportingBundle ? (
                  <Loader2 className={`h-3 w-3 animate-spin ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
                ) : (
                  <Archive className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`mt-1.5 flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-mono border animate-fadeIn shrink-0 ${
              isLight
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-[#0d0e0f] text-[#bdc2ff] border-[#292a2b]'
            }`}
          >
            <Sparkles className={`h-2.5 w-2.5 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Card Content Viewport (scrollable middle section) */}
        <div className="flex-1 overflow-y-auto pr-1.5 my-2 text-xs space-y-2 [scrollbar-width:thin]">
          {viewTab === 'structured' ? (
            <>
              <div
                className={`rounded-lg p-2.5 border ${
                  isLight
                    ? 'bg-[#FAFAFA] border-[#E6E6E4]'
                    : 'bg-[#0d0e0f] border border-[#292a2b]'
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 text-[11px] font-medium ${
                    isLight ? 'text-zinc-700' : 'text-[#bdc2ff]'
                  }`}
                >
                  <GitCommit className={`h-3 w-3 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'} shrink-0`} />
                  <span>Commit message</span>
                </div>
                <p
                  className={`mt-0.5 font-mono text-[11px] select-all break-all ${
                    isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'
                  }`}
                >
                  {safeCommitMessage}
                </p>
              </div>

              <div>
                <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
                  PR title
                </span>
                <p className={`text-xs font-semibold mt-0.5 ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>
                  {safeTitle}
                </p>
              </div>

              <div>
                <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
                  Executive summary
                </span>
                <p className={`text-xs leading-relaxed mt-0.5 ${isLight ? 'text-zinc-600' : 'text-[#c6c5d5]'}`}>
                  {safeSummary}
                </p>
              </div>

              {/* Stitch Checkmark Change List */}
              <div>
                <div className={`flex items-center gap-1.5 text-[11px] font-medium mb-1 ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
                  <Layers className="h-2.5 w-2.5" />
                  <span>Key changes ({keyChanges.length})</span>
                </div>
                <ul className="space-y-1">
                  {keyChanges.map((change, idx) => (
                    <li key={idx} className={`flex items-start gap-1.5 text-xs ${isLight ? 'text-zinc-700' : 'text-[#e3e2e3]'}`}>
                      <span
                        className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
                          isLight
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-[#5e6ad2]/15 text-[#bdc2ff]'
                        }`}
                      >
                        <Check className="h-2 w-2 stroke-[2.5]" />
                      </span>
                      <span className="leading-snug">{String(change)}</span>
                    </li>
                  ))}
                  {keyChanges.length === 0 && (
                    <li className={`text-xs italic ${isLight ? 'text-zinc-400' : 'text-[#908f9e]'}`}>
                      No key changes listed.
                    </li>
                  )}
                </ul>
              </div>

              {/* Breaking Changes Alert Box matching Stitch */}
              {breakingChanges.length > 0 && (
                <div
                  className={`rounded-lg p-2.5 border ${
                    isLight
                      ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                      : 'border-red-500/30 bg-[#0d0e0f]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-medium">
                    <AlertTriangle className={`h-3 w-3 shrink-0 ${isLight ? 'text-amber-700' : 'text-red-400'}`} />
                    <span>Breaking changes detected</span>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {breakingChanges.map((bChange, idx) => (
                      <li key={idx} className={`text-xs flex items-start gap-1.5 ${isLight ? 'text-amber-800' : 'text-red-200/90'}`}>
                        <span className={`font-bold ${isLight ? 'text-amber-700' : 'text-red-400'}`}>•</span>
                        <span>{String(bChange)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <pre
              className={`font-mono text-[11px] whitespace-pre-wrap leading-relaxed rounded-lg p-3 border ${
                isLight
                  ? 'bg-[#FAFAFA] text-zinc-800 border-[#E6E6E4]'
                  : 'bg-[#0d0e0f] text-[#e3e2e3] border-[#292a2b]'
              }`}
            >
              {getFullMarkdown()}
            </pre>
          )}
        </div>

        {/* Card Footer */}
        <div
          className={`pt-2 border-t mt-auto shrink-0 flex flex-col gap-1.5 ${
            isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleCopy}
              className={`py-1 px-2.5 rounded-lg border text-xs font-medium shadow-xs transition-colors cursor-pointer ${
                isLight
                  ? 'border-[#E6E6E4] bg-white hover:bg-zinc-50 text-zinc-700'
                  : 'border-[#292a2b] bg-[#1f2021] text-[#908f9e] hover:text-[#e3e2e3]'
              }`}
            >
              {copied ? 'Copied!' : 'Copy Markdown'}
            </button>

            <button
              type="button"
              onClick={() => setIsRepoModalOpen(true)}
              className={`flex items-center justify-center gap-1.5 font-medium py-1 px-3 rounded-lg text-xs shadow-xs transition-colors cursor-pointer ${
                isLight
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-[#5e6ad2] hover:bg-[#4f5abf] text-white font-semibold'
              }`}
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span>Create PR on GitHub</span>
              <ExternalLink className="h-3 w-3 opacity-80" />
            </button>
          </div>

          <VoiceTweakInput
            cardName="Pull Request"
            onTweak={onTweak}
            isRefining={isRefining}
            placeholder="Hold Wispr to refine this card."
            className="pt-1 mt-0 border-t-0"
          />
        </div>
      </div>

      {/* Zero-OAuth "Open on GitHub" Modal Popover */}
      {isRepoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pr-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRepoModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn"
        >
          <div
            className={`w-full max-w-md rounded-xl border p-5 shadow-2xl ${
              isLight
                ? 'bg-white border-[#E6E6E4] text-[#18181B]'
                : 'bg-[#1b1c1d] border-[#292a2b] text-[#e3e2e3]'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                    isLight
                      ? 'bg-[#18181B] text-white border-[#18181B]'
                      : 'bg-[#0d0e0f] text-[#e3e2e3] border-[#292a2b]'
                  }`}
                >
                  <GithubIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 id="pr-modal-title" className={`text-sm font-semibold ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>
                    Open PR on GitHub
                  </h3>
                  <p className={`text-[11px] font-mono ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
                    Zero-OAuth instant pull request
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRepoModalOpen(false)}
                aria-label="Close dialog"
                className={`rounded-md p-1 cursor-pointer ${isLight ? 'text-zinc-500 hover:bg-zinc-100 hover:text-black' : 'text-[#908f9e] hover:bg-[#292a2b] hover:text-white'}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleLaunchGitHubPR} className="mt-4 space-y-3.5">
              <div>
                <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-zinc-700' : 'text-[#e3e2e3]'}`}>
                  Target repository (`owner/repo`)
                </label>
                <input
                  type="text"
                  required
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  placeholder="e.g. AsteroidHH/Wispr-Flow-No-Hands-Challenge"
                  className={`w-full rounded-md border px-3 py-2 text-xs font-mono focus:outline-none ${
                    isLight
                      ? 'bg-[#FAFAFA] border-[#E6E6E4] text-[#18181B] placeholder:text-zinc-400 focus:border-amber-600'
                      : 'bg-[#0d0e0f] border-[#292a2b] text-[#e3e2e3] placeholder:text-[#908f9e] focus:border-[#5e6ad2]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-zinc-700' : 'text-[#e3e2e3]'}`}>
                  Compare branch path
                </label>
                <input
                  type="text"
                  value={compareBranch}
                  onChange={(e) => setCompareBranch(e.target.value)}
                  placeholder="main...feature"
                  className={`w-full rounded-md border px-3 py-2 text-xs font-mono focus:outline-none ${
                    isLight
                      ? 'bg-[#FAFAFA] border-[#E6E6E4] text-[#18181B] placeholder:text-zinc-400 focus:border-amber-600'
                      : 'bg-[#0d0e0f] border-[#292a2b] text-[#e3e2e3] placeholder:text-[#908f9e] focus:border-[#5e6ad2]'
                  }`}
                />
              </div>

              <div
                className={`rounded-lg p-2.5 border text-xs leading-relaxed font-sans ${
                  isLight
                    ? 'bg-[#F4F4F5] border-[#E6E6E4] text-zinc-600'
                    : 'bg-[#0d0e0f] border-[#292a2b] text-[#908f9e]'
                }`}
              >
                <p>
                  🚀 <strong>Zero OAuth required:</strong> Pre-populates GitHub’s native PR review interface with your generated title, commit message, and Markdown spec. Automatically copies full spec to clipboard if URL length limits are reached.
                </p>
              </div>

              <div className={`flex items-center justify-end gap-2 pt-2 border-t ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
                <button
                  type="button"
                  onClick={() => setIsRepoModalOpen(false)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium cursor-pointer ${
                    isLight
                      ? 'border-[#E6E6E4] bg-white hover:bg-zinc-50 text-zinc-700'
                      : 'border-[#292a2b] bg-[#1f2021] text-[#e3e2e3] hover:bg-[#292a2b]'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-sm text-white cursor-pointer ${
                    isLight ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#5e6ad2] hover:bg-[#5e6ad2]/90'
                  }`}
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
