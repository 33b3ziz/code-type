/**
 * Navigation Buttons Component
 * Reusable back/next buttons for wizard steps
 */

export interface NavigationButtonsProps {
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  showBack?: boolean
  isStart?: boolean
}

export function NavigationButtons({
  onBack,
  onNext,
  nextLabel = 'Next',
  showBack = true,
  isStart = false,
}: NavigationButtonsProps) {
  const nextButtonClass = isStart
    ? 'px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-bold text-lg transition-all shadow-lg shadow-cyan-500/20'
    : 'px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors'

  if (!showBack) {
    return (
      <div className="flex justify-end">
        <button onClick={onNext} className={nextButtonClass}>
          {nextLabel}
        </button>
      </div>
    )
  }

  return (
    <div className="flex justify-between">
      <button
        onClick={onBack}
        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
      >
        Back
      </button>
      <button onClick={onNext} className={nextButtonClass}>
        {nextLabel}
      </button>
    </div>
  )
}

export default NavigationButtons
