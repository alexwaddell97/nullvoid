import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OpenWindow {
  id: string;        // Unique window instance ID
  appId: string;     // App type: 'terminal', 'files', 'email', etc.
  title: string;     // Display name in tab
  icon: string;      // Emoji icon for tab
  timestamp: number; // When window was opened (for ordering)
}

interface WindowManagerState {
  // Open windows stack
  openWindows: OpenWindow[];

  // Currently active/visible window
  activeWindowId: string | null;

  // Actions
  openWindow: (appId: string, title: string, icon: string) => string;
  closeWindow: (windowId: string) => void;
  setActiveWindow: (windowId: string) => void;
  closeAllWindows: () => void;
  isAppOpen: (appId: string) => boolean;
  getActiveApp: () => string | null;
}

export const useWindowManager = create<WindowManagerState>()(
  persist(
    (set, get) => ({
      openWindows: [],
      activeWindowId: null,

      openWindow: (appId: string, title: string, icon: string) => {
        const state = get();

        // Check if this app is already open - if so, just focus it
        const existingWindow = state.openWindows.find(w => w.appId === appId);
        if (existingWindow) {
          set({ activeWindowId: existingWindow.id });
          return existingWindow.id;
        }

        // Create new window
        const newWindow: OpenWindow = {
          id: `${appId}-${Date.now()}`,
          appId,
          title,
          icon,
          timestamp: Date.now(),
        };

        set({
          openWindows: [...state.openWindows, newWindow],
          activeWindowId: newWindow.id,
        });

        return newWindow.id;
      },

      closeWindow: (windowId: string) => {
        const state = get();
        const windowIndex = state.openWindows.findIndex(w => w.id === windowId);

        if (windowIndex === -1) return;

        const newWindows = state.openWindows.filter(w => w.id !== windowId);

        // If we closed the active window, activate another one
        let newActiveId = state.activeWindowId;
        if (state.activeWindowId === windowId) {
          if (newWindows.length > 0) {
            // Try to activate the window to the left, or the first one
            const nextIndex = Math.max(0, windowIndex - 1);
            newActiveId = newWindows[nextIndex]?.id || null;
          } else {
            newActiveId = null; // No windows left, back to desktop
          }
        }

        set({
          openWindows: newWindows,
          activeWindowId: newActiveId,
        });
      },

      setActiveWindow: (windowId: string) => {
        const state = get();
        const window = state.openWindows.find(w => w.id === windowId);
        if (window) {
          set({ activeWindowId: windowId });
        }
      },

      closeAllWindows: () => {
        set({
          openWindows: [],
          activeWindowId: null,
        });
      },

      isAppOpen: (appId: string) => {
        return get().openWindows.some(w => w.appId === appId);
      },

      getActiveApp: () => {
        const state = get();
        if (!state.activeWindowId) return null;
        const window = state.openWindows.find(w => w.id === state.activeWindowId);
        return window?.appId || null;
      },
    }),
    {
      name: 'window-manager-storage',
      // Don't persist window state - fresh start each session
      partialize: () => ({}),
    }
  )
);
