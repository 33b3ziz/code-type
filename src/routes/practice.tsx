/**
 * Practice Mode Route
 * Provides focused typing practice with various modes
 * Includes weak spot training that identifies frequently misspelled characters
 */

import { useCallback, useEffect, useState } from 'react'

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2, TrendingUp, Trophy } from 'lucide-react'

import type { PracticeConfig } from '@/components/practice'
import type { SymbolPracticeResult } from '@/components/practice/SymbolPractice'
import type { WeakSpotResult } from '@/components/practice/WeakSpotDrill'
import type { WarmUpResult } from '@/components/practice/WarmUpRoutine'
import type { PracticeMode } from '@/db/schema'
import type { PracticeScore } from '@/lib/practice-modes'
import type { WeakSpotAnalysis, WeakSpotProgress } from '@/lib/weak-spot-analysis'
import {
  PracticeSelector,
  SymbolPractice,
  WarmUpRoutine,
  WeakSpotDrill,
} from '@/components/practice'
import { Button } from '@/components/ui/button'
import { savePracticeSessionFn } from '@/lib/practice-api'
import { PRACTICE_MODES, calculatePracticeScore, getRecommendedMode } from '@/lib/practice-modes'
import { cn } from '@/lib/utils'
import { getWeakSpotsFromHistoryFn, getWeakSpotProgressFn } from '@/lib/weak-spot-analysis'
import { useAuthStore } from '@/stores/auth-store'
import { usePracticeStore } from '@/stores/practice-store'

export const Route = createFileRoute('/practice')({
  component: PracticePage,
})

// Unified result type
type PracticeResult = SymbolPracticeResult | WeakSpotResult | WarmUpResult

