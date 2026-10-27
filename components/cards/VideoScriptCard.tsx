'use client';

import React, { useState } from 'react';
import { Video, Clock, Copy, Check, Eye, Mic, Loader2 } from 'lucide-react';
import { VideoScriptDeliverable } from '@/lib/types';
import { VoiceTweakInput } from '@/components/VoiceTweakInput';

interface VideoScriptCardProps {
  data: VideoScriptDeliverable;
  onTweak: (instruction: string) => void;
  isRefining?: boolean;
}

export function VideoScriptCard({ data, onTweak, isRefining = false }: VideoScriptCardProps) {
  const [copied, setCopied] = useState(false);

  const getFullScriptMarkdown = () => {
    const segments = Array.isArray(data.segments) ? data.segments : [];
    return `# ${data.title || 'Demo Video Script'}
Duration: ${data.totalDuration || '02:00'}

${segments
  .map(
    (seg) => `### [${seg.timestamp || '00:00'}] ${seg.stage || 'Segment'}
**Audio (Spoken):** "${seg.spokenLine || seg.audio || ''}"
**Visual Cue:** ${seg.visualCue || 'Screen view'}
`
  )
  .join('\n')}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFullScriptMarkdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div
      className={`flex flex-col h-full justify-between bg-[#111215] border rounded-xl p-5 transition-all shadow-sm overflow-hidden ${
        isRefining
          ? 'border-indigo-500/70 ring-1 ring-indigo-500/40 shadow-indigo-500/10'
          : 'border-white/[0.08] hover:border-white/[0.14]'
      }`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-indigo-400 border border-white/[0.08]">
              {isRefining ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              ) : (
                <Video className="h-3.5 w-3.5 text-indigo-400" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
                Demo video script
                {isRefining && (
                  <span className="text-[10px] font-mono text-indigo-300">
                    Refining...
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">{data.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 font-mono text-[11px] bg-white/[0.05] text-zinc-300 px-2.5 py-0.5 rounded border border-white/[0.08]">
              <Clock className="h-3 w-3 text-indigo-400" />
              <span>{data.totalDuration}</span>
            </div>

            <button
              onClick={handleCopy}
              title="Copy script markdown"
              className="flex items-center p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors text-xs"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Clean Teleprompter Script Segments with Strict Height */}
        <div className="mt-3.5 flex-1 max-h-[340px] overflow-y-auto pr-1 space-y-2.5">
          {(data.segments || []).map((seg, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-white/[0.06] bg-[#0a0b0d] p-3 transition-colors hover:border-white/[0.12]"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="rounded bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-medium text-indigo-300 border border-white/[0.08]">
                  {seg.timestamp}
                </span>
                <span className="text-xs font-medium text-zinc-400">
                  {seg.stage}
                </span>
              </div>

              <div className="mt-2 space-y-1.5">
                <div className="flex items-start gap-1.5 text-xs text-zinc-200">
                  <Mic className="h-3.5 w-3.5 mt-0.5 text-indigo-400 shrink-0" />
                  <p className="italic leading-relaxed">&ldquo;{seg.spokenLine || seg.audio}&rdquo;</p>
                </div>

                <div className="flex items-start gap-1.5 rounded bg-[#111215] px-2.5 py-1 text-[11px] text-zinc-400 border border-white/[0.06]">
                  <Eye className="h-3 w-3 mt-0.5 text-indigo-400 shrink-0" />
                  <p className="font-mono text-zinc-400">{seg.visualCue}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <VoiceTweakInput
        cardName="Demo Video Script"
        onTweak={onTweak}
        isRefining={isRefining}
        placeholder="Hold Wispr to refine this card."
      />
    </div>
  );
}
