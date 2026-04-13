'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AppSidebar } from '@/components/monitoring/app-sidebar';
import { AppHeader } from '@/components/monitoring/app-header';
import { DashboardView } from '@/components/monitoring/dashboard-view';
import { EndpointsView } from '@/components/monitoring/endpoints-view';
import { LogsView } from '@/components/monitoring/logs-view';
import { AlertsView } from '@/components/monitoring/alerts-view';
import { SettingsView } from '@/components/monitoring/settings-view';
import { useAppStore } from '@/stores/app-store';
import { initializeData } from '@/lib/monitoring-data';

function AppContent() {
  const { currentView } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeData();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Loading API Monitor...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'endpoints': return <EndpointsView />;
      case 'logs': return <LogsView />;
      case 'alerts': return <AlertsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader onRefresh={handleRefresh} refreshing={refreshing} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AppContent />
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  );
}
