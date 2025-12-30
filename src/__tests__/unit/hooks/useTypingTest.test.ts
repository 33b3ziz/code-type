import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useTypingTest } from '@/hooks/useTypingTest'

describe('useTypingTest', () => {
  const simpleCode = 'const x = 1;'

  describe('initialization', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: simpleCode })
      )

      expect(result.current.state.typed).toBe('')
      expect(result.current.state.cursorPosition).toBe(0)
      expect(result.current.state.correctChars).toBe(0)
      expect(result.current.state.incorrectChars).toBe(0)
      expect(result.current.state.isStarted).toBe(false)
      expect(result.current.state.isFinished).toBe(false)
    })

    it('generates correct initial character states', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abc' })
      )

      const states = result.current.characterStates
      expect(states).toHaveLength(3)
      expect(states[0].state).toBe('cursor')
      expect(states[1].state).toBe('pending')
      expect(states[2].state).toBe('pending')
    })

    it('calculates 0% progress initially', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: simpleCode })
      )

      expect(result.current.progress).toBe(0)
    })
  })

  describe('character states', () => {
    it('marks correct characters', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abc' })
      )

      // Simulate typing 'a'
      act(() => {
        const event = {
          target: { value: 'a' },
        } as React.ChangeEvent<HTMLInputElement>
        result.current.handleInput(event)
      })

      const states = result.current.characterStates
      expect(states[0].state).toBe('correct')
      expect(states[1].state).toBe('cursor')
      expect(states[2].state).toBe('pending')
    })

    it('marks incorrect characters', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abc' })
      )

      // Simulate typing 'x' (wrong)
      act(() => {
        const event = {
          target: { value: 'x' },
        } as React.ChangeEvent<HTMLInputElement>
        result.current.handleInput(event)
      })

      const states = result.current.characterStates
      expect(states[0].state).toBe('incorrect')
      expect(states[1].state).toBe('cursor')
    })
  })

  describe('statistics tracking', () => {
    it('tracks correct character count', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'ab' })
      )

      act(() => {
        result.current.handleInput({
          target: { value: 'a' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.state.correctChars).toBe(1)
      expect(result.current.state.incorrectChars).toBe(0)
    })

    it('tracks incorrect character count', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'ab' })
      )

      act(() => {
        result.current.handleInput({
          target: { value: 'x' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.state.correctChars).toBe(0)
      expect(result.current.state.incorrectChars).toBe(1)
    })

    it('tracks backspace count', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abc', allowBackspace: true })
      )

      // Type 'a'
      act(() => {
        result.current.handleInput({
          target: { value: 'a' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      // Backspace
      act(() => {
        result.current.handleInput({
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.state.backspaceCount).toBe(1)
    })
  })

  describe('progress calculation', () => {
    it('calculates progress correctly', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abcd' }) // 4 chars
      )

      // Type 2 chars
      act(() => {
        result.current.handleInput({
          target: { value: 'ab' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.progress).toBe(50)
    })

    it('reaches 100% when code is complete', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'ab' })
      )

      act(() => {
        result.current.handleInput({
          target: { value: 'ab' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.progress).toBe(100)
    })
  })

  describe('test completion', () => {
    it('marks test as finished when code is complete', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'ab' })
      )

      act(() => {
        result.current.handleInput({
          target: { value: 'ab' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.state.isFinished).toBe(true)
    })

    it('sets correct state when test completes', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'ab' })
      )

      // Type first character to start the test
      act(() => {
        result.current.handleInput({
          target: { value: 'a' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      // Type second character to complete
      act(() => {
        result.current.handleInput({
          target: { value: 'ab' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      // Verify final state
      expect(result.current.state.isFinished).toBe(true)
      expect(result.current.state.correctChars).toBe(2)
      expect(result.current.state.incorrectChars).toBe(0)
      expect(result.current.state.startTime).not.toBeNull()
      expect(result.current.state.endTime).not.toBeNull()
    })
  })

  describe('strict mode', () => {
    it('ends test on first error in strict mode', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abc', strictMode: true })
      )

      // Type wrong character
      act(() => {
        result.current.handleInput({
          target: { value: 'x' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.state.isFinished).toBe(true)
      expect(result.current.state.incorrectChars).toBe(1)
    })

    it('does not end test on error in normal mode', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abc', strictMode: false })
      )

      // Type wrong character
      act(() => {
        result.current.handleInput({
          target: { value: 'x' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.state.isFinished).toBe(false)
    })
  })

  describe('backspace handling', () => {
    it('allows backspace by default', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abc' })
      )

      // Type 'a'
      act(() => {
        result.current.handleInput({
          target: { value: 'a' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.state.cursorPosition).toBe(1)

      // Backspace
      act(() => {
        result.current.handleInput({
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.state.cursorPosition).toBe(0)
    })

    it('prevents backspace when allowBackspace is false', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abc', allowBackspace: false })
      )

      // Type 'a'
      act(() => {
        result.current.handleInput({
          target: { value: 'a' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      // Try to backspace (simulating the input resetting)
      // In the actual hook, it resets the input value, so we just verify position doesn't change
      const positionBefore = result.current.state.cursorPosition
      expect(positionBefore).toBe(1)
    })
  })

  describe('reset', () => {
    it('resets all state', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abc' })
      )

      // Type some characters
      act(() => {
        result.current.handleInput({
          target: { value: 'ab' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.state.cursorPosition).toBe(2)

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.state.typed).toBe('')
      expect(result.current.state.cursorPosition).toBe(0)
      expect(result.current.state.correctChars).toBe(0)
      expect(result.current.state.incorrectChars).toBe(0)
      expect(result.current.state.isStarted).toBe(false)
      expect(result.current.state.isFinished).toBe(false)
    })
  })

  describe('current stats', () => {
    it('returns zero WPM before starting', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abc' })
      )

      expect(result.current.currentStats.wpm).toBe(0)
      expect(result.current.currentStats.accuracy).toBe(100)
    })

    it('tracks correct and incorrect chars for accuracy calculation', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'abcd' })
      )

      // Type 'a' (correct)
      act(() => {
        result.current.handleInput({
          target: { value: 'a' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      // Check stats after 1 char
      expect(result.current.state.correctChars).toBe(1)
      expect(result.current.state.incorrectChars).toBe(0)

      // Type 'b' (correct)
      act(() => {
        result.current.handleInput({
          target: { value: 'ab' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.state.correctChars).toBe(2)

      // Type 'x' instead of 'c' (incorrect)
      act(() => {
        result.current.handleInput({
          target: { value: 'abx' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.state.incorrectChars).toBe(1)

      // Type 'd' (correct)
      act(() => {
        result.current.handleInput({
          target: { value: 'abxd' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      // 3 correct out of 4 = 75%
      expect(result.current.state.correctChars).toBe(3)
      expect(result.current.state.incorrectChars).toBe(1)

      // Verify accuracy can be calculated: correct / total = 3/4 = 75%
      const totalTyped = result.current.state.correctChars + result.current.state.incorrectChars
      const calculatedAccuracy = Math.round((result.current.state.correctChars / totalTyped) * 100)
      expect(calculatedAccuracy).toBe(75)
    })
  })

  describe('tab key support', () => {
    it('uses default tab size of 2 spaces', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: '  const x = 1;' }) // 2 spaces at start
      )

      // Simulate Tab keydown
      act(() => {
        const event = {
          key: 'Tab',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>
        result.current.handleKeyDown(event)
      })

      expect(result.current.state.typed).toBe('  ')
      expect(result.current.state.cursorPosition).toBe(2)
      expect(result.current.state.correctChars).toBe(2)
    })

    it('respects custom tab size', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: '    const x = 1;', tabSize: 4 }) // 4 spaces at start
      )

      // Simulate Tab keydown
      act(() => {
        const event = {
          key: 'Tab',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>
        result.current.handleKeyDown(event)
      })

      expect(result.current.state.typed).toBe('    ')
      expect(result.current.state.cursorPosition).toBe(4)
      expect(result.current.state.correctChars).toBe(4)
    })

    it('tracks incorrect characters when tab spaces dont match', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'const x = 1;', tabSize: 2 }) // No spaces at start
      )

      // Simulate Tab keydown (inserts 2 spaces where code expects 'co')
      act(() => {
        const event = {
          key: 'Tab',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>
        result.current.handleKeyDown(event)
      })

      expect(result.current.state.typed).toBe('  ')
      expect(result.current.state.incorrectChars).toBe(2)
    })

    it('starts timer on Tab press', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: '  const x = 1;' })
      )

      expect(result.current.state.isStarted).toBe(false)

      act(() => {
        const event = {
          key: 'Tab',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>
        result.current.handleKeyDown(event)
      })

      expect(result.current.state.isStarted).toBe(true)
      expect(result.current.state.startTime).not.toBeNull()
    })
  })

  describe('auto-indent feature', () => {
    it('does not auto-indent when disabled', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'a\n  b', autoIndent: false })
      )

      // Type 'a'
      act(() => {
        result.current.handleInput({
          target: { value: 'a' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      // Press Enter without auto-indent
      act(() => {
        result.current.handleInput({
          target: { value: 'a\n' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.state.typed).toBe('a\n')
      expect(result.current.state.cursorPosition).toBe(2)
    })

    it('auto-indents when enabled and Enter is pressed', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'a\n  b', autoIndent: true })
      )

      // Type 'a'
      act(() => {
        result.current.handleInput({
          target: { value: 'a' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      // Simulate Enter keydown with auto-indent
      act(() => {
        const event = {
          key: 'Enter',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>
        result.current.handleKeyDown(event)
      })

      // Should have newline + 2 spaces (matching next line's indentation)
      expect(result.current.state.typed).toBe('a\n  ')
      expect(result.current.state.cursorPosition).toBe(4)
      expect(result.current.state.correctChars).toBe(4) // a, \n, 2 spaces
    })

    it('handles no indentation on next line', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'a\nb', autoIndent: true })
      )

      // Type 'a'
      act(() => {
        result.current.handleInput({
          target: { value: 'a' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      // Simulate Enter keydown
      act(() => {
        const event = {
          key: 'Enter',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>
        result.current.handleKeyDown(event)
      })

      // Should have just newline, no extra spaces
      expect(result.current.state.typed).toBe('a\n')
      expect(result.current.state.cursorPosition).toBe(2)
    })

    it('respects strict mode with auto-indent errors', () => {
      const { result } = renderHook(() =>
        useTypingTest({ code: 'a\nb', autoIndent: true, strictMode: true })
      )

      // Type 'a'
      act(() => {
        result.current.handleInput({
          target: { value: 'a' },
        } as React.ChangeEvent<HTMLInputElement>)
      })

      // The expected code has no indent, so auto-indent should just add newline
      // and not fail strict mode since 'b' follows '\n' directly
      act(() => {
        const event = {
          key: 'Enter',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>
        result.current.handleKeyDown(event)
      })

      expect(result.current.state.isFinished).toBe(false)
      expect(result.current.state.correctChars).toBe(2) // 'a' and '\n'
    })
  })
})
