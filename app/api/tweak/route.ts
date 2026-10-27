import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

interface TweakRequestBody {
  cardKey: 'pullRequest' | 'architecture' | 'videoScript' | 'socialPost';
  currentContent: any;
  instruction: string;
}

function getFallbackTweak(cardKey: string, currentContent: any, instruction: string): any {
  const safeInstruction = (instruction || 'refined').trim();
  const lowerInst = safeInstruction.toLowerCase();
  
  let updated: any;
  try {
    updated = currentContent ? JSON.parse(JSON.stringify(currentContent)) : {};
  } catch {
    updated = {};
  }

  if (cardKey === 'pullRequest') {
    updated.summary = typeof updated.summary === 'string' ? updated.summary : 'Pull request summary';
    updated.keyChanges = Array.isArray(updated.keyChanges) ? [...updated.keyChanges] : [];
    updated.breakingChanges = Array.isArray(updated.breakingChanges) ? [...updated.breakingChanges] : [];

    if (lowerInst.includes('concise') || lowerInst.includes('short')) {
      updated.summary = updated.summary.split('.')[0] + '.';
      updated.keyChanges = updated.keyChanges.slice(0, 3).map((c: string) => String(c).replace(/\s+with.*$/, ''));
    } else if (lowerInst.includes('redis') || lowerInst.includes('cache')) {
      updated.summary += ' Includes high-throughput Redis caching layer with automated TTL eviction.';
      if (!updated.keyChanges.some((c: string) => String(c).toLowerCase().includes('redis'))) {
        updated.keyChanges.unshift('Integrated Redis caching layer to eliminate duplicate downstream database hits');
      }
    } else if (lowerInst.includes('breaking')) {
      updated.breakingChanges.push(`Breaking change: ${safeInstruction}`);
    } else {
      updated.summary = `${updated.summary} (${safeInstruction})`;
      updated.keyChanges.push(`Refinement: ${safeInstruction}`);
    }

    if (updated.prMarkdown) {
      updated.prMarkdown = `## Overview\n${updated.summary}\n\n## Detailed Changes\n${updated.keyChanges.map((c: string) => `- ${c}`).join('\n')}\n\n## Environment Setup Checklist\n- [ ] Configure Redis and edge keys\n- [ ] Run test suite: \`npm test\`\n- [ ] Verified voice refinement: ${safeInstruction}`;
    }
    return updated;
  }

  if (cardKey === 'architecture') {
    let mermaid = updated.mermaidCode || updated.mermaidSyntax || 'flowchart TD\n  Client --> Gateway\n  Gateway --> Backend';
    if (lowerInst.includes('redis') || lowerInst.includes('cache')) {
      if (!mermaid.includes('Redis')) {
        mermaid = mermaid.replace(
          /(\n\s*Origin|\n\s*Deny|\n\s*Client|\n\s*Aggregator)/,
          '\n  Edge -->|"Check Cache"| Redis[("Redis Cache Cluster")]\n  Redis -->|"Miss"| Origin$1'
        );
        if (!mermaid.includes('Redis')) {
          mermaid += '\n  Engine -->|"Cache Store"| Redis[("Redis Revocation & Cache")]';
        }
      }
    } else if (lowerInst.includes('lr') || lowerInst.includes('horizontal')) {
      mermaid = mermaid.replace(/flowchart\s+TD|graph\s+TD/, 'flowchart LR');
    } else if (lowerInst.includes('td') || lowerInst.includes('vertical')) {
      mermaid = mermaid.replace(/flowchart\s+LR|graph\s+LR/, 'flowchart TD');
    }

    updated.mermaidCode = mermaid;
    updated.mermaidSyntax = mermaid;
    updated.description = `${updated.description || 'Architecture Diagram'} (Updated: ${safeInstruction})`;
    return updated;
  }

  if (cardKey === 'videoScript') {
    if (!Array.isArray(updated.segments) || updated.segments.length === 0) {
      updated.segments = [
        { timestamp: '00:00 - 00:30', visualCue: 'Overview', audio: `Demo showcase (${safeInstruction})` },
      ];
    } else {
      if (lowerInst.includes('hook') || lowerInst.includes('punchy') || lowerInst.includes('shorten')) {
        updated.segments[0].audio = `Attention developers: We just wiped out 300ms of lag with zero code bloat. (${safeInstruction})`;
      } else {
        updated.segments[0].audio = `${updated.segments[0].audio || ''} Note: ${safeInstruction}`;
      }
    }
    return updated;
  }

  if (cardKey === 'socialPost') {
    if (!updated.twitter) {
      updated.twitter = { content: 'Shipping update', hashtags: ['#buildinpublic'], charCount: 15 };
    }
    if (!updated.linkedin) {
      updated.linkedin = { hook: 'Engineering update', body: '', takeaways: [], callToAction: '' };
    }

    if (lowerInst.includes('provocative') || lowerInst.includes('punchy') || lowerInst.includes('hook')) {
      const punchyHook = `Most teams waste hours writing shipping documentation. We fixed that.\n\n`;
      updated.twitter.content = punchyHook + (updated.twitter.content || '').replace(/^.*?\n\n/, '');
      updated.twitter.charCount = Math.min(280, updated.twitter.content.length);
      updated.linkedin.hook = 'The single biggest bottleneck in developer velocity isn\'t writing code:';
    } else if (lowerInst.includes('metrics') || lowerInst.includes('numbers')) {
      const metricLine = '\n⚡ -300ms cold starts | 🚀 97% lower database load';
      updated.twitter.content = (updated.twitter.content || '') + metricLine;
      updated.twitter.charCount = Math.min(280, updated.twitter.content.length);
    }
    if (updated.rawPost) {
      updated.rawPost += `\n\n[Updated: ${safeInstruction}]`;
    }
    return updated;
  }

  return updated;
}

