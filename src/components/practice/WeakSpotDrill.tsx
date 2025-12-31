/**
 * Weak Spot Drill Component
 * Focused practice on characters where the user makes frequent mistakes
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { generatePracticeContent } from '@/lib/practice-modes'
import { cn } from '@/lib/utils'

export interface WeakSpotDrillProps {
  targetCharacters: Array<string>
  duration: number
  onComplete: (result: WeakSpotResult) => void
  onCancel?: () => void
  className?: string
}

export interface WeakSpotResult {
  accuracy: number
  wpm: number
  totalCharacters: number
  correctCharacters: number
  duration: number
  improvedCharacters: Array<string>
  stillWeakCharacters: Array<string>
  errorPatterns: Record<string, number>
}

export function WeakSpotDrill({
  targetCharacters,
  duration,
  onComplete,
  onCancel,
  className = '',
}: WeakSpotDrillProps) {
  const [content, setContent] = useState('')
  const [typed, setTyped] = useState('')
  const [isStarted, setIsStarted] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(duration)
  const [correctChars, setCorrectChars] = useState(0)
  const [, setIncorrectChars] = useState(0)
  const [errorPatterns, setErrorPatterns] = useState<Record<string, number>>({})
  const [targetHits, setTargetHits] = useState<Record<string, { correct: number; total: number }>>({})

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | null>(null)

  // Initialize target tracking
  useEffect(() => {
    const initialTargets: Record<string, { correct: number; total: number }> = {}
    targetCharacters.forEach((char) => {
      initialTargets[char] = { correct: 0, total: 0 }
    })
    setTargetHits(initialTargets)
  }, [targetCharacters])

  // Generate content
  const regenerateContent = useCallback(() => {
    const newContent = generatePracticeContent('weak-spots', undefined, targetCharacters, 500)
    setContent(newContent)
    setTyped('')
    setCorrectChars(0)
    setIncorrectChars(0)
    setErrorPatterns({})
  }, [targetCharacters])

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

    // Determine which characters improved
    const improvedCharacters: Array<string> = []
    const stillWeakCharacters: Array<string> = []

    Object.entries(targetHits).forEach(([char, stats]) => {
      if (stats.total >= 3) {
        const charAccuracy = stats.correct / stats.total
        if (charAccuracy >= 0.8) {
          improvedCharacters.push(char)
        } else {
          stillWeakCharacters.push(char)
        }
      }
    })

    onComplete({
      accuracy,
      wpm,
      totalCharacters: totalChars,
      correctCharacters: correctChars,
      duration: Math.round(actualDuration),
      improvedCharacters,
      stillWeakCharacters,
      errorPatterns,
    })
  }, [startTime, typed, correctChars, targetHits, errorPatterns, onComplete])

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
      const isCorrect = lastChar === expectedChar

      if (isCorrect) {
        setCorrectChars((c) => c + 1)
      } else {
        setIncorrectChars((c) => c + 1)
        setErrorPatterns((prev) => ({
          ...prev,
          [expectedChar]: (prev[expectedChar] || 0) + 1,
        }))
      }

      // Track target character hits
      if (targetCharacters.includes(expectedChar)) {
        setTargetHits((prev) => ({
          ...prev,
          [expectedChar]: {
            correct: prev[expectedChar].correct + (isCorrect ? 1 : 0),
            total: prev[expectedChar].total + 1,
          },
        }))
      }
    }

    setTyped(newTyped)

    // Regenerate if needed
    if (newTyped.length >= content.length - 10) {
      const newContent = generatePracticeContent('weak-spots', undefined, targetCharacters, 500)
      setContent(content + ' ' + newContent)
    }
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  // Current stats
  const currentStats = useMemo(() => {
    if (!isStarted || !startTime) return { wpm: 0, accuracy: 100 }

    const elapsed = (Date.now() - startTime) / 1000
    const wpm = typed.length > 0 ? Math.round((correctChars / 5) / (elapsed / 60)) : 0
    const accuracy = typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100

    return { wpm, accuracy }
  }, [isStarted, startTime, typed.length, correctChars])

  // Calculate per-character accuracy
  const characterAccuracy = useMemo(() => {
    return Object.entries(targetHits).map(([char, stats]) => ({
      char,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null,
      total: stats.total,
    }))
  }, [targetHits])

  return (
    <div className={cn('weak-spot-drill', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Weak Spot Training</h2>
          <p className="text-gray-400 text-sm">
            Focus on: {targetCharacters.map((c) => `"${c}"`).join(', ')}
          </p>
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

      {/* Target Character Progress */}
      <div className="grid grid-cols-6 gap-2 mb-6">
        {characterAccuracy.map(({ char, accuracy, total }) => (
          <div
            key={char}
            className={cn(
              'p-2 rounded-lg border text-center',
              accuracy === null
                ? 'border-slate-700 bg-slate-800'
                : accuracy >= 80
                ? 'border-green-500/50 bg-green-500/10'
                : accuracy >= 50
                ? 'border-yellow-500/50 bg-yellow-500/10'
                : 'border-red-500/50 bg-red-500/10'
            )}
          >
            <div className="font-mono text-lg text-white">{char}</div>
            <div className={cn(
              'text-xs',
              accuracy === null
                ? 'text-gray-500'
                : accuracy >= 80
                ? 'text-green-400'
                : accuracy >= 50
                ? 'text-yellow-400'
                : 'text-red-400'
            )}>
              {accuracy !== null ? `${accuracy}%` : '-'}
              {total > 0 && <span className="text-gray-500 ml-1">({total})</span>}
            </div>
          </div>
        ))}
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
          aria-label="Type the text shown to practice weak characters"
        />

        <div className="font-mono text-lg leading-relaxed whitespace-pre-wrap">
          {content.split('').map((char, i) => {
            let state: 'pending' | 'correct' | 'incorrect' | 'cursor' = 'pending'
            if (i < typed.length) {
              state = typed[i] === char ? 'correct' : 'incorrect'
            } else if (i === typed.length) {
              state = 'cursor'
            }

            const isTargetChar = targetCharacters.includes(char)

            return (
              <span
                key={i}
                className={cn(
                  'relative',
                  state === 'correct' && 'text-green-400',
                  state === 'incorrect' && 'text-red-400 bg-red-500/20',
                  state === 'pending' && (isTargetChar ? 'text-yellow-400' : 'text-gray-500'),
                  state === 'cursor' && 'text-gray-300',
                  isTargetChar && state === 'pending' && 'underline decoration-yellow-400/50'
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

      {/* Instructions */}
      {!isStarted && (
        <p className="mt-4 text-center text-gray-500 text-sm">
          Click and start typing. Target characters are highlighted in yellow.
        </p>
      )}
    </div>
  )
}

export default WeakSpotDrill
