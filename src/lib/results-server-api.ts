/**
 * Test Results Server API
 * Server functions for saving and retrieving test results from the database
 */

import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'

import { db } from '@/db'
import { testResults, users } from '@/db/schema'

export interface SaveTestResultInput {
  userId: string
  snippetId: number
  wpm: number
  rawWpm: number
  accuracy: number
  charactersTyped: number
  correctCharacters: number
  incorrectCharacters: number
  backspaceCount: number
  duration: number
}

export interface TestResultResponse {
  id: number
  userId: string
  snippetId: number
  wpm: number
  rawWpm: number
  accuracy: number
  charactersTyped: number
  correctCharacters: number
  incorrectCharacters: number
  backspaceCount: number
  duration: number
  completedAt: Date
}

/**
 * Save a test result to the database
 */
export const saveTestResultFn = createServerFn({ method: 'POST' })
  .inputValidator((data: SaveTestResultInput) => data)
  .handler(async ({ data }): Promise<TestResultResponse> => {
    // Insert the test result
    const [result] = await db
      .insert(testResults)
      .values({
        userId: data.userId,
        snippetId: data.snippetId,
        wpm: data.wpm,
        rawWpm: data.rawWpm,
        accuracy: data.accuracy,
        charactersTyped: data.charactersTyped,
        correctCharacters: data.correctCharacters,
        incorrectCharacters: data.incorrectCharacters,
        backspaceCount: data.backspaceCount,
        duration: data.duration,
      })
      .returning()

    return {
      id: result.id,
      userId: result.userId,
      snippetId: result.snippetId,
      wpm: result.wpm,
      rawWpm: result.rawWpm ?? 0,
      accuracy: result.accuracy,
      charactersTyped: result.charactersTyped,
      correctCharacters: result.correctCharacters,
      incorrectCharacters: result.incorrectCharacters,
      backspaceCount: result.backspaceCount ?? 0,
      duration: result.duration,
      completedAt: result.completedAt,
    }
  })

/**
 * Get recent test results for a user
 */
export const getRecentResultsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string; limit?: number }) => data)
  .handler(async ({ data }): Promise<Array<TestResultResponse>> => {
    const results = await db
      .select()
      .from(testResults)
      .where(eq(testResults.userId, data.userId))
      .orderBy(desc(testResults.completedAt))
      .limit(data.limit || 10)

    return results.map((r) => ({
      id: r.id,
      userId: r.userId,
      snippetId: r.snippetId,
      wpm: r.wpm,
      rawWpm: r.rawWpm ?? 0,
      accuracy: r.accuracy,
      charactersTyped: r.charactersTyped,
      correctCharacters: r.correctCharacters,
      incorrectCharacters: r.incorrectCharacters,
      backspaceCount: r.backspaceCount ?? 0,
      duration: r.duration,
      completedAt: r.completedAt,
    }))
  })

/**
 * Get the current authenticated user (or create a demo user)
 */
export const getOrCreateDemoUserFn = createServerFn({ method: 'GET' })
  .handler(async (): Promise<{ id: string; username: string }> => {
    // Try to find existing demo user
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.username, 'DemoTypist'))
      .limit(1)

    if (existingUsers.length > 0) {
      return {
        id: existingUsers[0].id,
        username: existingUsers[0].username,
      }
    }

    // Create a demo user
    const [newUser] = await db
      .insert(users)
      .values({
        username: 'DemoTypist',
        email: 'demo@example.com',
        passwordHash: 'demo-hash-not-for-login',
      })
      .returning()

    return {
      id: newUser.id,
      username: newUser.username,
    }
  })
