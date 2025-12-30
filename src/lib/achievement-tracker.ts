import { and, count, desc, eq, sql } from 'drizzle-orm'
import {
  ACHIEVEMENTS,
  
  
  
  
  
  checkAccuracyAchievement,
  checkConsistencyAchievement,
  checkSpeedAchievement,
  getAchievementBySlug
} from './achievements'
import type { AchievementDefinition, SpecialCriteria} from './achievements';
import { db } from '@/db'
import { achievements, snippets, testResults, userAchievements } from '@/db/schema'

export interface UserAchievementRecord {
  id: number
  slug: string
  name: string
  description: string
  type: string
  points: number | null
  iconUrl: string | null
  unlockedAt: Date | null
}

export interface AchievementProgress {
  slug: string
  name: string
  description: string
  type: string
  points: number
  iconName: string
  isUnlocked: boolean
  unlockedAt: Date | null
  progress: number // 0-100 percentage
  progressText: string // e.g., "3/10 tests completed"
}

/**
 * Award an achievement to a user
 * Returns true if newly awarded, false if already had it
 */
export async function awardAchievement(
  userId: string,
  achievementSlug: string
): Promise<boolean> {
  // Check if achievement exists
  const definition = getAchievementBySlug(achievementSlug)
  if (!definition) {
    throw new Error(`Achievement not found: ${achievementSlug}`)
  }

  // Get or create achievement record in DB
  const achievementResults = await db
    .select({ id: achievements.id })
    .from(achievements)
    .where(eq(achievements.slug, achievementSlug))
    .limit(1)

  let achievement = achievementResults[0] as { id: number } | undefined
  if (!achievement) {
    // Create the achievement record
    const insertResults = await db
      .insert(achievements)
      .values({
        slug: definition.slug,
        name: definition.name,
        description: definition.description,
        type: definition.type,
        criteria: JSON.stringify(definition.criteria),
        points: definition.points,
        iconUrl: definition.iconName,
      })
      .returning({ id: achievements.id })
    achievement = insertResults[0]
  }

  // Check if user already has this achievement
  const existingResults = await db
    .select({ id: userAchievements.id })
    .from(userAchievements)
    .where(
      and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievement.id)
      )
    )
    .limit(1)

  if (existingResults[0]) {
    return false // Already awarded
  }

  // Award the achievement
  await db.insert(userAchievements).values({
    userId,
    achievementId: achievement.id,
  })

  return true
}

/**
 * Check if a user has a specific achievement
 */
export async function hasAchievement(
  userId: string,
  achievementSlug: string
): Promise<boolean> {
  const [result] = await db
    .select({ id: userAchievements.id })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(
      and(
        eq(userAchievements.userId, userId),
        eq(achievements.slug, achievementSlug)
      )
    )
    .limit(1)

  return !!result
}

/**
 * Get all achievements a user has earned
 */
export async function getUserAchievements(
  userId: string
): Promise<Array<UserAchievementRecord>> {
  const results = await db
    .select({
      id: userAchievements.id,
      slug: achievements.slug,
      name: achievements.name,
      description: achievements.description,
      type: achievements.type,
      points: achievements.points,
      iconUrl: achievements.iconUrl,
      unlockedAt: userAchievements.unlockedAt,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.unlockedAt))

  return results
}

/**
 * Get total achievement points for a user
 */
export async function getUserAchievementPoints(userId: string): Promise<number> {
  const results = await db
    .select({
      total: sql<number>`COALESCE(SUM(${achievements.points}), 0)`,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId))

  return Number(results[0]?.total ?? 0)
}

/**
 * Get user stats for achievement checking
 */
export async function getUserStats(userId: string) {
  // Total tests
  const testCountResults = await db
    .select({ count: count() })
    .from(testResults)
    .where(eq(testResults.userId, userId))

  // Tests today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayCountResults = await db
    .select({ count: count() })
    .from(testResults)
    .where(
      and(
        eq(testResults.userId, userId),
        sql`${testResults.completedAt} >= ${today}`
      )
    )

  // Consecutive high accuracy tests (95%+)
  const recentTests = await db
    .select({ accuracy: testResults.accuracy })
    .from(testResults)
    .where(eq(testResults.userId, userId))
    .orderBy(desc(testResults.completedAt))
    .limit(20)

  let consecutiveHighAccuracy = 0
  for (const test of recentTests) {
    if (Number(test.accuracy) >= 95) {
      consecutiveHighAccuracy++
    } else {
      break
    }
  }

  // Language-specific test counts with 90%+ accuracy
  const languageStats = await db
    .select({
      language: snippets.language,
      count: count(),
    })
    .from(testResults)
    .innerJoin(snippets, eq(testResults.snippetId, snippets.id))
    .where(
      and(
        eq(testResults.userId, userId),
        sql`${testResults.accuracy} >= 90`
      )
    )
    .groupBy(snippets.language)

  const languageCounts: Record<string, number> = {}
  for (const stat of languageStats) {
    languageCounts[stat.language] = stat.count
  }

  return {
    totalTests: testCountResults[0]?.count ?? 0,
    testsToday: todayCountResults[0]?.count ?? 0,
    consecutiveHighAccuracy,
    languageCounts,
  }
}

