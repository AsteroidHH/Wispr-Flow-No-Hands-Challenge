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

interface DeployQueueViewProps {
  onBack: () => void;
}

export function DeployQueueView({ onBack }: DeployQueueViewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const queueEvents = [
    {
      id: 'dep-902',
      title: 'dep-902 Vercel Edge Ingress',
      time: '12 seconds ago',
      status: 'Completed',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      description: 'Deployed commit 0x8efb34 to production edge network with zero cache lag and global SSL re-routing.',
      author: 'Daemon CI • Automated',
      duration: '412ms',
    },
    {
      id: 'dep-901',
      title: 'dep-901 Gemini 2.5 Flash Synthesis',
      time: '42 seconds ago',
      status: 'Success',
      statusColor: 'bg-indigo-500/10 text-[#bdc2ff] border-indigo-500/30',
      description: 'Synthesized 4 artifacts from voice audio buffer and git diff schema in 1.2s via structured JSON mode.',
      author: 'Wispr Audio Pipeline',
      duration: '1.2s',
    },
    {
      id: 'dep-900',
      title: 'dep-900 Cache Invalidation',
      time: '2 minutes ago',
      status: 'Completed',
      statusColor: 'bg-neutral-500/10 text-[#e3e2e3] border-neutral-500/30',
      description: 'Purged edge cache on /api/generate and updated static deliverables zip distribution bucket.',
      author: 'Edge Middleware',
      duration: '18ms',
    },
    {
      id: 'dep-899',
      title: 'dep-899 Pre-flight Static Type Check',
      time: '4 minutes ago',
      status: 'Passed',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      description: 'TypeScript 5.8 0 errors, 7/7 routes compiled under Next.js 16.4.3 Turbopack engine.',
      author: 'Turbopack Worker',
      duration: '2.4s',
    },
    {
      id: 'dep-898',
      title: 'dep-898 Stitch Design Synchronizer',
      time: '7 minutes ago',
      status: 'Verified',
      statusColor: 'bg-neutral-500/10 text-[#bdc2ff] border-neutral-500/30',
      description: 'Synchronized Obsidian Kinetic design tokens and 240px docked sidebar layout from Google Stitch.',
      author: 'StitchMCP Hook',
      duration: '95ms',
    },
  ];

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
              <Layers className="h-4 w-4 text-[#5e6ad2]" />
              Deploy Queue & Pipeline Events
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded bg-[#1f2021] border border-[#292a2b] px-2.5 py-1 text-xs text-[#bdc2ff] hover:bg-[#292a2b] font-mono transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Interactive Timeline List */}
      <div className="rounded-xl border border-[#292a2b] bg-[#1b1c1d] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#908f9e] border-b border-[#292a2b] pb-3">
          <span>Recent Execution Jobs (Latest 5)</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Queue Empty • Ready for next trigger
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#292a2b]">
          {queueEvents.map((evt) => (
            <div key={evt.id} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#0d0e0f] border-2 border-[#5e6ad2] group-hover:scale-125 transition-transform" />

              <div className="rounded-lg border border-[#292a2b] bg-[#0d0e0f] p-4 space-y-2 hover:border-[#343536] transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-semibold text-[#e3e2e3]">{evt.title}</span>
                    <span className="text-[#908f9e]">•</span>
                    <span className="text-[#908f9e]">{evt.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#908f9e]">{evt.duration}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${evt.statusColor}`}>
                      {evt.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#908f9e] leading-relaxed">
                  {evt.description}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#908f9e] pt-1">
                  <span>Triggered by: {evt.author}</span>
                  <span className="text-[#bdc2ff]">Vercel Edge Ingress</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