export async function POST(req: NextRequest) {
  try {
    // Safely parse request body handling empty body, null, or malformed JSON
    let body: Record<string, unknown> = {};
    try {
      const text = await req.text();
      if (text && text.trim()) {
        body = JSON.parse(text);
      }
    } catch {
      body = {};
    }

    if (!body || typeof body !== 'object') {
      body = {};
    }

    const cardKey = typeof body.cardKey === 'string' ? body.cardKey : '';
    const currentContent = body.currentContent;
    const instruction = typeof body.instruction === 'string' ? body.instruction : '';

    // Validate cardKey
    const validCardKeys = ['pullRequest', 'architecture', 'videoScript', 'socialPost'];
    if (!cardKey || !validCardKeys.includes(cardKey)) {
      return NextResponse.json(
        { error: 'Valid cardKey is required (pullRequest, architecture, videoScript, socialPost)' },
        { status: 400 }
      );
    }

    if (!currentContent || typeof currentContent !== 'object') {
      return NextResponse.json(
        { error: 'currentContent object is required' },
        { status: 400 }
      );
    }

    const safeInstruction = typeof instruction === 'string' && instruction.trim()
      ? instruction.trim()
      : 'Refine and make production-ready';

    const apiKey = process.env.GEMINI_API_KEY;

    // Graceful fallback if no API key is present
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured. Applying intelligent mock refinement.');
      const refinedData = getFallbackTweak(cardKey, currentContent, safeInstruction);
      return NextResponse.json({
        success: true,
        data: refinedData,
        source: 'mock_fallback_no_api_key',
        message: `Refined ${cardKey} with mock intelligence`,
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are ShipSpeak's precision code-refinement engine.
The user wants to iteratively refine ONLY the "${cardKey}" section of a developer shipping dashboard using a voice instruction.

Current "${cardKey}" JSON data:
\`\`\`json
${JSON.stringify(currentContent, null, 2)}
\`\`\`

User's targeted voice refinement instruction:
"${safeInstruction}"

Rules:
1. Revise only the fields in this specific "${cardKey}" object according to the instruction.
2. For Mermaid diagrams: Ensure the returned Mermaid syntax is valid and avoids unquoted brackets or parentheses inside node labels (e.g., A["Client (Web)"] is valid, A[Client (Web)] is invalid).
3. Preserve the exact JSON schema and property names of the input object.
4. Return ONLY a single valid JSON object representing the revised "${cardKey}". No markdown commentary, no code fences.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ text: prompt }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response received from Gemini refinement.');
      }

      let parsedResult: any;
      try {
        parsedResult = JSON.parse(responseText);
      } catch (parseErr) {
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          throw new Error('Failed to parse Gemini refinement response as JSON.');
        }
      }

      if (!parsedResult || typeof parsedResult !== 'object') {
        throw new Error('Refined response from Gemini is not an object.');
      }

      return NextResponse.json({
        success: true,
        data: parsedResult,
        source: 'gemini_2.5_flash',
      });
    } catch (geminiError: unknown) {
      console.error('Gemini refinement failed, applying fallback:', geminiError);
      const fallbackData = getFallbackTweak(cardKey, currentContent, safeInstruction);
      return NextResponse.json({
        success: true,
        data: fallbackData,
        source: 'mock_fallback_on_error',
        warning: geminiError instanceof Error ? geminiError.message : 'Gemini tweak failed, used fallback',
      });
    }
  } catch (err: unknown) {
    console.error('Unhandled tweak error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
