'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  GitCommit,
  Zap,
} from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

interface DeployQueueViewProps {
  onBack: () => void;
}

export function DeployQueueView({ onBack }: DeployQueueViewProps) {
  const { isLight } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, []);

  const handleRefresh = () => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    setIsRefreshing(true);
    refreshTimeoutRef.current = setTimeout(() => setIsRefreshing(false), 800);
  };

  const queueEvents = [
    {
      id: 'dep-902',
      title: 'dep-902 Vercel Edge Ingress',
      time: '12 seconds ago',
      status: 'Completed',
      statusColor: isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      description: 'Deployed commit 0x8efb34 to production edge network with zero cache lag and global SSL re-routing.',
      author: 'Daemon CI • Automated',
      duration: '412ms',
    },
    {
      id: 'dep-901',
      title: 'dep-901 Gemini 2.5 Flash Synthesis',
      time: '42 seconds ago',
      status: 'Success',
      statusColor: isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-indigo-500/10 text-[#bdc2ff] border-indigo-500/30',
      description: 'Synthesized 4 artifacts from voice audio buffer and git diff schema in 1.2s via structured JSON mode.',
      author: 'Wispr Audio Pipeline',
      duration: '1.2s',
    },
    {
      id: 'dep-900',
      title: 'dep-900 Cache Invalidation',
      time: '2 minutes ago',
      status: 'Completed',
      statusColor: isLight ? 'bg-zinc-100 text-zinc-700 border-[#E6E6E4]' : 'bg-neutral-500/10 text-[#e3e2e3] border-neutral-500/30',
      description: 'Purged edge cache on /api/generate and updated static deliverables zip distribution bucket.',
      author: 'Edge Middleware',
      duration: '18ms',
    },
    {
      id: 'dep-899',
      title: 'dep-899 Pre-flight Static Type Check',
      time: '4 minutes ago',
      status: 'Passed',
      statusColor: isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      description: 'TypeScript 5.8 0 errors, 7/7 routes compiled under Next.js 16.4.3 Turbopack engine.',
      author: 'Turbopack Worker',
      duration: '2.4s',
    },
    {
      id: 'dep-898',
      title: 'dep-898 Stitch Design Synchronizer',
      time: '7 minutes ago',
      status: 'Verified',
      statusColor: isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-neutral-500/10 text-[#bdc2ff] border-neutral-500/30',
      description: 'Synchronized Editorial Light & Obsidian Kinetic design tokens and 240px docked sidebar layout from Google Stitch.',
      author: 'StitchMCP Hook',
      duration: '95ms',
    },
  ];

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
              <Layers className={`h-4 w-4 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
              Deploy Queue &amp; Pipeline Events
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer shadow-xs ${
            isLight
              ? 'border-[#E6E6E4] bg-white text-zinc-700 hover:bg-zinc-50'
              : 'border-[#292a2b] bg-[#1f2021] text-[#bdc2ff] hover:bg-[#292a2b]'
          }`}
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-3">
        {queueEvents.map((ev) => (
          <div
            key={ev.id}
            className={`rounded-xl border p-4 shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isLight
                ? 'bg-white border-[#E6E6E4] hover:border-zinc-300'
                : 'bg-[#1b1c1d] border-[#292a2b] hover:border-[#343536]'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg border ${
                  isLight
                    ? 'bg-[#18181B] text-white border-[#18181B]'
                    : 'bg-[#0d0e0f] text-[#5e6ad2] border border-[#292a2b]'
                }`}
              >
                <Zap className={`h-3.5 w-3.5 ${isLight ? 'text-amber-500' : 'text-[#5e6ad2]'}`} />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className={`text-xs font-semibold ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>
                    {ev.title}
                  </h4>
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono border ${ev.statusColor}`}>
                    {ev.status}
                  </span>
                  <span className={`text-[11px] font-mono ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
                    • {ev.time}
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-zinc-600' : 'text-[#c6c5d5]'}`}>{ev.description}</p>
                <div className={`flex items-center gap-2 text-[11px] font-mono ${isLight ? 'text-zinc-400' : 'text-[#908f9e]'}`}>
                  <span>By: {ev.author}</span>
                  <span>•</span>
                  <span>Execution: <strong className={isLight ? 'text-zinc-700' : 'text-[#bdc2ff]'}>{ev.duration}</strong></span>
                </div>
              </div>
            </div>

            <div className="self-end sm:self-center">
              <span className={`font-mono text-[10px] px-2 py-1 rounded border ${isLight ? 'bg-[#F4F4F5] border-[#E6E6E4] text-zinc-600' : 'bg-[#0d0e0f] border-[#292a2b] text-[#bdc2ff]'}`}>
                {ev.id}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
