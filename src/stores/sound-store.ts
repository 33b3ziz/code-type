/**
 * Sound Store
 * Manages sound effects state and Web Audio API context
 */

import { create } from 'zustand'

export type SoundType =
  | 'keypress'
  | 'keypress-correct'
  | 'keypress-error'
  | 'backspace'
  | 'completion'
  | 'achievement'

interface SoundBuffer {
  type: SoundType
  buffer: AudioBuffer
}

interface SoundState {
  // Audio context
  audioContext: AudioContext | null
  isInitialized: boolean

  // Sound buffers
  soundBuffers: Map<SoundType, AudioBuffer>

  // Settings (synced with settings store)
  enabled: boolean
  volume: number

  // Actions
  initialize: () => Promise<void>
  loadSound: (type: SoundType, url: string) => Promise<void>
  playSound: (type: SoundType) => void
  setEnabled: (enabled: boolean) => void
  setVolume: (volume: number) => void
  cleanup: () => void
}

export const useSoundStore = create<SoundState>((set, get) => ({
  audioContext: null,
  isInitialized: false,
  soundBuffers: new Map(),
  enabled: false,
  volume: 50,

  initialize: async () => {
    const state = get()
    if (state.isInitialized || state.audioContext) {
      return
    }

    try {
      const audioContext = new AudioContext()

      // Resume context if it's suspended (required for user interaction)
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      set({
        audioContext,
        isInitialized: true,
      })
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
    }
  },

  loadSound: async (type, url) => {
    const state = get()
    if (!state.audioContext) {
      await state.initialize()
    }

    const audioContext = get().audioContext
    if (!audioContext) {
      return
    }

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      set((state) => {
        const newBuffers = new Map(state.soundBuffers)
        newBuffers.set(type, audioBuffer)
        return { soundBuffers: newBuffers }
      })
    } catch (error) {
      console.error(`Failed to load sound ${type}:`, error)
    }
  },

  playSound: (type) => {
    const state = get()
    if (!state.enabled || !state.audioContext) {
      return
    }

    const buffer = state.soundBuffers.get(type)
    if (!buffer) {
      return
    }

    try {
      const source = state.audioContext.createBufferSource()
      const gainNode = state.audioContext.createGain()

      source.buffer = buffer
      gainNode.gain.value = state.volume / 100

      source.connect(gainNode)
      gainNode.connect(state.audioContext.destination)

      source.start(0)
    } catch (error) {
      console.error(`Failed to play sound ${type}:`, error)
    }
  },

  setEnabled: (enabled) => set({ enabled }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(100, volume)) }),

  cleanup: () => {
    const state = get()
    if (state.audioContext) {
      state.audioContext.close()
    }
    set({
      audioContext: null,
      isInitialized: false,
      soundBuffers: new Map(),
    })
  },
}))
