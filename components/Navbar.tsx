'use client';

import React from 'react';
import { Radio, Sparkles, ExternalLink } from 'lucide-react';

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
}

export function Navbar({
  badgeText = 'Built for the Wispr No Hand Challenge',
  githubUrl = 'https://github.com/AsteroidHH/Wispr-Flow-No-Hands-Challenge'
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-lg shadow-purple-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-neutral-950">
              <Radio className="h-5 w-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                Ship<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Speak</span>
              </span>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-indigo-400 border border-indigo-500/20">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Voice-first last-mile shipping engine for developers
            </p>
          </div>
        </div>

        {/* Center Badge: Wispr No Hand Challenge */}
        <div className="hidden md:flex items-center">
          <div className="group relative flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/30 px-3.5 py-1.5 text-xs font-medium text-purple-200 shadow-[0_0_15px_-3px_rgba(168,85,247,0.25)] transition-all hover:border-purple-500/50 hover:bg-purple-950/40">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500"></span>
            </span>
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span className="font-mono tracking-tight">{badgeText}</span>
          </div>
        </div>

        {/* Right Action: GitHub repo link & Audio status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-950/20 px-2.5 py-1 text-xs text-emerald-400 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Wispr Audio Link Active
          </div>

          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3.5 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
          >
            <GithubIcon className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
            <ExternalLink className="h-3 w-3 text-neutral-400" />
          </a>
        </div>
      </div>
    </header>
  );
}
