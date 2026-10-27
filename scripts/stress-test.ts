import { transformApiResponseToDeliverables } from '../lib/transform';
import { JUDGE_PRESETS, getPresetById, getDefaultPreset } from '../lib/presets';
import { Deliverables, Preset } from '../lib/types';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: unknown;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, errorMsg?: string) {
  if (condition) {
    results.push({ name: testName, passed: true });
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    results.push({ name: testName, passed: false, error: errorMsg || 'Assertion failed' });
    console.error(`  ❌ FAIL: ${testName} - ${errorMsg || 'Assertion failed'}`);
  }
}

function validateDeliverablesSchema(d: Deliverables, context: string): string[] {
  const errors: string[] = [];
  if (!d) return [`[${context}] Deliverables object is null or undefined`];

  // PullRequest
  if (!d.pullRequest) errors.push(`[${context}] Missing pullRequest`);
  else {
    if (typeof d.pullRequest.title !== 'string' || !d.pullRequest.title) errors.push(`[${context}] PR title not non-empty string`);
    if (typeof d.pullRequest.commitMessage !== 'string' || !d.pullRequest.commitMessage) errors.push(`[${context}] PR commitMessage not non-empty string`);
    if (typeof d.pullRequest.summary !== 'string' || !d.pullRequest.summary) errors.push(`[${context}] PR summary not non-empty string`);
    if (!Array.isArray(d.pullRequest.keyChanges) || d.pullRequest.keyChanges.length === 0) errors.push(`[${context}] PR keyChanges empty or not array`);
    if (!Array.isArray(d.pullRequest.breakingChanges)) errors.push(`[${context}] PR breakingChanges not array`);
    if (typeof d.pullRequest.prMarkdown !== 'string' || !d.pullRequest.prMarkdown) errors.push(`[${context}] PR prMarkdown missing or empty`);
  }

  // Architecture
  if (!d.architecture) errors.push(`[${context}] Missing architecture`);
  else {
    if (typeof d.architecture.title !== 'string' || !d.architecture.title) errors.push(`[${context}] Arch title missing`);
    if (typeof d.architecture.mermaidCode !== 'string' || !d.architecture.mermaidCode) errors.push(`[${context}] Arch mermaidCode missing`);
    if (d.architecture.mermaidCode.startsWith('```')) errors.push(`[${context}] Arch mermaidCode has unstripped markdown fences`);
    if (typeof d.architecture.description !== 'string' || !d.architecture.description) errors.push(`[${context}] Arch description missing`);
  }

  // VideoScript
  if (!d.videoScript) errors.push(`[${context}] Missing videoScript`);
  else {
    if (typeof d.videoScript.title !== 'string' || !d.videoScript.title) errors.push(`[${context}] Video title missing`);
    if (typeof d.videoScript.totalDuration !== 'string' || !d.videoScript.totalDuration) errors.push(`[${context}] Video totalDuration missing`);
    if (!Array.isArray(d.videoScript.segments) || d.videoScript.segments.length === 0) errors.push(`[${context}] Video segments array empty`);
    else {
      d.videoScript.segments.forEach((seg, i) => {
        if (typeof seg.timestamp !== 'string' || !seg.timestamp) errors.push(`[${context}] Segment ${i} invalid timestamp`);
        if (typeof seg.audio !== 'string' || !seg.audio) errors.push(`[${context}] Segment ${i} invalid audio`);
        if (typeof seg.spokenLine !== 'string' || !seg.spokenLine) errors.push(`[${context}] Segment ${i} invalid spokenLine`);
        if (typeof seg.visualCue !== 'string' || !seg.visualCue) errors.push(`[${context}] Segment ${i} invalid visualCue`);
        if (seg.timestamp.includes('00:60') || seg.timestamp.includes('00:90') || seg.timestamp.includes('00:0 ')) {
          errors.push(`[${context}] Segment ${i} has invalid time calculation: ${seg.timestamp}`);
        }
      });
    }
  }

  // SocialPost
  if (!d.socialPost) errors.push(`[${context}] Missing socialPost`);
  else {
    if (typeof d.socialPost.rawPost !== 'string' || !d.socialPost.rawPost) errors.push(`[${context}] socialPost rawPost missing`);
    if (!d.socialPost.twitter) errors.push(`[${context}] Missing twitter`);
    else {
      if (typeof d.socialPost.twitter.content !== 'string' || !d.socialPost.twitter.content) errors.push(`[${context}] Twitter content missing`);
      if (typeof d.socialPost.twitter.charCount !== 'number' || d.socialPost.twitter.charCount < 0) errors.push(`[${context}] Twitter charCount invalid`);
      if (!Array.isArray(d.socialPost.twitter.hashtags) || d.socialPost.twitter.hashtags.length === 0) errors.push(`[${context}] Twitter hashtags empty`);
    }
    if (!d.socialPost.linkedin) errors.push(`[${context}] Missing linkedin`);
    else {
      if (typeof d.socialPost.linkedin.hook !== 'string' || !d.socialPost.linkedin.hook) errors.push(`[${context}] LinkedIn hook missing`);
      if (typeof d.socialPost.linkedin.body !== 'string' || !d.socialPost.linkedin.body) errors.push(`[${context}] LinkedIn body missing`);
      if (!Array.isArray(d.socialPost.linkedin.takeaways) || d.socialPost.linkedin.takeaways.length === 0) errors.push(`[${context}] LinkedIn takeaways empty`);
      if (typeof d.socialPost.linkedin.callToAction !== 'string' || !d.socialPost.linkedin.callToAction) errors.push(`[${context}] LinkedIn CTA missing`);
    }
  }

  return errors;
}

