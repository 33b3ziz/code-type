/**
 * Difficulty Step Component
 * Step for selecting difficulty level
 */

import { NavigationButtons } from './NavigationButtons'
import { StepHeader } from './StepHeader'
import type { Difficulty } from '@/db/schema'
import { DifficultySelector } from '@/components/DifficultySelector'

export interface DifficultyStepProps {
  difficulty: Difficulty
  onDifficultyChange: (difficulty: Difficulty) => void
  onBack: () => void
  onNext: () => void
}

export function DifficultyStep({
  difficulty,
  onDifficultyChange,
  onBack,
  onNext,
}: DifficultyStepProps) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="Select Difficulty"
        description="Choose the complexity level of code snippets"
      />
      <DifficultySelector
        value={difficulty}
        onValueChange={onDifficultyChange}
        showLabel={false}
      />
      <NavigationButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

export default DifficultyStep
