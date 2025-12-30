import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { Difficulty } from '@/db/schema'

const DIFFICULTY_OPTIONS: {
  value: Difficulty
  label: string
  description: string
}[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'Simple code patterns, short snippets',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Moderate complexity, common patterns',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Complex logic, longer snippets',
  },
  {
    value: 'hardcore',
    label: 'Hardcore',
    description: 'Expert-level code, challenging patterns',
  },
]

interface DifficultySelectorProps {
  value: Difficulty
  onValueChange: (value: Difficulty) => void
  disabled?: boolean
  showLabel?: boolean
  className?: string
}

export function DifficultySelector({
  value,
  onValueChange,
  disabled = false,
  showLabel = true,
  className,
}: DifficultySelectorProps) {
  return (
    <div className={className}>
      {showLabel && (
        <Label htmlFor="difficulty-select" className="mb-2 block text-sm font-medium">
          Difficulty
        </Label>
      )}
      <Select
        value={value}
        onValueChange={(v) => onValueChange(v as Difficulty)}
        disabled={disabled}
      >
        <SelectTrigger id="difficulty-select" className="w-full min-w-[180px]">
          <SelectValue placeholder="Select difficulty" />
        </SelectTrigger>
        <SelectContent>
          {DIFFICULTY_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Export difficulty options for use elsewhere
export { DIFFICULTY_OPTIONS }
export type { Difficulty }
