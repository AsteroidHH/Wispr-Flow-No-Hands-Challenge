'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Workflow,
  Code,
  Eye,
  Copy,
  Check,
  Loader2,
  Download,
  Image as ImageIcon,
  FileCode,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Palette,
  Sparkles,
  X
} from 'lucide-react';
import { ArchitectureDeliverable } from '@/lib/types';
import { MermaidRenderer, MermaidTheme, THEME_CONFIGS } from '@/components/MermaidRenderer';
import { VoiceTweakInput } from '@/components/VoiceTweakInput';

interface ArchitectureCardProps {
  data: ArchitectureDeliverable;
  onTweak: (instruction: string) => void;
  isRefining?: boolean;
}

export function ArchitectureCard({ data, onTweak, isRefining = false }: ArchitectureCardProps) {
  const [viewMode, setViewMode] = useState<'diagram' | 'code'>('diagram');
  const [copied, setCopied] = useState(false);
  const [activeTheme, setActiveTheme] = useState<MermaidTheme>('obsidian');
  const [zoom, setZoom] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);
  const [isExportingSvg, setIsExportingSvg] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const rawSvgRef = useRef<string>('');
  const svgElementRef = useRef<SVGSVGElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Capture rendered SVG from MermaidRenderer
  const handleSvgRendered = useCallback((svgString: string, element: SVGSVGElement | null) => {
    rawSvgRef.current = svgString;
    svgElementRef.current = element;
  }, []);

  // Zoom helpers
  const handleZoomIn = () => {
    setZoom((prev) => {
      const next = Math.min(2.2, +(prev + 0.2).toFixed(1));
      showToast(`Zoom: ${Math.round(next * 100)}%`);
      return next;
    });
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(0.4, +(prev - 0.2).toFixed(1));
      showToast(`Zoom: ${Math.round(next * 100)}%`);
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    showToast('Zoom reset to 100%');
  };

  // Close fullscreen on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Export as PNG via offscreen HTML Canvas
  const handleExportPng = async () => {
    if (!rawSvgRef.current) {
      showToast('Error: No SVG available to export');
      return;
    }

    setIsExportingPng(true);
    try {
      const svgText = rawSvgRef.current;
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const scale = 2; // 2x crisp retina resolution
          const bbox = svgElementRef.current?.getBoundingClientRect();
          const width = Math.max(900, Math.round(bbox?.width || 900));
          const height = Math.max(600, Math.round(bbox?.height || 600));

          canvas.width = width * scale;
          canvas.height = height * scale;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas 2D context not available');
          }

          // Dark background hex #090d16
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw scaled SVG image
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0, width, height);

          // Download PNG
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = 'architecture-diagram.png';
          downloadLink.href = pngUrl;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

          URL.revokeObjectURL(blobURL);
          showToast('Exported architecture-diagram.png');
        } catch (canvasErr) {
          console.error('Canvas export error:', canvasErr);
          showToast('Export failed: Canvas serialization error');
        } finally {
          setIsExportingPng(false);
        }
      };

      img.onerror = (err) => {
        console.error('Image load error for PNG export:', err);
        showToast('Export failed: Image rendering error');
        setIsExportingPng(false);
      };

      img.src = blobURL;
    } catch (err) {
      console.error('PNG export error:', err);
      showToast('Failed to export PNG');
      setIsExportingPng(false);
    }
  };

  // Export as raw SVG
  const handleExportSvg = () => {
    if (!rawSvgRef.current) {
      showToast('Error: No SVG available to export');
      return;
    }

    setIsExportingSvg(true);
    try {
      const svgBlob = new Blob([rawSvgRef.current], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'architecture-diagram.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Exported architecture-diagram.svg');
    } catch (err) {
      console.error('SVG export error:', err);
      showToast('Failed to export SVG');
    } finally {
      setIsExportingSvg(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(data.mermaidCode);
      setCopied(true);
      showToast('Mermaid code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleThemeChange = (theme: MermaidTheme) => {
    setActiveTheme(theme);
    showToast(`Theme: ${THEME_CONFIGS[theme].name}`);
  };

  // Common diagram view controls toolbar
  const renderControlsToolbar = () => (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-neutral-950/80 p-2 border border-neutral-800/80 text-xs">
      {/* Theme Switcher */}
      <div className="flex items-center gap-1.5">
        <span className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 mr-1">
          <Palette className="h-3 w-3 text-indigo-400" />
          Theme:
        </span>
        <div className="flex rounded-md bg-neutral-900 p-0.5 border border-neutral-800">
          {(['obsidian', 'cyberpunk', 'slate'] as MermaidTheme[]).map((thm) => (
            <button
              key={thm}
              type="button"
              onClick={() => handleThemeChange(thm)}
              className={`rounded px-2 py-0.5 text-[10px] font-mono transition-all ${
                activeTheme === thm
                  ? 'bg-neutral-800 text-white font-semibold shadow-xs border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {thm === 'obsidian' ? 'Obsidian' : thm === 'cyberpunk' ? 'Cyberpunk' : 'Slate'}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom and Navigation Controls */}
      <div className="flex items-center gap-1">
        <div className="flex items-center rounded-md bg-neutral-900 p-0.5 border border-neutral-800">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom (100%)"
            className="flex items-center gap-0.5 px-1.5 py-0.5 font-mono text-[10px] text-neutral-300 hover:bg-neutral-800 hover:text-white rounded transition-colors"
          >
            <RotateCcw className="h-2.5 w-2.5 text-neutral-400" />
            <span>{Math.round(zoom * 100)}%</span>
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={() => setIsFullscreen(prev => !prev)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Inspection Modal'}
          className="flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900 p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Standard Card Container */}
      <div
        className={`flex flex-col justify-between rounded-xl border bg-neutral-900/60 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 ${
          isRefining
            ? 'border-indigo-500/80 shadow-[0_0_25px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/50'
            : 'border-neutral-800 hover:border-neutral-700/80'
        }`}
      >
        <div>
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {isRefining ? (
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                ) : (
                  <Workflow className="h-4 w-4" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                  Architecture Diagram
                  {isRefining && (
                    <span className="text-[10px] font-mono text-indigo-400 animate-pulse">
                      Refining...
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-neutral-400">{data.title}</p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1.5">
              {/* Diagram / Code Toggle */}
              <div className="flex rounded-lg bg-neutral-950 p-0.5 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setViewMode('diagram')}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                    viewMode === 'diagram'
                      ? 'bg-neutral-800 text-indigo-300 shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  <span>Visual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('code')}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                    viewMode === 'code'
                      ? 'bg-neutral-800 text-indigo-300 shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Code className="h-3 w-3" />
                  <span>Code</span>
                </button>
              </div>

              {/* Export as PNG Button */}
              <button
                type="button"
                onClick={handleExportPng}
                disabled={isExportingPng}
                title="Export as PNG (Dark #090d16 canvas)"
                className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs font-mono font-medium text-neutral-300 transition-all hover:bg-neutral-700 hover:text-white disabled:opacity-50"
              >
                {isExportingPng ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                )}
                <span className="hidden sm:inline">PNG</span>
              </button>

              {/* Export as SVG Button */}
              <button
                type="button"
                onClick={handleExportSvg}
                disabled={isExportingSvg}
                title="Export as raw SVG markup"
                className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs font-mono font-medium text-neutral-300 transition-all hover:bg-neutral-700 hover:text-white disabled:opacity-50"
              >
                {isExportingSvg ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                ) : (
                  <FileCode className="h-3.5 w-3.5 text-cyan-400" />
                )}
                <span className="hidden sm:inline">SVG</span>
              </button>

              {/* Copy Code Button */}
              <button
                type="button"
                onClick={handleCopyCode}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-mono font-medium transition-all ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Toast Feedback Notification */}
          {toastMessage && (
            <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-indigo-950/40 px-2.5 py-1 text-[11px] font-mono text-indigo-300 border border-indigo-500/30 animate-fadeIn">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Card Content */}
          <div className="mt-3.5 space-y-2.5">
            {viewMode === 'diagram' ? (
              <div className="w-full space-y-2">
                {/* Navigation and Theme Toolbar */}
                {renderControlsToolbar()}

                {/* Rendered Mermaid Canvas with Zoom */}
                <MermaidRenderer
                  code={data.mermaidCode}
                  theme={activeTheme}
                  zoom={zoom}
                  onSvgRendered={handleSvgRendered}
                  className="min-h-[260px] max-h-[380px]"
                />

                <p className="mt-1 text-[11px] text-neutral-400 italic">
                  {data.description}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>MERMAID SPECIFICATION</span>
                  <span>flowchart format</span>
                </div>
                <pre className="max-h-[340px] overflow-x-auto rounded-lg bg-neutral-950 p-4 font-mono text-xs text-indigo-200/90 border border-neutral-800/80 leading-relaxed">
                  <code>{data.mermaidCode}</code>
                </pre>
              </div>
            )}
          </div>
        </div>

        <VoiceTweakInput
          cardName="Architecture Diagram"
          onTweak={onTweak}
          isRefining={isRefining}
          placeholder="Hold Wispr to refine this card."
        />
      </div>

      {/* Fullscreen Modal Inspection View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#090d16]/98 p-4 sm:p-6 backdrop-blur-xl animate-fadeIn">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                <Workflow className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{data.title}</span>
                  <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono text-indigo-400 border border-indigo-500/30">
                    Fullscreen Inspection
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  High-fidelity system topology viewer • ESC to exit
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportPng}
                disabled={isExportingPng}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-mono font-medium text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                {isExportingPng ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                )}
                <span>Export PNG</span>
              </button>

              <button
                type="button"
                onClick={handleExportSvg}
                disabled={isExportingSvg}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-mono font-medium text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                {isExportingSvg ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileCode className="h-3.5 w-3.5 text-cyan-400" />
                )}
                <span>Export SVG</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white transition-colors"
                title="Exit Fullscreen (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Modal Toolbar */}
          <div className="py-3">{renderControlsToolbar()}</div>

          {/* Main Inspection Canvas */}
          <div className="relative flex-1 overflow-auto rounded-xl border border-neutral-800/80 bg-[#090d16] p-6 flex items-center justify-center">
            <MermaidRenderer
              code={data.mermaidCode}
              theme={activeTheme}
              zoom={zoom}
              onSvgRendered={handleSvgRendered}
              className="w-full h-full min-h-[500px] border-none bg-transparent"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-800 mt-3">
            <p className="text-xs text-neutral-400 italic">
              {data.description}
            </p>
            <div className="w-full sm:w-auto">
              <VoiceTweakInput
                cardName="Architecture Diagram"
                onTweak={onTweak}
                isRefining={isRefining}
                placeholder="Hold Wispr to refine diagram..."
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
