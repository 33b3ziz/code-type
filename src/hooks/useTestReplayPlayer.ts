/**
 * useTestReplayPlayer Hook
 * Provides playback controls for stepping through typing test keystroke data
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeystrokeEvent } from '@/db/schema'

export interface ReplayState {
  /** Current position in the keystroke events array */
  currentIndex: number
  /** Whether the replay is currently playing */
  isPlaying: boolean
  /** Playback speed multiplier (1 = normal, 0.5 = half speed, 2 = double speed) */
  playbackSpeed: number
  /** Current timestamp in milliseconds from start */
  currentTimestamp: number
  /** Total duration of the test in milliseconds */
  totalDuration: number
}

export interface CurrentReplayStats {
  /** WPM at current position */
  wpm: number
  /** Accuracy at current position */
  accuracy: number
  /** Correct characters at current position */
  correctChars: number
  /** Incorrect characters at current position */
  incorrectChars: number
  /** Time elapsed at current position */
  elapsed: number
  /** Progress percentage (0-100) */
  progress: number
}

export interface CharacterReplayState {
  char: string
  state: 'pending' | 'correct' | 'incorrect' | 'cursor'
  isCurrentLine: boolean
}

export interface UseTestReplayPlayerConfig {
  /** The original code that was typed */
  code: string
  /** Array of keystroke events from the completed test */
  keystrokeEvents: KeystrokeEvent[]
  /** Auto-play when mounted (default: false) */
  autoPlay?: boolean
  /** Initial playback speed (default: 1) */
  initialSpeed?: number
}

export interface UseTestReplayPlayerReturn {
  /** Current replay state */
  state: ReplayState
  /** Current stats at the replay position */
  currentStats: CurrentReplayStats
  /** Character states for rendering the code display */
  characterStates: CharacterReplayState[]
  /** Current keystroke event (if any) */
  currentKeystroke: KeystrokeEvent | null
  /** Play the replay */
  play: () => void
  /** Pause the replay */
  pause: () => void
  /** Toggle play/pause */
  togglePlay: () => void
  /** Go to the next keystroke */
  stepForward: () => void
  /** Go to the previous keystroke */
  stepBackward: () => void
  /** Jump to a specific keystroke index */
  jumpToIndex: (index: number) => void
  /** Jump to a specific timestamp */
  jumpToTimestamp: (timestamp: number) => void
  /** Set playback speed */
  setPlaybackSpeed: (speed: number) => void
  /** Reset to the beginning */
  reset: () => void
  /** Go to the end */
  goToEnd: () => void
}

