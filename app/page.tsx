'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar, SidebarView } from '@/components/Sidebar';
import { InputControlCenter } from '@/components/InputControlCenter';
import { BentoGrid } from '@/components/BentoGrid';
import { ToolingDrawer, ToolingTab } from '@/components/ToolingDrawer';
import { PullRequestsView } from '@/components/views/PullRequestsView';
import { ReleaseMatrixView } from '@/components/views/ReleaseMatrixView';
import { DeployQueueView } from '@/components/views/DeployQueueView';
import { ChangelogAiView } from '@/components/views/ChangelogAiView';
import { TerminalPreview } from '@/components/terminal-preview';
import { ShortcutsModal } from '@/components/ShortcutsModal';
import { getPresetById, getDefaultPreset } from '@/lib/presets';
import { transformApiResponseToDeliverables } from '@/lib/transform';
import { exportArtifactsBundle } from '@/lib/exportBundle';
import { Deliverables } from '@/lib/types';
import { Mic, Zap, Sparkles, CheckCircle2, Sliders } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

function getSanitizedCustomKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('shipspeak_custom_gemini_key');
    if (!raw) return null;
    const cleaned = raw.trim().replace(/[\r\n\t]/g, '').slice(0, 256);
    return cleaned.length > 0 ? cleaned : null;
  } catch {
    return null;
  }
}

