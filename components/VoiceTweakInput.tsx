'use client';

import React, { useState } from 'react';
import { Mic, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface VoiceTweakInputProps {
  cardName: string;
  onTweak: (instruction: string) => void;
  isRefining?: boolean;
  placeholder?: string;
}

export function VoiceTweakInput({
  cardName,
  onTweak,
  isRefining = false,
  placeholder = 'Hold Wispr to refine this card.'
}: VoiceTweakInputProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isRefining) return;

    const instruction = input.trim();
    onTweak(instruction);
    setFeedback(`Refining ${cardName}...`);
    setInput('');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleMicClick = () => {
    if (isRefining) return;
    setIsListening(prev => !prev);

    if (!isListening) {
      // Simulate voice input for instant demoing if user clicks mic
      const mockVoicePrompts = [
        'make the PR more concise',
        'add a Redis note to the architecture diagram',
        'shorten the video script hook to 15 seconds',
        'make the social post more provocative with metrics'
      ];
      const selected = mockVoicePrompts[Math.floor(Math.random() * mockVoicePrompts.length)];

      setTimeout(() => {
        setInput(selected);
        setIsListening(false);
      }, 1000);
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-neutral-800/80">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Subtle Mic Button */}
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isRefining}
          title="Hold Wispr to dictate refinement"
          className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all ${
            isListening
              ? 'border-red-500/60 bg-red-950/40 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
              : 'border-neutral-800 bg-neutral-900/90 text-neutral-400 hover:border-purple-500/50 hover:bg-neutral-800 hover:text-purple-300'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isListening && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
          <Mic className={`h-3.5 w-3.5 ${isListening ? 'animate-bounce text-red-400' : ''}`} />
        </button>

        {/* Subtle Input Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            disabled={isRefining}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRefining ? `Refining ${cardName}...` : placeholder}
            className="w-full rounded-lg border border-neutral-800/80 bg-neutral-950/70 px-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:border-indigo-500/60 focus:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 font-sans transition-all disabled:opacity-50"
          />
        </div>

        {/* Submit / Loading Button */}
        <button
          type="submit"
          disabled={!input.trim() || isRefining}
          className="flex h-8 items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 text-xs font-medium text-neutral-200 transition-colors hover:border-indigo-500/50 hover:bg-indigo-600 hover:text-white disabled:opacity-40 disabled:hover:bg-neutral-800 disabled:hover:border-neutral-700 disabled:cursor-not-allowed"
        >
          {isRefining ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
          ) : (
            <>
              <span className="text-[11px] hidden sm:inline">Refine</span>
              <ArrowRight className="h-3 w-3" />
            </>
          )}
        </button>
      </form>

      {/* Visual Feedback Line */}
      {(feedback || isRefining) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-purple-400 animate-fadeIn">
          {isRefining ? (
            <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
          ) : (
            <Sparkles className="h-3 w-3 text-purple-400" />
          )}
          <span>{isRefining ? `Gemini Flash refining ${cardName}...` : feedback}</span>
        </div>
      )}
    </div>
  );
}
