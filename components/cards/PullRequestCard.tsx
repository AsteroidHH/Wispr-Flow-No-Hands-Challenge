'use client';

import React, { useState } from 'react';
import { GitPullRequest, GitCommit, Copy, Check, AlertTriangle, Layers, FileText, CheckSquare, Loader2 } from 'lucide-react';
import { PullRequestDeliverable } from '@/lib/types';
import { VoiceTweakInput } from '@/components/VoiceTweakInput';

interface PullRequestCardProps {
  data: PullRequestDeliverable;
  onTweak: (instruction: string) => void;
  isRefining?: boolean;
}

export function PullRequestCard({ data, onTweak, isRefining = false }: PullRequestCardProps) {
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState<'structured' | 'markdown'>('structured');

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
${data.keyChanges.map(change => `- ${change}`).join('\n')}

### ⚠️ Breaking Changes
${data.breakingChanges.map(b => `- ${b}`).join('\n')}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFullMarkdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border bg-neutral-900/60 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 ${
        isRefining
          ? 'border-indigo-500/80 shadow-[0_0_25px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/50'
          : 'border-neutral-800 hover:border-neutral-700/80'
      }`}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
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

          <div className="flex items-center gap-2">
            {/* View Tab Toggle */}
            <div className="flex rounded-lg bg-neutral-950 p-0.5 border border-neutral-800">
              <button
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

            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition-all ${
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
                  <span>Copy PR</span>
                </>
              )}
            </button>
          </div>
        </div>

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
  );
}
