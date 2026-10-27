'use client';

import React from 'react';
import {
  ArrowLeft,
  Rocket,
  ShieldCheck,
  Server,
  Cpu,
  Globe,
  Radio,
  Clock,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

interface ReleaseMatrixViewProps {
  onBack: () => void;
}

export function ReleaseMatrixView({ onBack }: ReleaseMatrixViewProps) {
  const { isLight } = useTheme();

  const environments = [
    {
      name: 'Production Edge',
      status: 'Healthy (2ms)',
      statusColor: isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      region: 'Global Anycast (iad1, sfo1, cdg1, hnd1)',
      commit: '0x8efb34',
      uptime: '99.99%',
      tls: 'TLS 1.3 Strict',
      details: 'Active Vercel Edge runtime serving all public endpoints with sub-millisecond route resolution.',
    },
    {
      name: 'Preview Staging',
      status: 'Healthy (4ms)',
      statusColor: isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      region: 'iad1 (US-East)',
      commit: '0x8efb34 (v2.4.9-rc3)',
      uptime: '100.0%',
      tls: 'Automatic SSL',
      details: 'Automated staging environment validating Turbopack compilation and client Web Audio visualizer HUD.',
    },
    {
      name: 'Canary Deployment',
      status: 'Healthy (3ms)',
      statusColor: isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      region: 'Weighted Edge Split (10%)',
      commit: '0x8efb34',
      uptime: '99.98%',
      tls: 'Edge SSL',
      details: 'Streaming synthetic structured JSON outputs directly to pilot developer cockpits with zero-auth fallback enabled.',
    },
    {
      name: 'Edge Worker Pool',
      status: 'Healthy (1ms)',
      statusColor: isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      region: '12 Global Worker Nodes',
      commit: 'v2.4.9 Worker Daemon',
      uptime: '100.0%',
      tls: 'Mutual mTLS',
      details: 'Isolated memory sandbox running client-side Mermaid SVG exports and JSZip bundle compression in ~40ms.',
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
              <Rocket className={`h-4 w-4 ${isLight ? 'text-amber-600' : 'text-[#ffb867]'}`} />
              ShipSpeak Release Matrix &amp; Edge Deployments
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All 4 Environments Operational
          </span>
        </div>
      </div>

      {/* 4-Card Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {environments.map((env) => (
          <div
            key={env.name}
            className={`rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between gap-4 ${
              isLight
                ? 'bg-white border-[#E6E6E4] hover:border-zinc-300'
                : 'bg-[#1b1c1d] border-[#292a2b] hover:border-[#343536]'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                      isLight
                        ? 'bg-[#18181B] text-white border-[#18181B]'
                        : 'bg-[#0d0e0f] text-[#5e6ad2] border border-[#292a2b]'
                    }`}
                  >
                    <Server className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold tracking-tight ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>
                      {env.name}
                    </h3>
                    <p className={`text-[11px] font-mono ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>{env.region}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${env.statusColor}`}>
                  {env.status}
                </span>
              </div>

              <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-600' : 'text-[#c6c5d5]'}`}>{env.details}</p>

              <div
                className={`grid grid-cols-3 gap-2 rounded-lg p-2.5 font-mono text-[11px] border ${
                  isLight
                    ? 'bg-[#FAFAFA] border-[#E6E6E4] text-zinc-700'
                    : 'bg-[#0d0e0f] border border-[#292a2b] text-[#bdc2ff]'
                }`}
              >
                <div>
                  <span className={`text-[10px] block ${isLight ? 'text-zinc-400' : 'text-[#908f9e]'}`}>Commit</span>
                  <span className="font-medium truncate block">{env.commit}</span>
                </div>
                <div>
                  <span className={`text-[10px] block ${isLight ? 'text-zinc-400' : 'text-[#908f9e]'}`}>Uptime</span>
                  <span className="text-emerald-600 font-semibold">{env.uptime}</span>
                </div>
                <div>
                  <span className={`text-[10px] block ${isLight ? 'text-zinc-400' : 'text-[#908f9e]'}`}>Security</span>
                  <span className="font-medium truncate block">{env.tls}</span>
                </div>
              </div>
            </div>

            <div className={`flex items-center justify-between pt-3 border-t text-xs font-mono ${isLight ? 'border-[#E6E6E4] text-zinc-500' : 'border-[#292a2b] text-[#908f9e]'}`}>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Zero Downtime Edge Ingress</span>
              </span>
              <span className="text-[11px]">Next probe: 30s</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
