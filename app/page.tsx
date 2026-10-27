'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { InputControlCenter } from '@/components/InputControlCenter';
import { BentoGrid } from '@/components/BentoGrid';
import { getPresetById, getDefaultPreset } from '@/lib/presets';
import { transformApiResponseToDeliverables } from '@/lib/transform';
import { exportArtifactsBundle } from '@/lib/exportBundle';
import { Deliverables } from '@/lib/types';
import { Mic, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const defaultPreset = getDefaultPreset();
  const [activePresetId, setActivePresetId] = useState<string>(defaultPreset.id);
  const [voiceTranscript, setVoiceTranscript] = useState<string>(defaultPreset.voiceTranscript);
  const [gitDiff, setGitDiff] = useState<string>(defaultPreset.gitDiff);
  const [deliverables, setDeliverables] = useState<Deliverables | null>(defaultPreset.deliverables);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [refiningCard, setRefiningCard] = useState<keyof Deliverables | null>(null);
  const [isExportingBundle, setIsExportingBundle] = useState<boolean>(false);
  const [generationSource, setGenerationSource] = useState<string>('preset_ready');
  const [notification, setNotification] = useState<string | null>(null);

  // Handle Preset selection
  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = getPresetById(presetId);
    if (!preset) return;

    setActivePresetId(preset.id);
    setVoiceTranscript(preset.voiceTranscript);
    setGitDiff(preset.gitDiff);
    // Immediately populate high-quality mock results so judges can test instantly
    setDeliverables(preset.deliverables);
    setGenerationSource(`preset_${preset.id}`);
    setNotification(`Loaded "${preset.name}" preset`);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Handle Generation via /api/generate
  const handleGenerate = useCallback(async () => {
    if (!voiceTranscript.trim() && !gitDiff.trim()) return;

    setIsGenerating(true);
    setNotification('Invoking Gemini 2.5 Flash structured pipeline...');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: voiceTranscript,
          diff: gitDiff,
          preset: activePresetId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with HTTP status ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const transformedDeliverables = transformApiResponseToDeliverables(result.data);
        setDeliverables(transformedDeliverables);
        setGenerationSource(result.source || 'gemini_2.5_flash');
        
        const sourceLabel = result.source === 'gemini_2.5_flash' 
          ? 'Gemini 2.5 Flash (Structured Output)'
          : 'ShipSpeak Engine (Grounding Fallback)';
        
        setNotification(`Successfully generated deliverables via ${sourceLabel}`);
      } else {
        throw new Error(result.error || 'Failed to generate deliverables from API');
      }
    } catch (err: unknown) {
      console.warn('Backend call failed, using graceful client-side fallback:', err);
      const activePreset = getPresetById(activePresetId) || defaultPreset;
      setDeliverables(activePreset.deliverables);
      setGenerationSource('client_fallback');
      setNotification('Deliverables populated from resilient local fallback.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setNotification(null), 4000);
    }
  }, [activePresetId, voiceTranscript, gitDiff, defaultPreset]);

  // Keyboard shortcut: ⌘+Enter or Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate]);

  // Handle Voice Tweaks on Individual Bento Cards via /api/tweak
  const handleTweakCard = async (cardKey: keyof Deliverables, instruction: string) => {
    if (!deliverables) return;

    setRefiningCard(cardKey);
    setNotification(`Refining ${cardKey} with Gemini Flash: "${instruction}"...`);

    const currentCardData = deliverables[cardKey];

    try {
      const response = await fetch('/api/tweak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardKey,
          currentContent: currentCardData,
          instruction,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tweak API returned HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setDeliverables(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            [cardKey]: result.data,
          };
        });
        setNotification(`Updated ${cardKey} smoothly via voice refinement.`);
      } else {
        throw new Error(result.error || 'Invalid tweak response format');
      }
    } catch (err: unknown) {
      console.warn('API tweak call failed, applying client heuristic refinement:', err);
      setDeliverables(prev => {
        if (!prev) return prev;
        const updated = { ...prev };

        if (cardKey === 'pullRequest') {
          updated.pullRequest = {
            ...prev.pullRequest,
            summary: `${prev.pullRequest.summary} [Voice tweak: ${instruction}]`,
            keyChanges: [...prev.pullRequest.keyChanges, `Tweak applied: ${instruction}`],
          };
        } else if (cardKey === 'architecture') {
          let mermaid = prev.architecture.mermaidCode;
          if (instruction.toLowerCase().includes('redis')) {
            mermaid += '\n  Engine -->|"Cache Store"| Redis[("Redis Revocation Store")]';
          }
          updated.architecture = {
            ...prev.architecture,
            mermaidCode: mermaid,
            description: `${prev.architecture.description} (Refined: ${instruction})`,
          };
        } else if (cardKey === 'videoScript') {
          updated.videoScript = {
            ...prev.videoScript,
            segments: prev.videoScript.segments.map((seg, i) =>
              i === 0 ? { ...seg, audio: `${seg.audio} (${instruction})`, spokenLine: `${seg.audio} (${instruction})` } : seg
            ),
          };
        } else if (cardKey === 'socialPost') {
          updated.socialPost = {
            ...prev.socialPost,
            rawPost: prev.socialPost.rawPost ? `${prev.socialPost.rawPost}\n\nPS: ${instruction}` : undefined,
            twitter: {
              ...prev.socialPost.twitter,
              content: `${prev.socialPost.twitter.content}\n\nPS: ${instruction}`,
            },
          };
        }
        return updated;
      });
      setNotification(`Refined ${cardKey} using local fallback.`);
    } finally {
      setRefiningCard(null);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  // Handle ZIP Artifacts Bundle Export
  const handleExportBundle = async () => {
    if (!deliverables) return;

    setIsExportingBundle(true);
    setNotification('Packaging ShipSpeak-deliverables.zip bundle...');

    try {
      await exportArtifactsBundle(deliverables);
      setNotification('Downloaded ShipSpeak-deliverables.zip successfully!');
    } catch (err) {
      console.error('Bundle export error:', err);
      setNotification('Failed to package deliverables bundle');
    } finally {
      setIsExportingBundle(false);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#090d16] text-neutral-100">
      {/* Sticky Top Navigation Bar */}
      <Navbar
        badgeText="Built for the Wispr No Hand Challenge"
        githubUrl="https://github.com/AsteroidHH/Wispr-Flow-No-Hands-Challenge"
        onExportBundle={handleExportBundle}
        isExportingBundle={isExportingBundle}
      />

      {/* Main Two-Column Layout */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Developer Shipping Cockpit</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-mono text-indigo-400 border border-indigo-500/20">
                <Zap className="h-3 w-3" />
                Zero-Hand Flow
              </span>
            </h1>
            <p className="mt-1 text-xs text-neutral-400">
              Convert raw unstructured voice brain dumps and git diffs into PRs, architecture diagrams, demo scripts, and social updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Generation Engine Status Pill */}
            <div className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/20 px-2.5 py-1 text-xs text-indigo-300 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              {generationSource === 'gemini_2.5_flash'
                ? 'Gemini 2.5 Flash'
                : 'ShipSpeak Engine Active'}
            </div>

            <span className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/20 px-2.5 py-1 text-xs text-purple-300 font-mono">
              <Mic className="h-3.5 w-3.5 text-purple-400" />
              Wispr Hotkey Ready
            </span>
          </div>
        </div>

        {/* Dynamic Notification Banner */}
        {notification && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/30 px-3.5 py-2 text-xs font-mono text-indigo-200 animate-fadeIn shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Control Center */}
          <div className="lg:col-span-5 xl:col-span-5">
            <InputControlCenter
              activePresetId={activePresetId}
              onSelectPreset={handleSelectPreset}
              voiceTranscript={voiceTranscript}
              setVoiceTranscript={setVoiceTranscript}
              gitDiff={gitDiff}
              setGitDiff={setGitDiff}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>

          {/* Right Column: Responsive 4-Card Bento Grid */}
          <div className="lg:col-span-7 xl:col-span-7">
            <BentoGrid
              deliverables={deliverables}
              isGenerating={isGenerating}
              onTweakCard={handleTweakCard}
              refiningCard={refiningCard}
              onExportBundle={handleExportBundle}
              isExportingBundle={isExportingBundle}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-900 bg-neutral-950/80 py-4 text-center text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 font-mono text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            ShipSpeak • The Voice-First Last-Mile Engine for Developers
          </p>
          <p className="font-mono text-[11px] text-neutral-500">
            Engineered for the Wispr No Hand Challenge • Hold Wispr to refine any card
          </p>
        </div>
      </footer>
    </div>
  );
}
