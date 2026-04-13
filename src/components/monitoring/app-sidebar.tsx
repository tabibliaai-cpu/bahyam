'use client';

import React from 'react';
import {
  LayoutDashboard,
  Globe,
  ScrollText,
  Bell,
  Settings,
  Activity,
  X,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import type { ViewType } from '@/lib/monitoring-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getAlertEvents } from '@/lib/monitoring-data';

const navItems: { icon: React.ElementType; label: string; view: ViewType }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
  { icon: Globe, label: 'Endpoints', view: 'endpoints' },
  { icon: ScrollText, label: 'Logs', view: 'logs' },
  { icon: Bell, label: 'Alerts', view: 'alerts' },
  { icon: Settings, label: 'Settings', view: 'settings' },
];

export function AppSidebar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen } = useAppStore();

  const unacknowledgedCount = typeof window !== 'undefined'
    ? getAlertEvents().filter((e) => !e.acknowledged).length
    : 0;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64
          bg-card border-r border-border
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-foreground truncate">API Monitor</h1>
            <p className="text-[10px] text-muted-foreground">by bahyam.com</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, view }) => {
            const isActive = currentView === view;
            const badge = view === 'alerts' && unacknowledgedCount > 0 ? unacknowledgedCount : null;

            return (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 cursor-pointer
                  ${isActive
                    ? 'bg-emerald-500/10 text-emerald-400 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
                <span className="flex-1 text-left">{label}</span>
                {badge && (
                  <Badge
                    variant="destructive"
                    className="h-5 min-w-[20px] flex items-center justify-center text-[10px] px-1.5"
                  >
                    {badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-border shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-muted-foreground">System Online</span>
            <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </aside>
    </>
  );
}
