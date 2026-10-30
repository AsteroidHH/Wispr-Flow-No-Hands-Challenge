'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  Copy,
  Check,
  Loader2,
  MessageCircle,
  Repeat,
  Heart,
  BarChart2,
  ExternalLink,
} from 'lucide-react';
import { SocialPostDeliverable } from '@/lib/types';
import { VoiceTweakInput } from '@/components/VoiceTweakInput';
import { useTheme } from '@/lib/ThemeContext';

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
  const { isLight } = useTheme();
  const [platform, setPlatform] = useState<'twitter' | 'linkedin' | 'threads'>('twitter');
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up copy timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  // Safe extraction with trimmed text and fallbacks
  const rawTwitter = typeof data?.twitter?.content === 'string' ? data.twitter.content.trim() : '';
  const rawPost = typeof data?.rawPost === 'string' ? data.rawPost.trim() : '';
  const defaultTwitter = 'Autonomous LLM agents choke when you pass 40+ tool schemas every call.\n\nJust shipped vector-based sub-agent tool routing with HNSW cosine search. Cut context overhead by 68% and eliminated 429 exhaustion.';
  const twitterContent = rawTwitter || rawPost || defaultTwitter;

  // Robust hashtag tokenizer: handles arrays, strings, consecutive spaces, trailing punctuation, nulls
  const rawHashtags = Array.isArray(data?.twitter?.hashtags)
    ? data.twitter.hashtags
    : typeof data?.twitter?.hashtags === 'string'
    ? [data.twitter.hashtags]
    : data?.twitter?.hashtags === undefined && !data?.rawPost
    ? ['#buildinpublic', '#devin', '#ShipSpeak']
    : [];

  const tokenizedHashtags = rawHashtags
    .flatMap((item) => (typeof item === 'string' ? item.split(/\s+/) : []))
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => {
      // Strip leading #'s and trailing punctuation (commas, periods, semicolons, colons, exclamation marks)
      const cleaned = tag.replace(/^[#]+/, '').replace(/[,.;:!?]+$/, '');
      return cleaned ? `#${cleaned}` : '';
    })
    .filter(Boolean);

  const hashtagsString = tokenizedHashtags.join(' ');

  // Safe LinkedIn fields
  const linkedinHook = (typeof data?.linkedin?.hook === 'string' && data.linkedin.hook.trim())
    || 'Shipped v2 of our autonomous agent pipeline 🚢✨';
  const linkedinBody = (typeof data?.linkedin?.body === 'string' && data.linkedin.body.trim())
    || 'We replaced brittle hardcoded tool routing with dynamic vector tool-match scoring and automatic backoff retries. Concurrent sub-agent latency dropped by 42%.';

  const rawTakeaways = Array.isArray(data?.linkedin?.takeaways) ? data.linkedin.takeaways : [];
  const validTakeaways = rawTakeaways
    .map((t) => (typeof t === 'string' ? t.trim() : ''))
    .filter(Boolean);
  const takeaways = validTakeaways.length > 0
    ? validTakeaways.map((t) => `• ${t}`).join('\n')
    : '• Vector tool score matcher in tools/registry.ts\n• Mitigates sub-agent token saturation concurrency lock\n• Anthropic & Gemini API 429 exponential backoff strategy';

  const callToAction = (typeof data?.linkedin?.callToAction === 'string' && data.linkedin.callToAction.trim())
    || 'Check out the full PR below and let me know your thoughts on vector-based routing!';

  const getCopyText = () => {
    if (platform === 'twitter' || platform === 'threads') {
      return hashtagsString ? `${twitterContent}\n\n${hashtagsString}` : twitterContent;
    }
    if (platform === 'linkedin') {
      const parts = [linkedinHook, linkedinBody, `Key takeaways:\n${takeaways}`, callToAction].filter(Boolean);
      return parts.join('\n\n');
    }
    return twitterContent;
  };

  const currentText = platform === 'linkedin'
    ? [linkedinHook, linkedinBody, takeaways, callToAction].filter(Boolean).join('\n\n')
    : (hashtagsString ? `${twitterContent}\n\n${hashtagsString}` : twitterContent);

  // Platform limits: Twitter 280, Threads 500, LinkedIn 3000
  const maxChars = platform === 'twitter' ? 280 : platform === 'threads' ? 500 : 3000;
  const charCount = (currentText || '').length;
  const isOverLimit = charCount > maxChars;

  const handleCopy = async () => {
    try {
      const textToCopy = getCopyText();
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(textToCopy);
      } else if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div
      className={`flex flex-col h-[340px] xl:h-[360px] rounded-xl p-3.5 justify-between shadow-xs overflow-hidden border transition-all ${
        isLight
          ? isRefining
            ? 'bg-white border-amber-500/70 ring-1 ring-amber-500/40'
            : 'bg-white border-[#E6E6E4] hover:border-zinc-300'
          : isRefining
          ? 'bg-[#1b1c1d] border-[#5e6ad2]/70 ring-1 ring-[#5e6ad2]/40 shadow-[#5e6ad2]/10'
          : 'bg-[#1b1c1d] border-[#292a2b] hover:border-[#343536]'
      }`}
    >
      {/* Card Header matching Stitch */}
      <div
        className={`flex items-center justify-between pb-2 border-b shrink-0 ${
          isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`flex h-6.5 w-6.5 items-center justify-center rounded-lg border shrink-0 ${
              isLight
                ? 'bg-[#18181B] text-amber-500 border-[#18181B]'
                : 'bg-[#1f2021] text-[#5e6ad2] border border-[#292a2b]'
            }`}
          >
            {isRefining ? (
              <Loader2 className={`h-3 w-3 animate-spin ${isLight ? 'text-amber-500' : 'text-[#5e6ad2]'}`} />
            ) : (
              <Share2 className="h-3 w-3" />
            )}
          </div>
          <div className="min-w-0 truncate">
            <h3
              className={`text-xs font-semibold tracking-tight truncate flex items-center gap-1.5 ${
                isLight ? 'text-zinc-900' : 'text-[#e3e2e3]'
              }`}
            >
              <span>Social Post Draft</span>
              {isRefining && (
                <span className={`text-[9px] font-mono shrink-0 ${isLight ? 'text-amber-600' : 'text-[#bdc2ff]'}`}>
                  Refining...
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className={`w-12 h-1.5 rounded-full overflow-hidden border ${isLight ? 'bg-zinc-100 border-[#E6E6E4]' : 'bg-[#0d0e0f] border-[#292a2b]'}`}>
              <div
                style={{ width: `${Math.min(100, (charCount / maxChars) * 100)}%` }}
                className={`h-full transition-all duration-200 ${
                  isOverLimit
                    ? 'bg-rose-500'
                    : charCount / maxChars > 0.85
                    ? 'bg-amber-500'
                    : isLight
                    ? 'bg-emerald-600'
                    : 'bg-[#5e6ad2]'
                }`}
              />
            </div>
            <span
              className={`font-mono text-[9.5px] transition-colors ${
                isOverLimit
                  ? 'text-rose-500 font-semibold'
                  : isLight
                  ? 'text-zinc-500'
                  : 'text-[#bdc2ff]'
              }`}
            >
              {charCount} / {maxChars}
            </span>
          </div>
        </div>
      </div>

      {/* STITCH CHANNEL SEGMENT TABS */}
      <div
        className={`mt-2 flex items-center gap-1 p-0.5 rounded-lg border shrink-0 ${
          isLight
            ? 'bg-[#F4F4F5] border-[#E6E6E4]'
            : 'bg-[#0d0e0f] border border-[#292a2b]'
        }`}
      >
        <button
          type="button"
          onClick={() => setPlatform('twitter')}
          className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
            platform === 'twitter'
              ? isLight
                ? 'bg-white text-[#18181B] font-medium border border-[#E6E6E4] shadow-xs'
                : 'bg-[#1f2021] text-white font-medium border border-[#343536] shadow-xs'
              : isLight
              ? 'text-zinc-500 hover:text-zinc-800'
              : 'text-[#908f9e] hover:text-[#e3e2e3]'
          }`}
        >
          <TwitterIcon className="h-3 w-3" />
          <span>X / Twitter</span>
        </button>

        <button
          type="button"
          onClick={() => setPlatform('linkedin')}
          className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
            platform === 'linkedin'
              ? isLight
                ? 'bg-white text-[#18181B] font-medium border border-[#E6E6E4] shadow-xs'
                : 'bg-[#1f2021] text-white font-medium border border-[#343536] shadow-xs'
              : isLight
              ? 'text-zinc-500 hover:text-zinc-800'
              : 'text-[#908f9e] hover:text-[#e3e2e3]'
          }`}
        >
          <LinkedinIcon className="h-3 w-3" />
          <span>LinkedIn</span>
        </button>

        <button
          type="button"
          onClick={() => setPlatform('threads')}
          className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
            platform === 'threads'
              ? isLight
                ? 'bg-white text-[#18181B] font-medium border border-[#E6E6E4] shadow-xs'
                : 'bg-[#1f2021] text-white font-medium border border-[#343536] shadow-xs'
              : isLight
              ? 'text-zinc-500 hover:text-zinc-800'
              : 'text-[#908f9e] hover:text-[#e3e2e3]'
          }`}
        >
          <ThreadsIcon className="h-3 w-3" />
          <span>Threads</span>
        </button>
      </div>

      {/* Card Content with Formatted Post Copy Box matching Stitch */}
      <div className="flex-1 overflow-y-auto pr-1.5 my-2 text-xs space-y-2 [scrollbar-width:thin]">
        <div
          className={`rounded-lg p-2.5 border space-y-2 font-sans text-xs leading-relaxed break-words ${
            isLight
              ? 'bg-[#FAFAFA] border-[#E6E6E4] text-zinc-700'
              : 'bg-[#0d0e0f] border-[#292a2b] text-[#e3e2e3]'
          }`}
        >
          {platform === 'linkedin' ? (
            <div className="space-y-2">
              <p className={`font-semibold break-words ${isLight ? 'text-[#18181B]' : 'text-white'}`}>{linkedinHook}</p>
              <p className={`whitespace-pre-line break-words ${isLight ? 'text-zinc-600' : 'text-[#c6c5d5]'}`}>{linkedinBody}</p>
              <div
                className={`p-2 rounded border font-mono text-[11px] whitespace-pre-line break-words ${
                  isLight
                    ? 'bg-white border-[#E6E6E4] text-zinc-700'
                    : 'bg-[#1b1c1d] border-[#292a2b] text-[#bdc2ff]'
                }`}
              >
                {takeaways}
              </div>
              <p className={`italic break-words ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>{callToAction}</p>
            </div>
          ) : (
            <div className="space-y-2 whitespace-pre-line select-text break-words">
              <p className={`font-medium break-words ${isLight ? 'text-[#18181B]' : 'text-white'}`}>{twitterContent}</p>
              {tokenizedHashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {tokenizedHashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`font-mono text-[10px] font-medium ${
                        isLight ? 'text-amber-800' : 'text-[#5e6ad2]'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STITCH SOCIAL METRICS MOCKUP PREVIEW */}
          <div
            className={`pt-2 flex items-center justify-between font-mono text-[10.5px] border-t ${
              isLight
                ? 'text-zinc-400 border-[#E6E6E4]'
                : 'text-[#908f9e] border-[#292a2b]'
            }`}
          >
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>24</span>
            </span>
            <span className="flex items-center gap-1">
              <Repeat className="h-3 w-3" />
              <span>89</span>
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-rose-500" />
              <span>412</span>
            </span>
            <span className="flex items-center gap-1">
              <BarChart2 className={`h-3 w-3 ${isLight ? 'text-amber-600' : 'text-[#bdc2ff]'}`} />
              <span>12.4K</span>
            </span>
          </div>
        </div>
      </div>

      {/* STITCH SOCIAL ACTION FOOTER */}
      <div
        className={`pt-2 border-t mt-auto shrink-0 flex flex-col gap-1.5 ${
          isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'
        }`}
      >
        <div className="flex items-center justify-between gap-1.5">
          <span
            className={`font-mono text-[9.5px] px-1.5 py-0.5 rounded border hidden sm:inline-block ${
              isLight
                ? 'text-zinc-400 bg-[#F4F4F5] border-[#E6E6E4]'
                : 'text-[#908f9e] bg-[#0d0e0f] border-[#292a2b]'
            }`}
          >
            Tone: <strong className={isLight ? 'text-zinc-700 font-normal' : 'text-[#e3e2e3] font-normal'}>Direct &amp; Tech</strong>
          </span>

          <div className="flex items-center gap-1.5 ml-auto">
            {platform === 'twitter' ? (
              <button
                type="button"
                onClick={() => {
                  const text = getCopyText();
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                }}
                title="Post directly to X / Twitter"
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-colors shadow-xs cursor-pointer ${
                  isLight
                    ? 'bg-zinc-900 text-white hover:bg-black border-zinc-900'
                    : 'bg-white text-zinc-900 hover:bg-zinc-100 border-white font-semibold'
                }`}
              >
                <TwitterIcon className="h-3 w-3" />
                <span>Post to 𝕏</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-70" />
              </button>
            ) : platform === 'linkedin' ? (
              <button
                type="button"
                onClick={() => {
                  window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');
                }}
                title="Share to LinkedIn"
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-colors shadow-xs cursor-pointer bg-[#0A66C2] text-white hover:bg-[#004182] border-[#0A66C2]`}
              >
                <LinkedinIcon className="h-3 w-3" />
                <span>Share</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-70" />
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border font-medium text-xs transition-colors shadow-xs cursor-pointer ${
                isLight
                  ? 'border-[#E6E6E4] bg-white hover:bg-zinc-50 text-zinc-700'
                  : 'bg-[#1f2021] hover:bg-[#292a2b] text-[#e3e2e3] hover:text-white border-[#292a2b] font-mono'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className={`h-3 w-3 ${isLight ? 'text-zinc-500' : 'text-[#bdc2ff]'}`} />
                  <span>Copy</span>
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
          className="pt-1 mt-0 border-t-0"
        />
      </div>
    </div>
  );
}
