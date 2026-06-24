import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface SettingsState {
  theme: Theme;
  sidebarWidth: number;
  rightPanelWidth: number;
  sidebarCollapsed: boolean;
  rightPanelCollapsed: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarWidth: 260,
      rightPanelWidth: 280,
      sidebarCollapsed: false,
      rightPanelCollapsed: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
      setRightPanelWidth: (rightPanelWidth) => set({ rightPanelWidth }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleRightPanel: () =>
        set((s) => ({ rightPanelCollapsed: !s.rightPanelCollapsed })),
    }),
    { name: 'llm-wiki-settings' },
  ),
);
