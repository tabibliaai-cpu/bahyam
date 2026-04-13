'use client';

import React, { useState, useEffect } from 'react';
import { Menu, RefreshCw, Bell, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/app-store';
import type { ViewType } from '@/lib/monitoring-types';
import { getAlertEvents, getSettings } from '@/lib/monitoring-data';

const viewTitles: Record<ViewType, string> = {
  dashboard: 'Dashboard',
  endpoints: 'Endpoints',
  logs: 'Request Logs',
  alerts: 'Alerts',
  settings: 'Settings',
  api_keys: 'API Keys',
};

interface AppHeaderProps {
  onRefresh: () => void;
  refreshing?: boolean;
}

export function AppHeader({ onRefresh, refreshing }: AppHeaderProps) {
  const { currentView, setSidebarOpen, setCurrentView } = useAppStore();

  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const update = () => {
      setUnacknowledgedCount(getAlertEvents().filter(e => !e.acknowledged).length);
      setIsLive(getSettings().monitoringEnabled);
    };
    update();
    const interval = setInterval(update, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 lg:px-6 shrink-0 sticky top-0 z-30">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden mr-2 h-9 w-9"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex-1">
        <h2 className="text-lg font-semibold text-foreground">{viewTitles[currentView]}</h2>
      </div>

      <div className="flex items-center gap-2">
        {currentView === 'alerts' && unacknowledgedCount > 0 && (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setCurrentView('alerts')}>
            <Bell className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{unacknowledgedCount} active</span>
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing} className="gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <div className="hidden sm:flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50">
          <Radio className={`w-3 h-3 ${isLive ? 'text-emerald-400' : 'text-red-400'}`} />
          <span className={`text-xs font-medium ${isLive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isLive ? 'LIVE' : 'PAUSED'}
          </span>
        </div>
      </div>
    </header>
  );
}
