/**
 * Options Step Component
 * Step for configuring test options and viewing summary
 */

import { NavigationButtons } from './NavigationButtons'
import { StepHeader } from './StepHeader'
import type { ChallengeType } from '@/components/ChallengeSelector'
import type { Difficulty, Language } from '@/db/schema'

export interface OptionsStepProps {
  strictMode: boolean
  onStrictModeChange: (enabled: boolean) => void
  allowBackspace: boolean
  onAllowBackspaceChange: (enabled: boolean) => void
  // Summary data
  language: Language | 'all'
  difficulty: Difficulty
  challengeType: ChallengeType
  customDuration: number
  // Navigation
  onBack: () => void
  onStart: () => void
}

interface OptionToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function OptionToggle({
  label,
  description,
  checked,
  onChange,
}: OptionToggleProps) {
  return (
    <label className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 cursor-pointer hover:bg-slate-700 transition-colors">
      <div>
        <div className="font-medium text-white">{label}</div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-gray-500 bg-slate-600 text-cyan-500 focus:ring-cyan-500"
      />
    </label>
  )
}

function getDurationDisplay(
  challengeType: ChallengeType,
  customDuration: number
): string {
  if (challengeType === 'endless') return 'Endless'
  if (challengeType === 'custom') return `${customDuration}s`
  return challengeType
}

export function OptionsStep({
  strictMode,
  onStrictModeChange,
  allowBackspace,
  onAllowBackspaceChange,
  language,
  difficulty,
  challengeType,
  customDuration,
  onBack,
  onStart,
}: OptionsStepProps) {
  const modeDisplay = [
    strictMode ? 'Strict' : 'Normal',
    !allowBackspace ? '(No Backspace)' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="space-y-6">
      <StepHeader
        title="Test Options"
        description="Configure additional settings"
      />

      <div className="space-y-4">
        <OptionToggle
          label="Strict Mode"
          description="Test ends on first error"
          checked={strictMode}
          onChange={onStrictModeChange}
        />
        <OptionToggle
          label="Allow Backspace"
          description="Disable for extra challenge"
          checked={allowBackspace}
          onChange={onAllowBackspaceChange}
        />
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
            {getDurationDisplay(challengeType, customDuration)}
          </div>
          <div className="text-gray-500">Mode:</div>
          <div className="text-white">{modeDisplay}</div>
        </div>
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={onStart}
        nextLabel="Start Test"
        isStart
      />
    </div>
  )
}

export default OptionsStep
