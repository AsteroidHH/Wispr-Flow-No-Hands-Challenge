'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { AlertCircle, Loader2 } from 'lucide-react';

export type MermaidTheme = 'obsidian' | 'cyberpunk' | 'slate';

export const THEME_CONFIGS: Record<
  MermaidTheme,
  { name: string; badgeColor: string; variables: Record<string, string | boolean> }
> = {
  obsidian: {
    name: 'Obsidian Dark',
    badgeColor: 'border-[#5e6ad2]/40 text-[#bdc2ff] bg-[#5e6ad2]/20',
    variables: {
      darkMode: true,
      background: '#0d0e0f',
      mainBkg: '#121315',
      primaryColor: '#5e6ad2',
      primaryTextColor: '#e3e2e3',
      primaryBorderColor: '#5e6ad2',
      lineColor: '#908f9e',
      secondaryColor: '#8b5cf6',
      tertiaryColor: '#0e7490',
      edgeLabelBackground: '#1b1c1d',
      nodeBorder: '#292a2b',
    },
  },
  cyberpunk: {
    name: 'Cyberpunk Indigo',
    badgeColor: 'border-pink-500/40 text-pink-300 bg-pink-950/30',
    variables: {
      darkMode: true,
      background: '#0d0e0f',
      mainBkg: '#0f172a',
      primaryColor: '#ec4899',
      primaryTextColor: '#fdf4ff',
      primaryBorderColor: '#f43f5e',
      lineColor: '#06b6d4',
      secondaryColor: '#a855f7',
      tertiaryColor: '#3b82f6',
      edgeLabelBackground: '#030712',
      nodeBorder: '#06b6d4',
    },
  },
  slate: {
    name: 'Slate Minimal',
    badgeColor: 'border-[#292a2b] text-[#908f9e] bg-[#1b1c1d]',
    variables: {
      darkMode: true,
      background: '#0d0e0f',
      mainBkg: '#1b1c1d',
      primaryColor: '#343536',
      primaryTextColor: '#e3e2e3',
      primaryBorderColor: '#292a2b',
      lineColor: '#908f9e',
      secondaryColor: '#292a2b',
      tertiaryColor: '#121315',
      edgeLabelBackground: '#121315',
      nodeBorder: '#292a2b',
    },
  },
};

interface MermaidRendererProps {
  code: string;
  theme?: MermaidTheme;
  zoom?: number;
  className?: string;
  onSvgRendered?: (svg: string, element: SVGSVGElement | null) => void;
}

export function MermaidRenderer({
  code,
  theme = 'obsidian',
  zoom = 1,
  className = '',
  onSvgRendered,
}: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const themeVars = THEME_CONFIGS[theme]?.variables || THEME_CONFIGS.obsidian.variables;

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        themeVariables: themeVars,
      });
    } catch (err) {
      console.warn('Mermaid initialization warning:', err);
    }

    let currentUniqueId = '';

    async function renderDiagram() {
      if (!code.trim()) {
        setSvgContent('');
        setIsLoading(false);
        if (onSvgRendered) onSvgRendered('', null);
        return;
      }

      setIsLoading(true);
      setError(null);

      // Distinct ID prevents DOM ID collision in Mermaid cache
      currentUniqueId = `mermaid-chart-${Math.random().toString(36).substring(2, 10)}`;

      try {
        const { svg } = await mermaid.render(currentUniqueId, code.trim());
        if (isMounted) {
          setSvgContent(svg);
          setIsLoading(false);

          if (onSvgRendered) {
            // Give DOM a microtask to attach before querying
            setTimeout(() => {
              const svgEl = containerRef.current?.querySelector('svg') || null;
              onSvgRendered(svg, svgEl as SVGSVGElement | null);
            }, 50);
          }
        }
      } catch (err: unknown) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          const strayErrorEl = document.getElementById(currentUniqueId) || document.getElementById(`d${currentUniqueId}`);
          if (strayErrorEl) strayErrorEl.remove();

          setError(err instanceof Error ? err.message : 'Failed to parse Mermaid diagram.');
          setIsLoading(false);
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
      if (currentUniqueId) {
        const stray = document.getElementById(currentUniqueId) || document.getElementById(`d${currentUniqueId}`);
        if (stray) stray.remove();
      }
    };
  }, [code, theme, onSvgRendered]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-rose-500/30 bg-rose-950/20 p-6 text-center text-xs text-rose-300">
        <AlertCircle className="mb-2 h-6 w-6 text-rose-400" />
        <p className="font-semibold text-rose-200">Mermaid Render Error</p>
        <p className="mt-1 font-mono text-[11px] text-rose-400/80">{error}</p>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-auto rounded-lg bg-transparent transition-colors ${className}`}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#090a0c]/85 backdrop-blur-xs">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          <span className="ml-2 text-xs font-mono text-zinc-400">Rendering visual topology...</span>
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease-out',
        }}
        className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:drop-shadow-md select-none"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
}
