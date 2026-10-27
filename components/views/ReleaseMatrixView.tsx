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

interface ReleaseMatrixViewProps {
  onBack: () => void;
}

export function ReleaseMatrixView({ onBack }: ReleaseMatrixViewProps) {
  const environments = [
    {
      name: 'Production Edge',
      status: 'Healthy (2ms)',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      region: 'Global Anycast (iad1, sfo1, cdg1, hnd1)',
      commit: '0x8efb34',
      uptime: '99.99%',
      tls: 'TLS 1.3 Strict',
      details: 'Active Vercel Edge runtime serving all public endpoints with sub-millisecond route resolution.',
    },
    {
      name: 'Preview Staging',
      status: 'Healthy (4ms)',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      region: 'iad1 (US-East)',
      commit: '0x8efb34 (v2.4.9-rc3)',
      uptime: '100.0%',
      tls: 'Automatic SSL',
      details: 'Automated staging environment validating Turbopack compilation and client Web Audio visualizer HUD.',
    },
    {
      name: 'Canary Deployment',
      status: 'Healthy (3ms)',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      region: 'Weighted Edge Split (10%)',
      commit: '0x8efb34',
      uptime: '99.98%',
      tls: 'Edge SSL',
      details: 'Streaming synthetic structured JSON outputs directly to pilot developer cockpits with zero-auth fallback enabled.',
    },
    {
      name: 'Edge Worker Pool',
      status: 'Healthy (1ms)',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
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
              <Rocket className="h-4 w-4 text-[#ffb867]" />
              ShipSpeak Release Matrix & Edge Deployments
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#908f9e]">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All 4 Environments Operational
          </span>
        </div>
      </div>

      {/* 4-Card Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {environments.map((env) => (
          <div
            key={env.name}
            className="rounded-xl border border-[#292a2b] bg-[#1b1c1d] p-5 shadow-sm hover:border-[#343536] transition-all flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0d0e0f] text-[#5e6ad2] border border-[#292a2b]">
                    <Server className="h-4 w-4 text-[#bdc2ff]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#e3e2e3] tracking-tight">
                      {env.name}
                    </h3>
                    <span className="font-mono text-[11px] text-[#908f9e]">
                      {env.region}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${env.statusColor} flex items-center gap-1`}>
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  {env.status}
                </span>
              </div>

              <p className="text-xs text-[#908f9e] leading-relaxed">
                {env.details}
              </p>

              {/* Technical Metrics Metadata */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#292a2b] font-mono text-[11px]">
                <div className="rounded bg-[#0d0e0f] p-2 border border-[#292a2b]">
                  <span className="text-[#908f9e] block text-[10px]">Head Commit</span>
                  <span className="text-[#e3e2e3] font-medium truncate block">{env.commit}</span>
                </div>
                <div className="rounded bg-[#0d0e0f] p-2 border border-[#292a2b]">
                  <span className="text-[#908f9e] block text-[10px]">Uptime SLA</span>
                  <span className="text-emerald-400 font-medium block">{env.uptime}</span>
                </div>
                <div className="rounded bg-[#0d0e0f] p-2 border border-[#292a2b]">
                  <span className="text-[#908f9e] block text-[10px]">Security</span>
                  <span className="text-[#bdc2ff] font-medium block">{env.tls}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#908f9e] pt-2 border-t border-[#292a2b]">
              <span>Last health ping: 3s ago</span>
              <span className="text-[#bdc2ff]">Zero-Downtime Live</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
