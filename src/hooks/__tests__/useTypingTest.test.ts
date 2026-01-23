import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTypingTest, type TypingTestConfig, type TypingResult } from '../useTypingTest'

// Helper to create a mock input event
const createInputEvent = (value: string) => ({
  target: { value },
} as React.ChangeEvent<HTMLInputElement>)

// Helper to create a mock keyboard event
const createKeyDownEvent = (key: string, preventDefault = vi.fn()) => ({
  key,
  preventDefault,
} as unknown as React.KeyboardEvent<HTMLInputElement>)

describe('useTypingTest', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hello world' })
      )

      expect(result.current.state.typed).toBe('')
      expect(result.current.state.cursorPosition).toBe(0)
      expect(result.current.state.correctChars).toBe(0)
      expect(result.current.state.incorrectChars).toBe(0)
      expect(result.current.state.totalKeystrokes).toBe(0)
      expect(result.current.state.backspaceCount).toBe(0)
      expect(result.current.state.isStarted).toBe(false)
      expect(result.current.state.isFinished).toBe(false)
      expect(result.current.state.startTime).toBeNull()
      expect(result.current.state.endTime).toBeNull()
      expect(result.current.state.errors.size).toBe(0)
    })

    it('should return initial character states', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abc' })
      )

      expect(result.current.characterStates).toHaveLength(3)
      expect(result.current.characterStates[0]).toEqual({
        char: 'a',
        state: 'cursor',
        isCurrentLine: true,
      })
      expect(result.current.characterStates[1]).toEqual({
        char: 'b',
        state: 'pending',
        isCurrentLine: true,
      })
      expect(result.current.characterStates[2]).toEqual({
        char: 'c',
        state: 'pending',
        isCurrentLine: true,
      })
    })

    it('should return initial stats', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hello' })
      )

      expect(result.current.currentStats).toEqual({
        wpm: 0,
        accuracy: 100,
        elapsed: 0,
      })
    })

    it('should return initial progress as 0', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hello' })
      )

      expect(result.current.progress).toBe(0)
    })
  })

  describe('typing characters', () => {
    it('should track correct character input', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hello' })
      )

      act(() => {
        result.current.handleInput(createInputEvent('h'))
      })

      expect(result.current.state.typed).toBe('h')
      expect(result.current.state.cursorPosition).toBe(1)
      expect(result.current.state.correctChars).toBe(1)
      expect(result.current.state.incorrectChars).toBe(0)
      expect(result.current.state.isStarted).toBe(true)
    })

    it('should track incorrect character input', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hello' })
      )

      act(() => {
        result.current.handleInput(createInputEvent('x'))
      })

      expect(result.current.state.typed).toBe('x')
      expect(result.current.state.cursorPosition).toBe(1)
      expect(result.current.state.correctChars).toBe(0)
      expect(result.current.state.incorrectChars).toBe(1)
      expect(result.current.state.errors.size).toBe(1)
    })

    it('should track multiple characters correctly', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hello' })
      )

      act(() => {
        result.current.handleInput(createInputEvent('h'))
      })
      act(() => {
        result.current.handleInput(createInputEvent('he'))
      })
      act(() => {
        result.current.handleInput(createInputEvent('hel'))
      })

      expect(result.current.state.typed).toBe('hel')
      expect(result.current.state.cursorPosition).toBe(3)
      expect(result.current.state.correctChars).toBe(3)
      expect(result.current.state.incorrectChars).toBe(0)
    })

    it('should update character states after typing', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abc' })
      )

      act(() => {
        result.current.handleInput(createInputEvent('a'))
      })

      expect(result.current.characterStates[0].state).toBe('correct')
      expect(result.current.characterStates[1].state).toBe('cursor')
      expect(result.current.characterStates[2].state).toBe('pending')
    })

    it('should mark incorrect characters in character states', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abc' })
      )

      act(() => {
        result.current.handleInput(createInputEvent('x'))
      })

      expect(result.current.characterStates[0].state).toBe('incorrect')
      expect(result.current.characterStates[1].state).toBe('cursor')
    })

    it('should update progress as typing progresses', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hello' })
      )

      act(() => {
        result.current.handleInput(createInputEvent('hel'))
      })

      expect(result.current.progress).toBe(60) // 3/5 * 100
    })
  })

  describe('backspace handling', () => {
    it('should allow backspace by default', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hello' })
      )

      act(() => {
        result.current.handleInput(createInputEvent('hel'))
      })
      act(() => {
        result.current.handleInput(createInputEvent('he'))
      })

      expect(result.current.state.typed).toBe('he')
      expect(result.current.state.cursorPosition).toBe(2)
      expect(result.current.state.backspaceCount).toBe(1)
    })

    it('should prevent backspace when allowBackspace is false', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hello', allowBackspace: false })
      )

      act(() => {
        result.current.handleInput(createInputEvent('hel'))
      })

      const event = {
        target: { value: 'he' },
      } as React.ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleInput(event)
      })

      // Input should be restored (in real scenario, but we're testing the logic)
      expect(result.current.state.backspaceCount).toBe(0)
    })

    it('should count backspaces in totalKeystrokes', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hello' })
      )

      act(() => {
        result.current.handleInput(createInputEvent('hel'))
      })
      act(() => {
        result.current.handleInput(createInputEvent('he'))
      })

      expect(result.current.state.totalKeystrokes).toBe(4) // 3 chars + 1 backspace
    })
  })

  describe('strict mode', () => {
    it('should end test on first error in strict mode', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hello', strictMode: true })
      )

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.handleInput(createInputEvent('h'))
      })
      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:01.000Z'))
        result.current.handleInput(createInputEvent('hx'))
      })

      expect(result.current.state.isFinished).toBe(true)
      expect(result.current.state.incorrectChars).toBe(1)
    })

    it('should not end test on error in normal mode', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hello', strictMode: false })
      )

      act(() => {
        result.current.handleInput(createInputEvent('hx'))
      })

      expect(result.current.state.isFinished).toBe(false)
    })
  })

  describe('test completion', () => {
    it('should mark test as finished when all characters typed', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hi' })
      )

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.handleInput(createInputEvent('h'))
      })
      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:01.000Z'))
        result.current.handleInput(createInputEvent('hi'))
      })

      expect(result.current.state.isFinished).toBe(true)
      expect(result.current.state.endTime).not.toBeNull()
    })

    it('should call onComplete callback when test finishes', async () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hi', onComplete })
      )

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.handleInput(createInputEvent('h'))
      })
      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:01.000Z'))
        result.current.handleInput(createInputEvent('hi'))
      })

      // Wait for useEffect to run
      await vi.runAllTimersAsync()

      expect(onComplete).toHaveBeenCalled()
      const callArg = onComplete.mock.calls[0][0] as TypingResult
      expect(callArg.correctChars).toBe(2)
      expect(callArg.incorrectChars).toBe(0)
      expect(callArg.accuracy).toBe(100)
    })

    it('should calculate correct WPM on completion', async () => {
      const onComplete = vi.fn()
      const code = 'hello' // 5 chars = 1 word
      const { result } = renderHook(() =>
        useTypingTest({ code, onComplete })
      )

      // Type all characters in 30 seconds
      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.handleInput(createInputEvent('h'))
      })
      act(() => {
        result.current.handleInput(createInputEvent('he'))
      })
      act(() => {
        result.current.handleInput(createInputEvent('hel'))
      })
      act(() => {
        result.current.handleInput(createInputEvent('hell'))
      })
      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:30.000Z')) // 30 seconds later
        result.current.handleInput(createInputEvent('hello'))
      })

      await vi.runAllTimersAsync()

      expect(onComplete).toHaveBeenCalled()
      const callArg = onComplete.mock.calls[0][0] as TypingResult
      expect(callArg.duration).toBe(30)
      expect(callArg.rawWpm).toBe(2) // 5 chars / 5 / 0.5 min = 2 WPM
    })

    it('should calculate correct accuracy with errors', async () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() =>
        useTypingTest({ code: 'ab', onComplete })
      )

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.handleInput(createInputEvent('a'))
      })
      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:01.000Z'))
        result.current.handleInput(createInputEvent('ax')) // Wrong char but completes
      })

      await vi.runAllTimersAsync()

      expect(onComplete).toHaveBeenCalled()
      const callArg = onComplete.mock.calls[0][0] as TypingResult
      expect(callArg.correctChars).toBe(1)
      expect(callArg.incorrectChars).toBe(1)
      expect(callArg.accuracy).toBe(50)
    })
  })

  describe('Tab key handling', () => {
    it('should insert spaces for Tab key', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: '  hello', tabSize: 2 })
      )

      act(() => {
        const preventDefault = vi.fn()
        result.current.handleKeyDown(createKeyDownEvent('Tab', preventDefault))
      })

      expect(result.current.state.typed).toBe('  ')
      expect(result.current.state.cursorPosition).toBe(2)
    })

    it('should use custom tabSize', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: '    hello', tabSize: 4 })
      )

      act(() => {
        result.current.handleKeyDown(createKeyDownEvent('Tab'))
      })

      expect(result.current.state.typed).toBe('    ')
      expect(result.current.state.cursorPosition).toBe(4)
    })
  })

  describe('reset functionality', () => {
    it('should reset all state', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hello' })
      )

      // Type some characters
      act(() => {
        result.current.handleInput(createInputEvent('hel'))
      })

      expect(result.current.state.typed).toBe('hel')

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.state.typed).toBe('')
      expect(result.current.state.cursorPosition).toBe(0)
      expect(result.current.state.correctChars).toBe(0)
      expect(result.current.state.incorrectChars).toBe(0)
      expect(result.current.state.totalKeystrokes).toBe(0)
      expect(result.current.state.backspaceCount).toBe(0)
      expect(result.current.state.isStarted).toBe(false)
      expect(result.current.state.isFinished).toBe(false)
      expect(result.current.state.startTime).toBeNull()
      expect(result.current.state.endTime).toBeNull()
      expect(result.current.state.errors.size).toBe(0)
    })
  })

  describe('current line highlighting', () => {
    it('should identify current line characters', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'line1\nline2' })
      )

      // Initial state - first line is current
      expect(result.current.characterStates[0].isCurrentLine).toBe(true)
      expect(result.current.characterStates[5].isCurrentLine).toBe(true) // newline
      expect(result.current.characterStates[6].isCurrentLine).toBe(false)
    })

    it('should update current line after newline', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'ab\ncd' })
      )

      // Type first line and newline
      act(() => {
        result.current.handleInput(createInputEvent('ab\n'))
      })

      // Now second line should be current
      expect(result.current.characterStates[0].isCurrentLine).toBe(false)
      expect(result.current.characterStates[3].isCurrentLine).toBe(true)
    })
  })

  describe('extra characters handling', () => {
    it('should mark extra characters beyond code length', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'ab' })
      )

      // Type 'abc' at once (like a paste), exceeding code length by 1
      act(() => {
        result.current.handleInput(createInputEvent('abc'))
      })

      // Should have 3 character states: 'a' (correct), 'b' (correct), 'c' (extra)
      expect(result.current.characterStates).toHaveLength(3)
      expect(result.current.characterStates[0].state).toBe('correct')
      expect(result.current.characterStates[1].state).toBe('correct')
      expect(result.current.characterStates[2].state).toBe('extra')
      expect(result.current.characterStates[2].char).toBe('c')
    })
  })

  describe('ignoring input when finished', () => {
    it('should ignore keydown events when finished', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hi' })
      )

      // Complete the test
      act(() => {
        result.current.handleInput(createInputEvent('hi'))
      })

      expect(result.current.state.isFinished).toBe(true)

      // Try to type more
      act(() => {
        result.current.handleKeyDown(createKeyDownEvent('Tab'))
      })

      expect(result.current.state.typed).toBe('hi')
    })

    it('should ignore input events when finished', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hi' })
      )

      // Complete the test
      act(() => {
        result.current.handleInput(createInputEvent('hi'))
      })

      expect(result.current.state.isFinished).toBe(true)

      // Try to type more
      act(() => {
        result.current.handleInput(createInputEvent('hix'))
      })

      expect(result.current.state.typed).toBe('hi')
    })
  })

  describe('timer start behavior', () => {
    it('should start timer on first character typed', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'hello' })
      )

      expect(result.current.state.isStarted).toBe(false)
      expect(result.current.state.startTime).toBeNull()

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.handleInput(createInputEvent('h'))
      })

      expect(result.current.state.isStarted).toBe(true)
      expect(result.current.state.startTime).not.toBeNull()
    })

    it('should start timer on Tab keydown', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: '  hello', tabSize: 2 })
      )

      expect(result.current.state.isStarted).toBe(false)

      act(() => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
        result.current.handleKeyDown(createKeyDownEvent('Tab'))
      })

      expect(result.current.state.isStarted).toBe(true)
    })
  })

  describe('progress calculation', () => {
    it('should cap progress at 100%', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'ab' })
      )

      act(() => {
        result.current.handleInput(createInputEvent('abc'))
      })

      expect(result.current.progress).toBe(100)
    })

    it('should calculate progress correctly', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abcde' })
      )

      act(() => {
        result.current.handleInput(createInputEvent('ab'))
      })

      expect(result.current.progress).toBe(40) // 2/5 * 100
    })
  })
})
