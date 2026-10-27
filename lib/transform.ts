import { Deliverables, GenerateApiResponseData } from './types';

export function transformApiResponseToDeliverables(data: GenerateApiResponseData): Deliverables {
  // Extract bullet points from markdown for quick summary if possible
  const lines = data.prMarkdown.split('\n');
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
    || `${data.prTitle}: Synthesized from voice transcript and git diff context.`;

  return {
    pullRequest: {
      title: data.prTitle,
      commitMessage: data.commitMessage,
      summary: summaryParagraph,
      keyChanges,
      breakingChanges,
      prMarkdown: data.prMarkdown,
    },
    architecture: {
      title: 'Architecture Topology',
      mermaidCode: data.mermaidSyntax,
      description: 'Flowchart rendered dynamically from structured Gemini pipeline output.',
    },
    videoScript: {
      title: '2-Minute Hackathon Demo Script',
      totalDuration: '02:00',
      segments: data.videoScript.map((seg, idx) => ({
        timestamp: seg.timestamp || `00:${idx * 30} - 00:${(idx + 1) * 30}`,
        stage: `Segment ${idx + 1}`,
        audio: seg.spokenLine,
        spokenLine: seg.spokenLine,
        visualCue: seg.visualCue,
      })),
    },
    socialPost: {
      rawPost: data.socialPost,
      twitter: {
        content: data.socialPost.slice(0, 275),
        charCount: Math.min(280, data.socialPost.length),
        hashtags: ['#buildinpublic', '#WisprNoHandChallenge', '#dev'],
      },
      linkedin: {
        hook: data.socialPost.split('\n')[0] || 'Excited to share our latest architecture update:',
        body: data.socialPost,
        takeaways: [
          'Voice-first shipping eliminates last-mile documentation drag.',
          'Automated PR, Mermaid diagrams, and video scripts in seconds.'
        ],
        callToAction: 'Check out the demo and repo in the comments!',
      },
    },
  };
}
