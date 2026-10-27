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
import { useTheme } from '@/lib/ThemeContext';

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
  const { isLight } = useTheme();
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
- **Visual Topology Diagram:** Mermaid Architecture Diagram
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
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
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
            <h1 className={`text-sm sm:text-base font-semibold tracking-tight flex items-center gap-2 ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>
              <Sparkles className={`h-4 w-4 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
              Changelog AI Copilot
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer shadow-xs ${
              isLight
                ? 'border-[#E6E6E4] bg-white text-zinc-700 hover:bg-zinc-50'
                : 'border-[#292a2b] bg-[#1f2021] text-[#bdc2ff] hover:bg-[#292a2b]'
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied Markdown' : 'Copy Changelog'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer shadow-xs ${
              isLight
                ? 'border-[#E6E6E4] bg-white text-zinc-700 hover:bg-zinc-50'
                : 'border-[#292a2b] bg-[#1f2021] text-[#e3e2e3] hover:bg-[#292a2b]'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .md</span>
          </button>
        </div>
      </div>

      {/* Changelog Document Canvas */}
      <div
        className={`rounded-xl border p-6 shadow-xs max-w-4xl mx-auto space-y-5 transition-colors ${
          isLight
            ? 'bg-white border-[#E6E6E4] text-[#18181B]'
            : 'bg-[#1b1c1d] border-[#292a2b] text-[#e3e2e3]'
        }`}
      >
        <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
          <div className="flex items-center gap-2">
            <Tag className={`h-4 w-4 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
            <span className="font-mono text-xs font-semibold">v2.5.0-edge Automated Release</span>
          </div>
          <span className={`font-mono text-xs ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>Generated Just Now</span>
        </div>

        <pre
          className={`font-mono text-xs p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border ${
            isLight
              ? 'bg-[#FAFAFA] border-[#E6E6E4] text-zinc-800'
              : 'bg-[#0d0e0f] border-[#292a2b] text-[#e3e2e3]'
          }`}
        >
          {markdownChangelog}
        </pre>
      </div>
    </div>
  );
}
