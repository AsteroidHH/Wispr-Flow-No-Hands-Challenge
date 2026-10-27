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
      className={`fixed left-0 top-14 bottom-0 w-60 bg-[#0d0e0f] border-r border-[#292a2b] z-30 flex flex-col justify-between py-3 px-2 shadow-[1px_0_12px_rgba(0,0,0,0.5)] transition-all ${className}`}
    >
      <div className="flex flex-col gap-4">
        {/* Workspace Section */}
        <div>
          <div className="px-2 py-1 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#908f9e]">
              Workspace
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {workspaceItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1b1c1d] text-white border border-[#292a2b] shadow-sm'
                      : 'text-[#908f9e] hover:bg-[#121315] hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive ? 'text-[#5e6ad2]' : 'text-[#908f9e]'
                      }`}
                    />
                    <span className={isActive ? 'font-semibold text-white' : ''}>
                      {item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#1f2021] text-[#bdc2ff] border border-[#292a2b]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tooling Section */}
        <div>
          <div className="px-2 py-1 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#908f9e]">
              Tooling
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {toolingItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1b1c1d] text-white border border-[#292a2b] shadow-sm'
                      : 'text-[#908f9e] hover:bg-[#121315] hover:text-zinc-200'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-[#5e6ad2]' : 'text-[#908f9e]'
                    }`}
                  />
                  <span className={isActive ? 'font-semibold text-white' : ''}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Build & Engine Status Widget at Bottom of Sidebar */}
      <div className="flex flex-col gap-2 px-1">
        <div className="p-2.5 rounded-lg bg-[#1b1c1d] border border-[#292a2b] flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-[#e3e2e3] font-medium">Build v2.4.9</span>
            <span className="text-[#ffb867]">Staging</span>
          </div>
          <div className="w-full bg-[#1f2021] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#5e6ad2] h-full w-3/4 rounded-full transition-all duration-500"></div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#908f9e] font-mono">
            <span>Engine Sync</span>
            <span className="text-[#bdc2ff]">75% optimal</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
