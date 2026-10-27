import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { getPresetById, JUDGE_PRESETS } from '@/lib/presets';
import { GenerateApiResponseData } from '@/lib/types';

// Payload limits to prevent memory exhaustion, token blowout, or API rejection
export const MAX_DIFF_CHARS = 32000;
export const MAX_TRANSCRIPT_CHARS = 24000;

// Structured response schema definition for Gemini
const generateResponseSchema = {
  type: Type.OBJECT,
  properties: {
    prTitle: {
      type: Type.STRING,
      description: 'Conventional commit style PR title e.g. feat(auth): ...',
    },
    commitMessage: {
      type: Type.STRING,
      description: 'Clean git commit message',
    },
    prMarkdown: {
      type: Type.STRING,
      description:
        'Comprehensive PR Markdown string containing ## Overview, ## Detailed Changes, and ## Environment Setup Checklist',
    },
    mermaidSyntax: {
      type: Type.STRING,
      description:
        'Valid flowchart TD or graph TD diagram syntax without syntax-breaking symbols inside node brackets (labels must be properly quoted in double quotes like A["Client (Web)"] --> B["Gateway"])',
    },
    videoScript: {
      type: Type.ARRAY,
      description: '2-minute demo video script segments with timestamp buckets',
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: {
            type: Type.STRING,
            description: 'Timestamp bucket e.g. 00:00 - 00:20',
          },
          visualCue: {
            type: Type.STRING,
            description: 'Actionable visual cue for video recording or screen recording',
          },
          spokenLine: {
            type: Type.STRING,
            description: 'Exact spoken narration line for this segment',
          },
        },
        required: ['timestamp', 'visualCue', 'spokenLine'],
      },
    },
    socialPost: {
      type: Type.STRING,
      description:
        'Technical build-in-public social post formatted with an engaging hook, bullet points, and hashtags',
    },
  },
  required: [
    'prTitle',
    'commitMessage',
    'prMarkdown',
    'mermaidSyntax',
    'videoScript',
    'socialPost',
  ],
};

/**
 * Sanitizes and repairs Mermaid diagram syntax from LLM output.
 * Strips markdown code fences, guarantees a valid graph header,
 * and repairs unquoted parenthesis/colon inside node brackets.
 */
