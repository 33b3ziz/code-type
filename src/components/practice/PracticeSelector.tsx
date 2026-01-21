/**
 * Practice Selector Component
 * Allows users to select a practice mode and configure options
 * Features: difficulty indicators, estimated duration, completion tracking, favorites
 */

import { useState } from 'react'
import { Star, Clock, CheckCircle2, Zap, Target, Flame, Code2, Braces, AlertTriangle } from 'lucide-react'

import type { Difficulty, Language, PracticeMode } from '@/db/schema'
import { PRACTICE_MODES, type ModeDifficulty } from '@/lib/practice-modes'
import { cn } from '@/lib/utils'
import { usePracticeStore } from '@/stores/practice-store'

export interface PracticeSelectorProps {
  onSelect: (config: PracticeConfig) => void
  recommendedMode?: PracticeMode
  className?: string
}

export interface PracticeConfig {
  mode: PracticeMode
  language?: Language
  difficulty?: Difficulty
  duration: number
  targetCharacters?: Array<string>
}

const LANGUAGES: Array<{ value: Language; label: string }> = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
]

const DIFFICULTIES: Array<{ value: Difficulty; label: string }> = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'hardcore', label: 'Hardcore' },
]

const DURATIONS = [30, 60, 90, 120, 180]

// Icon mapping for practice modes
const MODE_ICONS: Record<PracticeMode, React.ReactNode> = {
  symbols: <Braces className="w-6 h-6" />,
  keywords: <Code2 className="w-6 h-6" />,
  'weak-spots': <AlertTriangle className="w-6 h-6" />,
  speed: <Zap className="w-6 h-6" />,
  accuracy: <Target className="w-6 h-6" />,
  'warm-up': <Flame className="w-6 h-6" />,
}

// Difficulty badge colors and labels
const DIFFICULTY_CONFIG: Record<ModeDifficulty, { color: string; label: string; bgColor: string }> = {
  beginner: {
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    label: 'Beginner',
  },
  intermediate: {
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    label: 'Intermediate',
  },
  advanced: {
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10 border-rose-500/30',
    label: 'Advanced',
  },
}

// Mode card color classes
const MODE_COLOR_CLASSES: Record<string, { text: string; border: string; bg: string; glow: string }> = {
  cyan: {
    text: 'text-cyan-400',
    border: 'border-cyan-500',
    bg: 'bg-cyan-500/10',
    glow: 'hover:shadow-cyan-500/20',
  },
  purple: {
    text: 'text-purple-400',
    border: 'border-purple-500',
    bg: 'bg-purple-500/10',
    glow: 'hover:shadow-purple-500/20',
  },
  red: {
    text: 'text-red-400',
    border: 'border-red-500',
    bg: 'bg-red-500/10',
    glow: 'hover:shadow-red-500/20',
  },
  green: {
    text: 'text-green-400',
    border: 'border-green-500',
    bg: 'bg-green-500/10',
    glow: 'hover:shadow-green-500/20',
  },
  yellow: {
    text: 'text-yellow-400',
    border: 'border-yellow-500',
    bg: 'bg-yellow-500/10',
    glow: 'hover:shadow-yellow-500/20',
  },
  orange: {
    text: 'text-orange-400',
    border: 'border-orange-500',
    bg: 'bg-orange-500/10',
    glow: 'hover:shadow-orange-500/20',
  },
}

