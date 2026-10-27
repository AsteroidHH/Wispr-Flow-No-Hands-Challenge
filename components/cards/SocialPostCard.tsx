'use client';

import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Hash,
  Loader2,
  MessageCircle,
  Repeat,
  Heart,
  BarChart2,
} from 'lucide-react';
import { SocialPostDeliverable } from '@/lib/types';
import { VoiceTweakInput } from '@/components/VoiceTweakInput';

function TwitterIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0-1.54 1.54 1.54 1.54 0 0 0 1.54 1.53 1.53 1.53 0 0 0 1.53-1.53c0-.85-.69-1.54-1.53-1.54m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

function ThreadsIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

interface SocialPostCardProps {
  data: SocialPostDeliverable;
  onTweak: (instruction: string) => void;
  isRefining?: boolean;
}

export function SocialPostCard({ data, onTweak, isRefining = false }: SocialPostCardProps) {
  const [platform, setPlatform] = useState<'twitter' | 'linkedin' | 'threads'>('twitter');
  const [copied, setCopied] = useState(false);

  const twitterContent = data.twitter?.content || data.rawPost || 'Shipped v2 of our autonomous agent pipeline 🚢✨\n\nNo more hardcoded tool routing or token race conditions. Swapped in dynamic vector matching + automatic backoff. Sub-agent latency dropped 42%.\n\nFull PR & teardown below 👇 #buildinpublic #devin';
  const hashtags = Array.isArray(data.twitter?.hashtags) ? data.twitter.hashtags.join(' ') : '#buildinpublic #devin';

  const linkedinHook = data.linkedin?.hook || 'Shipped v2 of our autonomous agent pipeline 🚢✨';
  const linkedinBody = data.linkedin?.body || 'We replaced brittle hardcoded tool routing with dynamic vector tool-match scoring and automatic backoff retries. Concurrent sub-agent latency dropped by 42%.';
  const takeaways = Array.isArray(data.linkedin?.takeaways) && data.linkedin.takeaways.length > 0
    ? data.linkedin.takeaways.map((t) => `• ${t}`).join('\n')
    : '• Vector tool score matcher in tools/registry.ts\n• Mitigates sub-agent token saturation concurrency lock\n• Anthropic & Gemini API 429 exponential backoff strategy';
  const callToAction = data.linkedin?.callToAction || 'Check out the full PR below and let me know your thoughts on vector-based routing!';

  const getCopyText = () => {
    if (platform === 'twitter') {
      return `${twitterContent}\n\n${hashtags}`;
    }
    if (platform === 'linkedin') {
      return `${linkedinHook}\n\n${linkedinBody}\n\nKey takeaways:\n${takeaways}\n\n${callToAction}`;
    }
    return `${twitterContent}\n\n${hashtags}`;
  };

  const currentText = platform === 'linkedin'
    ? `${linkedinHook}\n\n${linkedinBody}\n\n${takeaways}\n\n${callToAction}`
    : twitterContent;

  const charCount = platform === 'twitter' || platform === 'threads' ? currentText.length : 248;

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
        {/* Card Header: Title + Char Counter */}
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

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[#bdc2ff]">
              {charCount} / 280 chars
            </span>
          </div>
        </div>

        {/* STITCH CHANNEL SEGMENT TABS */}
        <div className="mt-3.5 flex items-center gap-1 bg-[#0d0e0f] p-1 rounded-lg border border-[#292a2b]">
          <button
            type="button"
            onClick={() => setPlatform('twitter')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
              platform === 'twitter'
                ? 'bg-[#1f2021] text-white font-medium border border-[#343536] shadow-xs'
                : 'text-[#908f9e] hover:text-[#e3e2e3]'
            }`}
          >
            <TwitterIcon className="h-3.5 w-3.5" />
            <span>X / Twitter</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform('linkedin')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
              platform === 'linkedin'
                ? 'bg-[#1f2021] text-white font-medium border border-[#343536] shadow-xs'
                : 'text-[#908f9e] hover:text-[#e3e2e3]'
            }`}
          >
            <LinkedinIcon className="h-3.5 w-3.5" />
            <span>LinkedIn</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform('threads')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
              platform === 'threads'
                ? 'bg-[#1f2021] text-white font-medium border border-[#343536] shadow-xs'
                : 'text-[#908f9e] hover:text-[#e3e2e3]'
            }`}
          >
            <ThreadsIcon className="h-3.5 w-3.5" />
            <span>Threads</span>
          </button>
        </div>

        {/* Card Content with Strict Equalized Height */}
        <div className="mt-3 flex-1 max-h-[300px] overflow-y-auto pr-1">
          <div className="rounded-lg bg-[#0d0e0f] p-3.5 border border-[#292a2b] space-y-3 font-sans text-xs text-[#e3e2e3] leading-relaxed">
            {platform === 'linkedin' ? (
              <div className="space-y-2">
                <p className="font-semibold text-white">{linkedinHook}</p>
                <p className="text-[#c6c5d5] whitespace-pre-line">{linkedinBody}</p>
                <div className="p-2.5 rounded bg-[#1b1c1d] border border-[#292a2b] font-mono text-[11px] text-[#bdc2ff] whitespace-pre-line">
                  {takeaways}
                </div>
                <p className="italic text-[#908f9e]">{callToAction}</p>
              </div>
            ) : (
              <div className="space-y-2.5 whitespace-pre-line select-text">
                <p>{twitterContent}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hashtags.split(' ').map((tag, idx) => (
                    <span key={idx} className="font-mono text-[11px] text-[#5e6ad2]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* STITCH SOCIAL METRICS MOCKUP PREVIEW */}
            <div className="pt-2.5 flex items-center justify-between text-[#908f9e] font-mono text-[11px] border-t border-[#292a2b]">
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>24</span>
              </span>
              <span className="flex items-center gap-1">
                <Repeat className="h-3 w-3" />
                <span>89</span>
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-rose-400/80" />
                <span>412</span>
              </span>
              <span className="flex items-center gap-1">
                <BarChart2 className="h-3 w-3 text-[#bdc2ff]" />
                <span>12.4K</span>
              </span>
            </div>
          </div>
        </div>

        {/* STITCH SOCIAL ACTION FOOTER */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#292a2b]">
          <span className="font-mono text-[11px] text-[#908f9e]">
            Target Tone: <strong className="text-[#e3e2e3] font-normal">Direct & Technical</strong>
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f2021] hover:bg-[#292a2b] text-[#e3e2e3] hover:text-white border border-[#292a2b] text-xs font-mono transition-colors shadow-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-[#bdc2ff]" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
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
