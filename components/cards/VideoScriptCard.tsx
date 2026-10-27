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
      className={`flex flex-col justify-between rounded-xl border bg-[#1b1c1d] p-5 transition-colors overflow-hidden ${
        isRefining
          ? 'border-[#5e6ad2] ring-1 ring-[#5e6ad2]/50'
          : 'border-[#292a2b] hover:border-[#343536]'
      }`}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#292a2b]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0d0e0f] text-[#bdc2ff] border border-[#292a2b]">
              {isRefining ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#5e6ad2]" />
              ) : (
                <Video className="h-3.5 w-3.5 text-[#5e6ad2]" />
              )}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#e3e2e3] flex items-center gap-2">
                Demo video script
                {isRefining && (
                  <span className="text-[10px] font-mono text-[#bdc2ff]">
                    Refining...
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-[#908f9e]">{data.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-full border border-[#292a2b] bg-[#0d0e0f] px-2.5 py-0.5 text-[10px] font-mono text-[#908f9e]">
              <Clock className="h-3 w-3 text-[#5e6ad2]" />
              <span>{data.totalDuration}</span>
            </div>

            <button
              onClick={handleCopy}
              title="Copy script markdown"
              className="flex items-center p-1.5 rounded-md text-[#908f9e] hover:text-[#e3e2e3] hover:bg-[#292a2b] transition-colors text-xs border border-[#292a2b] bg-[#0d0e0f]"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Clean Teleprompter Script Segments */}
        <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {(data.segments || []).map((seg, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-[#292a2b] bg-[#0d0e0f] p-3 transition-colors hover:border-[#343536]"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="rounded bg-[#121315] px-2 py-0.5 font-mono text-[10px] font-medium text-[#bdc2ff] border border-[#292a2b]">
                  {seg.timestamp}
                </span>
                <span className="text-xs font-medium text-[#908f9e]">
                  {seg.stage}
                </span>
              </div>

              <div className="mt-2 space-y-1.5">
                <div className="flex items-start gap-1.5 text-xs text-[#e3e2e3]">
                  <Mic className="h-3.5 w-3.5 mt-0.5 text-[#5e6ad2] shrink-0" />
                  <p className="italic leading-relaxed">&ldquo;{seg.spokenLine || seg.audio}&rdquo;</p>
                </div>

                <div className="flex items-start gap-1.5 rounded bg-[#121315] px-2.5 py-1 text-[11px] text-[#908f9e] border border-[#292a2b]">
                  <Eye className="h-3 w-3 mt-0.5 text-[#5e6ad2] shrink-0" />
                  <p className="font-mono text-[#908f9e]">{seg.visualCue}</p>
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
