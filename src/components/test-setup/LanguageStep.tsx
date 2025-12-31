/**
 * Language Step Component
 * Step for selecting programming language
 */

import { NavigationButtons } from './NavigationButtons'
import { StepHeader } from './StepHeader'
import type { Language } from '@/db/schema'
import { LanguageSelector } from '@/components/LanguageSelector'

export interface LanguageStepProps {
  language: Language | 'all'
  onLanguageChange: (language: Language | 'all') => void
  onNext: () => void
}

export function LanguageStep({
  language,
  onLanguageChange,
  onNext,
}: LanguageStepProps) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="Select Language"
        description="Choose which programming language to practice"
      />
      <LanguageSelector
        value={language}
        onValueChange={onLanguageChange}
        showLabel={false}
      />
      <NavigationButtons onNext={onNext} showBack={false} />
    </div>
  )
}

export default LanguageStep
