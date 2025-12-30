import {
  Award,
  Ban,
  Crown,
  FileCode,
  FileCode2,
  FileType,
  Flame,
  Footprints,
  Hash,
  
  Medal,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Wand2,
  Zap
} from 'lucide-react'
import type {LucideIcon} from 'lucide-react';
import { cn } from '@/lib/utils'
import { ACHIEVEMENTS,  getAchievementBySlug } from '@/lib/achievements'

export interface AchievementBadgeProps {
  achievementSlug: string
  unlockedAt?: Date
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  showDescription?: boolean
  className?: string
}

const iconMap: Partial<Record<string, LucideIcon>> = {
  Trophy,
  Zap,
  Target,
  Star,
  Flame,
  Crown,
  Award,
  Medal,
  Shield,
  Rocket,
  Wand2,
  Footprints,
  Ban,
  Hash,
  FileCode,
  FileType,
  FileCode2,
  Sparkles,
  Bolt: Zap, // fallback
}

// Determine tier based on points
function getTier(points: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
  if (points >= 100) return 'platinum'
  if (points >= 50) return 'gold'
  if (points >= 25) return 'silver'
  return 'bronze'
}

const tierColors = {
  bronze: {
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/50',
    icon: 'text-amber-500',
    text: 'text-amber-400',
  },
  silver: {
    bg: 'bg-slate-400/20',
    border: 'border-slate-400/50',
    icon: 'text-slate-300',
    text: 'text-slate-300',
  },
  gold: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    icon: 'text-yellow-400',
    text: 'text-yellow-400',
  },
  platinum: {
    bg: 'bg-cyan-400/20',
    border: 'border-cyan-400/50',
    icon: 'text-cyan-300',
    text: 'text-cyan-300',
  },
}

const sizeClasses = {
  sm: {
    container: 'w-10 h-10',
    icon: 'w-5 h-5',
    name: 'text-xs',
    description: 'text-xs',
  },
  md: {
    container: 'w-14 h-14',
    icon: 'w-7 h-7',
    name: 'text-sm',
    description: 'text-xs',
  },
  lg: {
    container: 'w-20 h-20',
    icon: 'w-10 h-10',
    name: 'text-base',
    description: 'text-sm',
  },
}

export function AchievementBadge({
  achievementSlug,
  unlockedAt,
  size = 'md',
  showName = false,
  showDescription = false,
  className,
}: AchievementBadgeProps) {
  const achievement = getAchievementBySlug(achievementSlug)

  if (!achievement) {
    return null
  }

  const Icon = iconMap[achievement.iconName] || Trophy
  const tier = getTier(achievement.points)
  const colors = tierColors[tier]
  const sizes = sizeClasses[size]
  const isLocked = !unlockedAt

  return (
    <div
      className={cn('flex flex-col items-center gap-2', className)}
      title={isLocked ? `Locked: ${achievement.name}` : achievement.name}
    >
      <div
        className={cn(
          'rounded-full border-2 flex items-center justify-center transition-all',
          sizes.container,
          isLocked
            ? 'bg-slate-800/50 border-slate-700 opacity-50 grayscale'
            : cn(colors.bg, colors.border)
        )}
        role="img"
        aria-label={`${achievement.name} achievement${isLocked ? ' (locked)' : ''}`}
      >
        <Icon
          className={cn(
            sizes.icon,
            isLocked ? 'text-slate-600' : colors.icon
          )}
        />
      </div>

      {showName && (
        <p
          className={cn(
            'font-medium text-center',
            sizes.name,
            isLocked ? 'text-slate-500' : colors.text
          )}
        >
          {achievement.name}
        </p>
      )}

      {showDescription && (
        <p
          className={cn(
            'text-center text-gray-400 max-w-[150px]',
            sizes.description
          )}
        >
          {achievement.description}
        </p>
      )}

      {unlockedAt && (
        <p className="text-xs text-gray-500">
          Unlocked {formatDate(unlockedAt)}
        </p>
      )}
    </div>
  )
}

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

export interface AchievementGridProps {
  unlockedAchievements: Array<{
    slug: string
    unlockedAt?: Date
  }>
  showLocked?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AchievementGrid({
  unlockedAchievements,
  showLocked = true,
  size = 'md',
  className,
}: AchievementGridProps) {
  // Create a map of unlocked achievements
  const unlockedMap = new Map(
    unlockedAchievements.map((a) => [a.slug, a.unlockedAt])
  )

  // Filter based on showLocked
  const displayAchievements = showLocked
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter((a) => unlockedMap.has(a.slug))

  return (
    <div
      className={cn(
        'grid gap-4',
        size === 'sm' && 'grid-cols-6 md:grid-cols-8',
        size === 'md' && 'grid-cols-4 md:grid-cols-6',
        size === 'lg' && 'grid-cols-3 md:grid-cols-4',
        className
      )}
      role="list"
      aria-label="Achievements"
    >
      {displayAchievements.map((achievement) => (
        <div key={achievement.slug} role="listitem">
          <AchievementBadge
            achievementSlug={achievement.slug}
            unlockedAt={unlockedMap.get(achievement.slug)}
            size={size}
            showName
          />
        </div>
      ))}
    </div>
  )
}
