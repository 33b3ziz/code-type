/**
 * Symbol Practice Component
 * Focused practice on programming symbols and special characters
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { Language } from '@/db/schema'
import { SYMBOL_SETS, generatePracticeContent } from '@/lib/practice-modes'
import { cn } from '@/lib/utils'

export interface SymbolPracticeProps {
  language: Language
  duration: number // in seconds
  onComplete: (result: SymbolPracticeResult) => void
  onCancel?: () => void
  className?: string
}

export interface SymbolPracticeResult {
  accuracy: number
  wpm: number
  totalCharacters: number
  correctCharacters: number
  duration: number
  errorPatterns: Record<string, number>
}

export function SymbolPractice({
  language,
  duration,
  onComplete,
  onCancel,
  className = '',
}: SymbolPracticeProps) {
  const [content, setContent] = useState('')
  const [typed, setTyped] = useState('')
  const [isStarted, setIsStarted] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(duration)
  const [correctChars, setCorrectChars] = useState(0)
  const [incorrectChars, setIncorrectChars] = useState(0)
  const [errorPatterns, setErrorPatterns] = useState<Record<string, number>>({})

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | null>(null)

  // Generate new content
  const regenerateContent = useCallback(() => {
    setContent(generatePracticeContent('symbols', language, undefined, 500))
    setTyped('')
    setCorrectChars(0)
    setIncorrectChars(0)
    setErrorPatterns({})
  }, [language])

  // Initialize content
  useEffect(() => {
    regenerateContent()
  }, [regenerateContent])

  // Timer
  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      timerRef.current = window.setTimeout(() => {
        setTimeLeft((t) => t - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Time's up - complete the practice
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
    const totalChars = typed.length
    const wpm = totalChars > 0 ? Math.round((correctChars / 5) / (actualDuration / 60)) : 0
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0

    onComplete({
      accuracy,
      wpm,
      totalCharacters: totalChars,
      correctCharacters: correctChars,
      duration: Math.round(actualDuration),
      errorPatterns,
    })
  }, [startTime, typed, correctChars, errorPatterns, onComplete])

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
      // User typed a character
      if (lastChar === expectedChar) {
        setCorrectChars((c) => c + 1)
      } else {
        setIncorrectChars((c) => c + 1)
        setErrorPatterns((prev) => ({
          ...prev,
          [expectedChar]: (prev[expectedChar] || 0) + 1,
        }))
      }
    }

    setTyped(newTyped)

    // If user has typed beyond content, regenerate
    if (newTyped.length >= content.length - 10) {
      const newContent = generatePracticeContent('symbols', language, undefined, 500)
      setContent(content + ' ' + newContent)
    }
  }

  // Focus on click
  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  // Calculate current stats
  const currentStats = useMemo(() => {
    if (!isStarted || !startTime) return { wpm: 0, accuracy: 100 }

    const elapsed = (Date.now() - startTime) / 1000
    const wpm = typed.length > 0 ? Math.round((correctChars / 5) / (elapsed / 60)) : 0
    const accuracy = typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100

    return { wpm, accuracy }
  }, [isStarted, startTime, typed.length, correctChars])

  // Get symbols for reference
  const symbols = SYMBOL_SETS[language]

  return (
    <div className={cn('symbol-practice', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Symbol Practice</h2>
          <p className="text-gray-400 text-sm">{language.charAt(0).toUpperCase() + language.slice(1)} symbols</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Timer */}
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
        <div>
          <span className="text-gray-400">Errors: </span>
          <span className="text-red-400 font-mono font-bold">{incorrectChars}</span>
        </div>
      </div>

      {/* Typing Area */}
      <div
        onClick={handleContainerClick}
        className="relative bg-slate-900 rounded-xl border border-slate-700 p-6 cursor-text min-h-[200px] focus-within:border-cyan-500/50"
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
          aria-label="Type the symbols shown"
        />

        <div className="font-mono text-lg leading-relaxed whitespace-pre-wrap">
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
      </div>

      {/* Symbol Reference */}
      <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Symbol Reference</h3>
        <div className="flex flex-wrap gap-2">
          {symbols.slice(0, 12).map((symbol, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-slate-700 rounded text-sm font-mono text-cyan-400"
            >
              {symbol.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {!isStarted && (
        <p className="mt-4 text-center text-gray-500 text-sm">
          Click and start typing to begin the practice session
        </p>
      )}
    </div>
  )
}

export default SymbolPractice
