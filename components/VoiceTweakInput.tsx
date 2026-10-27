'use client';

import React, { useState } from 'react';
import { Mic, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

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
  const { isLight } = useTheme();
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
    <div className={`pt-3 mt-auto border-t ${isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'}`}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Subtle Mic Button */}
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isRefining}
          title="Hold Wispr to dictate refinement"
          className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors cursor-pointer ${
            isListening
              ? 'border-rose-500/50 bg-rose-500/10 text-rose-500'
              : isLight
              ? 'border-[#E6E6E4] bg-white text-zinc-600 hover:text-black hover:bg-zinc-50 shadow-xs'
              : 'border-[#292a2b] bg-[#1f2021] text-[#908f9e] hover:text-[#e3e2e3] hover:bg-[#292a2b]'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isListening && (
            <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
            </span>
          )}
          <Mic className={`h-3.5 w-3.5 ${isListening ? 'animate-pulse text-rose-500' : isLight ? 'text-amber-600' : ''}`} />
        </button>

        {/* Quiet Integrated Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            disabled={isRefining}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRefining ? `Refining ${cardName}...` : placeholder}
            className={`w-full rounded-md border px-3 py-1.5 text-xs font-sans transition-colors focus:outline-none disabled:opacity-50 ${
              isLight
                ? 'bg-[#FAFAFA] border-[#E6E6E4] text-[#18181B] placeholder:text-zinc-400 focus:border-amber-600'
                : 'border-[#292a2b] bg-[#0d0e0f] text-[#e3e2e3] placeholder:text-[#908f9e] focus:border-[#5e6ad2]'
            }`}
          />
        </div>

        {/* Submit / Loading Button */}
        <button
          type="submit"
          disabled={!input.trim() || isRefining}
          className={`flex h-7 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
            isLight
              ? 'border-[#E6E6E4] bg-white text-zinc-700 hover:bg-zinc-50 shadow-xs'
              : 'border-[#292a2b] bg-[#1f2021] text-[#e3e2e3] hover:bg-[#292a2b] hover:text-white'
          }`}
        >
          {isRefining ? (
            <Loader2 className={`h-3 w-3 animate-spin ${isLight ? 'text-amber-600' : 'text-[#bdc2ff]'}`} />
          ) : (
            <>
              <span className="text-[11px]">Tweak</span>
              <ArrowRight className="h-3 w-3" />
            </>
          )}
        </button>
      </form>

      {/* Ephemeral Feedback */}
      {feedback && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-amber-700 font-mono animate-fadeIn">
          <Sparkles className="h-2.5 w-2.5 text-amber-600" />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}
