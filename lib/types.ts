export interface PullRequestDeliverable {
  title: string;
  commitMessage: string;
  summary: string;
  keyChanges: string[];
  breakingChanges: string[];
  prMarkdown?: string;
}

export interface ArchitectureDeliverable {
  title: string;
  mermaidCode: string;
  description: string;
}

export interface VideoScriptSegment {
  timestamp: string;
  stage?: string;
  audio: string;
  visualCue: string;
  spokenLine?: string;
}

export interface VideoScriptDeliverable {
  title: string;
  totalDuration: string;
  segments: VideoScriptSegment[];
}

export interface SocialPostDeliverable {
  twitter: {
    content: string;
    charCount: number;
    hashtags: string[];
  };
  linkedin: {
    hook: string;
    body: string;
    takeaways: string[];
    callToAction: string;
  };
  rawPost?: string;
}

export interface Deliverables {
  pullRequest: PullRequestDeliverable;
  architecture: ArchitectureDeliverable;
  videoScript: VideoScriptDeliverable;
  socialPost: SocialPostDeliverable;
}

export interface GenerateApiResponseData {
  prTitle?: string;
  commitMessage?: string;
  prMarkdown?: string;
  mermaidSyntax?: string;
  videoScript?: {
    timestamp?: string;
    stage?: string;
    visualCue?: string;
    spokenLine?: string;
    audio?: string;
  }[];
  socialPost?: string;
}

export interface Preset {
  id: string;
  name: string;
  tagline: string;
  iconName: string;
  voiceTranscript: string;
  gitDiff: string;
  deliverables: Deliverables;
}
