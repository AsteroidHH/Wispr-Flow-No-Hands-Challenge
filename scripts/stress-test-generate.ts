import { NextRequest } from 'next/server';
import {
  cleanMermaidSyntax,
  cleanVideoScript,
  getMockFallbackForPreset,
  validateAndNormalizeData,
  MAX_DIFF_CHARS,
  MAX_TRANSCRIPT_CHARS,
  POST,
  GET,
} from '../app/api/generate/route';
import { GenerateApiResponseData } from '../lib/types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`✅ PASS: ${message}`);
    passed++;
  }
}

// Direct Handler Invocation using NextRequest
async function invokePost(body?: string | null | Record<string, unknown> | unknown[], headers?: Record<string, string>) {
  let bodyStr: string | undefined;
  if (body === null) {
    bodyStr = 'null';
  } else if (typeof body === 'string') {
    bodyStr = body;
  } else if (body !== undefined) {
    bodyStr = JSON.stringify(body);
  }

  const req = new NextRequest('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(headers || {}),
    },
    body: bodyStr,
  });

  return POST(req);
}

async function runAllTests() {
  console.log('================================================================');
  console.log('🚀 SUBAGENT 1: /api/generate DEEP STRESS & AUDIT SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Unit & Core Logic Tests: cleanMermaidSyntax & cleanVideoScript
  // -------------------------------------------------------------
  console.log('--- 1. UNIT TESTING: Mermaid Sanitization & Repair ---');
  {
    // 1a. Stripping markdown fences
    const fencedMermaid = '```mermaid\nflowchart TD\n  A --> B\n```';
    const cleanedFenced = cleanMermaidSyntax(fencedMermaid);
    assert(!cleanedFenced.includes('```'), 'Markdown code fences stripped');
    assert(cleanedFenced.startsWith('flowchart TD'), 'Valid flowchart TD retained');

    // 1b. Missing header auto-fix
    const headerless = 'A --> B\nB --> C';
    const cleanedHeaderless = cleanMermaidSyntax(headerless);
    assert(cleanedHeaderless.startsWith('flowchart TD'), 'Auto-prepends flowchart TD header');

    // 1c. Unquoted parentheses in node brackets repair
    const unquotedParens = 'flowchart TD\n  A[Client (Web)] --> B[Gateway (Auth)]';
    const cleanedParens = cleanMermaidSyntax(unquotedParens);
    assert(cleanedParens.includes('A["Client (Web)"]'), 'Auto-quotes unquoted parenthesis in node label A');
    assert(cleanedParens.includes('B["Gateway (Auth)"]'), 'Auto-quotes unquoted parenthesis in node label B');

    // 1d. Unquoted colon in node brackets repair
    const unquotedColon = 'flowchart TD\n  A[Cache: Redis] --> B';
    const cleanedColon = cleanMermaidSyntax(unquotedColon);
    assert(cleanedColon.includes('A["Cache: Redis"]'), 'Auto-quotes unquoted colons in node label');

    // 1e. Already quoted node labels are not double-quoted
    const alreadyQuoted = 'flowchart TD\n  A["Client (Web)"] --> B["Gateway: API"]';
    const cleanedQuoted = cleanMermaidSyntax(alreadyQuoted);
    assert(cleanedQuoted.includes('A["Client (Web)"]'), 'Does not double quote already quoted label');
    assert(!cleanedQuoted.includes('"""'), 'No triple quote artifacts');

    // 1f. Null, undefined, empty string handling
    assert(cleanMermaidSyntax(null).includes('flowchart TD'), 'Null input produces valid fallback');
    assert(cleanMermaidSyntax(undefined).includes('flowchart TD'), 'Undefined input produces valid fallback');
    assert(cleanMermaidSyntax('   ').includes('flowchart TD'), 'Blank whitespace produces valid fallback');
  }

  console.log('\n--- 2. UNIT TESTING: Video Script Normalization ---');
  {
    // 2a. Empty or invalid array
    const emptyScript = cleanVideoScript([]);
    assert(Array.isArray(emptyScript) && emptyScript.length >= 2, 'Empty array falls back to standard script segments');
    const firstEmpty = emptyScript ? emptyScript[0] : undefined;
    assert(Boolean(firstEmpty && typeof firstEmpty.timestamp === 'string'), 'Timestamp is string');
    assert(Boolean(firstEmpty && typeof firstEmpty.visualCue === 'string'), 'Visual cue is string');
    assert(Boolean(firstEmpty && typeof firstEmpty.spokenLine === 'string'), 'Spoken line is string');

    // 2b. Non-array inputs
    assert(Boolean(cleanVideoScript(null)?.length), 'Null returns fallback array');
    assert(Boolean(cleanVideoScript({ foo: 'bar' })?.length), 'Object returns fallback array');

    // 2c. Segments with missing fields
    const partialSegments = [
      { audio: 'Spoken line from audio key' },
      { timestamp: '01:00 - 01:30' },
      null,
    ];
    const normalized = cleanVideoScript(partialSegments);
    assert(Boolean(normalized && normalized.length === 3), 'All 3 items processed');
    const norm0 = normalized ? normalized[0] : undefined;
    const norm1 = normalized ? normalized[1] : undefined;
    const norm2 = normalized ? normalized[2] : undefined;
    assert(norm0?.spokenLine === 'Spoken line from audio key', 'Audio key migrated to spokenLine');
    assert(Boolean(norm1?.spokenLine && norm1.spokenLine.length > 0), 'Missing spokenLine got fallback');
    assert(Boolean(norm2?.visualCue && norm2.visualCue.length > 0), 'Null segment normalized safely');
  }

  console.log('\n--- 3. UNIT TESTING: validateAndNormalizeData Contract Guarantees ---');
  {
    // 3a. Completely malformed raw JSON from LLM
    const normalizedNull = validateAndNormalizeData(null);
    assert(typeof normalizedNull.prTitle === 'string', 'prTitle guaranteed on null');
    assert(typeof normalizedNull.commitMessage === 'string', 'commitMessage guaranteed on null');
    assert(typeof normalizedNull.prMarkdown === 'string', 'prMarkdown guaranteed on null');
    assert(typeof normalizedNull.mermaidSyntax === 'string', 'mermaidSyntax guaranteed on null');
    assert(Array.isArray(normalizedNull.videoScript), 'videoScript guaranteed array on null');
    assert(typeof normalizedNull.socialPost === 'string', 'socialPost guaranteed on null');

    // 3b. Partial LLM output with numbers/nulls in string fields
    const corruptedLLM = {
      prTitle: 12345,
      commitMessage: null,
      prMarkdown: '   ',
      mermaidSyntax: '```mermaid\nflowchart TD\n  A[Test (Parens)] --> B\n```',
      videoScript: 'invalid string instead of array',
      socialPost: undefined,
    };
    const validated = validateAndNormalizeData(corruptedLLM);
    assert(Boolean(validated && typeof validated.prTitle === 'string' && validated.prTitle.length > 0), 'Number prTitle replaced by fallback string');
    assert(Boolean(validated && typeof validated.commitMessage === 'string' && validated.commitMessage.length > 0), 'Null commitMessage replaced by fallback string');
    assert(Boolean(validated && typeof validated.prMarkdown === 'string' && validated.prMarkdown.length > 0), 'Empty prMarkdown replaced by fallback');
    assert(Boolean(validated && validated.mermaidSyntax && validated.mermaidSyntax.includes('A["Test (Parens)"]')), 'Mermaid syntax repaired and code fences stripped');
    assert(Boolean(validated && Array.isArray(validated.videoScript) && validated.videoScript.length > 0), 'Invalid string videoScript normalized to valid array');
    assert(Boolean(validated && typeof validated.socialPost === 'string' && validated.socialPost.length > 0), 'Undefined socialPost replaced by fallback');
  }

  // -------------------------------------------------------------
  // Route Handler Scenario Stress Testing
  // -------------------------------------------------------------
  console.log('\n--- 4. SCENARIO A: Empty Payloads ({}, "", null body, empty string) ---');
  {
    // 4a. Empty object {}
    const resEmptyObj = await invokePost({});
    assert(resEmptyObj.status === 200, 'Empty object returns HTTP 200');
    const jsonEmptyObj = await resEmptyObj.json();
    assert(jsonEmptyObj.success === true, 'Empty object returns success: true');
    assert(jsonEmptyObj.source === 'mock_fallback_empty_payload', 'Source is mock_fallback_empty_payload');
    assert(Boolean(jsonEmptyObj.data?.prTitle), 'Deliverables contain prTitle');

    // 4b. Raw string "null"
    const resNullStr = await invokePost('null');
    assert(resNullStr.status === 200, 'Body "null" returns HTTP 200');
    const jsonNullStr = await resNullStr.json();
    assert(jsonNullStr.success === true, 'Body "null" returns success: true');
    assert(jsonNullStr.source === 'mock_fallback_empty_payload', 'Source is mock_fallback_empty_payload');

    // 4c. Completely empty body ""
    const resEmptyStr = await invokePost('');
    assert(resEmptyStr.status === 200, 'Empty string body returns HTTP 200');
    const jsonEmptyStr = await resEmptyStr.json();
    assert(jsonEmptyStr.success === true, 'Empty string body returns success: true');

    // 4d. Empty POST without body
    const resNoBody = await invokePost();
    assert(resNoBody.status === 200, 'POST with omitted body returns HTTP 200');
    const jsonNoBody = await resNoBody.json();
    assert(jsonNoBody.success === true, 'Omitted body returns success: true');
  }

  console.log('\n--- 5. SCENARIO B: Extreme Size Payloads (100k+ chars diff, 50k+ chars transcript) ---');
  {
    const giantDiff = '--- a/large/file.ts\n+++ b/large/file.ts\n@@ -1,5 +1,10 @@\n+ export const x = 42;\n'.repeat(2500); // ~175,000 chars
    const giantTranscript = 'We completely refactored the entire edge pipeline and database layer. '.repeat(1000); // ~70,000 chars

    assert(giantDiff.length > 100000, `Constructed giant diff (${giantDiff.length} chars > 100k)`);
    assert(giantTranscript.length > 50000, `Constructed giant transcript (${giantTranscript.length} chars > 50k)`);

    const start = Date.now();
    const resGiant = await invokePost({
      transcript: giantTranscript,
      diff: giantDiff,
    });
    const duration = Date.now() - start;

    assert(resGiant.status === 200, 'Extreme size payload returns HTTP 200');
    const jsonGiant = await resGiant.json();
    assert(jsonGiant.success === true, 'Extreme payload returns success: true');
    assert(Boolean(jsonGiant.data?.prTitle), 'Giant payload processed and deliverables returned');
    assert(Boolean(jsonGiant.data?.mermaidSyntax), 'Mermaid syntax generated');
    console.log(`⏱️ Extreme payload processed in ${duration}ms (no timeout or memory crash)`);
  }

  console.log('\n--- 6. SCENARIO C: Malformed JSON & Adversarial String Inputs ---');
  {
    // 6a. Malformed JSON syntax
    const resMalformed = await invokePost('{"transcript": "broken json with unclosed string');
    assert(resMalformed.status === 200, 'Malformed JSON returns HTTP 200 (graceful fallback)');
    const jsonMalformed = await resMalformed.json();
    assert(jsonMalformed.success === true, 'Malformed JSON handled gracefully');

    // 6b. JSON array instead of object
    const resArray = await invokePost([1, 'foo', true, { transcript: 'inside array' }]);
    assert(resArray.status === 200, 'JSON array body returns HTTP 200');
    const jsonArray = await resArray.json();
    assert(jsonArray.success === true, 'JSON array body handled safely');

    // 6c. Null bytes and binary-like strings
    const resNullBytes = await invokePost({
      transcript: 'Voice transcript with \u0000 null bytes and \uFFFF unicode edge cases',
      diff: 'diff --git\u0000binary content',
    });
    assert(resNullBytes.status === 200, 'Null bytes payload returns HTTP 200');
    const jsonNullBytes = await resNullBytes.json();
    assert(jsonNullBytes.success === true, 'Null bytes processed without server crash');

    // 6d. SQL Injection / XSS adversarial string inputs
    const adversarialScript = `'; DROP TABLE deliverables; -- <script>alert("xss")</script>`;
    const resAdversarial = await invokePost({
      transcript: adversarialScript,
      diff: adversarialScript,
    });
    assert(resAdversarial.status === 200, 'Adversarial XSS/SQL string returns HTTP 200');
    const jsonAdversarial = await resAdversarial.json();
    assert(jsonAdversarial.success === true, 'Adversarial string sanitized safely');
    assert(typeof jsonAdversarial.data?.prTitle === 'string', 'prTitle is clean string');
  }

  console.log('\n--- 7. SCENARIO D: Missing GEMINI_API_KEY Environment Variable ---');
  {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const resNoKey = await invokePost({
        transcript: 'Testing without API key configured on server',
        diff: 'diff --git a/file.ts b/file.ts',
      });
      assert(resNoKey.status === 200, 'Missing API key returns HTTP 200');
      const jsonNoKey = await resNoKey.json();
      assert(jsonNoKey.success === true, 'Missing API key returns success: true');
      assert(jsonNoKey.source === 'mock_fallback_no_api_key', 'Handled via mock_fallback_no_api_key');
      assert(Boolean(jsonNoKey.data?.prTitle), 'High quality mock deliverables generated');
      assert(Array.isArray(jsonNoKey.data?.videoScript), 'Video script segments array populated');
    } finally {
      if (originalKey) {
        process.env.GEMINI_API_KEY = originalKey;
      }
    }
  }

  console.log('\n--- 8. SCENARIO E: High-Concurrency Stress Test (20 Parallel Requests) ---');
  {
    const CONCURRENCY = 20;
    console.log(`Executing ${CONCURRENCY} concurrent requests simultaneously...`);

    const start = Date.now();
    const requests = Array.from({ length: CONCURRENCY }).map((_, i) => {
      const presets = ['auth-refactor', 'database-migration', 'performance-audit'];
      const selectedPreset = presets[i % presets.length];
      return invokePost({
        transcript: `Concurrent worker ${i + 1} processing refactor for ${selectedPreset}`,
        diff: `diff --git a/worker${i}.ts b/worker${i}.ts\n+ console.log("worker ${i}");`,
        preset: selectedPreset,
      }).then(async res => {
        const json = await res.json();
        return { status: res.status, success: json.success, prTitle: json.data?.prTitle };
      });
    });

    const results = await Promise.all(requests);
    const duration = Date.now() - start;

    assert(results.length === CONCURRENCY, `All ${CONCURRENCY} concurrent requests completed`);
    const all200 = results.every(r => r.status === 200);
    assert(all200, `All ${CONCURRENCY} concurrent requests returned HTTP 200`);
    const allSuccessful = results.every(r => r.success === true);
    assert(allSuccessful, `All ${CONCURRENCY} concurrent requests returned success: true`);
    const allHaveTitles = results.every(r => typeof r.prTitle === 'string' && r.prTitle.length > 0);
    assert(allHaveTitles, `All ${CONCURRENCY} concurrent requests produced valid prTitles`);

    console.log(`⚡ ${CONCURRENCY} concurrent requests finished in ${duration}ms (~${(duration / CONCURRENCY).toFixed(1)}ms per request)`);
  }

  console.log('\n--- 9. SCENARIO F: Preset-Grounded Selection (Instant Deliverables) ---');
  {
    const resPreset = await invokePost({ preset: 'auth-refactor' });
    assert(resPreset.status === 200, 'Preset-grounded request returns HTTP 200');
    const jsonPreset = await resPreset.json();
    assert(jsonPreset.success === true, 'Preset-grounded request returns success: true');
    assert(jsonPreset.source === 'preset_grounded', 'Source is preset_grounded');
    assert(jsonPreset.data.prTitle.includes('OAuth2 PKCE'), 'Returns ground-truth auth refactor PR title');
  }

  console.log('\n--- 10. SCENARIO G: GET Diagnostic Health Check Handler ---');
  {
    const resGet = await GET();
    assert(resGet.status === 200, 'GET /api/generate returns HTTP 200');
    const jsonGet = await resGet.json();
    assert(jsonGet.status === 'ok', 'Status is ok');
    assert(jsonGet.model === 'gemini-2.5-flash', 'Model is gemini-2.5-flash');
    assert(jsonGet.maxDiffChars === MAX_DIFF_CHARS, 'maxDiffChars exposed correctly');
    assert(jsonGet.maxTranscriptChars === MAX_TRANSCRIPT_CHARS, 'maxTranscriptChars exposed correctly');
  }

  console.log('\n================================================================');
  console.log(`🎉 ALL STRESS TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});