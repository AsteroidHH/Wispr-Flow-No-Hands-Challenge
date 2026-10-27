'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, Hash, Code2, Loader2 } from 'lucide-react';
import { SocialPostDeliverable } from '@/lib/types';
import { VoiceTweakInput } from '@/components/VoiceTweakInput';

function TwitterIcon({ className = 'h-3 w-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className = 'h-3 w-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0-1.54 1.54 1.54 1.54 0 0 0 1.54 1.53 1.53 1.53 0 0 0 1.53-1.53c0-.85-.69-1.54-1.53-1.54m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

interface SocialPostCardProps {
  data: SocialPostDeliverable;
  onTweak: (instruction: string) => void;
  isRefining?: boolean;
}

export function SocialPostCard({ data, onTweak, isRefining = false }: SocialPostCardProps) {
  const [platform, setPlatform] = useState<'twitter' | 'linkedin' | 'post'>('post');
  const [copied, setCopied] = useState(false);

  const getCopyText = () => {
    if (platform === 'twitter') {
      return `${data.twitter.content}\n\n${data.twitter.hashtags.join(' ')}`;
    }
    if (platform === 'linkedin') {
      return `${data.linkedin.hook}\n\n${data.linkedin.body}\n\nKey takeaways:\n${data.linkedin.takeaways.map(t => `• ${t}`).join('\n')}\n\n${data.linkedin.callToAction}`;
    }
    return data.rawPost || `${data.twitter.content}\n\n${data.twitter.hashtags.join(' ')}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCopyText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border bg-neutral-900/60 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 ${
        isRefining
          ? 'border-indigo-500/80 shadow-[0_0_25px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/50'
          : 'border-neutral-800 hover:border-neutral-700/80'
      }`}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {isRefining ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                Build-in-Public Post
                {isRefining && (
                  <span className="text-[10px] font-mono text-indigo-400 animate-pulse">
                    Refining...
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-neutral-400">Social reach & community update</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Platform Selector */}
            <div className="flex rounded-lg bg-neutral-950 p-0.5 border border-neutral-800">
              <button
                onClick={() => setPlatform('post')}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  platform === 'post'
                    ? 'bg-neutral-800 text-purple-300 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Code2 className="h-3 w-3" />
                <span>Hook & Post</span>
              </button>
              <button
                onClick={() => setPlatform('twitter')}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  platform === 'twitter'
                    ? 'bg-neutral-800 text-sky-300 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <TwitterIcon className="h-3 w-3 text-sky-400" />
                <span>X / Twitter</span>
              </button>
              <button
                onClick={() => setPlatform('linkedin')}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  platform === 'linkedin'
                    ? 'bg-neutral-800 text-blue-300 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <LinkedinIcon className="h-3 w-3 text-blue-400" />
                <span>LinkedIn</span>
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition-all ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="mt-4">
          {platform === 'post' ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-neutral-950/80 p-3.5 border border-neutral-800/80 font-sans text-xs text-neutral-200 whitespace-pre-line leading-relaxed max-h-[360px] overflow-y-auto">
                {data.rawPost || data.twitter.content}
              </div>
              <p className="text-[10px] font-mono text-neutral-500">
                Crafted with bullet points, engineering rational, and launch hashtags
              </p>
            </div>
          ) : platform === 'twitter' ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-neutral-950/80 p-3.5 border border-neutral-800/80 font-sans text-xs text-neutral-200 whitespace-pre-line leading-relaxed">
                {data.twitter.content}
              </div>

              {/* Character Count & Hashtags */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {data.twitter.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-0.5 rounded bg-sky-950/40 px-2 py-0.5 font-mono text-[10px] text-sky-400 border border-sky-500/20"
                    >
                      <Hash className="h-2.5 w-2.5" />
                      {tag.replace('#', '')}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 font-mono text-neutral-400">
                  <span>{data.twitter.charCount} / 280</span>
                  <div className="h-1.5 w-12 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className={`h-full ${
                        data.twitter.charCount > 280 ? 'bg-rose-500' : 'bg-sky-400'
                      }`}
                      style={{ width: `${Math.min(100, (data.twitter.charCount / 280) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              <div className="rounded-lg bg-neutral-950/80 p-3.5 border border-neutral-800/80 space-y-2.5">
                <div className="border-b border-neutral-800 pb-2">
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                    HOOK
                  </span>
                  <p className="text-xs font-semibold text-neutral-100 mt-0.5">
                    {data.linkedin.hook}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                    STORY
                  </span>
                  <p className="text-xs text-neutral-300 whitespace-pre-line mt-0.5 leading-relaxed">
                    {data.linkedin.body}
                  </p>
                </div>

                {data.linkedin.takeaways && data.linkedin.takeaways.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                      TAKEAWAYS
                    </span>
                    <ul className="mt-1 space-y-1">
                      {data.linkedin.takeaways.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs text-neutral-300">
                          <span className="text-blue-400 font-bold">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-neutral-800 pt-2">
                  <p className="text-xs font-medium text-blue-300 italic">
                    {data.linkedin.callToAction}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <VoiceTweakInput
        cardName="Social Post"
        onTweak={onTweak}
        isRefining={isRefining}
        placeholder="Hold Wispr to refine this card."
      />
    </div>
  );
}
