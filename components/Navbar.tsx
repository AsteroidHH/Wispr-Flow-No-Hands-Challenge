'use client';

import React from 'react';
import {
  Radio,
  GitBranch,
  ChevronDown,
  Search,
  BookOpen,
  Bell,
  Archive,
  Loader2,
  Terminal,
  User,
  Menu,
} from 'lucide-react';
import { ToolingTab } from './ToolingDrawer';

interface NavbarProps {
  badgeText?: string;
  githubUrl?: string;
  onExportBundle?: () => void;
  isExportingBundle?: boolean;
  onOpenTerminal?: () => void;
  onToggleSidebar?: () => void;
  onOpenTooling?: (tab: ToolingTab) => void;
}

export function Navbar({
  badgeText = 'Wispr Flow Challenge',
  githubUrl = 'https://github.com/AsteroidHH/Wispr-Flow-No-Hands-Challenge',
  onExportBundle,
  isExportingBundle = false,
  onOpenTerminal,
  onToggleSidebar,
  onOpenTooling,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 h-14 w-full bg-[#121315]/95 backdrop-blur-xl border-b border-[#292a2b] shadow-[0_1px_8px_rgba(0,0,0,0.6)] flex items-center justify-between px-3 sm:px-5">
      {/* Left: Brand & Engine Meta */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded text-[#908f9e] hover:bg-[#1f2021] hover:text-[#e3e2e3] cursor-pointer"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Logo */}
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-[#292a2b] bg-[#1b1c1d] text-[#e3e2e3]">
          <Radio className="h-4 w-4 text-[#5e6ad2]" />
        </div>

        {/* Title */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-[#e3e2e3]">
            Ship<span className="text-[#5e6ad2]">Speak</span>
          </span>
        </div>

        <div className="hidden sm:block h-4 w-[1px] bg-[#292a2b]" />

        {/* Core Engine Selector */}
        <button
          type="button"
          onClick={() => onOpenTooling?.('settings')}
          title="Configure Core Engine Settings"
          className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-[#1b1c1d] hover:bg-[#1f2021] text-[#908f9e] hover:text-[#e3e2e3] transition-colors text-[11px] font-mono border border-[#292a2b] cursor-pointer"
        >
          <span>Core Engine</span>
          <ChevronDown className="h-3 w-3 text-[#908f9e]" />
        </button>

        {/* Git Branch Pill */}
        <a
          href="https://github.com/AsteroidHH/Wispr-Flow-No-Hands-Challenge/tree/main"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-[#0d0e0f] text-[#908f9e] hover:text-white border border-[#292a2b] text-[11px] font-mono transition-colors"
          title="View main branch on GitHub"
        >
          <GitBranch className="h-3 w-3 text-[#bdc2ff]" />
          <span className="text-[#e3e2e3] font-medium">main</span>
        </a>

        {/* GitHub In Sync */}
        <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0d0e0f] text-[#908f9e] border border-[#292a2b] text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-pulse"></span>
          <span>GitHub In Sync</span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-xs md:max-w-md mx-2 sm:mx-4">
        <button
          type="button"
          onClick={onOpenTerminal}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0d0e0f] hover:bg-[#1b1c1d] text-[#908f9e] hover:text-[#e3e2e3] border border-[#292a2b] transition-colors text-xs font-mono cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 shrink-0 text-[#908f9e]" />
            <span className="truncate hidden sm:inline">Search issues, releases, commands...</span>
            <span className="truncate sm:hidden">Search CLI...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#1f2021] text-[#e3e2e3] text-[10px] border border-[#292a2b]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Docs, Actions, User */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Docs Link */}
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1 text-xs text-[#908f9e] hover:text-[#e3e2e3] transition-colors px-2 py-1 rounded hover:bg-[#1b1c1d]"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Docs</span>
        </a>

        {/* Notifications / Telemetry trigger */}
        <button
          type="button"
          onClick={() => onOpenTooling?.('telemetry')}
          title="Notifications & Telemetry Feed"
          className="relative p-1.5 rounded text-[#908f9e] hover:bg-[#1f2021] hover:text-[#e3e2e3] transition-colors cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#5e6ad2] rounded-full" />
        </button>

        <div className="h-4 w-[1px] bg-[#292a2b]" />

        {/* Terminal CLI Toggle */}
        {onOpenTerminal && (
          <button
            type="button"
            onClick={onOpenTerminal}
            title="Open interactive terminal CLI preview"
            className="hidden sm:flex items-center gap-1.5 rounded-md border border-[#292a2b] bg-[#1f2021] px-2.5 py-1 text-xs font-medium text-[#e3e2e3] transition-colors hover:bg-[#292a2b] cursor-pointer"
          >
            <Terminal className="h-3.5 w-3.5 text-[#bdc2ff]" />
            <span>&gt;_ CLI</span>
          </button>
        )}

        {/* Export Artifacts Bundle */}
        {onExportBundle && (
          <button
            type="button"
            onClick={onExportBundle}
            disabled={isExportingBundle}
            title="Export complete deliverables bundle as ShipSpeak-deliverables.zip"
            className="flex items-center gap-1.5 rounded-md border border-[#292a2b] bg-[#1f2021] px-2.5 py-1 text-xs font-medium text-[#e3e2e3] transition-colors hover:bg-[#292a2b] disabled:opacity-50 cursor-pointer"
          >
            {isExportingBundle ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#bdc2ff]" />
            ) : (
              <Archive className="h-3.5 w-3.5 text-[#bdc2ff]" />
            )}
            <span className="hidden md:inline">Export</span>
            <span className="rounded bg-[#0d0e0f] px-1 py-0.2 text-[9px] text-[#bdc2ff] font-mono border border-[#292a2b]">
              ZIP
            </span>
          </button>
        )}

        {/* User Avatar / API Keys Trigger */}
        <button
          type="button"
          onClick={() => onOpenTooling?.('api-keys')}
          title="Manage API Keys & Profile"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#5e6ad2]/20 border border-[#5e6ad2]/40 flex items-center justify-center text-[#bdc2ff] hover:border-[#bdc2ff] transition-colors shrink-0 cursor-pointer"
        >
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
