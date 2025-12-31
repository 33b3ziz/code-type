/**
 * Practice Session API
 * Functions for saving and retrieving practice session data
 */

import { and, desc, eq, gte, sql } from 'drizzle-orm'

import { createServerFn } from '@tanstack/react-start'

import type { Difficulty, Language, NewPracticeSession, PracticeMode } from '@/db/schema'
import { db } from '@/db'
import { practiceSessions } from '@/db/schema'

export interface SavePracticeSessionInput {
  userId: string
  mode: PracticeMode
  language?: Language
  difficulty?: Difficulty
  targetCharacters?: Array<string>
  duration: number
  charactersTyped: number
  correctCharacters: number
  accuracy: number
  wpm: number
}

export interface PracticeSessionResponse {
  id: number
  mode: PracticeMode
  language: Language | null
  difficulty: Difficulty | null
  duration: number
  accuracy: number
  wpm: number
  completedAt: Date
}

export interface PracticeStats {
  totalSessions: number
  totalTimeSeconds: number
  averageAccuracy: number
  averageWpm: number
  sessionsByMode: Record<PracticeMode, number>
}

// Save a practice session
export const savePracticeSessionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: SavePracticeSessionInput) => data)
  .handler(async ({ data }): Promise<PracticeSessionResponse> => {
    const session: NewPracticeSession = {
      userId: data.userId,
      mode: data.mode,
      language: data.language || null,
      difficulty: data.difficulty || null,
      targetCharacters: data.targetCharacters ? JSON.stringify(data.targetCharacters) : null,
      duration: data.duration,
      charactersTyped: data.charactersTyped,
      correctCharacters: data.correctCharacters,
      accuracy: data.accuracy,
      wpm: data.wpm,
    }

    const [inserted] = await db.insert(practiceSessions).values(session).returning()

    return {
      id: inserted.id,
      mode: inserted.mode,
      language: inserted.language,
      difficulty: inserted.difficulty,
      duration: inserted.duration,
      accuracy: inserted.accuracy,
      wpm: inserted.wpm,
      completedAt: inserted.completedAt,
    }
  })

// Get practice sessions for a user
export const getPracticeSessionsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string; limit?: number; mode?: PracticeMode }) => data)
  .handler(async ({ data }): Promise<Array<PracticeSessionResponse>> => {
    const conditions = [eq(practiceSessions.userId, data.userId)]

    if (data.mode) {
      conditions.push(eq(practiceSessions.mode, data.mode))
    }

    const sessions = await db
      .select({
        id: practiceSessions.id,
        mode: practiceSessions.mode,
        language: practiceSessions.language,
        difficulty: practiceSessions.difficulty,
        duration: practiceSessions.duration,
        accuracy: practiceSessions.accuracy,
        wpm: practiceSessions.wpm,
        completedAt: practiceSessions.completedAt,
      })
      .from(practiceSessions)
      .where(and(...conditions))
      .orderBy(desc(practiceSessions.completedAt))
      .limit(data.limit || 20)

    return sessions
  })

// Get practice statistics for a user
export const getPracticeStatsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string; days?: number }) => data)
  .handler(async ({ data }): Promise<PracticeStats> => {
    const conditions = [eq(practiceSessions.userId, data.userId)]

    // Filter by date if specified
    if (data.days) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - data.days)
      conditions.push(gte(practiceSessions.completedAt, startDate))
    }

    // Get aggregate stats
    const [stats] = await db
      .select({
        totalSessions: sql<number>`count(*)::int`,
        totalTimeSeconds: sql<number>`coalesce(sum(${practiceSessions.duration}), 0)::int`,
        averageAccuracy: sql<number>`coalesce(avg(${practiceSessions.accuracy}), 0)::float`,
        averageWpm: sql<number>`coalesce(avg(${practiceSessions.wpm}), 0)::float`,
      })
      .from(practiceSessions)
      .where(and(...conditions))

    // Get sessions by mode
    const modeCounts = await db
      .select({
        mode: practiceSessions.mode,
        count: sql<number>`count(*)::int`,
      })
      .from(practiceSessions)
      .where(and(...conditions))
      .groupBy(practiceSessions.mode)

    const sessionsByMode: Record<PracticeMode, number> = {
      symbols: 0,
      keywords: 0,
      'weak-spots': 0,
      speed: 0,
      accuracy: 0,
      'warm-up': 0,
    }

    modeCounts.forEach(({ mode, count }) => {
      sessionsByMode[mode] = count
    })

    return {
      totalSessions: stats.totalSessions,
      totalTimeSeconds: stats.totalTimeSeconds,
      averageAccuracy: Math.round(stats.averageAccuracy * 10) / 10,
      averageWpm: Math.round(stats.averageWpm * 10) / 10,
      sessionsByMode,
    }
  })

// Get best session for a mode
export const getBestPracticeSessionFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string; mode: PracticeMode }) => data)
  .handler(async ({ data }): Promise<PracticeSessionResponse | null> => {
    const results = await db
      .select({
        id: practiceSessions.id,
        mode: practiceSessions.mode,
        language: practiceSessions.language,
        difficulty: practiceSessions.difficulty,
        duration: practiceSessions.duration,
        accuracy: practiceSessions.accuracy,
        wpm: practiceSessions.wpm,
        completedAt: practiceSessions.completedAt,
      })
      .from(practiceSessions)
      .where(
        and(
          eq(practiceSessions.userId, data.userId),
          eq(practiceSessions.mode, data.mode)
        )
      )
      .orderBy(desc(practiceSessions.wpm), desc(practiceSessions.accuracy))
      .limit(1)

    return results[0] ?? null
  })
