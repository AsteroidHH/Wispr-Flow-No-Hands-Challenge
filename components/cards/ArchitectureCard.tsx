'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Workflow,
  Code,
  Eye,
  Copy,
  Check,
  Loader2,
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
import { useTheme } from '@/lib/ThemeContext';

interface ArchitectureCardProps {
  data: ArchitectureDeliverable;
  onTweak: (instruction: string) => void;
  isRefining?: boolean;
}

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 2.2;
const ZOOM_STEP = 0.2;

export function ArchitectureCard({ data, onTweak, isRefining = false }: ArchitectureCardProps) {
  const { isLight } = useTheme();
  const [viewMode, setViewMode] = useState<'diagram' | 'code'>('diagram');
  const [copied, setCopied] = useState(false);
  const [activeTheme, setActiveTheme] = useState<MermaidTheme>(isLight ? 'slate' : 'obsidian');
  const [zoom, setZoom] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);
  const [isExportingSvg, setIsExportingSvg] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const safeTitle = data?.title || 'Architecture Topology Diagram';
  const safeDescription = data?.description || 'System architecture topology specification.';
  const safeMermaidCode = data?.mermaidCode || '';

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const rawSvgRef = useRef<string>('');
  const svgElementRef = useRef<SVGSVGElement | null>(null);

  // Sync theme preference when system/user theme changes
  useEffect(() => {
    setActiveTheme(isLight ? 'slate' : 'obsidian');
  }, [isLight]);

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setToastMessage(null);
      }
    }, 3000);
  }, []);

  // Capture rendered SVG from MermaidRenderer
  const handleSvgRendered = useCallback((svgString: string, element: SVGSVGElement | null) => {
    rawSvgRef.current = svgString;
    if (element && element.isConnected) {
      svgElementRef.current = element;
    } else if (!svgElementRef.current || !svgElementRef.current.isConnected) {
      svgElementRef.current = element;
    }
  }, []);

  // Zoom helpers with strict clamping and NaN protection
  const handleZoomIn = () => {
    setZoom((prev) => {
      const safePrev = Number.isFinite(prev) ? prev : 1;
      const next = Math.min(MAX_ZOOM, +(safePrev + ZOOM_STEP).toFixed(1));
      showToast(`Zoom: ${Math.round(next * 100)}%`);
      return next;
    });
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const safePrev = Number.isFinite(prev) ? prev : 1;
      const next = Math.max(MIN_ZOOM, +(safePrev - ZOOM_STEP).toFixed(1));
      showToast(`Zoom: ${Math.round(next * 100)}%`);
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    showToast('Zoom reset to 100%');
  };

  // Close fullscreen on ESC key and lock body scroll while open
  useEffect(() => {
    if (!isFullscreen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isFullscreen]);

  // Export as PNG via offscreen HTML Canvas with 2x Retina clarity
  const handleExportPng = async () => {
    if (!rawSvgRef.current) {
      showToast('Error: No SVG available to export');
      return;
    }

    setIsExportingPng(true);
    let blobURL: string | null = null;
    try {
      // 1. Determine accurate dimensions even if SVG element is not yet attached or has 0 dimensions
      let width = 0;
      let height = 0;

      // Check connected DOM element bounding box
      if (svgElementRef.current && svgElementRef.current.isConnected) {
        const rect = svgElementRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          width = Math.round(rect.width);
          height = Math.round(rect.height);
        }
      }

      // Fallback: look up in active document DOM if ref is disconnected
      if (width <= 0 || height <= 0) {
        const activeSvg = document.querySelector('.architecture-mermaid-viewport svg') as SVGSVGElement | null;
        if (activeSvg) {
          const rect = activeSvg.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            width = Math.round(rect.width);
            height = Math.round(rect.height);
            svgElementRef.current = activeSvg;
          }
        }
      }

      // Fallback: parse viewBox from raw SVG text or attribute
      if (width <= 0 || height <= 0) {
        const viewBoxStr =
          svgElementRef.current?.getAttribute('viewBox') ||
          rawSvgRef.current.match(/viewBox=["']([0-9.\s-]+)["']/i)?.[1];

        if (viewBoxStr) {
          const parts = viewBoxStr.trim().split(/[\s,]+/).map(Number);
          if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
            width = Math.round(parts[2]);
            height = Math.round(parts[3]);
          }
        }
      }

      // Fallback: width/height attributes from raw SVG
      if (width <= 0 || height <= 0) {
        const wMatch = rawSvgRef.current.match(/\bwidth=["']([0-9.]+)(?:px)?["']/i);
        const hMatch = rawSvgRef.current.match(/\bheight=["']([0-9.]+)(?:px)?["']/i);
        if (wMatch && hMatch) {
          const w = parseFloat(wMatch[1]);
          const h = parseFloat(hMatch[1]);
          if (w > 0 && h > 0) {
            width = Math.round(w);
            height = Math.round(h);
          }
        }
      }

      // Safe minimums
      width = Math.max(900, width);
      height = Math.max(600, height);

      // Prepare SVG text with explicit xmlns and dimensions
      let preparedSvg = rawSvgRef.current;
      if (!preparedSvg.includes('xmlns=')) {
        preparedSvg = preparedSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if (!preparedSvg.includes('xmlns:xlink=')) {
        preparedSvg = preparedSvg.replace('<svg', '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }
      if (!/<svg[^>]*\bwidth=["'][0-9]+/.test(preparedSvg)) {
        preparedSvg = preparedSvg.replace(/<svg\b/, `<svg width="${width}" height="${height}"`);
      }

      // Convert SVG to data URI for cross-browser same-origin safety
      const svgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(preparedSvg)}`;

      const img = new Image();
      img.onload = () => {
        // Break closure references to avoid memory retention
        img.onload = null;
        img.onerror = null;

        const canvas = document.createElement('canvas');
        try {
          const scale = 2; // 2x crisp retina resolution
          canvas.width = width * scale;
          canvas.height = height * scale;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas 2D context not available');
          }

          // Dark background matching active theme
          const themeBg = (THEME_CONFIGS[activeTheme]?.variables.background as string) || '#0d0e0f';
          ctx.fillStyle = themeBg;
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
          // Graceful vector SVG fallback if canvas rasterization is restricted in strict environments
          console.warn('Canvas export fallback to vector SVG:', canvasErr);
          try {
            const fallbackBlob = new Blob([preparedSvg], { type: 'image/svg+xml;charset=utf-8' });
            const fallbackUrl = URL.createObjectURL(fallbackBlob);
            const fallbackLink = document.createElement('a');
            fallbackLink.download = 'architecture-diagram.svg';
            fallbackLink.href = fallbackUrl;
            document.body.appendChild(fallbackLink);
            fallbackLink.click();
            document.body.removeChild(fallbackLink);
            setTimeout(() => URL.revokeObjectURL(fallbackUrl), 1500);
            showToast('Exported architecture-diagram.svg (Vector)');
          } catch {
            showToast('Export failed: SVG generation error');
          }
        } finally {
          // Release canvas bitmap memory immediately
          canvas.width = 0;
          canvas.height = 0;
          if (isMountedRef.current) {
            setIsExportingPng(false);
          }
        }
      };

      img.onerror = (err) => {
        img.onload = null;
        img.onerror = null;
        console.warn('Image load fallback to direct SVG export:', err);
        handleExportSvg();
        if (isMountedRef.current) {
          setIsExportingPng(false);
        }
      };

      // Set source using safe data URI
      img.src = svgDataUri;
    } catch (err) {
      console.warn('PNG export fallback to direct SVG:', err);
      handleExportSvg();
      if (isMountedRef.current) {
        setIsExportingPng(false);
      }
    }
  };

  // Export as raw SVG
  const handleExportSvg = () => {
    if (!rawSvgRef.current) {
      showToast('Error: No SVG available to export');
      return;
    }

    setIsExportingSvg(true);
    let url: string | null = null;
    try {
      let svgText = rawSvgRef.current;
      if (!svgText.includes('xmlns=')) {
        svgText = svgText.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'architecture-diagram.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Exported architecture-diagram.svg');
    } catch (err) {
      console.error('SVG export error:', err);
      showToast('Failed to export SVG');
    } finally {
      if (url) {
        URL.revokeObjectURL(url);
        url = null;
      }
      if (isMountedRef.current) {
        setIsExportingSvg(false);
      }
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(safeMermaidCode);
      setCopied(true);
      showToast('Mermaid code copied to clipboard');
      setTimeout(() => {
        if (isMountedRef.current) setCopied(false);
      }, 2000);
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
    <div
      className={`flex flex-wrap items-center justify-between gap-2 rounded-lg p-1.5 border text-xs ${
        isLight ? 'bg-[#F4F4F5] border-[#E6E6E4]' : 'bg-[#0d0e0f] border-[#292a2b]'
      }`}
    >
      {/* Theme Switcher */}
      <div className="flex items-center gap-1.5">
        <span className={`flex items-center gap-1 text-[11px] mr-1 ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
          <Palette className={`h-3 w-3 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
          Theme:
        </span>
        <div
          className={`flex rounded p-0.5 border ${
            isLight ? 'bg-white border-[#E6E6E4]' : 'bg-[#1b1c1d] border-[#292a2b]'
          }`}
        >
          {(['obsidian', 'cyberpunk', 'slate'] as MermaidTheme[]).map((thm) => (
            <button
              key={thm}
              type="button"
              onClick={() => handleThemeChange(thm)}
              className={`rounded px-2 py-0.5 text-[10px] font-mono transition-colors cursor-pointer ${
                activeTheme === thm
                  ? isLight
                    ? 'bg-amber-100 text-amber-900 font-semibold shadow-xs'
                    : 'bg-[#1f2021] text-white font-medium shadow-xs border border-[#343536]'
                  : isLight
                  ? 'text-zinc-600 hover:text-black'
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
        <div
          className={`flex items-center rounded p-0.5 border ${
            isLight ? 'bg-white border-[#E6E6E4]' : 'bg-[#1b1c1d] border-[#292a2b]'
          }`}
        >
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            title={zoom <= MIN_ZOOM ? 'Minimum zoom reached (40%)' : 'Zoom Out'}
            className={`rounded p-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
              isLight ? 'text-zinc-600 hover:bg-zinc-100' : 'text-[#908f9e] hover:bg-[#292a2b] hover:text-[#e3e2e3]'
            }`}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom (100%)"
            className={`flex items-center gap-0.5 px-1.5 py-0.5 font-mono text-[10px] rounded transition-colors cursor-pointer ${
              isLight ? 'text-zinc-800 hover:bg-zinc-100' : 'text-[#e3e2e3] hover:bg-[#292a2b]'
            }`}
          >
            <RotateCcw className="h-2.5 w-2.5 text-zinc-400" />
            <span>{Math.round(zoom * 100)}%</span>
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            title={zoom >= MAX_ZOOM ? 'Maximum zoom reached (220%)' : 'Zoom In'}
            className={`rounded p-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
              isLight ? 'text-zinc-600 hover:bg-zinc-100' : 'text-[#908f9e] hover:bg-[#292a2b] hover:text-[#e3e2e3]'
            }`}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={() => setIsFullscreen((prev) => !prev)}
          title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Inspection Modal'}
          className={`flex items-center gap-1 rounded border p-1 transition-colors cursor-pointer ${
            isLight
              ? 'border-[#E6E6E4] bg-white text-zinc-700 hover:bg-zinc-100'
              : 'border-[#292a2b] bg-[#1f2021] text-[#908f9e] hover:bg-[#292a2b] hover:text-[#e3e2e3]'
          }`}
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Standard Card Container matching Stitch */}
      <div
        className={`flex flex-col h-[340px] xl:h-[360px] rounded-xl p-3.5 justify-between shadow-xs overflow-hidden border transition-all ${
          isLight
            ? isRefining
              ? 'bg-white border-amber-500/70 ring-1 ring-amber-500/40'
              : 'bg-white border-[#E6E6E4] hover:border-zinc-300'
            : isRefining
            ? 'bg-[#1b1c1d] border-[#5e6ad2]/70 ring-1 ring-[#5e6ad2]/40 shadow-[#5e6ad2]/10'
            : 'bg-[#1b1c1d] border-[#292a2b] hover:border-[#343536]'
        }`}
      >
        {/* Card Header matching Stitch */}
        <div
          className={`flex items-center justify-between gap-2 pb-2 border-b shrink-0 ${
            isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`flex h-6.5 w-6.5 items-center justify-center rounded-lg border shrink-0 ${
                isLight
                  ? 'bg-[#18181B] text-amber-500 border-[#18181B]'
                  : 'bg-[#1f2021] text-[#5e6ad2] border border-[#292a2b]'
              }`}
            >
              {isRefining ? (
                <Loader2 className={`h-3 w-3 animate-spin ${isLight ? 'text-amber-500' : 'text-[#5e6ad2]'}`} />
              ) : (
                <Workflow className="h-3 w-3" />
              )}
            </div>
            <div className="min-w-0 truncate">
              <h3
                className={`text-xs font-semibold tracking-tight truncate flex items-center gap-1.5 ${
                  isLight ? 'text-zinc-900' : 'text-[#e3e2e3]'
                }`}
              >
                <span>Architecture Topology</span>
                {isRefining && (
                  <span className={`text-[9px] font-mono shrink-0 ${isLight ? 'text-amber-600' : 'text-[#bdc2ff]'}`}>
                    Refining...
                  </span>
                )}
              </h3>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Diagram / Code Toggle */}
            <div
              className={`flex rounded p-0.5 border mr-1 ${
                isLight ? 'bg-[#F4F4F5] border-[#E6E6E4]' : 'bg-[#0d0e0f] border border-[#292a2b]'
              }`}
            >
              <button
                type="button"
                onClick={() => setViewMode('diagram')}
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                  viewMode === 'diagram'
                    ? isLight
                      ? 'bg-white text-[#18181B] shadow-xs border border-[#E6E6E4]'
                      : 'bg-[#1f2021] text-white shadow-xs border border-[#343536]'
                    : isLight
                    ? 'text-zinc-600 hover:text-[#18181B]'
                    : 'text-[#908f9e] hover:text-[#e3e2e3]'
                }`}
              >
                <Eye className="h-2.5 w-2.5" />
                <span>Visual</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                  viewMode === 'code'
                    ? isLight
                      ? 'bg-white text-[#18181B] shadow-xs border border-[#E6E6E4]'
                      : 'bg-[#1f2021] text-white shadow-xs border border-[#343536]'
                    : isLight
                    ? 'text-zinc-600 hover:text-[#18181B]'
                    : 'text-[#908f9e] hover:text-[#e3e2e3]'
                }`}
              >
                <Code className="h-2.5 w-2.5" />
                <span>Code</span>
              </button>
            </div>

            {/* Export as PNG Button */}
            <button
              type="button"
              onClick={handleExportPng}
              disabled={isExportingPng || !safeMermaidCode.trim()}
              title="Export high-resolution PNG"
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono transition-colors disabled:opacity-40 cursor-pointer ${
                isLight
                  ? 'bg-[#F4F4F5] border-[#E6E6E4] text-zinc-700 hover:bg-white'
                  : 'border-[#292a2b] bg-[#1f2021] hover:bg-[#292a2b] text-[#908f9e]'
              }`}
            >
              {isExportingPng ? (
                <Loader2 className={`h-2.5 w-2.5 animate-spin ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
              ) : (
                <ImageIcon className="h-2.5 w-2.5" />
              )}
              <span>PNG</span>
            </button>

            {/* Export as SVG Vector Button */}
            <button
              type="button"
              onClick={handleExportSvg}
              disabled={isExportingSvg || !safeMermaidCode.trim()}
              title="Export vector SVG"
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono transition-colors disabled:opacity-40 cursor-pointer ${
                isLight
                  ? 'bg-[#F4F4F5] border-[#E6E6E4] text-zinc-700 hover:bg-white'
                  : 'border-[#292a2b] bg-[#1f2021] hover:bg-[#292a2b] text-[#908f9e]'
              }`}
            >
              {isExportingSvg ? (
                <Loader2 className={`h-2.5 w-2.5 animate-spin ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
              ) : (
                <FileCode className="h-2.5 w-2.5" />
              )}
              <span>SVG</span>
            </button>

            {/* Copy Raw Mermaid Button */}
            <button
              type="button"
              onClick={handleCopyCode}
              title="Copy Mermaid.js Diagram Syntax"
              className={`flex items-center p-1 rounded border transition-colors text-xs cursor-pointer ${
                isLight
                  ? 'border-[#E6E6E4] bg-white hover:bg-zinc-50 text-zinc-600'
                  : 'border-[#292a2b] bg-[#1f2021] hover:bg-[#292a2b] text-[#908f9e]'
              }`}
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>

            {/* Fullscreen Modal Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              title="Open full-screen topology inspector"
              className={`p-1 rounded border transition-colors cursor-pointer ${
                isLight
                  ? 'border-[#E6E6E4] bg-white text-zinc-600 hover:bg-zinc-50'
                  : 'border-[#292a2b] bg-[#1f2021] text-[#908f9e] hover:bg-[#292a2b] hover:text-[#e3e2e3]'
              }`}
            >
              <Maximize2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Toast Feedback Notification */}
        {toastMessage && (
          <div
            className={`mt-1.5 flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-mono border animate-fadeIn shrink-0 ${
              isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-[#0d0e0f] text-[#bdc2ff] border-[#292a2b]'
            }`}
          >
            <Sparkles className={`h-2.5 w-2.5 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Card Content Viewport (scrollable middle section) */}
        <div className="flex-1 overflow-y-auto pr-1.5 my-2 text-xs space-y-2 [scrollbar-width:thin]">
          {viewMode === 'diagram' ? (
            <div className="w-full flex flex-col space-y-2">
              {/* Navigation and Theme Toolbar */}
              {renderControlsToolbar()}

              {/* Rendered Mermaid Viewport */}
              <div
                className={`architecture-mermaid-viewport w-full h-[140px] xl:h-[160px] border rounded-lg p-2 flex items-center justify-center overflow-auto ${
                  isLight ? 'bg-[#FAFAFA] border-[#E6E6E4]' : 'bg-[#0d0e0f] border-[#292a2b]'
                }`}
              >
                <MermaidRenderer
                  code={safeMermaidCode}
                  theme={activeTheme}
                  zoom={zoom}
                  onSvgRendered={handleSvgRendered}
                  className="w-full h-full flex items-center justify-center border-0 bg-transparent p-0"
                />
              </div>

              {/* Sub-Agents Pool info badge matching Stitch */}
              <div
                className={`p-1.5 rounded border flex items-center justify-between text-xs shadow-xs ${
                  isLight ? 'bg-white border-[#E6E6E4]' : 'bg-[#1b1c1d] border-[#292a2b]'
                }`}
              >
                <div className={`flex items-center gap-1.5 ${isLight ? 'text-zinc-700' : 'text-[#e3e2e3]'}`}>
                  <Workflow className={`h-3 w-3 ${isLight ? 'text-amber-600' : 'text-[#5e6ad2]'}`} />
                  <span className="font-medium text-[10.5px]">Sub-Agents Pool</span>
                </div>
                <span
                  className={`font-mono text-[9px] px-1.5 py-0.2 rounded font-medium border ${
                    isLight
                      ? 'text-amber-800 bg-amber-100/70 border-amber-200'
                      : 'text-[#bdc2ff] bg-[#1f2021] border-[#292a2b]'
                  }`}
                >
                  Concurrent x4
                </span>
              </div>

              <p className={`text-[10.5px] italic ${isLight ? 'text-zinc-500' : 'text-[#908f9e]'}`}>
                {safeDescription}
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-1.5">
              <div
                className={`flex items-center justify-between text-[11px] font-medium ${
                  isLight ? 'text-zinc-500' : 'text-[#908f9e]'
                }`}
              >
                <span>Mermaid specification</span>
                <span className="font-mono text-[9.5px]">flowchart</span>
              </div>
              <pre
                className={`font-mono text-[11px] rounded-lg p-2.5 border leading-relaxed overflow-x-auto ${
                  isLight
                    ? 'bg-[#FAFAFA] text-zinc-800 border-[#E6E6E4]'
                    : 'bg-[#0d0e0f] text-[#e3e2e3] border-[#292a2b]'
                }`}
              >
                <code>{safeMermaidCode}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div
          className={`pt-2 border-t mt-auto shrink-0 flex flex-col gap-1.5 ${
            isLight ? 'border-[#E6E6E4]' : 'border-[#292a2b]'
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleCopyCode}
              className={`py-1 px-2.5 rounded-lg border text-xs font-medium shadow-xs transition-colors cursor-pointer ${
                isLight
                  ? 'border-[#E6E6E4] bg-white hover:bg-zinc-50 text-zinc-700'
                  : 'border-[#292a2b] bg-[#1f2021] text-[#908f9e] hover:text-[#e3e2e3]'
              }`}
            >
              {copied ? 'Copied Syntax!' : 'Copy Mermaid'}
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className={`flex items-center justify-center gap-1.5 font-medium py-1 px-3 rounded-lg text-xs shadow-xs transition-colors cursor-pointer ${
                isLight
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-[#5e6ad2] hover:bg-[#4f5abf] text-white font-semibold'
              }`}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Full Topology</span>
            </button>
          </div>

          <VoiceTweakInput
            cardName="Architecture Diagram"
            onTweak={onTweak}
            isRefining={isRefining}
            placeholder="Hold Wispr to refine this card."
            className="pt-1 mt-0 border-t-0"
          />
        </div>
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
                  <span>{safeTitle}</span>
                  <span className="font-mono text-[11px] bg-[#0d0e0f] text-[#bdc2ff] px-2 py-0.5 rounded border border-[#292a2b]">
                    Fullscreen
                  </span>
                </h2>
                <p className="text-xs text-[#908f9e]">System topology viewer • ESC to exit</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportPng}
                disabled={isExportingPng || !safeMermaidCode.trim()}
                className="flex items-center gap-1.5 rounded-md border border-[#292a2b] bg-[#1f2021] px-3 py-1.5 text-xs font-medium text-[#e3e2e3] hover:bg-[#292a2b] hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
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
                disabled={isExportingSvg || !safeMermaidCode.trim()}
                className="flex items-center gap-1.5 rounded-md border border-[#292a2b] bg-[#1f2021] px-3 py-1.5 text-xs font-medium text-[#e3e2e3] hover:bg-[#292a2b] hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
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
                className="flex h-7 w-7 items-center justify-center rounded-md border border-[#292a2b] bg-[#1f2021] text-[#908f9e] hover:bg-[#292a2b] hover:text-white transition-colors cursor-pointer"
                title="Exit Fullscreen (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Modal Toolbar */}
          <div className="py-3">{renderControlsToolbar()}</div>

          {/* Main Inspection Canvas */}
          <div className="architecture-mermaid-viewport relative flex-1 overflow-auto rounded-xl border border-[#292a2b] bg-[#0d0e0f] p-6 flex items-center justify-center">
            <MermaidRenderer
              code={safeMermaidCode}
              theme={activeTheme}
              zoom={zoom}
              onSvgRendered={handleSvgRendered}
              className="w-full h-full min-h-[500px] border-none bg-transparent"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#292a2b] mt-3">
            <p className="text-xs text-[#908f9e] italic">{safeDescription}</p>
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
