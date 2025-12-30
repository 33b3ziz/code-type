import { useState, useCallback, useRef, useEffect } from 'react'

export interface TypingState {
  // Input tracking
  typed: string
  cursorPosition: number

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
    correctChars: 0,
    incorrectChars: 0,
    totalKeystrokes: 0,
    backspaceCount: 0,
    isStarted: false,
    isFinished: false,
    startTime: null,
    endTime: null,
    errors: new Map(),
  })

  const inputRef = useRef<HTMLInputElement>(null)

  // Calculate character states for rendering
  const getCharacterStates = useCallback((): CharacterState[] => {
    const chars: CharacterState[] = []
    const codeChars = code.split('')
    const typedChars = state.typed.split('')

    // Find current line for highlighting
    let currentLineStart = 0
    let currentLineEnd = code.length
    for (let i = 0; i < state.cursorPosition && i < code.length; i++) {
      if (code[i] === '\n') {
        currentLineStart = i + 1
      }
    }
    for (let i = state.cursorPosition; i < code.length; i++) {
      if (code[i] === '\n') {
        currentLineEnd = i
        break
      }
    }

    for (let i = 0; i < codeChars.length; i++) {
      const isCurrentLine = i >= currentLineStart && i <= currentLineEnd

      if (i < state.cursorPosition) {
        // Already typed
        const isCorrect = typedChars[i] === codeChars[i]
        chars.push({
          char: codeChars[i],
          state: isCorrect ? 'correct' : 'incorrect',
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
  }, [code, state.typed, state.cursorPosition])

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

        // Start timer if not started
        if (!prev.isStarted) {
          newState.isStarted = true
          newState.startTime = Date.now()
        }

        // Process each character
        for (const char of chars) {
          const expectedChar = code[newState.cursorPosition]

          newState.typed += char
          newState.cursorPosition = newState.typed.length
          newState.totalKeystrokes++

          if (char === expectedChar) {
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

        // Check if test is complete
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
      if (state.isFinished) return

      const newValue = e.target.value
      const oldValue = state.typed

      // Detect if backspace was used
      const isBackspace = newValue.length < oldValue.length

      if (isBackspace && !allowBackspace) {
        // Reset input to previous value if backspace not allowed
        e.target.value = oldValue
        return
      }

      setState((prev) => {
        const newState = { ...prev }

        // Start timer on first character typed
        if (!prev.isStarted && newValue.length > oldValue.length) {
          newState.isStarted = true
          newState.startTime = Date.now()
        }

        if (isBackspace) {
          // Backspace pressed
          newState.backspaceCount = prev.backspaceCount + 1
          newState.typed = newValue
          newState.cursorPosition = newValue.length
          newState.totalKeystrokes = prev.totalKeystrokes + 1
        } else {
          // Character typed
          const newChar = newValue[newValue.length - 1]
          const expectedChar = code[prev.cursorPosition]

          newState.typed = newValue
          newState.cursorPosition = newValue.length
          newState.totalKeystrokes = prev.totalKeystrokes + 1

          if (newChar === expectedChar) {
            newState.correctChars = prev.correctChars + 1
          } else {
            newState.incorrectChars = prev.incorrectChars + 1
            newState.errors = new Map(prev.errors)
            newState.errors.set(prev.cursorPosition, expectedChar)

            // In strict mode, end test on error
            if (strictMode) {
              newState.isFinished = true
              newState.endTime = Date.now()
            }
          }
        }

        // Check if test is complete
        if (newState.cursorPosition >= code.length && !newState.isFinished) {
          newState.isFinished = true
          newState.endTime = Date.now()
        }

        return newState
      })
    },
    [code, state.typed, state.isFinished, allowBackspace, strictMode]
  )

  // Calculate results when finished
  useEffect(() => {
    if (state.isFinished && state.startTime && state.endTime && onComplete) {
      const duration = (state.endTime - state.startTime) / 1000 // seconds
      const minutes = duration / 60

      // Raw WPM: all typed characters / 5 / minutes
      const rawWpm = Math.round(state.typed.length / WORDS_PER_CHAR / minutes)

      // Net WPM: (correct chars - errors) / 5 / minutes
      const netWpm = Math.max(
        0,
        Math.round(
          (state.correctChars - state.incorrectChars) / WORDS_PER_CHAR / minutes
        )
      )

      // Accuracy: correct / total typed
      const totalTyped = state.correctChars + state.incorrectChars
      const accuracy =
        totalTyped > 0
          ? Math.round((state.correctChars / totalTyped) * 100)
          : 100

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
      }

      onComplete(result)
    }
  }, [state.isFinished, state.startTime, state.endTime, onComplete, code.length, state.correctChars, state.incorrectChars, state.backspaceCount, state.typed.length])

  // Reset the test
  const reset = useCallback(() => {
    setState({
      typed: '',
      cursorPosition: 0,
      correctChars: 0,
      incorrectChars: 0,
      totalKeystrokes: 0,
      backspaceCount: 0,
      isStarted: false,
      isFinished: false,
      startTime: null,
      endTime: null,
      errors: new Map(),
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

  // Calculate current stats
  const getCurrentStats = useCallback(() => {
    if (!state.isStarted || !state.startTime) {
      return { wpm: 0, accuracy: 100, elapsed: 0 }
    }

    const elapsed = (Date.now() - state.startTime) / 1000
    const minutes = elapsed / 60

    const rawWpm =
      minutes > 0
        ? Math.round(state.typed.length / WORDS_PER_CHAR / minutes)
        : 0

    const totalTyped = state.correctChars + state.incorrectChars
    const accuracy =
      totalTyped > 0
        ? Math.round((state.correctChars / totalTyped) * 100)
        : 100

    return { wpm: rawWpm, accuracy, elapsed }
  }, [state.isStarted, state.startTime, state.typed.length, state.correctChars, state.incorrectChars])

  return {
    // State
    state,
    characterStates: getCharacterStates(),
    currentStats: getCurrentStats(),

    // Refs
    inputRef,

    // Handlers
    handleKeyDown,
    handleInput,

    // Actions
    reset,
    focus,

    // Progress
    progress: Math.min(100, (state.cursorPosition / code.length) * 100),
  }
}
