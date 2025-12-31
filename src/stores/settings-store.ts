/**
 * Settings Store
 * Manages user preferences with localStorage persistence
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'
export type CaretStyle = 'line' | 'block' | 'underline'

export interface SettingsState {
  // Display settings
  theme: Theme
  fontSize: number
  showLineNumbers: boolean
  smoothCaret: boolean
  caretStyle: CaretStyle

  // Editor settings
  autoIndent: boolean
  tabSize: number

  // Sound settings
  soundEnabled: boolean
  soundVolume: number

  // Test display settings
  showWpm: boolean
  showAccuracy: boolean
  showTimer: boolean
  strictMode: boolean

  // Actions
  setTheme: (theme: Theme) => void
  setFontSize: (size: number) => void
  setShowLineNumbers: (show: boolean) => void
  setSmoothCaret: (smooth: boolean) => void
  setCaretStyle: (style: CaretStyle) => void
  setAutoIndent: (auto: boolean) => void
  setTabSize: (size: number) => void
  setSoundEnabled: (enabled: boolean) => void
  setSoundVolume: (volume: number) => void
  setShowWpm: (show: boolean) => void
  setShowAccuracy: (show: boolean) => void
  setShowTimer: (show: boolean) => void
  setStrictMode: (strict: boolean) => void

  // Bulk update
  updateSettings: (settings: Partial<SettingsState>) => void

  // Reset
  reset: () => void
}

const DEFAULT_SETTINGS = {
  theme: 'dark' as Theme,
  fontSize: 16,
  showLineNumbers: true,
  smoothCaret: true,
  caretStyle: 'line' as CaretStyle,
  autoIndent: true,
  tabSize: 2,
  soundEnabled: false,
  soundVolume: 50,
  showWpm: true,
  showAccuracy: true,
  showTimer: true,
  strictMode: false,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setShowLineNumbers: (showLineNumbers) => set({ showLineNumbers }),
      setSmoothCaret: (smoothCaret) => set({ smoothCaret }),
      setCaretStyle: (caretStyle) => set({ caretStyle }),
      setAutoIndent: (autoIndent) => set({ autoIndent }),
      setTabSize: (tabSize) => set({ tabSize }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setSoundVolume: (soundVolume) => set({ soundVolume }),
      setShowWpm: (showWpm) => set({ showWpm }),
      setShowAccuracy: (showAccuracy) => set({ showAccuracy }),
      setShowTimer: (showTimer) => set({ showTimer }),
      setStrictMode: (strictMode) => set({ strictMode }),

      updateSettings: (settings) => set(settings),

      reset: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'code-type-settings',
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        showLineNumbers: state.showLineNumbers,
        smoothCaret: state.smoothCaret,
        caretStyle: state.caretStyle,
        autoIndent: state.autoIndent,
        tabSize: state.tabSize,
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
        showWpm: state.showWpm,
        showAccuracy: state.showAccuracy,
        showTimer: state.showTimer,
        strictMode: state.strictMode,
      }),
    }
  )
)
