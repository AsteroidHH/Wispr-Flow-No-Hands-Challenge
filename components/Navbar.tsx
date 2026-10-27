'use client';

import React from 'react';
import {
  Radio,
  GitBranch,
  ChevronDown,
  Search,
  BookOpen,
  Bell,
  Download,
  Archive,
  Loader2,
  Terminal,
  User,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';
import { ToolingTab } from './ToolingDrawer';
import { useTheme } from '@/lib/ThemeContext';

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
  const { theme, toggleTheme, isLight } = useTheme();

  return (
    <header
      className={`sticky top-0 z-50 h-14 w-full transition-colors ${
        isLight
          ? 'bg-white/90 backdrop-blur-md border-b border-[#E6E6E4] text-[#18181B]'
          : 'bg-[#121315]/95 backdrop-blur-xl border-b border-[#292a2b] text-[#e3e2e3] shadow-[0_1px_8px_rgba(0,0,0,0.6)]'
      } flex items-center justify-between px-3 sm:px-5`}
    >
      {/* Left: Brand & Engine Meta */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`lg:hidden p-1.5 rounded transition-colors cursor-pointer ${
            isLight
              ? 'text-zinc-600 hover:bg-zinc-100 hover:text-[#18181B]'
              : 'text-[#908f9e] hover:bg-[#1f2021] hover:text-[#e3e2e3]'
          }`}
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Logo matching Stitch */}
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-md shadow-xs transition-colors ${
            isLight
              ? 'bg-[#18181B] text-amber-500'
              : 'border border-[#292a2b] bg-[#1b1c1d] text-[#5e6ad2]'
          }`}
        >
          <Radio className="h-4 w-4" />
        </div>

        {/* Title */}
        <div className="flex items-center gap-1.5">
          <span
            className={`text-sm font-semibold tracking-tight ${
              isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'
            }`}
          >
            Ship<span className={isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}>Speak</span>
          </span>
        </div>

        <div className={`hidden sm:block h-4 w-[1px] mx-0.5 ${isLight ? 'bg-[#E6E6E4]' : 'bg-[#292a2b]'}`} />

        {/* Core Engine Selector */}
        <button
          type="button"
          onClick={() => onOpenTooling?.('settings')}
          title="Configure Core Engine Settings"
          className={`hidden md:flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
            isLight
              ? 'text-zinc-600 hover:text-[#18181B] hover:bg-zinc-100'
              : 'bg-[#1b1c1d] hover:bg-[#1f2021] text-[#908f9e] hover:text-[#e3e2e3] font-mono border border-[#292a2b]'
          }`}
        >
          <span>Core Engine</span>
          <ChevronDown className={`h-3 w-3 ${isLight ? 'text-zinc-400' : 'text-[#908f9e]'}`} />
        </button>

        {/* Git Branch & Sync Pill */}
        <a
          href="https://github.com/AsteroidHH/Wispr-Flow-No-Hands-Challenge/tree/main"
          target="_blank"
          rel="noopener noreferrer"
          className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-colors ${
            isLight
              ? 'bg-[#F4F4F5] border border-[#E6E6E4] text-zinc-600 hover:text-[#18181B]'
              : 'bg-[#0d0e0f] border border-[#292a2b] text-[#908f9e] hover:text-white'
          }`}
          title="View main branch on GitHub"
        >
          <GitBranch className={`h-3 w-3 ${isLight ? 'text-amber-600' : 'text-[#bdc2ff]'}`} />
          <span className={`font-medium ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>main</span>
          <span className={isLight ? 'text-zinc-300' : 'text-zinc-600'}>•</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            In Sync
          </span>
        </a>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-xs md:max-w-md mx-2 sm:mx-4">
        <button
          type="button"
          onClick={onOpenTerminal}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border transition-all text-xs cursor-pointer shadow-xs ${
            isLight
              ? 'border-[#E6E6E4] bg-[#FAFAFA] hover:bg-white text-zinc-500 hover:text-zinc-700'
              : 'border-[#292a2b] bg-[#0d0e0f] hover:bg-[#1b1c1d] text-[#908f9e] hover:text-[#e3e2e3] font-mono'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Search className={`h-3.5 w-3.5 shrink-0 ${isLight ? 'text-zinc-400' : 'text-[#908f9e]'}`} />
            <span className="truncate hidden sm:inline">Search issues, releases, commands...</span>
            <span className="truncate sm:hidden">Search CLI...</span>
          </div>
          <kbd
            className={`hidden sm:inline-block px-1.5 py-0.5 rounded font-mono text-[10px] font-medium border ${
              isLight
                ? 'bg-zinc-100 border-[#E6E6E4] text-zinc-600'
                : 'bg-[#1f2021] border-[#292a2b] text-[#e3e2e3]'
            }`}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Docs, Theme, Actions, User */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Docs Link */}
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`hidden md:flex items-center gap-1 text-xs transition-colors px-2 py-1 rounded ${
            isLight
              ? 'text-zinc-600 hover:text-[#18181B] hover:bg-zinc-100'
              : 'text-[#908f9e] hover:text-[#e3e2e3] hover:bg-[#1b1c1d]'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Docs</span>
        </a>

        {/* Notifications / Telemetry trigger */}
        <button
          type="button"
          onClick={() => onOpenTooling?.('telemetry')}
          title="Notifications & Telemetry Feed"
          className={`relative p-1.5 rounded transition-colors cursor-pointer ${
            isLight
              ? 'text-zinc-500 hover:text-[#18181B] hover:bg-zinc-100'
              : 'text-[#908f9e] hover:bg-[#1f2021] hover:text-[#e3e2e3]'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span
            className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
              isLight ? 'bg-amber-500' : 'bg-[#5e6ad2]'
            }`}
          />
        </button>

        {/* Stitch Theme Switcher (Editorial Light ⟷ Obsidian Dark) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${isLight ? 'Obsidian Dark' : 'Editorial Light'} theme`}
          className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-medium transition-colors cursor-pointer shadow-xs ${
            isLight
              ? 'border-[#E6E6E4] bg-white hover:bg-zinc-50 text-zinc-700'
              : 'border-[#292a2b] bg-[#1f2021] hover:bg-[#292a2b] text-[#e3e2e3]'
          }`}
        >
          {isLight ? (
            <Sun className="h-3.5 w-3.5 text-amber-600" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-[#5e6ad2]" />
          )}
          <span className="hidden sm:inline font-mono text-[11px]">
            {isLight ? 'Editorial' : 'Obsidian'}
          </span>
        </button>

        <div className={`h-4 w-[1px] mx-0.5 ${isLight ? 'bg-[#E6E6E4]' : 'bg-[#292a2b]'}`} />

        {/* Terminal CLI Toggle */}
        {onOpenTerminal && (
          <button
            type="button"
            onClick={onOpenTerminal}
            title="Open interactive terminal CLI preview"
            className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-mono transition-colors cursor-pointer shadow-xs ${
              isLight
                ? 'border-[#E6E6E4] bg-white hover:bg-zinc-50 text-zinc-700'
                : 'border-[#292a2b] bg-[#1f2021] hover:bg-[#292a2b] text-[#e3e2e3]'
            }`}
          >
            <span className={`font-bold ${isLight ? 'text-amber-600' : 'text-[#bdc2ff]'}`}>&gt;_</span>
            <span>CLI</span>
          </button>
        )}

        {/* Export Artifacts Bundle */}
        {onExportBundle && (
          <button
            type="button"
            onClick={onExportBundle}
            disabled={isExportingBundle}
            title="Export complete deliverables bundle as ShipSpeak-deliverables.zip"
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer shadow-xs ${
              isLight
                ? 'border-[#E6E6E4] bg-white hover:bg-zinc-50 text-zinc-700'
                : 'border-[#292a2b] bg-[#1f2021] hover:bg-[#292a2b] text-[#e3e2e3]'
            }`}
          >
            {isExportingBundle ? (
              <Loader2 className={`h-3.5 w-3.5 animate-spin ${isLight ? 'text-amber-600' : 'text-[#bdc2ff]'}`} />
            ) : (
              <Download className={`h-3.5 w-3.5 ${isLight ? 'text-zinc-500' : 'text-[#bdc2ff]'}`} />
            )}
            <span className="hidden md:inline">Export ZIP</span>
          </button>
        )}

        {/* User Avatar Circle matching Stitch */}
        <button
          type="button"
          onClick={() => onOpenTooling?.('api-keys')}
          title="Manage API Keys & Profile"
          className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-[11px] shadow-xs cursor-pointer transition-transform hover:scale-105 ${
            isLight
              ? 'bg-zinc-800 text-white ring-1 ring-[#E6E6E4]'
              : 'bg-[#5e6ad2]/20 border border-[#5e6ad2]/40 text-[#bdc2ff]'
          }`}
        >
          JS
        </button>
      </div>
    </header>
  );
}
