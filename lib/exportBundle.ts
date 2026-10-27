import JSZip from 'jszip';
import { Deliverables } from './types';

export async function exportArtifactsBundle(deliverables: Deliverables | null | undefined): Promise<void> {
  const zip = new JSZip();

  if (!deliverables) {
    zip.file('README.md', '# ShipSpeak Deliverables\n\nNo active deliverables to bundle.');
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'ShipSpeak-deliverables.zip';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    return;
  }

  // 1. Request.md
  const pr = deliverables.pullRequest || {};
  const prTitle = pr.title || 'Feature Pull Request';
  const prCommit = pr.commitMessage || 'feat: implementation update';
  const prSummary = pr.summary || 'Summary of implemented changes';
  const prKeyChanges = Array.isArray(pr.keyChanges) ? pr.keyChanges.map(k => `- ${k}`).join('\n') : '- Core changes';
  const prBreaking = Array.isArray(pr.breakingChanges) && pr.breakingChanges.length > 0 
    ? pr.breakingChanges.map(b => `- ${b}`).join('\n') 
    : '- None';

  const requestContent = `# ${prTitle}

## Commit Message
\`\`\`
${prCommit}
\`\`\`

${pr.prMarkdown ? pr.prMarkdown : `## Overview\n${prSummary}\n\n## Key Changes\n${prKeyChanges}\n\n## Breaking Changes\n${prBreaking}`}
`;
  zip.file('Request.md', requestContent);

  // 2. Architecture.mmd
  const arch = deliverables.architecture || {};
  const mermaidCode = arch.mermaidCode || 'flowchart TD\n  Client --> Gateway\n  Gateway --> Backend';
  zip.file('Architecture.mmd', mermaidCode);

  // 3. Demo_script.md
  const script = deliverables.videoScript || {};
  const scriptTitle = script.title || '2-Minute Hackathon Demo Script';
  const scriptDuration = script.totalDuration || '02:00';
  const segments = Array.isArray(script.segments) ? script.segments : [];
  const scriptContent = `# ${scriptTitle}
Duration: ${scriptDuration}

${segments.length > 0
  ? segments
      .map(
        (seg, idx) => `### [${seg.timestamp || `00:${idx * 30}`}] ${seg.stage || `Segment ${idx + 1}`}
- **Spoken Audio:** "${seg.spokenLine || seg.audio || ''}"
- **Visual Cue:** ${seg.visualCue || 'Screen view'}`
      )
      .join('\n\n')
  : '### [00:00 - 02:00] Complete Walkthrough\n- **Spoken Audio:** "Here is our complete feature walkthrough."\n- **Visual Cue:** Screen recording'}
`;
  zip.file('Demo_script.md', scriptContent);

  // 4. Social_thread.md
  const social = deliverables.socialPost || {};
  const twitter = social.twitter || { content: 'Shipping update', charCount: 15, hashtags: ['#buildinpublic'] };
  const twitterContent = typeof twitter.content === 'string' ? twitter.content : '';
  const twitterCharCount = typeof twitter.charCount === 'number' ? twitter.charCount : twitterContent.length;
  const linkedin = social.linkedin || { hook: 'Engineering update', body: '', takeaways: [], callToAction: '' };
  const hashtags = Array.isArray(twitter.hashtags) ? twitter.hashtags.join(' ') : '#buildinpublic';
  const takeaways = Array.isArray(linkedin.takeaways) ? linkedin.takeaways.map(t => `• ${t}`).join('\n') : '';

  const socialContent = `# Build-in-Public Launch Deliverables

## Twitter / X Post (${twitterCharCount}/280)
${twitterContent}

${hashtags}

---

## LinkedIn Long-Form Post
**Hook:**
${linkedin.hook || ''}

**Story:**
${linkedin.body || ''}

**Key Takeaways:**
${takeaways || '• Fast voice-first shipping'}

**Call to Action:**
${linkedin.callToAction || 'Try it out today!'}

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
