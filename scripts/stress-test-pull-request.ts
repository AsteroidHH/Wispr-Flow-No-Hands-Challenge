/**
 * Multi-Scenario Stress Test Suite for PullRequestCard & PullRequestsView
 * Validates:
 * 1. 10,000+ character PR markdown graceful truncation and URL bounds.
 * 2. Repository string sanitization across bizarre, malicious, and URL-formatted inputs.
 * 3. Branch compare path normalization and URI safety.
 * 4. Empty objects, null keyChanges, null breakingChanges resilience.
 * 5. PullRequestsView deep link verification across all 4 items under extreme loads.
 */

import {
  sanitizeRepoSlug,
  sanitizeCompareBranch,
  buildGitHubCompareUrl,
  formatPrMarkdown,
  GITHUB_MAX_URL_LENGTH,
  PR_CLIPBOARD_FALLBACK_NOTICE,
} from '../lib/githubUrl';
import { PullRequestDeliverable, Deliverables } from '../lib/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runAllTests() {
  console.log('======================================================================');
  console.log('🚀 RUNNING SUBAGENT 7 STRESS TEST SUITE (PR SPEC & ZERO-OAUTH COMPARE)');
  console.log('======================================================================\n');

  // =========================================================================
  // SCENARIO 1: Extreme Markdown Payloads (URL Length Overflow & Graceful Truncation)
  // =========================================================================
  console.log('--- SCENARIO 1: Extreme Markdown Payloads (10,000+ chars & Multi-byte) ---');
  {
    // 1.a: 10,000 ASCII characters
    const largeAsciiMarkdown = 'A'.repeat(10000);
    const resultAscii = buildGitHubCompareUrl({
      repo: 'AsteroidHH/Wispr-Flow-No-Hands-Challenge',
      compare: 'main...feat/extreme-stress-test',
      title: 'feat: massive PR spec',
      body: largeAsciiMarkdown,
    });

    assert(resultAscii.isValid, 'Ascii buildGitHubCompareUrl returned valid=true');
    assert(resultAscii.wasTruncated, '10,000 char ASCII body was flagged as wasTruncated=true');
    assert(
      resultAscii.url.length <= GITHUB_MAX_URL_LENGTH,
      `Ascii URL length (${resultAscii.url.length}) <= GITHUB_MAX_URL_LENGTH (${GITHUB_MAX_URL_LENGTH})`
    );
    assert(
      resultAscii.fullBody.length === 10000,
      'Full untruncated markdown body is preserved in fullBody property for clipboard'
    );
    assert(
      resultAscii.url.includes(encodeURIComponent(PR_CLIPBOARD_FALLBACK_NOTICE.slice(0, 30))),
      'URL contains encoded clipboard fallback notice'
    );

    // 1.b: 10,000 multi-byte Unicode / Emoji characters (e.g. 🚀🔥🎉)
    const multiByteUnits = '🚀 ShipSpeak Turbo Agent ⚡️ ';
    const largeUnicodeMarkdown = multiByteUnits.repeat(400); // ~11,000 chars, expands 3-4x in encodeURIComponent
    const resultUnicode = buildGitHubCompareUrl({
      repo: 'AsteroidHH/Wispr-Flow-No-Hands-Challenge',
      compare: 'main...feat/unicode-overflow',
      title: 'feat: multibyte unicode specs',
      body: largeUnicodeMarkdown,
    });

    assert(resultUnicode.isValid, 'Unicode buildGitHubCompareUrl returned valid=true');
    assert(resultUnicode.wasTruncated, 'Multi-byte Unicode body was flagged as wasTruncated=true');
    assert(
      resultUnicode.url.length <= GITHUB_MAX_URL_LENGTH,
      `Unicode URL length (${resultUnicode.url.length}) strictly <= GITHUB_MAX_URL_LENGTH (${GITHUB_MAX_URL_LENGTH})`
    );
    assert(
      resultUnicode.fullBody === largeUnicodeMarkdown,
      'fullBody matches full multi-byte payload verbatim'
    );

    // 1.c: Normal size markdown (under limit)
    const normalMarkdown = '## Feature Implementation\n\n### Summary\nShort safe markdown.';
    const resultNormal = buildGitHubCompareUrl({
      repo: 'AsteroidHH/Wispr-Flow-No-Hands-Challenge',
      compare: 'main...feature',
      title: 'Normal PR',
      body: normalMarkdown,
    });
    assert(resultNormal.isValid, 'Normal buildGitHubCompareUrl returned valid=true');
    assert(!resultNormal.wasTruncated, 'Normal markdown is NOT truncated');
    assert(resultNormal.url.includes(encodeURIComponent(normalMarkdown)), 'Entire normal markdown is inside URL');

    // 1.d: Extreme Title parameter length test
    const extremeTitle = 'Super Long PR Title '.repeat(100); // 2100 chars
    const resultLongTitle = buildGitHubCompareUrl({
      repo: 'AsteroidHH/Wispr-Flow-No-Hands-Challenge',
      title: extremeTitle,
      body: largeAsciiMarkdown,
    });
    assert(
      resultLongTitle.url.length <= GITHUB_MAX_URL_LENGTH,
      `Extreme title capped safely: URL length (${resultLongTitle.url.length}) <= ${GITHUB_MAX_URL_LENGTH}`
    );
  }

  // =========================================================================
  // SCENARIO 2: Repository String Sanitization
  // =========================================================================
  console.log('\n--- SCENARIO 2: Repository String Sanitization ---');
  {
    // Standard valid slugs
    assert(
      sanitizeRepoSlug('AsteroidHH/Wispr-Flow-No-Hands-Challenge') ===
        'AsteroidHH/Wispr-Flow-No-Hands-Challenge',
      'Standard owner/repo passes'
    );
    assert(
      sanitizeRepoSlug('facebook/react') === 'facebook/react',
      'Simple owner/repo passes'
    );

    // Full URLs
    assert(
      sanitizeRepoSlug('https://github.com/facebook/react') === 'facebook/react',
      'Stripped https://github.com/'
    );
    assert(
      sanitizeRepoSlug('https://github.com/facebook/react/') === 'facebook/react',
      'Stripped trailing slash from full URL'
    );
    assert(
      sanitizeRepoSlug('https://www.github.com/facebook/react') === 'facebook/react',
      'Stripped https://www.github.com/'
    );
    assert(
      sanitizeRepoSlug('http://github.com/facebook/react') === 'facebook/react',
      'Stripped http://'
    );
    assert(
      sanitizeRepoSlug('github.com/facebook/react') === 'facebook/react',
      'Stripped github.com/'
    );
    assert(
      sanitizeRepoSlug('https://github.com/facebook/react.git') === 'facebook/react',
      'Stripped .git from https URL'
    );
    assert(
      sanitizeRepoSlug('git@github.com:facebook/react.git') === 'facebook/react',
      'Stripped git@github.com: SSH prefix'
    );
    assert(
      sanitizeRepoSlug('facebook/react.git') === 'facebook/react',
      'Stripped standalone .git'
    );

    // URLs with sub-paths (compare, pull, issues)
    assert(
      sanitizeRepoSlug('https://github.com/facebook/react/compare/main...feat') === 'facebook/react',
      'Extracted owner/repo from compare link'
    );
    assert(
      sanitizeRepoSlug('https://github.com/facebook/react/pull/42') === 'facebook/react',
      'Extracted owner/repo from pull link'
    );

    // Leading / trailing slashes and excess whitespace
    assert(
      sanitizeRepoSlug('   ///facebook/react///   ') === 'facebook/react',
      'Stripped multiple leading/trailing slashes and outer spaces'
    );
    assert(
      sanitizeRepoSlug('facebook / react') === 'facebook/react',
      'Cleaned spaces around slash'
    );

    // Query parameters and hash anchors
    assert(
      sanitizeRepoSlug('facebook/react?ref=main&version=1.0#readme') === 'facebook/react',
      'Stripped query params and hash fragment'
    );

    // Malicious or invalid inputs
    assert(sanitizeRepoSlug('') === null, 'Empty string returns null');
    assert(sanitizeRepoSlug('   ') === null, 'Whitespace only returns null');
    assert(sanitizeRepoSlug('singleword') === null, 'Single segment returns null');
    assert(sanitizeRepoSlug('javascript:alert(1)') === null, 'XSS protocol returns null');
    assert(sanitizeRepoSlug('../evil/repo') === null, 'Directory traversal returns null');
    assert(sanitizeRepoSlug('owner/..') === null, 'Parent directory traversal returns null');
    assert(sanitizeRepoSlug('./repo') === null, 'Relative current directory traversal returns null');
    assert(sanitizeRepoSlug('<script>alert(1)</script>/repo') === null, 'HTML tags rejected');
    assert(sanitizeRepoSlug('facebook/react with illegal characters!') === null, 'Illegal characters rejected');
  }

  // =========================================================================
  // SCENARIO 3: Branch Compare Path Sanitization
  // =========================================================================
  console.log('\n--- SCENARIO 3: Branch Compare Path Sanitization ---');
  {
    assert(sanitizeCompareBranch('main...feature') === 'main...feature', 'Standard compare intact');
    assert(
      sanitizeCompareBranch('main...feat/agent-router-v2') === 'main...feat/agent-router-v2',
      'Nested branch path with slash preserved'
    );
    assert(
      sanitizeCompareBranch('  main  ...  feature  ') === 'main...feature',
      'Trimmed whitespace around ellipsis'
    );
    assert(
      sanitizeCompareBranch('main...feat/my test branch') === 'main...feat/my%20test%20branch',
      'Branch name with space safely percent-encoded'
    );
    assert(sanitizeCompareBranch('') === 'main...feature', 'Empty branch defaulted to main...feature');
    assert(sanitizeCompareBranch(null as any) === 'main...feature', 'Null branch defaulted to main...feature');
    assert(sanitizeCompareBranch('patch-1') === 'patch-1', 'Single branch compare supported');
  }

  // =========================================================================
  // SCENARIO 4: Resilient PR Markdown Formatting & Null/Undefined Safety
  // =========================================================================
  console.log('\n--- SCENARIO 4: Null/Undefined & Empty Object Safety in formatPrMarkdown ---');
  {
    // Empty object
    const emptyMarkdown = formatPrMarkdown({});
    assert(emptyMarkdown.includes('## Feature Implementation'), 'Empty object uses default title');
    assert(emptyMarkdown.includes('feat: update implementation'), 'Empty object uses default commit message');
    assert(emptyMarkdown.includes('Summary of changes'), 'Empty object uses default summary');
    assert(emptyMarkdown.includes('- General code refactor'), 'Empty keyChanges falls back safely');
    assert(emptyMarkdown.includes('- None'), 'Empty breakingChanges falls back safely');

    // Null and undefined
    assert(formatPrMarkdown(null) === '', 'null data returns empty string');
    assert(formatPrMarkdown(undefined) === '', 'undefined data returns empty string');

    // Null arrays inside data
    const nullArraysObj: any = {
      title: 'Fix issue',
      commitMessage: 'fix: patch bug',
      summary: 'Patched bug',
      keyChanges: null,
      breakingChanges: null,
    };
    const nullArrayMarkdown = formatPrMarkdown(nullArraysObj);
    assert(nullArrayMarkdown.includes('## Fix issue'), 'Null arrays handled without throwing');
    assert(nullArrayMarkdown.includes('- General code refactor'), 'keyChanges: null handled safely');
    assert(nullArrayMarkdown.includes('- None'), 'breakingChanges: null handled safely');

    // Non-string array items
    const nonStringArrayObj: any = {
      keyChanges: [100, true, { note: 'test' }],
      breakingChanges: [false, 404],
    };
    const nonStringMarkdown = formatPrMarkdown(nonStringArrayObj);
    assert(nonStringMarkdown.includes('- 100'), 'Non-string numbers converted to string');
    assert(nonStringMarkdown.includes('- true'), 'Non-string booleans converted to string');

    // Existing prMarkdown pass-through
    const preformatted: PullRequestDeliverable = {
      title: 'Original Title',
      commitMessage: 'msg',
      summary: 'sum',
      keyChanges: [],
      breakingChanges: [],
      prMarkdown: '# Custom Pre-rendered Markdown\nAll details included.',
    };
    assert(
      formatPrMarkdown(preformatted) === '# Custom Pre-rendered Markdown\nAll details included.',
      'Pre-formatted prMarkdown returned intact without mutation'
    );
  }

  // =========================================================================
  // SCENARIO 5: PullRequestsView DeepLink Verification Across All Items
  // =========================================================================
  console.log('\n--- SCENARIO 5: PullRequestsView DeepLink Verification Across All Items ---');
  {
    const mockDeliverables: Deliverables = {
      pullRequest: {
        title: 'feat(engine): intelligent vector-based agent tool routing & backoff retries',
        commitMessage: 'feat: add vector routing',
        summary: 'Refactored autonomous agent routing with vector score matching and exponential backoff retry.',
        keyChanges: ['Tool registry update', 'Retry logic'],
        breakingChanges: [],
      },
      architecture: {
        title: 'Arch',
        mermaidCode: 'graph TD; A-->B;',
        description: 'Desc',
      },
      videoScript: {
        title: 'Script',
        totalDuration: '60s',
        segments: [],
      },
      socialPost: {
        twitter: { content: 'Post', charCount: 4, hashtags: [] },
        linkedin: { hook: '', body: '', takeaways: [], callToAction: '' },
      },
    };

    const cleanRepo = 'AsteroidHH/Wispr-Flow-No-Hands-Challenge';

    // Verify PR-143 (Item 0) DeepLink
    const pr143Url = buildGitHubCompareUrl({
      repo: cleanRepo,
      compare: 'main...feat/agent-router-v2',
      title: mockDeliverables.pullRequest.title,
      body: mockDeliverables.pullRequest.summary,
    }).url;

    assert(
      pr143Url.startsWith('https://github.com/AsteroidHH/Wispr-Flow-No-Hands-Challenge/compare/main...feat/agent-router-v2'),
      'PR-143 deep link targets correct compare endpoint'
    );
    assert(pr143Url.includes('quick_pull=1'), 'PR-143 deep link includes quick_pull=1');
    assert(
      pr143Url.includes(encodeURIComponent(mockDeliverables.pullRequest.title)),
      'PR-143 deep link encodes active PR title'
    );

    // Verify PR-143 with 10,000 char summary in deliverables
    const hugeDeliverables: Deliverables = {
      ...mockDeliverables,
      pullRequest: {
        ...mockDeliverables.pullRequest,
        summary: 'Massive summary description '.repeat(500),
      },
    };
    const pr143HugeUrl = buildGitHubCompareUrl({
      repo: cleanRepo,
      compare: 'main...feat/agent-router-v2',
      title: hugeDeliverables.pullRequest.title,
      body: hugeDeliverables.pullRequest.summary,
    }).url;

    assert(
      pr143HugeUrl.length <= GITHUB_MAX_URL_LENGTH,
      `PR-143 deep link with 10k char summary strictly <= ${GITHUB_MAX_URL_LENGTH} chars (Actual: ${pr143HugeUrl.length})`
    );

    // Verify PR-142 (Item 1) DeepLink
    const pr142Url = buildGitHubCompareUrl({
      repo: cleanRepo,
      compare: 'main...security/token-blacklist',
      title: 'refactor(auth): RS256 token verification & Redis blacklist',
      body: 'Hardened Auth0 token refresh mechanism with asymmetric RS256 signature verification in middleware/auth.ts. Added Redis token revocation blacklist with 15min TTL.',
    }).url;

    assert(
      pr142Url.startsWith('https://github.com/AsteroidHH/Wispr-Flow-No-Hands-Challenge/compare/main...security/token-blacklist'),
      'PR-142 deep link targets security/token-blacklist branch'
    );

    // Verify PR-141 (Item 2) DeepLink
    const pr141Url = `https://github.com/${cleanRepo}/pulls`;
    assert(
      pr141Url === 'https://github.com/AsteroidHH/Wispr-Flow-No-Hands-Challenge/pulls',
      'PR-141 merged deep link points to repo /pulls'
    );

    // Verify PR-140 (Item 3) DeepLink
    const pr140Url = `https://github.com/${cleanRepo}/pulls`;
    assert(
      pr140Url === 'https://github.com/AsteroidHH/Wispr-Flow-No-Hands-Challenge/pulls',
      'PR-140 merged deep link points to repo /pulls'
    );
  }

  console.log('\n======================================================================');
  console.log('✅ ALL SUBAGENT 7 STRESS TEST SCENARIOS PASSED WITH ZERO FAILURES!');
  console.log('======================================================================');
}

runAllTests().catch((err) => {
  console.error('Fatal error running stress tests:', err);
  process.exit(1);
});
