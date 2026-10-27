'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { AlertCircle, Loader2 } from 'lucide-react';

interface MermaidRendererProps {
  code: string;
  className?: string;
}

export function MermaidRenderer({ code, className = '' }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // Initialize mermaid once
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        themeVariables: {
          darkMode: true,
          background: '#0d1117',
          mainBkg: '#161b22',
          primaryColor: '#6366f1',
          primaryTextColor: '#f8fafc',
          primaryBorderColor: '#4f46e5',
          lineColor: '#94a3b8',
          secondaryColor: '#8b5cf6',
          tertiaryColor: '#0e7490',
          edgeLabelBackground: '#1e293b',
          nodeBorder: '#475569',
        },
      });
    } catch (err) {
      console.warn('Mermaid initialization warning:', err);
    }

    async function renderDiagram() {
      if (!code.trim()) {
        setSvgContent('');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      // Generate a distinct ID for each render to prevent Mermaid ID collisions
      const uniqueId = `mermaid-chart-${Math.random().toString(36).substring(2, 10)}`;

      try {
        const { svg } = await mermaid.render(uniqueId, code.trim());
        if (isMounted) {
          setSvgContent(svg);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          // Clean up any stray error elements inserted by Mermaid in document.body
          const strayErrorEl = document.getElementById(uniqueId);
          if (strayErrorEl) strayErrorEl.remove();

          setError(err instanceof Error ? err.message : 'Failed to parse Mermaid diagram.');
          setIsLoading(false);
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code]);

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
    <div className={`relative flex items-center justify-center overflow-x-auto rounded-lg bg-neutral-950/60 p-4 border border-neutral-800/80 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-950/80 backdrop-blur-xs">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          <span className="ml-2 text-xs font-mono text-neutral-400">Rendering visual topology...</span>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:drop-shadow-md"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
}
