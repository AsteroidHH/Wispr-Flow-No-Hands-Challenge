'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal as TerminalIcon,
  Copy,
  Check,
  Play,
  RotateCcw,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface TerminalPreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LogEntry {
  type: 'input' | 'info' | 'audio' | 'ai' | 'success' | 'system';
  text: string;
  timestamp: string;
}

const INITIAL_LOGS: LogEntry[] = [
  {
    type: 'system',
    text: 'ShipSpeak CLI v1.0.0 — Voice-first last-mile shipping engine',
    timestamp: '10:41:00',
  },
  {
    type: 'system',
    text: 'Type "speak --listen" or click "Run Voice Pipeline" to simulate terminal workflow.',
    timestamp: '10:41:01',
  },
];

export function TerminalPreview({ isOpen, onClose }: TerminalPreviewProps) {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [inputValue, setInputValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const logsEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const npmCommand = 'npx shipspeak --voice';

  // Scroll to bottom on new logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const copyNpxCommand = async () => {
    try {
      await navigator.clipboard.writeText(npmCommand);
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const getTimestamp = () => {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  };

  const runSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);

    const ts = getTimestamp();

    // 1. Initial command
    setLogs((prev) => [
      ...prev,
      {
        type: 'input',
        text: 'shipspeak --listen',
        timestamp: ts,
      },
    ]);

    // 2. Step 1: Listening
    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          type: 'info',
          text: '🎙️  [WISPR-FLOW] Listening to Wispr Flow audio stream (hotkey active)...',
          timestamp: getTimestamp(),
        },
      ]);
    }, 600);

    // 3. Step 2: Audio capture
    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          type: 'audio',
          text: '📦  [BUFFER] Captured 48 seconds of developer audio (48s audio buffer finalized)',
          timestamp: getTimestamp(),
        },
      ]);
    }, 1500);

    // 4. Step 3: Gemini 2.5 Flash synthesis
    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          type: 'ai',
          text: '⚡  [AI-ENGINE] Synthesizing with Gemini 2.5 Flash (structured JSON schema)...',
          timestamp: getTimestamp(),
        },
      ]);
    }, 2400);

    // 5. Step 4: Generated PR & Mermaid
    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          type: 'success',
          text: '✨  [ARTIFACTS] Generated conventional commit: feat(auth): migrate to OAuth2 PKCE',
          timestamp: getTimestamp(),
        },
        {
          type: 'success',
          text: '📊  [ARTIFACTS] Compiled Mermaid architecture diagram: 7 nodes, 9 edges',
          timestamp: getTimestamp(),
        },
      ]);
    }, 3300);

    // 6. Step 5: Created branch and staged
    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          type: 'success',
          text: "🚀  [GIT] Created branch 'feature/auth-refactor' and staged PR template [Done in 3.4s]",
          timestamp: getTimestamp(),
        },
      ]);
      setIsRunning(false);
    }, 4200);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputValue.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === 'clear' || cmd === 'cls') {
      setLogs([]);
      setInputValue('');
      return;
    }

    if (
      cmd === 'speak --listen' ||
      cmd === 'shipspeak --listen' ||
      cmd === 'speak' ||
      cmd === 'shipspeak' ||
      cmd.includes('listen') ||
      cmd.includes('--voice')
    ) {
      setInputValue('');
      runSimulation();
      return;
    }

    // Default response for other commands
    setLogs((prev) => [
      ...prev,
      {
        type: 'input',
        text: inputValue,
        timestamp: getTimestamp(),
      },
      {
        type: 'system',
        text: `Command not recognized: "${inputValue}". Try: "speak --listen" or click "Run Voice Pipeline".`,
        timestamp: getTimestamp(),
      },
    ]);
    setInputValue('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-md animate-fadeIn">
      <div className="relative flex h-full max-h-[640px] w-full max-w-3xl flex-col rounded-2xl border border-neutral-800 bg-[#0c1017] shadow-2xl overflow-hidden font-mono text-xs">
        {/* macOS Style Window Titlebar */}
        <div className="flex h-10 items-center justify-between border-b border-neutral-800/80 bg-[#161b22] px-4 select-none">
          {/* Traffic Light Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-3 w-3 rounded-full bg-[#ff5f56] hover:opacity-80 transition-opacity"
              title="Close terminal"
            />
            <button
              type="button"
              className="h-3 w-3 rounded-full bg-[#ffbd2e] hover:opacity-80 transition-opacity"
              title="Minimize"
            />
            <button
              type="button"
              className="h-3 w-3 rounded-full bg-[#27c93f] hover:opacity-80 transition-opacity"
              title="Zoom"
            />
          </div>

          {/* Terminal Title */}
          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <TerminalIcon className="h-3.5 w-3.5 text-indigo-400" />
            <span>shipspeak-cli — bash — 80x24</span>
          </div>

          {/* Close X */}
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 bg-[#0f141d] px-4 py-2">
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={runSimulation}
              disabled={isRunning}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              <Play className="h-3 w-3" />
              <span>{isRunning ? 'Running Pipeline...' : 'Run shipspeak --listen'}</span>
            </button>

            <button
              type="button"
              onClick={() => setLogs(INITIAL_LOGS)}
              className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
              title="Reset terminal output"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* 1-Click NPM Copy Command */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-neutral-400 hidden sm:inline">Install & Run:</span>
            <button
              type="button"
              onClick={copyNpxCommand}
              title="Copy hypothetical CLI command to clipboard"
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-mono transition-all ${
                copiedCommand
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {copiedCommand ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 text-indigo-400" />
                  <span>{npmCommand}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Terminal Screen Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-neutral-300 font-mono text-[11px] leading-relaxed select-text">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 animate-fadeIn">
              <span className="text-neutral-600 select-none text-[10px] shrink-0 pt-0.5">
                {log.timestamp}
              </span>

              {log.type === 'input' && (
                <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="text-neutral-500">developer@macbook:~/project$</span>
                  <span>{log.text}</span>
                </div>
              )}

              {log.type === 'info' && (
                <span className="text-cyan-300 font-medium">{log.text}</span>
              )}

              {log.type === 'audio' && (
                <span className="text-purple-300 font-medium">{log.text}</span>
              )}

              {log.type === 'ai' && (
                <span className="text-indigo-300 font-medium">{log.text}</span>
              )}

              {log.type === 'success' && (
                <span className="text-emerald-400">{log.text}</span>
              )}

              {log.type === 'system' && (
                <span className="text-neutral-400 italic">{log.text}</span>
              )}
            </div>
          ))}

          {/* Active typing indicator if running */}
          {isRunning && (
            <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
              <span className="text-neutral-600 text-[10px]">Processing...</span>
              <span className="inline-block h-3.5 w-1.5 bg-indigo-400 animate-ping" />
            </div>
          )}

          <div ref={logsEndRef} />
        </div>

        {/* Terminal Input Bar */}
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2 border-t border-neutral-800/80 bg-[#0f141d] px-4 py-2.5"
        >
          <div className="flex items-center gap-1 text-emerald-400 font-bold shrink-0">
            <span>❯</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isRunning}
            placeholder='Type "speak --listen" or "clear"...'
            className="flex-1 bg-transparent text-xs font-mono text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isRunning}
            className="flex items-center gap-1 rounded bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-300 hover:bg-neutral-700 hover:text-white disabled:opacity-40 transition-colors"
          >
            <span>Enter</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </form>
      </div>
    </div>
  );
}
