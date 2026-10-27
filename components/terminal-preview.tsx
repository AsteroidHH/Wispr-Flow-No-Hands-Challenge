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
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Clear all pending timeouts on unmount or reset
  const clearSimulationTimers = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearSimulationTimers();
    };
  }, []);

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
        clearSimulationTimers();
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
    clearSimulationTimers();
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
    const t1 = setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          type: 'info',
          text: '🎙️  [WISPR-FLOW] Listening to Wispr Flow audio stream (hotkey active)...',
          timestamp: getTimestamp(),
        },
      ]);
    }, 600);
    timeoutsRef.current.push(t1);

    // 3. Step 2: Audio capture
    const t2 = setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          type: 'audio',
          text: '📦  [BUFFER] Captured 48 seconds of developer audio (48s audio buffer finalized)',
          timestamp: getTimestamp(),
        },
      ]);
    }, 1500);
    timeoutsRef.current.push(t2);

    // 4. Step 3: Gemini 2.5 Flash synthesis
    const t3 = setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          type: 'ai',
          text: '⚡  [AI-ENGINE] Synthesizing with Gemini 2.5 Flash (structured JSON schema)...',
          timestamp: getTimestamp(),
        },
      ]);
    }, 2400);
    timeoutsRef.current.push(t3);

    // 5. Step 4: Generated PR & Mermaid
    const t4 = setTimeout(() => {
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
    timeoutsRef.current.push(t4);

    // 6. Step 5: Created branch and staged
    const t5 = setTimeout(() => {
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
    timeoutsRef.current.push(t5);
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
      <div className="relative flex h-full max-h-[640px] w-full max-w-3xl flex-col rounded-xl border border-[#292a2b] bg-[#1b1c1d] shadow-2xl overflow-hidden font-mono text-xs">
        {/* macOS Style Window Titlebar */}
        <div className="flex h-10 items-center justify-between border-b border-[#292a2b] bg-[#121315] px-4 select-none">
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
          <div className="flex items-center gap-2 text-[#908f9e] text-xs">
            <TerminalIcon className="h-3.5 w-3.5 text-[#5e6ad2]" />
            <span>shipspeak-cli — bash — 80x24</span>
          </div>

          {/* Close X */}
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#908f9e] hover:bg-[#292a2b] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#292a2b] bg-[#121315] px-4 py-2">
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={runSimulation}
              disabled={isRunning}
              className="flex items-center gap-1.5 rounded-md bg-white hover:bg-neutral-200 text-[#0d0e0f] px-3 py-1 text-xs font-semibold shadow-sm disabled:opacity-50 transition-colors"
            >
              <Play className="h-3 w-3 text-[#5e6ad2]" />
              <span>{isRunning ? 'Running Pipeline...' : 'Run shipspeak --listen'}</span>
            </button>

            <button
              type="button"
              onClick={() => setLogs(INITIAL_LOGS)}
              className="flex items-center gap-1 rounded-md border border-[#292a2b] bg-[#1b1c1d] px-2.5 py-1 text-[#908f9e] hover:bg-[#292a2b] hover:text-[#e3e2e3] transition-colors"
              title="Reset terminal output"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* 1-Click NPM Copy Command */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#908f9e] hidden sm:inline">Install & Run:</span>
            <button
              type="button"
              onClick={copyNpxCommand}
              title="Copy hypothetical CLI command to clipboard"
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-mono transition-colors ${
                copiedCommand
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                  : 'border-[#292a2b] bg-[#1b1c1d] text-[#e3e2e3] hover:bg-[#292a2b]'
              }`}
            >
              {copiedCommand ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 text-[#bdc2ff]" />
                  <span>{npmCommand}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Terminal Screen Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-[#e3e2e3] font-mono text-[11px] leading-relaxed bg-[#0d0e0f] select-text">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 animate-fadeIn">
              <span className="text-neutral-600 select-none text-[10px] shrink-0 pt-0.5">
                {log.timestamp}
              </span>

              {log.type === 'input' && (
                <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="text-[#908f9e]">developer@macbook:~/project$</span>
                  <span>{log.text}</span>
                </div>
              )}

              {log.type === 'info' && (
                <span className="text-sky-300 font-medium">{log.text}</span>
              )}

              {log.type === 'audio' && (
                <span className="text-[#bdc2ff] font-medium">{log.text}</span>
              )}

              {log.type === 'ai' && (
                <span className="text-[#5e6ad2] font-medium">{log.text}</span>
              )}

              {log.type === 'success' && (
                <span className="text-emerald-400">{log.text}</span>
              )}

              {log.type === 'system' && (
                <span className="text-[#908f9e] italic">{log.text}</span>
              )}
            </div>
          ))}

          {/* Active typing indicator if running */}
          {isRunning && (
            <div className="flex items-center gap-2 text-[#5e6ad2] animate-pulse">
              <span className="text-[#908f9e] text-[10px]">Processing...</span>
              <span className="inline-block h-3.5 w-1.5 bg-[#5e6ad2] animate-ping" />
            </div>
          )}

          <div ref={logsEndRef} />
        </div>

        {/* Terminal Input Bar */}
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2 border-t border-[#292a2b] bg-[#121315] px-4 py-2.5"
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
            className="flex-1 bg-transparent text-xs font-mono text-[#e3e2e3] placeholder:text-[#908f9e]/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isRunning}
            className="flex items-center gap-1 rounded bg-[#1b1c1d] hover:bg-[#292a2b] px-2 py-0.5 text-[10px] text-[#e3e2e3] disabled:opacity-30 transition-colors"
          >
            <span>Enter</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </form>
      </div>
    </div>
  );
}
