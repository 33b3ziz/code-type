/**
 * Test Setup Wizard Component
 * Multi-step wizard for configuring typing test parameters
 */

import { useCallback, useState } from 'react'

import {
  ChallengeStep,
  DifficultyStep,
  LanguageStep,
  OptionsStep,
  StepIndicator,
} from './test-setup'
import type { Step } from './test-setup'
import type { ChallengeType } from '@/components/ChallengeSelector'
import type { Difficulty, Language } from '@/db/schema'
import { getChallengeDuration } from '@/components/ChallengeSelector'
import { cn } from '@/lib/utils'

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

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      <StepIndicator currentStep={step} onStepClick={goToStep} />

      <div className="rounded-xl bg-slate-800 p-6">
        {step === 'language' && (
          <LanguageStep
            language={language}
            onLanguageChange={setLanguage}
            onNext={() => goToStep('difficulty')}
          />
        )}

        {step === 'difficulty' && (
          <DifficultyStep
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            onBack={() => goToStep('language')}
            onNext={() => goToStep('challenge')}
          />
        )}

        {step === 'challenge' && (
          <ChallengeStep
            challengeType={challengeType}
            onChallengeTypeChange={setChallengeType}
            customDuration={customDuration}
            onCustomDurationChange={setCustomDuration}
            onBack={() => goToStep('difficulty')}
            onNext={() => goToStep('options')}
          />
        )}

        {step === 'options' && (
          <OptionsStep
            strictMode={strictMode}
            onStrictModeChange={setStrictMode}
            allowBackspace={allowBackspace}
            onAllowBackspaceChange={setAllowBackspace}
            language={language}
            difficulty={difficulty}
            challengeType={challengeType}
            customDuration={customDuration}
            onBack={() => goToStep('challenge')}
            onStart={handleStart}
          />
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
  const quickOptions: Array<{ label: string; config: TestConfig }> = [
    {
      label: '60s JavaScript',
      config: {
        language: 'javascript',
        difficulty: 'intermediate',
        challengeType: '60s',
        duration: 60,
        strictMode: false,
        allowBackspace: true,
      },
    },
    {
      label: '2min TypeScript',
      config: {
        language: 'typescript',
        difficulty: 'intermediate',
        challengeType: '120s',
        duration: 120,
        strictMode: false,
        allowBackspace: true,
      },
    },
    {
      label: 'Quick Python',
      config: {
        language: 'python',
        difficulty: 'beginner',
        challengeType: '30s',
        duration: 30,
        strictMode: false,
        allowBackspace: true,
      },
    },
    {
      label: 'Endless Random',
      config: {
        language: 'all',
        difficulty: 'intermediate',
        challengeType: 'endless',
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
