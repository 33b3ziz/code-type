/**
 * Race History API
 * Functions for saving and fetching multiplayer race history
 */

import type { Difficulty, Language } from '@/db/schema'

export interface RaceHistoryEntry {
  id: string
  roomCode: string
  completedAt: Date
  position: number
  totalPlayers: number
  wpm: number
  accuracy: number
  finishTime: number // ms
  language?: Language | string
  difficulty?: Difficulty | string
  snippet?: {
    title?: string
    language?: string
    difficulty?: string
  }
  opponents: Array<{
    username: string
    position: number
    wpm: number
    accuracy: number
  }>
}

export interface RaceStats {
  totalRaces: number
  totalWins: number
  winRate: number
  averagePosition: number
  averageWpm: number
  averageAccuracy: number
  bestWpm: number
  bestPosition: number
}

const RACE_HISTORY_KEY = 'raceHistory'

/**
 * Save a race result to history
 */
export async function saveRaceResult(entry: Omit<RaceHistoryEntry, 'id'>): Promise<RaceHistoryEntry> {
  const saved: RaceHistoryEntry = {
    ...entry,
    id: `race_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  }

  if (typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem(RACE_HISTORY_KEY) || '[]')
    existing.push(saved)
    localStorage.setItem(RACE_HISTORY_KEY, JSON.stringify(existing))
  }

  return saved
}

/**
 * Get recent race history for a user
 */
export async function getRaceHistory(limit: number = 50): Promise<Array<RaceHistoryEntry>> {
  if (typeof window === 'undefined') return []

  const results: Array<RaceHistoryEntry> = JSON.parse(
    localStorage.getItem(RACE_HISTORY_KEY) || '[]'
  )

  return results
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, limit)
}

/**
 * Get race statistics
 */
export async function getRaceStats(): Promise<RaceStats> {
  if (typeof window === 'undefined') {
    return getEmptyRaceStats()
  }

  const history: Array<RaceHistoryEntry> = JSON.parse(
    localStorage.getItem(RACE_HISTORY_KEY) || '[]'
  )

  if (history.length === 0) {
    return getEmptyRaceStats()
  }

  const totalRaces = history.length
  const totalWins = history.filter((r) => r.position === 1).length
  const winRate = Math.round((totalWins / totalRaces) * 100)
  const averagePosition = Math.round(
    history.reduce((sum, r) => sum + r.position, 0) / totalRaces * 10
  ) / 10
  const averageWpm = Math.round(
    history.reduce((sum, r) => sum + r.wpm, 0) / totalRaces
  )
  const averageAccuracy = Math.round(
    history.reduce((sum, r) => sum + r.accuracy, 0) / totalRaces
  )
  const bestWpm = Math.max(...history.map((r) => r.wpm))
  const bestPosition = Math.min(...history.map((r) => r.position))

  return {
    totalRaces,
    totalWins,
    winRate,
    averagePosition,
    averageWpm,
    averageAccuracy,
    bestWpm,
    bestPosition,
  }
}

/**
 * Get a specific race by ID
 */
export async function getRaceById(id: string): Promise<RaceHistoryEntry | null> {
  if (typeof window === 'undefined') return null

  const history: Array<RaceHistoryEntry> = JSON.parse(
    localStorage.getItem(RACE_HISTORY_KEY) || '[]'
  )

  return history.find((r) => r.id === id) || null
}

/**
 * Clear all race history
 */
export async function clearRaceHistory(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(RACE_HISTORY_KEY)
  }
}

function getEmptyRaceStats(): RaceStats {
  return {
    totalRaces: 0,
    totalWins: 0,
    winRate: 0,
    averagePosition: 0,
    averageWpm: 0,
    averageAccuracy: 0,
    bestWpm: 0,
    bestPosition: 0,
  }
}

/**
 * Format race time for display
 */
export function formatRaceTime(ms: number): string {
  const seconds = ms / 1000
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(1)
  return mins > 0 ? `${mins}:${secs.padStart(4, '0')}` : `${secs}s`
}

/**
 * Format date for display
 */
export function formatRaceDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Get ordinal suffix for position
 */
export function getOrdinalPosition(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}
