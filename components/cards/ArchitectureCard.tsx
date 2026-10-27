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
    let blobURL: string | null = null;
    try {
      const svgText = rawSvgRef.current;
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      blobURL = URL.createObjectURL(svgBlob);

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

          // Dark background hex #0d0e0f
          ctx.fillStyle = '#0d0e0f';
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

          showToast('Exported architecture-diagram.png');
        } catch (canvasErr) {
          console.error('Canvas export error:', canvasErr);
          showToast('Export failed: Canvas serialization error');
        } finally {
          if (blobURL) URL.revokeObjectURL(blobURL);
          setIsExportingPng(false);
        }
      };

      img.onerror = (err) => {
        console.error('Image load error for PNG export:', err);
        showToast('Export failed: Image rendering error');
        if (blobURL) URL.revokeObjectURL(blobURL);
        setIsExportingPng(false);
      };

      img.src = blobURL;
    } catch (err) {
      if (blobURL) window.URL.revokeObjectURL(blobURL);
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
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#0d0e0f] p-1.5 border border-[#292a2b] text-xs">
      {/* Theme Switcher */}
      <div className="flex items-center gap-1.5">
        <span className="flex items-center gap-1 text-[11px] text-[#908f9e] mr-1">
          <Palette className="h-3 w-3 text-[#5e6ad2]" />
          Theme:
        </span>
        <div className="flex rounded bg-[#121315] p-0.5 border border-[#292a2b]">
          {(['obsidian', 'cyberpunk', 'slate'] as MermaidTheme[]).map((thm) => (
            <button
              key={thm}
              type="button"
              onClick={() => handleThemeChange(thm)}
              className={`rounded px-2 py-0.5 text-[10px] font-mono transition-colors ${
                activeTheme === thm
                  ? 'bg-[#1f2021] text-[#e3e2e3] font-medium shadow-xs border border-[#343536]'
                  : 'text-[#908f9e] hover:text-[#e3e2e3]'
              }`}
            >
              {thm === 'obsidian' ? 'Obsidian' : thm === 'cyberpunk' ? 'Cyberpunk' : 'Slate'}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom and Navigation Controls */}
      <div className="flex items-center gap-1">
        <div className="flex items-center rounded bg-[#121315] p-0.5 border border-[#292a2b]">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="rounded p-1 text-[#908f9e] hover:bg-[#292a2b] hover:text-[#e3e2e3] transition-colors"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom (100%)"
            className="flex items-center gap-0.5 px-1.5 py-0.5 font-mono text-[10px] text-[#e3e2e3] hover:bg-[#292a2b] rounded transition-colors"
          >
            <RotateCcw className="h-2.5 w-2.5 text-[#908f9e]" />
            <span>{Math.round(zoom * 100)}%</span>
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="rounded p-1 text-[#908f9e] hover:bg-[#292a2b] hover:text-[#e3e2e3] transition-colors"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={() => setIsFullscreen(prev => !prev)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Inspection Modal'}
          className="flex items-center gap-1 rounded border border-[#292a2b] bg-[#121315] p-1 text-[#908f9e] hover:bg-[#292a2b] hover:text-[#e3e2e3] transition-colors"
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
        className={`flex flex-col justify-between rounded-xl border bg-[#1b1c1d] p-5 transition-colors overflow-hidden ${
          isRefining
            ? 'border-[#5e6ad2] ring-1 ring-[#5e6ad2]/50'
            : 'border-[#292a2b] hover:border-[#343536]'
        }`}
      >
        <div>
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#292a2b]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0d0e0f] text-[#bdc2ff] border border-[#292a2b]">
                {isRefining ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#5e6ad2]" />
                ) : (
                  <Workflow className="h-3.5 w-3.5 text-[#5e6ad2]" />
                )}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#e3e2e3] flex items-center gap-2">
                  Architecture diagram
                  {isRefining && (
                    <span className="text-[10px] font-mono text-[#bdc2ff]">
                      Refining...
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-[#908f9e]">{data.title}</p>
              </div>
            </div>

            {/* Header Action Buttons - Minimal Ghost Toolbar */}
            <div className="flex items-center gap-1">
              {/* Diagram / Code Toggle */}
              <div className="flex rounded-md bg-[#0d0e0f] p-0.5 border border-[#292a2b] mr-1">
                <button
                  type="button"
                  onClick={() => setViewMode('diagram')}
                  className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                    viewMode === 'diagram'
                      ? 'bg-[#1f2021] text-[#e3e2e3] shadow-xs'
                      : 'text-[#908f9e] hover:text-[#e3e2e3]'
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  <span>Visual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('code')}
                  className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                    viewMode === 'code'
                      ? 'bg-[#1f2021] text-[#e3e2e3] shadow-xs'
                      : 'text-[#908f9e] hover:text-[#e3e2e3]'
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
                title="Export as PNG (#0d0e0f canvas)"
                className="flex items-center gap-1 p-1.5 rounded-md text-[#908f9e] hover:text-[#e3e2e3] hover:bg-[#292a2b] transition-colors text-xs border border-[#292a2b] bg-[#0d0e0f] disabled:opacity-40"
              >
                {isExportingPng ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#5e6ad2]" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline text-[11px]">PNG</span>
              </button>

              {/* Export as SVG Button */}
              <button
                type="button"
                onClick={handleExportSvg}
                disabled={isExportingSvg}
                title="Export as raw SVG markup"
                className="flex items-center gap-1 p-1.5 rounded-md text-[#908f9e] hover:text-[#e3e2e3] hover:bg-[#292a2b] transition-colors text-xs border border-[#292a2b] bg-[#0d0e0f] disabled:opacity-40"
              >
                {isExportingSvg ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#5e6ad2]" />
                ) : (
                  <FileCode className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline text-[11px]">SVG</span>
              </button>

              {/* Copy Code Button */}
              <button
                type="button"
                onClick={handleCopyCode}
                title="Copy Mermaid code"
                className="flex items-center p-1.5 rounded-md text-[#908f9e] hover:text-[#e3e2e3] hover:bg-[#292a2b] transition-colors text-xs border border-[#292a2b] bg-[#0d0e0f]"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Toast Feedback Notification */}
          {toastMessage && (
            <div className="mt-2.5 flex items-center gap-1.5 rounded-md bg-[#0d0e0f] px-2.5 py-1 text-[11px] font-mono text-[#bdc2ff] border border-[#292a2b] animate-fadeIn">
              <Sparkles className="h-3 w-3 text-[#5e6ad2]" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Card Content */}
          <div className="mt-3.5 space-y-2.5">
            {viewMode === 'diagram' ? (
              <div className="w-full space-y-2">
                {/* Navigation and Theme Toolbar */}
                {renderControlsToolbar()}

                {/* Rendered Mermaid Canvas with Zoom inside Stitch container */}
                <div className="rounded-lg border border-[#292a2b] bg-[#0d0e0f] p-2 overflow-hidden">
                  <MermaidRenderer
                    code={data.mermaidCode}
                    theme={activeTheme}
                    zoom={zoom}
                    onSvgRendered={handleSvgRendered}
                    className="min-h-[260px] max-h-[380px]"
                  />
                </div>

                <p className="mt-1 text-[11px] text-[#908f9e] italic">
                  {data.description}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#908f9e] font-medium">
                  <span>Mermaid specification</span>
                  <span className="font-mono text-[10px] text-[#908f9e]">flowchart</span>
                </div>
                <pre className="max-h-[340px] overflow-x-auto rounded-lg bg-[#0d0e0f] p-4 font-mono text-xs text-[#e3e2e3] border border-[#292a2b] leading-relaxed">
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
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0d0e0f]/98 p-4 sm:p-6 backdrop-blur-xl animate-fadeIn">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-[#292a2b] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1b1c1d] text-[#e3e2e3] border border-[#292a2b]">
                <Workflow className="h-4 w-4 text-[#5e6ad2]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#e3e2e3] flex items-center gap-2">
                  <span>{data.title}</span>
                  <span className="rounded bg-[#1b1c1d] px-2 py-0.5 text-[10px] font-mono text-[#908f9e] border border-[#292a2b]">
                    Fullscreen
                  </span>
                </h2>
                <p className="text-xs text-[#908f9e]">
                  System topology viewer • ESC to exit
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportPng}
                disabled={isExportingPng}
                className="flex items-center gap-1.5 rounded-md border border-[#292a2b] bg-[#1b1c1d] px-3 py-1.5 text-xs font-medium text-[#e3e2e3] hover:bg-[#292a2b] transition-colors"
              >
                {isExportingPng ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#5e6ad2]" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5 text-[#908f9e]" />
                )}
                <span>Export PNG</span>
              </button>

              <button
                type="button"
                onClick={handleExportSvg}
                disabled={isExportingSvg}
                className="flex items-center gap-1.5 rounded-md border border-[#292a2b] bg-[#1b1c1d] px-3 py-1.5 text-xs font-medium text-[#e3e2e3] hover:bg-[#292a2b] transition-colors"
              >
                {isExportingSvg ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#5e6ad2]" />
                ) : (
                  <FileCode className="h-3.5 w-3.5 text-[#908f9e]" />
                )}
                <span>Export SVG</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-[#292a2b] bg-[#1b1c1d] text-[#908f9e] hover:bg-[#292a2b] hover:text-white transition-colors"
                title="Exit Fullscreen (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Modal Toolbar */}
          <div className="py-3">{renderControlsToolbar()}</div>

          {/* Main Inspection Canvas */}
          <div className="relative flex-1 overflow-auto rounded-xl border border-[#292a2b] bg-[#0d0e0f] p-6 flex items-center justify-center">
            <MermaidRenderer
              code={data.mermaidCode}
              theme={activeTheme}
              zoom={zoom}
              onSvgRendered={handleSvgRendered}
              className="w-full h-full min-h-[500px] border-none bg-transparent"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#292a2b] mt-3">
            <p className="text-xs text-[#908f9e] italic">
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
