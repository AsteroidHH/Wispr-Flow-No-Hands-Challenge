import { Deliverables, GenerateApiResponseData, VideoScriptSegment } from './types';

export function transformApiResponseToDeliverables(data: GenerateApiResponseData | null | undefined): Deliverables {
  const safeData = data && typeof data === 'object' ? data : ({} as Partial<GenerateApiResponseData>);
  const prMarkdown = typeof safeData.prMarkdown === 'string' ? safeData.prMarkdown : '';
  const lines = prMarkdown ? prMarkdown.split('\n') : [];
  const bulletLines = lines
    .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
    .map(line => line.trim().replace(/^[-*]\s+/, ''));
  
  const keyChanges = bulletLines.length > 0 
    ? bulletLines.slice(0, 5)
    : ['Code changes parsed from transcript and diff context'];

  // Check for breaking changes mentions
  const breakingChanges = lines
    .filter(line => line.toLowerCase().includes('breaking') || line.toLowerCase().includes('deprecat'))
    .map(line => line.trim().replace(/^[-*#\s]+/, ''))
    .slice(0, 3);

  // Extract first paragraph for summary
  const summaryParagraph = lines.find(line => line.trim().length > 20 && !line.startsWith('#')) 
    || `${safeData.prTitle || 'Feature Implementation'}: Synthesized from voice transcript and git diff context.`;

  const rawSocial = typeof safeData.socialPost === 'string' && safeData.socialPost.trim()
    ? safeData.socialPost
    : '🚀 Shipping updates built with ShipSpeak';

  const scriptSegments = Array.isArray(safeData.videoScript) ? safeData.videoScript : [];

  return {
    pullRequest: {
      title: safeData.prTitle || 'feat: automated feature delivery',
      commitMessage: safeData.commitMessage || 'feat: update implementation',
      summary: summaryParagraph,
      keyChanges,
      breakingChanges,
      prMarkdown,
    },
    architecture: {
      title: 'Architecture Topology',
      mermaidCode: safeData.mermaidSyntax || 'flowchart TD\n  Client --> Gateway\n  Gateway --> Backend',
      description: 'Flowchart rendered dynamically from structured Gemini pipeline output.',
    },
    videoScript: {
      title: '2-Minute Hackathon Demo Script',
      totalDuration: '02:00',
      segments: scriptSegments.map((seg, idx) => {
        const safeSeg: Partial<VideoScriptSegment> = seg && typeof seg === 'object' ? seg : {};
        return {
          timestamp: safeSeg.timestamp || `00:${idx * 30} - 00:${(idx + 1) * 30}`,
          stage: `Segment ${idx + 1}`,
          audio: safeSeg.spokenLine || safeSeg.audio || 'Demo narration segment',
          spokenLine: safeSeg.spokenLine || safeSeg.audio || 'Demo narration segment',
          visualCue: safeSeg.visualCue || 'Screen view',
        };
      }),
    },
    socialPost: {
      rawPost: rawSocial,
      twitter: {
        content: rawSocial.slice(0, 275),
        charCount: Math.min(280, rawSocial.length),
        hashtags: ['#buildinpublic', '#WisprNoHandChallenge', '#dev'],
      },
      linkedin: {
        hook: rawSocial.split('\n')[0] || 'Excited to share our latest architecture update:',
        body: rawSocial,
        takeaways: [
          'Voice-first shipping eliminates last-mile documentation drag.',
          'Automated PR, Mermaid diagrams, and video scripts in seconds.'
        ],
        callToAction: 'Check out the demo and repo in the comments!',
      },
    },
  };
}
