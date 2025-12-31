/**
 * Step Indicator Component
 * Displays the progress steps in the test setup wizard
 */

import { cn } from '@/lib/utils'

export type Step = 'language' | 'difficulty' | 'challenge' | 'options'

export interface StepConfig {
  id: Step
  label: string
}

export const STEPS: Array<StepConfig> = [
  { id: 'language', label: 'Language' },
  { id: 'difficulty', label: 'Difficulty' },
  { id: 'challenge', label: 'Challenge' },
  { id: 'options', label: 'Options' },
]

export interface StepIndicatorProps {
  currentStep: Step
  onStepClick: (step: Step) => void
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)

  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <button
            onClick={() => onStepClick(step.id)}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors',
              index <= currentStepIndex
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-700 text-gray-400'
            )}
            aria-label={`Step ${index + 1}: ${step.label}`}
            aria-current={step.id === currentStep ? 'step' : undefined}
          >
            {index + 1}
          </button>
          {index < STEPS.length - 1 && (
            <div
              className={cn(
                'w-12 h-1 mx-2',
                index < currentStepIndex ? 'bg-cyan-600' : 'bg-slate-700'
              )}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default StepIndicator
