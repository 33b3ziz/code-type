/**
 * useTypingTestWithSound Hook
 * Wraps useTypingTest to add sound effects
 */

import { useCallback, useEffect, useRef } from 'react'

import { useTypingTest } from './useTypingTest'

import type { TypingTestConfig } from './useTypingTest'
import type { SoundType } from '@/stores/sound-store'

interface SoundConfig {
  enabled: boolean
  volume: number
}

interface UseTypingTestWithSoundConfig extends TypingTestConfig {
  sound?: SoundConfig
}

// Sound frequencies for generated tones
const SOUND_CONFIG: Record<SoundType, { frequency: number; duration: number }> = {
  keypress: { frequency: 440, duration: 25 },
  'keypress-correct': { frequency: 523, duration: 20 },
  'keypress-error': { frequency: 220, duration: 40 },
  backspace: { frequency: 330, duration: 30 },
  completion: { frequency: 880, duration: 200 },
  achievement: { frequency: 660, duration: 150 },
}

/**
 * Play a generated tone
 */
function playTone(
  audioContext: AudioContext,
  frequency: number,
  duration: number,
  volume: number
) {
  try {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)

    // Volume envelope (max 30% to avoid being too loud)
    const normalizedVolume = (volume / 100) * 0.3
    gainNode.gain.setValueAtTime(normalizedVolume, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration / 1000
    )

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration / 1000)
  } catch (error) {
    // Silently fail - sound is not critical
  }
}

export function useTypingTestWithSound(config: UseTypingTestWithSoundConfig) {
  const { sound, ...typingConfig } = config
  const typingTest = useTypingTest(typingConfig)

  // Audio context reference
  const audioContextRef = useRef<AudioContext | null>(null)

  // Previous state for detecting changes
  const prevStateRef = useRef({
    cursorPosition: 0,
    incorrectChars: 0,
    backspaceCount: 0,
    isFinished: false,
  })

  // Initialize audio context on first interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current && sound?.enabled) {
      try {
        audioContextRef.current = new AudioContext()
      } catch {
        // Audio not supported
      }
    }
  }, [sound?.enabled])

  // Play a sound effect
  const playSoundEffect = useCallback(
    (type: SoundType) => {
      if (!sound?.enabled || !audioContextRef.current) return

      const soundParams = SOUND_CONFIG[type]
      playTone(
        audioContextRef.current,
        soundParams.frequency,
        soundParams.duration,
        sound.volume
      )
    },
    [sound?.enabled, sound?.volume]
  )

  // Detect state changes and play appropriate sounds
  useEffect(() => {
    const prev = prevStateRef.current
    const curr = typingTest.state

    // Initialize audio on first keystroke
    if (curr.isStarted && !audioContextRef.current) {
      initAudio()
    }

    // Character typed
    if (curr.cursorPosition > prev.cursorPosition) {
      if (curr.incorrectChars > prev.incorrectChars) {
        // Error
        playSoundEffect('keypress-error')
      } else {
        // Correct
        playSoundEffect('keypress-correct')
      }
    }

    // Backspace used
    if (curr.backspaceCount > prev.backspaceCount) {
      playSoundEffect('backspace')
    }

    // Test completed
    if (curr.isFinished && !prev.isFinished) {
      playSoundEffect('completion')
    }

    // Update previous state
    prevStateRef.current = {
      cursorPosition: curr.cursorPosition,
      incorrectChars: curr.incorrectChars,
      backspaceCount: curr.backspaceCount,
      isFinished: curr.isFinished,
    }
  }, [
    typingTest.state.cursorPosition,
    typingTest.state.incorrectChars,
    typingTest.state.backspaceCount,
    typingTest.state.isFinished,
    typingTest.state.isStarted,
    initAudio,
    playSoundEffect,
  ])

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [])

  return {
    ...typingTest,
    initAudio,
  }
}

export default useTypingTestWithSound