export function PracticeSelector({
  onSelect,
  recommendedMode,
  className = '',
}: PracticeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<PracticeMode | null>(null)
  const [language, setLanguage] = useState<Language>('javascript')
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate')
  const [duration, setDuration] = useState<number>(60)

  // Practice store for tracking
  const {
    favoriteModes,
    completedModes,
    toggleFavorite,
    setLastPlayed,
  } = usePracticeStore()

  const modeConfig = selectedMode ? PRACTICE_MODES[selectedMode] : null

  const handleStart = () => {
    if (!selectedMode) return

    // Track last played
    setLastPlayed(selectedMode)

    onSelect({
      mode: selectedMode,
      language: modeConfig?.requiresLanguage ? language : undefined,
      difficulty: modeConfig?.requiresDifficulty ? difficulty : undefined,
      duration,
    })
  }

  const handleFavoriteClick = (e: React.MouseEvent, mode: PracticeMode) => {
    e.stopPropagation()
    toggleFavorite(mode)
  }

  // Sort modes: favorites first, then by completion count
  const sortedModes = Object.values(PRACTICE_MODES).sort((a, b) => {
    const aFav = favoriteModes.includes(a.id) ? 1 : 0
    const bFav = favoriteModes.includes(b.id) ? 1 : 0
    if (aFav !== bFav) return bFav - aFav
    return (completedModes[b.id] ?? 0) - (completedModes[a.id] ?? 0)
  })

  return (
    <div className={cn('practice-selector', className)} data-testid="practice-selector">
      {/* Mode Selection Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-2">Select Practice Mode</h2>
        <p className="text-gray-400 text-sm mb-6">Choose a practice mode to improve your coding typing skills</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedModes.map((mode) => {
            const colorClasses = MODE_COLOR_CLASSES[mode.color] || MODE_COLOR_CLASSES.cyan
            const diffConfig = DIFFICULTY_CONFIG[mode.difficulty]
            const isFavorite = favoriteModes.includes(mode.id)
            const completionCount = completedModes[mode.id] ?? 0
            const isSelected = selectedMode === mode.id
            const isRecommended = recommendedMode === mode.id

            return (
              <button
                key={mode.id}
                onClick={() => {
                  setSelectedMode(mode.id)
                  setDuration(mode.defaultDuration)
                }}
                data-testid={`practice-mode-${mode.id}`}
                className={cn(
                  'relative p-5 rounded-xl border-2 transition-all text-left group',
                  'hover:shadow-lg hover:scale-[1.02]',
                  colorClasses.glow,
                  isSelected
                    ? cn(colorClasses.border, colorClasses.bg)
                    : 'border-slate-700 bg-slate-900/80 hover:border-slate-600',
                  isRecommended && !isSelected && 'ring-2 ring-yellow-500/50 ring-offset-2 ring-offset-slate-900'
                )}
                aria-pressed={isSelected}
              >
                {/* Top row: Icon, Favorite, Recommended */}
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    'p-2.5 rounded-lg',
                    isSelected ? colorClasses.bg : 'bg-slate-800',
                    colorClasses.text
                  )}>
                    {MODE_ICONS[mode.id]}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Recommended badge */}
                    {isRecommended && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-medium">
                        Recommended
                      </span>
                    )}

                    {/* Favorite button */}
                    <button
                      onClick={(e) => handleFavoriteClick(e, mode.id)}
                      className={cn(
                        'p-1.5 rounded-full transition-colors',
                        isFavorite
                          ? 'text-yellow-400 bg-yellow-500/20'
                          : 'text-gray-500 hover:text-yellow-400 hover:bg-slate-800'
                      )}
                      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      data-testid={`favorite-${mode.id}`}
                    >
                      <Star className={cn('w-4 h-4', isFavorite && 'fill-current')} />
                    </button>
                  </div>
                </div>

                {/* Mode name and short description */}
                <h3 className="font-semibold text-white mb-1 text-lg">{mode.name}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{mode.description}</p>

                {/* Bottom row: Difficulty, Duration, Completions */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Difficulty badge */}
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full border font-medium',
                    diffConfig.bgColor,
                    diffConfig.color
                  )} data-testid={`difficulty-${mode.id}`}>
                    {diffConfig.label}
                  </span>

                  {/* Duration */}
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {mode.estimatedDuration}
                  </span>

                  {/* Completion count */}
                  {completionCount > 0 && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400" data-testid={`completions-${mode.id}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {completionCount}x
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Configuration Options */}
      {selectedMode && modeConfig && (
        <div className="space-y-6 p-6 bg-slate-900 rounded-xl border border-slate-700" data-testid="practice-config">
          <h3 className="text-lg font-semibold text-white">Configure {modeConfig.name}</h3>

          {/* Language Selection */}
          {modeConfig.requiresLanguage && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Programming Language
              </label>
              <div className="flex gap-2 flex-wrap">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setLanguage(lang.value)}
                    data-testid={`language-${lang.value}`}
                    className={cn(
                      'px-4 py-2 rounded-lg border transition-colors',
                      language === lang.value
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                        : 'border-slate-600 text-gray-400 hover:border-slate-500'
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty Selection */}
          {modeConfig.requiresDifficulty && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Difficulty Level
              </label>
              <div className="flex gap-2 flex-wrap">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff.value}
                    onClick={() => setDifficulty(diff.value)}
                    data-testid={`difficulty-option-${diff.value}`}
                    className={cn(
                      'px-4 py-2 rounded-lg border transition-colors',
                      difficulty === diff.value
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                        : 'border-slate-600 text-gray-400 hover:border-slate-500'
                    )}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Duration
            </label>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  data-testid={`duration-${d}`}
                  className={cn(
                    'px-4 py-2 rounded-lg border transition-colors',
                    duration === d
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                      : 'border-slate-600 text-gray-400 hover:border-slate-500'
                  )}
                >
                  {d >= 60 ? `${d / 60}min` : `${d}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            data-testid="start-practice-button"
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
          >
            Start Practice
          </button>
        </div>
      )}
    </div>
  )
}

export default PracticeSelector
