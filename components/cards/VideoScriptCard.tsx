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
    return `# ${data.title}
Duration: ${data.totalDuration}

${data.segments
  .map(
    (seg) => `### [${seg.timestamp}] ${seg.stage || 'Segment'}
**Audio (Spoken):** "${seg.spokenLine || seg.audio}"
**Visual Cue:** ${seg.visualCue}
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
              {isRefining ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              ) : (
                <Video className="h-4 w-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                2-Min Demo Video Script
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
            <div className="flex items-center gap-1 rounded-full border border-pink-500/30 bg-pink-950/30 px-2.5 py-0.5 text-[11px] font-mono text-pink-300">
              <Clock className="h-3 w-3" />
              <span>{data.totalDuration}</span>
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
                  <span>Copy Script</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Script Segments */}
        <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {data.segments.map((seg, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-neutral-800/80 bg-neutral-950/70 p-3 transition-colors hover:border-neutral-700/80"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-pink-300 border border-neutral-700">
                  {seg.timestamp}
                </span>
                <span className="text-[11px] font-medium text-neutral-400">
                  {seg.stage}
                </span>
              </div>

              <div className="mt-2 space-y-1.5">
                <div className="flex items-start gap-1.5 text-xs text-neutral-200">
                  <Mic className="h-3.5 w-3.5 mt-0.5 text-neutral-400 shrink-0" />
                  <p className="italic leading-relaxed">&ldquo;{seg.spokenLine || seg.audio}&rdquo;</p>
                </div>

                <div className="flex items-start gap-1.5 rounded bg-neutral-900/90 px-2.5 py-1 text-[11px] text-neutral-300 border border-neutral-800">
                  <Eye className="h-3 w-3 mt-0.5 text-pink-400 shrink-0" />
                  <p className="font-mono text-neutral-400">{seg.visualCue}</p>
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