/**
 * Check and award achievements based on a test result
 */
export async function checkAndAwardAchievements(
  userId: string,
  testResult: {
    wpm: number
    accuracy: number
    usedBackspace: boolean
    symbolAccuracy?: number
    language: string
  }
): Promise<Array<string>> {
  const awarded: Array<string> = []
  const stats = await getUserStats(userId)

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already has this achievement
    if (await hasAchievement(userId, achievement.slug)) {
      continue
    }

    let shouldAward = false

    switch (achievement.criteria.type) {
      case 'speed':
        shouldAward = checkSpeedAchievement(
          achievement.criteria,
          testResult.wpm
        )
        break

      case 'accuracy':
        shouldAward = checkAccuracyAchievement(
          achievement.criteria,
          testResult.accuracy,
          stats.consecutiveHighAccuracy
        )
        break

      case 'consistency':
        shouldAward = checkConsistencyAchievement(
          achievement.criteria,
          stats.totalTests
        )
        break

      case 'special':
        shouldAward = checkSpecialAchievement(
          achievement.criteria,
          testResult,
          stats
        )
        break
    }

    if (shouldAward) {
      const wasNewlyAwarded = await awardAchievement(userId, achievement.slug)
      if (wasNewlyAwarded) {
        awarded.push(achievement.slug)
      }
    }
  }

  return awarded
}

/**
 * Check special achievement conditions
 */
function checkSpecialAchievement(
  criteria: SpecialCriteria,
  testResult: {
    wpm: number
    accuracy: number
    usedBackspace: boolean
    symbolAccuracy?: number
    language: string
  },
  stats: {
    totalTests: number
    testsToday: number
    languageCounts: Record<string, number>
  }
): boolean {
  switch (criteria.condition) {
    case 'first_test':
      return stats.totalTests === 1

    case 'no_backspace':
      return !testResult.usedBackspace && testResult.accuracy >= 80

    case 'perfect_symbols':
      return testResult.symbolAccuracy === 100

    case 'streak':
      return stats.testsToday >= (criteria.value as number)

    case 'language_mastery': {
      const language = criteria.value as string
      return (stats.languageCounts[language] ?? 0) >= 25
    }

    default:
      return false
  }
}

/**
 * Get achievement progress for all achievements
 */
export async function getAchievementProgress(
  userId: string
): Promise<Array<AchievementProgress>> {
  const userAchievementsList = await getUserAchievements(userId)
  const unlockedSlugs = new Set(userAchievementsList.map((a) => a.slug))
  const stats = await getUserStats(userId)

  return ACHIEVEMENTS.map((achievement) => {
    const isUnlocked = unlockedSlugs.has(achievement.slug)
    const unlockedRecord = userAchievementsList.find(
      (a) => a.slug === achievement.slug
    )

    const { progress, progressText } = calculateProgress(
      achievement,
      stats,
      isUnlocked
    )

    return {
      slug: achievement.slug,
      name: achievement.name,
      description: achievement.description,
      type: achievement.type,
      points: achievement.points,
      iconName: achievement.iconName,
      isUnlocked,
      unlockedAt: unlockedRecord?.unlockedAt ?? null,
      progress,
      progressText,
    }
  })
}

/**
 * Calculate progress towards an achievement
 */
function calculateProgress(
  achievement: AchievementDefinition,
  stats: {
    totalTests: number
    testsToday: number
    consecutiveHighAccuracy: number
    languageCounts: Record<string, number>
  },
  isUnlocked: boolean
): { progress: number; progressText: string } {
  if (isUnlocked) {
    return { progress: 100, progressText: 'Completed!' }
  }

  const criteria = achievement.criteria

  switch (criteria.type) {
    case 'consistency': {
      const c = criteria
      const progress = Math.min(100, (stats.totalTests / c.minTests) * 100)
      return {
        progress,
        progressText: `${stats.totalTests}/${c.minTests} tests`,
      }
    }

    case 'accuracy': {
      const c = criteria
      if (c.consecutiveTests) {
        const progress = Math.min(
          100,
          (stats.consecutiveHighAccuracy / c.consecutiveTests) * 100
        )
        return {
          progress,
          progressText: `${stats.consecutiveHighAccuracy}/${c.consecutiveTests} consecutive`,
        }
      }
      return { progress: 0, progressText: 'Complete a test with high accuracy' }
    }

    case 'special': {
      const c = criteria
      if (c.condition === 'streak') {
        const target = c.value as number
        const progress = Math.min(100, (stats.testsToday / target) * 100)
        return {
          progress,
          progressText: `${stats.testsToday}/${target} tests today`,
        }
      }
      if (c.condition === 'language_mastery') {
        const language = c.value as string
        const completed = stats.languageCounts[language] ?? 0
        const progress = Math.min(100, (completed / 25) * 100)
        return {
          progress,
          progressText: `${completed}/25 ${language} tests`,
        }
      }
      if (c.condition === 'first_test') {
        return { progress: 0, progressText: 'Complete your first test' }
      }
      return { progress: 0, progressText: 'Complete the special challenge' }
    }

    case 'speed':
      return { progress: 0, progressText: 'Achieve the target WPM' }

    default:
      return { progress: 0, progressText: '' }
  }
}