export function cleanMermaidSyntax(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) {
    return `flowchart TD
  Client["Client Request"] --> Gateway["API Gateway"]
  Gateway --> Service["ShipSpeak Engine"]
  Service --> Output["Generated Deliverables"]`;
  }

  let clean = raw.trim();

  // Strip markdown code fences if present (e.g. ```mermaid ... ```)
  clean = clean.replace(/^```(?:mermaid)?\s*/i, '').replace(/\s*```$/, '').trim();

  // Ensure valid diagram header
  const validHeaders = ['flowchart', 'graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram'];
  const hasValidHeader = validHeaders.some(header => clean.startsWith(header));
  if (!hasValidHeader) {
    clean = `flowchart TD\n  ${clean.split('\n').join('\n  ')}`;
  }

  // Auto-quote unquoted parentheses inside square brackets: e.g. A[Client (Web)] -> A["Client (Web)"]
  clean = clean.replace(/\[([^[\]"'\n]+\([^)\n]+\)[^[\]"'\n]*)\]/g, '["$1"]');

  // Auto-quote unquoted colons inside square brackets: e.g. A[Cache: Redis] -> A["Cache: Redis"]
  clean = clean.replace(/\[([^[\]"'\n]+:[^[\]"'\n]+)\]/g, '["$1"]');

  return clean;
}

/**
 * Validates and normalizes video script segments into strict schema.
 */
export function cleanVideoScript(raw: unknown): GenerateApiResponseData['videoScript'] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [
      {
        timestamp: '00:00 - 00:30',
        visualCue: 'Developer walkthrough of feature implementation',
        spokenLine: 'Here is what was built and shipped with ShipSpeak.',
      },
      {
        timestamp: '00:30 - 01:00',
        visualCue: 'Tour of architecture diagram and deliverables',
        spokenLine: 'All documentation and specs were synthesized voice-first in seconds.',
      },
      {
        timestamp: '01:00 - 01:30',
        visualCue: 'Live voice tweaking and card adjustments demonstration',
        spokenLine: 'Developers can speak natural language tweaks to update any card instantly.',
      },
      {
        timestamp: '01:30 - 02:00',
        visualCue: 'Final summary and production bundle download',
        spokenLine: 'Ready to ship with zero cognitive friction. ShipSpeak built for developers.',
      },
    ];
  }

  return raw.map((item, idx) => {
    const obj = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    const timestamp = typeof obj.timestamp === 'string' && obj.timestamp.trim()
      ? obj.timestamp.trim()
      : `00:${String(idx * 30).padStart(2, '0')} - 00:${String((idx + 1) * 30).padStart(2, '0')}`;
    const visualCue = typeof obj.visualCue === 'string' && obj.visualCue.trim()
      ? obj.visualCue.trim()
      : 'Walkthrough screen recording';
    const spokenLine = typeof obj.spokenLine === 'string' && obj.spokenLine.trim()
      ? obj.spokenLine.trim()
      : (typeof obj.audio === 'string' && obj.audio.trim()
          ? obj.audio.trim()
          : 'Demo audio narration segment');

    return { timestamp, visualCue, spokenLine };
  });
}

/**
 * Generates robust mock fallback data for presets or custom user input.
 */
export function getMockFallbackForPreset(presetId?: string, transcript?: string, diff?: string): GenerateApiResponseData {
  const preset = (presetId ? getPresetById(presetId) : null) || (JUDGE_PRESETS && JUDGE_PRESETS[0]) || null;

  if (preset && (!transcript || transcript === preset.voiceTranscript)) {
    const keyChangesList = (preset.deliverables?.pullRequest?.keyChanges || []).map(c => `- ${c}`).join('\n');
    const breakingChangesList = (preset.deliverables?.pullRequest?.breakingChanges || []).map(b => `- ${b}`).join('\n');
    const scriptSegments = (preset.deliverables?.videoScript?.segments || []).map(seg => ({
      timestamp: seg.timestamp || '00:00 - 00:30',
      visualCue: seg.visualCue || 'Screen walkthrough',
      spokenLine: seg.audio || seg.spokenLine || '',
    }));
    const twitterPost = preset.deliverables?.socialPost?.twitter?.content || 'Shipping update with ShipSpeak';
    const hashtags = (preset.deliverables?.socialPost?.twitter?.hashtags || ['#buildinpublic']).join(' ');

    return {
      prTitle: preset.deliverables?.pullRequest?.title || 'feat(auth): developer shipping pipeline',
      commitMessage: preset.deliverables?.pullRequest?.commitMessage || 'feat: developer shipping pipeline',
      prMarkdown: `## Overview\n${preset.deliverables?.pullRequest?.summary || 'Automated PR spec generated from voice and code context.'}\n\n## Detailed Changes\n${keyChangesList || '- Implemented core shipping improvements'}\n\n### Breaking Changes\n${breakingChangesList || '- None'}\n\n## Environment Setup Checklist\n- [ ] Configure environment variables\n- [ ] Run test suite: \`npm test\`\n- [ ] Verify edge deployment passes verification checks`,
      mermaidSyntax: cleanMermaidSyntax(preset.deliverables?.architecture?.mermaidCode || 'flowchart TD\n  Client --> Gateway'),
      videoScript: scriptSegments.length > 0 ? cleanVideoScript(scriptSegments) : cleanVideoScript([]),
      socialPost: `${twitterPost}\n\n${hashtags}`,
    };
  }

  const rawText = (transcript && transcript.trim()) || (preset?.voiceTranscript) || 'Voice-first last-mile shipping engine';
  const cleanFirstLine = rawText.trim().split('\n')[0]?.trim();
  const firstLine = (cleanFirstLine && cleanFirstLine.length > 0 ? cleanFirstLine : 'developer shipping pipeline').slice(0, 60);

  return {
    prTitle: `feat(core): ${firstLine}`,
    commitMessage: `feat: ${firstLine.slice(0, 50)}`,
    prMarkdown: `## Overview\n${rawText.slice(0, 280)}\n\n## Detailed Changes\n- Implemented voice-to-deliverables synthesis pipeline\n- Structured git diff context ingestion\n- Generated reactive diagrams and script timelines\n\n## Environment Setup Checklist\n- [ ] Ensure Node.js 18+ is installed\n- [ ] Set \`GEMINI_API_KEY\` in environment\n- [ ] Run \`npm run build\` to verify clean compilation`,
    mermaidSyntax: `flowchart TD
  VoiceIn["Voice Brain Dump"] --> Pipeline["ShipSpeak Synthesis Engine"]
  DiffIn["Git Diff / Context"] --> Pipeline
  Pipeline --> PR["GitHub PR & Spec"]
  Pipeline --> Diag["Mermaid Architecture"]
  Pipeline --> Script["2-Min Video Script"]
  Pipeline --> Social["Build-in-Public Post"]`,
    videoScript: [
      {
        timestamp: '00:00 - 00:20',
        visualCue: 'Developer talking into microphone with Wispr Flow indicator active',
        spokenLine: `Here is what we built: ${firstLine}. Instead of spending hours typing documentation, we talk and ship.`,
      },
      {
        timestamp: '00:20 - 00:55',
        visualCue: 'Tour of generated GitHub PR and Mermaid architecture diagram',
        spokenLine: 'Watch as our audio brain dump turns directly into an edge-ready pull request with full breaking changes notes.',
      },
      {
        timestamp: '00:55 - 01:30',
        visualCue: 'Screen recording showing interactive bento grid and voice tweak adjustments',
        spokenLine: 'Every card is voice-tweakable. Just speak your refinement and the AI updates the deliverable.',
      },
      {
        timestamp: '01:30 - 02:00',
        visualCue: 'Final splash card with GitHub repo link and Wispr Challenge badge',
        spokenLine: 'ShipSpeak removes the last-mile cognitive drag for builders. Try the demo today!',
      },
    ],
    socialPost: `🚀 Shipping ${firstLine}\n\nDevelopers spend 90% of their time coding, then burn out writing PRs, diagrams, and video scripts.\n\nToday we're launching ShipSpeak for the Wispr No Hand Challenge:\n• Voice brain dump -> GitHub PR with breaking changes\n• Auto-generated Mermaid architecture diagrams\n• 2-minute timed demo video script\n• Twitter & LinkedIn social drafts\n\nBuilt voice-first. Try it out! 👇\n\n#WisprNoHandChallenge #buildinpublic #webdev #ai`,
  };
}

/**
 * Validates, repairs, and guarantees contract satisfaction for Gemini output.
 */
export function validateAndNormalizeData(
  raw: unknown,
  fallbackPreset?: string,
  transcript?: string,
  diff?: string
): GenerateApiResponseData {
  const fallback = getMockFallbackForPreset(fallbackPreset, transcript, diff);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return fallback;
  }
  const obj = raw as Record<string, unknown>;

  const prTitle = typeof obj.prTitle === 'string' && obj.prTitle.trim()
    ? obj.prTitle.trim()
    : fallback.prTitle;

  const commitMessage = typeof obj.commitMessage === 'string' && obj.commitMessage.trim()
    ? obj.commitMessage.trim()
    : fallback.commitMessage;

  const prMarkdown = typeof obj.prMarkdown === 'string' && obj.prMarkdown.trim()
    ? obj.prMarkdown.trim()
    : fallback.prMarkdown;

  const mermaidSyntax = cleanMermaidSyntax(obj.mermaidSyntax) || fallback.mermaidSyntax;

  const videoScript = cleanVideoScript(obj.videoScript);

  const socialPost = typeof obj.socialPost === 'string' && obj.socialPost.trim()
    ? obj.socialPost.trim()
    : fallback.socialPost;

  return {
    prTitle,
    commitMessage,
    prMarkdown,
    mermaidSyntax,
    videoScript,
    socialPost,
  };
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/generate',
    model: 'gemini-2.5-flash',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    maxDiffChars: MAX_DIFF_CHARS,
    maxTranscriptChars: MAX_TRANSCRIPT_CHARS,
  });
}

export async function POST(req: NextRequest) {
  try {
    // Safely parse request body handling empty body, null, or malformed JSON
    let body: Record<string, unknown> = {};
    try {
      const text = await req.text();
      if (text && text.trim()) {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          body = parsed;
        }
      }
    } catch {
      body = {};
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      body = {};
    }

    const rawTranscript = typeof body.transcript === 'string' ? body.transcript : '';
    const rawDiff = typeof body.diff === 'string' ? body.diff : '';
    const rawPreset = typeof body.preset === 'string' ? body.preset.trim() : undefined;
    const preset = rawPreset && rawPreset.length <= 100 ? rawPreset : undefined;

    // Handle large payloads safely
    const safeDiff = rawDiff.length > MAX_DIFF_CHARS
      ? rawDiff.slice(0, MAX_DIFF_CHARS) + `\n\n... [Diff truncated: ${rawDiff.length - MAX_DIFF_CHARS} characters omitted for optimal processing]`
      : rawDiff;

    const safeTranscript = rawTranscript.length > MAX_TRANSCRIPT_CHARS
      ? rawTranscript.slice(0, MAX_TRANSCRIPT_CHARS).trim() + `\n\n... [Transcript truncated: ${rawTranscript.length - MAX_TRANSCRIPT_CHARS} characters omitted for optimal processing]`
      : rawTranscript.trim();

    // If completely empty payload (no transcript, no diff, no preset), smoothly fallback to default preset
    if (!safeTranscript && !safeDiff && !preset) {
      const fallbackData = getMockFallbackForPreset('auth-refactor', '', '');
      return NextResponse.json({
        success: true,
        data: fallbackData,
        source: 'mock_fallback_empty_payload',
        message: 'Empty payload provided, populated default ground preset',
      });
    }

    // If preset is selected and no custom transcript or diff is provided, serve grounded preset directly
    if (!safeTranscript && !safeDiff && preset) {
      const fallbackData = getMockFallbackForPreset(preset, '', '');
      return NextResponse.json({
        success: true,
        data: fallbackData,
        source: 'preset_grounded',
        message: `Served grounded deliverables for preset '${preset}'`,
      });
    }

    const rawHeaderKey = req.headers.get('x-gemini-key');
    const customHeaderKey = rawHeaderKey && !/[\r\n]/.test(rawHeaderKey) ? rawHeaderKey.trim().slice(0, 256) : null;
    const customBodyKey = typeof body.apiKey === 'string' && !/[\r\n]/.test(body.apiKey) ? body.apiKey.trim().slice(0, 256) : null;
    const apiKey = (customHeaderKey && customHeaderKey.length > 0) ? customHeaderKey : ((customBodyKey && customBodyKey.length > 0) ? customBodyKey : process.env.GEMINI_API_KEY);

    // If no API key is provided, return rich mock fallback immediately
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Returning high-quality mock data.');
      const fallbackData = getMockFallbackForPreset(preset, safeTranscript, safeDiff);
      return NextResponse.json({
        success: true,
        data: fallbackData,
        source: 'mock_fallback_no_api_key',
      });
    }

    // Call Gemini with Google Gen AI SDK
    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `You are ShipSpeak, an elite developer AI engine built for the Wispr No Hand Challenge.
Your mission is to take an unstructured, messy voice brain dump from a developer (along with optional git diff context) and synthesize four production-grade deliverables:
1. A GitHub PR title, commit message, and comprehensive PR Markdown (with ## Overview, ## Detailed Changes, and ## Environment Setup Checklist).
2. A Mermaid diagram syntax in flowchart TD or graph TD format. VERY IMPORTANT: Ensure valid Mermaid syntax. Do NOT use unquoted parentheses or brackets inside node labels. E.g. use node["Label (extra)"] with double quotes.
3. A 2-minute hackathon demo video script broken into 4-5 timestamped segments with exact spokenLine and visualCue.
4. A high-impact technical build-in-public social post with bullet points, hashtags, and an engaging engineering hook.`;

      const userContent = `Developer Voice Brain Dump:
"""
${safeTranscript || 'No voice transcript provided.'}
"""

Git Diff Context:
"""
${safeDiff || 'No git diff provided.'}
"""

${preset ? `Selected preset reference: ${preset}` : ''}

Generate all four developer deliverables strictly conforming to the requested JSON schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ text: userContent }],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: generateResponseSchema,
          temperature: 0.2,
          httpOptions: {
            timeout: 30000,
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response received from Gemini model.');
      }

      // Robust JSON Parsing with fallback
      let rawJson: unknown;
      try {
        rawJson = JSON.parse(responseText);
      } catch (parseErr) {
        console.warn('Structured JSON parse failed, attempting regex extraction:', parseErr);
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            rawJson = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } catch {
            throw new Error('Unable to parse extracted JSON from Gemini output.');
          }
        } else {
          throw new Error('Unable to extract valid JSON from Gemini output.');
        }
      }

      const validatedData = validateAndNormalizeData(rawJson, preset, safeTranscript, safeDiff);

      return NextResponse.json({
        success: true,
        data: validatedData,
        source: 'gemini_2.5_flash',
      });
    } catch (geminiError: unknown) {
      console.error('Error during Gemini API generation:', geminiError);

      // Fallback gracefully to mock data service so the application remains fully interactive
      const fallbackData = getMockFallbackForPreset(preset, safeTranscript, safeDiff);
      return NextResponse.json({
        success: true,
        data: fallbackData,
        source: 'mock_fallback_on_error',
        warning: geminiError instanceof Error ? geminiError.message : 'Gemini invocation failed, fell back to mock data',
      });
    }
  } catch (err: unknown) {
    console.error('Unhandled API error:', err);
    // Never let an unhandled error break the UI: return resilient mock fallback with 200
    const fallbackData = getMockFallbackForPreset('auth-refactor', '', '');
    return NextResponse.json({
      success: true,
      data: fallbackData,
      source: 'resilient_mock_fallback_unhandled',
      warning: err instanceof Error ? err.message : 'Unexpected error handled gracefully',
    });
  }
}
