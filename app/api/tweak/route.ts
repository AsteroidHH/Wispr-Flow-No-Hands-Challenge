import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export interface TweakRequestBody {
  cardKey: 'pullRequest' | 'architecture' | 'videoScript' | 'socialPost';
  currentContent: Record<string, unknown>;
  instruction: string;
  apiKey?: string;
}

export function getFallbackTweak(cardKey: string, currentContent: any, instruction: string): any {
  const safeInstruction = (typeof instruction === 'string' && instruction.trim() ? instruction.trim() : 'refined');
  const lowerInst = safeInstruction.toLowerCase();
  
  let updated: any;
  try {
    updated = currentContent && typeof currentContent === 'object' && !Array.isArray(currentContent)
      ? JSON.parse(JSON.stringify(currentContent))
      : {};
  } catch {
    updated = {};
  }
  if (!updated || typeof updated !== 'object' || Array.isArray(updated)) {
    updated = {};
  }

  if (cardKey === 'pullRequest') {
    updated.title = typeof updated.title === 'string' && updated.title ? updated.title : 'Updated Pull Request';
    updated.commitMessage = typeof updated.commitMessage === 'string' && updated.commitMessage ? updated.commitMessage : 'chore: voice refinement update';
    updated.summary = typeof updated.summary === 'string' ? updated.summary : 'Pull request summary';
    updated.keyChanges = Array.isArray(updated.keyChanges)
      ? updated.keyChanges.filter((c: any) => c != null).map((c: any) => String(c))
      : [];
    updated.breakingChanges = Array.isArray(updated.breakingChanges)
      ? updated.breakingChanges.filter((c: any) => c != null).map((c: any) => String(c))
      : [];

    if (lowerInst.includes('concise') || lowerInst.includes('short')) {
      const firstSentence = (updated.summary.split('.')[0] || 'Concise update').trim();
      updated.summary = firstSentence.endsWith('.') ? firstSentence : `${firstSentence}.`;
      updated.keyChanges = updated.keyChanges.slice(0, 3).map((c: string) => c.replace(/\s+with.*$/, ''));
    } else if (lowerInst.includes('redis') || lowerInst.includes('cache')) {
      updated.summary += ' Includes high-throughput Redis caching layer with automated TTL eviction.';
      if (!updated.keyChanges.some((c: string) => c.toLowerCase().includes('redis'))) {
        updated.keyChanges.unshift('Integrated Redis caching layer to eliminate duplicate downstream database hits');
      }
    } else if (lowerInst.includes('breaking')) {
      updated.breakingChanges.push(`Breaking change: ${safeInstruction}`);
    } else {
      updated.summary = `${updated.summary} (${safeInstruction})`;
      updated.keyChanges.push(`Refinement: ${safeInstruction}`);
    }

    if (typeof updated.prMarkdown === 'string' || updated.prMarkdown) {
      updated.prMarkdown = `## Overview\n${updated.summary}\n\n## Detailed Changes\n${updated.keyChanges.map((c: string) => `- ${c}`).join('\n')}\n\n## Environment Setup Checklist\n- [ ] Configure Redis and edge keys\n- [ ] Run test suite: \`npm test\`\n- [ ] Verified voice refinement: ${safeInstruction}`;
    }
    return updated;
  }

  if (cardKey === 'architecture') {
    updated.title = typeof updated.title === 'string' && updated.title ? updated.title : 'System Architecture Diagram';
    let mermaid = typeof updated.mermaidCode === 'string' && updated.mermaidCode.trim()
      ? updated.mermaidCode
      : (typeof updated.mermaidSyntax === 'string' && updated.mermaidSyntax.trim() ? updated.mermaidSyntax : 'flowchart TD\n  Client --> Gateway\n  Gateway --> Backend');

    if (lowerInst.includes('redis') || lowerInst.includes('cache')) {
      if (!mermaid.toLowerCase().includes('redis')) {
        if (mermaid.includes('Engine')) {
          mermaid += '\n  Engine -->|"Cache Store"| Redis[("Redis Revocation & Cache")]';
        } else if (mermaid.includes('Aggregator')) {
          mermaid += '\n  Aggregator -->|"Cache Store"| Redis[("Redis Query Cache")]';
        } else if (mermaid.includes('Gateway --> Backend')) {
          mermaid = mermaid.replace(
            'Gateway --> Backend',
            'Gateway -->|"Cache Check"| Redis[("Redis Cache Cluster")]\n  Redis -->|"Cache Miss"| Backend'
          );
        } else if (mermaid.includes('Client')) {
          mermaid = mermaid.replace(
            /(\n\s*)(Client[^\n]*)/,
            '$1$2\n  Edge -->|"Check Cache"| Redis[("Redis Cache Cluster")]'
          );
        } else {
          mermaid += '\n  Service -->|"Cache Layer"| Redis[("Redis Cache Cluster")]';
        }
      }
    } else if (lowerInst.includes('lr') || lowerInst.includes('horizontal')) {
      mermaid = mermaid.replace(/(flowchart|graph)\s+(TD|TB)/gi, '$1 LR');
    } else if (lowerInst.includes('td') || lowerInst.includes('vertical')) {
      mermaid = mermaid.replace(/(flowchart|graph)\s+LR/gi, '$1 TD');
    }

    updated.mermaidCode = mermaid;
    updated.mermaidSyntax = mermaid;
    updated.description = typeof updated.description === 'string' && updated.description
      ? `${updated.description} (Updated: ${safeInstruction})`
      : `Architecture Diagram (Updated: ${safeInstruction})`;
    return updated;
  }

  if (cardKey === 'videoScript') {
    updated.title = typeof updated.title === 'string' && updated.title ? updated.title : 'Technical Walkthrough';
    updated.totalDuration = typeof updated.totalDuration === 'string' && updated.totalDuration ? updated.totalDuration : '02:00';

    if (!Array.isArray(updated.segments) || updated.segments.length === 0) {
      updated.segments = [
        {
          timestamp: '00:00 - 00:30',
          stage: 'Overview',
          visualCue: 'Demo showcase',
          audio: `Demo showcase (${safeInstruction})`,
          spokenLine: `Demo showcase (${safeInstruction})`,
        },
      ];
    } else {
      updated.segments = updated.segments.map((seg: any, idx: number) => {
        if (!seg || typeof seg !== 'object') {
          return {
            timestamp: `00:${String(idx * 20).padStart(2, '0')} - 00:${String((idx + 1) * 20).padStart(2, '0')}`,
            stage: `Segment ${idx + 1}`,
            visualCue: 'Technical demo visual',
            audio: typeof seg === 'string' ? seg : `Segment update (${safeInstruction})`,
            spokenLine: typeof seg === 'string' ? seg : `Segment update (${safeInstruction})`,
          };
        }
        const audioVal = typeof seg.audio === 'string' ? seg.audio : (typeof seg.spokenLine === 'string' ? seg.spokenLine : '');
        const spokenVal = typeof seg.spokenLine === 'string' ? seg.spokenLine : (typeof seg.audio === 'string' ? seg.audio : '');
        return {
          ...seg,
          timestamp: typeof seg.timestamp === 'string' ? seg.timestamp : `00:${String(idx * 20).padStart(2, '0')}`,
          visualCue: typeof seg.visualCue === 'string' ? seg.visualCue : 'Technical demo visual',
          audio: audioVal,
          spokenLine: spokenVal,
        };
      });

      if (lowerInst.includes('hook') || lowerInst.includes('punchy') || lowerInst.includes('shorten')) {
        const punchyText = `Attention developers: We just wiped out 300ms of lag with zero code bloat. (${safeInstruction})`;
        updated.segments[0].audio = punchyText;
        updated.segments[0].spokenLine = punchyText;
      } else {
        const updatedAudio = `${updated.segments[0].audio || 'Technical walkthrough'} (${safeInstruction})`;
        updated.segments[0].audio = updatedAudio;
        updated.segments[0].spokenLine = updatedAudio;
      }
    }
    return updated;
  }

  if (cardKey === 'socialPost') {
    if (!updated.twitter || typeof updated.twitter !== 'object' || Array.isArray(updated.twitter)) {
      updated.twitter = { content: 'Shipping update', hashtags: ['#buildinpublic'], charCount: 15 };
    }
    if (typeof updated.twitter.content !== 'string') {
      updated.twitter.content = 'Shipping update';
    }
    if (!Array.isArray(updated.twitter.hashtags)) {
      updated.twitter.hashtags = ['#buildinpublic', '#dev'];
    }

    if (!updated.linkedin || typeof updated.linkedin !== 'object' || Array.isArray(updated.linkedin)) {
      updated.linkedin = { hook: 'Engineering update', body: '', takeaways: [], callToAction: '' };
    }
    if (typeof updated.linkedin.hook !== 'string') {
      updated.linkedin.hook = 'Engineering update';
    }
    if (typeof updated.linkedin.body !== 'string') {
      updated.linkedin.body = '';
    }
    if (!Array.isArray(updated.linkedin.takeaways)) {
      updated.linkedin.takeaways = [];
    }
    if (typeof updated.linkedin.callToAction !== 'string') {
      updated.linkedin.callToAction = '';
    }

    if (lowerInst.includes('provocative') || lowerInst.includes('punchy') || lowerInst.includes('hook')) {
      const punchyHook = `Most teams waste hours writing shipping documentation. We fixed that.\n\n`;
      updated.twitter.content = punchyHook + updated.twitter.content.replace(/^.*?\n\n/, '');
      updated.linkedin.hook = 'The single biggest bottleneck in developer velocity isn\'t writing code:';
    } else if (lowerInst.includes('metrics') || lowerInst.includes('numbers')) {
      const metricLine = '\n⚡ -300ms cold starts | 🚀 97% lower database load';
      updated.twitter.content = updated.twitter.content + metricLine;
    } else {
      updated.twitter.content = `${updated.twitter.content} (${safeInstruction})`;
    }
    updated.twitter.charCount = updated.twitter.content.length;

    if (typeof updated.rawPost === 'string') {
      updated.rawPost += `\n\n[Updated: ${safeInstruction}]`;
    }
    return updated;
  }

  return updated;
}

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      const text = await req.text();
      if (text && text.trim()) {
        body = JSON.parse(text);
      }
    } catch {
      body = {};
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      body = {};
    }

    const cardKey = typeof body.cardKey === 'string' ? body.cardKey : '';
    const currentContent = body.currentContent as Record<string, any>;
    const rawInstruction = typeof body.instruction === 'string' ? body.instruction : '';

    const validCardKeys = ['pullRequest', 'architecture', 'videoScript', 'socialPost'] as const;
    if (!cardKey || !validCardKeys.includes(cardKey as any)) {
      return NextResponse.json(
        { error: 'Valid cardKey is required (pullRequest, architecture, videoScript, socialPost)' },
        { status: 400 }
      );
    }

    if (!currentContent || typeof currentContent !== 'object' || Array.isArray(currentContent)) {
      return NextResponse.json(
        { error: 'currentContent object is required' },
        { status: 400 }
      );
    }

    // Verify currentContent is valid serializable JSON
    let serializedContent: string;
    try {
      serializedContent = JSON.stringify(currentContent, null, 2);
    } catch {
      return NextResponse.json(
        { error: 'currentContent must be serializable JSON' },
        { status: 400 }
      );
    }

    const trimmedInstruction = rawInstruction.trim();
    const safeInstruction = trimmedInstruction
      ? trimmedInstruction.slice(0, 4000)
      : 'Refine and make production-ready';

    const rawHeaderKey = req?.headers?.get?.('x-gemini-key');
    const customHeaderKey = rawHeaderKey && !/[\r\n]/.test(rawHeaderKey) ? rawHeaderKey.trim().slice(0, 256) : null;
    const customBodyKey = typeof body.apiKey === 'string' && !/[\r\n]/.test(body.apiKey) ? body.apiKey.trim().slice(0, 256) : null;
    const apiKey = (customHeaderKey && customHeaderKey.length > 0) ? customHeaderKey : ((customBodyKey && customBodyKey.length > 0) ? customBodyKey : process.env.GEMINI_API_KEY);

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
${serializedContent}
\`\`\`

User's targeted voice refinement instruction:
${JSON.stringify(safeInstruction)}

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
      if (!responseText || !responseText.trim()) {
        throw new Error('Empty response received from Gemini refinement.');
      }

      let parsedResult: any;
      try {
        parsedResult = JSON.parse(responseText.trim());
      } catch {
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const rawCandidate = (jsonMatch[1] || jsonMatch[0]).trim();
          try {
            parsedResult = JSON.parse(rawCandidate);
          } catch {
            const cleaned = rawCandidate.replace(/,\s*([}\]])/g, '$1');
            parsedResult = JSON.parse(cleaned);
          }
        } else {
          throw new Error('Failed to parse Gemini refinement response as JSON.');
        }
      }

      // Handle cases where Gemini wraps the response in an array: [{ ... }]
      if (Array.isArray(parsedResult) && parsedResult.length > 0 && typeof parsedResult[0] === 'object') {
        parsedResult = parsedResult[0];
      }

      // Handle cases where Gemini wraps the response under the cardKey: { pullRequest: { ... } }
      if (
        parsedResult &&
        typeof parsedResult === 'object' &&
        parsedResult[cardKey] &&
        typeof parsedResult[cardKey] === 'object' &&
        !Array.isArray(parsedResult[cardKey])
      ) {
        parsedResult = parsedResult[cardKey];
      }

      if (!parsedResult || typeof parsedResult !== 'object' || Array.isArray(parsedResult)) {
        throw new Error('Refined response from Gemini is not a valid JSON object.');
      }

      const mergedResult = {
        ...currentContent,
        ...parsedResult,
      };

      if (cardKey === 'architecture') {
        mergedResult.mermaidCode = mergedResult.mermaidCode || mergedResult.mermaidSyntax || currentContent.mermaidCode || 'flowchart TD\n  Client --> Gateway\n  Gateway --> Backend';
        mergedResult.mermaidSyntax = mergedResult.mermaidCode;
      } else if (cardKey === 'socialPost') {
        if (mergedResult.twitter && typeof mergedResult.twitter === 'object' && typeof mergedResult.twitter.content === 'string') {
          mergedResult.twitter.charCount = mergedResult.twitter.content.length;
        }
      } else if (cardKey === 'videoScript') {
        if (Array.isArray(mergedResult.segments)) {
          mergedResult.segments = mergedResult.segments.map((seg: any) => ({
            ...seg,
            spokenLine: seg.spokenLine || seg.audio || '',
            audio: seg.audio || seg.spokenLine || '',
          }));
        }
      }

      return NextResponse.json({
        success: true,
        data: mergedResult,
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

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    endpoint: '/api/tweak',
    description: 'ShipSpeak precision card refinement API. Send a POST request with cardKey, currentContent, and instruction.',
    supportedCards: ['pullRequest', 'architecture', 'videoScript', 'socialPost'],
  });
}
