/**
 * Challenge Step Component
 * Step for selecting challenge type and duration
 */

import { NavigationButtons } from './NavigationButtons'
import { StepHeader } from './StepHeader'
import type { ChallengeType } from '@/components/ChallengeSelector'
import { ChallengeSelector } from '@/components/ChallengeSelector'

export interface ChallengeStepProps {
  challengeType: ChallengeType
  onChallengeTypeChange: (type: ChallengeType) => void
  customDuration: number
  onCustomDurationChange: (duration: number) => void
  onBack: () => void
  onNext: () => void
}

export function ChallengeStep({
  challengeType,
  onChallengeTypeChange,
  customDuration,
  onCustomDurationChange,
  onBack,
  onNext,
}: ChallengeStepProps) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="Select Challenge"
        description="Choose your test format and duration"
      />
      <ChallengeSelector
        value={challengeType}
        onValueChange={onChallengeTypeChange}
        customDuration={customDuration}
        onCustomDurationChange={onCustomDurationChange}
        showLabel={false}
      />
      <NavigationButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

export default ChallengeStep
