import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTimer, useStopwatch } from '../useTimer'

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60 })
      )

      expect(result.current.timeRemaining).toBe(60)
      expect(result.current.isRunning).toBe(false)
      expect(result.current.isExpired).toBe(false)
      expect(result.current.elapsed).toBe(0)
    })

    it('should initialize with autoStart', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60, autoStart: true })
      )

      expect(result.current.isRunning).toBe(true)
    })

    it('should format time correctly', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 125 })
      )

      expect(result.current.formattedTime).toBe('2:05')
    })

    it('should calculate progress correctly', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60 })
      )

      expect(result.current.progress).toBe(0)
    })
  })

  describe('start functionality', () => {
    it('should start the timer', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60 })
      )

      act(() => {
        result.current.start()
      })

      expect(result.current.isRunning).toBe(true)
    })

    it('should decrement time when running', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60 })
      )

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:10.000Z'))
        vi.advanceTimersByTime(10000)
      })

      expect(result.current.timeRemaining).toBe(50)
      expect(result.current.elapsed).toBe(10)
    })

    it('should not start if already expired', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 1 })
      )

      // Start and let it expire
      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:02.000Z'))
        vi.advanceTimersByTime(2000)
      })

      expect(result.current.isExpired).toBe(true)
      expect(result.current.isRunning).toBe(false)

      // Try to start again
      act(() => {
        result.current.start()
      })

      expect(result.current.isRunning).toBe(false)
    })
  })

  describe('pause and resume functionality', () => {
    it('should pause the timer', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60 })
      )

      act(() => {
        result.current.start()
      })

      expect(result.current.isRunning).toBe(true)

      act(() => {
        result.current.pause()
      })

      expect(result.current.isRunning).toBe(false)
    })

    it('should resume from paused state', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60 })
      )

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:10.000Z'))
        vi.advanceTimersByTime(10000)
      })

      act(() => {
        result.current.pause()
      })

      const elapsedAtPause = result.current.elapsed

      act(() => {
        result.current.resume()
      })

      expect(result.current.isRunning).toBe(true)
      expect(result.current.elapsed).toBe(elapsedAtPause)
    })

    it('should not resume if expired', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 1 })
      )

      // Expire the timer
      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:02.000Z'))
        vi.advanceTimersByTime(2000)
      })

      expect(result.current.isExpired).toBe(true)

      act(() => {
        result.current.resume()
      })

      expect(result.current.isRunning).toBe(false)
    })
  })

  describe('stop functionality', () => {
    it('should stop the timer without resetting', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60 })
      )

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:10.000Z'))
        vi.advanceTimersByTime(10000)
      })

      const elapsedBeforeStop = result.current.elapsed
      const remainingBeforeStop = result.current.timeRemaining

      act(() => {
        result.current.stop()
      })

      expect(result.current.isRunning).toBe(false)
      expect(result.current.elapsed).toBe(elapsedBeforeStop)
      expect(result.current.timeRemaining).toBe(remainingBeforeStop)
    })
  })

  describe('reset functionality', () => {
    it('should reset all state', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60 })
      )

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:10.000Z'))
        vi.advanceTimersByTime(10000)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.timeRemaining).toBe(60)
      expect(result.current.isRunning).toBe(false)
      expect(result.current.isExpired).toBe(false)
      expect(result.current.elapsed).toBe(0)
    })

    it('should reset expired timer', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 1 })
      )

      // Expire the timer
      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:02.000Z'))
        vi.advanceTimersByTime(2000)
      })

      expect(result.current.isExpired).toBe(true)

      act(() => {
        result.current.reset()
      })

      expect(result.current.isExpired).toBe(false)
      expect(result.current.timeRemaining).toBe(1)
    })
  })

  describe('expiration callback', () => {
    it('should call onExpire when timer expires', () => {
      const onExpire = vi.fn()
      const { result } = renderHook(() =>
        useTimer({ duration: 1, onExpire })
      )

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:02.000Z'))
        vi.advanceTimersByTime(2000)
      })

      expect(onExpire).toHaveBeenCalledTimes(1)
      expect(result.current.isExpired).toBe(true)
      expect(result.current.isRunning).toBe(false)
    })

    it('should call onExpire only once', () => {
      const onExpire = vi.fn()
      const { result } = renderHook(() =>
        useTimer({ duration: 1, onExpire })
      )

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:02.000Z'))
        vi.advanceTimersByTime(2000)
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:03.000Z'))
        vi.advanceTimersByTime(1000)
      })

      expect(onExpire).toHaveBeenCalledTimes(1)
    })
  })

  describe('time formatting', () => {
    it('should format 0 seconds correctly', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 0 })
      )

      expect(result.current.formattedTime).toBe('0:00')
    })

    it('should format 59 seconds correctly', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 59 })
      )

      expect(result.current.formattedTime).toBe('0:59')
    })

    it('should format 60 seconds correctly', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60 })
      )

      expect(result.current.formattedTime).toBe('1:00')
    })

    it('should format 90 seconds correctly', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 90 })
      )

      expect(result.current.formattedTime).toBe('1:30')
    })

    it('should format elapsed time correctly', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 60 })
      )

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:25.000Z'))
        vi.advanceTimersByTime(25000)
      })

      expect(result.current.formattedElapsed).toBe('0:25')
    })
  })

  describe('progress calculation', () => {
    it('should calculate progress percentage', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 100 })
      )

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:50.000Z'))
        vi.advanceTimersByTime(50000)
      })

      expect(result.current.progress).toBe(50)
    })

    it('should handle zero duration', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 0 })
      )

      expect(result.current.progress).toBe(0)
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

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useStopwatch())

      expect(result.current.elapsed).toBe(0)
      expect(result.current.isRunning).toBe(false)
      expect(result.current.formattedTime).toBe('0:00')
    })
  })

  describe('start functionality', () => {
    it('should start the stopwatch', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.start()
      })

      expect(result.current.isRunning).toBe(true)
    })

    it('should count up elapsed time', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:15.000Z'))
        vi.advanceTimersByTime(15000)
      })

      expect(result.current.elapsed).toBe(15)
      expect(result.current.formattedTime).toBe('0:15')
    })

    it('should reset elapsed when starting', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:10.000Z'))
        vi.advanceTimersByTime(10000)
      })

      act(() => {
        result.current.stop()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:15.000Z'))
        result.current.start()
      })

      expect(result.current.elapsed).toBe(0)
    })
  })

  describe('stop functionality', () => {
    it('should stop the stopwatch', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.start()
      })

      expect(result.current.isRunning).toBe(true)

      act(() => {
        result.current.stop()
      })

      expect(result.current.isRunning).toBe(false)
    })

    it('should preserve elapsed time when stopped', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:20.000Z'))
        vi.advanceTimersByTime(20000)
      })

      const elapsedBeforeStop = result.current.elapsed

      act(() => {
        result.current.stop()
      })

      expect(result.current.elapsed).toBe(elapsedBeforeStop)
    })
  })

  describe('reset functionality', () => {
    it('should reset all state', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:30.000Z'))
        vi.advanceTimersByTime(30000)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.elapsed).toBe(0)
      expect(result.current.isRunning).toBe(false)
      expect(result.current.formattedTime).toBe('0:00')
    })

    it('should stop running stopwatch on reset', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.start()
      })

      expect(result.current.isRunning).toBe(true)

      act(() => {
        result.current.reset()
      })

      expect(result.current.isRunning).toBe(false)
    })
  })

  describe('time formatting', () => {
    it('should format time over 1 minute correctly', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:01:30.000Z'))
        vi.advanceTimersByTime(90000)
      })

      expect(result.current.formattedTime).toBe('1:30')
    })

    it('should format large times correctly', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.start()
      })

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:59:59.000Z'))
        vi.advanceTimersByTime(3599000)
      })

      expect(result.current.formattedTime).toBe('59:59')
    })
  })
})