console.log('🧪 ========================================================');
console.log('🧪 Wispr Flow / ShipSpeak Subagent 3 Multi-Scenario Stress Test');
console.log('🧪 ========================================================\n');

// ----------------------------------------------------
// Scenario a: null, undefined, empty object {}
// ----------------------------------------------------
console.log('--- [Scenario a] Testing null, undefined, and empty inputs ---');

const resNull = transformApiResponseToDeliverables(null);
const errNull = validateDeliverablesSchema(resNull, 'Scenario a (null)');
assert(errNull.length === 0, 'Scenario a.1: null payload returns 100% valid Deliverables', errNull.join('; '));

const resUndefined = transformApiResponseToDeliverables(undefined);
const errUndefined = validateDeliverablesSchema(resUndefined, 'Scenario a (undefined)');
assert(errUndefined.length === 0, 'Scenario a.2: undefined payload returns 100% valid Deliverables', errUndefined.join('; '));

const resEmpty = transformApiResponseToDeliverables({});
const errEmpty = validateDeliverablesSchema(resEmpty, 'Scenario a ({})');
assert(errEmpty.length === 0, 'Scenario a.3: empty object {} returns 100% valid Deliverables', errEmpty.join('; '));

// Non-object primitives (numbers, booleans, arrays)
const resNumber = transformApiResponseToDeliverables(42 as unknown as object);
const errNumber = validateDeliverablesSchema(resNumber, 'Scenario a (number 42)');
assert(errNumber.length === 0, 'Scenario a.4: numeric primitive returns valid Deliverables', errNumber.join('; '));

const resArray = transformApiResponseToDeliverables(['invalid'] as unknown as object);
const errArray = validateDeliverablesSchema(resArray, 'Scenario a (array)');
assert(errArray.length === 0, 'Scenario a.5: array input returns valid Deliverables', errArray.join('; '));

// ----------------------------------------------------
// Scenario b: Missing fields
// ----------------------------------------------------
console.log('\n--- [Scenario b] Testing missing and mismatched fields ---');

