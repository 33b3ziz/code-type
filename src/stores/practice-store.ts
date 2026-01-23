/**
 * Practice Store
 * Manages practice mode tracking including completions, favorites, and weak spot progress
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { PracticeMode } from '@/db/schema'

/** Tracks accuracy history for a specific character */
interface CharacterAccuracyHistory {
  /** The character being tracked */
  char: string
  /** Array of accuracy percentages from practice sessions (most recent last) */
  accuracyHistory: Array<number>
  /** Timestamp of last practice */
  lastPracticed: string
}

/** Represents a weak spot session result */
interface WeakSpotSessionResult {
  /** Characters that were practiced */
  characters: Array<string>
  /** Per-character results */
  characterResults: Record<string, { correct: number; total: number }>
  /** Overall accuracy */
  accuracy: number
  /** Timestamp */
  timestamp: string
}

interface PracticeStoreState {
  // Completion tracking
  completedModes: Record<PracticeMode, number>

  // Favorites
  favoriteModes: Array<PracticeMode>

  // Last session info
  lastPlayedMode: PracticeMode | null
  lastPlayedAt: string | null

  // Weak spot tracking (persisted locally for quick access)
  weakSpotHistory: Array<CharacterAccuracyHistory>
  weakSpotSessions: Array<WeakSpotSessionResult>
  localErrorPatterns: Record<string, number>

  // Actions
  markCompleted: (mode: PracticeMode) => void
  toggleFavorite: (mode: PracticeMode) => void
  isFavorite: (mode: PracticeMode) => boolean
  getCompletionCount: (mode: PracticeMode) => number
  setLastPlayed: (mode: PracticeMode) => void
  resetProgress: () => void

  // Weak spot actions
  recordWeakSpotSession: (result: Omit<WeakSpotSessionResult, 'timestamp'>) => void
  updateErrorPatterns: (patterns: Record<string, number>) => void
  getCharacterProgress: (char: string) => CharacterAccuracyHistory | undefined
  getMasteredCharacters: () => Array<string>
  getTopWeakCharacters: (limit?: number) => Array<{ char: string; errorCount: number }>
  clearWeakSpotHistory: () => void
}

const initialState = {
  completedModes: {
    symbols: 0,
    keywords: 0,
    'weak-spots': 0,
    speed: 0,
    accuracy: 0,
    'warm-up': 0,
  } as Record<PracticeMode, number>,
  favoriteModes: [] as Array<PracticeMode>,
  lastPlayedMode: null as PracticeMode | null,
  lastPlayedAt: null as string | null,
  weakSpotHistory: [] as Array<CharacterAccuracyHistory>,
  weakSpotSessions: [] as Array<WeakSpotSessionResult>,
  localErrorPatterns: {} as Record<string, number>,
}

export const usePracticeStore = create<PracticeStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      markCompleted: (mode) =>
        set((state) => ({
          completedModes: {
            ...state.completedModes,
            [mode]: (state.completedModes[mode] ?? 0) + 1,
          },
        })),

      toggleFavorite: (mode) =>
        set((state) => {
          const isFav = state.favoriteModes.includes(mode)
          return {
            favoriteModes: isFav
              ? state.favoriteModes.filter((m) => m !== mode)
              : [...state.favoriteModes, mode],
          }
        }),

      isFavorite: (mode) => get().favoriteModes.includes(mode),

      getCompletionCount: (mode) => get().completedModes[mode] ?? 0,

      setLastPlayed: (mode) =>
        set({
          lastPlayedMode: mode,
          lastPlayedAt: new Date().toISOString(),
        }),

      resetProgress: () => set(initialState),

      // Weak spot actions
      recordWeakSpotSession: (result) =>
        set((state) => {
          const timestamp = new Date().toISOString()
          const newSession: WeakSpotSessionResult = { ...result, timestamp }

          // Update character accuracy history
          const updatedHistory = [...state.weakSpotHistory]

          for (const char of result.characters) {
            const charResult = result.characterResults[char]
            if (!charResult || charResult.total === 0) continue

            const accuracy = Math.round((charResult.correct / charResult.total) * 100)
            const existingIndex = updatedHistory.findIndex((h) => h.char === char)

            if (existingIndex >= 0) {
              // Update existing entry
              const existing = updatedHistory[existingIndex]
              updatedHistory[existingIndex] = {
                ...existing,
                accuracyHistory: [...existing.accuracyHistory.slice(-9), accuracy], // Keep last 10
                lastPracticed: timestamp,
              }
            } else {
              // Add new entry
              updatedHistory.push({
                char,
                accuracyHistory: [accuracy],
                lastPracticed: timestamp,
              })
            }
          }

          return {
            weakSpotHistory: updatedHistory,
            weakSpotSessions: [...state.weakSpotSessions.slice(-19), newSession], // Keep last 20
          }
        }),

      updateErrorPatterns: (patterns) =>
        set((state) => {
          const merged = { ...state.localErrorPatterns }
          for (const [char, count] of Object.entries(patterns)) {
            merged[char] = (merged[char] || 0) + count
          }
          return { localErrorPatterns: merged }
        }),

      getCharacterProgress: (char) => {
        return get().weakSpotHistory.find((h) => h.char === char)
      },

      getMasteredCharacters: () => {
        const history = get().weakSpotHistory
        return history
          .filter((h) => {
            // Consider mastered if last 3 sessions are > 90% accuracy
            const recent = h.accuracyHistory.slice(-3)
            return recent.length >= 3 && recent.every((acc) => acc >= 90)
          })
          .map((h) => h.char)
      },

      getTopWeakCharacters: (limit = 6) => {
        const patterns = get().localErrorPatterns
        return Object.entries(patterns)
          .map(([char, errorCount]) => ({ char, errorCount }))
          .sort((a, b) => b.errorCount - a.errorCount)
          .slice(0, limit)
      },

      clearWeakSpotHistory: () =>
        set({
          weakSpotHistory: [],
          weakSpotSessions: [],
          localErrorPatterns: {},
        }),
    }),
    {
      name: 'practice-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default usePracticeStore
