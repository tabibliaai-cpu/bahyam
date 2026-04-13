import { create } from 'zustand';
import type { ViewType } from '@/lib/monitoring-types';

interface AppState {
  currentView: ViewType;
  sidebarOpen: boolean;
  setCurrentView: (view: ViewType) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'dashboard',
  sidebarOpen: false,
  setCurrentView: (view) => set({ currentView: view, sidebarOpen: false }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
