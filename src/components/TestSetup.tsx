import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { DifficultySelector } from '@/components/DifficultySelector'
import { LanguageSelector } from '@/components/LanguageSelector'
import {
  ChallengeSelector,
  getChallengeDuration,
  type ChallengeType,
} from '@/components/ChallengeSelector'
import type { Language, Difficulty } from '@/db/schema'

export interface TestConfig {
  language: Language | 'all'
  difficulty: Difficulty
  challengeType: ChallengeType
  duration: number | null // null for endless
  strictMode: boolean
  allowBackspace: boolean
}

interface TestSetupProps {
  onStart: (config: TestConfig) => void
  className?: string
}

type Step = 'language' | 'difficulty' | 'challenge' | 'options'

export function TestSetup({ onStart, className }: TestSetupProps) {
  const [step, setStep] = useState<Step>('language')
  const [language, setLanguage] = useState<Language | 'all'>('all')
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate')
  const [challengeType, setChallengeType] = useState<ChallengeType>('60s')
  const [customDuration, setCustomDuration] = useState(60)
  const [strictMode, setStrictMode] = useState(false)
  const [allowBackspace, setAllowBackspace] = useState(true)

  const handleStart = useCallback(() => {
    const duration = getChallengeDuration(challengeType, customDuration)
    onStart({
      language,
      difficulty,
      challengeType,
      duration,
      strictMode,
      allowBackspace,
    })
  }, [language, difficulty, challengeType, customDuration, strictMode, allowBackspace, onStart])

  const goToStep = (newStep: Step) => setStep(newStep)

  const steps: { id: Step; label: string }[] = [
    { id: 'language', label: 'Language' },
    { id: 'difficulty', label: 'Difficulty' },
    { id: 'challenge', label: 'Challenge' },
    { id: 'options', label: 'Options' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === step)

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, index) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => goToStep(s.id)}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors',
                index <= currentStepIndex
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 text-gray-400'
              )}
            >
              {index + 1}
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-12 h-1 mx-2',
                  index < currentStepIndex ? 'bg-cyan-600' : 'bg-slate-700'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-xl bg-slate-800 p-6">
        {step === 'language' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">Select Language</h2>
              <p className="text-gray-400 text-sm mt-1">
                Choose which programming language to practice
              </p>
            </div>
            <LanguageSelector
              value={language}
              onValueChange={setLanguage}
              showLabel={false}
            />
            <div className="flex justify-end">
              <button
                onClick={() => goToStep('difficulty')}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 'difficulty' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">Select Difficulty</h2>
              <p className="text-gray-400 text-sm mt-1">
                Choose the complexity level of code snippets
              </p>
            </div>
            <DifficultySelector
              value={difficulty}
              onValueChange={setDifficulty}
              showLabel={false}
            />
            <div className="flex justify-between">
              <button
                onClick={() => goToStep('language')}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => goToStep('challenge')}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 'challenge' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">Select Challenge</h2>
              <p className="text-gray-400 text-sm mt-1">
                Choose your test format and duration
              </p>
            </div>
            <ChallengeSelector
              value={challengeType}
              onValueChange={setChallengeType}
              customDuration={customDuration}
              onCustomDurationChange={setCustomDuration}
              showLabel={false}
            />
            <div className="flex justify-between">
              <button
                onClick={() => goToStep('difficulty')}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => goToStep('options')}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 'options' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">Test Options</h2>
              <p className="text-gray-400 text-sm mt-1">
                Configure additional settings
              </p>
            </div>

            <div className="space-y-4">
              {/* Strict Mode */}
              <label className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 cursor-pointer hover:bg-slate-700 transition-colors">
                <div>
                  <div className="font-medium text-white">Strict Mode</div>
                  <div className="text-sm text-gray-400">
                    Test ends on first error
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={strictMode}
                  onChange={(e) => setStrictMode(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-500 bg-slate-600 text-cyan-500 focus:ring-cyan-500"
                />
              </label>

              {/* Allow Backspace */}
              <label className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 cursor-pointer hover:bg-slate-700 transition-colors">
                <div>
                  <div className="font-medium text-white">Allow Backspace</div>
                  <div className="text-sm text-gray-400">
                    Disable for extra challenge
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowBackspace}
                  onChange={(e) => setAllowBackspace(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-500 bg-slate-600 text-cyan-500 focus:ring-cyan-500"
                />
              </label>
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-slate-900 p-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Test Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Language:</div>
                <div className="text-white capitalize">{language}</div>
                <div className="text-gray-500">Difficulty:</div>
                <div className="text-white capitalize">{difficulty}</div>
                <div className="text-gray-500">Duration:</div>
                <div className="text-white">
                  {challengeType === 'endless'
                    ? 'Endless'
                    : challengeType === 'custom'
                      ? `${customDuration}s`
                      : challengeType}
                </div>
                <div className="text-gray-500">Mode:</div>
                <div className="text-white">
                  {strictMode ? 'Strict' : 'Normal'}
                  {!allowBackspace && ' (No Backspace)'}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => goToStep('challenge')}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleStart}
                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-bold text-lg transition-all shadow-lg shadow-cyan-500/20"
              >
                Start Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Quick start component for common test configurations
 */
export function QuickStart({
  onStart,
  className,
}: {
  onStart: (config: TestConfig) => void
  className?: string
}) {
  const quickOptions = [
    {
      label: '60s JavaScript',
      config: {
        language: 'javascript' as const,
        difficulty: 'intermediate' as const,
        challengeType: '60s' as const,
        duration: 60,
        strictMode: false,
        allowBackspace: true,
      },
    },
    {
      label: '2min TypeScript',
      config: {
        language: 'typescript' as const,
        difficulty: 'intermediate' as const,
        challengeType: '120s' as const,
        duration: 120,
        strictMode: false,
        allowBackspace: true,
      },
    },
    {
      label: 'Quick Python',
      config: {
        language: 'python' as const,
        difficulty: 'beginner' as const,
        challengeType: '30s' as const,
        duration: 30,
        strictMode: false,
        allowBackspace: true,
      },
    },
    {
      label: 'Endless Random',
      config: {
        language: 'all' as const,
        difficulty: 'intermediate' as const,
        challengeType: 'endless' as const,
        duration: null,
        strictMode: false,
        allowBackspace: true,
      },
    },
  ]

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
      {quickOptions.map((option) => (
        <button
          key={option.label}
          onClick={() => onStart(option.config)}
          className="p-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-center"
        >
          <div className="font-medium text-white">{option.label}</div>
        </button>
      ))}
    </div>
  )
}
