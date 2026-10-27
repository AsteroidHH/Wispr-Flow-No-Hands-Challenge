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
    const twitterContent = data.twitter?.content || '';
    const hashtags = Array.isArray(data.twitter?.hashtags) ? data.twitter.hashtags.join(' ') : '#buildinpublic';
    const linkedinHook = data.linkedin?.hook || '';
    const linkedinBody = data.linkedin?.body || '';
    const takeaways = Array.isArray(data.linkedin?.takeaways) ? data.linkedin.takeaways.map(t => `• ${t}`).join('\n') : '';
    const callToAction = data.linkedin?.callToAction || '';

    if (platform === 'twitter') {
      return `${twitterContent}\n\n${hashtags}`;
    }
    if (platform === 'linkedin') {
      return `${linkedinHook}\n\n${linkedinBody}\n\nKey takeaways:\n${takeaways}\n\n${callToAction}`;
    }
    return data.rawPost || `${twitterContent}\n\n${hashtags}`;
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
      className={`flex flex-col h-full justify-between bg-[#1b1c1d] border rounded-xl p-5 transition-all shadow-sm overflow-hidden ${
        isRefining
          ? 'border-[#5e6ad2]/70 ring-1 ring-[#5e6ad2]/40 shadow-[#5e6ad2]/10'
          : 'border-[#292a2b] hover:border-[#343536]'
      }`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#292a2b]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1f2021] text-[#5e6ad2] border border-[#292a2b]">
              {isRefining ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#5e6ad2]" />
              ) : (
                <Share2 className="h-3.5 w-3.5 text-[#5e6ad2]" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#e3e2e3] tracking-tight flex items-center gap-2">
                Social Post Draft
                {isRefining && (
                  <span className="text-[10px] font-mono text-[#bdc2ff]">
                    Refining...
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#908f9e] mt-0.5">Engineering Announcement</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Platform Selector */}
            <div className="flex rounded-md bg-[#0d0e0f] p-0.5 border border-[#292a2b]">
              <button
                onClick={() => setPlatform('post')}
                className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  platform === 'post'
                    ? 'bg-[#1f2021] text-white shadow-xs border border-[#343536]'
                    : 'text-[#908f9e] hover:text-[#e3e2e3]'
                }`}
              >
                <Code2 className="h-3 w-3" />
                <span>Post</span>
              </button>
              <button
                onClick={() => setPlatform('twitter')}
                className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  platform === 'twitter'
                    ? 'bg-[#1f2021] text-white shadow-xs border border-[#343536]'
                    : 'text-[#908f9e] hover:text-[#e3e2e3]'
                }`}
              >
                <TwitterIcon className="h-3 w-3" />
                <span>X / Twitter</span>
              </button>
              <button
                onClick={() => setPlatform('linkedin')}
                className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  platform === 'linkedin'
                    ? 'bg-[#1f2021] text-white shadow-xs border border-[#343536]'
                    : 'text-[#908f9e] hover:text-[#e3e2e3]'
                }`}
              >
                <LinkedinIcon className="h-3 w-3" />
                <span>LinkedIn</span>
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              title="Copy post content"
              className="flex items-center p-1.5 rounded-md text-[#908f9e] hover:text-[#e3e2e3] bg-[#1f2021] hover:bg-[#292a2b] border border-[#292a2b] transition-colors text-xs"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Card Content with Strict Equalized Height */}
        <div className="mt-3.5 flex-1 max-h-[340px] overflow-y-auto pr-1">
          {platform === 'post' ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-[#0d0e0f] p-3.5 border border-[#292a2b] font-sans text-xs text-[#e3e2e3] whitespace-pre-line leading-relaxed">
                {data.rawPost || data.twitter?.content || 'No post content'}
              </div>
              <p className="text-[11px] text-[#908f9e]">
                Target Tone: Direct &amp; Technical • Launch hashtags included
              </p>
            </div>
          ) : platform === 'twitter' ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-[#0d0e0f] p-3.5 border border-[#292a2b] font-sans text-xs text-[#e3e2e3] whitespace-pre-line leading-relaxed">
                {data.twitter?.content || ''}
              </div>

              {/* Character Count & Hashtags */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(data.twitter?.hashtags || []).map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-0.5 rounded bg-[#0d0e0f] px-2 py-0.5 font-mono text-[10px] text-[#bdc2ff] border border-[#292a2b]"
                    >
                      <Hash className="h-2.5 w-2.5" />
                      {tag.replace('#', '')}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[#908f9e] text-xs">
                  <span>{data.twitter?.charCount || (data.twitter?.content || '').length} / 280</span>
                  <div className="h-1.5 w-12 rounded-full bg-[#0d0e0f] border border-[#292a2b] overflow-hidden">
                    <div
                      className={`h-full ${
                        (data.twitter?.charCount || 0) > 280 ? 'bg-rose-500' : 'bg-[#5e6ad2]'
                      }`}
                      style={{ width: `${Math.min(100, ((data.twitter?.charCount || 0) / 280) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg bg-[#0d0e0f] p-3.5 border border-[#292a2b] space-y-2.5">
                <div className="border-b border-[#292a2b] pb-2">
                  <span className="text-[10px] font-mono text-[#908f9e]">
                    Hook
                  </span>
                  <p className="text-xs font-semibold text-[#e3e2e3] mt-0.5">
                    {data.linkedin?.hook || ''}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#908f9e]">
                    Story
                  </span>
                  <p className="text-xs text-[#c6c5d5] whitespace-pre-line mt-0.5 leading-relaxed">
                    {data.linkedin?.body || ''}
                  </p>
                </div>

                {data.linkedin?.takeaways && data.linkedin.takeaways.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono text-[#908f9e]">
                      Takeaways
                    </span>
                    <ul className="mt-1 space-y-1">
                      {(data.linkedin.takeaways || []).map((t, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs text-[#e3e2e3]">
                          <span className="text-[#5e6ad2] font-bold">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-[#292a2b] pt-2">
                  <p className="text-xs font-medium text-[#bdc2ff] italic">
                    {data.linkedin?.callToAction || ''}
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
