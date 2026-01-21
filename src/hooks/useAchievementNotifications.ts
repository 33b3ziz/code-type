import { useState, useCallback, useMemo } from 'react'
import type { AchievementUnlock } from '@/components/AchievementNotification'
import { getAchievementBySlug, ACHIEVEMENTS } from '@/lib/achievements'

export interface UseAchievementNotificationsOptions {
  /** Duration in ms before auto-dismissing notifications (0 = never) */
  autoDismissDelay?: number
  /** Maximum number of notifications to show at once */
  maxVisible?: number
  /** Initial total points (for display purposes) */
  initialTotalPoints?: number
}

export interface UseAchievementNotificationsReturn {
  /** Current list of achievement unlock notifications */
  unlocks: Array<AchievementUnlock>
  /** Total achievement points accumulated */
  totalPoints: number
  /** Show a notification for a newly unlocked achievement */
  showAchievementUnlock: (achievementSlug: string, unlockedAt?: Date) => void
  /** Show notifications for multiple achievements at once */
  showMultipleUnlocks: (achievements: Array<{ slug: string; unlockedAt?: Date }>) => void
  /** Dismiss a specific notification */
  dismissNotification: (id: string) => void
  /** Clear all notifications */
  clearAll: () => void
  /** Check if an achievement would be newly unlocked based on test results */
  checkAndUnlockAchievements: (testResult: TestResultForAchievements) => Array<string>
  /** Set the total points (useful for syncing with server) */
  setTotalPoints: (points: number) => void
}

export interface TestResultForAchievements {
  wpm: number
  accuracy: number
  symbolAccuracy?: number
  backspaceCount: number
  // For tracking consecutive tests and totals
  totalTestsCompleted: number
  consecutiveHighAccuracyTests?: number
  testsCompletedToday?: number
  languageTestCounts?: Record<string, number>
}

// Track which achievements have been unlocked in current session to prevent duplicates
let sessionUnlockedAchievements = new Set<string>()

export function useAchievementNotifications(
  options: UseAchievementNotificationsOptions = {}
): UseAchievementNotificationsReturn {
  const {
    autoDismissDelay = 8000,
    maxVisible = 3,
    initialTotalPoints = 0,
  } = options

  const [unlocks, setUnlocks] = useState<Array<AchievementUnlock>>([])
  const [totalPoints, setTotalPoints] = useState(initialTotalPoints)

  const generateId = useCallback(() => {
    return `achievement-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }, [])

  const showAchievementUnlock = useCallback(
    (achievementSlug: string, unlockedAt?: Date) => {
      // Prevent duplicate notifications for same achievement in session
      if (sessionUnlockedAchievements.has(achievementSlug)) {
        return
      }

      const achievement = getAchievementBySlug(achievementSlug)
      if (!achievement) return

      sessionUnlockedAchievements.add(achievementSlug)

      const id = generateId()
      const newUnlock: AchievementUnlock = {
        id,
        achievementSlug,
        unlockedAt: unlockedAt ?? new Date(),
      }

      setUnlocks((prev) => {
        const updated = [...prev, newUnlock]
        // Limit visible notifications
        if (updated.length > maxVisible) {
          return updated.slice(-maxVisible)
        }
        return updated
      })

      // Update total points
      setTotalPoints((prev) => prev + achievement.points)

      // Auto-dismiss after delay
      if (autoDismissDelay > 0) {
        setTimeout(() => {
          setUnlocks((prev) => prev.filter((u) => u.id !== id))
        }, autoDismissDelay)
      }
    },
    [generateId, maxVisible, autoDismissDelay]
  )

  const showMultipleUnlocks = useCallback(
    (achievements: Array<{ slug: string; unlockedAt?: Date }>) => {
      achievements.forEach((achievement, index) => {
        // Stagger notifications slightly for visual effect
        setTimeout(() => {
          showAchievementUnlock(achievement.slug, achievement.unlockedAt)
        }, index * 300)
      })
    },
    [showAchievementUnlock]
  )

  const dismissNotification = useCallback((id: string) => {
    setUnlocks((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setUnlocks([])
  }, [])

  const checkAndUnlockAchievements = useCallback(
    (testResult: TestResultForAchievements): Array<string> => {
      const newlyUnlocked: Array<string> = []

      for (const achievement of ACHIEVEMENTS) {
        // Skip if already unlocked in session
        if (sessionUnlockedAchievements.has(achievement.slug)) {
          continue
        }

        let isUnlocked = false
        const criteria = achievement.criteria

        switch (criteria.type) {
          case 'speed':
            isUnlocked = testResult.wpm >= criteria.minWpm
            break

          case 'accuracy':
            if (criteria.consecutiveTests) {
              isUnlocked =
                (testResult.consecutiveHighAccuracyTests ?? 0) >=
                criteria.consecutiveTests
            } else {
              isUnlocked = testResult.accuracy >= criteria.minAccuracy
            }
            break

          case 'consistency':
            isUnlocked = testResult.totalTestsCompleted >= criteria.minTests
            break

          case 'special':
            switch (criteria.condition) {
              case 'first_test':
                isUnlocked = testResult.totalTestsCompleted === 1
                break
              case 'no_backspace':
                isUnlocked = testResult.backspaceCount === 0 && testResult.accuracy >= 90
                break
              case 'perfect_symbols':
                isUnlocked = (testResult.symbolAccuracy ?? 0) === 100
                break
              case 'streak':
                isUnlocked =
                  (testResult.testsCompletedToday ?? 0) >=
                  (criteria.value as number)
                break
              case 'language_mastery':
                const lang = criteria.value as string
                const langCount = testResult.languageTestCounts?.[lang] ?? 0
                isUnlocked = langCount >= 25 && testResult.accuracy >= 90
                break
            }
            break
        }

        if (isUnlocked) {
          newlyUnlocked.push(achievement.slug)
          showAchievementUnlock(achievement.slug)
        }
      }

      return newlyUnlocked
    },
    [showAchievementUnlock]
  )

  const setTotalPointsCallback = useCallback((points: number) => {
    setTotalPoints(points)
  }, [])

  return useMemo(
    () => ({
      unlocks,
      totalPoints,
      showAchievementUnlock,
      showMultipleUnlocks,
      dismissNotification,
      clearAll,
      checkAndUnlockAchievements,
      setTotalPoints: setTotalPointsCallback,
    }),
    [
      unlocks,
      totalPoints,
      showAchievementUnlock,
      showMultipleUnlocks,
      dismissNotification,
      clearAll,
      checkAndUnlockAchievements,
      setTotalPointsCallback,
    ]
  )
}

// Utility to reset session tracking (useful for testing or logout)
export function resetAchievementSession(): void {
  sessionUnlockedAchievements = new Set<string>()
}

// Utility to mark achievements as already unlocked (useful for loading user data)
export function markAchievementsAsUnlocked(slugs: Array<string>): void {
  slugs.forEach((slug) => sessionUnlockedAchievements.add(slug))
}

// Calculate total points from a list of achievement slugs
export function calculateTotalPoints(unlockedSlugs: Array<string>): number {
  return unlockedSlugs.reduce((total, slug) => {
    const achievement = getAchievementBySlug(slug)
    return total + (achievement?.points ?? 0)
  }, 0)
}
