/**
 * useSound Hook
 * Provides easy access to sound playback with settings integration
 */

import { useCallback, useEffect, useRef } from 'react'

import type { SoundType } from '@/stores/sound-store'
import { useSoundStore } from '@/stores/sound-store'

// Sound URLs - using generated tones for simplicity
// In production, these would be actual audio files
const SOUND_FREQUENCIES: Record<SoundType, { frequency: number; duration: number }> = {
  keypress: { frequency: 440, duration: 30 },
  'keypress-correct': { frequency: 523, duration: 25 },
  'keypress-error': { frequency: 220, duration: 50 },
  backspace: { frequency: 330, duration: 35 },
  completion: { frequency: 880, duration: 200 },
  achievement: { frequency: 660, duration: 150 },
}

interface UseSoundOptions {
  enabled?: boolean
  volume?: number
}

/**
 * Hook for playing sound effects
 */
export function useSound(options: UseSoundOptions = {}) {
  const { enabled = true, volume = 50 } = options

  const audioContextRef = useRef<AudioContext | null>(null)
  const isInitializedRef = useRef(false)

  // Initialize audio context on first user interaction
  const initializeAudio = useCallback(() => {
    if (isInitializedRef.current || !enabled) return

    try {
      audioContextRef.current = new AudioContext()
      isInitializedRef.current = true
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
    }
  }, [enabled])

  // Generate a simple tone
  const playTone = useCallback(
    (frequency: number, duration: number) => {
      if (!enabled || !audioContextRef.current) return

      try {
        const ctx = audioContextRef.current
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

        // Volume envelope
        const normalizedVolume = (volume / 100) * 0.3 // Max 30% to avoid being too loud
        gainNode.gain.setValueAtTime(normalizedVolume, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + duration / 1000
        )

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + duration / 1000)
      } catch (error) {
        console.error('Failed to play tone:', error)
      }
    },
    [enabled, volume]
  )

  // Play a specific sound type
  const play = useCallback(
    (type: SoundType) => {
      if (!enabled) return

      // Initialize on first play (requires user interaction)
      if (!isInitializedRef.current) {
        initializeAudio()
      }

      const soundConfig = SOUND_FREQUENCIES[type]
      playTone(soundConfig.frequency, soundConfig.duration)
    },
    [enabled, initializeAudio, playTone]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
        isInitializedRef.current = false
      }
    }
  }, [])

  return {
    play,
    initializeAudio,
    isEnabled: enabled,
  }
}

/**
 * Hook that integrates with the global sound store
 */
export function useGlobalSound() {
  const {
    enabled,
    volume,
    playSound,
    setEnabled,
    setVolume,
    initialize,
  } = useSoundStore()

  return {
    play: playSound,
    enabled,
    volume,
    setEnabled,
    setVolume,
    initialize,
  }
}

export default useSound
