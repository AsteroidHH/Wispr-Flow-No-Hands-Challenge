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
import { useTheme } from '@/lib/ThemeContext';

interface VideoScriptCardProps {
  data: VideoScriptDeliverable;
  onTweak: (instruction: string) => void;
  isRefining?: boolean;
}

export function VideoScriptCard({ data, onTweak, isRefining = false }: VideoScriptCardProps) {
  const { isLight } = useTheme();
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
        className={`flex flex-col h-full justify-between border rounded-xl p-5 transition-all shadow-xs overflow-hidden ${
          isLight
            ? isRefining
              ? 'bg-white border-amber-500/70 ring-1 ring-amber-500/40'
              : 'bg-white border-[#E6E6E4] hover:border-zinc-300'
            : isRefining
            ? 'bg-[#1b1c1d] border-[#5e6ad2]/70 ring-1 ring-[#5e6ad2]/40 shadow-[#5e6ad2]/10'
            : 'bg-[#1b1c1d] border-[#292a2b] hover:border-[#343536]'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Card Header matching Stitch */}
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                  isLight
                    ? 'bg-[#18181B] text-white border-[#18181B]'
                    : 'bg-[#1f2021] text-[#5e6ad2] border border-[#292a2b]'
                }`}
              >
                {isRefining ? (
                  <Loader2 className={`h-3.5 w-3.5 animate-spin ${isLight ? 'text-amber-500' : 'text-[#5e6ad2]'}`} />
                ) : (
                  <Video className="h-3.5 w-3.5" />
                )}
              </div>
              <div>
                <h3
                  className={`text-xs font-semibold tracking-tight flex items-center gap-2 ${
                    isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'
                  }`}
                >
                  Demo Video Script &amp; Teleprompter
                  {isRefining && (
                    <span className={`text-[10px] font-mono ${isLight ? 'text-amber-600' : 'text-[#bdc2ff]'}`}>
                      Refining...
                    </span>
                  )}
                </h3>
                <p className={`text-[11px] mt-0.5 ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>{data.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div
                className={`flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border ${
                  isLight
                    ? 'bg-[#F4F4F5] border-[#E6E6E4] text-zinc-600'
                    : 'bg-[#0d0e0f] text-[#ffb867] border-[#292a2b]'
                }`}
              >
                <Clock className={`h-3 w-3 ${isLight ? 'text-amber-600' : 'text-[#ffb867]'}`} />
                <span>{data.totalDuration || '02:00 Total'}</span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                title="Copy script markdown"
                className={`flex items-center p-1.5 rounded-md border transition-colors text-xs cursor-pointer ${
                  isLight
                    ? 'border-[#E6E6E4] bg-white hover:bg-zinc-50 text-zinc-600'
                    : 'border-[#292a2b] bg-[#1f2021] hover:bg-[#292a2b] text-[#908f9e]'
                }`}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Clean Teleprompter Script Segments matching Stitch */}
          <div className="mt-3.5 flex-1 max-h-[340px] overflow-y-auto pr-1 space-y-2.5">
            {segments.map((seg, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-3 transition-colors border ${
                  isLight
                    ? 'bg-[#FAFAFA] border-[#E6E6E4] hover:border-zinc-300'
                    : 'bg-[#0d0e0f] border-[#292a2b] hover:border-[#343536]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`font-mono text-[10.5px] font-semibold ${
                      isLight
                        ? 'text-amber-700'
                        : 'text-[#bdc2ff] rounded bg-[#1f2021] px-2 py-0.5 border border-[#292a2b]'
                    }`}
                  >
                    [{seg.timestamp}] {seg.stage}
                  </span>
                </div>

                <div className="mt-1.5 space-y-1.5">
                  <div
                    className={`flex items-start gap-1.5 text-xs leading-snug ${
                      isLight ? 'text-zinc-700' : 'text-[#e3e2e3]'
                    }`}
                  >
                    <Mic className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
                    <p className="italic">&ldquo;{seg.spokenLine || seg.audio}&rdquo;</p>
                  </div>

                  <div
                    className={`flex items-start gap-1.5 rounded px-2.5 py-1 text-[11px] border ${
                      isLight
                        ? 'bg-white border-[#E6E6E4] text-zinc-600'
                        : 'bg-[#1b1c1d] border-[#292a2b] text-[#c6c5d5]'
                    }`}
                  >
                    <Eye className={`h-3 w-3 mt-0.5 shrink-0 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
                    <p className="font-mono">{seg.visualCue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* STITCH TELEPROMPTER ACTIONS BAR */}
          <div
            className={`flex items-center justify-between pt-3 mt-3 border-t ${
              isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className={isLight ? 'text-zinc-500' : 'text-[#908f9e]'}>Speed:</span>
              <button
                type="button"
                onClick={() => setPlaybackSpeed('1.0x')}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                  playbackSpeed === '1.0x'
                    ? isLight
                      ? 'bg-zinc-100 border border-[#E6E6E4] text-zinc-800 font-medium'
                      : 'bg-[#1f2021] text-white border border-[#343536] font-medium'
                    : isLight
                    ? 'text-zinc-500 hover:text-zinc-800'
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
                    ? isLight
                      ? 'bg-zinc-100 border border-[#E6E6E4] text-zinc-800 font-medium'
                      : 'bg-[#1f2021] text-white border border-[#343536] font-medium'
                    : isLight
                    ? 'text-zinc-500 hover:text-zinc-800'
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium text-xs transition-colors shadow-xs cursor-pointer ${
                isLight
                  ? 'bg-zinc-100 hover:bg-zinc-200 border-[#E6E6E4] text-[#18181B]'
                  : 'bg-[#1f2021] hover:bg-[#292a2b] text-[#e3e2e3] hover:text-white border-[#292a2b]'
              }`}
            >
              <Play className={`h-3.5 w-3.5 ${isLight ? 'text-amber-600 fill-amber-600' : 'text-[#5e6ad2] fill-[#5e6ad2]'}`} />
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

      {/* Teleprompter Fullscreen Studio Overlay */}
      {isTeleprompterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fadeIn">
          <div
            className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl flex flex-col gap-4 ${
              isLight
                ? 'bg-white border-[#E6E6E4] text-[#18181B]'
                : 'bg-[#1b1c1d] border-[#292a2b] text-[#e3e2e3]'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                    isLight
                      ? 'bg-[#18181B] text-white border-[#18181B]'
                      : 'bg-[#0d0e0f] text-[#5e6ad2] border border-[#292a2b]'
                  }`}
                >
                  <Video className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Studio Teleprompter HUD</h3>
                  <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
                    {data.title} • {data.totalDuration || '02:00'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-500/20 text-amber-800 border-amber-300'
                      : isLight
                      ? 'bg-zinc-100 text-zinc-800 border-[#E6E6E4]'
                      : 'bg-[#1f2021] text-[#e3e2e3] border-[#292a2b]'
                  }`}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSegmentIndex(0)}
                  className={`p-1.5 rounded-lg border cursor-pointer ${
                    isLight ? 'border-[#E6E6E4] text-zinc-600 hover:bg-zinc-100' : 'border-[#292a2b] text-[#908f9e] hover:bg-[#292a2b]'
                  }`}
                  title="Reset to start"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsTeleprompterOpen(false)}
                  className={`p-1.5 rounded-lg ${isLight ? 'text-zinc-500 hover:bg-zinc-100' : 'text-[#908f9e] hover:bg-[#292a2b]'}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Main Stage Text Stream */}
            <div
              className={`rounded-xl border p-6 min-h-[260px] flex flex-col justify-center items-center text-center ${
                isLight
                  ? 'bg-[#FAFAFA] border-[#E6E6E4]'
                  : 'bg-[#0d0e0f] border-[#292a2b]'
              }`}
            >
              {segments[activeSegmentIndex] ? (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-mono text-xs font-semibold ${isLight ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-[#5e6ad2]/20 text-[#bdc2ff] border border-[#5e6ad2]/30'}`}>
                      {segments[activeSegmentIndex].timestamp}
                    </span>
                    <span className={`text-xs uppercase tracking-wider font-semibold ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
                      {segments[activeSegmentIndex].stage}
                    </span>
                  </div>

                  <p className="text-xl sm:text-2xl font-serif font-medium leading-relaxed max-w-xl mx-auto">
                    &ldquo;{segments[activeSegmentIndex].spokenLine || segments[activeSegmentIndex].audio}&rdquo;
                  </p>

                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs border ${isLight ? 'bg-white border-[#E6E6E4] text-zinc-600' : 'bg-[#1b1c1d] border-[#292a2b] text-[#c6c5d5]'}`}>
                    <Eye className={`h-3.5 w-3.5 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
                    <span>Visual Cue: {segments[activeSegmentIndex].visualCue}</span>
                  </div>
                </div>
              ) : (
                <p className={`text-xs italic ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
                  No video script segments available.
                </p>
              )}
            </div>

            {/* Timeline Segment Stepper */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto pt-1">
              {segments.map((seg, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveSegmentIndex(i)}
                  className={`flex-1 py-1.5 px-2 rounded-md font-mono text-[11px] transition-colors border cursor-pointer truncate ${
                    activeSegmentIndex === i
                      ? isLight
                        ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                        : 'bg-[#5e6ad2] text-white border-[#5e6ad2] font-semibold'
                      : isLight
                      ? 'bg-white border-[#E6E6E4] text-zinc-600 hover:bg-zinc-50'
                      : 'bg-[#0d0e0f] border-[#292a2b] text-[#908f9e] hover:bg-[#1f2021]'
                  }`}
                >
                  {seg.timestamp}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
