'use client';

import React, { useState } from 'react';
import { Workflow, Code, Eye, Copy, Check, Loader2 } from 'lucide-react';
import { ArchitectureDeliverable } from '@/lib/types';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { VoiceTweakInput } from '@/components/VoiceTweakInput';

interface ArchitectureCardProps {
  data: ArchitectureDeliverable;
  onTweak: (instruction: string) => void;
  isRefining?: boolean;
}

export function ArchitectureCard({ data, onTweak, isRefining = false }: ArchitectureCardProps) {
  const [viewMode, setViewMode] = useState<'diagram' | 'code'>('diagram');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.mermaidCode);
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {isRefining ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              ) : (
                <Workflow className="h-4 w-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                Architecture Diagram
                {isRefining && (
                  <span className="text-[10px] font-mono text-indigo-400 animate-pulse">
                    Refining...
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-neutral-400">{data.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Diagram / Code Toggle */}
            <div className="flex rounded-lg bg-neutral-950 p-0.5 border border-neutral-800">
              <button
                onClick={() => setViewMode('diagram')}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  viewMode === 'diagram'
                    ? 'bg-neutral-800 text-indigo-300 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Eye className="h-3 w-3" />
                <span>Visual</span>
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  viewMode === 'code'
                    ? 'bg-neutral-800 text-indigo-300 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Code className="h-3 w-3" />
                <span>Code</span>
              </button>
            </div>

            {/* Copy Button */}
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
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="mt-4">
          {viewMode === 'diagram' ? (
            <div className="w-full">
              <MermaidRenderer code={data.mermaidCode} className="min-h-[260px] max-h-[380px]" />
              <p className="mt-2 text-[11px] text-neutral-400 italic">
                {data.description}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>MERMAID SPECIFICATION</span>
                <span>flowchart format</span>
              </div>
              <pre className="max-h-[340px] overflow-x-auto rounded-lg bg-neutral-950 p-4 font-mono text-xs text-indigo-200/90 border border-neutral-800/80 leading-relaxed">
                <code>{data.mermaidCode}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      <VoiceTweakInput
        cardName="Architecture Diagram"
        onTweak={onTweak}
        isRefining={isRefining}
        placeholder="Hold Wispr to refine this card."
      />
    </div>
  );
}
