'use client';

import React from 'react';
import { X, Command, Sparkles, Terminal, Sliders, Layers, CornerDownLeft } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Actions' | 'Navigation' | 'Presets';
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['⌘', '↵'], description: 'Synthesize all 4 shipping artifacts via Gemini 2.5', category: 'Actions' },
  { keys: ['⌘', 'K'], description: 'Open interactive CLI and Terminal preview', category: 'Actions' },
  { keys: ['⌥', 'S'], description: 'Open Cockpit Configuration & API Keys drawer', category: 'Navigation' },
  { keys: ['⌥', '1'], description: 'Load AI Agent Pipeline preset (#142)', category: 'Presets' },
  { keys: ['⌥', '2'], description: 'Load Zero-OAuth Auth Flow preset (#143)', category: 'Presets' },
  { keys: ['⌥', '3'], description: 'Load Real-Time Telemetry preset (#144)', category: 'Presets' },
  { keys: ['?'], description: 'Toggle this keyboard shortcuts cheat sheet', category: 'Navigation' },
  { keys: ['Esc'], description: 'Dismiss any open modal, drawer, or notification', category: 'Navigation' },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const { isLight } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn"
    >
      <div
        className={`w-full max-w-md rounded-xl border p-5 shadow-2xl transition-all animate-view-transition ${
          isLight
            ? 'bg-white border-[#E6E6E4] text-[#18181B]'
            : 'bg-[#1b1c1d] border-[#292a2b] text-[#e3e2e3]'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                isLight ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-[#1f2021] text-[#5e6ad2] border-[#292a2b]'
              }`}
            >
              <Command className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-tight">Keyboard Shortcuts</h3>
              <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
                Engineered for speed • No-hands navigation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
              isLight ? 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100' : 'text-[#908f9e] hover:text-white hover:bg-[#292a2b]'
            }`}
            aria-label="Close shortcuts dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="py-3 space-y-2">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                isLight ? 'bg-[#FAFAFA] border-[#E6E6E4]' : 'bg-[#121315] border-[#292a2b]'
              }`}
            >
              <span className={`text-[11.5px] ${isLight ? 'text-zinc-700' : 'text-[#c6c5d5]'}`}>
                {item.description}
              </span>

              <div className="flex items-center gap-1 shrink-0 ml-3">
                {item.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className={`min-w-5 px-1.5 py-0.5 rounded text-center font-mono text-[10.5px] font-medium border shadow-2xs ${
                      isLight
                        ? 'bg-white border-[#E6E6E4] text-zinc-800'
                        : 'bg-[#1f2021] border-[#292a2b] text-[#bdc2ff]'
                    }`}
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className={`pt-3 border-t flex items-center justify-between text-[11px] font-mono ${
            isLight ? 'border-[#E6E6E4] text-zinc-500' : 'border-[#292a2b] text-[#908f9e]'
          }`}
        >
          <span>Press <kbd className="px-1 py-0.2 rounded border">?</kbd> anywhere to toggle</span>
          <button
            type="button"
            onClick={onClose}
            className={`px-2.5 py-1 rounded border text-xs font-medium cursor-pointer transition-colors ${
              isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200' : 'bg-[#292a2b] hover:bg-[#343536] text-white border-[#343536]'
            }`}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
