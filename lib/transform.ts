import { Deliverables, GenerateApiResponseData } from './types';

export function transformApiResponseToDeliverables(data: GenerateApiResponseData): Deliverables {
  const prMarkdown = data.prMarkdown || '';
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
    || `${data.prTitle || 'Feature Implementation'}: Synthesized from voice transcript and git diff context.`;

  const rawSocial = data.socialPost || '🚀 Shipping updates built with ShipSpeak';
  const scriptSegments = Array.isArray(data.videoScript) ? data.videoScript : [];

  return {
    pullRequest: {
      title: data.prTitle || 'feat: automated feature delivery',
      commitMessage: data.commitMessage || 'feat: update implementation',
      summary: summaryParagraph,
      keyChanges,
      breakingChanges,
      prMarkdown,
    },
    architecture: {
      title: 'Architecture Topology',
      mermaidCode: data.mermaidSyntax || 'flowchart TD\n  Client --> Gateway\n  Gateway --> Backend',
      description: 'Flowchart rendered dynamically from structured Gemini pipeline output.',
    },
    videoScript: {
      title: '2-Minute Hackathon Demo Script',
      totalDuration: '02:00',
      segments: scriptSegments.map((seg, idx) => ({
        timestamp: seg.timestamp || `00:${idx * 30} - 00:${(idx + 1) * 30}`,
        stage: `Segment ${idx + 1}`,
        audio: seg.spokenLine || 'Demo narration segment',
        spokenLine: seg.spokenLine || 'Demo narration segment',
        visualCue: seg.visualCue || 'Screen view',
      })),
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
