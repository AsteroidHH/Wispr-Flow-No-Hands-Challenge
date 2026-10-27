'use client';

import React from 'react';
import { Radio, GitBranch, ExternalLink, Archive, Loader2, Terminal } from 'lucide-react';

function GithubIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface NavbarProps {
  badgeText?: string;
  githubUrl?: string;
  onExportBundle?: () => void;
  isExportingBundle?: boolean;
  onOpenTerminal?: () => void;
}

export function Navbar({
  badgeText = 'Wispr Flow Challenge',
  githubUrl = 'https://github.com/AsteroidHH/Wispr-Flow-No-Hands-Challenge',
  onExportBundle,
  isExportingBundle = false,
  onOpenTerminal,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#0d0e0f]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo & Target Branch */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-100">
            <Radio className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex items-center gap-2.5">
            <div>
              <span className="text-sm font-semibold tracking-tight text-zinc-100">
                Ship<span className="text-indigo-400">Speak</span>
              </span>
            </div>
            {/* Subtle branch pill */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-mono text-zinc-400">
              <GitBranch className="h-3 w-3 text-indigo-400" />
              <span>main</span>
            </div>
          </div>
        </div>

        {/* Center Badge: Wispr Flow Challenge */}
        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span className="font-medium tracking-tight text-zinc-200">{badgeText}</span>
          </div>
        </div>

        {/* Right Actions: Terminal CLI, Export Bundle, GitHub repo link */}
        <div className="flex items-center gap-2">
          {/* Terminal CLI Toggle Button */}
          {onOpenTerminal && (
            <button
              type="button"
              onClick={onOpenTerminal}
              title="Open interactive terminal CLI preview"
              className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <Terminal className="h-3.5 w-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Terminal CLI</span>
            </button>
          )}

          {/* Export Artifacts Bundle Button */}
          {onExportBundle && (
            <button
              type="button"
              onClick={onExportBundle}
              disabled={isExportingBundle}
              title="Export complete deliverables bundle as ShipSpeak-deliverables.zip"
              className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
            >
              {isExportingBundle ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
              ) : (
                <Archive className="h-3.5 w-3.5 text-zinc-400" />
              )}
              <span className="hidden sm:inline">Export Bundle</span>
              <span className="rounded bg-white/[0.06] px-1 py-0.2 text-[9px] text-indigo-300 font-mono">ZIP</span>
            </button>
          )}

          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
            <ExternalLink className="h-3 w-3 text-zinc-400" />
          </a>
        </div>
      </div>
    </header>
  );
}
