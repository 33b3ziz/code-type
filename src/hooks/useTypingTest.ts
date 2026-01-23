import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeystrokeEvent } from '@/db/schema'

export interface TypingState {
  // Input tracking
  typed: string
  cursorPosition: number

  // Character-by-character tracking (stores the correctness of each typed character)
  charResults: Array<'correct' | 'incorrect'>

  // Statistics
  correctChars: number
  incorrectChars: number
  totalKeystrokes: number
  backspaceCount: number

  // Status
  isStarted: boolean
  isFinished: boolean
  startTime: number | null
  endTime: number | null

  // Error tracking
  errors: Map<number, string> // position -> expected char

  // Keystroke events for replay feature
  keystrokeEvents: KeystrokeEvent[]
}

export interface TypingTestConfig {
  code: string
  onComplete?: (result: TypingResult) => void
  strictMode?: boolean
  allowBackspace?: boolean
  tabSize?: number // Number of spaces for Tab key (default: 2)
  autoIndent?: boolean // Auto-insert indentation on Enter
}

export interface TypingResult {
  wpm: number
  rawWpm: number
  accuracy: number
  correctChars: number
  incorrectChars: number
  totalChars: number
  backspaceCount: number
  duration: number // in seconds
  usedBackspace: boolean
  keystrokeEvents: KeystrokeEvent[] // For replay feature
  strictModeFailed: boolean // True if test ended due to strict mode error
}

export interface CharacterState {
  char: string
  state: 'pending' | 'correct' | 'incorrect' | 'cursor' | 'extra'
  isCurrentLine: boolean
}

const WORDS_PER_CHAR = 5 // Standard: 5 chars = 1 word

