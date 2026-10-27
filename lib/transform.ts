import { Deliverables, GenerateApiResponseData, VideoScriptSegment } from './types';

/**
 * Formats a duration in total seconds into a mm:ss timestamp string.
 */
function formatSecondsToTimestamp(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Validates that a timestamp string consists of valid minutes and seconds (seconds < 60).
 * Supports both standalone mm:ss and range mm:ss - mm:ss formats.
 */
function isValidTimestamp(ts: string): boolean {
  if (!ts || typeof ts !== 'string') return false;
  const parts = ts.split('-').map((p) => p.trim());
  if (parts.length === 0) return false;
  for (const part of parts) {
    const cleanPart = part.replace(/^\[|\]$/g, '').trim();
    const match = cleanPart.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return false;
    const seconds = parseInt(match[2], 10);
    if (seconds >= 60) return false;
  }
  return true;
}

/**
 * Returns a default timestamp range for segment index (e.g. 00:00 - 00:30, 00:30 - 01:00).
 */
function getDefaultTimestampRange(index: number, stepSeconds: number = 30): string {
  const start = formatSecondsToTimestamp(index * stepSeconds);
  const end = formatSecondsToTimestamp((index + 1) * stepSeconds);
  return `${start} - ${end}`;
}

/**
 * Cleans string input safely, coercing numbers or booleans if necessary, and trims whitespace.
 */
function cleanString(val: unknown, fallback: string = ''): string {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
  if (typeof val === 'number' || typeof val === 'boolean') {
    return String(val).trim();
  }
  return fallback;
}

/**
 * Sanitizes Mermaid code by stripping markdown code fences (```mermaid ... ```)
 * and providing a resilient fallback if syntax is missing or empty.
 */
function sanitizeMermaidSyntax(raw: unknown): string {
  if (typeof raw !== 'string') {
    return 'flowchart TD\n  Client["Client App"] --> Gateway["API Gateway"]\n  Gateway --> Backend["Backend Services"]';
  }
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:mermaid)?\s*\r?\n?/i, '');
    cleaned = cleaned.replace(/\r?\n?```\s*$/, '');
  }
  cleaned = cleaned.trim();
  if (!cleaned) {
    return 'flowchart TD\n  Client["Client App"] --> Gateway["API Gateway"]\n  Gateway --> Backend["Backend Services"]';
  }
  return cleaned;
}

/**
 * Checks if a string is a negative statement indicating no breaking changes (e.g. "None", "N/A").
 */
function isNegativeBreakingChange(text: string): boolean {
  const normalized = text.toLowerCase().trim().replace(/[^\w\s/()-]/g, '');
  return (
    normalized === 'none' ||
    normalized === 'na' ||
    normalized === 'n/a' ||
    normalized === 'nil' ||
    normalized === 'no' ||
    normalized === '(none)' ||
    normalized.startsWith('no breaking change') ||
    normalized.startsWith('none detected') ||
    normalized.startsWith('none.')
  );
}

/**
 * Robust markdown extractor for PR deliverables (summary, keyChanges, breakingChanges).
 */
function extractPrSections(
  rawMarkdown: string,
  fallbackTitle: string
): {
  summary: string;
  keyChanges: string[];
  breakingChanges: string[];
} {
  const lines = rawMarkdown ? rawMarkdown.split(/\r?\n/) : [];

  let inBreakingSection = false;
  let inKeyChangesSection = false;
  let inOverviewSection = false;
  let inChecklistSection = false;

  const sectionKeyChanges: string[] = [];
  const generalBulletChanges: string[] = [];
  const breakingChangesList: string[] = [];
  let overviewParagraph = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for section headings
    const isHeading = /^#{1,6}\s+/.test(trimmed) || /^\*{2}[^*]+\*{2}$/.test(trimmed);

    if (isHeading) {
      const headingText = trimmed.replace(/^#{1,6}\s+/, '').replace(/^\*{2}|\*{2}$/g, '').trim().toLowerCase();

      if (headingText.includes('breaking')) {
        inBreakingSection = true;
        inKeyChangesSection = false;
        inOverviewSection = false;
        inChecklistSection = false;
        continue;
      } else if (
        headingText.includes('key change') ||
        headingText.includes('detailed change') ||
        headingText === 'changes' ||
        headingText.includes("what's new")
      ) {
        inKeyChangesSection = true;
        inBreakingSection = false;
        inOverviewSection = false;
        inChecklistSection = false;
        continue;
      } else if (headingText.includes('overview') || headingText.includes('summary')) {
        inOverviewSection = true;
        inBreakingSection = false;
        inKeyChangesSection = false;
        inChecklistSection = false;
        continue;
      } else if (
        headingText.includes('checklist') ||
        headingText.includes('environment setup') ||
        headingText.includes('verification')
      ) {
        inChecklistSection = true;
        inBreakingSection = false;
        inKeyChangesSection = false;
        inOverviewSection = false;
        continue;
      } else {
        // Any other heading resets active section tracking
        inBreakingSection = false;
        inKeyChangesSection = false;
        inOverviewSection = false;
        inChecklistSection = false;
      }
    }

    if (!trimmed) continue;

    // Check for checklist items (- [ ] or - [x])
    const isChecklistItem = /^[-*+]\s+\[[ xX]\]/.test(trimmed);

    // If currently in Breaking Changes section
    if (inBreakingSection) {
      const cleanedItem = trimmed.replace(/^[-*+#>\s]+/, '').trim();
      if (
        cleanedItem.length > 0 &&
        !isNegativeBreakingChange(cleanedItem) &&
        !cleanedItem.toLowerCase().startsWith('breaking change')
      ) {
        breakingChangesList.push(cleanedItem);
      }
      continue;
    }

    // Check for explicit inline breaking change bullet anywhere in the document
    const inlineBreakingMatch = trimmed.match(/^[-*+]\s*(?:\[breaking\]|breaking(?:\s+change)?:\s*|\(breaking\)\s*)(.*)$/i);
    if (inlineBreakingMatch && inlineBreakingMatch[1]) {
      const item = inlineBreakingMatch[1].trim();
      if (item && !isNegativeBreakingChange(item)) {
        breakingChangesList.push(item);
      }
      continue;
    }

    // Capture overview/summary paragraph
    if (inOverviewSection && !overviewParagraph && !isHeading && !trimmed.startsWith('```') && !trimmed.startsWith('|')) {
      const cleanPara = trimmed.replace(/^[-*+#>\s]+/, '').trim();
      if (cleanPara.length > 15) {
        overviewParagraph = cleanPara;
      }
    }

    // Collect bullet points for key changes (ignoring checklist items and checklists)
    if (!inChecklistSection && !isChecklistItem) {
      const isBullet = /^[-*+]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed);
      if (isBullet) {
        const cleanBullet = trimmed.replace(/^[-*+]\s+|\d+\.\s+/, '').trim();
        if (cleanBullet.length > 0 && !cleanBullet.toLowerCase().includes('breaking changes')) {
          if (inKeyChangesSection) {
            sectionKeyChanges.push(cleanBullet);
          } else {
            generalBulletChanges.push(cleanBullet);
          }
        }
      }
    }
  }

  // Deduplicate breaking changes
  const breakingChanges = Array.from(new Set(breakingChangesList)).slice(0, 5);

  // Determine key changes: prefer changes from the specific Key Changes section, then fallback to general bullets
  const combinedKeyChanges = sectionKeyChanges.length > 0 ? sectionKeyChanges : generalBulletChanges;
  const uniqueKeyChanges = Array.from(new Set(combinedKeyChanges));
  const keyChanges =
    uniqueKeyChanges.length > 0
      ? uniqueKeyChanges.slice(0, 5)
      : ['Code changes parsed from transcript and diff context'];

  // Determine summary: prefer overview section paragraph, then look for first descriptive text line
  let summary = overviewParagraph;
  if (!summary) {
    const candidateLine = lines.find((line) => {
      const trimmed = line.trim();
      return (
        trimmed.length > 20 &&
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('-') &&
        !trimmed.startsWith('*') &&
        !trimmed.startsWith('+') &&
        !trimmed.startsWith('`') &&
        !trimmed.startsWith('|') &&
        !trimmed.startsWith('>') &&
        !trimmed.startsWith('---') &&
        !/^\d+\.\s+/.test(trimmed)
      );
    });

    summary = candidateLine
      ? candidateLine.trim()
      : `${fallbackTitle}: Synthesized from voice transcript and git diff context.`;
  }

  return { summary, keyChanges, breakingChanges };
}

