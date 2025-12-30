/**
 * Recommendations API
 * AI-powered difficulty and practice recommendations based on user performance
 */

import type { Difficulty, Language, TestResult } from '@/db/schema'

export interface DifficultyRecommendation {
  recommended: Difficulty
  reason: string
  confidence: 'low' | 'medium' | 'high'
  alternatives: Array<{
    difficulty: Difficulty
    reason: string
  }>
}

export interface LanguageRecommendation {
  recommended: Language
  reason: string
  practiceOrder: Array<Language>
}

export interface PracticeRecommendation {
  difficulty: Difficulty
  language: Language
  focus: 'speed' | 'accuracy' | 'symbols' | 'keywords' | 'balanced'
  reason: string
  estimatedChallenge: 'easy' | 'appropriate' | 'challenging'
}

export interface PerformanceProfile {
  averageWpm: number
  averageAccuracy: number
  symbolAccuracy: number
  keywordAccuracy: number
  consistency: number // Standard deviation of WPM
  trend: 'improving' | 'stable' | 'declining'
  totalTests: number
}

/**
 * Get results from localStorage
 */
function getResults(userId: string): Array<TestResult> {
  if (typeof window === 'undefined') return []

  const results: Array<TestResult> = JSON.parse(
    localStorage.getItem('testResults') || '[]'
  )

  return results
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
}

/**
 * Calculate user's performance profile
 */
export function calculatePerformanceProfile(userId: string): PerformanceProfile | null {
  const results = getResults(userId)

  if (results.length < 3) return null

  const wpmValues = results.map((r) => r.wpm)
  const accuracyValues = results.map((r) => r.accuracy)

  const averageWpm = Math.round(wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length)
  const averageAccuracy = Math.round(
    accuracyValues.reduce((a, b) => a + b, 0) / accuracyValues.length
  )

  // Symbol accuracy (from results with this data)
  const symbolResults = results.filter((r) => r.symbolAccuracy !== null)
  const symbolAccuracy =
    symbolResults.length > 0
      ? Math.round(
          symbolResults.reduce((sum, r) => sum + (r.symbolAccuracy || 0), 0) /
            symbolResults.length
        )
      : averageAccuracy

  // Keyword accuracy
  const keywordResults = results.filter((r) => r.keywordAccuracy !== null)
  const keywordAccuracy =
    keywordResults.length > 0
      ? Math.round(
          keywordResults.reduce((sum, r) => sum + (r.keywordAccuracy || 0), 0) /
            keywordResults.length
        )
      : averageAccuracy

  // Calculate consistency (standard deviation of WPM)
  const variance =
    wpmValues.reduce((sum, val) => sum + Math.pow(val - averageWpm, 2), 0) / wpmValues.length
  const consistency = Math.round(Math.sqrt(variance))

  // Determine trend by comparing recent 5 tests to previous 5
  const recentWpm =
    results.length >= 5
      ? results.slice(0, 5).reduce((sum, r) => sum + r.wpm, 0) / 5
      : averageWpm
  const previousWpm =
    results.length >= 10
      ? results.slice(5, 10).reduce((sum, r) => sum + r.wpm, 0) / 5
      : averageWpm

  let trend: 'improving' | 'stable' | 'declining' = 'stable'
  if (recentWpm > previousWpm + 3) trend = 'improving'
  else if (recentWpm < previousWpm - 3) trend = 'declining'

  return {
    averageWpm,
    averageAccuracy,
    symbolAccuracy,
    keywordAccuracy,
    consistency,
    trend,
    totalTests: results.length,
  }
}

/**
 * Get difficulty recommendation based on performance
 */
