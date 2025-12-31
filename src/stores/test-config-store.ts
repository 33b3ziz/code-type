/**
 * Test Configuration Store
 * Manages the test wizard state including language, difficulty, challenge type, and options
 */

import { create } from 'zustand'
import type { Difficulty, Language } from '@/db/schema'

export type ChallengeType = '30s' | '60s' | '120s' | 'endless' | 'custom'
export type Step = 'language' | 'difficulty' | 'challenge' | 'options'

export interface TestConfig {
  language: Language | 'all'
  difficulty: Difficulty
  challengeType: ChallengeType
  duration: number | null // null for endless
  strictMode: boolean
  allowBackspace: boolean
}

interface TestConfigState {
  // Wizard state
  step: Step

  // Config values
  language: Language | 'all'
  difficulty: Difficulty
  challengeType: ChallengeType
  customDuration: number
  strictMode: boolean
  allowBackspace: boolean

  // Actions
  setStep: (step: Step) => void
  setLanguage: (language: Language | 'all') => void
  setDifficulty: (difficulty: Difficulty) => void
  setChallengeType: (challengeType: ChallengeType) => void
  setCustomDuration: (duration: number) => void
  setStrictMode: (strictMode: boolean) => void
  setAllowBackspace: (allowBackspace: boolean) => void

  // Computed
  getConfig: () => TestConfig

  // Reset
  reset: () => void
}

const DEFAULT_CONFIG = {
  step: 'language' as Step,
  language: 'all' as Language | 'all',
  difficulty: 'intermediate' as Difficulty,
  challengeType: '60s' as ChallengeType,
  customDuration: 60,
  strictMode: false,
  allowBackspace: true,
}

/**
 * Get the duration for a challenge type
 */
function getChallengeDuration(
  challengeType: ChallengeType,
  customDuration: number
): number | null {
  switch (challengeType) {
    case '30s':
      return 30
    case '60s':
      return 60
    case '120s':
      return 120
    case 'endless':
      return null
    case 'custom':
      return customDuration
    default:
      return 60
  }
}

export const useTestConfigStore = create<TestConfigState>((set, get) => ({
  ...DEFAULT_CONFIG,

  setStep: (step) => set({ step }),
  setLanguage: (language) => set({ language }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setChallengeType: (challengeType) => set({ challengeType }),
  setCustomDuration: (customDuration) => set({ customDuration }),
  setStrictMode: (strictMode) => set({ strictMode }),
  setAllowBackspace: (allowBackspace) => set({ allowBackspace }),

  getConfig: () => {
    const state = get()
    return {
      language: state.language,
      difficulty: state.difficulty,
      challengeType: state.challengeType,
      duration: getChallengeDuration(state.challengeType, state.customDuration),
      strictMode: state.strictMode,
      allowBackspace: state.allowBackspace,
    }
  },

  reset: () => set(DEFAULT_CONFIG),
}))