/**
 * Parses and validates video script segments, ensuring proper time calculations and zero nulls.
 */
function parseVideoScriptSegments(rawSegments: unknown): VideoScriptSegment[] {
  const defaultFallbackSegments: VideoScriptSegment[] = [
    {
      timestamp: '00:00 - 00:30',
      stage: 'Hook & Overview',
      audio: 'Here is what was built and why it matters.',
      spokenLine: 'Here is what was built and why it matters.',
      visualCue: 'Opening screen walkthrough of feature implementation',
    },
    {
      timestamp: '00:30 - 01:00',
      stage: 'Architecture & Changes',
      audio: 'Walking through the core technical changes and architecture flow.',
      spokenLine: 'Walking through the core technical changes and architecture flow.',
      visualCue: 'Architecture diagram view',
    },
    {
      timestamp: '01:00 - 01:30',
      stage: 'Live Demonstration',
      audio: 'Observing the implementation in action with verified test cases.',
      spokenLine: 'Observing the implementation in action with verified test cases.',
      visualCue: 'Terminal or browser interaction demo',
    },
    {
      timestamp: '01:30 - 02:00',
      stage: 'Wrap-up & Impact',
      audio: 'Summary of performance gains and next steps for review.',
      spokenLine: 'Summary of performance gains and next steps for review.',
      visualCue: 'PR summary and repository links',
    },
  ];

  if (!Array.isArray(rawSegments) || rawSegments.length === 0) {
    return defaultFallbackSegments;
  }

  return rawSegments.map((seg, idx) => {
    // If segment is a raw string (e.g. "[00:00 - 00:30] Spoken narration")
    if (typeof seg === 'string') {
      const trimmed = seg.trim();
      const timeMatch = trimmed.match(/\[?(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})\]?:?\s*(.*)/);
      const rawTime = timeMatch ? timeMatch[1].trim() : '';
      const timestamp = isValidTimestamp(rawTime) ? rawTime : getDefaultTimestampRange(idx);
      const text = timeMatch && timeMatch[2] ? timeMatch[2].trim() : trimmed || `Demo narration segment ${idx + 1}`;
      return {
        timestamp,
        stage: `Segment ${idx + 1}`,
        audio: text,
        spokenLine: text,
        visualCue: 'Screen view',
      };
    }

    const safeSeg = seg && typeof seg === 'object' ? (seg as Record<string, unknown>) : {};

    // Validate timestamp
    const candidateTimestamp = cleanString(safeSeg.timestamp);
    const timestamp = isValidTimestamp(candidateTimestamp)
      ? candidateTimestamp
      : getDefaultTimestampRange(idx);

    const stage = cleanString(safeSeg.stage, `Segment ${idx + 1}`);
    const audioText = cleanString(
      safeSeg.spokenLine || safeSeg.audio,
      `Demo narration segment ${idx + 1}`
    );
    const visualCue = cleanString(safeSeg.visualCue, 'Screen view');

    return {
      timestamp,
      stage,
      audio: audioText,
      spokenLine: audioText,
      visualCue,
    };
  });
}