export async function getDifficultyRecommendation(
  userId: string
): Promise<DifficultyRecommendation> {
  const profile = calculatePerformanceProfile(userId)

  if (!profile) {
    return {
      recommended: 'beginner',
      reason: 'Complete more tests to get personalized recommendations',
      confidence: 'low',
      alternatives: [
        { difficulty: 'intermediate', reason: 'Good starting point if comfortable with typing' },
      ],
    }
  }

  const { averageWpm, averageAccuracy, trend, totalTests } = profile

  // Decision matrix based on WPM and accuracy
  let recommended: Difficulty
  let reason: string
  let confidence: 'low' | 'medium' | 'high'

  if (averageAccuracy < 85) {
    // Low accuracy - recommend easier
    recommended = averageWpm < 30 ? 'beginner' : 'beginner'
    reason = 'Focus on accuracy before increasing difficulty'
    confidence = totalTests >= 10 ? 'high' : 'medium'
  } else if (averageAccuracy < 92) {
    // Moderate accuracy
    if (averageWpm < 40) {
      recommended = 'beginner'
      reason = 'Build speed and accuracy together at this level'
    } else if (averageWpm < 60) {
      recommended = 'intermediate'
      reason = 'Good balance of speed and accuracy for intermediate difficulty'
    } else {
      recommended = 'intermediate'
      reason = 'Strong speed, focus on maintaining accuracy'
    }
    confidence = totalTests >= 10 ? 'high' : 'medium'
  } else if (averageAccuracy < 97) {
    // Good accuracy
    if (averageWpm < 50) {
      recommended = 'intermediate'
      reason = 'High accuracy - ready for more challenge'
    } else if (averageWpm < 70) {
      recommended = 'advanced'
      reason = 'Strong performance - advanced difficulty will push your limits'
    } else {
      recommended = 'advanced'
      reason = 'Excellent performance - advanced is your sweet spot'
    }
    confidence = totalTests >= 10 ? 'high' : 'medium'
  } else {
    // Excellent accuracy (97%+)
    if (averageWpm < 60) {
      recommended = 'advanced'
      reason = 'Near-perfect accuracy - advanced difficulty is appropriate'
    } else if (averageWpm < 80) {
      recommended = 'hardcore'
      reason = 'Outstanding performance - challenge yourself with hardcore'
    } else {
      recommended = 'hardcore'
      reason = 'You are a typing master - hardcore is your playground'
    }
    confidence = totalTests >= 10 ? 'high' : 'medium'
  }

  // Adjust based on trend
  if (trend === 'declining' && recommended !== 'beginner') {
    const easier = getDifficulty(-1, recommended)
    return {
      recommended: easier,
      reason: `${reason}. Recent decline suggests stepping back temporarily.`,
      confidence,
      alternatives: [{ difficulty: recommended, reason: 'Original recommendation' }],
    }
  }

  // Generate alternatives
  const alternatives: Array<{ difficulty: Difficulty; reason: string }> = []
  const harder = getDifficulty(1, recommended)
  const easier = getDifficulty(-1, recommended)

  if (harder !== recommended) {
    alternatives.push({
      difficulty: harder,
      reason: trend === 'improving' ? 'Your improving trend suggests you can handle more' : 'For an extra challenge',
    })
  }
  if (easier !== recommended) {
    alternatives.push({
      difficulty: easier,
      reason: 'If you want to focus on perfecting accuracy',
    })
  }

  return { recommended, reason, confidence, alternatives }
}

/**
 * Get language recommendation
 */
export async function getLanguageRecommendation(
  userId: string
): Promise<LanguageRecommendation> {
  const results = getResults(userId)
  const languages: Array<Language> = ['javascript', 'typescript', 'python']

  // Calculate stats per language
  const langStats = new Map<Language, { avgWpm: number; avgAccuracy: number; count: number }>()

  for (const lang of languages) {
    // Simulate language distribution from snippetId
    const langResults = results.filter((r) => r.snippetId % 3 === languages.indexOf(lang))

    if (langResults.length > 0) {
      const avgWpm = Math.round(langResults.reduce((s, r) => s + r.wpm, 0) / langResults.length)
      const avgAccuracy = Math.round(
        langResults.reduce((s, r) => s + r.accuracy, 0) / langResults.length
      )
      langStats.set(lang, { avgWpm, avgAccuracy, count: langResults.length })
    } else {
      langStats.set(lang, { avgWpm: 0, avgAccuracy: 0, count: 0 })
    }
  }

  // Find weakest and strongest
  let weakest: Language = 'javascript'
  let weakestScore = Infinity

  for (const [lang, stats] of langStats) {
    const score = stats.avgWpm * (stats.avgAccuracy / 100)
    if (stats.count > 0 && score < weakestScore) {
      weakest = lang
      weakestScore = score
    }
  }

  // Find unpracticed
  const unpracticed = languages.filter((l) => (langStats.get(l)?.count || 0) === 0)

  let recommended: Language
  let reason: string

  if (unpracticed.length > 0) {
    recommended = unpracticed[0]
    reason = `Try ${getLanguageDisplayName(recommended)} - you haven't practiced it yet`
  } else {
    recommended = weakest
    const stats = langStats.get(weakest)!
    reason = `${getLanguageDisplayName(weakest)} needs the most work (${stats.avgWpm} WPM, ${stats.avgAccuracy}% accuracy)`
  }

  // Sort practice order by weakness
  const practiceOrder = [...languages].sort((a, b) => {
    const aStats = langStats.get(a)!
    const bStats = langStats.get(b)!
    const aScore = aStats.avgWpm * (aStats.avgAccuracy / 100) * Math.sqrt(aStats.count + 1)
    const bScore = bStats.avgWpm * (bStats.avgAccuracy / 100) * Math.sqrt(bStats.count + 1)
    return aScore - bScore // Weakest first
  })

  return { recommended, reason, practiceOrder }
}

