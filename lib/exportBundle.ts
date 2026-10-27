import JSZip from 'jszip';
import { Deliverables, VideoScriptSegment } from './types';

/**
 * Safely triggers client-side file download for a Blob payload,
 * ensuring the created ObjectURL is properly revoked after a safe delay
 * to avoid memory leaks while giving the browser time to finish reading the stream.
 */
export function triggerBlobDownload(blob: Blob, filename = 'ShipSpeak-deliverables.zip'): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return;
  }

  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  downloadLink.style.display = 'none';
  downloadLink.setAttribute('aria-hidden', 'true');
  document.body.appendChild(downloadLink);

  try {
    downloadLink.click();
  } catch (err) {
    console.error('Failed to trigger download link click:', err);
  } finally {
    try {
      if (document.body.contains(downloadLink)) {
        document.body.removeChild(downloadLink);
      }
    } catch {
      // ignore
    }

    // Delay revocation to ensure the browser download manager can consume the blob stream
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    }, 1500);
  }
}

/**
 * Compiles deliverable artifacts into a configured JSZip instance.
 */
export async function buildArtifactsZip(deliverables: Deliverables | null | undefined): Promise<JSZip> {
  const zip = new JSZip();

  if (!deliverables || Object.keys(deliverables).length === 0) {
    zip.file('README.md', '# ShipSpeak Deliverables\n\nNo active deliverables to bundle.\n');
    return zip;
  }

  // 1. Request.md
  const pr = deliverables.pullRequest || ({} as Partial<Deliverables['pullRequest']>);
  const prTitle = pr.title || 'Feature Pull Request';
  const prCommit = pr.commitMessage || 'feat: implementation update';
  const prSummary = pr.summary || 'Summary of implemented changes';
  const prKeyChanges = Array.isArray(pr.keyChanges) && pr.keyChanges.length > 0
    ? pr.keyChanges.filter(Boolean).map(k => `- ${String(k)}`).join('\n')
    : '- Core changes';
  const prBreaking = Array.isArray(pr.breakingChanges) && pr.breakingChanges.length > 0 
    ? pr.breakingChanges.filter(Boolean).map(b => `- ${String(b)}`).join('\n') 
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
  const arch = deliverables.architecture || ({} as Partial<Deliverables['architecture']>);
  const mermaidCode = (typeof arch.mermaidCode === 'string' && arch.mermaidCode.trim())
    ? arch.mermaidCode
    : 'flowchart TD\n  Client --> Gateway\n  Gateway --> Backend';
  zip.file('Architecture.mmd', mermaidCode);

  // 3. Demo_script.md
  const script = deliverables.videoScript || ({} as Partial<Deliverables['videoScript']>);
  const scriptTitle = script.title || '2-Minute Hackathon Demo Script';
  const scriptDuration = script.totalDuration || '02:00';
  const segments = Array.isArray(script.segments) ? script.segments : [];
  
  const formattedSegments = segments.length > 0
    ? segments
        .map((seg: VideoScriptSegment | null | undefined, idx: number) => {
          if (!seg || typeof seg !== 'object') return '';
          const mins = Math.floor((idx * 30) / 60);
          const secs = (idx * 30) % 60;
          const defaultTimestamp = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
          const timestamp = seg.timestamp || defaultTimestamp;
          const stage = seg.stage || `Segment ${idx + 1}`;
          const audio = seg.spokenLine || seg.audio || '';
          const visual = seg.visualCue || 'Screen view';
          return `### [${timestamp}] ${stage}\n- **Spoken Audio:** "${audio}"\n- **Visual Cue:** ${visual}`;
        })
        .filter(Boolean)
        .join('\n\n')
    : '### [00:00 - 02:00] Complete Walkthrough\n- **Spoken Audio:** "Here is our complete feature walkthrough."\n- **Visual Cue:** Screen recording';

  const scriptContent = `# ${scriptTitle}
Duration: ${scriptDuration}

${formattedSegments}
`;
  zip.file('Demo_script.md', scriptContent);

  // 4. Social_thread.md
  const social = deliverables.socialPost || ({} as Partial<Deliverables['socialPost']>);
  const twitter = social.twitter || { content: 'Shipping update', charCount: 15, hashtags: ['#buildinpublic'] };
  const twitterContent = typeof twitter.content === 'string' ? twitter.content : '';
  const twitterCharCount = typeof twitter.charCount === 'number' ? twitter.charCount : twitterContent.length;
  const linkedin = social.linkedin || { hook: 'Engineering update', body: '', takeaways: [], callToAction: '' };
  const hashtags = Array.isArray(twitter.hashtags)
    ? twitter.hashtags.filter(Boolean).map(h => {
        const s = String(h).trim();
        return s.startsWith('#') ? s : `#${s}`;
      }).join(' ')
    : '#buildinpublic';
  const takeaways = Array.isArray(linkedin.takeaways)
    ? linkedin.takeaways.filter(Boolean).map(t => `• ${String(t)}`).join('\n')
    : '';

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

  return zip;
}

/**
 * Generates the compressed deliverables ZIP Blob.
 * Exported for testing, programmatic consumption, and server/client inspection.
 */
export async function generateArtifactsZipBlob(deliverables: Deliverables | null | undefined): Promise<Blob> {
  const zip = await buildArtifactsZip(deliverables);

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

/**
 * Builds the deliverables ZIP and triggers client-side browser download.
 * Conforms strictly to contract: (deliverables: Deliverables | null | undefined) => Promise<void>
 */
export async function exportArtifactsBundle(deliverables: Deliverables | null | undefined): Promise<void> {
  const blob = await generateArtifactsZipBlob(deliverables);
  triggerBlobDownload(blob, 'ShipSpeak-deliverables.zip');
}
