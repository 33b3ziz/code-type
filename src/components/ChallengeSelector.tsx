import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export type ChallengeType = '30s' | '60s' | '120s' | 'endless' | 'custom'

export interface ChallengeOption {
  value: ChallengeType
  label: string
  description: string
  icon: string
  duration: number | null // null for endless, custom handled separately
}

export const CHALLENGE_OPTIONS: Array<ChallengeOption> = [
  {
    value: '30s',
    label: '30 Seconds',
    description: 'Quick sprint test',
    icon: '⚡',
    duration: 30,
  },
  {
    value: '60s',
    label: '60 Seconds',
    description: 'Standard typing test',
    icon: '⏱️',
    duration: 60,
  },
  {
    value: '120s',
    label: '2 Minutes',
    description: 'Extended practice',
    icon: '🎯',
    duration: 120,
  },
  {
    value: 'endless',
    label: 'Endless',
    description: 'Type until you finish',
    icon: '♾️',
    duration: null,
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Set your own time',
    icon: '⚙️',
    duration: null,
  },
]

interface ChallengeSelectorProps {
  value: ChallengeType
  onValueChange: (value: ChallengeType) => void
  customDuration?: number
  onCustomDurationChange?: (duration: number) => void
  disabled?: boolean
  showLabel?: boolean
  className?: string
}

export function ChallengeSelector({
  value,
  onValueChange,
  customDuration = 60,
  onCustomDurationChange,
  disabled = false,
  showLabel = true,
  className,
}: ChallengeSelectorProps) {
  return (
    <div className={className}>
      {showLabel && (
        <Label
          htmlFor="challenge-select"
          className="mb-2 block text-sm font-medium"
        >
          Challenge
        </Label>
      )}
      <div className="flex gap-2">
        <Select
          value={value}
          onValueChange={(v) => onValueChange(v as ChallengeType)}
          disabled={disabled}
        >
          <SelectTrigger id="challenge-select" className="w-full min-w-[180px]">
            <SelectValue placeholder="Select challenge" />
          </SelectTrigger>
          <SelectContent>
            {CHALLENGE_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>{option.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Custom duration input */}
        {value === 'custom' && onCustomDurationChange && (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={10}
              max={600}
              value={customDuration}
              onChange={(e) => onCustomDurationChange(parseInt(e.target.value) || 60)}
              className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Custom duration in seconds"
            />
            <span className="text-sm text-muted-foreground">sec</span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Get the duration in seconds for a challenge type
 * Returns null for endless mode
 */
export function getChallengeDuration(
  type: ChallengeType,
  customDuration?: number
): number | null {
  if (type === 'endless') return null
  if (type === 'custom') return customDuration ?? 60

  const option = CHALLENGE_OPTIONS.find((o) => o.value === type)
  return option?.duration ?? 60
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number | null): string {
  if (seconds === null) return 'Endless'
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) return `${minutes}m`
  return `${minutes}m ${remainingSeconds}s`
}
