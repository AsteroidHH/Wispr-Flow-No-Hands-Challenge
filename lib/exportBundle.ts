import JSZip from 'jszip';
import { Deliverables } from './types';

export async function exportArtifactsBundle(deliverables: Deliverables): Promise<void> {
  const zip = new JSZip();

  // 1. Request.md
  const pr = deliverables.pullRequest;
  const requestContent = `# ${pr.title}

## Commit Message
\`\`\`
${pr.commitMessage}
\`\`\`

${pr.prMarkdown ? pr.prMarkdown : `## Overview\n${pr.summary}\n\n## Key Changes\n${pr.keyChanges.map(k => `- ${k}`).join('\n')}\n\n## Breaking Changes\n${pr.breakingChanges.map(b => `- ${b}`).join('\n')}`}
`;
  zip.file('Request.md', requestContent);

  // 2. Architecture.mmd
  const arch = deliverables.architecture;
  zip.file('Architecture.mmd', arch.mermaidCode);

  // 3. Demo_script.md
  const script = deliverables.videoScript;
  const scriptContent = `# ${script.title}
Duration: ${script.totalDuration}

${script.segments
  .map(
    (seg) => `### [${seg.timestamp}] ${seg.stage || 'Segment'}
- **Spoken Audio:** "${seg.spokenLine || seg.audio}"
- **Visual Cue:** ${seg.visualCue}`
  )
  .join('\n\n')}
`;
  zip.file('Demo_script.md', scriptContent);

  // 4. Social_thread.md
  const social = deliverables.socialPost;
  const socialContent = `# Build-in-Public Launch Deliverables

## Twitter / X Post (${social.twitter.charCount}/280)
${social.twitter.content}

${social.twitter.hashtags.join(' ')}

---

## LinkedIn Long-Form Post
**Hook:**
${social.linkedin.hook}

**Story:**
${social.linkedin.body}

**Key Takeaways:**
${social.linkedin.takeaways.map(t => `• ${t}`).join('\n')}

**Call to Action:**
${social.linkedin.callToAction}

${social.rawPost ? `\n---\n\n## Formatted Engineering Post\n${social.rawPost}` : ''}
`;
  zip.file('Social_thread.md', socialContent);

  // Generate ZIP blob and trigger client download
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'ShipSpeak-deliverables.zip';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
