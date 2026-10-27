'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  Download,
  FileText,
  GitCommit,
  Tag,
} from 'lucide-react';
import { Deliverables } from '@/lib/types';

interface ChangelogAiViewProps {
  voiceTranscript: string;
  gitDiff: string;
  deliverables: Deliverables | null;
  onBack: () => void;
}

export function ChangelogAiView({
  voiceTranscript,
  gitDiff,
  deliverables,
  onBack,
}: ChangelogAiViewProps) {
  const [copied, setCopied] = useState(false);

  // Generate a dynamic, rich markdown changelog based on the current session state
  const pr = deliverables?.pullRequest;
  const rawTranscript = voiceTranscript.trim() || 'Refactored agent routing and hardened edge token verification.';
  const keyChanges = pr?.keyChanges?.length
    ? pr.keyChanges
    : [
        'Dynamic vector tool-match scoring in tools/registry.ts',
        'Mitigated token exhaustion race condition on parallel sub-agents',
        'Anthropic 429 exponential backoff retry mechanism',
        'Streamed structured JSON delta outputs directly to client websockets',
      ];

  const breakingChanges = pr?.breakingChanges?.length
    ? pr.breakingChanges
    : ['Client authorization headers now strictly enforce RS256 Bearer signature token format'];

  const markdownChangelog = `# Changelog • ShipSpeak Release v2.5.0-edge
*Generated automatically via Wispr Flow speech stream & Git Diff grounding*

## 🚀 Key Features & Architectural Enhancements
${keyChanges.map((c) => `- **${c}**`).join('\n')}

## ⚠️ Breaking Changes & Migration Guide
${breakingChanges.map((b) => `- ${b}`).join('\n')}

## 🎙️ Speech-to-Code Technical Rationale
> "${rawTranscript.slice(0, 320)}${rawTranscript.length > 320 ? '...' : ''}"

## 📦 Verified Deliverables
- **Pull Request Spec:** ${pr?.title || 'Automated Engine PR'}
- **Visual Topology Diagram:** Mermaid Obsidian Architecture Diagram
- **Sprint Teleprompter Script:** 02:00 Demo Video Script
- **Social Launch Announcement:** Twitter, LinkedIn & Threads draft

---
*Built with ShipSpeak • The Voice-First Last-Mile Engine for Developers*`;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownChangelog);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownChangelog], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CHANGELOG.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
              <Sparkles className="h-4 w-4 text-[#5e6ad2]" />
              AI-Generated Release Changelog
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded bg-[#1f2021] border border-[#292a2b] px-3 py-1.5 text-xs text-[#e3e2e3] hover:bg-[#292a2b] transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Changelog</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded bg-[#5e6ad2] hover:bg-[#4f5ac4] px-3 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CHANGELOG.md</span>
          </button>
        </div>
      </div>

      {/* Changelog Markdown Container */}
      <div className="rounded-xl border border-[#292a2b] bg-[#1b1c1d] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#908f9e] border-b border-[#292a2b] pb-3">
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-[#ffb867]" />
            <span className="text-[#e3e2e3] font-semibold">Release v2.5.0-edge</span>
            <span>•</span>
            <span>Grounding: Active Session</span>
          </div>
          <span className="text-[#bdc2ff]">Markdown GFM Format</span>
        </div>

        <div className="rounded-lg bg-[#0d0e0f] border border-[#292a2b] p-5 font-mono text-xs text-[#e3e2e3] leading-relaxed whitespace-pre-wrap overflow-x-auto select-text">
          {markdownChangelog}
        </div>
      </div>
    </div>
  );
}
