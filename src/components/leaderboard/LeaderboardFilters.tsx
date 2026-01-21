import { Filter, ArrowUpDown, Clock, Code2, Gauge } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Difficulty, Language } from '@/db/schema'
import type {
  SortBy,
  SortOrder,
  TimeFrame,
} from '@/lib/leaderboard-server-api'

export interface LeaderboardFiltersProps {
  timeFrame: TimeFrame
  language?: Language
  difficulty?: Difficulty
  sortBy: SortBy
  sortOrder: SortOrder
  onTimeFrameChange: (value: TimeFrame) => void
  onLanguageChange: (value: Language | undefined) => void
  onDifficultyChange: (value: Difficulty | undefined) => void
  onSortByChange: (value: SortBy) => void
  onSortOrderChange: (value: SortOrder) => void
  showLanguageFilter?: boolean
  showDifficultyFilter?: boolean
  className?: string
}

const timeFrameOptions: Array<{ value: TimeFrame; label: string }> = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'alltime', label: 'All Time' },
]

const languageOptions: Array<{ value: Language | 'all'; label: string }> = [
  { value: 'all', label: 'All Languages' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
]

const difficultyOptions: Array<{ value: Difficulty | 'all'; label: string }> = [
  { value: 'all', label: 'All Difficulties' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'hardcore', label: 'Hardcore' },
]

const sortByOptions: Array<{ value: SortBy; label: string; icon: React.ReactNode }> = [
  { value: 'wpm', label: 'Speed (WPM)', icon: <Gauge className="w-4 h-4" /> },
  { value: 'accuracy', label: 'Accuracy', icon: <ArrowUpDown className="w-4 h-4" /> },
  { value: 'consistency', label: 'Consistency', icon: <ArrowUpDown className="w-4 h-4" /> },
]

const sortOrderOptions: Array<{ value: SortOrder; label: string }> = [
  { value: 'desc', label: 'Best First' },
  { value: 'asc', label: 'Worst First' },
]

export function LeaderboardFilters({
  timeFrame,
  language,
  difficulty,
  sortBy,
  sortOrder,
  onTimeFrameChange,
  onLanguageChange,
  onDifficultyChange,
  onSortByChange,
  onSortOrderChange,
  showLanguageFilter = true,
  showDifficultyFilter = true,
  className = '',
}: LeaderboardFiltersProps) {
  const handleLanguageChange = (value: string) => {
    onLanguageChange(value === 'all' ? undefined : (value as Language))
  }

  const handleDifficultyChange = (value: string) => {
    onDifficultyChange(value === 'all' ? undefined : (value as Difficulty))
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-3 ${className}`}
      data-testid="leaderboard-filters"
    >
      {/* Time Frame Filter */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" />
        <Select value={timeFrame} onValueChange={onTimeFrameChange}>
          <SelectTrigger
            className="w-36 bg-slate-800 border-slate-700 text-white"
            data-testid="timeframe-filter"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeFrameOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Language Filter */}
      {showLanguageFilter && (
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-gray-400" />
          <Select
            value={language ?? 'all'}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger
              className="w-40 bg-slate-800 border-slate-700 text-white"
              data-testid="language-filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Difficulty Filter */}
      {showDifficultyFilter && (
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select
            value={difficulty ?? 'all'}
            onValueChange={handleDifficultyChange}
          >
            <SelectTrigger
              className="w-40 bg-slate-800 border-slate-700 text-white"
              data-testid="difficulty-filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficultyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sort By */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-sm text-gray-400">Sort by:</span>
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger
            className="w-36 bg-slate-800 border-slate-700 text-white"
            data-testid="sortby-filter"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortByOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select value={sortOrder} onValueChange={onSortOrderChange}>
          <SelectTrigger
            className="w-32 bg-slate-800 border-slate-700 text-white"
            data-testid="sortorder-filter"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOrderOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default LeaderboardFilters
