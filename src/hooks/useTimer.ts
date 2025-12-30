import { useState, useCallback, useRef, useEffect } from 'react'

export interface TimerState {
  timeRemaining: number // in seconds
  isRunning: boolean
  isExpired: boolean
  elapsed: number // in seconds
}

export interface TimerConfig {
  duration: number // in seconds
  onExpire?: () => void
  autoStart?: boolean
}

export function useTimer(config: TimerConfig) {
  const { duration, onExpire, autoStart = false } = config

  const [state, setState] = useState<TimerState>({
    timeRemaining: duration,
    isRunning: autoStart,
    isExpired: false,
    elapsed: 0,
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const onExpireRef = useRef(onExpire)

  // Keep onExpire ref updated
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  // Timer tick effect
  useEffect(() => {
    if (!state.isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now()
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - (startTimeRef.current ?? now)) / 1000)
      const remaining = Math.max(0, duration - elapsed)

      setState((prev) => {
        if (remaining === 0 && !prev.isExpired) {
          onExpireRef.current?.()
          return {
            timeRemaining: 0,
            isRunning: false,
            isExpired: true,
            elapsed: duration,
          }
        }
        return {
          ...prev,
          timeRemaining: remaining,
          elapsed,
        }
      })
    }, 100) // Update more frequently for smooth display

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state.isRunning, duration])

  // Start the timer
  const start = useCallback(() => {
    if (state.isExpired) return

    startTimeRef.current = Date.now()
    setState((prev) => ({
      ...prev,
      isRunning: true,
    }))
  }, [state.isExpired])

  // Pause the timer
  const pause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
    }))
  }, [])

  // Resume the timer (adjusting for paused time)
  const resume = useCallback(() => {
    if (state.isExpired) return

    // Adjust start time to account for elapsed time
    startTimeRef.current = Date.now() - state.elapsed * 1000
    setState((prev) => ({
      ...prev,
      isRunning: true,
    }))
  }, [state.isExpired, state.elapsed])

  // Reset the timer
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    startTimeRef.current = null
    setState({
      timeRemaining: duration,
      isRunning: false,
      isExpired: false,
      elapsed: 0,
    })
  }, [duration])

  // Stop the timer (without resetting)
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setState((prev) => ({
      ...prev,
      isRunning: false,
    }))
  }, [])

  // Format time for display
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    // State
    ...state,
    formattedTime: formatTime(state.timeRemaining),
    formattedElapsed: formatTime(state.elapsed),
    progress: duration > 0 ? (state.elapsed / duration) * 100 : 0,

    // Actions
    start,
    pause,
    resume,
    reset,
    stop,
  }
}

// Hook for stopwatch (count up instead of down)
export function useStopwatch() {
  const [state, setState] = useState({
    elapsed: 0, // in seconds
    isRunning: false,
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!state.isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now()
    }

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - (startTimeRef.current ?? Date.now())) / 1000
      )
      setState((prev) => ({ ...prev, elapsed }))
    }, 100)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state.isRunning])

  const start = useCallback(() => {
    startTimeRef.current = Date.now()
    setState({ elapsed: 0, isRunning: true })
  }, [])

  const stop = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }))
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    startTimeRef.current = null
    setState({ elapsed: 0, isRunning: false })
  }, [])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return {
    elapsed: state.elapsed,
    isRunning: state.isRunning,
    formattedTime: formatTime(state.elapsed),
    start,
    stop,
    reset,
  }
}