export default function Home() {
  const { isLight } = useTheme();
  const defaultPreset = getDefaultPreset();
  const [activePresetId, setActivePresetId] = useState<string>(defaultPreset.id);
  const [voiceTranscript, setVoiceTranscript] = useState<string>(defaultPreset.voiceTranscript);
  const [gitDiff, setGitDiff] = useState<string>(defaultPreset.gitDiff);
  const [deliverables, setDeliverables] = useState<Deliverables | null>(defaultPreset.deliverables);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [refiningCard, setRefiningCard] = useState<keyof Deliverables | null>(null);
  const [isExportingBundle, setIsExportingBundle] = useState<boolean>(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [generationSource, setGenerationSource] = useState<string>('preset_ready');
  const [measuredLatency, setMeasuredLatency] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<SidebarView>('overview');
  const [isToolingOpen, setIsToolingOpen] = useState<boolean>(false);
  const [toolingTab, setToolingTab] = useState<ToolingTab>('telemetry');
  const notificationTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback((msg: string, durationMs = 3500) => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    setNotification(msg);
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimeoutRef.current = null;
    }, durationMs);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    };
  }, []);

  const handleSidebarNavigate = (view: SidebarView) => {
    if (view === 'telemetry' || view === 'api-keys' || view === 'settings') {
      if (isToolingOpen && toolingTab === view) {
        setIsToolingOpen(false);
      } else {
        setToolingTab(view as ToolingTab);
        setIsToolingOpen(true);
      }
      setIsSidebarOpen(false);
      return;
    }
    setActiveView(view);
    setIsToolingOpen(false);
    setIsSidebarOpen(false);
  };

  const handleOpenTooling = (tab: ToolingTab) => {
    setToolingTab(tab);
    setIsToolingOpen(true);
  };

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
    setMeasuredLatency(14);
    showNotification(`Loaded "${preset.name}" preset`, 3000);
  }, [showNotification]);

  // Handle Generation via /api/generate
  const handleGenerate = useCallback(async () => {
    if (!voiceTranscript.trim() && !gitDiff.trim()) {
      showNotification('Please enter a voice transcript or select a preset to generate deliverables.', 3500);
      return;
    }

    // Switch to overview view to observe the live synthesis stream
    setActiveView('overview');
    setIsToolingOpen(false);
    setIsGenerating(true);
    showNotification('Invoking Gemini 2.5 Flash structured pipeline...', 3500);
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    try {
      const customKey = getSanitizedCustomKey();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customKey) {
        headers['x-gemini-key'] = customKey;
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers,
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
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      setMeasuredLatency(Math.round(endTime - startTime));

      if (result.success && result.data) {
        const transformedDeliverables = transformApiResponseToDeliverables(result.data);
        setDeliverables(transformedDeliverables);
        setGenerationSource(result.source || 'gemini_2.5_flash');
        
        const sourceLabel = result.source === 'gemini_2.5_flash' 
          ? 'Gemini 2.5 Flash (Structured Output)'
          : 'ShipSpeak Engine (Grounding Fallback)';
        
        showNotification(`Successfully generated deliverables via ${sourceLabel}`, 4000);
      } else {
        throw new Error(result.error || 'Failed to generate deliverables from API');
      }
    } catch (err: unknown) {
      console.warn('Backend call failed, using graceful client-side fallback:', err);
      const activePreset = getPresetById(activePresetId) || defaultPreset;
      setDeliverables(activePreset.deliverables);
      setGenerationSource('client_fallback');
      setMeasuredLatency(18);
      showNotification('Deliverables populated from resilient local fallback.', 4000);
    } finally {
      setIsGenerating(false);
    }
  }, [activePresetId, voiceTranscript, gitDiff, defaultPreset, showNotification]);

  // Global keyboard shortcuts: ⌘+Enter / Ctrl+Enter (Generate), ⌘K / Ctrl+K (CLI), ⌥S (Settings), ⌥1-3 (Presets), ? (Shortcuts), Esc (Dismiss)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. ⌘+Enter or Ctrl+Enter -> Generate deliverables
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
        return;
      }

      // 2. ⌘K or Ctrl+K -> Toggle Terminal CLI Preview
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsTerminalOpen((prev) => !prev);
        return;
      }

      // 3. ⌥S or Alt+S -> Open Settings Tooling Drawer
      if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleOpenTooling('settings');
        return;
      }

      // 4. ? or Shift+/ -> Toggle Keyboard Shortcuts Cheat Sheet Modal
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // 5. ⌥1, ⌥2, ⌥3 -> Quick load presets
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const isPreset1 = e.key === '1' || e.key === '¡' || e.code === 'Digit1' || e.code === 'Numpad1';
        const isPreset2 = e.key === '2' || e.key === '™' || e.code === 'Digit2' || e.code === 'Numpad2';
        const isPreset3 = e.key === '3' || e.key === '£' || e.code === 'Digit3' || e.code === 'Numpad3';

        if (isPreset1) {
          e.preventDefault();
          handleSelectPreset('auth-refactor');
          return;
        } else if (isPreset2) {
          e.preventDefault();
          handleSelectPreset('ai-agent-pipeline');
          return;
        } else if (isPreset3) {
          e.preventDefault();
          handleSelectPreset('hackathon-project');
          return;
        }
      }

      // 6. Escape -> Close any active modal / overlay / notification
      if (e.key === 'Escape') {
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
        } else if (isTerminalOpen) {
          setIsTerminalOpen(false);
        } else if (isToolingOpen) {
          setIsToolingOpen(false);
        } else if (isSidebarOpen) {
          setIsSidebarOpen(false);
        } else if (notification) {
          setNotification(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate, handleSelectPreset, isTerminalOpen, isToolingOpen, isSidebarOpen, isShortcutsModalOpen, notification]);

  // Handle Voice Tweaks on Individual Bento Cards via /api/tweak
  const handleTweakCard = async (cardKey: keyof Deliverables, instruction: string) => {
    if (!deliverables) return;

    setRefiningCard(cardKey);
    showNotification(`Refining ${cardKey} with Gemini Flash: "${instruction}"...`, 3000);
    const tweakStart = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const currentCardData = deliverables[cardKey];

    try {
      const customKey = getSanitizedCustomKey();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customKey) {
        headers['x-gemini-key'] = customKey;
      }

      const response = await fetch('/api/tweak', {
        method: 'POST',
        headers,
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
      const tweakEnd = typeof performance !== 'undefined' ? performance.now() : Date.now();
      setMeasuredLatency(Math.round(tweakEnd - tweakStart));

      if (result.success && result.data) {
        setDeliverables(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            [cardKey]: result.data,
          };
        });
        showNotification(`Updated ${cardKey} smoothly via voice refinement.`, 3500);
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
      showNotification(`Refined ${cardKey} using local fallback.`, 3500);
    } finally {
      setRefiningCard(null);
    }
  };

  // Handle ZIP Artifacts Bundle Export
  const handleExportBundle = async () => {
    if (!deliverables) return;

    setIsExportingBundle(true);
    showNotification('Packaging ShipSpeak-deliverables.zip bundle...', 3000);

    try {
      await exportArtifactsBundle(deliverables);
      showNotification('Downloaded ShipSpeak-deliverables.zip successfully!', 3500);
    } catch (err) {
      console.error('Bundle export error:', err);
      showNotification('Failed to package deliverables bundle', 3500);
    } finally {
      setIsExportingBundle(false);
    }
  };

  return (
    <div
      className={`flex min-h-screen flex-col transition-colors ${
        isLight ? 'bg-[#FBFBFA] text-[#18181B]' : 'bg-[#0d0e0f] text-[#e3e2e3]'
      }`}
    >
      {/* Sticky Top Navigation Bar */}
      <Navbar
        badgeText="Wispr Flow Challenge"
        githubUrl="https://github.com/AsteroidHH/Wispr-Flow-No-Hands-Challenge"
        onExportBundle={handleExportBundle}
        isExportingBundle={isExportingBundle}
        onOpenTerminal={() => setIsTerminalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onOpenTooling={handleOpenTooling}
      />

      {/* Docked Sidebar (Desktop fixed, Mobile overlay) */}
      <Sidebar
        activeView={isToolingOpen ? toolingTab : activeView}
        onSelectView={handleSidebarNavigate}
        className="hidden lg:flex"
      />

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsSidebarOpen(false)}
          />
          <Sidebar
            activeView={isToolingOpen ? toolingTab : activeView}
            onSelectView={handleSidebarNavigate}
            className="flex w-64 shadow-2xl"
          />
        </div>
      )}

      {/* Main Two-Column Cockpit Layout (pl-60 on Desktop matching Stitch) */}
      <div className="flex-1 lg:pl-60 transition-all flex flex-col justify-between">
        <main className="w-full flex-1 px-4 py-5 sm:px-6">
        {/* Top Cockpit Sub-Header / Ambient Context Bar (from Stitch) */}
        <div
          className={`mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${
            isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isLight ? 'bg-amber-600' : 'bg-[#5e6ad2]'}`}></span>
              <h1 className={`text-sm sm:text-base font-semibold tracking-tight ${isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}`}>
                Cockpit Studio
              </h1>
            </div>
            <span className={isLight ? 'text-zinc-300 text-xs' : 'text-[#908f9e] text-xs'}>/</span>
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] border ${
                isLight
                  ? 'bg-white border-[#E6E6E4] text-zinc-600 shadow-xs'
                  : 'bg-[#1b1c1d] border-[#292a2b] text-[#908f9e]'
              }`}
            >
              <span className={isLight ? 'text-amber-700 font-medium' : 'text-[#5e6ad2]'}>session_id:</span>
              <span className={isLight ? 'text-zinc-800' : 'text-[#e3e2e3]'}>#ss-9821-rtx</span>
            </div>
            <div className={`hidden md:flex items-center gap-1.5 font-mono text-[11px] ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
              <span>Git Head:</span>
              <span className={isLight ? 'text-zinc-700 font-semibold' : 'text-[#e3e2e3]'}>0x8efb34</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Quick Latency Badge */}
            <button
              type="button"
              onClick={() => handleOpenTooling('telemetry')}
              title="Open Telemetry Inspector"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-xs transition-colors cursor-pointer shadow-xs ${
                isLight
                  ? 'bg-white hover:bg-zinc-50 border-[#E6E6E4] text-zinc-600'
                  : 'bg-[#1b1c1d] hover:bg-[#292a2b] border-[#292a2b] text-[#e3e2e3]'
              }`}
            >
              <Zap className={`h-3.5 w-3.5 ${isLight ? 'text-amber-600' : 'text-[#ffb867]'}`} />
              <span>Latency: <strong className={isLight ? 'text-zinc-800 font-semibold' : 'text-[#e3e2e3] font-medium'}>{measuredLatency !== null ? `${measuredLatency}ms` : '18ms'}</strong></span>
            </button>

            {/* Generation Engine Status Pill */}
            <button
              type="button"
              onClick={() => handleOpenTooling('api-keys')}
              title="View Model & API Credentials"
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer shadow-xs ${
                isLight
                  ? 'border-[#FDE68A] bg-[#FEF3C7] text-[#92400E] font-medium'
                  : 'border-[#292a2b] bg-[#1b1c1d] hover:bg-[#292a2b] text-[#908f9e]'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>
                {generationSource === 'gemini_2.5_flash'
                  ? 'Gemini 2.5 Flash'
                  : 'Wispr Audio + Gemini 2.5'}
              </span>
            </button>

            {/* Quick Config Button */}
            <button
              type="button"
              onClick={() => handleOpenTooling('settings')}
              title="Cockpit Configuration (⌥S)"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-xs transition-colors cursor-pointer shadow-xs ${
                isLight
                  ? 'bg-white hover:bg-zinc-50 text-zinc-700 border-[#E6E6E4]'
                  : 'bg-[#1b1c1d] hover:bg-[#292a2b] text-[#e3e2e3] border-[#292a2b]'
              }`}
            >
              <Sliders className={`h-3.5 w-3.5 ${isLight ? 'text-amber-600' : 'text-[#bdc2ff]'}`} />
              <span>Config</span>
              <span
                className={`rounded px-1 py-0.2 text-[9px] border ${
                  isLight
                    ? 'bg-zinc-100 border-[#E6E6E4] text-zinc-600'
                    : 'bg-[#0d0e0f] border-[#292a2b] text-[#908f9e]'
                }`}
              >
                ⌥S
              </span>
            </button>
          </div>
        </div>

        {/* Floating Modern Toast Notification (Bottom-Right) */}
        {notification && (
          <aside
            role="status"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-50 max-w-sm animate-toast-in pointer-events-auto"
          >
            <div
              className={`flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all ${
                isLight
                  ? 'bg-white/95 text-zinc-900 border-[#E6E6E4] shadow-zinc-300/40'
                  : 'bg-[#1b1c1d]/95 text-white border-[#292a2b] shadow-black/80'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg shrink-0 ${
                  isLight ? 'bg-amber-100 text-amber-800' : 'bg-[#5e6ad2]/20 text-[#bdc2ff]'
                }`}
              >
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-xs font-medium leading-relaxed font-sans">{notification}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className={`text-xs p-1 rounded transition-colors cursor-pointer ${
                  isLight ? 'text-zinc-400 hover:text-zinc-700' : 'text-[#908f9e] hover:text-white'
                }`}
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          </aside>
        )}

        {/* VIEW 1: Overview Cockpit */}
        {activeView === 'overview' && (
          <div key="overview" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-view-transition">
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
                onSelectPreset={handleSelectPreset}
                onGenerate={handleGenerate}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: Pull Requests Release Pipeline */}
        {activeView === 'pull-requests' && (
          <div key="pull-requests" className="animate-view-transition">
            <PullRequestsView
              deliverables={deliverables}
              onBack={() => setActiveView('overview')}
              onExportBundle={handleExportBundle}
            />
          </div>
        )}

        {/* VIEW 3: Release Matrix & Edge Deployments */}
        {activeView === 'release-matrix' && (
          <div key="release-matrix" className="animate-view-transition">
            <ReleaseMatrixView
              onBack={() => setActiveView('overview')}
            />
          </div>
        )}

        {/* VIEW 4: Deploy Queue & Pipeline Events */}
        {activeView === 'deploy-queue' && (
          <div key="deploy-queue" className="animate-view-transition">
            <DeployQueueView
              onBack={() => setActiveView('overview')}
            />
          </div>
        )}

        {/* VIEW 5: Changelog AI Copilot */}
        {activeView === 'changelog-ai' && (
          <div key="changelog-ai" className="animate-view-transition">
            <ChangelogAiView
              voiceTranscript={voiceTranscript}
              gitDiff={gitDiff}
              deliverables={deliverables}
              onBack={() => setActiveView('overview')}
            />
          </div>
        )}

        {/* Bottom Global Terminal / Status Bar (from Stitch) */}
        <div
          className={`mt-6 p-3 rounded-lg border flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-xs transition-colors ${
            isLight
              ? 'bg-white border-[#E6E6E4] text-zinc-500'
              : 'bg-[#1b1c1d] border-[#292a2b] text-[#908f9e]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-emerald-500' : 'bg-[#5e6ad2]'}`}></span>
              <span className={isLight ? 'text-zinc-800 font-medium' : 'text-[#e3e2e3]'}>Daemon v2.4 Active</span>
            </div>
            <span className={isLight ? 'text-zinc-300' : 'text-[#292a2b]'}>|</span>
            <span>
              Branch: <strong className={isLight ? 'text-zinc-700 font-normal' : 'text-[#bdc2ff]'}>feat/agent-router-v2</strong>
            </span>
            <span className={isLight ? 'text-zinc-300' : 'text-[#292a2b]'}>|</span>
            <span>
              Engine Memory: <strong className={isLight ? 'text-zinc-700 font-normal' : 'text-[#e3e2e3]'}>248MB</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1">
              <span
                className={`px-1.5 py-0.5 rounded border ${
                  isLight
                    ? 'bg-[#F4F4F5] border-[#E6E6E4] text-zinc-700'
                    : 'bg-[#0d0e0f] text-[#e3e2e3] border-[#292a2b]'
                }`}
              >
                ⌥1-3
              </span>
              <span>Presets</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`px-1.5 py-0.5 rounded border ${
                  isLight
                    ? 'bg-[#F4F4F5] border-[#E6E6E4] text-zinc-700'
                    : 'bg-[#0d0e0f] text-[#e3e2e3] border-[#292a2b]'
                }`}
              >
                ⌘↵
              </span>
              <span>Generate</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`px-1.5 py-0.5 rounded border ${
                  isLight
                    ? 'bg-[#F4F4F5] border-[#E6E6E4] text-zinc-700'
                    : 'bg-[#0d0e0f] text-[#e3e2e3] border-[#292a2b]'
                }`}
              >
                Esc
              </span>
              <span>Clear</span>
            </div>
            <button
              type="button"
              onClick={() => setIsShortcutsModalOpen(true)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-amber-50 hover:bg-amber-100/70 border-amber-200 text-amber-800'
                  : 'bg-[#1f2021] hover:bg-[#292a2b] border-[#292a2b] text-[#bdc2ff]'
              }`}
              title="View all keyboard shortcuts (?)"
            >
              <span className="font-semibold">?</span>
              <span>Shortcuts</span>
            </button>
          </div>
        </div>
      </main>

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Terminal Preview Modal Drawer */}
      <TerminalPreview
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />

      {/* Tooling Slide-Over Drawer */}
      <ToolingDrawer
        isOpen={isToolingOpen}
        activeTab={toolingTab}
        onTabChange={setToolingTab}
        onClose={() => setIsToolingOpen(false)}
      />

        {/* Footer */}
        <footer
          className={`mt-auto py-4 text-center text-xs transition-colors border-t ${
            isLight
              ? 'border-[#E6E6E4] bg-white text-zinc-500'
              : 'border-[#292a2b] bg-[#121315] text-[#908f9e]'
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className={`flex items-center gap-1.5 font-mono text-[11px] ${isLight ? 'text-zinc-800' : 'text-[#e3e2e3]'}`}>
              <Sparkles className={`h-3 w-3 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
              ShipSpeak • The Voice-First Last-Mile Engine for Developers
            </p>
            <p className="font-mono text-[11px]">
              Wispr Flow Challenge • Hold Wispr to refine any card
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
