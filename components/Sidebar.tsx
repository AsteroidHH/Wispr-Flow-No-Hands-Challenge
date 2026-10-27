'use client';

import React from 'react';
import {
  LayoutDashboard,
  GitPullRequest,
  Rocket,
  Layers,
  Sparkles,
  Activity,
  Key,
  Settings,
} from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export type SidebarView =
  | 'overview'
  | 'pull-requests'
  | 'release-matrix'
  | 'deploy-queue'
  | 'changelog-ai'
  | 'telemetry'
  | 'api-keys'
  | 'settings';

interface SidebarProps {
  activeView: SidebarView;
  onSelectView: (view: SidebarView) => void;
  className?: string;
}

export function Sidebar({
  activeView = 'overview',
  onSelectView,
  className = '',
}: SidebarProps) {
  const { isLight } = useTheme();

  const workspaceItems: { id: SidebarView; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'pull-requests', label: 'Pull Requests', icon: GitPullRequest, badge: '4' },
    { id: 'release-matrix', label: 'Release Matrix', icon: Rocket },
    { id: 'deploy-queue', label: 'Deploy Queue', icon: Layers },
    { id: 'changelog-ai', label: 'Changelog AI', icon: Sparkles },
  ];

  const toolingItems: { id: SidebarView; label: string; icon: typeof Activity }[] = [
    { id: 'telemetry', label: 'Telemetry', icon: Activity },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed left-0 top-14 bottom-7 w-60 z-30 flex flex-col justify-between p-3 select-none transition-colors ${
        isLight
          ? 'bg-[#FBFBFA] border-r border-[#E6E6E4] shadow-xs'
          : 'bg-[#0d0e0f] border-r border-[#292a2b] shadow-[1px_0_12px_rgba(0,0,0,0.5)]'
      } ${className}`}
    >
      <div className="flex flex-col gap-4">
        {/* Workspace Category */}
        <div className="flex flex-col gap-1">
          <span
            className={`px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider ${
              isLight ? 'text-zinc-400' : 'text-[#908f9e]'
            }`}
          >
            Workspace
          </span>
          <nav className="flex flex-col gap-0.5">
            {workspaceItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all cursor-pointer ${
                    isActive
                      ? isLight
                        ? 'bg-white border border-[#E6E6E4] border-l-2 border-l-amber-600 font-medium text-[#18181B] shadow-xs'
                        : 'bg-[#1b1c1d] text-white border border-[#292a2b] shadow-sm'
                      : isLight
                      ? 'text-zinc-600 hover:text-[#18181B] hover:bg-white/80'
                      : 'text-[#908f9e] hover:bg-[#121315] hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive
                          ? isLight
                            ? 'text-amber-600'
                            : 'text-[#5e6ad2]'
                          : isLight
                          ? 'text-zinc-500'
                          : 'text-[#908f9e]'
                      }`}
                    />
                    <span className={isActive ? 'font-semibold' : ''}>
                      {item.label}
                    </span>
                  </div>

                  {isActive && isLight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  )}

                  {item.badge && (
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                        isLight
                          ? 'bg-[#FEF3C7] text-[#92400E]'
                          : 'bg-[#1f2021] text-[#bdc2ff] border border-[#292a2b]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tooling Category */}
        <div className="flex flex-col gap-1">
          <span
            className={`px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider ${
              isLight ? 'text-zinc-400' : 'text-[#908f9e]'
            }`}
          >
            Tooling
          </span>
          <nav className="flex flex-col gap-0.5">
            {toolingItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-all cursor-pointer ${
                    isActive
                      ? isLight
                        ? 'bg-white border border-[#E6E6E4] border-l-2 border-l-amber-600 font-medium text-[#18181B] shadow-xs'
                        : 'bg-[#1b1c1d] text-white border border-[#292a2b] shadow-sm'
                      : isLight
                      ? 'text-zinc-600 hover:text-[#18181B] hover:bg-white/80'
                      : 'text-[#908f9e] hover:bg-[#121315] hover:text-zinc-200'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive
                        ? isLight
                          ? 'text-amber-600'
                          : 'text-[#5e6ad2]'
                        : isLight
                        ? 'text-zinc-500'
                        : 'text-[#908f9e]'
                    }`}
                  />
                  <span className={isActive ? 'font-semibold' : ''}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Widget: Build Staging Card matching Stitch */}
      <div
        className={`p-2.5 rounded-lg border shadow-xs flex flex-col gap-2 transition-colors ${
          isLight
            ? 'bg-white border-[#E6E6E4]'
            : 'bg-[#1b1c1d] border-[#292a2b]'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-medium">
          <span className={isLight ? 'text-[#18181B]' : 'text-[#e3e2e3]'}>Build v2.4.9</span>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
              isLight
                ? 'text-amber-700 bg-amber-50 border-amber-200'
                : 'text-[#ffb867] bg-[#1f2021] border-[#292a2b]'
            }`}
          >
            Staging
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <div
            className={`flex items-center justify-between text-[11px] font-mono ${
              isLight ? 'text-zinc-500' : 'text-[#908f9e]'
            }`}
          >
            <span>Engine Sync</span>
            <span className={isLight ? 'text-zinc-700 font-medium' : 'text-[#bdc2ff]'}>
              88%
            </span>
          </div>
          <div
            className={`w-full h-1.5 rounded-full overflow-hidden ${
              isLight ? 'bg-[#F4F4F5]' : 'bg-[#1f2021]'
            }`}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isLight ? 'bg-amber-600' : 'bg-[#5e6ad2]'
              }`}
              style={{ width: '88%' }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
