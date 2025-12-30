import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useStopwatch, useTimer } from '@/hooks/useTimer'

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useTimer({ duration: 60 }))

      expect(result.current.timeRemaining).toBe(60)
      expect(result.current.isRunning).toBe(false)
      expect(result.current.isExpired).toBe(false)
      expect(result.current.elapsed).toBe(0)
    })

    it('auto starts when autoStart is true', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60, autoStart: true })
      )

      expect(result.current.isRunning).toBe(true)
    })

    it('formats time correctly', () => {
      const { result } = renderHook(() => useTimer({ duration: 90 }))

      expect(result.current.formattedTime).toBe('1:30')
    })
  })

  describe('timer controls', () => {
    it('starts the timer', () => {
      const { result } = renderHook(() => useTimer({ duration: 60 }))

      act(() => {
        result.current.start()
      })

      expect(result.current.isRunning).toBe(true)
    })

    it('pauses the timer', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60, autoStart: true })
      )

      act(() => {
        result.current.pause()
      })

      expect(result.current.isRunning).toBe(false)
    })

    it('resets the timer', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60, autoStart: true })
      )

      // Advance time
      act(() => {
        vi.advanceTimersByTime(10000) // 10 seconds
      })

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.timeRemaining).toBe(60)
      expect(result.current.isRunning).toBe(false)
      expect(result.current.elapsed).toBe(0)
    })

    it('stops without resetting', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60, autoStart: true })
      )

      // Advance time
      act(() => {
        vi.advanceTimersByTime(10000) // 10 seconds
      })

      const elapsedBefore = result.current.elapsed

      act(() => {
        result.current.stop()
      })

      expect(result.current.isRunning).toBe(false)
      expect(result.current.elapsed).toBe(elapsedBefore)
    })
  })

  describe('countdown behavior', () => {
    it('counts down correctly', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60, autoStart: true })
      )

      act(() => {
        vi.advanceTimersByTime(10000) // 10 seconds
      })

      expect(result.current.timeRemaining).toBe(50)
      expect(result.current.elapsed).toBe(10)
    })

    it('expires when time runs out', () => {
      const onExpire = vi.fn()
      const { result } = renderHook(() =>
        useTimer({ duration: 5, autoStart: true, onExpire })
      )

      act(() => {
        vi.advanceTimersByTime(5100) // 5.1 seconds
      })

      expect(result.current.isExpired).toBe(true)
      expect(result.current.isRunning).toBe(false)
      expect(result.current.timeRemaining).toBe(0)
      expect(onExpire).toHaveBeenCalledTimes(1)
    })

    it('calculates progress correctly', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 100, autoStart: true })
      )

      act(() => {
        vi.advanceTimersByTime(25000) // 25 seconds
      })

      expect(result.current.progress).toBe(25)
    })
  })

  describe('resume functionality', () => {
    it('resumes from paused state', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60, autoStart: true })
      )

      // Advance and pause
      act(() => {
        vi.advanceTimersByTime(10000)
      })
      act(() => {
        result.current.pause()
      })

      const elapsedAtPause = result.current.elapsed

      // Resume
      act(() => {
        result.current.resume()
      })

      expect(result.current.isRunning).toBe(true)

      // Advance more
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current.elapsed).toBe(elapsedAtPause + 5)
    })

    it('does not resume if expired', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 5, autoStart: true })
      )

      act(() => {
        vi.advanceTimersByTime(6000)
      })

      expect(result.current.isExpired).toBe(true)

      act(() => {
        result.current.resume()
      })

      expect(result.current.isRunning).toBe(false)
    })
  })
})

describe('useStopwatch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with zero elapsed time', () => {
    const { result } = renderHook(() => useStopwatch())

    expect(result.current.elapsed).toBe(0)
    expect(result.current.isRunning).toBe(false)
    expect(result.current.formattedTime).toBe('0:00')
  })

  it('counts up when started', () => {
    const { result } = renderHook(() => useStopwatch())

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(result.current.elapsed).toBe(10)
    expect(result.current.formattedTime).toBe('0:10')
  })

  it('stops counting when stopped', () => {
    const { result } = renderHook(() => useStopwatch())

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    act(() => {
      result.current.stop()
    })

    const elapsedAtStop = result.current.elapsed

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.elapsed).toBe(elapsedAtStop)
  })

  it('resets to zero', () => {
    const { result } = renderHook(() => useStopwatch())

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(30000)
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.elapsed).toBe(0)
    expect(result.current.isRunning).toBe(false)
  })

  it('formats time with minutes', () => {
    const { result } = renderHook(() => useStopwatch())

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(125000) // 2:05
    })

    expect(result.current.formattedTime).toBe('2:05')
  })
})
