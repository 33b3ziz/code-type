/**
 * Practice Mode Route
 * Provides focused typing practice with various modes
 */

import { useEffect, useState } from 'react'

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Trophy } from 'lucide-react'

import type { PracticeConfig } from '@/components/practice'
import type { SymbolPracticeResult } from '@/components/practice/SymbolPractice'
import type { WeakSpotResult } from '@/components/practice/WeakSpotDrill'
import type { WarmUpResult } from '@/components/practice/WarmUpRoutine'
import type { PracticeMode } from '@/db/schema'
import type { PracticeScore } from '@/lib/practice-modes'
import {
  PracticeSelector,
  SymbolPractice,
  WarmUpRoutine,
  WeakSpotDrill,
} from '@/components/practice'
import { Button } from '@/components/ui/button'
import { calculatePracticeScore, getRecommendedMode, PRACTICE_MODES } from '@/lib/practice-modes'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/practice')({
  component: PracticePage,
})

// Unified result type
type PracticeResult = SymbolPracticeResult | WeakSpotResult | WarmUpResult

function PracticePage() {
  const navigate = useNavigate()

  // State
  const [activeConfig, setActiveConfig] = useState<PracticeConfig | null>(null)
  const [result, setResult] = useState<PracticeResult | null>(null)
  const [score, setScore] = useState<PracticeScore | null>(null)
  const [recommendedMode, setRecommendedMode] = useState<PracticeMode>('warm-up')
  const [errorPatterns, setErrorPatterns] = useState<Record<string, number>>({})

  // Load error patterns from localStorage (simulated - in production would come from DB)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('codetype-error-patterns')
      if (stored) {
        const patterns = JSON.parse(stored) as Record<string, number>
        setErrorPatterns(patterns)
        setRecommendedMode(getRecommendedMode(patterns))
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Save error patterns
  const saveErrorPatterns = (newPatterns: Record<string, number>) => {
    const merged = { ...errorPatterns }
    Object.entries(newPatterns).forEach(([char, count]) => {
      merged[char] = (merged[char] || 0) + count
    })
    setErrorPatterns(merged)
    localStorage.setItem('codetype-error-patterns', JSON.stringify(merged))
    setRecommendedMode(getRecommendedMode(merged))
  }

  // Handle practice start
  const handleStart = (config: PracticeConfig) => {
    setActiveConfig(config)
    setResult(null)
    setScore(null)
  }

  // Handle practice complete
  const handleComplete = (practiceResult: PracticeResult) => {
    setResult(practiceResult)

    // Calculate score
    const practiceScore = calculatePracticeScore(
      practiceResult.accuracy,
      practiceResult.wpm,
      activeConfig?.mode || 'warm-up'
    )
    setScore(practiceScore)

    // Save error patterns if available
    if ('errorPatterns' in practiceResult) {
      saveErrorPatterns(practiceResult.errorPatterns)
    }
  }

  // Handle cancel/back
  const handleCancel = () => {
    setActiveConfig(null)
    setResult(null)
    setScore(null)
  }

  // Handle try again
  const handleTryAgain = () => {
    setResult(null)
    setScore(null)
  }

  // Render active practice mode
  const renderPracticeMode = () => {
    if (!activeConfig) return null

    const commonProps = {
      duration: activeConfig.duration,
      onComplete: handleComplete,
      onCancel: handleCancel,
    }

    switch (activeConfig.mode) {
      case 'symbols':
        return (
          <SymbolPractice
            {...commonProps}
            language={activeConfig.language || 'javascript'}
          />
        )
      case 'weak-spots': {
        // Get top error characters
        const weakChars = Object.entries(errorPatterns)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([char]) => char)
        return (
          <WeakSpotDrill
            {...commonProps}
            targetCharacters={weakChars.length > 0 ? weakChars : ['{', '}', '[', ']', '(', ')']}
          />
        )
      }
      case 'warm-up':
        return <WarmUpRoutine {...commonProps} />
      case 'keywords':
      case 'speed':
      case 'accuracy':
        // Use Symbol Practice with appropriate content for these modes
        return (
          <SymbolPractice
            {...commonProps}
            language={activeConfig.language || 'javascript'}
          />
        )
      default:
        return null
    }
  }

  // Render results
  const renderResults = () => {
    if (!result || !score || !activeConfig) return null

    const modeConfig = PRACTICE_MODES[activeConfig.mode]

    return (
      <div className="max-w-2xl mx-auto text-center">
        {/* Score Badge */}
        <div className={cn(
          'inline-flex items-center justify-center w-32 h-32 rounded-full mb-6',
          score.grade === 'S' && 'bg-gradient-to-br from-yellow-400 to-orange-500',
          score.grade === 'A' && 'bg-gradient-to-br from-green-400 to-emerald-500',
          score.grade === 'B' && 'bg-gradient-to-br from-cyan-400 to-blue-500',
          score.grade === 'C' && 'bg-gradient-to-br from-purple-400 to-violet-500',
          score.grade === 'D' && 'bg-gradient-to-br from-gray-400 to-slate-500',
          score.grade === 'F' && 'bg-gradient-to-br from-red-400 to-rose-500'
        )}>
          <span className="text-5xl font-bold text-white">{score.grade}</span>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-white mb-2">{score.message}</h2>
        <p className="text-gray-400 mb-8">{modeConfig.name} Complete</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 rounded-xl p-4">
            <div className="text-3xl font-bold text-cyan-400 font-mono">{result.wpm}</div>
            <div className="text-sm text-gray-400">WPM</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4">
            <div className={cn(
              'text-3xl font-bold font-mono',
              result.accuracy >= 95 ? 'text-green-400' :
              result.accuracy >= 80 ? 'text-yellow-400' : 'text-red-400'
            )}>
              {result.accuracy}%
            </div>
            <div className="text-sm text-gray-400">Accuracy</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4">
            <div className="text-3xl font-bold text-purple-400 font-mono">
              {result.totalCharacters}
            </div>
            <div className="text-sm text-gray-400">Characters</div>
          </div>
        </div>

        {/* Weak Spot Specific Results */}
        {'improvedCharacters' in result && (
          <div className="mb-8">
            {result.improvedCharacters.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-green-400 mb-2">Improved Characters</h3>
                <div className="flex justify-center gap-2">
                  {result.improvedCharacters.map((char) => (
                    <span key={char} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg font-mono">
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.stillWeakCharacters.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-yellow-400 mb-2">Still Practicing</h3>
                <div className="flex justify-center gap-2">
                  {result.stillWeakCharacters.map((char) => (
                    <span key={char} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg font-mono">
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-slate-600 text-gray-300 hover:bg-slate-800"
          >
            Choose Mode
          </Button>
          <Button
            onClick={handleTryAgain}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            Practice Again
          </Button>
        </div>

        {/* Improvement indicator */}
        {score.improvement && (
          <div className="mt-6 flex items-center justify-center gap-2 text-green-400">
            <Trophy className="w-5 h-5" />
            <span>Personal improvement!</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/' })}
          className="text-gray-400 hover:text-white"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Practice Mode</h1>
          <p className="text-gray-400 text-sm">
            Focused exercises to improve your typing skills
          </p>
        </div>
      </div>

      {/* Content */}
      {result && score ? (
        renderResults()
      ) : activeConfig ? (
        renderPracticeMode()
      ) : (
        <PracticeSelector
          onSelect={handleStart}
          recommendedMode={recommendedMode}
        />
      )}
    </div>
  )
}
