/**
 * Warm-Up Routine Component
 * A quick warm-up sequence with progressively challenging patterns
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export interface WarmUpRoutineProps {
  duration: number
  onComplete: (result: WarmUpResult) => void
  onCancel?: () => void
  className?: string
}

export interface WarmUpResult {
  accuracy: number
  wpm: number
  totalCharacters: number
  correctCharacters: number
  duration: number
  patternsCompleted: number
}

// Extended warm-up patterns organized by difficulty
const ROUTINE_STAGES = [
  {
    name: 'Home Row',
    patterns: ['asdf jkl; asdf jkl;', 'fjfj dkdk slsl a;a;', 'asdfjkl; asdfjkl;'],
  },
  {
    name: 'Common Words',
    patterns: ['the quick brown fox', 'jumps over the lazy dog', 'hello world'],
  },
  {
    name: 'Numbers',
    patterns: ['1234567890', '12 34 56 78 90', '111 222 333 444 555'],
  },
  {
    name: 'Mixed',
    patterns: ['const x = 42;', 'function() { }', 'if (true) return;'],
  },
]

export function WarmUpRoutine({
  duration,
  onComplete,
  onCancel,
  className = '',
}: WarmUpRoutineProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [currentPattern, setCurrentPattern] = useState(0)
  const [content, setContent] = useState('')
  const [typed, setTyped] = useState('')
  const [isStarted, setIsStarted] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(duration)
  const [correctChars, setCorrectChars] = useState(0)
  const [incorrectChars, setIncorrectChars] = useState(0)
  const [patternsCompleted, setPatternsCompleted] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | null>(null)

  // Initialize content
  useEffect(() => {
    if (ROUTINE_STAGES[currentStage]) {
      setContent(ROUTINE_STAGES[currentStage].patterns[currentPattern])
    }
  }, [currentStage, currentPattern])

  // Timer
  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      timerRef.current = window.setTimeout(() => {
        setTimeLeft((t) => t - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleComplete()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isStarted, timeLeft])

  // Handle completion
  const handleComplete = useCallback(() => {
    if (!startTime) return

    const endTime = Date.now()
    const actualDuration = (endTime - startTime) / 1000
    const totalChars = correctChars + incorrectChars
    const wpm = totalChars > 0 ? Math.round((correctChars / 5) / (actualDuration / 60)) : 0
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100

    onComplete({
      accuracy,
      wpm,
      totalCharacters: totalChars,
      correctCharacters: correctChars,
      duration: Math.round(actualDuration),
      patternsCompleted,
    })
  }, [startTime, correctChars, incorrectChars, patternsCompleted, onComplete])

  // Move to next pattern
  const nextPattern = useCallback(() => {
    setPatternsCompleted((p) => p + 1)
    setTyped('')

    const stage = ROUTINE_STAGES[currentStage]
    if (currentPattern < stage.patterns.length - 1) {
      // Next pattern in current stage
      setCurrentPattern((p) => p + 1)
    } else if (currentStage < ROUTINE_STAGES.length - 1) {
      // Next stage
      setCurrentStage((s) => s + 1)
      setCurrentPattern(0)
    } else {
      // All stages complete, repeat from beginning
      setCurrentStage(0)
      setCurrentPattern(0)
    }
  }, [currentStage, currentPattern])

  // Handle input
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStarted) {
      setIsStarted(true)
      setStartTime(Date.now())
    }

    const newTyped = e.target.value
    const lastChar = newTyped.slice(-1)
    const expectedChar = content[typed.length]

    if (newTyped.length > typed.length) {
      if (lastChar === expectedChar) {
        setCorrectChars((c) => c + 1)
      } else {
        setIncorrectChars((c) => c + 1)
      }
    }

    setTyped(newTyped)

    // Check if pattern is complete
    if (newTyped.length >= content.length) {
      nextPattern()
    }
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  // Current stats
  const currentStats = useMemo(() => {
    if (!isStarted || !startTime) return { wpm: 0, accuracy: 100 }

    const elapsed = (Date.now() - startTime) / 1000
    const totalChars = correctChars + incorrectChars
    const wpm = totalChars > 0 ? Math.round((correctChars / 5) / (elapsed / 60)) : 0
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100

    return { wpm, accuracy }
  }, [isStarted, startTime, correctChars, incorrectChars])

  const stage = ROUTINE_STAGES[currentStage]

  return (
    <div className={cn('warm-up-routine', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Warm-Up Routine</h2>
          <p className="text-gray-400 text-sm">Stage: {stage.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn(
            'text-2xl font-mono font-bold',
            timeLeft <= 10 ? 'text-red-400' : 'text-cyan-400'
          )}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Stage Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="text-cyan-400">{patternsCompleted} patterns completed</span>
        </div>
        <div className="flex gap-1">
          {ROUTINE_STAGES.map((_, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 h-2 rounded-full transition-colors',
                i < currentStage
                  ? 'bg-green-500'
                  : i === currentStage
                  ? 'bg-cyan-500'
                  : 'bg-slate-700'
              )}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs mt-1">
          {ROUTINE_STAGES.map((s, i) => (
            <span
              key={i}
              className={cn(
                'transition-colors',
                i <= currentStage ? 'text-gray-300' : 'text-gray-600'
              )}
            >
              {s.name}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-4 text-sm">
        <div>
          <span className="text-gray-400">WPM: </span>
          <span className="text-cyan-400 font-mono font-bold">{currentStats.wpm}</span>
        </div>
        <div>
          <span className="text-gray-400">Accuracy: </span>
          <span className={cn(
            'font-mono font-bold',
            currentStats.accuracy >= 95 ? 'text-green-400' :
            currentStats.accuracy >= 80 ? 'text-yellow-400' : 'text-red-400'
          )}>
            {currentStats.accuracy}%
          </span>
        </div>
      </div>

      {/* Typing Area */}
      <div
        onClick={handleContainerClick}
        className="relative bg-slate-900 rounded-xl border border-slate-700 p-8 cursor-text focus-within:border-cyan-500/50"
      >
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={handleInput}
          className="absolute opacity-0 w-0 h-0"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Type the warm-up pattern shown"
        />

        <div className="text-center">
          <div className="font-mono text-2xl leading-relaxed">
            {content.split('').map((char, i) => {
              let state: 'pending' | 'correct' | 'incorrect' | 'cursor' = 'pending'
              if (i < typed.length) {
                state = typed[i] === char ? 'correct' : 'incorrect'
              } else if (i === typed.length) {
                state = 'cursor'
              }

              return (
                <span
                  key={i}
                  className={cn(
                    'relative',
                    state === 'correct' && 'text-green-400',
                    state === 'incorrect' && 'text-red-400 bg-red-500/20',
                    state === 'pending' && 'text-gray-500',
                    state === 'cursor' && 'text-gray-300'
                  )}
                >
                  {state === 'cursor' && (
                    <span className="absolute left-0 top-0 w-[2px] h-full bg-cyan-400 animate-pulse" />
                  )}
                  {char === ' ' ? '\u00A0' : char}
                </span>
              )
            })}
          </div>

          {/* Next pattern preview */}
          {currentPattern < stage.patterns.length - 1 && (
            <div className="mt-4 text-gray-600 text-sm">
              Next: {stage.patterns[currentPattern + 1]}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      {!isStarted && (
        <p className="mt-4 text-center text-gray-500 text-sm">
          Click and start typing. Complete each pattern to move to the next.
        </p>
      )}
    </div>
  )
}

export default WarmUpRoutine
