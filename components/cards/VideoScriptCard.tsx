'use client';

import React, { useState, useEffect } from 'react';
import {
  Video,
  Clock,
  Copy,
  Check,
  Eye,
  Mic,
  Loader2,
  Play,
  Pause,
  X,
  RotateCcw,
} from 'lucide-react';
import { VideoScriptDeliverable } from '@/lib/types';
import { VoiceTweakInput } from '@/components/VoiceTweakInput';

interface VideoScriptCardProps {
  data: VideoScriptDeliverable;
  onTweak: (instruction: string) => void;
  isRefining?: boolean;
}

export function VideoScriptCard({ data, onTweak, isRefining = false }: VideoScriptCardProps) {
  const [copied, setCopied] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'1.0x' | '1.2x'>('1.0x');
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);

  const segments = Array.isArray(data.segments) ? data.segments : [];

  // Auto-scroll simulation in teleprompter modal
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTeleprompterOpen && isPlaying && segments.length > 0) {
      const delay = playbackSpeed === '1.2x' ? 3200 : 4000;
      interval = setInterval(() => {
        setActiveSegmentIndex((prev) => (prev + 1) % segments.length);
      }, delay);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTeleprompterOpen, isPlaying, playbackSpeed, segments.length]);

  const getFullScriptMarkdown = () => {
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
    <>
      <div
        className={`flex flex-col h-full justify-between bg-[#1b1c1d] border rounded-xl p-5 transition-all shadow-sm overflow-hidden ${
          isRefining
            ? 'border-[#5e6ad2]/70 ring-1 ring-[#5e6ad2]/40 shadow-[#5e6ad2]/10'
            : 'border-[#292a2b] hover:border-[#343536]'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#292a2b]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1f2021] text-[#5e6ad2] border border-[#292a2b]">
                {isRefining ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#5e6ad2]" />
                ) : (
                  <Video className="h-3.5 w-3.5 text-[#5e6ad2]" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#e3e2e3] tracking-tight flex items-center gap-2">
                  Demo Video Script
                  {isRefining && (
                    <span className="text-[10px] font-mono text-[#bdc2ff]">
                      Refining...
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#908f9e] mt-0.5">{data.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 font-mono text-[11px] bg-[#0d0e0f] text-[#ffb867] px-2.5 py-0.5 rounded border border-[#292a2b]">
                <Clock className="h-3 w-3 text-[#ffb867]" />
                <span>{data.totalDuration || '02:00 Total'}</span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                title="Copy script markdown"
                className="flex items-center p-1.5 rounded-md text-[#908f9e] hover:text-[#e3e2e3] bg-[#1f2021] hover:bg-[#292a2b] border border-[#292a2b] transition-colors text-xs cursor-pointer"
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
            {segments.map((seg, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-[#292a2b] bg-[#0d0e0f] p-3 transition-colors hover:border-[#343536]"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="rounded bg-[#1f2021] px-2 py-0.5 font-mono text-[10px] font-medium text-[#bdc2ff] border border-[#292a2b]">
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

                  <div className="flex items-start gap-1.5 rounded bg-[#1b1c1d] px-2.5 py-1 text-[11px] text-[#c6c5d5] border border-[#292a2b]">
                    <Eye className="h-3 w-3 mt-0.5 text-[#5e6ad2] shrink-0" />
                    <p className="font-mono text-[#908f9e]">{seg.visualCue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* STITCH TELEPROMPTER ACTIONS BAR */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#292a2b]">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-[#908f9e]">Speed:</span>
              <button
                type="button"
                onClick={() => setPlaybackSpeed('1.0x')}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                  playbackSpeed === '1.0x'
                    ? 'bg-[#1f2021] text-white border border-[#343536] font-medium'
                    : 'bg-[#0d0e0f] text-[#908f9e] hover:text-[#e3e2e3] border border-[#292a2b]'
                }`}
              >
                1.0x
              </button>
              <button
                type="button"
                onClick={() => setPlaybackSpeed('1.2x')}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                  playbackSpeed === '1.2x'
                    ? 'bg-[#1f2021] text-white border border-[#343536] font-medium'
                    : 'bg-[#0d0e0f] text-[#908f9e] hover:text-[#e3e2e3] border border-[#292a2b]'
                }`}
              >
                1.2x
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsTeleprompterOpen(true);
                setIsPlaying(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f2021] hover:bg-[#292a2b] text-[#e3e2e3] hover:text-white border border-[#292a2b] font-medium text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 text-[#5e6ad2] fill-[#5e6ad2]" />
              <span>Launch Teleprompter</span>
            </button>
          </div>
        </div>

        <VoiceTweakInput
          cardName="Demo Video Script"
          onTweak={onTweak}
          isRefining={isRefining}
          placeholder="Hold Wispr to refine this card."
        />
      </div>

      {/* FULLSCREEN TELEPROMPTER OVERLAY MODAL */}
      {isTeleprompterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-6 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl border border-[#292a2b] bg-[#0d0e0f] p-6 shadow-2xl flex flex-col justify-between max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-[#292a2b] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1b1c1d] text-[#ffb867] border border-[#292a2b]">
                  <Video className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#e3e2e3]">Live Recording Teleprompter</h3>
                  <p className="text-xs font-mono text-[#908f9e]">Speed: {playbackSpeed} • Auto-scrolling prompt</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f2021] text-xs font-mono text-[#e3e2e3] border border-[#292a2b] hover:bg-[#292a2b] transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5 text-[#ffb867]" /> : <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />}
                  <span>{isPlaying ? 'Pause' : 'Resume'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSegmentIndex(0)}
                  className="p-1.5 rounded-lg bg-[#1f2021] text-[#908f9e] hover:text-[#e3e2e3] border border-[#292a2b] transition-colors cursor-pointer"
                  title="Reset to beginning"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsTeleprompterOpen(false)}
                  className="p-1.5 rounded-lg text-[#908f9e] hover:text-white hover:bg-[#1f2021] transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Active Teleprompter Display */}
            <div className="my-8 space-y-6 text-center px-4 overflow-y-auto">
              <div className="font-mono text-xs text-[#bdc2ff] bg-[#1b1c1d] inline-block px-3 py-1 rounded-full border border-[#292a2b]">
                {segments[activeSegmentIndex]?.timestamp || '00:00'} • {segments[activeSegmentIndex]?.stage || 'Demo'}
              </div>
              <p className="text-xl sm:text-2xl font-serif text-[#fdfaff] leading-relaxed select-none">
                &ldquo;{segments[activeSegmentIndex]?.spokenLine || segments[activeSegmentIndex]?.audio}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#ffb867] bg-[#1b1c1d]/60 p-2.5 rounded-lg max-w-md mx-auto border border-[#292a2b]">
                <Eye className="h-4 w-4 shrink-0" />
                <span>Visual: {segments[activeSegmentIndex]?.visualCue}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#292a2b] pt-4 text-xs font-mono text-[#908f9e]">
              <span>Segment {activeSegmentIndex + 1} of {segments.length}</span>
              <span>Tip: Read aloud while recording your demo video</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
