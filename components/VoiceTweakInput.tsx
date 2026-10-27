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
    <div className="pt-3 mt-auto border-t border-white/[0.06]">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Subtle Mic Button */}
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isRefining}
          title="Hold Wispr to dictate refinement"
          className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors ${
            isListening
              ? 'border-rose-500/50 bg-rose-950/40 text-rose-300'
              : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08]'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isListening && (
            <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
            </span>
          )}
          <Mic className={`h-3.5 w-3.5 ${isListening ? 'animate-pulse text-rose-400' : ''}`} />
        </button>

        {/* Quiet Integrated Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            disabled={isRefining}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRefining ? `Refining ${cardName}...` : placeholder}
            className="w-full rounded-md border border-white/[0.08] bg-[#0a0b0d] px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 font-sans transition-colors disabled:opacity-50"
          />
        </div>

        {/* Submit / Loading Button */}
        <button
          type="submit"
          disabled={!input.trim() || isRefining}
          className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isRefining ? (
            <Loader2 className="h-3 w-3 animate-spin text-indigo-300" />
          ) : (
            <>
              <span className="text-[11px] hidden sm:inline">Refine</span>
              <ArrowRight className="h-3 w-3 text-zinc-400" />
            </>
          )}
        </button>
      </form>

      {/* Visual Feedback Line */}
      {(feedback || isRefining) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-indigo-300 animate-fadeIn">
          {isRefining ? (
            <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
          ) : (
            <Sparkles className="h-3 w-3 text-indigo-300" />
          )}
          <span>{isRefining ? `Refining ${cardName}...` : feedback}</span>
        </div>
      )}
    </div>
  );
}