/**
 * Get comprehensive practice recommendation
 */
export async function getPracticeRecommendation(
  userId: string
): Promise<PracticeRecommendation> {
  const profile = calculatePerformanceProfile(userId)
  const diffRec = await getDifficultyRecommendation(userId)
  const langRec = await getLanguageRecommendation(userId)

  // Determine focus area
  let focus: 'speed' | 'accuracy' | 'symbols' | 'keywords' | 'balanced'
  let reason: string

  if (!profile) {
    focus = 'balanced'
    reason = 'Practice all areas to establish your baseline'
  } else if (profile.symbolAccuracy < 80) {
    focus = 'symbols'
    reason = `Your symbol accuracy (${profile.symbolAccuracy}%) needs improvement`
  } else if (profile.keywordAccuracy < 85) {
    focus = 'keywords'
    reason = `Focus on keywords - current accuracy: ${profile.keywordAccuracy}%`
  } else if (profile.averageAccuracy < 90) {
    focus = 'accuracy'
    reason = 'Prioritize accuracy over speed for now'
  } else if (profile.averageWpm < 50) {
    focus = 'speed'
    reason = 'Good accuracy! Time to work on speed'
  } else {
    focus = 'balanced'
    reason = 'Well-rounded skills - maintain balance'
  }

  // Estimate challenge level
  let estimatedChallenge: 'easy' | 'appropriate' | 'challenging'
  if (!profile) {
    estimatedChallenge = 'appropriate'
  } else if (diffRec.recommended === 'beginner') {
    estimatedChallenge = profile.averageWpm > 40 ? 'easy' : 'appropriate'
  } else if (diffRec.recommended === 'hardcore') {
    estimatedChallenge = profile.averageAccuracy < 95 ? 'challenging' : 'appropriate'
  } else {
    estimatedChallenge = 'appropriate'
  }

  return {
    difficulty: diffRec.recommended,
    language: langRec.recommended,
    focus,
    reason,
    estimatedChallenge,
  }
}

// Helper functions
function getDifficulty(offset: number, current: Difficulty): Difficulty {
  const difficulties: Array<Difficulty> = ['beginner', 'intermediate', 'advanced', 'hardcore']
  const index = difficulties.indexOf(current)
  const newIndex = Math.max(0, Math.min(difficulties.length - 1, index + offset))
  return difficulties[newIndex]
}

function getLanguageDisplayName(language: Language): string {
  const names: Record<Language, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
  }
  return names[language]
}

/**
 * Get a motivational message based on performance
 */
export function getMotivationalMessage(profile: PerformanceProfile | null): string {
  if (!profile) {
    return 'Start your typing journey! Every expert was once a beginner.'
  }

  if (profile.trend === 'improving') {
    return "You're on fire! Keep up the great progress!"
  }

  if (profile.averageAccuracy >= 98) {
    return 'Incredible accuracy! You have surgeon-like precision.'
  }

  if (profile.averageWpm >= 80) {
    return 'Lightning fast! You type faster than 95% of developers.'
  }

  if (profile.totalTests >= 50) {
    return 'Dedication pays off! Your consistent practice is impressive.'
  }

  if (profile.averageWpm >= 60 && profile.averageAccuracy >= 95) {
    return 'Great balance of speed and accuracy!'
  }

  return 'Keep practicing! Every test makes you better.'
}