function PracticePage() {
  const navigate = useNavigate()

  // Auth store for user data
  const { user, isAuthenticated } = useAuthStore()

  // Practice store for tracking completions and weak spot history
  const {
    markCompleted,
    updateErrorPatterns,
    recordWeakSpotSession,
    getTopWeakCharacters,
    weakSpotHistory,
    localErrorPatterns,
  } = usePracticeStore()

  // State
  const [activeConfig, setActiveConfig] = useState<PracticeConfig | null>(null)
  const [result, setResult] = useState<PracticeResult | null>(null)
  const [score, setScore] = useState<PracticeScore | null>(null)
  const [recommendedMode, setRecommendedMode] = useState<PracticeMode>('warm-up')
  const [errorPatterns, setErrorPatterns] = useState<Record<string, number>>({})

  // Server data state
  const [serverWeakSpots, setServerWeakSpots] = useState<WeakSpotAnalysis | null>(null)
  const [serverProgress, setServerProgress] = useState<WeakSpotProgress | null>(null)
  const [isLoadingServerData, setIsLoadingServerData] = useState(false)

  // Fetch weak spots from server when authenticated
  const fetchServerWeakSpots = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return

    setIsLoadingServerData(true)
    try {
      const [analysis, progress] = await Promise.all([
        getWeakSpotsFromHistoryFn({ data: { userId: user.id } }),
        getWeakSpotProgressFn({ data: { userId: user.id } }),
      ])
      setServerWeakSpots(analysis)
      setServerProgress(progress)

      // Update recommended mode based on server data
      if (analysis.weakCharacters.length > 0) {
        const patterns: Record<string, number> = {}
        analysis.weakCharacters.forEach((wc) => {
          patterns[wc.char] = wc.errorCount
        })
        setRecommendedMode(getRecommendedMode(patterns))
      }
    } catch (error) {
      console.error('Failed to fetch weak spots from server:', error)
    } finally {
      setIsLoadingServerData(false)
    }
  }, [isAuthenticated, user?.id])

  // Fetch server data on mount if authenticated
  useEffect(() => {
    fetchServerWeakSpots()
  }, [fetchServerWeakSpots])

  // Load local error patterns from store
  useEffect(() => {
    setErrorPatterns(localErrorPatterns)
    if (Object.keys(localErrorPatterns).length > 0) {
      setRecommendedMode(getRecommendedMode(localErrorPatterns))
    }
  }, [localErrorPatterns])

  // Save error patterns to store and optionally to server
  const saveErrorPatterns = useCallback(
    (newPatterns: Record<string, number>) => {
      const merged = { ...errorPatterns }
      Object.entries(newPatterns).forEach(([char, count]) => {
        merged[char] = (merged[char] || 0) + count
      })
      setErrorPatterns(merged)
      updateErrorPatterns(newPatterns)
      setRecommendedMode(getRecommendedMode(merged))
    },
    [errorPatterns, updateErrorPatterns]
  )

  // Handle practice start
  const handleStart = (config: PracticeConfig) => {
    setActiveConfig(config)
    setResult(null)
    setScore(null)
  }

  // Handle practice complete
  const handleComplete = async (practiceResult: PracticeResult) => {
    setResult(practiceResult)

    // Calculate score
    const practiceScore = calculatePracticeScore(
      practiceResult.accuracy,
      practiceResult.wpm,
      activeConfig?.mode || 'warm-up'
    )
    setScore(practiceScore)

    // Mark mode as completed in the store
    if (activeConfig?.mode) {
      markCompleted(activeConfig.mode)
    }

    // Save error patterns if available
    if ('errorPatterns' in practiceResult) {
      saveErrorPatterns(practiceResult.errorPatterns)
    }

    // Handle weak spot specific tracking
    if (activeConfig?.mode === 'weak-spots' && 'improvedCharacters' in practiceResult) {
      const weakSpotResult = practiceResult as WeakSpotResult

      // Record session in local store for tracking
      // Create character results from the weak spot drill data
      const characterResults: Record<string, { correct: number; total: number }> = {}
      const targetChars = getWeakSpotTargetCharacters()

      // Use error patterns to estimate per-character performance
      targetChars.forEach((char) => {
        const errors = weakSpotResult.errorPatterns[char] || 0
        // Estimate total based on a reasonable assumption
        const estimatedTotal = Math.max(errors + 5, 10) // At least 10 attempts per char
        characterResults[char] = {
          correct: estimatedTotal - errors,
          total: estimatedTotal,
        }
      })

      recordWeakSpotSession({
        characters: targetChars,
        characterResults,
        accuracy: weakSpotResult.accuracy,
      })
    }

    // Save to server if authenticated
    if (isAuthenticated && user?.id && activeConfig) {
      try {
        await savePracticeSessionFn({
          data: {
            userId: user.id,
            mode: activeConfig.mode,
            language: activeConfig.language,
            targetCharacters:
              activeConfig.mode === 'weak-spots' ? getWeakSpotTargetCharacters() : undefined,
            duration: practiceResult.duration,
            charactersTyped: practiceResult.totalCharacters,
            correctCharacters: practiceResult.correctCharacters,
            accuracy: practiceResult.accuracy,
            wpm: practiceResult.wpm,
          },
        })

        // Refresh server data after saving
        fetchServerWeakSpots()
      } catch (error) {
        console.error('Failed to save practice session:', error)
      }
    }
  }

  // Get target characters for weak spot drill (combining server and local data)
  const getWeakSpotTargetCharacters = useCallback((): Array<string> => {
    // Priority: server data > local store > defaults
    if (serverWeakSpots && serverWeakSpots.weakCharacters.length > 0) {
      return serverWeakSpots.weakCharacters.slice(0, 6).map((wc) => wc.char)
    }

    const localWeak = getTopWeakCharacters(6)
    if (localWeak.length > 0) {
      return localWeak.map((w) => w.char)
    }

    const patternWeak = Object.entries(errorPatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([char]) => char)

    if (patternWeak.length > 0) {
      return patternWeak
    }

    // Default characters if no data available
    return ['{', '}', '[', ']', '(', ')']
  }, [serverWeakSpots, getTopWeakCharacters, errorPatterns])

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
        // Get target characters from combined server/local data
        const weakChars = getWeakSpotTargetCharacters()
        return (
          <WeakSpotDrill
            {...commonProps}
            targetCharacters={weakChars}
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

            {/* Progress Over Time */}
            {(serverProgress || weakSpotHistory.length > 0) && (
              <div className="mt-6 bg-slate-900/50 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-medium text-white">Your Progress</h3>
                </div>

                {/* Server Progress */}
                {serverProgress && serverProgress.overallImprovement !== 0 && (
                  <div className="mb-4">
                    <div className={cn(
                      'text-2xl font-bold font-mono mb-1',
                      serverProgress.overallImprovement > 0 ? 'text-green-400' : 'text-red-400'
                    )}>
                      {serverProgress.overallImprovement > 0 ? '+' : ''}
                      {serverProgress.overallImprovement}%
                    </div>
                    <div className="text-xs text-gray-500">Overall accuracy improvement</div>
                  </div>
                )}

                {/* Session Count & Mastered Characters */}
                <div className="flex justify-center gap-6 text-sm">
                  <div>
                    <span className="text-gray-400">Sessions: </span>
                    <span className="text-cyan-400 font-mono">
                      {serverProgress?.totalSessions ?? weakSpotHistory.length}
                    </span>
                  </div>
                  {(serverProgress?.masteredCharacters.length ?? 0) > 0 && (
                    <div>
                      <span className="text-gray-400">Mastered: </span>
                      <span className="text-green-400 font-mono">
                        {serverProgress?.masteredCharacters.join(', ')}
                      </span>
                    </div>
                  )}
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
        <>
          {/* Weak Spot Summary (shown when not in practice) */}
          {isLoadingServerData ? (
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading your weak spots...</span>
            </div>
          ) : (serverWeakSpots && serverWeakSpots.weakCharacters.length > 0) && (
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-white">
                  Your Weak Spots (from {serverWeakSpots.testCount} tests)
                </h3>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {serverWeakSpots.weakCharacters.slice(0, 6).map((wc) => (
                  <div
                    key={wc.char}
                    className={cn(
                      'px-3 py-2 rounded-lg border text-center min-w-[60px]',
                      wc.trend === 'improving'
                        ? 'border-green-500/50 bg-green-500/10'
                        : wc.trend === 'declining'
                        ? 'border-red-500/50 bg-red-500/10'
                        : 'border-slate-600 bg-slate-800'
                    )}
                  >
                    <div className="font-mono text-lg text-white">{wc.char}</div>
                    <div className={cn(
                      'text-xs',
                      wc.trend === 'improving' ? 'text-green-400' :
                      wc.trend === 'declining' ? 'text-red-400' : 'text-gray-400'
                    )}>
                      {wc.errorRate}% errors
                    </div>
                  </div>
                ))}
              </div>
              {serverWeakSpots.improvedCharacters.length > 0 && (
                <p className="text-xs text-green-400 text-center">
                  Improving: {serverWeakSpots.improvedCharacters.join(', ')}
                </p>
              )}
            </div>
          )}

          <PracticeSelector
            onSelect={handleStart}
            recommendedMode={recommendedMode}
          />
        </>
      )}
    </div>
  )
}
