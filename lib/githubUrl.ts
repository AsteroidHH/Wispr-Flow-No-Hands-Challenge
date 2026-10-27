import { PullRequestDeliverable } from './types';

/**
 * Validates and sanitizes a raw repository string into a clean "owner/repo" slug.
 * Strips out:
 * - Protocols (http://, https://, git@)
 * - Domain prefixes (github.com, www.github.com)
 * - Trailing .git
 * - Query strings and URL hash fragments
 * - Trailing/leading slashes and excess whitespace
 *
 * Validates that owner and repo conform to GitHub naming rules (alphanumeric, -, _, .).
 * Rejects path traversal attempts (..) and malicious characters.
 */
export function sanitizeRepoSlug(rawRepo: string | null | undefined): string | null {
  if (!rawRepo || typeof rawRepo !== 'string') return null;

  let s = rawRepo.trim();
  if (!s) return null;

  // Strip git SSH prefix: git@github.com:owner/repo.git
  s = s.replace(/^git@github\.com:/i, '');

  // Strip URL scheme and domain: https://github.com/ or https://www.github.com/ or http://
  s = s.replace(/^https?:\/\/(?:www\.)?github\.com\//i, '');
  s = s.replace(/^github\.com\//i, '');

  // Strip query parameters and hash anchors (e.g., owner/repo?ref=main, owner/repo#readme)
  s = s.split('?')[0].split('#')[0];

  // Strip trailing .git (case-insensitive)
  s = s.replace(/\.git$/i, '');

  // Split on slashes and remove empty segments
  const segments = s.split('/').map((seg) => seg.trim()).filter(Boolean);
  if (segments.length < 2) return null;

  const owner = segments[0];
  const repo = segments[1];

  // Disallow directory traversal
  if (owner === '.' || owner === '..' || repo === '.' || repo === '..') {
    return null;
  }

  // GitHub allowed characters: alphanumeric, hyphens, underscores, dots
  const validSegmentPattern = /^[a-zA-Z0-9._-]+$/;
  if (!validSegmentPattern.test(owner) || !validSegmentPattern.test(repo)) {
    return null;
  }

  return `${owner}/${repo}`;
}

/**
 * Normalizes and encodes a branch comparison string for GitHub URLs.
 * Handles patterns like "main...feature", "main...feat/login", or single branch names.
 * Ensures slashes and "..." are preserved while encoding special or unsafe characters.
 */
export function sanitizeCompareBranch(rawCompare: string | null | undefined): string {
  if (!rawCompare || typeof rawCompare !== 'string') return 'main...feature';

  const trimmed = rawCompare.trim();
  if (!trimmed) return 'main...feature';

  if (trimmed.includes('...')) {
    const parts = trimmed.split('...');
    const base = parts[0].trim();
    const head = parts.slice(1).join('...').trim();

    if (!base && !head) return 'main...feature';

    const cleanBase = (base || 'main')
      .split('/')
      .map(encodeURIComponentSafe)
      .join('/');

    const cleanHead = (head || 'feature')
      .split('/')
      .map(encodeURIComponentSafe)
      .join('/');

    return `${cleanBase}...${cleanHead}`;
  }

  // Single branch comparison
  return trimmed
    .split('/')
    .map(encodeURIComponentSafe)
    .join('/');
}

export interface BuildGitHubCompareUrlOptions {
  repo: string;
  compare?: string;
  title?: string;
  body?: string;
  maxUrlLength?: number;
}

export interface BuildGitHubCompareUrlResult {
  url: string;
  isValid: boolean;
  wasTruncated: boolean;
  cleanRepo: string;
  compare: string;
  fullBody: string;
}

export const GITHUB_MAX_URL_LENGTH = 3800;
export const PR_CLIPBOARD_FALLBACK_NOTICE =
  '\n\n... *(Full PR spec copied to clipboard — paste directly into description)*';

/**
 * Safely slices a string up to `end` characters without splitting Unicode surrogate pairs
 * (such as emojis or 4-byte characters).
 */
export function safeUnicodeSlice(str: string, end: number): string {
  if (end <= 0) return '';
  if (end >= str.length) return str;

  // If character at (end - 1) is a high surrogate (0xD800 - 0xDBFF),
  // slicing at `end` would split it from its low surrogate. Adjust back by 1.
  const charCodeBefore = str.charCodeAt(end - 1);
  if (charCodeBefore >= 0xd800 && charCodeBefore <= 0xdbff) {
    end = end - 1;
  }

  return str.slice(0, end);
}

/**
 * Safe wrapper for encodeURIComponent that guarantees no URIError: URI malformed
 * even on orphan or malformed surrogate characters.
 */
export function encodeURIComponentSafe(str: string): string {
  try {
    return encodeURIComponent(str);
  } catch {
    // If str has malformed surrogates, normalize using toWellFormed or regex fallback
    const wellFormed =
      typeof (str as any).toWellFormed === 'function'
        ? (str as any).toWellFormed()
        : str.replace(
            /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g,
            ''
          );
    try {
      return encodeURIComponent(wellFormed);
    } catch {
      return '';
    }
  }
}

/**
 * Builds a zero-OAuth GitHub compare PR URL with pre-filled title and body.
 * Guaranteed never to exceed maxUrlLength (default 3,800 chars) regardless of
 * input size, multibyte characters, emojis, or title length.
 *
 * If the body exceeds the URL length budget, it binary-searches the maximum safe
 * substring and appends a markdown clipboard notice.
 */
export function buildGitHubCompareUrl({
  repo,
  compare = 'main...feature',
  title = 'ShipSpeak: Deliverables PR',
  body = '',
  maxUrlLength = GITHUB_MAX_URL_LENGTH,
}: BuildGitHubCompareUrlOptions): BuildGitHubCompareUrlResult {
  const cleanRepo = sanitizeRepoSlug(repo);
  const safeCompare = sanitizeCompareBranch(compare);
  const fullBody = body || '';

  if (!cleanRepo) {
    return {
      url: '',
      isValid: false,
      wasTruncated: false,
      cleanRepo: '',
      compare: safeCompare,
      fullBody,
    };
  }

  // Constrain title parameter to prevent an oversized title from exhausting budget
  const safeTitle = safeUnicodeSlice((title || 'ShipSpeak: Deliverables PR').trim(), 200);
  const titleParam = encodeURIComponentSafe(safeTitle);

  const baseUrl = `https://github.com/${cleanRepo}/compare/${safeCompare}?quick_pull=1&title=${titleParam}&body=`;

  const availableBodyBudget = maxUrlLength - baseUrl.length;

  if (availableBodyBudget <= 0) {
    // Edge case: Base URL alone exceeds or matches maxUrlLength
    return {
      url: baseUrl,
      isValid: true,
      wasTruncated: true,
      cleanRepo,
      compare: safeCompare,
      fullBody,
    };
  }

  const encodedFullBody = encodeURIComponentSafe(fullBody);

  if (encodedFullBody.length <= availableBodyBudget) {
    return {
      url: `${baseUrl}${encodedFullBody}`,
      isValid: true,
      wasTruncated: false,
      cleanRepo,
      compare: safeCompare,
      fullBody,
    };
  }

  // Body must be truncated safely
  const encodedNotice = encodeURIComponentSafe(PR_CLIPBOARD_FALLBACK_NOTICE);
  const contentBudget = availableBodyBudget - encodedNotice.length;

  let truncatedBody = '';
  if (contentBudget > 0) {
    // Binary search the optimal cut-off point
    let low = 0;
    let high = fullBody.length;
    let bestCut = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const candidate = safeUnicodeSlice(fullBody, mid);
      if (encodeURIComponentSafe(candidate).length <= contentBudget) {
        bestCut = candidate.length;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    truncatedBody = safeUnicodeSlice(fullBody, bestCut) + PR_CLIPBOARD_FALLBACK_NOTICE;
  } else {
    // Not enough space even for the notice; cut the notice itself to fit budget
    truncatedBody = safeUnicodeSlice(PR_CLIPBOARD_FALLBACK_NOTICE, Math.max(0, availableBodyBudget));
  }

  const finalUrl = `${baseUrl}${encodeURIComponentSafe(truncatedBody)}`;

  return {
    url: finalUrl,
    isValid: true,
    wasTruncated: true,
    cleanRepo,
    compare: safeCompare,
    fullBody,
  };
}

/**
 * Builds a standardized Markdown document from structured PullRequestDeliverable data.
 * Safe against null, undefined, empty objects, and non-array fields.
 */
export function formatPrMarkdown(data?: Partial<PullRequestDeliverable> | null): string {
  if (!data) return '';
  if (data.prMarkdown) return data.prMarkdown;

  const title = (data.title || 'Feature Implementation').trim();
  const commitMsg = (data.commitMessage || 'feat: update implementation').trim();
  const summary = (data.summary || 'Summary of changes').trim();

  const keyChanges = Array.isArray(data.keyChanges) ? data.keyChanges : [];
  const breakingChanges = Array.isArray(data.breakingChanges) ? data.breakingChanges : [];

  const keyChangesList = keyChanges.map((c) => `- ${String(c)}`).join('\n');
  const breakingChangesList = breakingChanges.map((b) => `- ${String(b)}`).join('\n');

  return `## ${title}

### Commit Message
\`\`\`
${commitMsg}
\`\`\`

### Summary
${summary}

### Key Changes
${keyChangesList || '- General code refactor'}

### ⚠️ Breaking Changes
${breakingChangesList || '- None'}`;
}

/**
 * Safe clipboard copy with fallback for non-secure / iframe / permission-restricted contexts.
 */
export async function safeClipboardCopy(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to DOM execCommand
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