const resMissingFields = transformApiResponseToDeliverables({
  prMarkdown: undefined,
  videoScript: null as unknown as undefined,
  socialPost: 123 as unknown as string,
  prTitle: 404 as unknown as string,
  commitMessage: false as unknown as string,
  mermaidSyntax: null as unknown as string,
});
const errMissing = validateDeliverablesSchema(resMissingFields, 'Scenario b (missing fields)');
assert(errMissing.length === 0, 'Scenario b.1: payload with undefined/null/numeric fields returns valid Deliverables', errMissing.join('; '));
assert(typeof resMissingFields.pullRequest.title === 'string', 'Scenario b.2: PR title coerced to string');
assert(typeof resMissingFields.pullRequest.commitMessage === 'string', 'Scenario b.3: commit message coerced to string');
assert(resMissingFields.socialPost.twitter.content.length > 0, 'Scenario b.4: socialPost safely transformed from number 123');
assert(resMissingFields.architecture.mermaidCode.includes('flowchart'), 'Scenario b.5: null mermaidSyntax safely replaced with flowchart fallback');

// ----------------------------------------------------
// Scenario c: Malformed segments in videoScript
// ----------------------------------------------------
console.log('\n--- [Scenario c] Testing malformed segments in videoScript ---');

const resMalformedSegments = transformApiResponseToDeliverables({
  videoScript: [
    '00:00 - 00:30: Opening introduction walk-through' as unknown as { timestamp: string; visualCue: string; spokenLine: string },
    null as unknown as { timestamp: string; visualCue: string; spokenLine: string },
    { timestamp: null, visualCue: null, spokenLine: null } as unknown as { timestamp: string; visualCue: string; spokenLine: string },
    { timestamp: '00:90', visualCue: 'Testing visual cue', spokenLine: 456 as unknown as string },
    { stage: 'Live Demo', visualCue: 'Browser screen', spokenLine: 'Check this out' } as unknown as { timestamp: string; visualCue: string; spokenLine: string },
  ],
});

const errMalformed = validateDeliverablesSchema(resMalformedSegments, 'Scenario c (malformed segments)');
assert(errMalformed.length === 0, 'Scenario c.1: malformed videoScript segments return 100% valid Deliverables', errMalformed.join('; '));
assert(resMalformedSegments.videoScript.segments.length === 5, 'Scenario c.2: all 5 segments preserved and normalized');
assert(Boolean(resMalformedSegments.videoScript.segments[0]?.spokenLine?.includes('Opening introduction')), 'Scenario c.3: string segment narration extracted');
assert(resMalformedSegments.videoScript.segments[2]?.visualCue === 'Screen view', 'Scenario c.4: null visualCue safely defaulted');
assert(typeof resMalformedSegments.videoScript.segments[3]?.spokenLine === 'string', 'Scenario c.5: numeric spokenLine safely stringified');
assert(resMalformedSegments.videoScript.segments[4]?.stage === 'Live Demo', 'Scenario c.6: existing stage property preserved');

// Verify timestamp calculation bug is resolved
const timestamps = resMalformedSegments.videoScript.segments.map(s => s.timestamp);
assert(!timestamps.some(t => t.includes('00:0 ') || t.includes('00:60')), 'Scenario c.7: no single-digit or invalid 60-second time calculation bugs');

// ----------------------------------------------------
// Scenario d: Huge markdown with adversarial blocks
// ----------------------------------------------------
console.log('\n--- [Scenario d] Testing huge & adversarial markdown blocks ---');

// Build 15,000 lines markdown with adversarial fences, checklist noise, and breaking changes
const adversarialLines: string[] = [
  '## Overview',
  '  Deeply nested overview paragraph describing the massive enterprise refactoring.',
  '',
  '## Detailed Changes',
  '- [x] Completed task checklist that should NOT be in keyChanges',
  '- [ ] Pending checklist item that should NOT be in keyChanges',
  '- Legitimate key change 1: migrated session verification to edge middleware',
  '- Legitimate key change 2: added distributed Redis revocation cache with TTL',
  '- Legitimate key change 3: standardized Bearer authorization token header',
  '',
  '### Breaking Changes',
  '- user_metadata.legacy_id field removed; consumers must adopt UUIDv4 sub',
  '- x-session-id header parser decommissioned across all edge gates',
  '',
  '## Verification Checklist',
  '- [ ] Run unit tests: npm test',
  '- [ ] Verify edge latency in staging',
  '',
  '```typescript',
  '// Code block with fake heading inside',
  '// ## Fake Heading Inside Code Block',
  'const x = 1;',
  '```',
];

