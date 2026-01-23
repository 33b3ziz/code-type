import { useEffect, useState, useCallback } from 'react'
import { X, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AchievementBadge } from './AchievementBadge'
import { getAchievementBySlug, type AchievementDefinition } from '@/lib/achievements'

export interface AchievementUnlock {
  id: string
  achievementSlug: string
  unlockedAt: Date
}

export interface AchievementNotificationProps {
  unlock: AchievementUnlock
  onDismiss: () => void
  totalPoints?: number
  newPoints?: number
}

// Determine tier based on points for glow colors
function getTierGlow(points: number): string {
  if (points >= 100) return 'shadow-[0_0_30px_rgba(34,211,238,0.6)]' // cyan/platinum
  if (points >= 50) return 'shadow-[0_0_30px_rgba(234,179,8,0.6)]' // yellow/gold
  if (points >= 25) return 'shadow-[0_0_30px_rgba(148,163,184,0.6)]' // slate/silver
  return 'shadow-[0_0_30px_rgba(217,119,6,0.5)]' // amber/bronze
}

export function AchievementNotification({
  unlock,
  onDismiss,
  totalPoints,
  newPoints,
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const achievement = getAchievementBySlug(unlock.achievementSlug)

  useEffect(() => {
    // Trigger entrance animation
    const enterTimer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(enterTimer)
  }, [])

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss()
    }, 300)
  }, [onDismiss])

  if (!achievement) return null

  const tierGlow = getTierGlow(achievement.points)

  return (
    <div
      className={cn(
        'pointer-events-auto relative overflow-hidden rounded-xl border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20 p-4 backdrop-blur-md transition-all duration-300',
        tierGlow,
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      )}
      role="alert"
      aria-live="assertive"
      data-testid="achievement-notification"
    >
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'absolute w-3 h-3 text-yellow-400/60 animate-[float_3s_ease-in-out_infinite]',
              i % 2 === 0 ? 'text-yellow-300' : 'text-amber-400'
            )}
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-start gap-4">
        {/* Animated Achievement Badge */}
        <div className="relative flex-shrink-0">
          <div className="animate-[achievement-badge-pop_0.5s_ease-out_forwards] origin-center">
            <div className="animate-[achievement-glow-pulse_2s_ease-in-out_infinite]">
              <AchievementBadge
                achievementSlug={unlock.achievementSlug}
                unlockedAt={unlock.unlockedAt}
                size="lg"
              />
            </div>
          </div>
          {/* Ring animation around badge */}
          <div className="absolute inset-0 -m-2 animate-[achievement-ring_1.5s_ease-out_forwards] rounded-full border-2 border-yellow-400/0" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400 animate-pulse">
              Achievement Unlocked!
            </span>
          </div>
          <h3 className="text-lg font-bold text-white truncate animate-[slide-up_0.4s_ease-out_forwards]">
            {achievement.name}
          </h3>
          <p className="text-sm text-gray-300 mt-1 line-clamp-2 animate-[slide-up_0.4s_ease-out_0.1s_forwards] opacity-0">
            {achievement.description}
          </p>

          {/* Points display */}
          <div className="flex items-center gap-3 mt-3 animate-[slide-up_0.4s_ease-out_0.2s_forwards] opacity-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">
                +{newPoints ?? achievement.points} pts
              </span>
            </div>
            {totalPoints !== undefined && (
              <span className="text-xs text-gray-400">
                Total: {totalPoints} pts
              </span>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Dismiss achievement notification"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// Container component for multiple achievement notifications
export interface AchievementNotificationContainerProps {
  unlocks: Array<AchievementUnlock>
  onDismiss: (id: string) => void
  totalPoints?: number
}

export function AchievementNotificationContainer({
  unlocks,
  onDismiss,
  totalPoints,
}: AchievementNotificationContainerProps) {
  // Calculate cumulative points for each notification
  const [displayPoints, setDisplayPoints] = useState(totalPoints ?? 0)

  useEffect(() => {
    if (totalPoints !== undefined) {
      setDisplayPoints(totalPoints)
    }
  }, [totalPoints])

  if (unlocks.length === 0) return null

  return (
    <div
      className="fixed top-4 right-4 z-[60] flex flex-col gap-3 max-w-md w-full pointer-events-none"
      role="region"
      aria-label="Achievement notifications"
      aria-live="polite"
    >
      {unlocks.map((unlock, index) => {
        const achievement = getAchievementBySlug(unlock.achievementSlug)
        const points = achievement?.points ?? 0

        return (
          <div
            key={unlock.id}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <AchievementNotification
              unlock={unlock}
              onDismiss={() => onDismiss(unlock.id)}
              newPoints={points}
              totalPoints={displayPoints}
            />
          </div>
        )
      })}
    </div>
  )
}