export function useTestReplayPlayer(config: UseTestReplayPlayerConfig): UseTestReplayPlayerReturn {
  const { code, keystrokeEvents, autoPlay = false, initialSpeed = 1 } = config

  const [state, setState] = useState<ReplayState>({
    currentIndex: -1, // -1 means no keystroke played yet (start state)
    isPlaying: autoPlay,
    playbackSpeed: initialSpeed,
    currentTimestamp: 0,
    totalDuration: keystrokeEvents.length > 0 ? keystrokeEvents[keystrokeEvents.length - 1].timestamp : 0,
  })

  // Ref for the playback interval
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastTickTimeRef = useRef<number>(Date.now())

  // Calculate character states based on current replay position
  const characterStates = useMemo((): CharacterReplayState[] => {
    const chars: CharacterReplayState[] = []
    const codeChars = code.split('')

    // Build a map of position -> state based on keystrokes up to current index
    const positionStates = new Map<number, 'correct' | 'incorrect'>()
    let currentPosition = 0

    for (let i = 0; i <= state.currentIndex && i < keystrokeEvents.length; i++) {
      const event = keystrokeEvents[i]
      if (event.type === 'char') {
        positionStates.set(event.position, event.isCorrect ? 'correct' : 'incorrect')
        currentPosition = event.position + 1
      } else if (event.type === 'backspace') {
        // Backspace removes the character at the position
        positionStates.delete(event.position)
        currentPosition = event.position
      }
    }

    // Find current line for highlighting
    let currentLineStart = 0
    let currentLineEnd = code.length

    const effectiveCursorPos = Math.min(currentPosition, code.length)

    for (let i = 0; i < effectiveCursorPos && i < code.length; i++) {
      if (code[i] === '\n') {
        currentLineStart = i + 1
      }
    }
    for (let i = effectiveCursorPos; i < code.length; i++) {
      if (code[i] === '\n') {
        currentLineEnd = i
        break
      }
    }

    // Build character states
    for (let i = 0; i < codeChars.length; i++) {
      const isCurrentLine = i >= currentLineStart && i <= currentLineEnd
      const charState = positionStates.get(i)

      if (i < currentPosition) {
        chars.push({
          char: codeChars[i],
          state: charState || 'pending',
          isCurrentLine,
        })
      } else if (i === currentPosition) {
        chars.push({
          char: codeChars[i],
          state: 'cursor',
          isCurrentLine,
        })
      } else {
        chars.push({
          char: codeChars[i],
          state: 'pending',
          isCurrentLine,
        })
      }
    }

    return chars
  }, [code, keystrokeEvents, state.currentIndex])

  // Calculate current stats
  const currentStats = useMemo((): CurrentReplayStats => {
    if (state.currentIndex < 0 || keystrokeEvents.length === 0) {
      return {
        wpm: 0,
        accuracy: 100,
        correctChars: 0,
        incorrectChars: 0,
        elapsed: 0,
        progress: 0,
      }
    }

    const currentEvent = keystrokeEvents[state.currentIndex]
    const progress = keystrokeEvents.length > 0
      ? ((state.currentIndex + 1) / keystrokeEvents.length) * 100
      : 0

    return {
      wpm: currentEvent?.wpmAtPoint ?? 0,
      accuracy: currentEvent?.accuracyAtPoint ?? 100,
      correctChars: currentEvent?.correctChars ?? 0,
      incorrectChars: currentEvent?.incorrectChars ?? 0,
      elapsed: (currentEvent?.timestamp ?? 0) / 1000, // Convert to seconds
      progress,
    }
  }, [state.currentIndex, keystrokeEvents])

  // Get current keystroke
  const currentKeystroke = useMemo((): KeystrokeEvent | null => {
    if (state.currentIndex < 0 || state.currentIndex >= keystrokeEvents.length) {
      return null
    }
    return keystrokeEvents[state.currentIndex]
  }, [state.currentIndex, keystrokeEvents])

  // Play the replay
  const play = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: true }))
    lastTickTimeRef.current = Date.now()
  }, [])

  // Pause the replay
  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }))
  }, [])

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    setState((prev) => {
      if (!prev.isPlaying) {
        lastTickTimeRef.current = Date.now()
      }
      return { ...prev, isPlaying: !prev.isPlaying }
    })
  }, [])

  // Step forward one keystroke
  const stepForward = useCallback(() => {
    setState((prev) => {
      const nextIndex = Math.min(prev.currentIndex + 1, keystrokeEvents.length - 1)
      const nextTimestamp = nextIndex >= 0 && nextIndex < keystrokeEvents.length
        ? keystrokeEvents[nextIndex].timestamp
        : prev.currentTimestamp

      return {
        ...prev,
        currentIndex: nextIndex,
        currentTimestamp: nextTimestamp,
        isPlaying: false,
      }
    })
  }, [keystrokeEvents])

  // Step backward one keystroke
  const stepBackward = useCallback(() => {
    setState((prev) => {
      const nextIndex = Math.max(prev.currentIndex - 1, -1)
      const nextTimestamp = nextIndex >= 0 && nextIndex < keystrokeEvents.length
        ? keystrokeEvents[nextIndex].timestamp
        : 0

      return {
        ...prev,
        currentIndex: nextIndex,
        currentTimestamp: nextTimestamp,
        isPlaying: false,
      }
    })
  }, [keystrokeEvents])

  // Jump to specific index
  const jumpToIndex = useCallback((index: number) => {
    setState((prev) => {
      const clampedIndex = Math.max(-1, Math.min(index, keystrokeEvents.length - 1))
      const timestamp = clampedIndex >= 0 && clampedIndex < keystrokeEvents.length
        ? keystrokeEvents[clampedIndex].timestamp
        : 0

      return {
        ...prev,
        currentIndex: clampedIndex,
        currentTimestamp: timestamp,
      }
    })
  }, [keystrokeEvents])

  // Jump to specific timestamp
  const jumpToTimestamp = useCallback((timestamp: number) => {
    // Find the index of the last keystroke at or before this timestamp
    let targetIndex = -1
    for (let i = 0; i < keystrokeEvents.length; i++) {
      if (keystrokeEvents[i].timestamp <= timestamp) {
        targetIndex = i
      } else {
        break
      }
    }

    setState((prev) => ({
      ...prev,
      currentIndex: targetIndex,
      currentTimestamp: timestamp,
    }))
  }, [keystrokeEvents])

  // Set playback speed
  const setPlaybackSpeed = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, playbackSpeed: Math.max(0.25, Math.min(4, speed)) }))
  }, [])

  // Reset to beginning
  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: -1,
      currentTimestamp: 0,
      isPlaying: false,
    }))
  }, [])

  // Go to end
  const goToEnd = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: keystrokeEvents.length - 1,
      currentTimestamp: prev.totalDuration,
      isPlaying: false,
    }))
  }, [keystrokeEvents.length])

  // Playback effect
  useEffect(() => {
    if (!state.isPlaying || keystrokeEvents.length === 0) {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
        playbackIntervalRef.current = null
      }
      return
    }

    // If we're at the end, stop playing
    if (state.currentIndex >= keystrokeEvents.length - 1) {
      setState((prev) => ({ ...prev, isPlaying: false }))
      return
    }

    const tick = () => {
      const now = Date.now()
      const deltaReal = now - lastTickTimeRef.current
      lastTickTimeRef.current = now

      // Calculate how much time passed in replay time
      const deltaReplay = deltaReal * state.playbackSpeed

      setState((prev) => {
        if (!prev.isPlaying) return prev

        const newTimestamp = prev.currentTimestamp + deltaReplay

        // Find the new index based on timestamp
        let newIndex = prev.currentIndex
        while (
          newIndex < keystrokeEvents.length - 1 &&
          keystrokeEvents[newIndex + 1].timestamp <= newTimestamp
        ) {
          newIndex++
        }

        // Check if we've reached the end
        const reachedEnd = newIndex >= keystrokeEvents.length - 1

        return {
          ...prev,
          currentTimestamp: Math.min(newTimestamp, prev.totalDuration),
          currentIndex: newIndex,
          isPlaying: !reachedEnd,
        }
      })
    }

    // Run tick every 16ms (approximately 60fps)
    playbackIntervalRef.current = setInterval(tick, 16)

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
        playbackIntervalRef.current = null
      }
    }
  }, [state.isPlaying, state.playbackSpeed, keystrokeEvents])

  return {
    state,
    currentStats,
    characterStates,
    currentKeystroke,
    play,
    pause,
    togglePlay,
    stepForward,
    stepBackward,
    jumpToIndex,
    jumpToTimestamp,
    setPlaybackSpeed,
    reset,
    goToEnd,
  }
}

export { type KeystrokeEvent }