// Append 10,000 filler lines
for (let i = 0; i < 10000; i++) {
  adversarialLines.push(`Filler markdown line ${i} with random content and symbols <>&"'\``);
}

const hugeMarkdown = adversarialLines.join('\n');
const startTime = Date.now();
const resAdversarial = transformApiResponseToDeliverables({
  prTitle: 'feat(core): massive enterprise architecture overhaul',
  commitMessage: 'feat: massive overhaul',
  prMarkdown: hugeMarkdown,
  mermaidSyntax: '```mermaid\nflowchart TD\n  A["User Request"] --> B["Edge Middleware"]\n  B --> C["Redis Cache"]\n```',
  socialPost: 'Shipped zero-latency auth overhaul #nextjs #redis #security',
});
const durationMs = Date.now() - startTime;

const errAdversarial = validateDeliverablesSchema(resAdversarial, 'Scenario d (adversarial)');
assert(errAdversarial.length === 0, 'Scenario d.1: huge adversarial markdown returns valid Deliverables', errAdversarial.join('; '));
assert(durationMs < 1000, `Scenario d.2: processed 10,000+ line markdown in ${durationMs}ms (sub-second performance)`);
assert(resAdversarial.pullRequest.breakingChanges.length === 2, 'Scenario d.3: accurately extracted exactly 2 breaking changes');
assert(
  !resAdversarial.pullRequest.breakingChanges.includes('Breaking Changes'),
  'Scenario d.4: section header "Breaking Changes" NOT included as an item'
);
assert(
  !resAdversarial.pullRequest.keyChanges.some(k => k.includes('[x]') || k.includes('[ ]')),
  'Scenario d.5: checklist items (- [x], - [ ]) filtered out of keyChanges'
);
assert(
  resAdversarial.architecture.mermaidCode.startsWith('flowchart TD'),
  'Scenario d.6: mermaidSyntax markdown fences stripped cleanly'
);
assert(
  resAdversarial.socialPost.twitter.hashtags.includes('#redis') && resAdversarial.socialPost.twitter.hashtags.includes('#nextjs'),
  'Scenario d.7: hashtags dynamically extracted from socialPost'
);

// Test negative breaking changes section ("None")
const resNegativeBreaking = transformApiResponseToDeliverables({
  prMarkdown: `## Overview\nMinor patch\n\n## Changes\n- Small bug fix\n\n### Breaking Changes\n- None\n\n## Checklist\n- [ ] Done`,
});
assert(
  resNegativeBreaking.pullRequest.breakingChanges.length === 0,
  'Scenario d.8: negative breaking changes ("- None") results in empty array (zero false alarms)'
);

// ----------------------------------------------------
// Scenario e: Presets validation (100% valid schema, zero nulls)
// ----------------------------------------------------
console.log('\n--- [Scenario e] Validating presets in lib/presets.ts ---');

assert(JUDGE_PRESETS.length === 3, 'Scenario e.1: Exactly 3 judge presets registered');

JUDGE_PRESETS.forEach((preset: Preset) => {
  assert(Boolean(preset.id && preset.name && preset.tagline && preset.iconName), `Preset ${preset.id}: metadata complete`);
  assert(Boolean(preset.voiceTranscript && preset.gitDiff), `Preset ${preset.id}: voiceTranscript and gitDiff present`);
  
  const errs = validateDeliverablesSchema(preset.deliverables, `Preset ${preset.id}`);
  assert(errs.length === 0, `Preset ${preset.id}: 100% valid Deliverables schema with zero nulls/undefined`, errs.join('; '));
  
  // Specific check for spokenLine on every segment
  const segmentsWithSpokenLine = preset.deliverables.videoScript.segments.filter(s => typeof s.spokenLine === 'string' && s.spokenLine.length > 0);
  assert(
    segmentsWithSpokenLine.length === preset.deliverables.videoScript.segments.length,
    `Preset ${preset.id}: spokenLine defined on 100% of video script segments`
  );
  
  // Specific check for rawPost
  assert(
    typeof preset.deliverables.socialPost.rawPost === 'string' && preset.deliverables.socialPost.rawPost.length > 0,
    `Preset ${preset.id}: rawPost defined on socialPost`
  );
  
  // Specific check for prMarkdown
  assert(
    typeof preset.deliverables.pullRequest.prMarkdown === 'string' && preset.deliverables.pullRequest.prMarkdown.length > 0,
    `Preset ${preset.id}: prMarkdown defined on pullRequest`
  );
});