export function useTypingTest(config: TypingTestConfig) {
  const {
    code,
    onComplete,
    strictMode = false,
    allowBackspace = true,
    tabSize = 2,
    autoIndent = false,
  } = config

  const [state, setState] = useState<TypingState>({
    typed: '',
    cursorPosition: 0,
    charResults: [],
    correctChars: 0,
    incorrectChars: 0,
    totalKeystrokes: 0,
    backspaceCount: 0,
    isStarted: false,
    isFinished: false,
    startTime: null,
    endTime: null,
    errors: new Map(),
    keystrokeEvents: [],
  })

  // Track if onComplete has been called to prevent duplicate calls
  const hasCompletedRef = useRef(false)

  // Track the current time for real-time WPM updates
  const [currentTime, setCurrentTime] = useState<number>(Date.now())

  const inputRef = useRef<HTMLInputElement>(null)

  // Real-time timer update for live WPM calculation
  useEffect(() => {
    if (!state.isStarted || state.isFinished) return

    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 100) // Update every 100ms for smooth WPM display

    return () => clearInterval(interval)
  }, [state.isStarted, state.isFinished])

  // Calculate character states for rendering (memoized for performance)
  const characterStates = useMemo((): Array<CharacterState> => {
    const chars: Array<CharacterState> = []
    const codeChars = code.split('')

    // Find current line for highlighting
    let currentLineStart = 0
    let currentLineEnd = code.length

    // Calculate cursor position clamped to code length for line detection
    const effectiveCursorPos = Math.min(state.cursorPosition, code.length)

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

    for (let i = 0; i < codeChars.length; i++) {
      const isCurrentLine = i >= currentLineStart && i <= currentLineEnd

      if (i < state.cursorPosition) {
        // Already typed - use charResults for accurate state
        const charResult = state.charResults[i]
        chars.push({
          char: codeChars[i],
          state: charResult === 'correct' ? 'correct' : 'incorrect',
          isCurrentLine,
        })
      } else if (i === state.cursorPosition) {
        // Cursor position
        chars.push({
          char: codeChars[i],
          state: 'cursor',
          isCurrentLine,
        })
      } else {
        // Not yet typed
        chars.push({
          char: codeChars[i],
          state: 'pending',
          isCurrentLine,
        })
      }
    }

    // Handle extra characters typed beyond code length
    if (state.typed.length > code.length) {
      for (let i = code.length; i < state.typed.length; i++) {
        chars.push({
          char: state.typed[i],
          state: 'extra',
          isCurrentLine: true,
        })
      }
    }

    return chars
  }, [code, state.typed, state.cursorPosition, state.charResults])

  // Get current line's indentation from code
  const getCurrentIndentation = useCallback(
    (position: number): string => {
      // Find the start of the current line
      let lineStart = position
      while (lineStart > 0 && code[lineStart - 1] !== '\n') {
        lineStart--
      }

      // Extract leading whitespace
      let indent = ''
      for (let i = lineStart; i < code.length && (code[i] === ' ' || code[i] === '\t'); i++) {
        indent += code[i]
      }
      return indent
    },
    [code]
  )

  // Insert characters at current position (for Tab/Enter handling)
  const insertCharacters = useCallback(
    (chars: string) => {
      setState((prev) => {
        if (prev.isFinished) return prev

        const newState = { ...prev }
        // Clone charResults array for immutability
        newState.charResults = [...prev.charResults]

        // Start timer if not started
        if (!prev.isStarted) {
          newState.isStarted = true
          newState.startTime = Date.now()
        }

        // Process each character
        for (const char of chars) {
          const expectedChar = code[newState.cursorPosition]
          const isCorrect = char === expectedChar

          newState.typed += char
          newState.charResults.push(isCorrect ? 'correct' : 'incorrect')
          newState.cursorPosition = newState.typed.length
          newState.totalKeystrokes++

          if (isCorrect) {
            newState.correctChars++
          } else {
            newState.incorrectChars++
            newState.errors = new Map(newState.errors)
            newState.errors.set(newState.cursorPosition - 1, expectedChar || '')

            if (strictMode) {
              newState.isFinished = true
              newState.endTime = Date.now()
              break
            }
          }
        }

        // Check if test is complete (only when reaching or exceeding code length)
        if (newState.cursorPosition >= code.length && !newState.isFinished) {
          newState.isFinished = true
          newState.endTime = Date.now()
        }

        return newState
      })
    },
    [code, strictMode]
  )

  // Handle key press
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (state.isFinished) return

      // Handle Tab key - insert spaces
      if (e.key === 'Tab') {
        e.preventDefault()
        const spaces = ' '.repeat(tabSize)
        insertCharacters(spaces)
        // Update the input value to match
        if (inputRef.current) {
          inputRef.current.value = state.typed + spaces
        }
        return
      }

      // Handle Enter key with auto-indent
      if (e.key === 'Enter' && autoIndent) {
        e.preventDefault()
        // Insert newline
        insertCharacters('\n')

        // Get indentation for the next line from the expected code
        const nextPosition = state.cursorPosition + 1
        if (nextPosition < code.length) {
          const indent = getCurrentIndentation(nextPosition)
          if (indent) {
            insertCharacters(indent)
          }
        }

        // Update input value
        if (inputRef.current) {
          inputRef.current.value = state.typed
        }
        return
      }

      // Start timer on first keypress
      if (!state.isStarted && e.key.length === 1) {
        setState((prev) => ({
          ...prev,
          isStarted: true,
          startTime: Date.now(),
        }))
      }
    },
    [state.isStarted, state.isFinished, state.typed, state.cursorPosition, tabSize, autoIndent, code, insertCharacters, getCurrentIndentation]
  )

  // Handle input change
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value

      setState((prev) => {
        // Check if test is finished inside setState to avoid stale closures
        if (prev.isFinished) return prev

        const oldValue = prev.typed

        // Detect if backspace was used
        const isBackspace = newValue.length < oldValue.length

        if (isBackspace && !allowBackspace) {
          // Reset input to previous value if backspace not allowed
          e.target.value = oldValue
          return prev
        }

        const newState = { ...prev }
        // Clone charResults array for immutability
        newState.charResults = [...prev.charResults]

        // Start timer on first character typed
        if (!prev.isStarted && newValue.length > oldValue.length) {
          newState.isStarted = true
          newState.startTime = Date.now()
        }

        if (isBackspace) {
          // Backspace pressed - need to recalculate correctChars/incorrectChars
          const charsRemoved = oldValue.length - newValue.length
          newState.backspaceCount = prev.backspaceCount + charsRemoved
          newState.typed = newValue
          newState.cursorPosition = newValue.length
          newState.totalKeystrokes = prev.totalKeystrokes + charsRemoved

          // Remove the charResults for the deleted characters and recalculate stats
          newState.charResults.splice(newValue.length, charsRemoved)

          // Recalculate correct/incorrect counts from the remaining charResults
          let correctCount = 0
          let incorrectCount = 0
          for (const result of newState.charResults) {
            if (result === 'correct') {
              correctCount++
            } else {
              incorrectCount++
            }
          }
          newState.correctChars = correctCount
          newState.incorrectChars = incorrectCount

          // Record backspace keystroke events for replay
          newState.keystrokeEvents = [...prev.keystrokeEvents]
          const now = Date.now()
          const startTime = newState.startTime || now
          const elapsedMs = now - startTime
          const elapsedMinutes = elapsedMs / 60000
          const wpmAtPoint = elapsedMinutes > 0 ? Math.round(newState.correctChars / WORDS_PER_CHAR / elapsedMinutes) : 0
          const totalTyped = newState.correctChars + newState.incorrectChars
          const accuracyAtPoint = totalTyped > 0 ? Math.round((newState.correctChars / totalTyped) * 100) : 100

          for (let i = 0; i < charsRemoved; i++) {
            const deletedPosition = oldValue.length - 1 - i
            newState.keystrokeEvents.push({
              timestamp: elapsedMs,
              char: '',
              expected: code[deletedPosition] || '',
              isCorrect: false, // backspace is neither correct nor incorrect
              type: 'backspace',
              position: deletedPosition,
              wpmAtPoint,
              accuracyAtPoint,
              correctChars: newState.correctChars,
              incorrectChars: newState.incorrectChars,
            })
          }
        } else {
          // Characters typed - process all new characters (handles both single chars and paste)
          const charsAdded = newValue.length - oldValue.length
          newState.typed = newValue
          newState.cursorPosition = newValue.length
          newState.totalKeystrokes = prev.totalKeystrokes + charsAdded
          newState.correctChars = prev.correctChars
          newState.incorrectChars = prev.incorrectChars
          newState.errors = new Map(prev.errors)
          newState.keystrokeEvents = [...prev.keystrokeEvents]

          // Process each new character
          let cursorPos = oldValue.length
          const now = Date.now()
          const startTime = newState.startTime || now

          for (let i = 0; i < charsAdded; i++) {
            const newChar = newValue[oldValue.length + i]
            const expectedChar = code[cursorPos]
            const isCorrect = newChar === expectedChar

            newState.charResults.push(isCorrect ? 'correct' : 'incorrect')

            if (isCorrect) {
              newState.correctChars++
            } else {
              newState.incorrectChars++
              newState.errors.set(cursorPos, expectedChar)
            }

            // Record keystroke event for replay
            const elapsedMs = now - startTime
            const elapsedMinutes = elapsedMs / 60000
            const wpmAtPoint = elapsedMinutes > 0 ? Math.round(newState.correctChars / WORDS_PER_CHAR / elapsedMinutes) : 0
            const totalTyped = newState.correctChars + newState.incorrectChars
            const accuracyAtPoint = totalTyped > 0 ? Math.round((newState.correctChars / totalTyped) * 100) : 100

            newState.keystrokeEvents.push({
              timestamp: elapsedMs,
              char: newChar,
              expected: expectedChar || '',
              isCorrect,
              type: 'char',
              position: cursorPos,
              wpmAtPoint,
              accuracyAtPoint,
              correctChars: newState.correctChars,
              incorrectChars: newState.incorrectChars,
            })

            // In strict mode, end test on error (after recording the keystroke)
            if (!isCorrect && strictMode) {
              newState.isFinished = true
              newState.endTime = Date.now()
              break // Stop processing more characters
            }

            cursorPos++
          }
        }

        // Check if test is complete (only when reaching code length and not already finished)
        if (newState.cursorPosition >= code.length && !newState.isFinished) {
          newState.isFinished = true
          newState.endTime = Date.now()
        }

        return newState
      })
    },
    [code, allowBackspace, strictMode]
  )

  // Calculate results when finished
  useEffect(() => {
    // Prevent duplicate onComplete calls
    if (state.isFinished && state.startTime && state.endTime && onComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true

      const duration = (state.endTime - state.startTime) / 1000 // seconds
      const minutes = duration / 60

      // Raw WPM: all typed characters / 5 / minutes
      const rawWpm = minutes > 0 ? Math.round(state.typed.length / WORDS_PER_CHAR / minutes) : 0

      // Net WPM: (correct chars - errors) / 5 / minutes
      // Using correct chars only for net WPM (more standard approach)
      const netWpm = minutes > 0
        ? Math.max(0, Math.round(state.correctChars / WORDS_PER_CHAR / minutes))
        : 0

      // Accuracy: correct / total typed
      const totalTyped = state.correctChars + state.incorrectChars
      const accuracy =
        totalTyped > 0
          ? Math.round((state.correctChars / totalTyped) * 100)
          : 100

      // Test failed due to strict mode if finished before reaching end with errors
      const didFailDueToStrictMode = strictMode && state.incorrectChars > 0 && state.cursorPosition < code.length

      const result: TypingResult = {
        wpm: netWpm,
        rawWpm,
        accuracy,
        correctChars: state.correctChars,
        incorrectChars: state.incorrectChars,
        totalChars: code.length,
        backspaceCount: state.backspaceCount,
        duration,
        usedBackspace: state.backspaceCount > 0,
        keystrokeEvents: state.keystrokeEvents,
        strictModeFailed: didFailDueToStrictMode,
      }

      onComplete(result)
    }
  }, [state.isFinished, state.startTime, state.endTime, onComplete, code.length, state.correctChars, state.incorrectChars, state.backspaceCount, state.typed.length, state.keystrokeEvents, strictMode, state.cursorPosition])

  // Reset the test
  const reset = useCallback(() => {
    hasCompletedRef.current = false
    setCurrentTime(Date.now())
    setState({
      typed: '',
      cursorPosition: 0,
      charResults: [],
      correctChars: 0,
      incorrectChars: 0,
      totalKeystrokes: 0,
      backspaceCount: 0,
      isStarted: false,
      isFinished: false,
      startTime: null,
      endTime: null,
      errors: new Map(),
      keystrokeEvents: [],
    })
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.focus()
    }
  }, [])

  // Focus the input
  const focus = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  // Calculate current stats (using currentTime for real-time updates)
  const currentStats = useMemo(() => {
    if (!state.isStarted || !state.startTime) {
      return { wpm: 0, accuracy: 100, elapsed: 0 }
    }

    // Use currentTime for live updates, or endTime if test is finished
    const now = state.isFinished && state.endTime ? state.endTime : currentTime
    const elapsed = Math.max(0, (now - state.startTime) / 1000)
    const minutes = elapsed / 60

    // Calculate WPM based on correct characters typed (net WPM)
    const wpm = minutes > 0
      ? Math.round(state.correctChars / WORDS_PER_CHAR / minutes)
      : 0

    const totalTyped = state.correctChars + state.incorrectChars
    const accuracy =
      totalTyped > 0
        ? Math.round((state.correctChars / totalTyped) * 100)
        : 100

    return { wpm, accuracy, elapsed }
  }, [state.isStarted, state.startTime, state.isFinished, state.endTime, currentTime, state.correctChars, state.incorrectChars])

  // Memoize progress calculation
  const progress = useMemo(
    () => Math.min(100, (state.cursorPosition / code.length) * 100),
    [state.cursorPosition, code.length]
  )

  // Calculate if test failed due to strict mode (for visual feedback)
  const strictModeFailed = useMemo(() => {
    return strictMode && state.isFinished && state.incorrectChars > 0 && state.cursorPosition < code.length
  }, [strictMode, state.isFinished, state.incorrectChars, state.cursorPosition, code.length])

  return {
    // State
    state,
    characterStates,
    currentStats,

    // Refs
    inputRef,

    // Handlers
    handleKeyDown,
    handleInput,

    // Actions
    reset,
    focus,

    // Progress
    progress,

    // Strict mode
    strictModeFailed,
  }
}