/**
 * Transforms raw social post input into a structured SocialPostDeliverable with accurate metrics.
 */
function parseSocialPost(rawSocialInput: unknown): {
  rawPost: string;
  twitter: {
    content: string;
    charCount: number;
    hashtags: string[];
  };
  linkedin: {
    hook: string;
    body: string;
    takeaways: string[];
    callToAction: string;
  };
} {
  let rawSocial = '';
  if (typeof rawSocialInput === 'string' && rawSocialInput.trim()) {
    rawSocial = rawSocialInput.trim();
  } else if (rawSocialInput && typeof rawSocialInput === 'object') {
    const sp = rawSocialInput as Record<string, unknown>;
    if (typeof sp.content === 'string') rawSocial = sp.content.trim();
    else if (typeof sp.body === 'string') rawSocial = sp.body.trim();
    else if (typeof sp.rawPost === 'string') rawSocial = sp.rawPost.trim();
  }

  if (!rawSocial) {
    rawSocial = '🚀 Shipping updates built with ShipSpeak';
  }

  // Extract hashtags from rawSocial
  const hashtagMatches = rawSocial.match(/#[a-zA-Z0-9_\u00c0-\u024e-]+/g);
  const hashtags =
    hashtagMatches && hashtagMatches.length > 0
      ? Array.from(new Set(hashtagMatches))
      : ['#buildinpublic', '#WisprNoHandChallenge', '#dev'];

  // Twitter content formatting (limit to 275 chars for comfortable tweet room)
  const twitterContent = rawSocial.length > 275 ? rawSocial.slice(0, 275).trim() : rawSocial;
  const twitterCharCount = Math.min(280, twitterContent.length);

  // LinkedIn hook: find first meaningful non-hashtag line
  const lines = rawSocial.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const linkedinHook =
    lines.find((l) => !l.startsWith('#')) || 'Excited to share our latest architecture update:';

  // Extract bullet points for takeaways
  const extractedBullets = lines
    .filter((l) => l.startsWith('- ') || l.startsWith('* ') || l.startsWith('• '))
    .map((l) => l.replace(/^[-*•]\s+/, '').trim())
    .filter(Boolean);

  const takeaways =
    extractedBullets.length > 0
      ? extractedBullets.slice(0, 3)
      : [
          'Voice-first shipping eliminates last-mile documentation drag.',
          'Automated PR, Mermaid diagrams, and video scripts in seconds.',
        ];

  return {
    rawPost: rawSocial,
    twitter: {
      content: twitterContent,
      charCount: twitterCharCount,
      hashtags,
    },
    linkedin: {
      hook: linkedinHook,
      body: rawSocial,
      takeaways,
      callToAction: 'Check out the demo and repo in the comments!',
    },
  };
}

/**
 * Transforms an API response or loose payload into validated, complete, and resilient UI Deliverables.
 */
export function transformApiResponseToDeliverables(
  data: GenerateApiResponseData | Partial<GenerateApiResponseData> | null | undefined | unknown
): Deliverables {
  const safeData: Record<string, unknown> =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};

  const prTitle = cleanString(safeData.prTitle, 'feat: automated feature delivery');
  const commitMessage = cleanString(safeData.commitMessage, 'feat: update implementation');
  const rawPrMarkdown = typeof safeData.prMarkdown === 'string' ? safeData.prMarkdown : '';

  const { summary, keyChanges, breakingChanges } = extractPrSections(rawPrMarkdown, prTitle);

  // Guarantee valid prMarkdown string
  const prMarkdown =
    rawPrMarkdown.trim().length > 0
      ? rawPrMarkdown
      : `## ${prTitle}

### Commit Message
\`\`\`
${commitMessage}
\`\`\`

### Summary
${summary}

### Key Changes
${keyChanges.map((change) => `- ${change}`).join('\n')}

### ⚠️ Breaking Changes
${breakingChanges.length > 0 ? breakingChanges.map((b) => `- ${b}`).join('\n') : '- None'}`;

  const mermaidCode = sanitizeMermaidSyntax(safeData.mermaidSyntax);
  const segments = parseVideoScriptSegments(safeData.videoScript);
  const socialPost = parseSocialPost(safeData.socialPost);

  return {
    pullRequest: {
      title: prTitle,
      commitMessage,
      summary,
      keyChanges,
      breakingChanges,
      prMarkdown,
    },
    architecture: {
      title: 'Architecture Topology',
      mermaidCode,
      description: 'Flowchart rendered dynamically from structured Gemini pipeline output.',
    },
    videoScript: {
      title: '2-Minute Hackathon Demo Script',
      totalDuration: '02:00',
      segments,
    },
    socialPost,
  };
}