// Test preset getters & parameter contracts
assert(getPresetById('auth-refactor')?.id === 'auth-refactor', 'Scenario e.2: getPresetById returns correct preset');
assert(getPresetById('  auth-refactor  ')?.id === 'auth-refactor', 'Scenario e.3: getPresetById handles whitespace-trimmed ID');
assert(getPresetById('unknown-id') === undefined, 'Scenario e.4: getPresetById returns undefined for unknown ID');
assert(getPresetById('') === undefined, 'Scenario e.5: getPresetById returns undefined for empty string');
assert(getPresetById(null as unknown as string) === undefined, 'Scenario e.6: getPresetById handles null ID');
assert(getDefaultPreset().id === 'auth-refactor', 'Scenario e.7: getDefaultPreset returns default preset');

// ----------------------------------------------------
// Invariant & Pure Function / Determinism Verification
// ----------------------------------------------------
console.log('\n--- [Invariant & State Transition Audit] ---');

// 1. Pure deterministic transform (no input mutation)
const frozenInput = Object.freeze({
  prTitle: 'feat: immutable test',
  commitMessage: 'feat: immutable',
  prMarkdown: '## Overview\nImmutable summary\n\n## Changes\n- Change 1\n- Change 2',
  mermaidSyntax: '```mermaid\nflowchart TD\n  A-->B\n```',
  videoScript: Object.freeze([
    Object.freeze({ timestamp: '00:00 - 00:30', spokenLine: 'Voice line', visualCue: 'Visual cue' })
  ]),
  socialPost: 'Post text #tech'
});

const out1 = transformApiResponseToDeliverables(frozenInput);
const out2 = transformApiResponseToDeliverables(frozenInput);
assert(JSON.stringify(out1) === JSON.stringify(out2), 'Invariant 1: Transform is pure and deterministic');

// 2. Strict Invariant Checks on Deliverables Output
assert(Array.isArray(out1.pullRequest.keyChanges), 'Invariant 2: keyChanges is always an array');
assert(!out1.pullRequest.keyChanges.some(k => k.startsWith('- [ ]') || k.startsWith('- [x]')), 'Invariant 3: keyChanges never contains checklist syntax');
assert(Array.isArray(out1.pullRequest.breakingChanges), 'Invariant 4: breakingChanges is always an array');
assert(!out1.pullRequest.breakingChanges.includes('Breaking Changes'), 'Invariant 5: breakingChanges never contains section heading');
assert(!out1.pullRequest.breakingChanges.some(b => ['none', 'n/a'].includes(b.toLowerCase())), 'Invariant 6: breakingChanges never contains negative tokens');
assert(!out1.architecture.mermaidCode.includes('```'), 'Invariant 7: mermaidCode never contains markdown code fences');
assert(out1.videoScript.segments.every(s => typeof s.spokenLine === 'string' && s.spokenLine.length > 0), 'Invariant 8: every segment contains valid spokenLine');
assert(out1.videoScript.segments.every(s => typeof s.visualCue === 'string' && s.visualCue.length > 0), 'Invariant 9: every segment contains valid visualCue');
assert(out1.videoScript.segments.every(s => /^\d{1,2}:\d{2}/.test(s.timestamp)), 'Invariant 10: every segment contains valid mm:ss timestamp');


// ----------------------------------------------------
// Summary
// ----------------------------------------------------
console.log('\n========================================================');
const totalPassed = results.filter(r => r.passed).length;
const totalFailed = results.filter(r => !r.passed).length;
console.log(`📊 Test Summary: ${totalPassed} Passed, ${totalFailed} Failed (Total: ${results.length})`);
console.log('========================================================\n');

if (totalFailed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL MULTI-SCENARIO STRESS TESTS PASSED WITH 100% SUCCESS!');
}
