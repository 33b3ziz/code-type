import type { Language } from '@/db/schema'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const LANGUAGE_OPTIONS: Array<{
  value: Language | 'all'
  label: string
  description: string
  icon: string
}> = [
  {
    value: 'all',
    label: 'All Languages',
    description: 'Practice with any language',
    icon: '🌐',
  },
  {
    value: 'javascript',
    label: 'JavaScript',
    description: 'Web development essentials',
    icon: '🟨',
  },
  {
    value: 'typescript',
    label: 'TypeScript',
    description: 'Type-safe JavaScript',
    icon: '🔷',
  },
  {
    value: 'python',
    label: 'Python',
    description: 'Clean and readable syntax',
    icon: '🐍',
  },
]

interface LanguageSelectorProps {
  value: Language | 'all'
  onValueChange: (value: Language | 'all') => void
  disabled?: boolean
  showLabel?: boolean
  showAllOption?: boolean
  className?: string
}

export function LanguageSelector({
  value,
  onValueChange,
  disabled = false,
  showLabel = true,
  showAllOption = true,
  className,
}: LanguageSelectorProps) {
  const options = showAllOption
    ? LANGUAGE_OPTIONS
    : LANGUAGE_OPTIONS.filter((o) => o.value !== 'all')

  return (
    <div className={className}>
      {showLabel && (
        <Label
          htmlFor="language-select"
          className="mb-2 block text-sm font-medium"
        >
          Language
        </Label>
      )}
      <Select
        value={value}
        onValueChange={(v) => onValueChange(v as Language | 'all')}
        disabled={disabled}
      >
        <SelectTrigger id="language-select" className="w-full min-w-[180px]">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
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
    </div>
  )
}

export { LANGUAGE_OPTIONS }
